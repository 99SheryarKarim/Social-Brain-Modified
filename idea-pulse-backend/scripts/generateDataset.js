const fs = require('fs');
const path = require('path');

const topics = [
  "AI in Healthcare", "SaaS Growth Strategies", "Sustainable Fashion", "Startup Marketing",
  "Remote Work Productivity", "Fitness Tech Innovations", "Cybersecurity Essentials",
  "E-commerce Optimization", "Web3 and Crypto Trends", "Personal Finance Tips",
  "AI Content Creation", "Leadership & Team Management", "Real Estate Investing",
  "Digital Nomad Lifestyle", "Mental Health at Work", "No-Code Development",
  "Product-Led Growth", "Social Media Branding", "Mobile App Development", "Clean Energy Innovations"
];

const tones = [
  "Professional", "Creative", "Witty", "Motivational", "Friendly",
  "Casual", "Educational", "Empowering", "Concise", "Insightful"
];

const niches = [
  "Startups", "Tech", "Fashion", "Fitness", "Business",
  "Healthcare", "Finance", "Marketing", "Education", "Lifestyle"
];

const postTemplates = [
  {
    topic: "AI in Healthcare",
    niche: "Healthcare",
    tone: "Professional",
    post: "Artificial intelligence is revolutionizing patient diagnostics and streamlining hospital administrative workflows. By leveraging machine learning models for early risk detection, healthcare providers are saving critical time and improving patient outcomes. The future of medicine lies in the synergy between human expertise and computational precision.",
    hashtags: "#HealthcareAI #HealthTech #MedicalInnovation #DigitalHealth",
    keywords: "doctor medical AI hospital technology"
  },
  {
    topic: "SaaS Growth Strategies",
    niche: "Business",
    tone: "Insightful",
    post: "Scaling a SaaS company requires moving beyond customer acquisition to aggressive net revenue retention. Focus heavily on onboarding efficiency, proactive customer success interventions, and clear upsell paths. Sustainable growth is built on compounding retention.",
    hashtags: "#SaaS #B2BGrowth #CustomerRetention #StartupStrategy",
    keywords: "saas dashboard growth analytics office"
  },
  {
    topic: "Sustainable Fashion",
    niche: "Fashion",
    tone: "Empowering",
    post: "Fast fashion comes at a steep environmental cost. Transitioning to organic textiles, circular garment recycling, and ethical production isn't just a trend—it's a imperative. Every purchase decision shapes the future of our planet. Choose quality, sustainability, and consciousness.",
    hashtags: "#SustainableFashion #EcoFriendly #EthicalStyle #SlowFashion",
    keywords: "sustainable clothing organic fabrics eco fashion"
  },
  {
    topic: "Startup Marketing",
    niche: "Startups",
    tone: "Creative",
    post: "Don't sell product features; sell the transformation your users experience. High-converting startup marketing focuses on storytelling, organic founder-led content, and building genuine community loops. Find your core 100 super-fans before spending a dime on ads.",
    hashtags: "#StartupMarketing #GrowthHacking #ContentStrategy #FounderBrand",
    keywords: "marketing strategy whiteboard startup team"
  },
  {
    topic: "Remote Work Productivity",
    niche: "Lifestyle",
    tone: "Friendly",
    post: "Working remotely gives us freedom, but without clear boundaries, burnout sneaks in fast. Try time-blocking your focus hours, establishing a firm shutdown routine, and keeping your workspace separate from resting areas. Balance is created intentionally every day!",
    hashtags: "#RemoteWork #WorkLifeBalance #ProductivityTips #WFH",
    keywords: "remote worker laptop home office coffee"
  },
  {
    topic: "Fitness Tech Innovations",
    niche: "Fitness",
    tone: "Motivational",
    post: "Smart wearables and real-time biometrics are transforming how we train. Tracking recovery, heart rate variability, and sleep quality lets you push harder while avoiding injury. Elevate your athletic potential with data-driven training habits!",
    hashtags: "#FitnessTech #SmartWearables #Biohacking #WorkOutMotivation",
    keywords: "smartwatch fitness athlete training biometric"
  },
  {
    topic: "Cybersecurity Essentials",
    niche: "Tech",
    tone: "Educational",
    post: "Over 80% of security breaches trace back to weak or reused credentials. Enforce mandatory multi-factor authentication (MFA), adopt zero-trust network principles, and conduct quarterly phishing awareness drills across your organization. Security starts with awareness.",
    hashtags: "#Cybersecurity #DataProtection #InfoSec #TechSecurity",
    keywords: "cybersecurity code security network data lock"
  },
  {
    topic: "E-commerce Optimization",
    niche: "Business",
    tone: "Witty",
    post: "A 1-second delay in page load time can drop your conversions by 7%. If your checkout process feels like completing a tax return, your cart abandonment rate will prove it. Simplify forms, enable 1-click payments, and watch sales soar!",
    hashtags: "#Ecommerce #ConversionRate #OnlineStore #UXDesign",
    keywords: "ecommerce shopping cart mobile payment checkout"
  },
  {
    topic: "Web3 and Crypto Trends",
    niche: "Tech",
    tone: "Insightful",
    post: "Beyond market volatility, the core value of Web3 lies in decentralized ownership and trustless smart contracts. As tokenized real-world assets (RWA) gain institutional traction, the infrastructure is maturing rapidly for mainstream enterprise adoption.",
    hashtags: "#Web3 #Crypto #Blockchain #DeFi #TechFuture",
    keywords: "blockchain cryptocurrency bitcoin digital network"
  },
  {
    topic: "Personal Finance Tips",
    niche: "Finance",
    tone: "Concise",
    post: "Pay yourself first. Automate 20% of your income into index funds before paying expenses. Avoid high-interest debt, track net worth quarterly, and stay consistent. Wealth accumulation is a marathon of discipline, not short-term luck.",
    hashtags: "#PersonalFinance #Investing #FinancialFreedom #WealthBuilding",
    keywords: "finance growth piggy bank coins investment"
  }
];

