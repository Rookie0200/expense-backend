import { Request, Response } from "express";
// import { Transaction } from "../models/budget";
import { Transaction } from "../models/transaction";
import {
  transactionQuerySchema,
  transactionSchema,
  transactionUpdateSchema,
} from "../types/transaction";

//

export const getTransactions = async (req: Request, res: Response) => {
  try {
    // Validate query params
    const validatedQuery = transactionQuerySchema.safeParse(req.query);
    if (!validatedQuery.success) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { startDate, endDate, category, type, page, limit } =
      validatedQuery.data;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Build filter
    const filter: any = { userId };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (category) filter.category = category;
    if (type) filter.type = type;

    // Pagination
    const skip = (page - 1) * limit;

    // Fetch transactions and total count in parallel
    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};

export const addTransaction = async (req: Request, res: Response) => {
  try {
    const validatedData = transactionSchema.safeParse(req.body);
    console.log("Adding transaction with body:", validatedData.data);
    if (!validatedData.success) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    console.log("Creating transaction for user:", userId);
    const transaction = new Transaction({
      userId: userId,
      amount: validatedData.data.amount,
      description: validatedData.data.description,
      date: validatedData.data.date,
      type: validatedData.data.type,
      category: validatedData.data.category,
    });
    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ error: "Failed to add transaction" });
  }
};

export const updateTransaction = async (req: Request, res: Response) => {
  const { id } = req.params;
  const validatedData = transactionUpdateSchema.safeParse({
    ...req.body,
    id,
  });

  const transaction = await Transaction.findOneAndUpdate(
    { _id: id, userId: req.userId },
    validatedData,
    { new: true, runValidators: true }
  );

  if (!transaction) {
    res.send(404).json({ message: "Transaction not found" });
  }

  res.json({
    success: true,
    message: "Transaction updated successfully",
    data: { transaction },
  });
};

export const deleteTransaction = async (req: Request, res: Response) => {
  const { id } = req.params;

  const transaction = await Transaction.findOneAndDelete({
    _id: id,
    userId: req.userId,
  });

  if (!transaction) {
    res.send(404).json({ message: "Transaction not found" });
  }

  res.json({
    success: true,
    message: "Transaction deleted successfully",
  });
};

export const getTransactionStats = async (req: Request, res: Response) => {
  const userId = req.userId;

  const stats = await Transaction.aggregate([
    { $match: { userId: userId } },
    {
      $group: {
        _id: "$type",
        total: { $sum: { $abs: "$amount" } },
        count: { $sum: 1 },
        avgAmount: { $avg: { $abs: "$amount" } },
      },
    },
  ]);

  const categoryStats = await Transaction.aggregate([
    { $match: { userId: userId, type: "expense" } },
    {
      $group: {
        _id: "$category",
        total: { $sum: { $abs: "$amount" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);

  res.json({
    success: true,
    data: {
      typeStats: stats,
      categoryStats,
    },
  });
};
