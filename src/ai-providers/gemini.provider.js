const {
  GoogleGenerativeAI,
} = require("@google/generative-ai");

const genAI =
  new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
  );

const getModel = () => {
  return genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });
};

const generateAIReasoning =
  async ({
    task,
    tools,
    budget,
    priority,
  }) => {
    try {
      const model = getModel();

      const prompt = `
You are an enterprise AI orchestration expert.

Task:
${task}

Tools:
${tools.join(", ")}

Budget:
${budget}

Priority:
${priority}

Explain:
1. Why these tools are recommended
2. Workflow optimization reasoning
3. Cost-performance tradeoffs

Keep response concise and professional.
`;

      const result =
        await model.generateContent(
          prompt
        );

      const response =
        await result.response;

      return response.text();
    } catch (error) {
      console.error(
        "Gemini Error:",
        error.message
      );

      return `AI reasoning failed: ${error.message}`;
    }
  };

module.exports = {
  generateAIReasoning,
};