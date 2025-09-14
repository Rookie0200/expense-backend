import express from "express";
import authRoute from "./authRoute";
import transactionRoute from "./transaction";
import budgetRoute from "./budget";
const router = express.Router();
router.use("/auth", authRoute);
router.use("/transactions", transactionRoute);
router.use("/budget", budgetRoute);

export default router;
