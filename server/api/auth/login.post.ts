import { z } from "zod";
import prisma from "@@/lib/prisma";
import argon2 from "argon2";
import { assertRateLimit } from "../../utils/rate-limit";

const bodySchema = z.object({
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
  assertRateLimit(event, "auth:login", {
    maxRequests: 10,
    windowMs: 15 * 60 * 1000,
    message: "Too many login attempts. Please try again later.",
  });

  const { email, password } = await readValidatedBody(event, bodySchema.parse);

  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (!user) {
    throw createError({
      status: 401,
      message: "Bad credentials (email)",
    });
  }

  const isPasswordValid = await argon2.verify(user.password, password);

  if (!isPasswordValid) {
    throw createError({
      status: 401,
      message: "Bad credentials (password)",
    });
  }

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
    message: "Login successful",
    user: userSession,
  };
});
