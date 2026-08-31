import { Router, type IRouter } from "express";
import healthRouter from "./health";
import contentRouter from "./content";
import authRouter from "./auth";
import adminRouter from "./admin";
import mediaRouter from "./media";

const router: IRouter = Router();

router.use(healthRouter);
router.use(contentRouter);
router.use(authRouter);
router.use(adminRouter);
router.use(mediaRouter);

export default router;
