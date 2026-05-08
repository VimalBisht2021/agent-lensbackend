require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = require("../config/db");

const AITool = require("../models/AITool");

const aiTools = require("./aiTools.seed");

const seedTools = async () => {
  try {
    await connectDB();

    await AITool.deleteMany();

    const toolsWithWater = aiTools.map(tool => {
      let water = 0;
      if (tool.category === "video") water = 2500 + Math.random() * 2000;
      else if (tool.category === "image") water = 400 + Math.random() * 300;
      else if (tool.category === "audio") water = 150 + Math.random() * 100;
      else water = 20 + Math.random() * 50;
      
      return { ...tool, waterPerRequest: Math.round(water) };
    });

    await AITool.insertMany(toolsWithWater);

    console.log("AI Tools Seeded Successfully");

    process.exit();
  } catch (error) {
    console.error(error);

    process.exit(1);
  }
};

seedTools();