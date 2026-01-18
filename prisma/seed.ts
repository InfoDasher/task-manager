import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clean existing data
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleaned existing data");

  // Create demo user
  const hashedPassword = await bcrypt.hash("password123", 12);
  const demoUser = await prisma.user.create({
    data: {
      email: "demo@example.com",
      password: hashedPassword,
      name: "Demo User",
    },
  });

  console.log("👤 Created demo user: demo@example.com / password123");

  // Create projects
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: "Website Redesign",
        description: "Complete overhaul of the company website with modern design principles and improved UX.",
        status: "ACTIVE",
        userId: demoUser.id,
      },
    }),
    prisma.project.create({
      data: {
        name: "Mobile App Development",
        description: "Native mobile application for iOS and Android platforms.",
        status: "ACTIVE",
        userId: demoUser.id,
      },
    }),
    prisma.project.create({
      data: {
        name: "API Integration",
        description: "Integrate third-party APIs for payment processing and analytics.",
        status: "ACTIVE",
        userId: demoUser.id,
      },
    }),
    prisma.project.create({
      data: {
        name: "Legacy System Migration",
        description: "Migrate data and functionality from legacy systems to new platform.",
        status: "ARCHIVED",
        userId: demoUser.id,
      },
    }),
    prisma.project.create({
      data: {
        name: "Q4 Marketing Campaign",
        description: "Digital marketing campaign for Q4 product launch.",
        status: "COMPLETED",
        userId: demoUser.id,
      },
    }),
  ]);

  console.log(`📁 Created ${projects.length} projects`);

  // Create tasks for each project
  const tasksData = [
    // Website Redesign tasks
    { projectIndex: 0, title: "Design new homepage mockup", status: "DONE", priority: "HIGH" },
    { projectIndex: 0, title: "Implement responsive navigation", status: "IN_PROGRESS", priority: "HIGH" },
    { projectIndex: 0, title: "Create component library", status: "IN_PROGRESS", priority: "MEDIUM" },
    { projectIndex: 0, title: "Set up CI/CD pipeline", status: "TODO", priority: "MEDIUM" },
    { projectIndex: 0, title: "Write unit tests", status: "TODO", priority: "LOW" },
    { projectIndex: 0, title: "Performance optimization", status: "TODO", priority: "MEDIUM" },

    // Mobile App tasks
    { projectIndex: 1, title: "Set up React Native project", status: "DONE", priority: "HIGH" },
    { projectIndex: 1, title: "Implement authentication flow", status: "DONE", priority: "HIGH" },
    { projectIndex: 1, title: "Build dashboard screen", status: "IN_PROGRESS", priority: "HIGH" },
    { projectIndex: 1, title: "Integrate push notifications", status: "TODO", priority: "MEDIUM" },
    { projectIndex: 1, title: "Add offline support", status: "TODO", priority: "LOW" },

    // API Integration tasks
    { projectIndex: 2, title: "Research payment gateway options", status: "DONE", priority: "HIGH" },
    { projectIndex: 2, title: "Implement Stripe integration", status: "IN_PROGRESS", priority: "HIGH" },
    { projectIndex: 2, title: "Set up analytics tracking", status: "TODO", priority: "MEDIUM" },
    { projectIndex: 2, title: "Create webhook handlers", status: "TODO", priority: "HIGH" },

    // Legacy Migration tasks
    { projectIndex: 3, title: "Document existing system", status: "DONE", priority: "HIGH" },
    { projectIndex: 3, title: "Create data migration scripts", status: "DONE", priority: "HIGH" },
    { projectIndex: 3, title: "Run migration dry run", status: "DONE", priority: "MEDIUM" },

    // Marketing Campaign tasks
    { projectIndex: 4, title: "Create campaign strategy", status: "DONE", priority: "HIGH" },
    { projectIndex: 4, title: "Design social media assets", status: "DONE", priority: "HIGH" },
    { projectIndex: 4, title: "Launch email campaign", status: "DONE", priority: "HIGH" },
    { projectIndex: 4, title: "Analyze campaign results", status: "DONE", priority: "MEDIUM" },
  ];

  const tasks = await Promise.all(
    tasksData.map((task) =>
      prisma.task.create({
        data: {
          title: task.title,
          description: `Task description for: ${task.title}`,
          status: task.status as "TODO" | "IN_PROGRESS" | "DONE",
          priority: task.priority as "LOW" | "MEDIUM" | "HIGH",
          projectId: projects[task.projectIndex].id,
          dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000), // Random due date within 30 days
        },
      }),
    ),
  );

  console.log(`✅ Created ${tasks.length} tasks`);

  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📋 Login credentials:");
  console.log("   Email: demo@example.com");
  console.log("   Password: password123\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
