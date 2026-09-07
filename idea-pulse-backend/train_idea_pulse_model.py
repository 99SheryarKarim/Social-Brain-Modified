# =============================================================================
#  IDEA PULSE AI — Custom LLM Fine-Tuning Script
#  Base Model : TinyLlama/TinyLlama-1.1B-Chat-v1.0
#  Method     : QLoRA (4-bit quantization + LoRA adapters)
#  Platform   : Google Colab (T4 Free GPU)
#
#  HOW TO RUN:
#  1. Open https://colab.research.google.com
#  2. Runtime -> Change runtime type -> GPU -> T4
#  3. Upload idea_pulse_dataset.json to the Colab files panel (left bar)
#  4. Copy-paste this entire script into a single cell and run it
#     OR upload this .py file and run: !python train_idea_pulse_model.py
#  5. After training, adapter files are saved to idea-pulse-custom-llm/
#     and optionally copied to your Google Drive.
# =============================================================================


# -----------------------------------------------------------------------------
# STEP 1 -- Install Dependencies
# -----------------------------------------------------------------------------
import subprocess, sys

def pip_install(*packages):
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", *packages])

print("Installing dependencies...")
pip_install(
    "transformers==4.44.2",
    "datasets==2.20.0",
    "peft==0.12.0",
    "trl==0.9.6",
    "accelerate==0.33.0",
    "bitsandbytes==0.43.3",
    "scipy",          # required by bitsandbytes on some Colab images
    "sentencepiece",  # TinyLlama tokenizer
)
print("Dependencies installed.\n")


# -----------------------------------------------------------------------------
# STEP 2 -- Imports
# -----------------------------------------------------------------------------
import os, json, torch
from datasets import Dataset
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    BitsAndBytesConfig,
    TrainingArguments,
)
from peft import LoraConfig, get_peft_model, TaskType, prepare_model_for_kbit_training
from trl import SFTTrainer

