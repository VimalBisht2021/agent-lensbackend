/*
|--------------------------------------------------------------------------
| Jaccard Similarity Overlap Detection Algorithm
|--------------------------------------------------------------------------
| Detects capability overlap between AI tools using set-based
| similarity measurement. No AI calls needed.
|--------------------------------------------------------------------------
*/

// Jaccard similarity and legacy detectOverlaps purged in favor of Groq Semantic Overlaps

/*
|--------------------------------------------------------------------------
| Calculate Spend With Overlap Waste
|--------------------------------------------------------------------------
*/

const { detectSemanticOverlaps } = require("../ai-providers/groq.provider");

const analyzeSubscriptionSpend = async (
  subscribedTools,
  allTools,
  usageData = []
) => {
  const toolMap = {};
  allTools.forEach((t) => {
    toolMap[t.name] = t;
  });

  // Get subscribed tool objects
  const activeTools = subscribedTools
    .map((name) => toolMap[name])
    .filter(Boolean);

  // Calculate real spend from DB prices
  const monthlySpend = activeTools.reduce(
    (sum, t) => sum + t.monthlyPrice,
    0
  );

  // Calculate behavioral utilization rates
  const utilizationRates = {};
  const totalWorkflows = usageData.length;
  
  subscribedTools.forEach(toolName => {
     let count = 0;
     usageData.forEach(entry => {
       if (entry.toolsUsed && entry.toolsUsed.includes(toolName)) {
         count++;
       }
     });
     utilizationRates[toolName] = totalWorkflows > 0 ? count / totalWorkflows : 1; // Default to 1 if no historical data
  });

  // Detect overlaps among subscribed tools using Groq semantic analysis
  const overlaps = await detectSemanticOverlaps(
    activeTools,
    utilizationRates
  );

  // Estimate waste: 
  // 1. 100% waste for unused tools
  // 2. Partial waste for overlapping tools
  let estimatedWaste = 0;
  const processedWasteTools = new Set();

  // First check 0% utilized tools
  activeTools.forEach(tool => {
     if (utilizationRates[tool.name] === 0) {
         estimatedWaste += tool.monthlyPrice;
         processedWasteTools.add(tool.name);
     }
  });

  // Then check overlaps
  overlaps.forEach((overlap) => {
    if (overlap.rawSimilarity > 0) {
        const prices = overlap.tools.map(
          (name) => toolMap[name]?.monthlyPrice || 0
        );
        // Only count overlap waste if it wasn't already counted as 100% waste
        const toolAName = overlap.tools[0];
        const toolBName = overlap.tools[1];
        if (!processedWasteTools.has(toolAName) && !processedWasteTools.has(toolBName)) {
            const wasteRatio = overlap.rawSimilarity * 0.5;
            estimatedWaste += Math.min(...prices) * wasteRatio;
        }
    }
  });

  estimatedWaste = Math.round(
    estimatedWaste * 100
  ) / 100;

  // Generate suggestions
  const suggestions = overlaps.map(
    (o) => o.recommendation
  );

  // Add suggestions for completely unused tools
  activeTools.forEach(tool => {
      if (utilizationRates[tool.name] === 0) {
          suggestions.push(`Zero Utilization: ${tool.name} costs $${tool.monthlyPrice}/mo but has 0% utilization across recent workflows. Consider canceling.`);
      }
  });

  // No static template suggestions! We only rely on dynamic LLM behavioral insights.

  return {
    monthlySpend,
    overlapDetected: overlaps.length > 0,
    estimatedWaste,
    overlappingTools: overlaps,
    optimizationSuggestions: suggestions,
    toolBreakdown: activeTools.map((t) => ({
      name: t.name,
      price: t.monthlyPrice,
      category: t.category,
    })),
  };
};

module.exports = {
  analyzeSubscriptionSpend,
};
