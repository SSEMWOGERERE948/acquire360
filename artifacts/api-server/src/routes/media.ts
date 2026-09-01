import { asc, count, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { DeleteMediaParams, ListMediaResponse, UploadMediaResponse } from "@workspace/api-zod";
import { db } from "@workspace/db";
import { mediaAssets } from "@workspace/db/schema";
import { requireAuth } from "../middlewares/require-auth";
import { assetKindFor, MAX_IMAGES, upload } from "../lib/upload";
import { logger } from "../lib/logger";
import { deleteObject, publicUrlForObject, publicUrlForStoredUrl, uploadObject } from "../lib/storage";

const router: IRouter = Router();

router.get("/media", requireAuth, async (req, res) => {
  try {
    const data = await db.select().from(mediaAssets).orderBy(asc(mediaAssets.id));
    res.json(
      ListMediaResponse.parse(
        data.map((asset) => ({
          ...asset,
          url: publicUrlForObject(asset.objectKey, publicUrlForStoredUrl(asset.url) ?? asset.url),
        })),
      ),
    );
  } catch (err) {
    logger.error({ err }, "Failed to load media assets");
    res.status(500).json({ error: "Unable to load media assets" });
  }
});

router.post("/media", requireAuth, upload.single("file"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No file was uploaded" });
    return;
  }

  const kind = assetKindFor(req.file.mimetype);

  try {
    if (kind === "image") {
      const [{ value: imageCount }] = await db
        .select({ value: count() })
        .from(mediaAssets)
        .where(eq(mediaAssets.kind, "image"));

      if (Number(imageCount) >= MAX_IMAGES) {
        res.status(400).json({
          error: `Image limit reached (${MAX_IMAGES}/${MAX_IMAGES}). Delete an existing image from the media library before uploading a new one.`,
        });
        return;
      }
    }

    const uploaded = await uploadObject(req.file.buffer, req.file.originalname, req.file.mimetype, "media");

    const [created] = await db
      .insert(mediaAssets)
      .values({
        filename: req.file.originalname,
        url: uploaded.url,
        objectKey: uploaded.key,
        mimeType: req.file.mimetype,
        size: req.file.size,
        kind,
      })
      .returning();
    res.status(201).json(UploadMediaResponse.parse(created));
  } catch (err) {
    logger.error({ err }, "Failed to save media asset");
    res.status(500).json({ error: "Unable to save uploaded file" });
  }
});

router.delete("/media/:id", requireAuth, async (req, res) => {
  const parsed = DeleteMediaParams.safeParse({ id: req.params.id });
  if (!parsed.success) {
    res.status(404).json({ error: "Media asset not found" });
    return;
  }

  try {
    const [deleted] = await db
      .delete(mediaAssets)
      .where(eq(mediaAssets.id, parsed.data.id))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Media asset not found" });
      return;
    }

    await deleteObject(deleted.objectKey).catch((err) => {
      logger.error({ err }, "Failed to delete media object");
    });
    res.status(204).end();
  } catch (err) {
    logger.error({ err }, "Failed to delete media asset");
    res.status(500).json({ error: "Unable to delete media asset" });
  }
});

export default router;
