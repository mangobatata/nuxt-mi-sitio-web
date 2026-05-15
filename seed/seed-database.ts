import "dotenv/config";
import { randomUUID } from "node:crypto";

import prisma from "../lib/prisma.ts";
import { products } from "./products.seed.ts";
import { siteReviews } from "./site-review.seed.ts";

function generateSlug(name: string) {
  const id = randomUUID().slice(0, 6);

  const nameSlug = name
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return `${id}-${nameSlug}`;
}

async function seedDatabase() {
  // Purgar base de datos
  await prisma.siteReview.deleteMany();
  await prisma.product.deleteMany();

  // Insertar reviews
  await prisma.siteReview.createMany({
    data: siteReviews,
  });

  // Insertar productos con slug generado automáticamente
  await prisma.product.createMany({
    data: products.map((product) => ({
      ...product,
      slug: generateSlug(product.name),
    })),
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