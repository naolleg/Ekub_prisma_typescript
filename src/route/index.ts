import { Router } from "express";
const appRouter = Router();
//import all routes
import categoryRouter from "../api/category/categoryRoute.js";
import userRouter from "../api/user/userRoute.js";
import lotRouter from "../api/lot/lotRoute.js";
import depositRouter from "../api/deposit/depositRoute.js";
import loanRouter from "../api/loan/loanRoute.js";
import winnerRouter from "../api/winner/winnerRoute.js";
import reportRouter from "../api/analyticReport/reportRoute.js";
//add to app route
appRouter.use("/category", (req, res, next) => {
    console.log("Inside categoryRouter middleware");
    categoryRouter(req, res, next);
  });
appRouter.use("/user", userRouter);
appRouter.use("/lot", lotRouter);
appRouter.use("/deposit", depositRouter);
appRouter.use("/loan", loanRouter);
appRouter.use("/winner", winnerRouter);
appRouter.use("/report",reportRouter)
export default appRouter;
