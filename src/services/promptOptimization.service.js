const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/*
|--------------------------------------------------------------------------
| Provider Profiles
|--------------------------------------------------------------------------
| Each profile defines how the AI should structure, tone, and optimize
| prompts specifically for that tool's strengths and weaknesses.
*/

const PROVIDER_PROFILES = {
  claude: {
    label: "Claude (Anthropic)",
    strengths: ["deep reasoning", "XML structure", "long context", "nuanced analysis"],
    strategy: `
- Use clear, labeled sections (Task, Context, Constraints) for clarity
- Front-load the most important constraint or goal
- Prefer explicit enumeration over prose for requirements
- Request step-by-step reasoning chains (e.g. "Think through this before answering")
- Use precise, formal language — Claude rewards specificity
- Avoid vague qualifiers ("a bit", "somewhat") — state exactly what you mean
- For code: specify language, style guide, error handling expectations explicitly
    `,
  },
  perplexity: {
    label: "Perplexity AI",
    strengths: ["web search", "citations", "current events", "research synthesis"],
    strategy: `
- Frame as a research query, not a conversation
- Include temporal signals ("as of 2024", "latest", "recent")
- Request citation format explicitly if needed
- Break compound questions into focused sub-queries
- Use domain-specific terminology to surface authoritative sources
- Avoid hypotheticals — Perplexity anchors to real-world data
    `,
  },
  cursor: {
    label: "Cursor (AI IDE)",
    strengths: ["code generation", "refactoring", "file-aware context", "diffs"],
    strategy: `
- Reference file paths, function names, and variable names explicitly
- Describe the before/after state clearly (what exists → what it should become)
- Specify exact line ranges or function signatures when relevant
- Include error messages verbatim if debugging
- State whether you want a full rewrite or targeted patch
- Mention tech stack versions (e.g. "React 18", "Node 20", "TypeScript strict mode")
    `,
  },
  gpt4: {
    label: "GPT-4 / ChatGPT",
    strengths: ["instruction following", "broad knowledge", "function calling"],
    strategy: `
- Use clear imperative phrasing ("List", "Summarize", "Generate")
- Chain instructions with numbered steps
- Add role context for complex tasks ("Act as a senior backend engineer")
- Specify output format explicitly (JSON, markdown, bullet list)
- Keep system-level context and user intent clearly separated
    `,
  },
  gemini: {
    label: "Gemini (Google)",
    strengths: ["multimodal", "long context", "code", "reasoning"],
    strategy: `
- Leverage its long context window — include relevant background freely
- Multimodal prompts: describe image/audio inputs with precision
- For coding: Gemini responds well to test-driven framing ("Write a function that passes these test cases:")
- Request structured outputs with a schema definition
    `,
  },
  midjourney: {
    label: "Midjourney",
    strengths: ["visual style", "artistic direction", "composition"],
    strategy: `
- Lead with subject, then style, then lighting, then mood
- Use comma-separated descriptors, not sentences
- Include artist/style references for visual direction
- Specify aspect ratio, version, and quality parameters at the end
- Use negative prompts (--no) to remove unwanted elements
- Avoid abstract concepts — ground everything in visual terms
    `,
  },
  default: {
    label: "General LLM",
    strengths: ["general reasoning", "instruction following"],
    strategy: `
- Be explicit about role, task, context, and output format
- Remove ambiguity — restate vague terms with concrete definitions
- Front-load the most important constraint
- Prefer active voice and direct imperatives
    `,
  },
};

/*
|--------------------------------------------------------------------------
| Project Intelligence Signals
|--------------------------------------------------------------------------
| Patterns used to infer hidden context from minimal input.
*/

