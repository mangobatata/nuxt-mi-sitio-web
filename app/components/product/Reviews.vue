<script setup lang="ts">
const testimonials = ref([
  {
    user: {
      stars: 5,
      name: "María González",
      description: "Compradora verificada",
      avatar: {
        src: "https://randomuser.me/api/portraits/women/68.jpg",
        alt: "María González",
      },
    },
    quote:
      "¡Excelente producto! Llegó rápido y en perfectas condiciones. Lo recomiendo totalmente.",
  },
  {
    user: {
      stars: 4,
      name: "Juan Pérez",
      description: "Cliente frecuente",
      avatar: {
        src: "https://randomuser.me/api/portraits/men/14.jpg",
        alt: "Juan Pérez",
      },
    },
    quote:
      "La calidad es increíble por el precio. Sin duda volveré a comprar en esta tienda.",
  },
  {
    user: {
      stars: 3,
      name: "Lucía Romero",
      description: "Compradora verificada",
      avatar: {
        src: "https://randomuser.me/api/portraits/women/44.jpg",
        alt: "Lucía Romero",
      },
    },
    quote:
      "Estoy muy contenta con mi compra, superó mis expectativas y el servicio al cliente fue excelente.",
  },
  {
    user: {
      stars: 2,
      name: "Carlos Torres",
      description: "Nuevo cliente",
      avatar: {
        src: "https://randomuser.me/api/portraits/men/34.jpg",
        alt: "Carlos Torres",
      },
    },
    quote:
      "El envío fue rápido y el producto llegó bien embalado. Volveré a comprar aquí.",
  },
  {
    user: {
      stars: 1,
      name: "Fernanda Ruiz",
      description: "Compradora frecuente",
      avatar: {
        src: "https://randomuser.me/api/portraits/women/55.jpg",
        alt: "Fernanda Ruiz",
      },
    },
    quote:
      "Gran experiencia de compra, producto tal cual la descripción y de muy buena calidad.",
  },
  {
    user: {
      stars: 1,
      name: "Diego Martínez",
      description: "Cliente satisfecho",
      avatar: {
        src: "https://randomuser.me/api/portraits/men/99.jpg",
        alt: "Diego Martínez",
      },
    },
    quote: "Me encantó, superó mis expectativas y lo recomendaré a mis amigos.",
  },
  {
    user: {
      stars: 2,
      name: "Sofía López",
      description: "Compradora",
      avatar: {
        src: "https://randomuser.me/api/portraits/women/22.jpg",
        alt: "Sofía López",
      },
    },
    quote: "Excelente atención y buen producto. Todo llegó muy bien y rápido.",
  },
  {
    user: {
      stars: 3,
      name: "Miguel Fernández",
      description: "Comprador habitual",
      avatar: {
        src: "https://randomuser.me/api/portraits/men/15.jpg",
        alt: "Miguel Fernández",
      },
    },
    quote: "Buen precio y calidad, sin problemas con el pedido. Lo recomiendo.",
  },
  {
    user: {
      stars: 4,
      name: "Paula Sánchez",
      description: "Compradora verificada",
      avatar: {
        src: "https://randomuser.me/api/portraits/women/21.jpg",
        alt: "Paula Sánchez",
      },
    },
    quote:
      "Muy feliz con mi compra. El producto funciona perfecto y la atención fue genial.",
  },
  {
    user: {
      stars: 5,
      name: "Alejandro Díaz",
      description: "Recomendador",
      avatar: {
        src: "https://randomuser.me/api/portraits/men/16.jpg",
        alt: "Alejandro Díaz",
      },
    },
    quote: "Primera vez comprando y todo salió excelente. 100% recomendado.",
  },
  {
    user: {
      stars: 5,
      name: "Valentina Morales",
      description: "Compradora contenta",
      avatar: {
        src: "https://randomuser.me/api/portraits/women/47.jpg",
        alt: "Valentina Morales",
      },
    },
    quote:
      "Me sorprendió la calidad. El envío también fue muy rápido. ¡Gracias!",
  },
]);
</script>

<template>
  <UCard class="mb-8" icon="i-lucide-star">
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-star" class="text-primary-500 text-2xl" />
        <div>
          <h2 class="text-xl font-semibold">Reseñas</h2>
          <p class="text-gray-600 text-sm">
            Nuestras reseñas de clientes satisfechos.
          </p>
        </div>
      </div>
      <!-- <UButton
        color="primary"
        icon="i-lucide-plus-circle"
        size="md"
        class="ml-4"
        label="Añadir reseña"
      /> -->
      <ModalReview button-label="Añadir reseña" />
    </div>
  </UCard>

  <UPageColumns>
    <UPageCard
      v-for="(testimonial, index) in testimonials"
      :key="index"
      variant="subtle"
      :description="testimonial.quote"
      :ui="{
        description: 'before:content-[open-quote] after:content-[close-quote]',
      }"
    >
      <template #footer>
        <div class="flex items-center gap-2 mb-2">
          <UIcon
            name="i-lucide-star"
            class="text-primary-500 text-xl"
            v-for="star in testimonial.user.stars"
            :key="star"
          />
        </div>
        <UUser v-bind="testimonial.user" size="xl" />
      </template>
    </UPageCard>
  </UPageColumns>
</template>
