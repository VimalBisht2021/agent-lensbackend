const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, 'src', 'seed', 'aiTools.seed.js');
let content = fs.readFileSync(seedPath, 'utf8');

// Add default low complexity
content = content.replace(/dataPrivacy: "([^"]+)",/g, 'dataPrivacy: "$1",\n    complexity: "low",');

// Update high complexity tools
const highComplexityTools = [
    "AWS Bedrock",
    "K8sGpt",
    "Llama 3.1 405B",
    "Llama 3 70B",
    "Mistral Large",
    "PentestGPT",
    "Kubiya",
    "Amazon Q Developer",
    "Llama 3 8B",
    "Qwen 2.5 Coder",
    "OpenDevin",
    "MindStudio",
    "Sora"
];

highComplexityTools.forEach(tool => {
    const regex = new RegExp(`name: "${tool}",[\\s\\S]*?complexity: "low"`, 'g');
    content = content.replace(regex, (match) => match.replace('complexity: "low"', 'complexity: "high"'));
});

// Update medium complexity (APIs)
const mediumComplexityTools = [
    "DALL-E 3 API",
    "Stable Diffusion 3 API",
    "Claude 3.5 Sonnet",
    "Gemini 1.5 Pro",
    "Mistral Large",
    "ElevenLabs",
    "HeyGen",
    "Synthesia",
    "PlayHT"
];

mediumComplexityTools.forEach(tool => {
    const regex = new RegExp(`name: "${tool}",[\\s\\S]*?complexity: "low"`, 'g');
    content = content.replace(regex, (match) => match.replace('complexity: "low"', 'complexity: "medium"'));
});

fs.writeFileSync(seedPath, content);
console.log('Seed file updated with complexity levels.');
