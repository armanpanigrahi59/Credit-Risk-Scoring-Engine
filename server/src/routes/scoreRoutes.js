import express from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { Score } from "../models/Score.js";
import { scoreApplicant, scoreIndiaLoan } from "../services/mlService.js";

const router = express.Router();

const applicantSchema = z.object({
  limit_bal: z.coerce.number().min(0),
  sex: z.coerce.number().int().min(1).max(2),
  education: z.coerce.number().int().min(0).max(6),
  marriage: z.coerce.number().int().min(0).max(3),
  age: z.coerce.number().int().min(18).max(100),
  pay_0: z.coerce.number().int().min(-2).max(8),
  pay_2: z.coerce.number().int().min(-2).max(8),
  pay_3: z.coerce.number().int().min(-2).max(8),
  pay_4: z.coerce.number().int().min(-2).max(8),
  pay_5: z.coerce.number().int().min(-2).max(8),
  pay_6: z.coerce.number().int().min(-2).max(8),
  bill_amt1: z.coerce.number(),
  bill_amt2: z.coerce.number(),
  bill_amt3: z.coerce.number(),
  bill_amt4: z.coerce.number(),
  bill_amt5: z.coerce.number(),
  bill_amt6: z.coerce.number(),
  pay_amt1: z.coerce.number().min(0),
  pay_amt2: z.coerce.number().min(0),
  pay_amt3: z.coerce.number().min(0),
  pay_amt4: z.coerce.number().min(0),
  pay_amt5: z.coerce.number().min(0),
  pay_amt6: z.coerce.number().min(0)
});

const indiaLoanSchema = z.object({
  loan_amount_inr: z.coerce.number().min(10000),
  annual_income_inr: z.coerce.number().min(50000),
  property_value_inr: z.coerce.number().min(0),
  term_months: z.coerce.number().int().min(6).max(480),
  cibil_score: z.coerce.number().int().min(300).max(900),
  dti_ratio: z.coerce.number().min(0).max(100),
  age_band: z.string().default("35-44"),
  gender: z.string().default("Joint"),
  region: z.string().default("North"),
  loan_product: z.string().default("Home Loan"),
  loan_purpose: z.string().default("Home Purchase"),
  employment_type: z.string().default("Salaried"),
  bureau_type: z.string().default("CIBIL"),
  co_applicant: z.boolean().default(true),
  pre_approved: z.boolean().default(false)
});

router.post("/", async (req, res, next) => {
  try {
    const applicant = applicantSchema.parse(req.body.applicant || req.body);
    const result = await scoreApplicant(applicant);
    let record = null;

    if (mongoose.connection.readyState === 1) {
      record = await Score.create({
        applicant,
        result,
        notes: req.body.notes || ""
      });
    }

    res.status(201).json({ applicant, result, record });
  } catch (error) {
    next(error);
  }
});

router.post("/india", async (req, res, next) => {
  try {
    const applicant = indiaLoanSchema.parse(req.body.applicant || req.body);
    const result = await scoreIndiaLoan(applicant);
    let record = null;

    if (mongoose.connection.readyState === 1) {
      record = await Score.create({
        applicant: { ...applicant, market: "India", product_family: "loan" },
        result,
        notes: req.body.notes || ""
      });
    }

    res.status(201).json({ applicant, result, record });
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.json({ items: [], total: 0, persistence: "disconnected" });
      return;
    }

    const limit = Math.min(Number(req.query.limit || 25), 100);
    const page = Math.max(Number(req.query.page || 1), 1);
    const filter = {};

    if (req.query.risk_tier) {
      filter["result.risk_tier"] = req.query.risk_tier;
    }
    if (req.query.decision) {
      filter["result.decision"] = req.query.decision;
    }

    const [items, total] = await Promise.all([
      Score.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Score.countDocuments(filter)
    ]);

    res.json({ items, total, page, limit, persistence: "connected" });
  } catch (error) {
    next(error);
  }
});

export default router;
