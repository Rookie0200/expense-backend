import { Request, Response } from "express";
import {getMonthStartEndDates} from "../config"
// import { Transaction } from "../models/budget";
import { Transaction } from "../models/transaction";
import {
  transactionQuerySchema,
  transactionSchema,
  transactionUpdateSchema,
} from "../types/transaction";
import mongoose from "mongoose";

//

export const getTransactions = async (req: Request, res: Response) => {
  try {
    // Validate query params
    const validatedQuery = transactionQuerySchema.safeParse(req.query);
    if (!validatedQuery.success) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // const { startDate, endDate, category, type, page, limit } =
    //   validatedQuery.data;
    const { startDate, endDate, category, type, page, limit, lastDate } =
      validatedQuery.data;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Build filter
    // const filter: any = { userId };
    // if (startDate || endDate) {
    //   filter.date = {};
    //   if (startDate) filter.date.$gte = new Date(startDate);
    //   if (endDate) filter.date.$lte = new Date(endDate);
    // }
    // if (category) filter.category = category;
    // if (type) filter.type = type;

    // // Pagination
    // const skip = (page - 1) * limit;

    // // Fetch transactions and total count in parallel
    // const [transactions, total] = await Promise.all([
    //   Transaction.find(filter)
    //     .sort({ date: -1, createdAt: -1 })
    //     .skip(skip)
    //     .limit(limit),
    //   Transaction.countDocuments(filter),
    // ]);

    // const totalPages = Math.ceil(total / limit);

    // res.json({
    //   success: true,
    //   data: {
    //     transactions,
    //     pagination: {
    //       currentPage: page,
    //       totalPages,
    //       totalItems: total,
    //       itemsPerPage: limit,
    //     },
    //   },
    // });
    const filter: any = { userId };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (category) filter.category = category;
    if (type) filter.type = type;

    // Cursor-based pagination (preferred over skip/limit)
    if (lastDate) {
      filter.date = { ...(filter.date || {}), $lt: new Date(lastDate) };
    }

    // Fetch transactions
    const transactions = await Transaction.find(filter, {
      amount: 1,
      description: 1,
      date: 1,
      type: 1,
      category: 1,
      createdAt: 1,
    })
      .sort({ date: -1, createdAt: -1 })
      .limit(limit + 1) // fetch one extra to check if next page exists
      .lean();

    // if (!transactions) {
    //   return res.status(401).json({ error: "No transaction data !!" });
    // }
    const hasNextPage = transactions.length > limit;
    if (hasNextPage) transactions.pop(); // remove extra doc

    // Count only if you really need total pages
    const totalItems = await Transaction.countDocuments(filter);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          currentPage: page,
          itemsPerPage: limit,
          totalItems,
          hasNextPage,
          nextCursor:
            transactions.length > 0
              ? transactions[transactions.length - 1]?.date
              : null,
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

export const getOverview = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.userId; // Assuming user is authenticated and ID is available
    const { date } = req.query; // Expecting 'YYYY-MM' format, e.g., '2025-10'

    if (!date) {
      return res
        .status(400)
        .json({ message: "Date query parameter (YYYY-MM) is required." });
    }

    const { startDate, endDate } = getMonthStartEndDates(date as string);

    // 1. Calculate Total Income and Total Expenses for the current month
    const monthlyStats = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$type",
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          type: "$_id",
          totalAmount: 1,
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpenses = 0;

    monthlyStats.forEach((stat) => {
      if (stat.type === "income") {
        totalIncome = stat.totalAmount;
      } else if (stat.type === "expense") {
        // Assuming expenses are stored as positive numbers in the DB
        totalExpenses = stat.totalAmount;
      }
    });

    // 2. Calculate Opening Balance: Sum of all transactions BEFORE the start of the current month
    const previousBalanceResult = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          date: { $lt: startDate }, // Transactions before the current month
        },
      },
      {
        $group: {
          _id: null,
          netBalance: {
            $sum: {
              $cond: [
                { $eq: ["$type", "income"] },
                "$amount",
                { $multiply: ["$amount", -1] }, // Subtract expenses
              ],
            },
          },
        },
      },
    ]);

    // Add a mock initial balance if no prior transactions exist
    const MOCK_INITIAL_SEED_BALANCE = 5000;
    const priorNetBalance =
      previousBalanceResult.length > 0
        ? previousBalanceResult[0].netBalance
        : 0;

    const openingBalance = MOCK_INITIAL_SEED_BALANCE + priorNetBalance;

    // 3. Calculate Closing Balance
    const closingBalance = openingBalance + totalIncome - totalExpenses;

    return res.json({
      data: {
        openingBalance,
        totalIncome,
        totalExpenses,
        closingBalance,
        month: startDate.toISOString().substring(0, 7), // YYYY-MM
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch dashboard statistics." });
  }
};
