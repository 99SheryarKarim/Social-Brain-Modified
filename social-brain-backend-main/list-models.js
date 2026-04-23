require("dotenv").config();
const https = require("https");

async function listModels() {
  const apiKey = process.env.GOOGLE_API_KEY;
  
  console.log("\n========================================");
  console.log("📋 CHECKING AVAILABLE MODELS");
  console.log("========================================\n");

  return new Promise((resolve, reject) => {
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
    
    https.get(url, (res) => {
      let data = "";
      
      res.on("data", (chunk) => {
        data += chunk;
      });
      
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          
          if (json.models && json.models.length > 0) {
            console.log("✅ Available Models:\n");
            
            json.models.forEach((model, index) => {
              const modelName = model.name.replace("models/", "");
              console.log(`${index + 1}. ${modelName}`);
              if (model.displayName) console.log(`   Name: ${model.displayName}`);
              console.log("");
            });
            
            console.log("========================================");
            console.log("💡 Try these model names in geminiService.js:");
            console.log("========================================\n");
            
            // Find models that work with generateContent
            const flashModels = json.models.filter(m => m.name.includes("flash"));
            const proModels = json.models.filter(m => m.name.includes("pro"));
            
            if (flashModels.length > 0) {
              console.log("Flash Models (Fast & Cheap):");
              flashModels.forEach(m => console.log(`  • ${m.name.replace("models/", "")}`));
              console.log("");
            }
            
            if (proModels.length > 0) {
              console.log("Pro Models (More Powerful):");
              proModels.forEach(m => console.log(`  • ${m.name.replace("models/", "")}`));
              console.log("");
            }
            
          } else {
            console.log("❌ No models found in response");
          }
          
          resolve();
        } catch (err) {
          console.error("❌ Error parsing response:", err.message);
          console.log("\nRaw response:", data);
          reject(err);
        }
      });
    }).on("error", (err) => {
      console.error("❌ Network error:", err.message);
      reject(err);
    });
  });
}

listModels().catch(() => process.exit(1));
