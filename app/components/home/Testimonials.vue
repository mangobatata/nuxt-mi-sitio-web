<script setup lang="ts">
const testimonials = ref([
  {
    user: {
      name: "Evan You",
      description: "Autor de Vue.js y Vite",
      avatar: {
        src: "https://avatars.githubusercontent.com/u/499550?v=4",
        alt: "Evan You",
      },
    },
    quote:
      "Nuxt en la infraestructura de Cloudflare con un esfuerzo mínimo - ¡esto es enorme!",
  },
  {
    user: {
      name: "Igor Minar",
      description: "Ingeniero de Software en Cloudflare",
      avatar: {
        src: "https://avatars.githubusercontent.com/u/216296?v=4",
        alt: "Igor Minar",
      },
    },
    quote:
      "Me encanta el pulido y el enfoque de baterías incluidas. NuxtHub lleva la integración del marco web y el hosting a un nuevo nivel.",
  },
  {
    user: {
      name: "Charlie Hield",
      description: "Tecnólogo Creativo Senior",
      avatar: {
        src: "https://avatars.githubusercontent.com/u/527849?v=4",
        alt: "Charlie Hield",
      },
    },
    quote:
      "NuxtHub es, sin duda, la forma más fácil de llevar un proyecto de cero a producción en la pila de Cloudflare.",
  },
  {
    user: {
      name: "Israel Ortuño",
      description: "Co-fundador de VueJobs",
      avatar: {
        src: "https://avatars.githubusercontent.com/u/1769417?v=4",
        alt: "Israel Ortuño",
      },
    },
    quote:
      "No puedo encontrar una excusa para no ir full-stack con Nuxt. Despliega rápido a la manera de Nuxt, sin configuración. Solo conecta y despliega.",
  },
  {
    user: {
      name: "Fayaz Ahmed",
      description: "Indie Hacker",
      avatar: {
        src: "https://avatars.githubusercontent.com/u/15716057?v=4",
        alt: "Fayaz Ahmed",
      },
    },
    quote:
      "Me tomó menos de 90 segundos desplegar una aplicación con DB, KV, almacenamiento de archivos y caché, todo en el edge con solo un comando.",
  },
  {
    user: {
      name: "Tommy J. Vedvik",
      description: "Desarrollador UX",
      avatar: {
        src: "https://avatars.githubusercontent.com/u/48070?v=4",
        alt: "Tommy J. Vedvik",
      },
    },
    quote:
      "Nuxt se está convirtiendo en el mejor marco para quienes inician. NuxtHub es una capa sobre Cloudflare para un hosting full-stack rápido y económico en el edge.",
  },
  {
    user: {
      name: "Dario Piotrowicz",
      description: "Desarrollador Web en Cloudflare",
      avatar: {
        src: "https://avatars.githubusercontent.com/u/61631103?v=4",
        alt: "Dario Piotrowicz",
      },
    },
    quote:
      "Me encanta cómo NuxtHub combina, amplifica y simplifica las herramientas de Cloudflare con el amplio y maduro ecosistema de Nuxt.",
  },
  {
    user: {
      name: "Markus Oberlehner",
      description: "Desarrollador Web",
      avatar: {
        src: "https://avatars.githubusercontent.com/u/6883314?v=4",
        alt: "Markus Oberlehner",
      },
    },
    quote:
      "Acabo de desplegar mi primer sitio en Cloudflare usando NuxtHub. ¡Una experiencia muy elegante!",
  },
  {
    user: {
      name: "Anthony Fu",
      description: "Equipo central de Vue.js, Vite y Nuxt",
      avatar: {
        src: "https://avatars.githubusercontent.com/u/11247099?v=4",
        alt: "Anthony Fu",
      },
    },
    quote:
      "Es increíble ejecutar un solo comando y desplegar un proyecto Nuxt en el edge en minutos. Como desbloquear la infraestructura que faltaba para Cloudflare.",
  },
  {
    user: {
      name: "Jonathan Beckman",
      description: "Fundador de GuaranTee Time",
      avatar: {
        src: "https://avatars.githubusercontent.com/u/90707158?v=4",
        alt: "Jonathan Beckman",
      },
    },
    quote:
      "NuxtHub y Cloudflare son mi opción para aplicaciones full stack. La experiencia de desarrollo es alegre y muy superior a cualquier otra plataforma.",
  },
  {
    user: {
      name: "Eckhardt Dreyer",
      description: "Desarrollador Principal en YG",
      avatar: {
        src: "https://avatars.githubusercontent.com/u/37825447?v=4",
        alt: "Eckhardt Dreyer",
      },
    },
    quote:
      "Migrar a NuxtHub no solo tomó unos minutos, sino que nos ahorró dinero. Proporciona una excelente capa de gestión sobre nuestra infraestructura.",
  },
]);
</script>

