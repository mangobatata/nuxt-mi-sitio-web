import prisma from "@@/lib/prisma";
import { createError, defineEventHandler, getRouterParam } from "h3";

const parseProductId = (raw: string | undefined): number => {
  const id = Number(raw);

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "El parámetro 'id' debe ser un entero positivo.",
    });
  }

  return id;
};

export default defineEventHandler(async (event) => {
  const id = parseProductId(getRouterParam(event, "id"));

  return prisma.productChange.findMany({
    where: { productId: id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
});
