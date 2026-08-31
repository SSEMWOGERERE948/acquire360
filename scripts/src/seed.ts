import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function loadApiEnv() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const envPath = path.resolve(__dirname, "../../artifacts/api-server/.env");

  if (!fs.existsSync(envPath)) {
    return;
  }

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] ??= value;
  }
}

loadApiEnv();

const { db, pool } = await import("@workspace/db");
const {
  clients,
  companyProfiles,
  products,
  projects,
  services,
  teamMembers,
  users,
} = await import("@workspace/db/schema");

async function seedCompanyProfile() {
  const existing = await db.select({ id: companyProfiles.id }).from(companyProfiles).limit(1);
  if (existing.length > 0) {
    console.log("Skipping company profile — already seeded.");
    return;
  }

  await db.insert(companyProfiles).values({
    companyName: "Acquire 360 Ventures Ltd",
    tagline: "Reliable Procurement, Supply & Project Support Solutions",
    vision:
      "To continuously be a leading and trusted provider of procurement and supply solutions across Africa.",
    mission:
      "To deliver quality products and services efficiently, professionally and cost-effectively while exceeding client expectations.",
    about:
      "Acquire 360 Ventures Ltd is a Uganda-based procurement, supply and project support company. We work with NGOs, institutions, contractors and growing businesses across East Africa, sourcing everything from office furniture and PPE to construction materials and ICT equipment with a disciplined, accountable process from brief to delivery.",
    coreValues: ["Reliability", "Quality", "Professionalism", "Customer Satisfaction", "Efficiency"],
    phone: "+256 784208202",
    email: "procurement@acquire360ventures.com",
  });
  console.log("Seeded company profile.");
}

async function seedTeamMembers() {
  const existing = await db.select({ id: teamMembers.id }).from(teamMembers).limit(1);
  if (existing.length > 0) {
    console.log("Skipping team members — already seeded.");
    return;
  }

  await db.insert(teamMembers).values([
    {
      name: "Richard Tugume",
      position: "Director",
      bio: "Richard leads Acquire 360 Ventures with a focus on sustainable client partnerships and disciplined sourcing across the region.",
    },
    {
      name: "Christine Nangendo",
      position: "Director",
      bio: "Christine oversees operations and quality assurance, ensuring every engagement meets the standards our clients expect.",
    },
    {
      name: "Neema Bamurange",
      position: "Documentation Officer",
      bio: "Neema manages procurement documentation and compliance, keeping every transaction accurate and audit-ready.",
    },
    {
      name: "Trevor Simon Ssemwogerere",
      position: "Secretary",
      bio: "Trevor coordinates company records and client communications, supporting the team's day-to-day delivery.",
    },
  ]);
  console.log("Seeded team members.");
}

async function seedServices() {
  const existing = await db.select({ id: services.id }).from(services).limit(1);
  if (existing.length > 0) {
    console.log("Skipping services — already seeded.");
    return;
  }

  await db.insert(services).values([
    {
      title: "Office Furniture",
      description:
        "Ergonomic desks, chairs, cabinets and complete office fit-outs sourced from vetted manufacturers and distributors.",
      category: "Furniture",
      featured: true,
    },
    {
      title: "Personal Protective Equipment (PPE)",
      description:
        "Helmets, gloves, safety boots, reflective wear and full PPE kits for mining, construction and field operations.",
      category: "PPE",
      featured: true,
    },
    {
      title: "Uniforms & Promotional Items",
      description:
        "Branded staff uniforms, protective wear and promotional merchandise tailored to your organisation's identity.",
      category: "Uniforms",
      featured: true,
    },
    {
      title: "Stationery",
      description:
        "Everyday office stationery and bulk supply contracts for institutions, NGOs and corporate offices.",
      category: "Stationery",
      featured: false,
    },
    {
      title: "Computers & ICT Equipment",
      description:
        "Laptops, desktops, networking equipment and accessories from trusted brands, with after-sales support.",
      category: "ICT Equipment",
      featured: false,
    },
    {
      title: "Electrical & Plumbing Materials",
      description:
        "Cables, fittings, pipes and plumbing hardware for construction, maintenance and utility projects.",
      category: "Electrical Materials",
      featured: false,
    },
    {
      title: "Construction Materials",
      description:
        "Cement, aggregates, roofing and general construction supplies delivered reliably to project sites.",
      category: "Construction Materials",
      featured: false,
    },
  ]);
  console.log("Seeded services.");
}