<template>
  <section
    class="relative overflow-hidden bg-white px-6 py-24 transition-colors duration-300 lg:px-12 dark:bg-gray-950"
  >
    <!-- Ambient background -->
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div
        class="absolute left-1/2 top-0 h-72 w-[800px] -translate-x-1/2 rounded-full bg-indigo-600/5 blur-[100px]"
      />
      <div
        class="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-white/8"
      />
    </div>

    <UContainer class="relative">
      <!-- Section header -->
      <div class="mb-16 text-center">
        <div class="mb-4 flex items-center justify-center gap-3">
          <div class="h-px w-8 bg-indigo-500" />
          <span
            class="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400"
          >
            Testimonios
          </span>
          <div class="h-px w-8 bg-indigo-500" />
        </div>
        <h2
          class="text-4xl font-extrabold tracking-tight text-gray-950 lg:text-5xl dark:text-white"
        >
          Lo que dice nuestra
          <span class="text-gray-500 dark:text-gray-500"> comunidad</span>
        </h2>
        <p
          class="mx-auto mt-4 max-w-md text-sm leading-relaxed text-gray-600 dark:text-gray-500"
        >
          Desarrolladores de todo el mundo confían en NuxtHub para sus proyectos
          en producción.
        </p>
      </div>

      <!-- Cloudflare featured card -->

      <a
        href="https://cloudflare.com"
        target="_blank"
        class="group mb-6 flex items-center justify-between gap-6 rounded-2xl border border-orange-500/20 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent p-6 transition-all duration-300 hover:border-orange-500/40 hover:from-orange-500/15"
      >
        <div class="flex items-center gap-5">
          <div
            class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10"
          >
            <UIcon name="i-logos-cloudflare-icon" class="size-8" />
          </div>
          <div>
            <p class="font-bold text-gray-950 dark:text-white">
              Cloudflare Workers LaunchPad
            </p>
            <p class="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
              NuxtHub es parte del cohort de Cloudflare Workers Launchpad — una
              experiencia de primera clase sobre la red de Cloudflare.
            </p>
          </div>
        </div>
        <UIcon
          name="i-lucide-arrow-right"
          class="size-5 shrink-0 text-orange-400 transition-transform duration-300 group-hover:translate-x-1"
        />
      </a>

      <!-- Masonry columns -->
      <div class="columns-1 gap-4 sm:columns-2 lg:columns-3">
        <div
          v-for="(testimonial, index) in testimonials"
          :key="index"
          class="group mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-gray-300 hover:bg-gray-50 dark:border-white/[0.06] dark:bg-white/[0.03] dark:hover:border-white/[0.12] dark:hover:bg-white/[0.05]"
        >
          <!-- Giant decorative quote mark -->
          <div
            class="mb-3 font-serif text-6xl leading-none text-indigo-500/20 transition-colors duration-300 group-hover:text-indigo-500/30"
            aria-hidden="true"
          >
            "
          </div>

          <!-- Quote -->
          <p class="mb-6 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {{ testimonial.quote }}
          </p>

          <!-- Author -->
          <div
            class="flex items-center gap-3 border-t border-gray-200 pt-4 dark:border-white/[0.06]"
          >
            <img
              :src="testimonial.user.avatar.src"
              :alt="testimonial.user.avatar.alt"
              class="h-9 w-9 rounded-full object-cover ring-1 ring-gray-200 dark:ring-white/10"
            />
            <div>
              <p class="text-sm font-semibold text-gray-950 dark:text-white">
                {{ testimonial.user.name }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-500">
                {{ testimonial.user.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </UContainer>
  </section>
</template>
