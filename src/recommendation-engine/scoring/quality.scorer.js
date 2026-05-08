const toolScores = {
  ChatGPT: {
    quality: 9,
    speed: 8,
    cost: 6,
  },

  Claude: {
    quality: 10,
    speed: 7,
    cost: 6,
  },

  Gemini: {
    quality: 8,
    speed: 8,
    cost: 8,
  },

  Perplexity: {
    quality: 7,
    speed: 9,
    cost: 8,
  },

  Bolt: {
    quality: 8,
    speed: 10,
    cost: 7,
  },
};

const getToolScores = (
  toolName
) => {
  return (
    toolScores[toolName] || {
      quality: 5,
      speed: 5,
      cost: 5,
    }
  );
};

module.exports = {
  getToolScores,
};