import prisma from "@@/lib/prisma";

export default defineEventHandler(async (event) => {
  // Idea: paginación
  const session = await getUserSession(event);

  const slug = getRouterParam(event, "slug");

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: "Slug de producto requerido",
    });
  }

  const userId = session.user?.id ? Number(session.user.id) : null;

  const productReviews = await prisma.productReview.findMany({
    where: {
      product: {
        slug: slug,
      },
    },
    take: 10,
    orderBy: {
      createdAt: "desc",
    },
  });

  const userHasReview = userId
    ? await prisma.productReview.findFirst({
        where: {
          product: {
            slug: slug,
          },
          userId,
        },
      })
    : null;

  return {
    productReviews: productReviews,
    hasUserPostedReview: !!userHasReview,
  };
});
