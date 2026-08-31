import { and, asc, count, eq, ilike, or } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  CreateRfqBody,
  CreateRfqResponse,
  GetCompanyProfileResponse,
  GetContentSummaryResponse,
  ListClientsResponse,
  ListProductsQueryParams,
  ListProductsResponse,
  ListProjectsResponse,
  ListServicesResponse,
  ListTeamMembersResponse,
  UploadRfqAttachmentResponse,
} from "@workspace/api-zod";
import { db } from "@workspace/db";
import {
  clients,
  companyProfiles,
  insertRfqSchema,
  products,
  projects,
  rfqs,
  services,
  teamMembers,
} from "@workspace/db/schema";
import { upload } from "../lib/upload";
import { publicUrlForStoredUrl, uploadObject } from "../lib/storage";

const router: IRouter = Router();

router.get("/company", async (req, res) => {
  try {
    const [profile] = await db
      .select()
      .from(companyProfiles)
      .orderBy(asc(companyProfiles.id))
      .limit(1);

    if (!profile) {
      res.status(404).json({ error: "Company profile not found" });
      return;
    }

    res.json(GetCompanyProfileResponse.parse(profile));
  } catch (err) {
    req.log.error({ err }, "Failed to load company profile");
    res.status(500).json({ error: "Unable to load company profile" });
  }
});

router.get("/services", async (req, res) => {
  try {
    const data = await db.select().from(services).orderBy(asc(services.id));
    res.json(ListServicesResponse.parse(data.map((item) => ({ ...item, image: publicUrlForStoredUrl(item.image) }))));
  } catch (err) {
    req.log.error({ err }, "Failed to load services");
    res.status(500).json({ error: "Unable to load services" });
  }
});

router.get("/projects", async (req, res) => {
  try {
    const data = await db.select().from(projects).orderBy(asc(projects.id));
    res.json(ListProjectsResponse.parse(data.map((item) => ({ ...item, image: publicUrlForStoredUrl(item.image) }))));
  } catch (err) {
    req.log.error({ err }, "Failed to load projects");
    res.status(500).json({ error: "Unable to load projects" });
  }
});

router.get("/products", async (req, res) => {
  try {
    const parsed = ListProductsQueryParams.parse({
      search: typeof req.query.search === "string" ? req.query.search : undefined,
      category:
        typeof req.query.category === "string" ? req.query.category : undefined,
    });
    const filters = [];

    if (parsed.category) {
      filters.push(eq(products.category, parsed.category));
    }
    if (parsed.search) {
      filters.push(
        or(
          ilike(products.name, `%${parsed.search}%`),
          ilike(products.description, `%${parsed.search}%`),
        ),
      );
    }

    const data = await db
      .select()
      .from(products)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(asc(products.id));
    res.json(
      ListProductsResponse.parse(
        data.map((item) => ({
          ...item,
          image: publicUrlForStoredUrl(item.image),
          datasheet: publicUrlForStoredUrl(item.datasheet),
        })),
      ),
    );
  } catch (err) {
    req.log.error({ err }, "Failed to load products");
    res.status(500).json({ error: "Unable to load products" });
  }
});

router.get("/team", async (req, res) => {
  try {
    const data = await db.select().from(teamMembers).orderBy(asc(teamMembers.id));
    res.json(ListTeamMembersResponse.parse(data.map((item) => ({ ...item, image: publicUrlForStoredUrl(item.image) }))));
  } catch (err) {
    req.log.error({ err }, "Failed to load team");
    res.status(500).json({ error: "Unable to load team" });
  }
});

router.get("/clients", async (req, res) => {
  try {
    const data = await db.select().from(clients).orderBy(asc(clients.id));
    res.json(ListClientsResponse.parse(data.map((item) => ({ ...item, logo: publicUrlForStoredUrl(item.logo) }))));
  } catch (err) {
    req.log.error({ err }, "Failed to load clients");
    res.status(500).json({ error: "Unable to load clients" });
  }
});

router.get("/summary", async (req, res) => {
  try {
    const [serviceCount, projectCount, productCount, clientCount, rfqCount] =
      await Promise.all([
        db.select({ value: count() }).from(services),
        db.select({ value: count() }).from(projects),
        db.select({ value: count() }).from(products),
        db.select({ value: count() }).from(clients),
        db.select({ value: count() }).from(rfqs),
      ]);
    res.json(
      GetContentSummaryResponse.parse({
        services: Number(serviceCount[0]?.value ?? 0),
        projects: Number(projectCount[0]?.value ?? 0),
        products: Number(productCount[0]?.value ?? 0),
        clients: Number(clientCount[0]?.value ?? 0),
        rfqs: Number(rfqCount[0]?.value ?? 0),
      }),
    );
  } catch (err) {
    req.log.error({ err }, "Failed to load content summary");
    res.status(500).json({ error: "Unable to load content summary" });
  }
});

router.post("/rfqs/attachments", upload.single("file"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No file was uploaded" });
    return;
  }

  try {
    const uploaded = await uploadObject(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      "rfq-attachments",
    );
    res.status(201).json(UploadRfqAttachmentResponse.parse({ url: uploaded.url }));
  } catch (err) {
    req.log.error({ err }, "Failed to upload RFQ attachment");
    res.status(400).json({ error: "Unable to upload the file. Please try again." });
  }
});

router.post("/rfqs", async (req, res) => {
  const parsed = CreateRfqBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please complete all required quote fields." });
    return;
  }

  try {
    const input = insertRfqSchema.parse({
      ...parsed.data,
      file: parsed.data.file ?? null,
    });
    const [created] = await db.insert(rfqs).values(input).returning();
    res.status(201).json(CreateRfqResponse.parse(created));
  } catch (err) {
    req.log.error({ err }, "Failed to create RFQ");
    res.status(500).json({ error: "Unable to submit quote request" });
  }
});

export default router;
