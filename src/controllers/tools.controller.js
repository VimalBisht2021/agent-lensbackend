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
  try {
    const { tool1, tool2 } = req.body;

    if (!tool1 || !tool2) {
      return res.status(400).json({
        success: false,
        message: "Both tool1 and tool2 are required",
      });
    }

    const tools = await AITool.find({
      name: { $in: [tool1, tool2] },
    });

    if (tools.length < 2) {
      return res.status(404).json({
        success: false,
        message: "One or both tools not found in database",
      });
    }

    const toolData = tools.map((t) => ({
      name: t.name,
      provider: t.provider,
      category: t.category,
      monthlyPrice: t.monthlyPrice,
      contextWindow: t.contextWindow,
      strengths: t.strengths,
      weaknesses: t.weaknesses,
      bestFor: t.bestFor,
      apiAvailable: t.apiAvailable,
      openSource: t.openSource,
      popularityScore: t.popularityScore,
    }));

    const prompt = `You are an enterprise AI tool analyst. Compare these two AI tools in detail.

Tool 1:
${JSON.stringify(toolData[0], null, 2)}

Tool 2:
${JSON.stringify(toolData[1], null, 2)}

Provide a comprehensive comparison covering:
1. Which is better for what use cases
2. Cost-effectiveness analysis
3. Quality and speed tradeoffs
4. Final recommendation based on different scenarios

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "winner": "ToolName",
  "summary": "One sentence overall verdict",
  "comparison": {
    "costEfficiency": { "winner": "ToolName", "reason": "..." },
    "quality": { "winner": "ToolName", "reason": "..." },
    "speed": { "winner": "ToolName", "reason": "..." },
    "versatility": { "winner": "ToolName", "reason": "..." }
  },
  "bestFor": {
    "tool1Name": ["use case 1", "use case 2"],
    "tool2Name": ["use case 1", "use case 2"]
  },
  "recommendation": "When to pick each tool"
}`;

    const completion =
      await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

    const text = completion.choices[0].message.content;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch
      ? JSON.parse(jsonMatch[0])
      : { summary: text };

    return res.status(200).json({
      success: true,
      message: "Tool comparison generated successfully",
      data: {
        tools: toolData,
        analysis,
        source: "groq-ai",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllTools,
  getToolsByCategory,
  compareTools,
};