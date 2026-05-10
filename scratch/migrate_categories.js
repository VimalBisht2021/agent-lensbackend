const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// Use relative path from the script's location
const AITool = require("../src/models/AITool");

const MAPPINGS = {
  "data": "data_science",
  "workflow": "automation",
  "cloud": "devops",
  "agent": "coding",
  "chat": "research"
};

async function migrateCategories() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI not found in environment variables.");
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    const tools = await AITool.find();
    console.log(`Analyzing ${tools.length} tools...`);

    let updatedCount = 0;

    for (const tool of tools) {
      const newCategory = MAPPINGS[tool.category];
      if (newCategory) {
        console.log(`Updating ${tool.name}: ${tool.category} -> ${newCategory}`);
        tool.category = newCategory;
        await tool.save();
        updatedCount++;
      }
    }

    console.log(`\nMigration complete. Updated ${updatedCount} tools.`);
    await mongoose.disconnect();
  } catch (err) {
    console.error("Migration Error:", err.message);
  }
}

migrateCategories();
