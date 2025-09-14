import { Request, Response } from "express";
import { Budget } from "../models/budget";
import { Transaction } from "../models/transaction";
import { budgetSchema, budgetUpdateSchema } from "../types/budget";

export const createBudget = async (req: Request, res: Response) => {
  try {
    const validatedData = budgetSchema.safeParse({
      ...req.body,
      userId: req.userId,
    });
    if (!validatedData.success) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    const budget = await Budget.create(validatedData.data);

    res.status(201).json({
      success: true,
      message: "Budget created successfully",
      data: { budget },
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating budget", error });
  }
};

export const getBudgets = async (req: Request, res: Response) => {
  try {
    const { month } = req.query;
    const userId = req.userId;

    const filter: any = { userId };
    if (month) filter.month = month;

    const budgets = await Budget.find(filter).sort({ category: 1 });

    res.json({
      success: true,
      data: { budgets },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching budgets", error });
  }
};

export const updateBudget = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = budgetUpdateSchema.safeParse({
      ...req.body,
      id,
    });

    const budget = await Budget.findOneAndUpdate(
      { _id: id, userId: req.userId },
      validatedData.data,
      { new: true, runValidators: true }
    );

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    res.json({
      success: true,
      message: "Budget updated successfully",
      data: { budget },
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating budget", error });
  }
};

export const deleteBudget = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const budget = await Budget.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    res.json({
      success: true,
      message: "Budget deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting budget", error });
  }
};

export const getBudgetVsActual = async (req: Request, res: Response) => {
  try {
    const { month } = req.query as { month: string };
    const userId = req.userId;

    if (!month) {
      return res.status(400).json({ message: "Month parameter is required" });
    }

    // Get budgets for the month
    const budgets = await Budget.find({ userId, month });

    // Get actual spending for the month
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      0
    );

    const actualSpending = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          type: "expense",
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: { $abs: "$amount" } },
        },
      },
    ]);

    // Create spending map
    const spendingMap = new Map();
    actualSpending.forEach((item) => {
      spendingMap.set(item._id, item.total);
    });

    // Compare budget vs actual
    const comparison = budgets.map((budget) => {
      const actual = spendingMap.get(budget.category) || 0;
      const percentage = budget.amount > 0 ? (actual / budget.amount) * 100 : 0;

      let status: "under" | "over" | "on-track" = "on-track";
      if (percentage > 100) status = "over";
      else if (percentage < 80) status = "under";

      return {
        category: budget.category,
        budgetAmount: budget.amount,
        actualAmount: actual,
        percentage: Math.round(percentage * 100) / 100,
        status,
      };
    });

    res.json({
      success: true,
      data: { comparison },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching budget vs actual", error });
  }
};
