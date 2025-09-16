import { z } from "zod";

export const transactionSchema = z.object({
  amount: z.number().refine((val) => val !== 0, "Amount cannot be zero"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(200, "Description too long"),
  date: z.string().datetime("Invalid date format"),
  type: z.enum(["income", "expense"]),
  category: z
    .enum([
      "Food",
      "Bills",
      "Transport",
      "Shopping",
      "Entertainment",
      "Healthcare",
      "Education",
      "Other",
    ])
    .optional(),
  userId: z.string().min(1, "User ID is required"),
});

export const transactionUpdateSchema = transactionSchema.partial().extend({
  id: z.string().min(1, "Transaction ID is required"),
});

export const transactionQuerySchema = z.object({
  // userId: z.string().min(1),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  category: z.string().optional(),
  type: z.enum(["income", "expense"]).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type Transaction = z.infer<typeof transactionSchema>;
export type TransactionUpdate = z.infer<typeof transactionUpdateSchema>;
export type TransactionQuery = z.infer<typeof transactionQuerySchema>;
