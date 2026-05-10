# Algo Lens API Documentation

Base URL: `http://localhost:5000/api`
 
**Authentication:** Most endpoints require a `Authorization: Bearer <token>` header.

All API endpoints follow a standardized JSON response format.

---

## 🔐 Authentication (`/api/auth`)

### 1. Signup
- **Endpoint:** `POST /api/auth/signup`
- **Description:** Registers a new user and automatically creates their organization.
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123",
    "organizationName": "Doe Industries",
    "industry": "Consulting"
  }
  ```
- **Response Format:** Returns user data and a Bearer `token`.

### 2. Login
- **Endpoint:** `POST /api/auth/login`
- **Description:** Authenticates a user and returns a session token.
- **Request Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Response Format:** Returns user data and a Bearer `token`.

---

## 🛠️ AI Tools (`/api/tools`)

### 1. Get All AI Tools
- **Endpoint:** `GET /api/tools`
- **Description:** Returns the full catalog of all 57 seeded AI tools.
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "message": "AI tools fetched successfully",
    "data": [
      {
        "name": "ChatGPT Plus",
        "provider": "OpenAI",
        "category": "chat",
        "website": "https://chat.openai.com",
        "monthlyPrice": 20,
        "popularityScore": 98,
        "carbonPerRequest": 4.2,
        "waterPerRequest": 45,
        "ethicalScore": 72
      }
    ]
  }
  ```

### 2. Get Tools by Category
- **Endpoint:** `GET /api/tools/category/:category`
- **Description:** Filters the catalog by categories (e.g., `chat`, `coding`, `security`, `devops`, `data`, `cloud`, `audio`, `presentation`, `video`, `image`, `agent`).
- **Request Body:** None
- **Response Format:** Same as `Get All AI Tools`.

### 3. Compare Tools
- **Endpoint:** `POST /api/tools/compare`
- **Description:** Uses Groq AI to generate a detailed comparison between two tools.
- **Request Body:**
  ```json
  {
    "tool1": "ChatGPT Plus",
    "tool2": "Claude Pro"
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "data": {
      "tools": [ { /* Tool 1 Data */ }, { /* Tool 2 Data */ } ],
      "analysis": {
        "winner": "Claude Pro",
        "summary": "Claude wins on coding tasks, ChatGPT wins on general multimodal.",
        "comparison": { 
          "costEfficiency": { "winner": "Tie", "reason": "Both are $20/mo" } 
        }
      },
      "source": "groq-ai"
    }
  }
  ```

---

## 🤖 AI Recommendations (`/api/recommendations`)

### 4. Generate Workflow Recommendation
- **Endpoint:** `POST /api/recommendations`
- **Description:** Deterministically ranks tools for a specific task and explains the reasoning via Groq.
- **Request Body:**
  ```json
  {
    "task": "Build a secure AWS infrastructure",
    "budget": "medium", 
    "priority": "quality",
    "organizationId": "optional_id",
    "teamName": "optional_team"
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "data": {
      "workflow": "Build a secure AWS infrastructure",
      "orchestrationFlow": [
        { "step": 1, "tool": "Amazon Q Developer", "purpose": "Initial analysis", "scoreOutOf100": 85.5 }
      ],
      "estimatedCostUSD": 19,
      "reasoning": "Amazon Q Developer is natively integrated with AWS...",
      "allScores": [ { "tool": "Amazon Q Developer", "scoreOutOf100": 85.5 } ]
    }
  }
  ```

---

## 📊 Analytics & Insights (`/api/analytics`)

### 5. Spend & Overlap Analytics
- **Endpoint:** `POST /api/analytics/spend`
- **Description:** Detects capability overlap and estimates wasted spend among active subscriptions.
- **Request Body:**
  ```json
  {
    "subscriptions": ["ChatGPT Plus", "Claude Pro"]
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "data": {
      "monthlySpend": 40,
      "overlapDetected": true,
      "estimatedWaste": 15.5,
      "overlappingTools": [
        { "tools": ["ChatGPT Plus", "Claude Pro"], "similarity": "80%" }
      ],
      "optimizationSuggestions": ["Consolidate overlapping tool subscriptions"],
      "source": "algorithm"
    }
  }
  ```

