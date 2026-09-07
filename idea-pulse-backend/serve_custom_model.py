"""
serve_custom_model.py
=====================
Local Flask sidecar that loads the fine-tuned TinyLlama LoRA adapter
and exposes it as an HTTP API consumed by customModelService.js.

REQUIREMENTS (install once):
    pip install flask transformers peft accelerate bitsandbytes torch sentencepiece

USAGE:
    # 1. Place your trained adapter folder at:
    #       idea-pulse-backend/models/idea-pulse-llm/
    #
    # 2. Run this sidecar from the backend root:
    #       cd idea-pulse-backend
    #       python serve_custom_model.py
    #
    # 3. The sidecar starts on http://localhost:5050
    #    Node.js backend auto-detects it and routes "ideapulse-custom" requests here.
    #
    # NOTE: First cold start takes 20-60 sec while the model loads into RAM/VRAM.
"""

import os, sys, time, logging
from pathlib import Path

from flask import Flask, request, jsonify
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig

# --- Configuration -------------------------------------------------------------

BASE_MODEL    = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
ADAPTER_DIR   = Path(__file__).parent / "models" / "idea-pulse-llm"
PORT          = int(os.environ.get("CUSTOM_MODEL_PORT", 5050))
MAX_NEW_TOKENS = 350
TEMPERATURE    = 0.75
TOP_P          = 0.9
REPETITION_PENALTY = 1.15

# --- Logging -------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="[CustomModel] %(asctime)s %(levelname)s %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("custom-model")

# --- App -----------------------------------------------------------------------

app = Flask(__name__)

# Model references (loaded lazily on first request or at startup)
_tokenizer = None
_model     = None
_device    = None
_ready     = False

# --- Model loading -------------------------------------------------------------

def load_model():
    global _tokenizer, _model, _device, _ready

    if _ready:
        return

    log.info("Loading tokenizer from base model: %s", BASE_MODEL)
    _tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL, trust_remote_code=True)
    if _tokenizer.pad_token is None:
        _tokenizer.pad_token    = _tokenizer.eos_token
        _tokenizer.pad_token_id = _tokenizer.eos_token_id
    _tokenizer.padding_side = "right"

    use_gpu = torch.cuda.is_available()
    _device = "cuda" if use_gpu else "cpu"
    log.info("Device: %s", _device.upper())

    if use_gpu:
        # 4-bit quantized loading on GPU
        bnb_config = BitsAndBytesConfig(
            load_in_4bit              = True,
            bnb_4bit_use_double_quant = True,
            bnb_4bit_quant_type       = "nf4",
            bnb_4bit_compute_dtype    = torch.bfloat16,
        )
        _model = AutoModelForCausalLM.from_pretrained(
            BASE_MODEL,
            quantization_config = bnb_config,
            device_map          = "auto",
            trust_remote_code   = True,
        )
    else:
        # CPU fallback - slower but works without GPU
        log.warning("No GPU detected - running on CPU (inference will be slow ~60-120s per request)")
        _model = AutoModelForCausalLM.from_pretrained(
            BASE_MODEL,
            device_map          = "cpu",
            torch_dtype         = torch.float32,
            trust_remote_code   = True,
            low_cpu_mem_usage   = True,
        )

    # Load LoRA adapter if the folder exists
    if ADAPTER_DIR.exists():
        log.info("Loading LoRA adapter from: %s", ADAPTER_DIR)
        try:
            from peft import PeftModel
            _model = PeftModel.from_pretrained(_model, str(ADAPTER_DIR))
            log.info("LoRA adapter loaded successfully")
        except Exception as e:
            log.warning("Could not load LoRA adapter (%s) - using bare base model", e)
    else:
        log.warning(
            "Adapter folder not found at %s - using base TinyLlama without fine-tuning.\n"
            "Place your trained 'idea-pulse-custom-llm' folder there and restart.",
            ADAPTER_DIR,
        )

    _model.eval()
    _ready = True
    log.info("Model ready on %s", _device.upper())


# --- Endpoints -----------------------------------------------------------------

@app.get("/health")
def health():
    """Health check - Node.js backend calls this to verify sidecar is alive."""
    return jsonify({
        "status"      : "ok",
        "model_ready" : _ready,
        "adapter_dir" : str(ADAPTER_DIR),
        "adapter_exists": ADAPTER_DIR.exists(),
        "device"      : _device or "not-loaded",
    })


@app.post("/generate")
def generate():
    """
    Generate text from a prompt.

    Request body  : { "prompt": "<full alpaca-style prompt>" }
    Response body : { "generated_text": "<model output only>", "latency_ms": <int> }
    """
    data = request.get_json(force=True, silent=True) or {}
    prompt = (data.get("prompt") or "").strip()

    if not prompt:
        return jsonify({"error": "prompt is required"}), 400

    if not _ready:
        return jsonify({"error": "Model not loaded yet - try again in a few seconds"}), 503

    t0 = time.time()
    try:
        inputs = _tokenizer(
            prompt,
            return_tensors      = "pt",
            truncation          = True,
            max_length          = 512,
            padding             = False,
        ).to(_device)

        with torch.no_grad():
            output_ids = _model.generate(
                **inputs,
                max_new_tokens     = MAX_NEW_TOKENS,
                temperature        = TEMPERATURE,
                top_p              = TOP_P,
                do_sample          = True,
                repetition_penalty = REPETITION_PENALTY,
                eos_token_id       = _tokenizer.eos_token_id,
                pad_token_id       = _tokenizer.pad_token_id,
            )

        # Decode only the newly generated tokens (strip the prompt prefix)
        new_tokens    = output_ids[0][inputs["input_ids"].shape[-1]:]
        generated_text = _tokenizer.decode(new_tokens, skip_special_tokens=True).strip()

        latency_ms = int((time.time() - t0) * 1000)
        log.info("Generated %d tokens in %dms", len(new_tokens), latency_ms)

        return jsonify({
            "generated_text" : generated_text,
            "latency_ms"     : latency_ms,
        })

    except Exception as e:
        log.exception("Generation error")
        return jsonify({"error": str(e)}), 500


# --- Startup -------------------------------------------------------------------

if __name__ == "__main__":
    log.info("=" * 60)
    log.info("  Idea Pulse AI - Custom Model Sidecar")
    log.info("  Port       : %d", PORT)
    log.info("  Adapter    : %s", ADAPTER_DIR)
    log.info("=" * 60)

    # Load model at startup (not lazily) so the first inference request is fast
    try:
        load_model()
    except Exception as e:
        log.error("Failed to load model: %s", e)
        log.error("Sidecar will start but /generate will return 503 until fixed.")

    app.run(host="0.0.0.0", port=PORT, debug=False, threaded=False)
