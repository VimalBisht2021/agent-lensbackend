/*
|--------------------------------------------------------------------------
| Weighted Multi-Criteria Tool Scoring Algorithm
|--------------------------------------------------------------------------
| Matches user task against tool capabilities using keyword similarity,
| then weights scores based on budget and priority preferences.
|--------------------------------------------------------------------------
*/

const TASK_KEYWORDS = {
  coding: [
    // General programming
    "coding", "code", "programming", "program", "developer", "development",
    "software", "engineer", "engineering", "implement", "implementation",
    "build", "built", "create", "creating", "develop", "developing",

    // Debugging & fixing
    "debug", "debugging", "fix", "fixing", "bug", "bugs", "error", "errors",
    "issue", "issues", "patch", "patching", "troubleshoot", "troubleshooting",
    "resolve", "resolving", "broken", "crash", "crashes", "exception",
    "stacktrace", "stack trace", "runtime error", "compile error",

    // Architecture layers
    "backend", "back-end", "back end", "frontend", "front-end", "front end",
    "fullstack", "full-stack", "full stack", "server", "serverless",
    "client", "client-side", "server-side", "middleware", "microservice",
    "microservices", "monolith", "monolithic",

    // APIs & integrations
    "api", "apis", "rest", "restful", "graphql", "grpc", "trpc", "webhook",
    "webhooks", "endpoint", "endpoints", "integration", "integrations",
    "sdk", "library", "libraries", "package", "packages", "module", "modules",

    // Languages
    "javascript", "typescript", "python", "java", "kotlin", "swift",
    "rust", "go", "golang", "ruby", "php", "c++", "c#", "dotnet",
    ".net", "scala", "elixir", "haskell", "dart", "flutter",

    // Frameworks & runtimes
    "react", "nextjs", "next.js", "vue", "nuxt", "angular", "svelte",
    "sveltekit", "remix", "astro", "vite", "webpack", "node", "nodejs",
    "node.js", "express", "fastify", "nestjs", "django", "flask",
    "fastapi", "rails", "laravel", "spring", "gin", "fiber", "hono",

    // Databases & ORMs
    "database", "databases", "db", "sql", "nosql", "query", "queries",
    "schema", "migration", "migrations", "orm", "prisma", "drizzle",
    "sequelize", "mongoose", "typeorm", "postgres", "postgresql", "mysql",
    "sqlite", "mongodb", "redis", "elasticsearch", "cassandra", "dynamodb",
    "supabase", "firebase", "planetscale", "neon", "turso",

    // Code quality
    "refactor", "refactoring", "optimize", "optimization", "performance",
    "clean code", "code review", "linting", "lint", "formatter", "format",
    "test", "tests", "testing", "unit test", "integration test", "e2e",
    "jest", "vitest", "cypress", "playwright", "coverage",

    // DevOps adjacent
    "deploy", "deployment", "ci/cd", "pipeline", "docker", "container",
    "kubernetes", "k8s", "aws", "gcp", "azure", "vercel", "netlify",
    "railway", "render", "heroku", "vps", "linux", "bash", "shell",
    "script", "scripting", "automation", "cron", "job", "worker",

    // Data structures & algorithms
    "algorithm", "algorithms", "data structure", "data structures",
    "sorting", "searching", "recursion", "dynamic programming", "leetcode",
    "competitive programming", "complexity", "big o",

    // Security
    "authentication", "authorization", "auth", "jwt", "oauth", "session",
    "token", "encryption", "hashing", "bcrypt", "security", "vulnerability",
    "xss", "csrf", "sql injection", "sanitize", "validate", "validation",
  ],

  research: [
    // Core research terms
    "research", "researching", "researcher", "study", "studying",
    "analyze", "analysis", "analyzing", "analytical", "investigate",
    "investigation", "investigating", "examine", "examination",
    "explore", "exploration", "exploring", "survey", "review",

    // Finding information
    "search", "searching", "find", "finding", "findings", "look up",
    "lookup", "discover", "discovery", "uncover", "gather", "gathering",
    "collect", "collection", "retrieve", "retrieval",

    // Academic & scientific
    "paper", "papers", "academic", "journal", "journals", "article",
    "articles", "publication", "publications", "thesis", "dissertation",
    "citations", "cite", "citing", "bibliography", "references",
    "peer-reviewed", "peer reviewed", "scholarly", "science", "scientific",
    "experiment", "hypothesis", "methodology", "literature review",

    // Data & facts
    "data", "dataset", "datasets", "facts", "fact-check", "fact check",
    "statistics", "stats", "metrics", "numbers", "figures", "evidence",
    "proof", "source", "sources", "verify", "verification", "validate",

    // Reports & summaries
    "report", "reports", "reporting", "summary", "summarize", "summarizing",
    "overview", "brief", "briefing", "digest", "recap", "breakdown",
    "insight", "insights", "trends", "trend", "pattern", "patterns",

    // Competitive & market
    "competitive", "competition", "competitor", "competitors",
    "market research", "market analysis", "industry", "landscape",
    "benchmark", "benchmarking", "comparison", "compare", "comparing",
    "evaluate", "evaluation", "evaluating", "assess", "assessment",
  ],

  content: [
    // Writing types
    "write", "writing", "writer", "written", "rewrite", "rewriting",
    "draft", "drafting", "compose", "composing", "create content",
    "content creation", "content writing", "copywriting", "copy",
    "ghostwrite", "ghostwriting",

    // Blog & articles
    "blog", "blog post", "blogging", "article", "articles", "post",
    "posts", "listicle", "how-to", "how to", "guide", "guides",
    "tutorial", "tutorials", "explainer", "essay", "op-ed",

    // Marketing & advertising
    "marketing", "advertisement", "ad copy", "tagline", "slogan",
    "headline", "headlines", "call to action", "cta", "landing page",
    "sales page", "pitch", "pitch deck", "proposal",

    // Email & outreach
    "email", "emails", "newsletter", "newsletters", "outreach",
    "cold email", "follow-up", "subject line", "email sequence",
    "drip campaign", "campaign",

    // Social media
    "social media", "social", "tweet", "twitter", "linkedin",
    "instagram", "facebook", "tiktok", "thread", "caption",
    "hashtag", "viral", "engagement", "audience",

    // SEO & web content
    "seo", "search engine", "keyword", "keywords", "meta description",
    "meta title", "backlink", "organic", "ranking", "serp",
    "web copy", "website copy", "about page", "product description",

    // Long-form
    "ebook", "e-book", "whitepaper", "white paper", "case study",
    "case studies", "story", "storytelling", "narrative", "script",
    "screenplay", "dialogue",

    // Editing & improving
    "edit", "editing", "proofread", "proofreading", "grammar",
    "tone", "voice", "style", "rephrase", "paraphrase", "simplify",
    "clarity", "concise", "engaging", "persuasive",
  ],

  image: [
    // General visual
    "image", "images", "visual", "visuals", "picture", "pictures",
    "photo", "photos", "photograph", "photography", "graphic", "graphics",

    // Design
    "design", "designer", "designing", "ui design", "ux design",
    "ui/ux", "interface design", "visual design", "brand design",
    "branding", "brand identity", "style guide",

    // Specific assets
    "logo", "logos", "icon", "icons", "banner", "banners",
    "thumbnail", "thumbnails", "cover", "covers", "poster", "posters",
    "flyer", "flyers", "infographic", "infographics",

    // Illustration & art
    "illustration", "illustrations", "illustrate", "art", "artwork",
    "artworks", "draw", "drawing", "drawings", "sketch", "sketching",
    "paint", "painting", "paintings", "render", "rendering",
    "concept art", "character design", "character", "characters",

    // UI & mockups
    "mockup", "mockups", "wireframe", "wireframes", "prototype",
    "figma", "sketch app", "adobe xd", "component", "components",
    "layout", "grid", "spacing", "typography design",

    // AI image tools
    "midjourney", "dall-e", "stable diffusion", "firefly", "imagen",
    "text to image", "image generation", "generate image", "ai art",
    "prompt engineering image",

    // Styles
    "realistic", "photorealistic", "3d", "2d", "flat design",
    "minimalist", "abstract", "cartoon", "anime", "pixel art",
    "vector", "svg", "raster",
  ],

  video: [
    // General video
    "video", "videos", "clip", "clips", "footage", "reel",
    "short film", "film", "filming", "recorded", "recording",

    // Animation
    "animation", "animate", "animated", "motion", "motion graphics",
    "motion design", "after effects", "lottie", "2d animation",
    "3d animation", "explainer video", "whiteboard animation",

    // Editing
    "edit", "editing", "video edit", "video editing", "cut", "trim",
    "splice", "transition", "transitions", "color grade", "color grading",
    "premiere", "final cut", "davinci resolve", "capcut",

    // Production
    "storyboard", "storyboarding", "script", "voiceover", "voice over",
    "subtitles", "captions", "b-roll", "thumbnail",

    // Platforms
    "youtube", "tiktok", "instagram reel", "shorts", "vlog", "vlogging",
    "livestream", "live stream", "webinar", "course video", "tutorial video",

    // AI video
    "ai video", "text to video", "video generation", "runway", "sora",
    "pika", "heygen", "synthesia", "talking head",
  ],

  startup: [
    // Early stage
    "startup", "startups", "start-up", "start up", "founder", "founding",
    "co-founder", "early stage", "pre-seed", "seed stage",
    "mvp", "minimum viable product", "prototype", "prototyping",

    // Product
    "product", "product development", "product design", "product market fit",
    "pmf", "saas", "b2b", "b2c", "marketplace", "platform",
    "launch", "launching", "go to market", "gtm", "release",

    // Business
    "business plan", "business model", "revenue model", "monetization",
    "monetize", "pricing strategy", "subscription", "freemium",
    "venture", "vc", "investor", "pitch", "fundraise", "fundraising",
    "traction", "growth", "scaling", "scale",

    // Validation
    "idea", "ideas", "validate", "validation", "hypothesis",
    "user research", "customer discovery", "interview", "feedback",
    "iteration", "iterate", "pivot",

    // Team & ops
    "hiring", "team", "cofounder", "equity", "cap table",
    "runway", "burn rate", "mrr", "arr", "churn", "retention",
  ],

  architecture: [
    // System design
    "architecture", "system design", "system architecture",
    "design system", "software architecture", "technical design",
    "solution architecture", "enterprise architecture",

    // Planning
    "planning", "plan", "roadmap", "technical roadmap", "strategy",
    "technical strategy", "blueprint", "diagram", "diagrams",
    "flowchart", "erd", "entity relationship",

    // Scalability & reliability
    "scalable", "scalability", "scale", "distributed", "distributed system",
    "fault tolerant", "fault tolerance", "high availability", "ha",
    "load balancing", "load balancer", "caching", "cache",
    "cdn", "edge", "latency", "throughput", "bottleneck",

    // Infrastructure
    "infrastructure", "cloud", "multi-cloud", "hybrid cloud",
    "on-premise", "on-prem", "bare metal", "vm", "virtual machine",
    "container", "containerization", "orchestration",

    // Patterns
    "design pattern", "design patterns", "mvc", "mvvm", "event driven",
    "event-driven", "pub/sub", "message queue", "kafka", "rabbitmq",
    "cqrs", "event sourcing", "saga", "circuit breaker",

    // Data architecture
    "data pipeline", "etl", "data warehouse", "data lake", "datalake",
    "olap", "oltp", "replication", "sharding", "partitioning",
    "indexing", "index",

    // APIs & protocols
    "api design", "api architecture", "api gateway", "rate limiting",
    "throttling", "versioning", "backward compatible",
  ],

  data_science: [
    // Core
    "machine learning", "ml", "deep learning", "neural network",
    "artificial intelligence", "ai model", "model training", "training",
    "dataset", "data science", "data scientist", "data engineer",

    // Tasks
    "classification", "regression", "clustering", "prediction",
    "forecasting", "recommendation", "nlp", "natural language processing",
    "computer vision", "object detection", "image recognition",

    // Tools & frameworks
    "tensorflow", "pytorch", "keras", "scikit-learn", "sklearn",
    "pandas", "numpy", "jupyter", "notebook", "colab",
    "hugging face", "transformers", "llm", "fine-tune", "fine-tuning",
    "embeddings", "vector database", "rag", "langchain",

    // Analytics
    "analytics", "business intelligence", "bi", "dashboard",
    "visualization", "tableau", "power bi", "looker", "metabase",
    "chart", "charts", "graph", "graphs", "report",
  ],

  productivity: [
    // Task management
    "productivity", "task", "tasks", "todo", "to-do", "checklist",
    "project management", "project", "sprint", "agile", "scrum",
    "kanban", "trello", "jira", "notion", "asana", "linear",

    // Automation
    "automate", "automation", "workflow", "workflows", "zapier",
    "make", "n8n", "no-code", "low-code", "integration",

    // Communication
    "meeting", "meetings", "notes", "note-taking", "summarize meeting",
    "action items", "follow-up", "agenda", "minutes",

    // Personal
    "organize", "organization", "schedule", "scheduling", "calendar",
    "time management", "focus", "habit", "habits", "goal", "goals",
  ],

  audio: [
    "audio", "music", "song", "songs", "voice", "voiceover", "voice over",
    "speech", "tts", "text to speech", "podcast", "podcasts", "narration",
    "narrator", "voice cloning", "voice clone", "melody", "sound",
    "soundtrack", "jingle", "beats", "vocals", "music production",
    "audio generation", "background music", "audiobook", "audio editing",
  ],

  security: [
    "security", "cybersecurity", "vulnerability", "vulnerabilities",
    "pentest", "penetration test", "penetration testing", "exploit",
    "threat", "threat hunting", "red team", "red teaming", "audit",
    "compliance", "soc", "security operations", "xss", "csrf",
    "sql injection", "malware", "ransomware", "authentication",
    "authorization", "zero trust", "devsecops", "sast", "dast",
    "incident response", "security scan", "secure coding",
  ],

  automation: [
    "automation", "workflow", "workflows", "automate", "integration",
    "integrations", "pipeline", "pipelines", "zapier", "n8n", "make.com",
    "make", "trigger", "webhook", "sync", "orchestration", "agent workflow",
    "no-code", "low-code", "business automation", "crm automation",
    "email automation", "process automation",
  ],

  presentation: [
    "presentation", "slides", "slide deck", "pitch deck", "deck",
    "powerpoint", "keynote", "investor presentation", "sales deck",
    "business presentation", "demo presentation",
  ],

  devops: [
    "devops", "kubernetes", "docker", "terraform", "iac", "infrastructure",
    "cloud deployment", "ci/cd", "pipeline", "aws", "azure", "gcp",
    "cluster", "helm", "monitoring", "sre", "platform engineering",
  ],
};

