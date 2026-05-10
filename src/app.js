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

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://agent-lens-frontend.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());


app.use(morgan("dev"));

app.use(apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/tools", toolsRoutes);
const { protect } = require("./middleware/auth.middleware");

app.use(
  "/api/analytics",
  protect,
  analyticsRoutes
);
app.use(
  "/api/workflows",
  protect,
  workflowRoutes
);
app.use(
  "/api/organizations",
  protect,
  organizationRoutes
);
app.use(
  "/api/recommendations",
  protect,
  recommendationRoutes
);

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Algo Lens AI Orchestration Backend Running",
  });
});

app.use(errorHandler);

module.exports = app;