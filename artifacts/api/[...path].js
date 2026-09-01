module.exports = async function handler(req, res) {
  if (typeof req.url === "string" && !req.url.startsWith("/api") && !req.url.startsWith("/uploads")) {
    req.url = `/api${req.url.startsWith("/") ? req.url : `/${req.url}`}`;
  }

  const { requestListener } = await import("../api-server/dist/app.mjs");
  requestListener(req, res);
};
