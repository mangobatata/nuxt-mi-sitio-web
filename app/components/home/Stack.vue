<script setup lang="ts">
const brands = [
  {
    icon: "i-simple-icons-github",
    name: "GitHub",
    color: "text-gray-950 dark:text-white",
    bg: "bg-gray-100 dark:bg-white/5",
    border: "border-gray-200 dark:border-white/10",
  },
  {
    icon: "i-simple-icons-discord",
    name: "Discord",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
  },
  {
    icon: "i-simple-icons-x",
    name: "X / Twitter",
    color: "text-gray-950 dark:text-white",
    bg: "bg-gray-100 dark:bg-white/5",
    border: "border-gray-200 dark:border-white/10",
  },
  {
    icon: "i-simple-icons-instagram",
    name: "Instagram",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
  },
  {
    icon: "i-simple-icons-linkedin",
    name: "LinkedIn",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
  },
  {
    icon: "i-simple-icons-facebook",
    name: "Facebook",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: "i-simple-icons-tailwindcss",
    name: "Tailwind CSS",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
  {
    icon: "i-simple-icons-cloudflare",
    name: "Cloudflare",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  {
    icon: "i-simple-icons-vercel",
    name: "Vercel",
    color: "text-gray-950 dark:text-white",
    bg: "bg-gray-100 dark:bg-white/5",
    border: "border-gray-200 dark:border-white/10",
  },
  {
    icon: "i-simple-icons-nuxtdotjs",
    name: "Nuxt",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
];

// Split into two rows for opposite directions
const row1 = brands.slice(0, 5);
const row2 = brands.slice(5);
</script>

<template>
  <section
    class="relative overflow-hidden bg-white py-20 transition-colors duration-300 dark:bg-gray-950"
  >
    <!-- Ambient glow -->
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div
        class="absolute left-1/2 top-1/2 h-64 w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/5 blur-[80px]"
      />
    </div>

    <!-- Header -->
    <div class="relative mb-12 text-center">
      <div class="mb-3 flex items-center justify-center gap-3">
        <div class="h-px w-8 bg-indigo-500" />
        <span
          class="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400"
        >
          Integraciones
        </span>
        <div class="h-px w-8 bg-indigo-500" />
      </div>
      <p class="text-sm text-gray-600 dark:text-gray-500">
        Compatible con las herramientas que ya usas
      </p>
    </div>

    <!-- Marquee wrapper with fade masks -->
    <div class="relative space-y-4">
      <!-- Left & Right fade -->
      <div
        class="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-white to-transparent dark:from-gray-950"
      />
      <div
        class="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-white to-transparent dark:from-gray-950"
      />

      <!-- Row 1 → left to right -->
      <UMarquee :pause-on-hover="true" :speed="35">
        <div
          v-for="brand in row1"
          :key="brand.name"
          :class="[
            'group flex items-center gap-3 rounded-xl border px-5 py-3 transition-all duration-300 hover:scale-105 hover:shadow-lg',
            brand.bg,
            brand.border,
          ]"
        >
          <UIcon
            :name="brand.icon"
            :class="[
              'size-6 shrink-0 transition-transform duration-300 group-hover:scale-110',
              brand.color,
            ]"
          />
          <span
            class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {{ brand.name }}
          </span>
        </div>
      </UMarquee>

      <!-- Row 2 ← right to left -->
      <UMarquee :pause-on-hover="true" :speed="28" :reverse="true">
        <div
          v-for="brand in row2"
          :key="brand.name"
          :class="[
            'group flex items-center gap-3 rounded-xl border px-5 py-3 transition-all duration-300 hover:scale-105 hover:shadow-lg',
            brand.bg,
            brand.border,
          ]"
        >
          <UIcon
            :name="brand.icon"
            :class="[
              'size-6 shrink-0 transition-transform duration-300 group-hover:scale-110',
              brand.color,
            ]"
          />
          <span
            class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {{ brand.name }}
          </span>
        </div>
      </UMarquee>
    </div>
  </section>
</template>
