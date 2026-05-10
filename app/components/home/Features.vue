<script setup lang="ts">
const cards = ref([
  {
    id: "01",
    title: "Tema",
    description:
      "Aprende cómo personalizar los componentes de Nuxt UI usando Tailwind CSS v4 con total control visual.",
    icon: "i-lucide-swatch-book",
    accent: "from-amber-500 to-orange-500",
    accentBg: "bg-amber-500/10",
    accentText: "text-amber-500",
    accentBorder: "border-amber-500/20",
    class: "lg:col-span-2",
    image: {
      path: "https://ui2.nuxt.com/illustrations/color-palette",
      width: 363,
      height: 152,
    },
    orientation: "horizontal" as const,
  },
  {
    id: "02",
    title: "Fuentes",
    description:
      "Integración con Nuxt Fonts para optimización de tipografía lista para usar en producción.",
    icon: "i-lucide-a-large-small",
    accent: "from-sky-500 to-cyan-500",
    accentBg: "bg-sky-500/10",
    accentText: "text-sky-500",
    accentBorder: "border-sky-500/20",
  },
  {
    id: "03",
    title: "Modo de Color",
    description:
      "Cambia entre modo claro y oscuro con Nuxt Color Mode de manera fluida y sin configuración.",
    icon: "i-lucide-sun-moon",
    accent: "from-violet-500 to-purple-500",
    accentBg: "bg-violet-500/10",
    accentText: "text-violet-500",
    accentBorder: "border-violet-500/20",
  },
  {
    id: "04",
    title: "Iconos",
    description:
      "Accede a más de 200,000 iconos de Iconify con integración directa a través de Nuxt Icon.",
    icon: "i-lucide-smile",
    accent: "from-emerald-500 to-teal-500",
    accentBg: "bg-emerald-500/10",
    accentText: "text-emerald-500",
    accentBorder: "border-emerald-500/20",
    image: {
      path: "https://ui2.nuxt.com/illustrations/icon-library",
      width: 362,
      height: 184,
    },
    class: "lg:col-span-2",
    orientation: "horizontal" as const,
    reverse: true,
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
        class="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-white/10"
      />
      <div
        class="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-white/10"
      />
      <div
        class="absolute -left-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-indigo-600/5 blur-[80px]"
      />
      <div
        class="absolute -right-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-violet-600/5 blur-[80px]"
      />
    </div>

    <UContainer class="relative">
      <!-- Section Header -->
      <div class="mb-16 flex items-end justify-between">
        <div class="max-w-xl">
          <!-- Eyebrow -->
          <div class="mb-4 flex items-center gap-3">
            <div class="h-px w-8 bg-indigo-500" />
            <span
              class="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400"
            >
              Servicios
            </span>
          </div>

          <h2
            class="text-4xl font-extrabold tracking-tight text-gray-950 lg:text-5xl dark:text-white"
          >
            Una gran cantidad de
            <br />
            <span class="text-gray-500 dark:text-gray-500">herramientas para ti</span>
          </h2>
        </div>

        <!-- Decorative counter -->
        <p
          class="hidden font-mono text-8xl font-black text-gray-950/[0.04] select-none lg:block dark:text-white/[0.04]"
          aria-hidden="true"
        >
          04
        </p>
      </div>

      <!-- Cards Grid -->
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div
          v-for="(card, index) in cards"
          :key="card.id"
          :class="[
            card.class,
            'group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-500 hover:border-gray-300 hover:bg-gray-50 dark:border-white/[0.06] dark:bg-white/[0.03] dark:hover:border-white/[0.12] dark:hover:bg-white/[0.05]',
          ]"
        >
          <!-- Card top accent line -->
          <div
            :class="[
              'absolute left-0 top-0 h-px w-full bg-gradient-to-r opacity-0 transition-opacity duration-500 group-hover:opacity-100',
              card.accent,
            ]"
          />

          <!-- Ambient glow on hover -->
          <div
            :class="[
              'pointer-events-none absolute -top-12 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full blur-3xl opacity-0 transition-opacity duration-700 group-hover:opacity-100',
              card.accentBg,
            ]"
          />

          <div
            :class="[
              'relative flex gap-6',
              card.orientation === 'horizontal'
                ? card.reverse
                  ? 'flex-col-reverse lg:flex-row-reverse'
                  : 'flex-col lg:flex-row'
                : 'flex-col',
            ]"
          >
            <!-- Text block -->
            <div class="flex flex-1 flex-col justify-between gap-6">
              <div class="space-y-4">
                <!-- Icon + Number -->
                <div class="flex items-start justify-between">
                  <div
                    :class="[
                      'flex h-11 w-11 items-center justify-center rounded-xl border',
                      card.accentBg,
                      card.accentBorder,
                    ]"
                  >
                    <UIcon
                      :name="card.icon"
                      :class="['h-5 w-5', card.accentText]"
                    />
                  </div>
                  <span
                    class="font-mono text-xs font-bold text-gray-950/20 select-none dark:text-white/20"
                  >
                    {{ card.id }}
                  </span>
                </div>

                <!-- Text -->
                <div>
                  <h3
                    class="mb-2 text-lg font-bold tracking-tight text-gray-950 dark:text-white"
                  >
                    {{ card.title }}
                  </h3>
                  <p class="text-sm leading-relaxed text-gray-600 dark:text-gray-500">
                    {{ card.description }}
                  </p>
                </div>
              </div>

              <!-- CTA arrow -->
              <div
                :class="[
                  'flex items-center gap-2 text-xs font-semibold transition-all duration-300 group-hover:gap-3',
                  card.accentText,
                ]"
              >
                <span>Explorar</span>
                <UIcon
                  name="i-lucide-arrow-right"
                  class="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                />
              </div>
            </div>

            <!-- Image block -->
            <div
              v-if="card.image"
              :class="[
                'flex-shrink-0 overflow-hidden rounded-xl border border-gray-200 dark:border-white/[0.06]',
                card.orientation === 'horizontal' ? 'lg:w-64' : 'w-full',
              ]"
            >
              <UColorModeImage
                :light="`${card.image.path}-light.svg`"
                :dark="`${card.image.path}-dark.svg`"
                :width="card.image.width"
                :height="card.image.height"
                :alt="card.title"
                loading="lazy"
                class="w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
            </div>
          </div>
        </div>
      </div>
    </UContainer>
  </section>
</template>
