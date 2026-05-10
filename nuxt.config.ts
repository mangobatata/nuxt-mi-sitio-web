// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["@nuxt/ui", '@nuxt/image'],

  css: [
    // CSS file in the project
    "@/assets/css/main.css",
  ],

  // SEO Meta Tags - Configuraciones globales
  app: {
    head: {
      title: "Mi tienda de servicios",
      meta: [
        {
          name: "description",
          content: "Bienvenido a mi tienda de servicios generales.",
        },
      ],
    },
  },

  // Single Page Application (SPA) mode
  // ssr: false,
  // nitro: {
  //   preset: "static",
  //   static: true,
  // },

  // Prender - Todo el sitio
  nitro: {
    prerender: {
      routes: ["/", "/about", "/contact", "/pricing", "/products"],
      ignore: ["/dashboard", "/dashboard/**"],
      // Habilitar el crawling para descubrir enlaces automáticamente
      crawlLinks: true,
    },
  },
});
