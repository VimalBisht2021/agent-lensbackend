const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const callGroq = async (prompt) => {
  const completion =
    await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

  return completion.choices[0].message.content;
};

/*
|--------------------------------------------------------------------------
| AI Reasoning
|--------------------------------------------------------------------------
*/

const generateAIReasoning = async ({
  task,
  tools,
  budget,
  priority,
}) => {
  try {
    const prompt = `
You are an enterprise AI orchestration expert.

Task: ${task}
Recommended Tools: ${tools.join(", ")}
Budget: ${budget}
Priority: ${priority}

Explain:
1. Why these tools are recommended
2. Workflow optimization reasoning
3. Cost-performance tradeoffs

Keep response concise and professional.
`;
    return await callGroq(prompt);
  } catch (error) {
    console.error(
      "Groq Reasoning Error:",
      error.message
    );
    return `AI reasoning failed: ${error.message}`;
  }
};

const detectSemanticOverlaps = async (tools, utilizationRates) => {
  try {
    const prompt = `You are an AI infrastructure optimization engine. Analyze the semantic capabilities and behavioral utilization of the following AI tools to find redundancies.

Active Subscriptions:
${JSON.stringify(
  tools.map(t => ({
    name: t.name,
    category: t.category,
    price: t.monthlyPrice,
    capabilities: [...t.strengths, ...t.bestFor],
    utilizationRate: Math.round(utilizationRates[t.name] * 100) + '%'
  })), null, 2
)}

Find any pairs of tools that heavily overlap in their semantic capabilities. Ignore pricing for the overlap percentage. Pay attention to the behavioral utilization: if Tool A is used 90% and Tool B is used 0%, Tool B is highly redundant.

CRITICAL RULES FOR OVERLAP DETECTION:
1. Foundational LLMs (e.g., ChatGPT, Claude, Gemini, Llama) inherently overlap with each other by at least 80%, because they are all general-purpose reasoning engines, even if their specific assigned 'category' differs (e.g. 'chat' vs 'coding' vs 'research').
2. Any two tools that share the EXACT same 'category' automatically have at least a 75% overlap.
3. Do NOT return objects with 0% similarity. Only return pairs that actually overlap.

Return ONLY a valid JSON array of objects with this exact structure (no markdown, no extra text):
[
  {
    "tools": ["Tool A", "Tool B"],
    "similarity": "85%",
    "rawSimilarity": 0.85,
    "categoryMatch": true,
    "sharedCapabilities": ["coding", "software engineering"],
    "recommendation": "Behavioral Redundancy: Tool A has 0% utilization across recent workflows while Tool B covers the same capabilities. Consider canceling Tool A."
  }
]
If there are no overlaps, return an empty array: []`;

    const response = await callGroq(prompt);
    
    // Extract JSON array from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error("Groq Semantic Overlap Error:", error.message);
    return [];
  }
};

module.exports = {
  generateAIReasoning,
  detectSemanticOverlaps
};