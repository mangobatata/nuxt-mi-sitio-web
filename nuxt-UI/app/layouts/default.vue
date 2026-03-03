<template>
  <div class="flex flex-col h-screen">
    <!-- Header -->
    <SharedHeader />
    <main class="container mx-auto flex-1 mt-2">
      <slot />
    </main>

    <!-- Footer -->
     <SharedFooter />
  </div>
</template>
