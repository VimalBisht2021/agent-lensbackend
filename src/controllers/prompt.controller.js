const {
  optimizePrompt,
} = require(
  "../services/promptOptimization.service"
);

const enhancePrompt = async (
  req,
  res
) => {
  try {
    const {
      prompt,
      tool,
      goal,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message:
          "Prompt is required",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Optimize Prompt
    |--------------------------------------------------------------------------
    */

    const result =
      await optimizePrompt({
        prompt,
        tool:
          tool || "general",
        goal:
          goal ||
          "save_tokens",
      });

    return res.status(200).json({
      success: true,

      message:
        "Prompt optimized successfully",

      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message:
        error.message,
    });
  }
};

module.exports = {
  enhancePrompt,
};