import z from 'zod';
import prisma from '~~/lib/prisma';

const bodySchema = z.object({
  rating: z.number().min(1).max(5),
  review: z.string(),
  userTitle: z.string(),
});

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, bodySchema.parse);
  const slug = getRouterParam(event, 'slug');

  const session = await requireUserSession(event);
  const userId = Number(session.user.id);

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug de producto requerido',
    });
  }

  if (!Number.isInteger(userId)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid user session',
    });
  }

  if (!session.user.name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad request',
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
      statusMessage: 'Product not found',
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid user session',
      message: 'Tu sesión ya no corresponde a un usuario existente. Cierra sesión e inicia sesión de nuevo.',
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
      statusMessage: 'You have already posted a review for this product',
    });
  }

  const review = await prisma.productReview.create({
    data: {
      name: session.user.name,
      rating: body.rating,
      review: body.review,
      userTitle: body.userTitle,
      product: {
        connect: {
          id: product.id,
        },
      },
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });

  return review;
});