print(f"GPU available: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"   GPU name : {torch.cuda.get_device_name(0)}")
    print(f"   VRAM     : {round(torch.cuda.get_device_properties(0).total_memory / 1e9, 1)} GB\n")


# -----------------------------------------------------------------------------
# STEP 3 -- Configuration (tweak here if needed)
# -----------------------------------------------------------------------------
BASE_MODEL      = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
DATASET_FILE    = "idea_pulse_dataset.json"   # must be uploaded to Colab
OUTPUT_DIR      = "idea-pulse-custom-llm"     # where LoRA adapter files are saved
DRIVE_SAVE_PATH = "/content/drive/MyDrive/IdeaPulse/idea-pulse-custom-llm"  # optional

MAX_SEQ_LENGTH   = 512   # keep low to fit T4 VRAM
NUM_EPOCHS       = 3
BATCH_SIZE       = 2     # per-device; gradient accumulation brings effective batch to 8
GRAD_ACCUM_STEPS = 4
LEARNING_RATE    = 2e-4
WARMUP_RATIO     = 0.05
LOGGING_STEPS    = 5

# LoRA hyperparameters
LORA_R              = 16
LORA_ALPHA          = 32
LORA_DROPOUT        = 0.05
LORA_TARGET_MODULES = ["q_proj", "v_proj", "k_proj", "o_proj"]


# -----------------------------------------------------------------------------
# STEP 4 -- Load and format the dataset
# -----------------------------------------------------------------------------
print("Loading dataset...")

if not os.path.exists(DATASET_FILE):
    raise FileNotFoundError(
        f"'{DATASET_FILE}' not found!\n"
        "Please upload idea_pulse_dataset.json to the Colab file panel first."
    )

with open(DATASET_FILE, "r", encoding="utf-8") as f:
    raw_data = json.load(f)

print(f"   Found {len(raw_data)} training samples.\n")

# Alpaca-style prompt template — the model learns this exact format
PROMPT_TEMPLATE = """### Instruction:
{instruction}

### Input:
{input}

### Response:
{output}"""

def format_sample(sample):
    """Convert a dataset row into the single text field SFTTrainer expects."""
    return {
        "text": PROMPT_TEMPLATE.format(
            instruction=sample["instruction"].strip(),
            input=sample["input"].strip(),
            output=sample["output"].strip(),
        )
    }

formatted = [format_sample(s) for s in raw_data]
dataset   = Dataset.from_list(formatted)

print("Dataset formatted. Example prompt:\n")
print("-" * 60)
print(dataset[0]["text"][:600], "...")
print("-" * 60, "\n")


# -----------------------------------------------------------------------------
# STEP 5 -- Load tokenizer
# -----------------------------------------------------------------------------
print("Loading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL, trust_remote_code=True)

# TinyLlama doesn't set pad_token by default — reuse eos_token
if tokenizer.pad_token is None:
    tokenizer.pad_token    = tokenizer.eos_token
    tokenizer.pad_token_id = tokenizer.eos_token_id

tokenizer.padding_side = "right"  # required for Causal LM training
print(f"Tokenizer loaded. Vocab size: {tokenizer.vocab_size}\n")


# -----------------------------------------------------------------------------
# STEP 6 -- Load base model in 4-bit precision (QLoRA)
# -----------------------------------------------------------------------------
print("Loading base model in 4-bit precision (QLoRA)...")

bnb_config = BitsAndBytesConfig(
    load_in_4bit              = True,
    bnb_4bit_use_double_quant = True,    # double quant saves extra VRAM
    bnb_4bit_quant_type       = "nf4",   # NF4 is optimal for LLM weights
    bnb_4bit_compute_dtype    = torch.bfloat16,
)

model = AutoModelForCausalLM.from_pretrained(
    BASE_MODEL,
    quantization_config = bnb_config,
    device_map          = "auto",        # auto-place on GPU
    trust_remote_code   = True,
)

# Required before applying LoRA to a quantized model
model = prepare_model_for_kbit_training(model)
model.config.use_cache = False           # disable KV-cache during training

print("Base model loaded.\n")


# -----------------------------------------------------------------------------
# STEP 7 -- Configure LoRA adapters
# -----------------------------------------------------------------------------
print("Applying LoRA configuration...")

lora_config = LoraConfig(
    r               = LORA_R,
    lora_alpha      = LORA_ALPHA,
    lora_dropout    = LORA_DROPOUT,
    bias            = "none",
    task_type       = TaskType.CAUSAL_LM,
    target_modules  = LORA_TARGET_MODULES,
)

model = get_peft_model(model, lora_config)
model.print_trainable_parameters()  # shows how many params are trained
print()


# -----------------------------------------------------------------------------
# STEP 8 -- Training arguments
# -----------------------------------------------------------------------------
training_args = TrainingArguments(
    output_dir                  = OUTPUT_DIR,
    num_train_epochs            = NUM_EPOCHS,
    per_device_train_batch_size = BATCH_SIZE,
    gradient_accumulation_steps = GRAD_ACCUM_STEPS,   # effective batch = 2*4 = 8
    learning_rate               = LEARNING_RATE,
    warmup_ratio                = WARMUP_RATIO,
    lr_scheduler_type           = "cosine",
    fp16                        = not torch.cuda.is_bf16_supported(),
    bf16                        = torch.cuda.is_bf16_supported(),
    logging_steps               = LOGGING_STEPS,
    save_strategy               = "epoch",
    save_total_limit            = 1,                   # keep only last checkpoint
    optim                       = "paged_adamw_8bit",  # memory-efficient optimizer
    report_to                   = "none",              # disable wandb / tensorboard
    dataloader_pin_memory       = False,
)


# -----------------------------------------------------------------------------
# STEP 9 -- SFTTrainer (Supervised Fine-Tuning)
# -----------------------------------------------------------------------------
print("Initializing SFTTrainer...")

trainer = SFTTrainer(
    model              = model,
    tokenizer          = tokenizer,
    train_dataset      = dataset,
    dataset_text_field = "text",        # column SFTTrainer reads
    max_seq_length     = MAX_SEQ_LENGTH,
    args               = training_args,
    peft_config        = lora_config,
)

print("Trainer ready.\n")
print("=" * 60)
print("Starting training -- this will take ~10-20 min on T4 GPU")
print("=" * 60)

trainer.train()

print("\nTraining complete!\n")


# -----------------------------------------------------------------------------
# STEP 10 -- Save LoRA adapter files
# -----------------------------------------------------------------------------
print(f"Saving LoRA adapter to '{OUTPUT_DIR}'...")
trainer.model.save_pretrained(OUTPUT_DIR)
tokenizer.save_pretrained(OUTPUT_DIR)

saved_files = os.listdir(OUTPUT_DIR)
print(f"   Saved files: {saved_files}\n")


# -----------------------------------------------------------------------------
# STEP 11 -- (Optional) Save to Google Drive
# -----------------------------------------------------------------------------
SAVE_TO_DRIVE = True   # set False if you don't want to mount Drive

if SAVE_TO_DRIVE:
    try:
        from google.colab import drive
        print("Mounting Google Drive...")
        drive.mount("/content/drive")

        import shutil
        os.makedirs(DRIVE_SAVE_PATH, exist_ok=True)
        shutil.copytree(OUTPUT_DIR, DRIVE_SAVE_PATH, dirs_exist_ok=True)
        print(f"Adapter files copied to Google Drive:\n   {DRIVE_SAVE_PATH}\n")
    except ImportError:
        print("Not running in Google Colab -- skipping Drive mount.\n")
    except Exception as e:
        print(f"Could not save to Drive: {e}\n")


# -----------------------------------------------------------------------------
# STEP 12 -- Quick inference test (verify the model actually works)
# -----------------------------------------------------------------------------
print("=" * 60)
print("Running quick inference test on the fine-tuned model...")
print("=" * 60)

from peft import PeftModel

# Reload in inference mode (fresh model + adapter)
test_model = AutoModelForCausalLM.from_pretrained(
    BASE_MODEL,
    quantization_config = bnb_config,
    device_map          = "auto",
    trust_remote_code   = True,
)
test_model = PeftModel.from_pretrained(test_model, OUTPUT_DIR)
test_model.eval()

TEST_PROMPT = PROMPT_TEMPLATE.format(
    instruction=(
        "You are Idea Pulse AI, a social media engine. "
        "Given a topic, tone, and target niche, generate a complete post, "
        "relevant hashtags, and image search keywords."
    ),
    input="Topic: AI in Education, Tone: Motivational, Niche: EdTech",
    output="",   # blank — the model will complete this
)

inputs = tokenizer(TEST_PROMPT, return_tensors="pt").to("cuda")

with torch.no_grad():
    output_ids = test_model.generate(
        **inputs,
        max_new_tokens     = 300,
        temperature        = 0.7,
        top_p              = 0.9,
        do_sample          = True,
        repetition_penalty = 1.1,
        eos_token_id       = tokenizer.eos_token_id,
        pad_token_id       = tokenizer.pad_token_id,
    )

generated     = tokenizer.decode(output_ids[0], skip_special_tokens=True)
response_only = generated[len(TEST_PROMPT):].strip()

print("\nModel Output:")
print("-" * 60)
print(response_only)
print("-" * 60)


# -----------------------------------------------------------------------------
# STEP 13 -- Final summary
# -----------------------------------------------------------------------------
print("""
==============================================================
              IDEA PULSE AI MODEL TRAINED!
==============================================================
  Base model  : TinyLlama/TinyLlama-1.1B-Chat-v1.0
  LoRA rank   : r=16, alpha=32
  Epochs      : 3
  Output dir  : idea-pulse-custom-llm/

  WHAT IS IN THE OUTPUT FOLDER:
  - adapter_config.json         LoRA configuration
  - adapter_model.safetensors   trained LoRA weights (small!)
  - tokenizer_config.json       tokenizer settings
  - tokenizer.model             tokenizer vocabulary

  NEXT STEPS:
  1. Download idea-pulse-custom-llm/ from Colab
     OR grab it from Google Drive -> IdeaPulse folder
  2. Place it in: idea-pulse-backend/models/idea-pulse-llm/
  3. We will wire it into the model dropdown in the app
==============================================================
""")
