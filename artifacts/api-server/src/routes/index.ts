import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import contentRouter from "./content.js";
import authRouter from "./auth.js";
import adminRouter from "./admin.js";
import mediaRouter from "./media.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(contentRouter);
router.use(authRouter);
router.use(adminRouter);
router.use(mediaRouter);

export default router;
