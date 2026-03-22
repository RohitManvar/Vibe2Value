import { writeFileSync } from "fs";

const categories = ["tech", "food", "fitness", "gaming", "lifestyle", "music", "travel", "education", "fashion", "sports"];
const platforms = ["instagram", "tiktok", "youtube", "twitter"];
const regions = ["US", "UK", "IN", "BR", "DE", "FR", "AU", "CA", "SG", "JP"];

const tagPool = {
  tech: ["AI", "coding", "gadgets", "software", "startups", "cybersecurity", "web3", "cloud"],
  food: ["recipes", "cooking", "vegan", "streetfood", "baking", "nutrition", "foodie", "chef"],
  fitness: ["workout", "gym", "yoga", "running", "weightloss", "crossfit", "nutrition", "mindfulness"],
  gaming: ["esports", "streaming", "rpg", "fps", "retro", "indie", "minecraft", "reviews"],
  lifestyle: ["wellness", "productivity", "minimalism", "travel", "fashion", "selfcare", "motivation"],
  music: ["hiphop", "pop", "producer", "guitar", "edm", "indie", "covers", "songwriting"],
  travel: ["adventure", "backpacking", "luxury", "solo", "photography", "digitalnomad", "roadtrip"],
  education: ["science", "history", "math", "languages", "philosophy", "coding", "finance", "psychology"],
  fashion: ["streetwear", "luxury", "sustainable", "ootd", "vintage", "menswear", "beauty", "trends"],
  sports: ["football", "basketball", "cricket", "tennis", "mma", "athletics", "highlights", "analysis"],
};

