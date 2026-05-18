import { z } from "zod";
import prisma from "@@/lib/prisma";

const bodySchema = z.object({
  rating: z.number().int().min(1).max(5),
  review: z.string().trim().min(1),
  userTitle: z.string().trim().min(1),
});

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, bodySchema.parse);
  const slug = getRouterParam(event, "slug");

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: "Slug de producto requerido",
    });
  }

  const session = await requireUserSession(event);
  const userId = Number(session.user.id);

  if (!session.user.name || Number.isNaN(userId)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad request",
    });
  }

  const product = await prisma.product.findUnique({
    where: {
      slug,
    },
  });

  if (!product) {
    throw createError({
      statusCode: 404,
      statusMessage: "Product not found",
    });
  }

  // Usuario no tiene reseñas sobre este producto
  const existingReview = await prisma.productReview.findFirst({
    where: {
      product: {
        slug: slug,
      },
      userId,
    },
  });

  if (existingReview) {
    throw createError({
      statusCode: 400,
      statusMessage: "You have already posted a review for this product",
    });
  }

  const review = await prisma.productReview.create({
    data: {
      name: session.user.name,
      rating: body.rating,
      review: body.review,
      userTitle: body.userTitle,
      productId: product.id,
      userId,
    },
  });

  return review;
});