/*
|--------------------------------------------------------------------------
| Shared Stop Words
|--------------------------------------------------------------------------
| FIX #2: Was duplicated in extractTaskKeywords and calculateToolScore.
| Now defined once and shared between both functions.
*/
const STOP_WORDS = new Set([
  "this", "that", "with", "from", "your", "have", "more", "will",
  "want", "what", "when", "make", "build", "detailed", "simple",
  "list", "output", "format", "task", "context", "constraints",
  "the", "and", "for", "are", "was", "but", "not", "you", "all",
  "can", "her", "was", "one", "our", "out", "day", "get", "has",
  "him", "his", "how", "its", "may", "new", "now", "old", "see",
  "two", "who", "boy", "did", "its", "let", "put", "say", "she",
  "too", "use",
]);

/*
|--------------------------------------------------------------------------
| Allowed Short Keywords
|--------------------------------------------------------------------------
| Short strings that ARE meaningful and should not be filtered out
| by the length check in the scoring logic.
*/
const ALLOWED_SHORT_KEYWORDS = new Set([
  "ml", "ai", "ui", "ux", "db", "api", "aws", "gcp", "bot",
  "cv", "go", "bi", "js", "ts", "sql", "css", "rag", "llm",
  "vpc", "vm", "ha", "k8s", "etl", "orm", "sdk", "cdn",
]);

