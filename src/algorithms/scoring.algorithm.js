/*
|--------------------------------------------------------------------------
| Weighted Multi-Criteria Tool Scoring Algorithm
|--------------------------------------------------------------------------
| Matches user task against tool capabilities using keyword similarity,
| then weights scores based on budget and priority preferences.
|--------------------------------------------------------------------------
*/

const TASK_KEYWORDS = {
  coding: ["coding", "code", "programming", "debug", "develop", "build", "software", "api", "backend", "frontend", "fullstack", "app", "refactor"],
  research: ["research", "search", "find", "analyze", "study", "paper", "report", "investigate", "data", "facts", "citations"],
  content: ["content", "write", "blog", "article", "copy", "marketing", "email", "social", "post", "newsletter", "seo"],
  image: ["image", "design", "picture", "visual", "graphic", "logo", "illustration", "mockup", "ui", "photo"],
  video: ["video", "animation", "clip", "motion", "edit", "film", "creative"],
  startup: ["startup", "mvp", "prototype", "launch", "product", "saas", "idea"],
  architecture: ["architecture", "system-design", "planning", "scalable", "infrastructure", "database", "schema"],
};

/*
|--------------------------------------------------------------------------
| Extract Keywords from Task
|--------------------------------------------------------------------------
*/

const extractTaskKeywords = (task) => {
  const words = task
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/\s+/);

  const matchedCategories = {};

  Object.entries(TASK_KEYWORDS).forEach(
    ([category, keywords]) => {
      let matchCount = 0;

      words.forEach((word) => {
        if (
          keywords.some(
            (kw) =>
              kw.includes(word) ||
              word.includes(kw)
          )
        ) {
          matchCount++;
        }
      });

      if (matchCount > 0) {
        matchedCategories[category] =
          matchCount;
      }
    }
  );

  return {
    words,
    matchedCategories,
    primaryCategory:
      Object.keys(matchedCategories).sort(
        (a, b) =>
          matchedCategories[b] -
          matchedCategories[a]
      )[0] || "general",
  };
};

/*
|--------------------------------------------------------------------------
| Calculate Tool Fitness Score
|--------------------------------------------------------------------------
*/

const calculateToolScore = (
  tool,
  taskAnalysis,
  budget,
  priority
) => {
  let score = 25; // Baseline score for all tools

  /*
  |--- Capability Match (0-40 points) ---|
  */
  const toolCapabilities = [
    ...tool.strengths,
    ...tool.bestFor,
  ].map((s) => s.toLowerCase());

  let capabilityMatch = 0;

  taskAnalysis.words.forEach((word) => {
    // Ignore short words that cause false positive substring matches
    if (word.length <= 3 && !['ml', 'ai', 'ui', 'ux', 'db', 'api', 'aws', 'bot', 'cv'].includes(word)) return;
    
    const stopWords = ['this', 'that', 'with', 'from', 'your', 'have', 'more', 'will', 'want', 'what', 'when', 'make', 'build'];
    if (stopWords.includes(word)) return;

    toolCapabilities.forEach((cap) => {
      if (
        cap === word || 
        cap.includes(word) ||
        word.includes(cap)
      ) {
        capabilityMatch += 1.5;
      }
    });
  });

  // Category bonus
  if (
    tool.category ===
      taskAnalysis.primaryCategory ||
    tool.bestFor
      .map((b) => b.toLowerCase())
      .includes(taskAnalysis.primaryCategory)
  ) {
    capabilityMatch += 3;
  }

  score += Math.min(capabilityMatch * 5, 40);

  /*
  |--- Popularity (0-15 points) ---|
  */
  score += (tool.popularityScore / 100) * 15;

  /*
  |--- Context Window (0-10 points) ---|
  */
  if (tool.contextWindow > 0) {
    score +=
      Math.min(
        Math.log10(tool.contextWindow) * 2,
        10
      );
  }

  /*
  |--- Budget Weighting (0-20 points) ---|
  */
  if (budget === "low") {
    if (tool.monthlyPrice === 0) score += 20;
    else if (tool.monthlyPrice <= 10) score += 15;
    else if (tool.monthlyPrice <= 20) score += 8;
    else score += 0;
  } else if (budget === "medium") {
    if (tool.monthlyPrice <= 25) score += 15;
    else score += 5;
  } else {
    score += 10; // high budget = all tools viable
  }

  /*
  |--- Priority Weighting (0-15 points) ---|
  */
  if (priority === "quality") {
    score +=
      (tool.popularityScore / 100) * 15;
  } else if (priority === "speed") {
    score +=
      tool.contextWindow > 100000 ? 10 : 5;
    if (
      tool.strengths.includes("fast")
    )
      score += 5;
  } else if (priority === "cost") {
    score +=
      tool.monthlyPrice === 0
        ? 15
        : Math.max(0, 15 - tool.monthlyPrice / 5);
  }

  return Math.min(99.9, Math.round(score * 100) / 100);
};

