import "dotenv/config";
import prisma from "../lib/prisma.ts";
import { siteReviews } from "./site-review.seed.ts";

async function seedDatabase() {
  // Purgar base de datos
  await prisma.siteReview.deleteMany();

  // Insertar registros
  await prisma.siteReview.createMany({
    data: siteReviews,
  });

  console.log("Database seeded successfully");
}

seedDatabase()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