/*
|--------------------------------------------------------------------------
| Extract Keywords from Task
|--------------------------------------------------------------------------
*/

const extractTaskKeywords = (task) => {
  // Strip XML tags first to prevent word-joining artifacts
  const cleanTask = task.replace(/<[^>]+>/g, " ");
  const normalizedTask = cleanTask.toLowerCase();

  /*
  | FIX #1: Multi-word keyword matching
  | Check the full normalized string for phrase keywords BEFORE
  | splitting into individual words, so "machine learning",
  | "cold email", "system design" etc. are correctly detected.
  */
  const matchedCategories = {};

  Object.entries(TASK_KEYWORDS).forEach(([category, keywords]) => {
    let matchCount = 0;

    // Pass 1: Check multi-word phrases against the full string
    keywords.forEach((kw) => {
      if (kw.includes(" ") && normalizedTask.includes(kw)) {
        matchCount += 2; // Phrase match is worth more than a single word
      }
    });

    // Pass 2: Check individual words
    const words = normalizedTask
      .replace(/[^a-z0-9\s-]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !STOP_WORDS.has(word));

    words.forEach((word) => {
      keywords.forEach((kw) => {
        if (kw.includes(" ")) return; // Already handled in Pass 1
        if (
          kw === word ||
          (word.length > 4 && kw.includes(word)) ||
          (kw.length > 4 && word.includes(kw))
        ) {
          matchCount++;
        }
      });
    });

    if (matchCount > 0) {
      matchedCategories[category] = matchCount;
    }
  });

  // Extract individual words for capability matching in scoring
  const words = normalizedTask
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));

  return {
    words,
    normalizedTask, // Pass full string so calculateToolScore can phrase-match too
    matchedCategories,
    primaryCategory:
      Object.keys(matchedCategories).sort(
        (a, b) => matchedCategories[b] - matchedCategories[a]
      )[0] || "general",
  };
};

