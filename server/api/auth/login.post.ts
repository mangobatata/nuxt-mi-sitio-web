import { z } from "zod";
import prisma from "@@/lib/prisma";
import argon2 from "argon2";
import { assertRateLimit } from "../../utils/rate-limit";
import { defineEventHandler, createError } from "h3";

// ─── Schema de validación ──────────────────────────────────────────────────
const bodySchema = z.object({
  email: z
    .string({ required_error: "El email es requerido." })
    .trim()
    .toLowerCase()
    .email("El email no tiene un formato válido."), // .email() de Zod es suficiente y más estándar que un regex manual
  password: z
    .string({ required_error: "La contraseña es requerida." })
    .min(8, "La contraseña debe tener al menos 8 caracteres."),
});

// ─── Tipo inferido ─────────────────────────────────────────────────────────
type LoginBody = z.infer<typeof bodySchema>;

// ─── Mensaje de error genérico ─────────────────────────────────────────────
// IMPORTANTE: nunca revelar si el email o la contraseña fallaron por separado.
// Un atacante puede usar esa información para enumerar usuarios válidos.
const INVALID_CREDENTIALS_ERROR = createError({
  statusCode: 401,
  statusMessage: "Unauthorized",
  message: "Credenciales inválidas.",
});

// ─── Helper privado ────────────────────────────────────────────────────────
/**
 * Construye el objeto de sesión con solo los campos necesarios.
 * Nunca incluir datos sensibles como password o tokens internos.
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
 * POST /api/auth/login
 *
 * Autentica a un usuario con email y contraseña.
 *
 * Flujo:
 *  1. Rate limiting: máximo 10 intentos cada 15 minutos por IP.
 *  2. Valida y sanitiza el body con Zod.
 *  3. Busca el usuario por email.
 *  4. Verifica la contraseña con argon2.
 *  5. Crea la sesión y retorna los datos públicos del usuario.
 *
 * Seguridad:
 *  - El error de credenciales es siempre el mismo, sin importar si falló
 *    el email o la contraseña, para evitar enumeración de usuarios.
 *  - Solo se exponen en sesión los campos mínimos necesarios.
 *  - argon2 es resistente a ataques de timing por diseño.
 */
export default defineEventHandler(async (event) => {
  // 1. Rate limiting — debe ir antes de cualquier operación costosa
  assertRateLimit(event, "auth:login", {
    maxRequests: 10,
    windowMs: 15 * 60 * 1000, // 15 minutos
    message: "Demasiados intentos de inicio de sesión. Intenta más tarde.",
  });

  // 2. Validar y sanitizar el body
  const { email, password }: LoginBody = await readValidatedBody(
    event,
    bodySchema.parse
  );

  // 3. Buscar el usuario por email
  //    Solo traemos los campos necesarios para la autenticación y la sesión.
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      password: true, // Necesario para verificar con argon2
      roles: true,
    },
  });

  // 4a. Usuario no encontrado → mismo error que contraseña inválida
  if (!user) throw INVALID_CREDENTIALS_ERROR;

  // 4b. Verificar contraseña con argon2
  //     argon2.verify lanza una excepción si el hash está corrupto;
  //     la capturamos para no exponer detalles internos.
  const isPasswordValid = await argon2.verify(user.password, password).catch(() => false);

  if (!isPasswordValid) throw INVALID_CREDENTIALS_ERROR;

  // 5. Crear sesión y retornar datos públicos del usuario
  const userSession = buildUserSession(user);

  await setUserSession(event, { user: userSession });

  return {
    message: "Inicio de sesión exitoso.",
    user: userSession,
  };
});