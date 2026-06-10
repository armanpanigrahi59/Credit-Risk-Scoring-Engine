import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/credit-risk-scoring",
  mlServiceUrl: process.env.ML_SERVICE_URL || "http://127.0.0.1:8000",
  pythonBin: process.env.PYTHON_BIN || "python",
  allowTraining: process.env.ALLOW_TRAINING === "true",
  nodeEnv: process.env.NODE_ENV || "development"
};
