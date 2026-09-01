import { requestListener } from "../../api-server/src/app.js";

export default function handler(req: any, res: any) {
  if (typeof req.url === "string" && !req.url.startsWith("/api") && !req.url.startsWith("/uploads")) {
    req.url = `/api${req.url.startsWith("/") ? req.url : `/${req.url}`}`;
  }

  requestListener(req, res);
}