### 6. Carbon Footprint Analytics
- **Endpoint:** `GET /api/analytics/carbon`
- **Description:** Calculates total CO2 emitted based on historical usage and provides a sustainability report.
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "data": {
      "totalCarbonGrams": 45.2,
      "totalWaterConsumedMl": 4500,
      "avgCarbonPerWorkflow": 2.5,
      "avgWaterPerWorkflow": 250,
      "metricsByTool": {
        "ChatGPT Plus": { "carbon": 12.5, "water": 150 },
        "Midjourney Pro": { "carbon": 32.7, "water": 4350 }
      },
      "impactLevel": "high",
      "treesNeeded": 2,
      "litersOfWaterWasted": 4.5,
      "waterImpactAnalysis": "Image generation caused 95% of water cooling consumption.",
      "greenAlternatives": ["Llama 3.1", "Mistral"],
      "source": "algorithm+groq"
    }
  }
  ```

### 7. Optimization Insights
- **Endpoint:** `GET /api/analytics/optimization`
- **Description:** Uses Pareto analysis (80/20 rule) to find underutilized tools and cost-saving opportunities.
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "data": {
      "insights": ["Pareto Principle: ChatGPT accounts for 80% of all usage"],
      "redundancies": ["Claude Pro and ChatGPT Plus have 80% overlap"],
      "costSavingOpportunities": ["Midjourney Pro costs $60/mo but was only used 1 time"],
      "recommendedActions": ["Review underperforming subscriptions"],
      "totalEstimatedSpend": 500,
      "source": "algorithm"
    }
  }
  ```

### 8. Executive Dashboard
- **Endpoint:** `GET /api/analytics/executive`
- **Description:** Generates a composite "Health Score" (0-100) factoring in waste, overlap, diversity, and ethics.
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "data": {
      "healthScore": 85,
      "totalAISpend": 1500,
      "estimatedSavings": 300,
      "risks": ["High carbon footprint detected"],
      "recommendations": ["Adopt low-carbon AI tools for routine tasks"],
      "keyMetrics": {
        "avgEthicalScore": 88,
        "toolDiversity": 4,
        "mostUsedTool": "ChatGPT Plus"
      },
      "source": "algorithm"
    }
  }
  ```

### 9. Global Usage Data
- **Endpoint:** `GET /api/analytics/usage`
- **Description:** Fetches the raw history of all generated workflows across the platform.
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "data": [
      {
        "task": "Generate a React App",
        "toolsUsed": ["Claude 3.5 Sonnet", "Cursor Pro"],
        "estimatedCost": 40,
        "createdAt": "2024-05-08T12:00:00Z"
      }
    ]
  }
  ```

---

## 🏢 Organizations (`/api/organizations`)

### 10. Create Organization
- **Endpoint:** `POST /api/organizations`
- **Description:** Registers a new organization with its teams, budget limits, and active AI subscriptions.
- **Request Body:**
  ```json
  {
    "name": "Acme Corp",
    "industry": "Tech",
    "organizationSize": "enterprise",
    "subscriptions": ["GitHub Copilot Enterprise"],
    "teams": [
      {
        "name": "Engineering",
        "monthlyBudget": 5000,
        "aiTools": ["GitHub Copilot Enterprise"]
      }
    ]
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "data": {
      "_id": "60d5ec...",
      "name": "Acme Corp",
      "teams": [ { "name": "Engineering", "monthlyBudget": 5000 } ]
    }
  }
  ```

### 11. Get All Organizations
- **Endpoint:** `GET /api/organizations`
- **Description:** Returns a list of all registered organizations.
- **Request Body:** None
- **Response Format:** Array of Organization objects.

---

## 🛡️ Governance & Workflows (`/api/workflows`)

### 12. Validate Workflow Compliance
- **Endpoint:** `POST /api/workflows/validate`
- **Description:** Checks a proposed workflow against an organization's internal security policies.
- **Request Body:**
  ```json
  {
    "task": "Write an email",
    "budget": "high",
    "priority": "speed",
    "organizationPolicy": {
      "restrictedTools": ["ChatGPT Plus"],
      "maxMonthlyBudget": 100
    }
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "data": {
      "isCompliant": false,
      "violations": ["Workflow includes restricted tool: ChatGPT Plus"],
      "approvedTools": [],
      "blockedTools": ["ChatGPT Plus"]
    }
  }
  ```

### 13. Simulate Policy Impact
- **Endpoint:** `POST /api/workflows/simulate-policy`
- **Description:** Simulates the financial and capability impact of swapping AI tools.
- **Request Body:**
  ```json
  {
    "currentSubscriptions": ["Claude Pro"],
    "scenario": {
      "action": "add",
      "tool": "ChatGPT Plus"
    }
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "data": {
      "previousSpend": 20,
      "newSpend": 40,
      "spendDifference": 20,
      "newOverlapsDetected": 1,
      "impactSummary": "Adding ChatGPT Plus increases spend by $20 and introduces overlap with Claude Pro."
    }
  }
  ```
