const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/error.middleware");
const { apiLimiter } = require("./middleware/rateLimit.middleware");
const toolsRoutes = require("./routes/tools.routes");
const recommendationRoutes = require("./routes/recommendation.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const organizationRoutes = require("./routes/organization.routes");
const workflowRoutes = require("./routes/workflow.routes");
const authRoutes = require("./routes/auth.routes");
const promptRoutes = require(
  "./routes/prompt.routes"
);

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://agent-lens-frontend.vercel.app",
    "https://agent-lens.onrender.com",
    "https://agent-lens-frontend.onrender.com"
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Global Guest Context Middleware (Bypass all Auth)
const Organization = require("./models/Organization");
app.use(async (req, res, next) => {
  try {
    const defaultOrg = await Organization.findOne();
    if (defaultOrg) {
      req.organizationId = defaultOrg._id;
      req.organization = defaultOrg;
    }
    next();
  } catch (error) {
    next();
  }
});

app.use(morgan("dev"));
app.use(apiLimiter);

app.use("/api/tools", toolsRoutes);
app.use("/api/prompts", promptRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/workflows", workflowRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/recommendations", recommendationRoutes);

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Algo Lens AI Orchestration Backend Running",
  });
});

app.use(errorHandler);

module.exports = app;