import mongoose, { Document, Schema } from "mongoose";

export interface ITransaction extends Document {
  amount: number;
  description: string;
  date: Date;
  type: "income" | "expense";
  category?: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    amount: {
      type: Number,
      required: true,
      validate: {
        validator: function (v: number) {
          return v !== 0;
        },
        message: "Amount cannot be zero",
      },
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["income", "expense"],
    },
    category: {
      type: String,
      enum: [
        "Food",
        "Bills",
        "Transport",
        "Shopping",
        "Entertainment",
        "Healthcare",
        "Education",
        "Other",
      ],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// transactionSchema.index({ userId: 1, date: -1 });
// transactionSchema.index({ userId: 1, category: 1 });
// transactionSchema.index({ userId: 1, type: 1 });
// Add this in your schema setup:
transactionSchema.index({
  userId: 1,
  date: -1,
  createdAt: -1,
  category: 1,
  type: 1,
});

export const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema
);