const PROJECT_SIGNALS = {
  techStack: {
    patterns: [
      { regex: /\b(react|vue|angular|svelte|nextjs|nuxt)\b/i, label: "Frontend Framework" },
      { regex: /\b(node|express|fastify|hono|nestjs)\b/i, label: "Node.js Backend" },
      { regex: /\b(python|django|fastapi|flask)\b/i, label: "Python Backend" },
      { regex: /\b(postgres|mysql|sqlite|mongodb|supabase|prisma)\b/i, label: "Database" },
      { regex: /\b(docker|kubernetes|k8s|terraform|aws|gcp|azure)\b/i, label: "DevOps/Cloud" },
      { regex: /\b(graphql|rest|grpc|trpc|websocket)\b/i, label: "API Layer" },
      { regex: /\b(typescript|ts)\b/i, label: "TypeScript" },
      { regex: /\b(tailwind|css|sass|styled-components)\b/i, label: "Styling" },
    ],
  },
  complexity: {
    highSignals: [
      /auth(entication|orization)/i, /payment|stripe|billing/i,
      /real.?time|websocket|sse/i, /machine learning|ml|ai model/i,
      /microservice|distributed/i, /migration|refactor/i,
    ],
    mediumSignals: [
      /api|endpoint/i, /database|schema/i, /component|module/i,
      /test|spec|coverage/i, /deploy|ci\/cd/i,
    ],
  },
  domain: {
    patterns: [
      { regex: /saas|subscription|tenant/i, label: "SaaS Product" },
      { regex: /ecommerce|cart|checkout|product/i, label: "E-Commerce" },
      { regex: /dashboard|analytics|metric|chart/i, label: "Analytics/BI" },
      { regex: /cms|content|blog|article/i, label: "Content Management" },
      { regex: /mobile|ios|android|react native|flutter/i, label: "Mobile App" },
      { regex: /cli|terminal|shell|script/i, label: "CLI/Tooling" },
      { regex: /game|player|score|level/i, label: "Gaming" },
      { regex: /finance|trading|portfolio|investment/i, label: "Fintech" },
      { regex: /design|creative|art|illustration|sketch|paint|drawing/i, label: "Creative/Design" },
    ],
  },
  risks: [
    { regex: /no test|untested|legacy/i, label: "Technical debt risk" },
    { regex: /hardcoded|env|secret|key|token/i, label: "Security exposure risk" },
    { regex: /slow|performance|bottleneck|lag/i, label: "Performance risk" },
    { regex: /TODO|FIXME|HACK|TEMP/i, label: "Unresolved issues in codebase" },
    { regex: /monolith|all in one|single file/i, label: "Scalability risk" },
    { regex: /no doc|undocumented/i, label: "Maintainability risk" },
  ],
};

/*
|--------------------------------------------------------------------------
| XML Tag Stripper
|--------------------------------------------------------------------------
| Removes XML/HTML tags from inputs before processing.
| This ensures user-pasted code or tags don't pollute the analysis context.
*/

const stripXmlTags = (text) => {
  return text
    .replace(/<[^>]+>/g, " ")   // replace XML/HTML tags with a space
    .replace(/\s{2,}/g, " ")    // collapse multiple spaces into one
    .replace(/\n{3,}/g, "\n\n") // collapse more than 2 blank lines
    .trim();
};

/*
|--------------------------------------------------------------------------
| Local Intelligence Extractor
|--------------------------------------------------------------------------
| Runs pattern-matching before the LLM call to prime the context.
*/

const extractLocalSignals = (prompt) => {
  const detectedStack = PROJECT_SIGNALS.techStack.patterns
    .filter(({ regex }) => regex.test(prompt))
    .map(({ label }) => label);

  const detectedDomain = PROJECT_SIGNALS.domain.patterns
    .filter(({ regex }) => regex.test(prompt))
    .map(({ label }) => label);

  const detectedRisks = PROJECT_SIGNALS.risks
    .filter(({ regex }) => regex.test(prompt))
    .map(({ label }) => label);

  const highComplexity = PROJECT_SIGNALS.complexity.highSignals.some((r) =>
    r.test(prompt)
  );
  const medComplexity = PROJECT_SIGNALS.complexity.mediumSignals.some((r) =>
    r.test(prompt)
  );

  const complexity = highComplexity ? "high" : medComplexity ? "medium" : "low";

  const wordCount = prompt.trim().split(/\s+/).length;
  const isVague = wordCount < 15;
  const isTechnical = detectedStack.length > 0;

  return {
    detectedStack,
    detectedDomain,
    detectedRisks,
    complexity,
    isVague,
    isTechnical,
    wordCount,
  };
};

/*
|--------------------------------------------------------------------------
| Core Optimizer
|--------------------------------------------------------------------------
*/

