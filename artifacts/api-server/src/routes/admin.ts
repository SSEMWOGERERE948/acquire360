import { asc, desc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  CreateClientBody,
  CreateClientResponse,
  CreateProductBody,
  CreateProductResponse,
  CreateProjectBody,
  CreateProjectResponse,
  CreateServiceBody,
  CreateServiceResponse,
  CreateTeamMemberBody,
  CreateTeamMemberResponse,
  DeleteClientParams,
  DeleteProductParams,
  DeleteProjectParams,
  DeleteServiceParams,
  DeleteTeamMemberParams,
  ListRfqsResponse,
  UpdateClientBody,
  UpdateClientParams,
  UpdateClientResponse,
  UpdateCompanyProfileBody,
  UpdateCompanyProfileResponse,
  UpdateProductBody,
  UpdateProductParams,
  UpdateProductResponse,
  UpdateProjectBody,
  UpdateProjectParams,
  UpdateProjectResponse,
  UpdateRfqStatusBody,
  UpdateRfqStatusParams,
  UpdateRfqStatusResponse,
  UpdateServiceBody,
  UpdateServiceParams,
  UpdateServiceResponse,
  UpdateTeamMemberBody,
  UpdateTeamMemberParams,
  UpdateTeamMemberResponse,
} from "@workspace/api-zod";
import { db } from "@workspace/db";
import {
  clients,
  companyProfiles,
  products,
  projects,
  rfqs,
  services,
  teamMembers,
} from "@workspace/db/schema";
import { logger } from "../lib/logger";
import { requireAuth } from "../middlewares/require-auth";

const router: IRouter = Router();
router.use(requireAuth);

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

router.put("/company", async (req, res) => {
  const parsed = UpdateCompanyProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please complete all company profile fields." });
    return;
  }

  try {
    const [existing] = await db
      .select({ id: companyProfiles.id })
      .from(companyProfiles)
      .orderBy(asc(companyProfiles.id))
      .limit(1);

    const [saved] = existing
      ? await db
          .update(companyProfiles)
          .set(parsed.data)
          .where(eq(companyProfiles.id, existing.id))
          .returning()
      : await db.insert(companyProfiles).values(parsed.data).returning();

    res.json(UpdateCompanyProfileResponse.parse(saved));
  } catch (err) {
    logger.error({ err }, "Failed to update company profile");
    res.status(500).json({ error: "Unable to update company profile" });
  }
});

// ---------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------
router.post("/services", async (req, res) => {
  const parsed = CreateServiceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please complete all required service fields." });
    return;
  }

  try {
    const [created] = await db.insert(services).values(parsed.data).returning();
    res.status(201).json(CreateServiceResponse.parse(created));
  } catch (err) {
    logger.error({ err }, "Failed to create service");
    res.status(500).json({ error: "Unable to create service" });
  }
});

router.put("/services/:id", async (req, res) => {
  const params = UpdateServiceParams.safeParse({ id: req.params.id });
  const body = UpdateServiceBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Please complete all required service fields." });
    return;
  }

  try {
    const [updated] = await db
      .update(services)
      .set(body.data)
      .where(eq(services.id, params.data.id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Service not found" });
      return;
    }
    res.json(UpdateServiceResponse.parse(updated));
  } catch (err) {
    logger.error({ err }, "Failed to update service");
    res.status(500).json({ error: "Unable to update service" });
  }
});

router.delete("/services/:id", async (req, res) => {
  const parsed = DeleteServiceParams.safeParse({ id: req.params.id });
  if (!parsed.success) {
    res.status(404).json({ error: "Service not found" });
    return;
  }

  try {
    const [deleted] = await db
      .delete(services)
      .where(eq(services.id, parsed.data.id))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Service not found" });
      return;
    }
    res.status(204).end();
  } catch (err) {
    logger.error({ err }, "Failed to delete service");
    res.status(500).json({ error: "Unable to delete service" });
  }
});

// ---------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------
router.post("/projects", async (req, res) => {
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please complete all required project fields." });
    return;
  }

  try {
    const [created] = await db
      .insert(projects)
      .values({
        ...parsed.data,
        completionDate: toDateString(parsed.data.completionDate),
        image: parsed.data.image ?? parsed.data.images?.[0] ?? null,
        images: parsed.data.images ?? [],
      })
      .returning();
    res.status(201).json(CreateProjectResponse.parse(created));
  } catch (err) {
    logger.error({ err }, "Failed to create project");
    res.status(500).json({ error: "Unable to create project" });
  }
});

router.put("/projects/:id", async (req, res) => {
  const params = UpdateProjectParams.safeParse({ id: req.params.id });
  const body = UpdateProjectBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Please complete all required project fields." });
    return;
  }

  try {
    const [updated] = await db
      .update(projects)
      .set({
        ...body.data,
        completionDate: toDateString(body.data.completionDate),
        image: body.data.image ?? body.data.images?.[0] ?? null,
        images: body.data.images ?? [],
      })
      .where(eq(projects.id, params.data.id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    res.json(UpdateProjectResponse.parse(updated));
  } catch (err) {
    logger.error({ err }, "Failed to update project");
    res.status(500).json({ error: "Unable to update project" });
  }
});

router.delete("/projects/:id", async (req, res) => {
  const parsed = DeleteProjectParams.safeParse({ id: req.params.id });
  if (!parsed.success) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  try {
    const [deleted] = await db
      .delete(projects)
      .where(eq(projects.id, parsed.data.id))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    res.status(204).end();
  } catch (err) {
    logger.error({ err }, "Failed to delete project");
    res.status(500).json({ error: "Unable to delete project" });
  }
});

// ---------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------
router.post("/products", async (req, res) => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please complete all required product fields." });
    return;
  }

  try {
    const [created] = await db.insert(products).values(parsed.data).returning();
    res.status(201).json(CreateProductResponse.parse(created));
  } catch (err) {
    logger.error({ err }, "Failed to create product");
    res.status(500).json({ error: "Unable to create product" });
  }
});

