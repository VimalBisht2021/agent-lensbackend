const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const { generateRecommendation } = require("../src/recommendation-engine/engine");

async function testRecommendation() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const task = "draw a pikachu character";
    const budget = "medium";
    const priority = "quality";

    console.log(`\nTesting task: "${task}"`);
    const result = await generateRecommendation({ task, budget, priority });
    
    console.log("\nResult Success:", result.success);
    if (!result.success) {
      console.log("Error Message:", result.message);
    } else {
      console.log("Primary Category:", result.taskAnalysis.primaryCategory);
      console.log("Orchestration Flow Steps:", result.orchestrationFlow.length);
      result.orchestrationFlow.forEach(s => console.log(` - Step ${s.step}: ${s.tool} (${s.purpose})`));
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

testRecommendation();
