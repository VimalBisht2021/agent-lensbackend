const AITool = require("../models/AITool");
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const getAllTools = async (req, res) => {
  try {
    const tools = await AITool.find().sort({
      popularityScore: -1,
    });

    return res.status(200).json({
      success: true,
      message: "AI tools fetched successfully",
      data: tools,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getToolsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const tools = await AITool.find({
      category,
    });

    return res.status(200).json({
      success: true,
      message: "Tools fetched successfully",
      data: tools,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| AI-Powered Tool Comparison
|--------------------------------------------------------------------------
*/

const compareTools = async (req, res) => {
  console.log("==> Compare Tools Request Started");
  try {
    const { toolNames } = req.body;
    console.log("Tool Names to compare:", toolNames);

    if (!toolNames || !Array.isArray(toolNames) || toolNames.length < 2) {
      return res.status(400).json({
        success: false,
        message: "At least two tool names are required for comparison",
      });
    }

    console.log("Searching for tools in DB...");
    const tools = await AITool.find({
      name: { $in: toolNames },
    });
    console.log(`Found ${tools.length} tools`);

    if (tools.length < 2) {
      return res.status(404).json({
        success: false,
        message: "Some tools were not found in the database",
      });
    }

    console.log("Mapping tool data...");
    const toolData = tools.map((t) => ({
      name: t.name,
      provider: t.provider,
      category: t.category,
      pricingType: t.pricingType,
      monthlyPrice: t.monthlyPrice,
      contextWindow: t.contextWindow,
      strengths: t.strengths,
      weaknesses: t.weaknesses,
      bestFor: t.bestFor,
      apiAvailable: t.apiAvailable,
      openSource: t.openSource,
      popularityScore: t.popularityScore,
      dataPrivacy: t.dataPrivacy,
      energyRating: t.energyRating,
      ethicalScore: t.ethicalScore,
    }));

    const prompt = `You are an elite enterprise AI tool analyst and orchestration architect. 
Compare these ${toolNames.length} AI tools in extreme detail for an infrastructure-grade platform.

Tools Data:
${JSON.stringify(toolData, null, 2)}

Provide a comprehensive comparison covering:
1. Deep feature matrix across all tools
2. Cost-benefit analysis for enterprise scaling
3. Privacy and ethical compliance evaluation
4. Orchestration suitability: How well do these tools fit into an automated AI workflow?

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "winner": "ToolName (The overall best choice)",
  "summary": "High-level strategic verdict",
  "comparison": {
    "costEfficiency": { "winner": "ToolName", "reason": "Detailed logic" },
    "privacy": { "winner": "ToolName", "reason": "Data sovereignty and security logic" },
    "performance": { "winner": "ToolName", "reason": "Context window and quality tradeoffs" },
    "orchestration": { "winner": "ToolName", "reason": "Suitability for multi-step workflows" }
  },
  "matrix": [
    { "feature": "Pricing", "values": { "ToolName1": "$20", "ToolName2": "Free" } },
    { "feature": "Context Window", "values": { "ToolName1": "128k", "ToolName2": "200k" } }
  ],
  "bestFor": {
    "ToolName1": ["use case 1", "use case 2"],
    "ToolName2": ["use case 1", "use case 2"]
  },
  "recommendation": "Executive summary of when to deploy which tool"
}`;

    console.log("Calling Groq API...");
    let completion;
    try {
      completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 2000,
      });
      console.log("Groq API success");
    } catch (apiError) {
      console.warn("Primary Groq model failed, trying fallback...", apiError.message);
      try {
        completion = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 1500,
        });
        console.log("Fallback Groq API success");
      } catch (fallbackError) {
        console.error("All comparison models failed:", fallbackError.message);
        return res.status(200).json({
          success: true,
          message: "AI analysis is temporarily unavailable, showing technical data.",
          data: {
            tools: toolData,
            analysis: {
              summary: "Service at capacity. Manual data comparison enabled.",
              recommendation: "Please try again later for AI reasoning."
            },
            source: "technical-matrix"
          }
        });
      }
    }

    console.log("Parsing AI response...");
    const text = completion.choices[0].message.content;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    let analysis;
    try {
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: text };
    } catch (e) {
      console.error("JSON Parse Error:", e);
      analysis = { 
        summary: "Error parsing AI analysis. Showing raw data.",
        raw: text 
      };
    }

    console.log("Comparison generated. Sending response.");
    return res.status(200).json({
      success: true,
      message: "Advanced tool comparison generated successfully",
      data: {
        tools: toolData,
        analysis,
        source: "algo-lens-intelligence",
      },
    });
  } catch (error) {
    console.error("CRITICAL ERROR in compareTools:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = {
  getAllTools,
  getToolsByCategory,
  compareTools,
};