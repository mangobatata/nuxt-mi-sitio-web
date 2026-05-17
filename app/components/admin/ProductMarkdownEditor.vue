<script setup lang="ts">
import security from "@comark/nuxt/plugins/security";

const model = defineModel<string>({ required: true });

const props = withDefaults(
  defineProps<{
    id?: string;
    invalid?: boolean;
    placeholder?: string;
  }>(),
  {
    id: "markdown-editor",
    invalid: false,
    placeholder: "Describe el producto con Markdown...",
  },
);

const textareaRef = ref<HTMLTextAreaElement | null>(null);
const activeMode = ref<"write" | "preview">("write");
const markdownPlugins = [
  security({
    blockedTags: ["script", "style", "iframe", "object", "embed"],
  }),
];

const toolbarActions = [
  {
    label: "Negrita",
    icon: "i-lucide-bold",
    prefix: "**",
    suffix: "**",
    placeholder: "texto destacado",
  },
  {
    label: "Cursiva",
    icon: "i-lucide-italic",
    prefix: "_",
    suffix: "_",
    placeholder: "texto en cursiva",
  },
  {
    label: "Lista",
    icon: "i-lucide-list",
    prefix: "- ",
    suffix: "",
    placeholder: "elemento",
  },
  {
    label: "Enlace",
    icon: "i-lucide-link",
    prefix: "[",
    suffix: "](https://)",
    placeholder: "texto del enlace",
  },
];

const insertMarkdown = async (action: (typeof toolbarActions)[number]) => {
  activeMode.value = "write";
  await nextTick();

  const textarea = textareaRef.value;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = model.value.slice(start, end);
  const text = selectedText || action.placeholder;
  const insertion = `${action.prefix}${text}${action.suffix}`;

  model.value =
    model.value.slice(0, start) + insertion + model.value.slice(end);

  await nextTick();

  const selectionStart = start + action.prefix.length;
  const selectionEnd = selectionStart + text.length;
  textarea.focus();
  textarea.setSelectionRange(selectionStart, selectionEnd);
};
</script>

<template>
  <div
    class="overflow-hidden rounded-md border bg-white shadow-sm dark:bg-gray-900"
    :class="
      invalid
        ? 'border-red-500'
        : 'border-gray-300 focus-within:border-blue-500 dark:border-gray-700'
    "
  >
    <div
      class="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-950"
    >
      <div class="flex items-center gap-1">
        <UTooltip
          v-for="action in toolbarActions"
          :key="action.label"
          :text="action.label"
        >
          <UButton
            type="button"
            color="neutral"
            variant="ghost"
            size="xs"
            :icon="action.icon"
            :aria-label="action.label"
            @click="insertMarkdown(action)"
          />
        </UTooltip>
      </div>

      <div class="flex rounded-md border border-gray-200 bg-white p-0.5 dark:border-gray-800 dark:bg-gray-900">
        <button
          type="button"
          class="rounded px-3 py-1 text-xs font-medium transition"
          :class="
            activeMode === 'write'
              ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
          "
          @click="activeMode = 'write'"
        >
          Escribir
        </button>
        <button
          type="button"
          class="rounded px-3 py-1 text-xs font-medium transition"
          :class="
            activeMode === 'preview'
              ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
          "
          @click="activeMode = 'preview'"
        >
          Vista
        </button>
      </div>
    </div>

    <textarea
      v-show="activeMode === 'write'"
      :id="props.id"
      ref="textareaRef"
      v-model="model"
      rows="8"
      class="block min-h-56 w-full resize-y border-0 bg-white px-3 py-3 font-mono text-sm leading-6 text-gray-900 focus:outline-none dark:bg-gray-900 dark:text-gray-100"
      :placeholder="placeholder"
    />

    <div
      v-show="activeMode === 'preview'"
      class="markdown-content min-h-56 px-4 py-3 text-gray-900 dark:text-gray-100"
    >
      <Comark v-if="model.trim()" :markdown="model" :plugins="markdownPlugins" />
      <p v-else class="text-sm text-gray-500 dark:text-gray-400">
        La vista previa aparecerá aquí.
      </p>
    </div>
  </div>
</template>
