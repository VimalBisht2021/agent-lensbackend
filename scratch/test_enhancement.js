require('dotenv').config();
const promptService = require('../src/services/promptOptimization.service');

async function testEnhancement() {
    console.log("--- TEST 1: Simple Prompt (should use 8B model) ---");
    const simpleRes = await promptService.optimizePrompt({
        prompt: "Help me write a simple python script for a calculator",
        tool: "default"
    });
    console.log(JSON.stringify(simpleRes, null, 2));

    console.log("\n--- TEST 2: Complex Prompt (should use 70B model) ---");
    const complexRes = await promptService.optimizePrompt({
        prompt: `
            Design a microservices architecture for a fintech platform. 
            The system needs to handle high-frequency trading, real-time balance updates, 
            and strict regulatory compliance. We are using Node.js, Kafka, and PostgreSQL.
            Include details about circuit breakers, event sourcing, and security.
        `,
        tool: "claude"
    });
    console.log(JSON.stringify(complexRes, null, 2));
}

testEnhancement().catch(console.error);
