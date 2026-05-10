const mongoose = require("mongoose");
require("dotenv").config();
const AITool = require("../src/models/AITool");

const TASK_KEYWORDS = {
  coding: [], research: [], content: [], image: [], video: [],
  startup: [], architecture: [], data_science: [], productivity: [],
  audio: [], security: [], automation: [], presentation: [], devops: []
};

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const tools = await AITool.find();
    console.log(`Found ${tools.length} tools`);

    const invalidCategories = [];
    const missingFields = [];

    tools.forEach(tool => {
      if (!TASK_KEYWORDS[tool.category]) {
        invalidCategories.push({ name: tool.name, category: tool.category });
      }
      if (!tool.strengths || tool.strengths.length === 0) {
        missingFields.push({ name: tool.name, field: "strengths" });
      }
      if (!tool.bestFor || tool.bestFor.length === 0) {
        missingFields.push({ name: tool.name, field: "bestFor" });
      }
    });

    console.log("\n--- Invalid Categories ---");
    if (invalidCategories.length > 0) {
      console.table(invalidCategories);
    } else {
      console.log("All tool categories are valid.");
    }

    console.log("\n--- Missing Strengths/BestFor ---");
    if (missingFields.length > 0) {
      console.table(missingFields);
    } else {
      console.log("No tools missing critical fields.");
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkDatabase();
