import express, { type Express } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "node:path";
import router from "./routes";
import { logger } from "./lib/logger";
import { getObjectStream } from "./lib/storage";

const app: Express = express();

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
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.resolve(process.cwd(), "public/uploads")));
app.get(/^\/uploads\/(.+)$/, async (req, res) => {
  const key = req.params[0];

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
    req.log.error({ err, key }, "Failed to serve uploaded object");
    res.status(404).end();
  }
});

app.use("/api", router);

export default app;
