const workflowRules = {
  coding: {
    workflow: [
      {
        step: 1,

        tool: "Claude",

        purpose:
          "Architecture and backend planning",
      },

      {
        step: 2,

        tool: "ChatGPT",

        purpose:
          "Debugging and implementation support",
      },
    ],

    estimatedCost: 20,

    reasoning:
      "Claude excels in architecture-level reasoning while ChatGPT supports rapid debugging workflows.",
  },

  research: {
    workflow: [
      {
        step: 1,

        tool: "Perplexity",

        purpose:
          "Web research and citations",
      },

      {
        step: 2,

        tool: "Gemini",

        purpose:
          "Long document analysis",
      },
    ],

    estimatedCost: 20,

    reasoning:
      "Perplexity provides accurate research capabilities while Gemini handles large-context synthesis.",
  },

  startup: {
    workflow: [
      {
        step: 1,

        tool: "Claude",

        purpose:
          "System architecture planning",
      },

      {
        step: 2,

        tool: "Bolt",

        purpose:
          "Frontend UI generation",
      },

      {
        step: 3,

        tool: "ChatGPT",

        purpose:
          "Debugging and optimization",
      },

      {
        step: 4,

        tool: "Perplexity",

        purpose:
          "Market and competitor research",
      },
    ],

    estimatedCost: 40,

    reasoning:
      "This workflow optimizes startup development through specialized AI task delegation.",
  },

  content: {
    workflow: [
      {
        step: 1,

        tool: "ChatGPT",

        purpose:
          "Content generation",
      },

      {
        step: 2,

        tool: "Gemini",

        purpose:
          "Long-form contextual refinement",
      },
    ],

    estimatedCost: 20,

    reasoning:
      "Combining ChatGPT and Gemini improves content quality and contextual depth.",
  },
};

module.exports = workflowRules;