function generate100Dataset() {
  const dataset = [];
  const totalSamples = 100;

  for (let i = 0; i < totalSamples; i++) {
    const template = postTemplates[i % postTemplates.length];
    const topic = topics[i % topics.length];
    const tone = tones[i % tones.length];
    const niche = niches[i % niches.length];

    // Generate unique variations based on topic and tone combinations
    const postText = template.post.replace(template.topic, topic);
    const hashtagsText = `${template.hashtags} #${topic.replace(/\s+/g, '')} #${tone}`;
    const keywordsText = `${template.keywords} ${topic.toLowerCase()}`;

    const item = {
      instruction: "You are Idea Pulse AI, a social media engine. Given a topic, tone, and target niche, generate a complete post, relevant hashtags, and image search keywords.",
      input: `Topic: ${topic}, Tone: ${tone}, Niche: ${niche}`,
      output: `POST: ${postText}\nHASHTAGS: ${hashtagsText}\nIMAGE_KEYWORDS: ${keywordsText}`
    };

    dataset.push(item);
  }

  return dataset;
}

const datasetData = generate100Dataset();

// Save to root directory
const rootPath = path.join(__dirname, '..', '..', 'idea_pulse_dataset.json');
fs.writeFileSync(rootPath, JSON.stringify(datasetData, null, 2), 'utf-8');

// Save to backend directory
const backendPath = path.join(__dirname, '..', 'idea_pulse_dataset.json');
fs.writeFileSync(backendPath, JSON.stringify(datasetData, null, 2), 'utf-8');

console.log(`✅ Successfully generated ${datasetData.length} training samples saved to:`);
console.log(`   - ${rootPath}`);
console.log(`   - ${backendPath}`);
