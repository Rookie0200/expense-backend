import { z } from 'zod';

export const budgetSchema = z.object({
  category: z.enum([
    'Food', 'Bills', 'Transport', 'Shopping', 'Entertainment', 
    'Healthcare', 'Education', 'Other'
  ]),
  amount: z.number().positive('Budget amount must be positive'),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
  userId: z.string().min(1, 'User ID is required'),
});

export const budgetUpdateSchema = budgetSchema.partial().extend({
  id: z.string().min(1, 'Budget ID is required'),
});

export type Budget = z.infer<typeof budgetSchema>;
export type BudgetUpdate = z.infer<typeof budgetUpdateSchema>;