async function seedProjects() {
  const existing = await db.select({ id: projects.id }).from(projects).limit(1);
  if (existing.length > 0) {
    console.log("Skipping projects — already seeded.");
    return;
  }

  await db.insert(projects).values([
    {
      title: "UNDP Moroto Mining Site",
      client: "UNDP",
      description:
        "Supply of personal protective equipment and on-site safety demonstrations for artisanal mining teams in Moroto.",
      category: "PPE Supply and Demonstrations",
      completionDate: "2025-03-14",
    },
    {
      title: "Kilimanjaro Telecom Company",
      client: "Kilimanjaro Telecom Company",
      description:
        "Full supply of ergonomic office furniture for a new regional office fit-out.",
      category: "Supply of Office Furniture",
      completionDate: "2025-05-22",
    },
    {
      title: "National Water and Sewerage Corporation",
      client: "National Water and Sewerage Corporation",
      description:
        "Supply of electrical parts, plumbing materials and PPE for utility maintenance operations.",
      category: "Electrical Parts, Plumbing Materials and PPE Supply",
      completionDate: "2025-07-09",
    },
    {
      title: "Makerere University",
      client: "Makerere University",
      description: "Supply of staff uniforms and protective wear across university facilities departments.",
      category: "Staff Uniforms and Protective Wear",
      completionDate: "2025-02-18",
    },
    {
      title: "ACTED Uganda",
      client: "ACTED Uganda",
      description: "Supply of general goods supporting field programme operations across northern Uganda.",
      category: "Supply of Goods",
      completionDate: "2024-11-30",
    },
    {
      title: "Winners Global Enterprises",
      client: "Winners Global Enterprises",
      description: "Supply of protective wear and branded promotional items for a corporate rollout.",
      category: "Protective Wear and Promotional Items",
      completionDate: "2025-06-04",
    },
  ]);
  console.log("Seeded projects.");
}

async function seedClients() {
  const existing = await db.select({ id: clients.id }).from(clients).limit(1);
  if (existing.length > 0) {
    console.log("Skipping clients — already seeded.");
    return;
  }

  await db.insert(clients).values([
    { name: "UNDP", description: "United Nations Development Programme" },
    { name: "Makerere University", description: "Uganda's leading public university" },
    { name: "Kilimanjaro Telecom", description: "Regional telecommunications provider" },
    {
      name: "National Water and Sewerage Corporation",
      description: "Uganda's national water utility",
    },
    { name: "ACTED", description: "International humanitarian and development NGO" },
    { name: "ZOA", description: "International relief and recovery NGO" },
    { name: "Winners Global Enterprises", description: "Corporate enterprise client" },
  ]);
  console.log("Seeded clients.");
}

