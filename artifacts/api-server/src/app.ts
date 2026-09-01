import express = require("express");
import type { NextFunction, Request, RequestHandler, Response } from "express";
import cookieParser = require("cookie-parser");
import cors = require("cors");
import pinoHttp = require("pino-http");
import path from "node:path";
import type { RequestListener } from "node:http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import { getObjectStream } from "./lib/storage.js";

const app = express();

app.disable("etag");

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(
  cors({
    origin: process.env.WEB_ORIGIN?.split(",").map((origin) => origin.trim()) ?? true,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const noStoreApiResponses: RequestHandler = (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.setHeader("Cache-Control", "no-store");
  next();
};

app.use("/api", noStoreApiResponses);
app.use("/uploads", express.static(path.resolve(process.cwd(), "public/uploads")));
const serveUploadedObject: RequestHandler = async (req: Request, res: Response) => {
  const key = (req.params as Record<string, string | undefined>)["0"];
  if (!key) {
    res.status(404).end();
    return;
  }

  try {
    const object = await getObjectStream(key);
    if (object.contentType) {
      res.type(object.contentType);
    }
    if (object.contentLength !== undefined) {
      res.setHeader("Content-Length", object.contentLength);
    }
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    object.body.pipe(res);
  } catch (err) {
    logger.error({ err, key }, "Failed to serve uploaded object");
    res.status(404).end();
  }
};

app.get(/^\/uploads\/(.+)$/, serveUploadedObject);
app.get(/^\/api\/uploads\/(.+)$/, serveUploadedObject);

app.use("/api", router);

export const requestListener: RequestListener = (req, res) => {
  (app as unknown as { handle: RequestListener }).handle(req, res);
};

export default app;
