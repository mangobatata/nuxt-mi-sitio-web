<script setup lang="ts">
import * as z from "zod";
import type { AuthFormField } from "#ui/components/AuthForm.vue";
import type { FormSubmitEvent } from "@nuxt/ui";

definePageMeta({
  layout: "login-layout",
  middleware: "not-authenticated",
});

const toast = useToast();
const { register } = useAuthentication();
const isPosting = ref(false);

const fields: AuthFormField[] = [
  {
    name: "name",
    type: "text",
    label: "Nombre completo",
    placeholder: "Nombre completo del usuario",
    required: true,
  },
  {
    name: "email",
    type: "email",
    label: "Correo electrónico",
    placeholder: "Ingresa tu correo electrónico",
    required: true,
  },
  {
    name: "password",
    label: "Contraseña",
    type: "password",
    placeholder: "Ingresa tu contraseña",
    required: true,
  },
  {
    name: "remember",
    label: "Recuérdame",
    type: "checkbox",
  },
];

const providers = [
  {
    label: "Google",
    icon: "i-simple-icons-google",
    onClick: () => {
      toast.add({ title: "Google", description: "Login with Google" });
    },
  },
  {
    label: "GitHub",
    icon: "i-simple-icons-github",
    onClick: () => {
      toast.add({ title: "GitHub", description: "Login with GitHub" });
    },
  },
];

const schema = z.object({
  name: z
    .string("Nombre completo es requerido")
    .min(2, "Debe tener al menos 2 caracteres"),
  email: z.email("Correo electrónico inválido"),
  password: z
    .string("La contraseña es requerida")
    .min(8, "Debe tener al menos 8 caracteres"),
});

type Schema = z.output<typeof schema>;

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  const { name, email, password } = payload.data;
  isPosting.value = true;

  const isSuccessful = await register(name, email, password);

  if (!isSuccessful) {
    isPosting.value = false;
    toast.add({
      title: "Registro fallido",
      description: "No se pudo crear la cuenta con esos datos.",
    });
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema"
        title="Crear una cuenta"
        description="Ingresa tus credenciales para acceder a tu cuenta."
        icon="i-lucide-user"
        :fields="fields"
        :providers="providers"
        @submit="onSubmit"
        :loading="isPosting"
        :disabled="isPosting"
        :ui="{
          leadingIcon: 'text-5xl',
        }"
      />
    </UPageCard>

    <UButton
      color="primary"
      variant="ghost"
      label="Ya tienes cuenta? Ingresa"
      to="/login"
    />
  </div>
</template>
