<template>
  <div
    class="flex min-h-screen flex-col bg-white text-gray-950 antialiased transition-colors duration-300 dark:bg-gray-950 dark:text-white"
  >
    <shared-header />

    <main class="relative flex-1">
      <!-- Ambient top glow -->
      <div
        class="pointer-events-none absolute left-1/2 top-0 h-64 w-[800px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[100px] dark:bg-indigo-600/5"
        aria-hidden="true"
      />

      <div class="relative mx-auto max-w-7xl px-6 py-8 lg:px-12">
        <slot />
      </div>
    </main>

    <shared-footer />
  </div>
</template>