/*
|--------------------------------------------------------------------------
| Calculate Tool Fitness Score
|--------------------------------------------------------------------------
*/

const calculateToolScore = (tool, taskAnalysis, budget, priority) => {
  let score = 25; // Baseline score for all tools

  /*
  |--- Capability Match (0-40 points) ---|
  */
  const toolCapabilities = [
    ...tool.strengths,
    ...tool.bestFor,
  ].map((s) => s.toLowerCase());

  let capabilityMatch = 0;

  // FIX #1 (continued): Check full normalized task string for multi-word capabilities
  toolCapabilities.forEach((cap) => {
    if (cap.includes(" ") && taskAnalysis.normalizedTask.includes(cap)) {
      capabilityMatch += 2;
    }
  });

  // FIX #2: Uses shared STOP_WORDS instead of a duplicate local array
  // FIX #3: Tightened substring matching — require word-boundary alignment
  //         to prevent "log" matching "blog", "test" matching "latest" etc.
  taskAnalysis.words.forEach((word) => {
    // Skip very short words unless they are known meaningful abbreviations
    if (word.length <= 3 && !ALLOWED_SHORT_KEYWORDS.has(word)) return;
    if (STOP_WORDS.has(word)) return;

    toolCapabilities.forEach((cap) => {
      if (cap.includes(" ")) return; // Already handled above

      if (cap === word) {
        // Exact match — highest confidence
        capabilityMatch += 1.5;
      } else if (
        word.length > 5 &&
        cap.length > 5 &&
        (cap.startsWith(word) || word.startsWith(cap))
      ) {
        // Prefix match only — avoids mid-word false positives
        capabilityMatch += 0.75;
      }
    });
  });

  // Category bonus
  if (
    tool.category === taskAnalysis.primaryCategory ||
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
    score += Math.min(Math.log10(tool.contextWindow) * 2, 10);
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
    score += (tool.popularityScore / 100) * 15;
  } else if (priority === "speed") {
    score += tool.contextWindow > 100000 ? 10 : 5;
    if (tool.strengths.includes("fast")) score += 5;
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

const generateToolRanking = (tools, task, budget, priority) => {
  const taskAnalysis = extractTaskKeywords(task);

  const scoredTools = tools.map((tool) => ({
    tool: tool.name,
    provider: tool.provider,
    category: tool.category,
    monthlyPrice: tool.monthlyPrice,
    score: calculateToolScore(tool, taskAnalysis, budget, priority),
  }));

  scoredTools.sort((a, b) => b.score - a.score);

  // Pick top 2-4 tools (strict complementary orchestration)
  const selectedTools = [];
  const usedCategories = new Set();
  const usedProviders = new Set();

  for (const scored of scoredTools) {
    if (selectedTools.length >= 4) break;
    if (
      !usedCategories.has(scored.category) &&
      !usedProviders.has(scored.provider) &&
      scored.score > 10
    ) {
      selectedTools.push(scored);
      usedCategories.add(scored.category);
      usedProviders.add(scored.provider);
    }
  }

  // Build orchestration flow
  const orchestrationFlow = selectedTools.map((t, i) => ({
    step: i + 1,
    tool: t.tool,
    purpose: determinePurpose(t, taskAnalysis, i),
    scoreOutOf100: t.score,
  }));

  /*
  | FIX #5: Clarify cost label — free-tier tools show $0 which is
  | misleading when paid tools are also in the workflow.
  | Sum only paid tools and expose a breakdown.
  */
  const paidTools = selectedTools.filter((t) => t.monthlyPrice > 0);
  const estimatedCost = paidTools.reduce((sum, t) => sum + t.monthlyPrice, 0);

  return {
    success: true,
    orchestrationFlow,
    estimatedCostUSD: estimatedCost,
    costBreakdown: selectedTools.map((t) => ({
      tool: t.tool,
      monthlyPrice: t.monthlyPrice,
      isFree: t.monthlyPrice === 0,
    })),
    taskAnalysis: {
      primaryCategory: taskAnalysis.primaryCategory,
      matchedCategories: taskAnalysis.matchedCategories,
    },
    allScores: scoredTools.slice(0, 8).map((t) => ({
      tool: t.tool,
      provider: t.provider,
      category: t.category,
      monthlyPriceUSD: t.monthlyPrice,
      scoreOutOf100: t.score,
    })),
  };
};

/*
|--------------------------------------------------------------------------
| Determine Tool Purpose in Workflow
|--------------------------------------------------------------------------
*/

const determinePurpose = (tool, taskAnalysis, index) => {
  /*
  | FIX #4: Added missing data_science and productivity entries.
  | Previously these fell through to "general" silently.
  */
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
    startup: [
      "Idea validation and market analysis",
      "MVP scoping and roadmap",
      "Pitch and messaging refinement",
      "Go-to-market strategy",
    ],
    architecture: [
      "System design and blueprinting",
      "Infrastructure planning",
      "Scalability and reliability review",
      "Documentation and diagramming",
    ],
    data_science: [
      "Data exploration and analysis",
      "Model selection and training",
      "Evaluation and fine-tuning",
      "Visualization and reporting",
    ],
    productivity: [
      "Workflow mapping and planning",
      "Automation setup",
      "Communication and documentation",
      "Progress tracking and review",
    ],
    audio: [
      "Audio concept and scripting",
      "Voice and music generation",
      "Audio refinement and mastering",
      "Distribution and optimization",
    ],
    security: [
      "Threat analysis and scanning",
      "Vulnerability detection",
      "Security remediation planning",
      "Compliance and reporting",
    ],
    automation: [
      "Workflow analysis and mapping",
      "Automation setup and orchestration",
      "Integration and deployment",
      "Monitoring and optimization",
    ],
    presentation: [
      "Storyboarding and structure",
      "Visual design and slide creation",
      "Content refinement",
      "Final review and export",
    ],
    devops: [
      "Infrastructure analysis",
      "Pipeline and environment setup",
      "Deployment and orchestration",
      "Monitoring and reliability review",
    ],
    general: [
      "Initial analysis and planning",
      "Core task execution",
      "Quality refinement",
      "Final review and optimization",
    ],
  };

  const category = taskAnalysis.primaryCategory;
  const purposeList = purposes[category] || purposes.general;

  return purposeList[Math.min(index, purposeList.length - 1)];
};

module.exports = {
  extractTaskKeywords,
  calculateToolScore,
  generateToolRanking,
};