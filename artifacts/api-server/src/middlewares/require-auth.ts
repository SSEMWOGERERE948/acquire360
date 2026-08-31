import type { NextFunction, Request, Response } from "express";
import { SESSION_COOKIE_NAME, verifySession, type SessionPayload } from "../lib/auth";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: SessionPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  const payload = typeof token === "string" ? verifySession(token) : null;

  if (!payload) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  req.user = payload;
  next();
}
