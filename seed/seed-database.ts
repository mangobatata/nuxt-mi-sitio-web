import "dotenv/config";
import { randomUUID } from "node:crypto";
import argon2 from "argon2";

import prisma from "../lib/prisma.ts";
import { products } from "./products.seed.ts";
import { siteReviews } from "./site-review.seed.ts";
import { users } from "./users.seed.ts";

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
  await prisma.user.deleteMany();

  // Hash de contraseñas
  const usersWithHashedPassword = await Promise.all(
    users.map(async (user) => ({
      ...user,
      password: await argon2.hash(user.password, {
        type: argon2.argon2id,
      }),
    })),
  );

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

  // Insertar usuarios con contraseña hasheada
  await prisma.user.createMany({
    data: usersWithHashedPassword,
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