async function seedProducts() {
  const existing = await db.select({ id: products.id }).from(products).limit(1);
  if (existing.length > 0) {
    console.log("Skipping products — already seeded.");
    return;
  }

  await db.insert(products).values([
    {
      name: "Safety Helmet (Class E)",
      description: "Impact and electrical hazard-rated hard hat for construction and mining sites.",
      category: "PPE",
      specifications: "Material: HDPE. Standard: ANSI Z89.1. Colours: White, yellow, orange.",
    },
    {
      name: "Reflective Safety Vest",
      description: "High-visibility vest for field and site work, day and night use.",
      category: "PPE",
      specifications: "Material: Polyester mesh. Class: 2. Sizes: S–XXL.",
    },
    {
      name: "Business Laptop 14\"",
      description: "Reliable business-grade laptop suited for office and field administration.",
      category: "ICT Equipment",
      specifications: "CPU: Intel Core i5. RAM: 8GB. Storage: 256GB SSD.",
    },
    {
      name: "Network Switch (24-Port)",
      description: "Managed switch for office and institutional network deployments.",
      category: "ICT Equipment",
      specifications: "Ports: 24 x Gigabit Ethernet. Rack-mountable.",
    },
    {
      name: "Executive Office Desk",
      description: "Durable laminate office desk with storage drawers.",
      category: "Furniture",
      specifications: "Dimensions: 140 x 70 x 75cm. Material: Melamine-faced board.",
    },
    {
      name: "Ergonomic Office Chair",
      description: "Adjustable-height mesh-back office chair for extended desk work.",
      category: "Furniture",
      specifications: "Adjustable height and armrests. Weight capacity: 120kg.",
    },
    {
      name: "PVC Conduit Pipe (25mm)",
      description: "Standard electrical conduit for cable routing and protection.",
      category: "Electrical Materials",
      specifications: "Diameter: 25mm. Length: 3m. Material: rigid PVC.",
    },
    {
      name: "Copper Wire Cable (2.5mm)",
      description: "Single-core copper cable for general electrical installation.",
      category: "Electrical Materials",
      specifications: "Cross-section: 2.5mm². Insulation: PVC.",
    },
    {
      name: "PPR Plumbing Pipe (20mm)",
      description: "Pressure-rated plumbing pipe for hot and cold water systems.",
      category: "Plumbing Materials",
      specifications: "Diameter: 20mm. Pressure rating: PN20.",
    },
    {
      name: "Gate Valve (1 inch)",
      description: "Brass gate valve for water supply and irrigation lines.",
      category: "Plumbing Materials",
      specifications: "Size: 1 inch. Material: brass body.",
    },
    {
      name: "Portland Cement (50kg)",
      description: "General-purpose cement for construction and civil works.",
      category: "Construction Materials",
      specifications: "Grade: 42.5N. Bag weight: 50kg.",
    },
    {
      name: "Reinforcement Bar (Y12)",
      description: "Deformed steel bar for reinforced concrete structures.",
      category: "Construction Materials",
      specifications: "Diameter: 12mm. Length: 12m. Grade: 460B.",
    },
    {
      name: "Branded Polo Shirt",
      description: "Company-branded uniform polo shirt, embroidered on request.",
      category: "Uniforms",
      specifications: "Material: 65/35 poly-cotton. Sizes: S–XXL.",
    },
    {
      name: "A4 Copy Paper (Ream)",
      description: "80gsm multipurpose printer and copier paper.",
      category: "Stationery",
      specifications: "Size: A4. Weight: 80gsm. Sheets per ream: 500.",
    },
  ]);
  console.log("Seeded products.");
}

async function seedAdminUser() {
  const existing = await db.select({ id: users.id }).from(users).limit(1);
  if (existing.length > 0) {
    console.log("Skipping admin user — already seeded.");
    return;
  }

  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@acquire360ventures.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await bcrypt.hash(password, 10);

  await db.insert(users).values({
    name: "Site Administrator",
    email: email.toLowerCase(),
    password: passwordHash,
    role: "admin",
  });

  console.log(`Seeded admin user "${email}".`);
  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.log(
      `  Using the default password "${password}" — set SEED_ADMIN_PASSWORD next time and change it immediately after first login.`,
    );
  }
}

async function main() {
  await seedCompanyProfile();
  await seedAdminUser();
  await seedTeamMembers();
  await seedServices();
  await seedProjects();
  await seedClients();
  await seedProducts();
}

main()
  .then(async () => {
    console.log("Seeding complete.");
    await pool.end();
  })
  .catch(async (err) => {
    console.error("Seeding failed:", err);
    await pool.end();
    process.exit(1);
  });
