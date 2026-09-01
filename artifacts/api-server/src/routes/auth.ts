import { eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { GetCurrentUserResponse, LoginBody, LoginResponse } from "@workspace/api-zod";
import { db } from "@workspace/db";
import { users } from "@workspace/db/schema";
import {
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
  signSession,
  verifyPassword,
} from "../lib/auth";
import { logger } from "../lib/logger";
import { requireAuth } from "../middlewares/require-auth";

const router: IRouter = Router();

router.post("/auth/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, parsed.data.email.toLowerCase()))
      .limit(1);

    const valid = user ? await verifyPassword(parsed.data.password, user.password) : false;
    if (!user || !valid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = signSession({ sub: user.id, email: user.email, role: user.role });
    res.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions());
    res.json(
      LoginResponse.parse({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }),
    );
  } catch (err) {
    logger.error({ err }, "Login failed");
    res.status(401).json({ error: "Invalid email or password" });
  }
});

router.post("/auth/logout", requireAuth, (req, res) => {
  res.clearCookie(SESSION_COOKIE_NAME, sessionCookieOptions());
  res.status(204).end();
});

router.get("/auth/me", requireAuth, async (req, res) => {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user!.sub))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    res.json(
      GetCurrentUserResponse.parse({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }),
    );
  } catch (err) {
    logger.error({ err }, "Failed to load current user");
    res.status(401).json({ error: "Authentication required" });
  }
});

export default router;
