import mongoose, { Document, Schema } from 'mongoose';

export interface IBudget extends Document {
  category: string;
  amount: number;
  month: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const budgetSchema = new Schema<IBudget>({
  category: {
    type: String,
    required: true,
    enum: ['Food', 'Bills', 'Transport', 'Shopping', 'Entertainment', 'Healthcare', 'Education', 'Other'],
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01,
  },
  month: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}$/,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Compound unique index to prevent duplicate category budgets for same month/user
budgetSchema.index({ userId: 1, category: 1, month: 1 }, { unique: true });

export const Budget = mongoose.model<IBudget>('Budget', budgetSchema);