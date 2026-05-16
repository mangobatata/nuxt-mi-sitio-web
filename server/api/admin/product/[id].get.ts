import prisma from "@@/lib/prisma";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id") as string;

  // Verificar sesión y roles del usuario
  const session = await requireUserSession(event);
  // const session = await getUserSession(event);
  const hasAdminRole = session.user.roles.includes("admin");

  if (!hasAdminRole) {
    throw createError({
      statusCode: 401,
      message: `Unauthorized`,
    });
  }

  const product = await prisma.product.findUnique({
    where: {
      id: +id,
    },
  });

  if (!product) {
    throw createError({
      statusCode: 404,
      message: `Product with id ${id} not found`,
    });
  }

  return product;
});
