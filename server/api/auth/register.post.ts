import { z } from "zod";
import argon2 from "argon2";
import prisma from "@@/lib/prisma";
import { assertRateLimit } from "../../utils/rate-limit";
import { defineEventHandler, createError, setResponseStatus } from "h3";

// ─── Schema de validación ──────────────────────────────────────────────────
const bodySchema = z.object({
  fullName: z
    .string({ required_error: "El nombre completo es requerido." })
    .trim()
    .min(2, "El nombre completo debe tener al menos 2 caracteres.")
    .max(100, "El nombre completo no puede superar los 100 caracteres."),
  email: z
    .string({ required_error: "El email es requerido." })
    .trim()
    .toLowerCase()
    .email("El email no tiene un formato válido."),
  password: z
    .string({ required_error: "La contraseña es requerida." })
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(72, "La contraseña no puede superar los 72 caracteres."), // límite interno de bcrypt/argon2
});

// ─── Tipo inferido ─────────────────────────────────────────────────────────
type RegisterBody = z.infer<typeof bodySchema>;

// ─── Configuración de argon2 ───────────────────────────────────────────────
// Parámetros explícitos para producción. Los defaults de argon2 son seguros,
// pero documentarlos aquí facilita auditorías de seguridad.
const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id,   // argon2id es el tipo recomendado (resistente a side-channel y GPU)
  memoryCost: 65536,       // 64 MB de memoria por hash
  timeCost: 3,             // 3 iteraciones
  parallelism: 1,          // 1 hilo (ajustar según los cores del servidor)
};

// ─── Helper privado ────────────────────────────────────────────────────────
/**
 * Construye el objeto de sesión con solo los campos públicos del usuario.
 * Nunca incluir password u otros datos sensibles.
 */
const buildUserSession = (user: {
  id: number;
  name: string;
  email: string;
  roles: string[];
}) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  roles: user.roles,
});

// ─── Handler principal ─────────────────────────────────────────────────────
/**
 * POST /api/auth/register
 *
 * Registra un nuevo usuario y lo autentica automáticamente.
 *
 * Flujo:
 *  1. Rate limiting: máximo 5 intentos cada 15 minutos por IP.
 *  2. Valida y sanitiza el body con Zod.
 *  3. Verifica que el email no esté registrado (409 si ya existe).
 *  4. Hashea la contraseña con argon2id.
 *  5. Crea el usuario en la base de datos.
 *  6. Inicia sesión automáticamente y retorna 201 con los datos públicos.
 *
 * Seguridad:
 *  - La contraseña tiene un máximo de 72 caracteres (límite de argon2).
 *  - Se usa argon2id con parámetros explícitos de costo.
 *  - Solo se exponen en sesión los campos mínimos necesarios.
 *  - El select en la creación evita retornar el hash de la contraseña.
 */
export default defineEventHandler(async (event) => {
  // 1. Rate limiting — antes de cualquier operación costosa
  assertRateLimit(event, "auth:register", {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutos
    message: "Demasiados intentos de registro. Intenta más tarde.",
  });

  // 2. Validar y sanitizar el body
  const { fullName, email, password }: RegisterBody = await readValidatedBody(
    event,
    bodySchema.parse
  );

  // 3. Verificar que el email no esté en uso
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: "Conflict",
      message: "El email ya está registrado.",
    });
  }

  // 4. Hashear la contraseña con argon2id
  const hashedPassword = await argon2.hash(password, ARGON2_OPTIONS);

  // 5. Crear el usuario en la base de datos
  //    select explícito: nunca retornar el hash de la contraseña al cliente
  const user = await prisma.user.create({
    data: {
      name: fullName,
      email,
      password: hashedPassword,
      roles: ["user"],
    },
    select: {
      id: true,
      name: true,
      email: true,
      roles: true,
    },
  });

  // 6. Iniciar sesión y responder con 201 Created
  const userSession = buildUserSession(user);

  await setUserSession(event, { user: userSession });

  setResponseStatus(event, 201);

  return {
    message: "Registro exitoso.",
    user: userSession,
  };
});