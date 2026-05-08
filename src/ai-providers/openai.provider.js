const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey:
    process.env.OPENAI_API_KEY,
});

const generateAIReasoning =
  async ({
    task,
    tools,
    budget,
    priority,
  }) => {
    try {
      const prompt = `
You are an enterprise AI orchestration expert.

Analyze this workflow recommendation.

Task:
${task}

Recommended Tools:
${tools.join(", ")}

Budget:
${budget}

Priority:
${priority}

Explain:
1. Why these tools are recommended
2. How they complement each other
3. How the workflow is optimized
4. Cost-performance tradeoffs

Keep response concise and professional.
`;

      const response =
        await openai.chat.completions.create(
          {
            model: "gpt-4.1-mini",

            messages: [
              {
                role: "user",

                content: prompt,
              },
            ],

            temperature: 0.7,
          }
        );

      return response.choices[0]
        .message.content;
    } catch (error) {
      console.error(error);

      return "AI reasoning generation failed.";
    }
  };

module.exports = {
  generateAIReasoning,
};