const optimizePrompt = async ({ prompt, tool = "default", goal = "general" }) => {
  const cleanPrompt = stripXmlTags(prompt);
  try {
    const provider = PROVIDER_PROFILES[tool.toLowerCase()] || PROVIDER_PROFILES.default;
    const localSignals = extractLocalSignals(cleanPrompt);

    /*
    |--------------------------------------------------------------------------
    | Build a rich, signal-aware system prompt
    |--------------------------------------------------------------------------
    */

    const systemPrompt = `
You are the world's most advanced AI prompt engineer. Your job is not just to clean up prompts — it is to TRANSFORM them into highly effective, context-rich instructions that extract maximum value from the target AI tool.

## Your Capabilities
You can infer hidden context from minimal input:
- Tech stack and architecture patterns
- Project domain and industry vertical
- Developer experience level
- Underlying intent beyond the literal request
- Risk areas, edge cases, and missing context
- Scalability and quality concerns

## Target Tool: ${provider.label}
${provider.strategy}

## Optimization Goal
"${goal}"

## Pre-Analysis Signals (detected automatically)
${localSignals.detectedStack.length > 0 ? `- Tech stack detected: ${localSignals.detectedStack.join(", ")}` : ""}
${localSignals.detectedDomain.length > 0 ? `- Domain detected: ${localSignals.detectedDomain.join(", ")}` : ""}
${localSignals.detectedRisks.length > 0 ? `- Risk signals: ${localSignals.detectedRisks.join(", ")}` : ""}
- Complexity level: ${localSignals.complexity}
- Prompt appears ${localSignals.isVague ? "VAGUE (expand significantly)" : "specific (refine and tighten)"}

## Your Task
1. Rewrite the prompt to be maximally effective for ${provider.label}
2. ALWAYS return the 'optimizedPrompt' in clean, professional NATURAL-LANGUAGE formatting.
   - Use bold headings (e.g., **Task:**, **Context:**, **Constraints:**)
   - Use concise bullet points for requirements
   - DO NOT use XML tags (e.g., <task>, <context>)
   - DO NOT use HTML tags
   - Avoid code blocks unless the prompt itself is a code snippet
3. Fill in implied context the user forgot to include
4. Add structural clarity
5. Surface the real problem behind the stated request
6. Add edge-case awareness if the complexity is high
7. Recommend 2-4 follow-up prompts

## Response Format
Return ONLY a valid JSON object — no markdown, no backticks, no explanation outside the JSON:

{
  "optimizedPrompt": "The fully rewritten prompt, ready to paste",
  "projectIntelligence": {
    "inferredStack": ["string"],
    "inferredDomain": "string",
    "complexity": "low|medium|high",
    "developerLevel": "junior|mid|senior",
    "architecturePattern": "string (e.g. MVC, microservices, serverless, monolith)",
    "keyAssumptions": ["string"]
  },
  "improvements": {
    "structureChanges": ["string"],
    "contextAdded": ["string"],
    "clarityFixes": ["string"],
    "risksMitigated": ["string"]
  },
  "estimatedReduction": "string (e.g. '40%' if shorter, 'expanded 2x' if more detail was needed)",
  "clarityScore": number (0-100, before → after comparison),
  "effectivenessScore": number (0-100, how well this prompt will perform on ${provider.label}),
  "followUpPrompts": ["string", "string", "string"],
  "optimizationNotes": ["string"]
}
`.trim();

    /*
    |--------------------------------------------------------------------------
    | Model Selection Strategy
    | Use 8B model directly for simple/short prompts to save 70B tokens.
    |--------------------------------------------------------------------------
    */
    const isSimplePrompt = cleanPrompt.length < 150 && localSignals.complexity === "low";
    let activeModel = isSimplePrompt ? "llama-3.1-8b-instant" : "llama-3.3-70b-versatile";
    let completion;
    try {
      completion = await groq.chat.completions.create({
        model: activeModel,
        messages: [
          { 
            role: "system", 
            content: activeModel === "llama-3.1-8b-instant" 
              ? `You are a specialized JSON generator. Your task is to rewrite prompts professionally. 
                 CRITICAL: You MUST return ONLY a JSON object. NO markdown, NO conversational filler, NO bold text outside JSON.
                 REQUIRED JSON SCHEMA:
                 { "optimizedPrompt": "...", "estimatedReduction": "...", "clarityScore": 80, "optimizationNotes": [] }` 
              : systemPrompt 
          },
          { role: "user", content: cleanPrompt },
        ],
        temperature: 0.3,
        max_tokens: isSimplePrompt ? 1000 : 2048,
      });
    } catch (apiError) {
      // If primary failed (and it was the 70B model), try the 8B fallback with a lightweight prompt
      if (activeModel === "llama-3.3-70b-versatile") {
        console.warn("Primary 70B model failed, trying lightweight fallback...", apiError.message);
        
        const lightweightSystemPrompt = `
        You are a specialized JSON generator. 
        CRITICAL: Return ONLY a JSON object. NO text before or after.
        {
          "optimizedPrompt": "...",
          "projectIntelligence": { "inferredDomain": "string", "complexity": "low|medium|high" },
          "estimatedReduction": "string",
          "clarityScore": 80,
          "optimizationNotes": []
        }`.trim();

        completion = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: lightweightSystemPrompt },
            { role: "user", content: cleanPrompt },
          ],
          temperature: 0.2,
          max_tokens: 1000,
        });
      } else {
        // If the small model also failed, throw the error to be caught by the outer try-catch
        throw apiError;
      }
    }

    const responseText = completion.choices[0].message.content;

    /*
    |--------------------------------------------------------------------------
    | Robust JSON Extraction & Fallback Parsing
    |--------------------------------------------------------------------------
    */
    let parsed;

    try {
      const startIdx = responseText.indexOf("{");
      const endIdx = responseText.lastIndexOf("}");

      if (startIdx === -1 || endIdx === -1) {
        console.error("DEBUG - Raw AI Response:", responseText);
        throw new Error("No JSON object found in AI response");
      }

      let rawJson = responseText.substring(startIdx, endIdx + 1);

      // Cleanup common LLM artifacts
      rawJson = rawJson
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]")
        .trim();

      parsed = JSON.parse(rawJson);
    } catch (parseError) {
      console.error("JSON Parse Failure:", parseError.message);

      // Smart Fallback: If it's not JSON, check if the response is actually useful text
      const isUsefulText = responseText.length > 50 && !responseText.includes("error");

      parsed = {
        optimizedPrompt: isUsefulText ? responseText : cleanPrompt,
        projectIntelligence: {
          inferredStack: localSignals.detectedStack,
          inferredDomain: localSignals.detectedDomain[0] || "General Software",
          complexity: localSignals.complexity,
          developerLevel: "unknown",
          architecturePattern: "unknown",
          keyAssumptions: [],
        },
        improvements: {
          structureChanges: [],
          contextAdded: ["Text-only fallback applied due to AI formatting failure"],
          clarityFixes: [],
          risksMitigated: [],
        },
        estimatedReduction: "0%",
        clarityScore: 50,
        effectivenessScore: 50,
        followUpPrompts: [],
        optimizationNotes: ["AI formatting failed. Salvaged raw text response."],
      };
    }

    // Merge local signals with LLM intelligence (local signals as fallback)
    return {
      ...parsed,
      projectIntelligence: {
        ...parsed.projectIntelligence,
        inferredStack:
          parsed.projectIntelligence?.inferredStack?.length > 0
            ? parsed.projectIntelligence.inferredStack
            : localSignals.detectedStack,
        inferredDomain:
          parsed.projectIntelligence?.inferredDomain ||
          localSignals.detectedDomain[0] ||
          "General Software",
        complexity:
          parsed.projectIntelligence?.complexity || localSignals.complexity,
      },
      _meta: {
        tool: provider.label,
        goal,
        originalWordCount: localSignals.wordCount,
        localSignalsDetected:
          localSignals.detectedStack.length +
          localSignals.detectedDomain.length +
          localSignals.detectedRisks.length,
        processedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("Prompt Optimization CRITICAL ERROR:", error);

    return {
      optimizedPrompt: cleanPrompt,
      projectIntelligence: {
        inferredStack: [],
        inferredDomain: "Unknown",
        complexity: "unknown",
        developerLevel: "unknown",
        architecturePattern: "unknown",
        keyAssumptions: [],
      },
      improvements: {
        structureChanges: [],
        contextAdded: [],
        clarityFixes: [],
        risksMitigated: [],
      },
      estimatedReduction: "0%",
      clarityScore: 0,
      effectivenessScore: 0,
      followUpPrompts: [],
      optimizationNotes: ["Optimization failed: " + error.message],
      _meta: {
        error: true,
        processedAt: new Date().toISOString(),
      },
    };
  }
};