/*
|--------------------------------------------------------------------------
| Generate Ranked Tool Recommendations
|--------------------------------------------------------------------------
*/

const generateToolRanking = (
  tools,
  task,
  budget,
  priority
) => {
  const taskAnalysis =
    extractTaskKeywords(task);

  const scoredTools = tools.map((tool) => ({
    tool: tool.name,
    provider: tool.provider,
    category: tool.category,
    monthlyPrice: tool.monthlyPrice,
    score: calculateToolScore(
      tool,
      taskAnalysis,
      budget,
      priority
    ),
  }));

  scoredTools.sort(
    (a, b) => b.score - a.score
  );

  // Pick top 2-4 tools (strict complementary orchestration)
  const selectedTools = [];
  const usedCategories = new Set();
  const usedProviders = new Set();

  for (const scored of scoredTools) {
    if (selectedTools.length >= 4) break;

    // Eliminate redundancy: Only 1 tool per category AND 1 tool per provider
    if (!usedCategories.has(scored.category) && !usedProviders.has(scored.provider) && scored.score > 10) {
      selectedTools.push(scored);
      usedCategories.add(scored.category);
      usedProviders.add(scored.provider);
    }
  }

  // Build orchestration flow
  const orchestrationFlow =
    selectedTools.map((t, i) => ({
      step: i + 1,
      tool: t.tool,
      purpose: determinePurpose(
        t,
        taskAnalysis,
        i
      ),
      scoreOutOf100: t.score,
    }));

  const estimatedCost = selectedTools.reduce(
    (sum, t) => sum + t.monthlyPrice,
    0
  );

  return {
    success: true,
    orchestrationFlow,
    estimatedCostUSD: estimatedCost,
    taskAnalysis: {
      primaryCategory:
        taskAnalysis.primaryCategory,
      matchedCategories:
        taskAnalysis.matchedCategories,
    },
    allScores: scoredTools.slice(0, 8).map(t => ({
      tool: t.tool,
      provider: t.provider,
      category: t.category,
      monthlyPriceUSD: t.monthlyPrice,
      scoreOutOf100: t.score
    })),
  };
};

/*
|--------------------------------------------------------------------------
| Determine Tool Purpose in Workflow
|--------------------------------------------------------------------------
*/

const determinePurpose = (
  tool,
  taskAnalysis,
  index
) => {
  const purposes = {
    coding: [
      "Architecture and system design",
      "Implementation and coding",
      "Code review and debugging",
      "Testing and optimization",
    ],
    research: [
      "Primary research and data gathering",
      "Deep analysis and synthesis",
      "Fact verification and citations",
      "Report generation",
    ],
    content: [
      "Content strategy and outline",
      "Draft generation",
      "Editing and refinement",
      "SEO optimization",
    ],
    image: [
      "Visual concept generation",
      "Design iteration and refinement",
    ],
    video: [
      "Video concept and storyboarding",
      "Video generation and editing",
    ],
    general: [
      "Initial analysis and planning",
      "Core task execution",
      "Quality refinement",
      "Final review and optimization",
    ],
  };

  const category =
    taskAnalysis.primaryCategory;
  const purposeList =
    purposes[category] || purposes.general;

  return purposeList[
    Math.min(index, purposeList.length - 1)
  ];
};

module.exports = {
  extractTaskKeywords,
  calculateToolScore,
  generateToolRanking,
};
