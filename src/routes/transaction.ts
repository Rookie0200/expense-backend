import { Router } from "express";
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionStats,
  getOverview
} from "../handlers/transactionHandler";

import authMiddleware from "../middlewares/authMiddleware";

const router = Router();
router.use(authMiddleware);

// Transaction routes
router.get("/", getTransactions);
router.post("/add", addTransaction);
router.put("/update/:id", updateTransaction);
router.delete("/delete/:id", deleteTransaction);
router.get("/stats", getTransactionStats);
router.get("/overview",getOverview)

// Budget routes
// router.get("/budgets", getBudgets);
// router.post("/budgets", addBudget);
// router.put("/budgets/:id", updateBudget);
// router.delete("/budgets/:id", deleteBudget);

export default router;
