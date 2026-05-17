import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { v4 as uuidv4 } from "uuid";

// ─── Configuración de Cloudinary ───────────────────────────────────────────
// Se inicializa una sola vez al cargar el módulo usando variables de entorno.
// Nunca hardcodear credenciales en el código fuente.
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// ─── Constantes ────────────────────────────────────────────────────────────
const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3 MB en bytes
const UPLOAD_FOLDER = "mi-sitio-nuxt"; // Carpeta destino en Cloudinary
const ALLOWED_FORMATS = ["jpg", "jpeg", "png"] as const;
const IMAGE_CONFIG = {
  width: 600,
  height: 400,
  crop: "limit",
  fetch_format: "auto", // Cloudinary elige el formato óptimo (webp, avif, etc.)
  quality: "auto", // Cloudinary elige la calidad óptima automáticamente
} as const;

// ─── Tipos ─────────────────────────────────────────────────────────────────
interface UploadResponse {
  success: boolean;
  result: UploadApiResponse | undefined;
}

// ─── Helpers privados ──────────────────────────────────────────────────────

/**
 * Valida que el buffer recibido sea válido y no supere el límite de tamaño.
 * Lanza un error descriptivo si alguna validación falla.
 */
const validateBuffer = (buffer: Buffer): void => {
  if (!buffer || buffer.length === 0) {
    throw new Error("No se recibió ningún archivo.");
  }
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(
      `El archivo supera el tamaño máximo permitido de ${MAX_FILE_SIZE / (1024 * 1024)} MB.`,
    );
  }
};

/**
 * Sube el buffer de imagen a Cloudinary usando un stream.
 * Retorna una promesa con el resultado de la subida.
 *
 * Se usa upload_stream (en lugar de upload) porque trabajamos con un Buffer
 * en memoria, sin necesidad de escribir el archivo en disco primero.
 */
const uploadToCloudinary = (buffer: Buffer): Promise<UploadApiResponse> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        public_id: uuidv4(), // Nombre único generado con UUID v4
        folder: UPLOAD_FOLDER,
        overwrite: false, // No sobreescribir si ya existe el public_id
        unique_filename: false, // Respetar el public_id exacto (sin sufijos)
        allowed_formats: [...ALLOWED_FORMATS],
      },
      (error, result) => {
        if (error || !result) {
          return reject(
            new Error(
              error?.message ?? "Error desconocido al subir la imagen.",
            ),
          );
        }
        resolve(result);
      },
    );

    stream.end(buffer); // Envía el buffer al stream de subida
  });

/**
 * Genera la URL optimizada de la imagen ya subida a Cloudinary.
 * Cloudinary aplica transformaciones on-the-fly según los parámetros indicados.
 *
 * - fetch_format: "auto" → entrega webp/avif según el navegador del cliente
 * - quality: "auto"      → compresión automática sin pérdida visual perceptible
 * - crop: "limit"        → reduce si supera las dimensiones, sin ampliar
 */
const buildOptimizedUrl = (publicId: string): string =>
  cloudinary.url(publicId, {
    secure: true, // Fuerza HTTPS
    ...IMAGE_CONFIG,
  });

// ─── Función principal exportada ───────────────────────────────────────────

/**
 * Orquesta la subida de una imagen a Cloudinary y retorna su URL optimizada.
 *
 * Flujo:
 *  1. Valida el buffer (existencia y tamaño).
 *  2. Sube la imagen a Cloudinary con un nombre UUID único.
 *  3. Construye y retorna la URL con transformaciones de optimización.
 *
 * @param fileBuffer - Buffer con el contenido binario del archivo de imagen.
 * @returns URL segura y optimizada de la imagen en Cloudinary.
 * @throws Error si la validación falla o si la subida no es exitosa.
 */
export const fileUpload = async (fileBuffer: Buffer): Promise<string> => {
  validateBuffer(fileBuffer);

  const uploadResult = await uploadToCloudinary(fileBuffer);

  return buildOptimizedUrl(uploadResult.public_id);
};