const contentTemplates = {
  tech: [
    "Breaking down the latest AI breakthroughs and what they mean for developers",
    "My honest review of the new MacBook Pro — is it worth the upgrade?",
    "How I built a SaaS in 30 days using Next.js and Supabase",
    "The future of web development: what every engineer needs to know in 2025",
    "Cybersecurity tips every developer should follow to protect their apps",
    "Top 10 VS Code extensions that 10x my productivity",
    "How machine learning is transforming content recommendations",
    "Building scalable microservices: lessons from production",
  ],
  food: [
    "5-minute healthy breakfast ideas that actually taste amazing",
    "Street food tour of Bangkok — every dish ranked",
    "How to make authentic Italian pasta from scratch",
    "The best plant-based protein sources for athletes",
    "Restaurant-quality steak at home — complete guide",
    "Meal prep Sunday: 7 days of healthy lunches in 2 hours",
    "The science behind fermentation and why it's healthy",
    "Traditional recipes from my grandmother's kitchen",
  ],
  fitness: [
    "30-day transformation: what I learned pushing my limits",
    "The ultimate home workout — no equipment needed",
    "How I lost 20kg without giving up the foods I love",
    "Science-backed recovery techniques for serious athletes",
    "Morning routine that changed my energy levels completely",
    "Building muscle after 40: what actually works",
    "My marathon training plan for complete beginners",
    "Yoga for flexibility — 15 minutes every day",
  ],
  gaming: [
    "Every Elden Ring boss ranked from easiest to hardest",
    "I played the most hyped indie game of 2025 — here's my take",
    "Pro tips for climbing ranked in competitive shooters",
    "The most underrated RPGs you've never heard of",
    "Why retro gaming is making a massive comeback",
    "Building the ultimate budget gaming PC in 2025",
    "Behind the scenes: how game studios design difficulty",
    "Minecraft redstone engineering masterclass",
  ],
  lifestyle: [
    "How I redesigned my morning routine for peak productivity",
    "Minimalism changed my life — here's how to start",
    "Digital detox: what happened when I quit social media for 30 days",
    "Building better habits with the 2-minute rule",
    "How to create a life you actually love — practical steps",
    "My self-care routine that costs under $20 a month",
    "Work-life balance is a myth — here's what to aim for instead",
    "Finding purpose in your 20s: honest advice",
  ],
  music: [
    "How I wrote a viral song in 48 hours using only my phone",
    "Guitar theory explained simply for complete beginners",
    "Behind the beat: producing lo-fi hip hop from scratch",
    "The psychology of why certain songs go viral",
    "My honest review of every DAW I've tried",
    "From bedroom producer to 1M streams — my journey",
    "Music theory crash course: everything you need in 20 minutes",
    "Covering popular songs on jazz piano",
  ],
  travel: [
    "Solo travel across Southeast Asia on $30 a day",
    "Hidden gems in Europe no tourist ever visits",
    "Everything you need to know about becoming a digital nomad",
    "The most underrated destinations in South America",
    "Luxury travel hacks using credit card points",
    "Road trip across New Zealand — complete guide",
    "Travelling with anxiety: how I learned to embrace it",
    "Best photography spots in Japan — complete guide",
  ],
  education: [
    "The Feynman technique: learn anything faster than ever",
    "History of the Roman Empire explained in 10 minutes",
    "How compound interest actually works — visual explanation",
    "Learning Spanish in 6 months: what actually worked",
    "The philosophy of Stoicism and how it applies today",
    "Statistics explained without the maths jargon",
    "Why you should learn Python even if you're not a developer",
    "Critical thinking skills nobody teaches you in school",
  ],
  fashion: [
    "Building a minimalist wardrobe with 30 items",
    "Sustainable fashion brands that are actually affordable",
    "How to dress well on a $50/month budget",
    "The history of streetwear and how it took over fashion",
    "Thrifting guide — finding designer pieces for pennies",
    "Outfit of the day: transitional looks for every season",
    "Men's style fundamentals every guy needs to know",
    "How luxury brands engineer desire",
  ],
  sports: [
    "Tactical breakdown of the Champions League final",
    "How NBA teams use analytics to win championships",
    "Cricket's greatest batting performances ranked",
    "MMA technique breakdown: guard passing fundamentals",
    "The science of athletic performance optimization",
    "Top 10 sporting moments that defined a generation",
    "How to get scouted — advice from pro athletes",
    "Tennis serve mechanics — complete coaching breakdown",
  ],
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(4));
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomTags(category, count = 3) {
  const pool = tagPool[category];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function randomDate(daysBack = 365) {
  const d = new Date();
  d.setDate(d.getDate() - randomInt(0, daysBack));
  return d.toISOString();
}

function generateCreator(index) {
  const category = randomFrom(categories);
  const platform = randomFrom(platforms);
  const isHighPerformer = Math.random() < 0.3;
  const isZeroGMV = Math.random() < 0.1; // 10% zero-GMV creators for constraint testing

  const followers = isZeroGMV ? randomInt(100, 1000) : isHighPerformer ? randomInt(500000, 5000000) : randomInt(5000, 200000);
  const views = isZeroGMV ? randomInt(50, 500) : isHighPerformer ? randomInt(100000, 2000000) : randomInt(1000, 100000);
  const likes = isZeroGMV ? randomInt(0, 10) : isHighPerformer ? randomInt(10000, 500000) : randomInt(100, 10000);
  const shares = isZeroGMV ? randomInt(0, 5) : isHighPerformer ? randomInt(1000, 50000) : randomInt(10, 2000);
  const comments = isZeroGMV ? randomInt(0, 5) : isHighPerformer ? randomInt(500, 20000) : randomInt(10, 1000);
  const engagement_rate = isZeroGMV ? randomFloat(0, 0.001) : isHighPerformer ? randomFloat(0.05, 0.15) : randomFloat(0.01, 0.06);

  const contents = contentTemplates[category];
  const content = randomFrom(contents);

  const firstNames = ["Alex", "Jordan", "Sam", "Taylor", "Morgan", "Casey", "Riley", "Avery", "Quinn", "Blake", "Drew", "Reese", "Hayden", "Skyler", "Dakota", "Charlie", "Emery", "Finley", "Harper", "Indigo"];
  const lastNames = ["Chen", "Kim", "Patel", "Rivera", "Johnson", "Williams", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Garcia", "Martinez"];

  const firstName = randomFrom(firstNames);
  const lastName = randomFrom(lastNames);
  const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${randomInt(1, 99)}`;

  return {
    id: `creator_${String(index).padStart(4, "0")}`,
    username,
    content,
    category,
    tags: randomTags(category, randomInt(2, 4)),
    likes,
    shares,
    comments,
    views,
    followers,
    engagement_rate,
    created_at: randomDate(730),
    platform,
    region: randomFrom(regions),
    verified: isHighPerformer && Math.random() < 0.6,
  };
}

const COUNT = 500;
const creators = Array.from({ length: COUNT }, (_, i) => generateCreator(i + 1));

writeFileSync("./data/dataset.json", JSON.stringify(creators, null, 2));
console.log(`✅ Generated ${COUNT} creator records → data/dataset.json`);
console.log(`   High performers: ${creators.filter(c => c.followers > 500000).length}`);
console.log(`   Zero-GMV (constraint test): ${creators.filter(c => c.engagement_rate < 0.001).length}`);
console.log(`   Verified: ${creators.filter(c => c.verified).length}`);
console.log(`   Categories: ${[...new Set(creators.map(c => c.category))].join(", ")}`);
