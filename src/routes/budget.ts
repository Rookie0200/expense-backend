import { Router } from "express";
import {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
  getBudgetVsActual,
} from "../handlers/budgetHandler";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware); // All budget routes require authentication

router.post("/add", createBudget);
router.get("/", getBudgets);
router.get("/vs", getBudgetVsActual);
router.put("/update/:id", updateBudget);
router.delete("/delete/:id", deleteBudget);

export default router;