router.put("/products/:id", async (req, res) => {
  const params = UpdateProductParams.safeParse({ id: req.params.id });
  const body = UpdateProductBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Please complete all required product fields." });
    return;
  }

  try {
    const [updated] = await db
      .update(products)
      .set(body.data)
      .where(eq(products.id, params.data.id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(UpdateProductResponse.parse(updated));
  } catch (err) {
    logger.error({ err }, "Failed to update product");
    res.status(500).json({ error: "Unable to update product" });
  }
});

router.delete("/products/:id", async (req, res) => {
  const parsed = DeleteProductParams.safeParse({ id: req.params.id });
  if (!parsed.success) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  try {
    const [deleted] = await db
      .delete(products)
      .where(eq(products.id, parsed.data.id))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.status(204).end();
  } catch (err) {
    logger.error({ err }, "Failed to delete product");
    res.status(500).json({ error: "Unable to delete product" });
  }
});

// ---------------------------------------------------------------------
// Team members
// ---------------------------------------------------------------------
router.post("/team", async (req, res) => {
  const parsed = CreateTeamMemberBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please complete all required team member fields." });
    return;
  }

  try {
    const [created] = await db.insert(teamMembers).values(parsed.data).returning();
    res.status(201).json(CreateTeamMemberResponse.parse(created));
  } catch (err) {
    logger.error({ err }, "Failed to create team member");
    res.status(500).json({ error: "Unable to create team member" });
  }
});

router.put("/team/:id", async (req, res) => {
  const params = UpdateTeamMemberParams.safeParse({ id: req.params.id });
  const body = UpdateTeamMemberBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Please complete all required team member fields." });
    return;
  }

  try {
    const [updated] = await db
      .update(teamMembers)
      .set(body.data)
      .where(eq(teamMembers.id, params.data.id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Team member not found" });
      return;
    }
    res.json(UpdateTeamMemberResponse.parse(updated));
  } catch (err) {
    logger.error({ err }, "Failed to update team member");
    res.status(500).json({ error: "Unable to update team member" });
  }
});

router.delete("/team/:id", async (req, res) => {
  const parsed = DeleteTeamMemberParams.safeParse({ id: req.params.id });
  if (!parsed.success) {
    res.status(404).json({ error: "Team member not found" });
    return;
  }

  try {
    const [deleted] = await db
      .delete(teamMembers)
      .where(eq(teamMembers.id, parsed.data.id))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Team member not found" });
      return;
    }
    res.status(204).end();
  } catch (err) {
    logger.error({ err }, "Failed to delete team member");
    res.status(500).json({ error: "Unable to delete team member" });
  }
});

// ---------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------
router.post("/clients", async (req, res) => {
  const parsed = CreateClientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please complete all required client fields." });
    return;
  }

  try {
    const [created] = await db.insert(clients).values(parsed.data).returning();
    res.status(201).json(CreateClientResponse.parse(created));
  } catch (err) {
    logger.error({ err }, "Failed to create client");
    res.status(500).json({ error: "Unable to create client" });
  }
});

router.put("/clients/:id", async (req, res) => {
  const params = UpdateClientParams.safeParse({ id: req.params.id });
  const body = UpdateClientBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Please complete all required client fields." });
    return;
  }

  try {
    const [updated] = await db
      .update(clients)
      .set(body.data)
      .where(eq(clients.id, params.data.id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Client not found" });
      return;
    }
    res.json(UpdateClientResponse.parse(updated));
  } catch (err) {
    logger.error({ err }, "Failed to update client");
    res.status(500).json({ error: "Unable to update client" });
  }
});

router.delete("/clients/:id", async (req, res) => {
  const parsed = DeleteClientParams.safeParse({ id: req.params.id });
  if (!parsed.success) {
    res.status(404).json({ error: "Client not found" });
    return;
  }

  try {
    const [deleted] = await db
      .delete(clients)
      .where(eq(clients.id, parsed.data.id))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Client not found" });
      return;
    }
    res.status(204).end();
  } catch (err) {
    logger.error({ err }, "Failed to delete client");
    res.status(500).json({ error: "Unable to delete client" });
  }
});

// ---------------------------------------------------------------------
// RFQs (enquiries)
// ---------------------------------------------------------------------
router.get("/rfqs", async (req, res) => {
  try {
    const data = await db.select().from(rfqs).orderBy(desc(rfqs.createdAt));
    res.json(ListRfqsResponse.parse(data));
  } catch (err) {
    logger.error({ err }, "Failed to load enquiries");
    res.status(500).json({ error: "Unable to load enquiries" });
  }
});

router.patch("/rfqs/:id", async (req, res) => {
  const params = UpdateRfqStatusParams.safeParse({ id: req.params.id });
  const body = UpdateRfqStatusBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Please provide a valid status." });
    return;
  }

  try {
    const [updated] = await db
      .update(rfqs)
      .set({ status: body.data.status })
      .where(eq(rfqs.id, params.data.id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Enquiry not found" });
      return;
    }
    res.json(UpdateRfqStatusResponse.parse(updated));
  } catch (err) {
    logger.error({ err }, "Failed to update enquiry");
    res.status(500).json({ error: "Unable to update enquiry" });
  }
});

export default router;
