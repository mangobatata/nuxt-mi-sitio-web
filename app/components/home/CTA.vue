<script setup lang="ts">
import type { ButtonProps } from "#ui/components/Button.vue";

const { data } = await useFetch("/api/hello-world");

const links = ref<ButtonProps[]>([
  {
    label: "Empezando",
    color: "primary",
    size: "lg",
    class: "font-semibold tracking-wide px-7",
  },
  {
    label: "Más información",
    color: "neutral",
    variant: "ghost",
    size: "lg",
    trailingIcon: "i-lucide-arrow-right",
    class: "font-medium tracking-wide",
  },
]);
</script>

<template>
  <section
    class="relative overflow-hidden bg-white py-24 transition-colors duration-300 dark:bg-gray-950"
  >
    <!-- Decorative background mesh -->
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div
        class="absolute -top-40 left-1/4 h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-[120px]"
      />
      <div
        class="absolute -bottom-20 right-1/4 h-[400px] w-[400px] rounded-full bg-violet-500/10 blur-[100px]"
      />
      <!-- Grid pattern -->
      <div
        class="absolute inset-0 text-gray-950 opacity-[0.05] dark:text-white dark:opacity-[0.03]"
        style="
          background-image:
            linear-gradient(currentColor 1px, transparent 1px),
            linear-gradient(90deg, currentColor 1px, transparent 1px);
          background-size: 48px 48px;
        "
      />
    </div>

    <UContainer>
      <UPageCTA
        orientation="horizontal"
        :links="links"
        :ui="{
          root: 'relative rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm px-10 py-14 gap-12 overflow-hidden shadow-sm dark:border-white/[0.06] dark:bg-white/[0.03]',
          title:
            'text-4xl lg:text-5xl font-extrabold text-gray-950 dark:text-white leading-[1.15] tracking-tight',
          description:
            'text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-md',
          links: 'flex-row items-center gap-3 mt-2',
          wrapper: 'gap-6',
        }"
      >
        <!-- Overriding title slot for finer control -->
        <template #title>
          <div class="space-y-2">
            <!-- Badge -->
            <span
              class="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-400"
            >
              <span class="relative flex h-2 w-2">
                <span
                  class="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"
                />
                <span
                  class="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"
                />
              </span>
              Comunidad activa
            </span>

            <h2
              class="text-4xl font-extrabold leading-tight tracking-tight text-gray-950 lg:text-5xl dark:text-white"
            >
              {{ data?.message }} con una
              <span
                class="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent"
              >
                increíble comunidad
              </span>
            </h2>
          </div>
        </template>

        <template #description>
          <p
            class="mt-1 max-w-sm text-base leading-relaxed text-gray-600 dark:text-gray-400"
          >
            {{ data?.description }}
          </p>

          <!-- Stats row -->
          <div class="mt-6 flex items-center gap-6">
            <div
              v-for="stat in [
                { value: '10K+', label: 'Usuarios' },
                { value: '98%', label: 'Satisfacción' },
                { value: '4.9★', label: 'Valoración' },
              ]"
              :key="stat.label"
              class="text-center"
            >
              <p class="text-xl font-bold text-gray-950 dark:text-white">
                {{ stat.value }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-500">
                {{ stat.label }}
              </p>
            </div>
            <div class="h-8 w-px bg-gray-200 dark:bg-white/10" />
            <!-- Avatar stack -->
            <div class="flex -space-x-2">
              <img
                v-for="i in 4"
                :key="i"
                :src="`https://i.pravatar.cc/32?img=${i + 10}`"
                :alt="`Usuario ${i}`"
                class="h-7 w-7 rounded-full border-2 border-white object-cover dark:border-gray-950"
              />
              <div
                class="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-[10px] font-bold text-white dark:border-gray-950"
              >
                +9K
              </div>
            </div>
          </div>
        </template>

        <!-- Image slot -->
        <div class="relative flex items-center justify-center">
          <!-- Decorative ring -->
          <div
            class="absolute h-72 w-72 rounded-full border border-gray-200 lg:h-96 lg:w-96 dark:border-white/5"
          />
          <div
            class="absolute h-56 w-56 rounded-full border border-gray-200 lg:h-80 lg:w-80 dark:border-white/5"
          />

          <!-- Card-style image wrapper -->
          <div
            class="relative z-10 overflow-hidden rounded-2xl border border-gray-200 shadow-2xl shadow-gray-950/10 dark:border-white/10 dark:shadow-black/50"
          >
            <img
              src="https://picsum.photos/seed/community/480/560"
              width="240"
              height="280"
              alt="Comunidad"
              class="w-60 object-cover lg:w-72"
            />
            <!-- Image overlay gradient -->
            <div
              class="absolute inset-0 bg-gradient-to-t from-indigo-950/60 via-transparent to-transparent"
            />

            <!-- Floating tag over image -->
            <div
              class="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl bg-white/10 px-3 py-2 backdrop-blur-md"
            >
              <div>
                <p class="text-[11px] font-semibold text-white">
                  Crecimiento anual
                </p>
                <p class="text-xs text-gray-300">+47% este año</p>
              </div>
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-white"
              >
                <UIcon name="i-lucide-trending-up" class="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </UPageCTA>
    </UContainer>
  </section>
</template>