/*
|--------------------------------------------------------------------------
| Batch Optimizer — run multiple prompts in parallel
|--------------------------------------------------------------------------
*/

const optimizeBatch = async (prompts) => {
  return Promise.all(prompts.map((p) => optimizePrompt(p)));
};

/*
|--------------------------------------------------------------------------
| Quick Score — lightweight scoring without full optimization
|--------------------------------------------------------------------------
*/

const scorePrompt = async (prompt) => {
  const cleanPrompt = stripXmlTags(prompt);
  const signals = extractLocalSignals(cleanPrompt);
  const wordCount = signals.wordCount;

  const lengthScore = Math.min(100, Math.max(10, wordCount * 3));
  const techScore = signals.isTechnical ? 80 : 40;
  const specificityScore = signals.isVague ? 20 : 75;

  return {
    overallScore: Math.round((lengthScore + techScore + specificityScore) / 3),
    wordCount,
    complexity: signals.complexity,
    isVague: signals.isVague,
    detectedStack: signals.detectedStack,
    recommendation: signals.isVague
      ? "Add more context: what tech stack, what goal, what constraints?"
      : "Prompt has sufficient detail. Optimize for your target tool.",
  };
};

module.exports = {
  optimizePrompt,
  optimizeBatch,
  scorePrompt,
  stripXmlTags,          // ← exported so you can use it in your frontend too
  PROVIDER_PROFILES,
  extractLocalSignals,
};