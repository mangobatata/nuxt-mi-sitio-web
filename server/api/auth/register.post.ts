import { z } from "zod";
import argon2 from "argon2";
import prisma from "@@/lib/prisma";
import { assertRateLimit } from "../../utils/rate-limit";

const bodySchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z
    .string()
    .toLowerCase()
    .trim()
    .refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: "Email is not valid",
    }),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default defineEventHandler(async (event) => {
  assertRateLimit(event, "auth:register", {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
    message: "Too many registration attempts. Please try again later.",
  });

  const { fullName, email, password } = await readValidatedBody(
    event,
    bodySchema.parse,
  );

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: "Email is already registered",
    });
  }

  const hashedPassword = await argon2.hash(password);

  const user = await prisma.user.create({
    data: {
      name: fullName,
      email,
      password: hashedPassword,
      roles: ["user"],
    },
  });

  const userSession = {
    id: user.id,
    name: user.name,
    email: user.email,
    roles: user.roles,
  };

  await setUserSession(event, {
    user: userSession,
  });

  return {
    message: "Registration successful",
    user: userSession,
  };
});
