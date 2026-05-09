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

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or browser direct hits)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.includes(origin) || origin.endsWith(".vercel.app");
    
    if (isAllowed) {
      callback(null, true);
    } else {
      // Instead of throwing an error which kills the response headers, 
      // just pass null so the browser handles the rejection gracefully.
      callback(null, false); 
    }
  },
  credentials: true,
  optionsSuccessStatus: 200 
}));
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(morgan("dev"));

app.use(apiLimiter);

app.use("/api/tools", toolsRoutes);
app.use(
  "/api/analytics",
  analyticsRoutes
);
app.use(
  "/api/workflows",
  workflowRoutes
);
app.use(
  "/api/organizations",
  organizationRoutes
);
app.use(
  "/api/recommendations",
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