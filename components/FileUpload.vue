<template>
  <label
    class="h-14 flex items-center justify-center border-2 border-dashed rounded cursor-pointer text-gray-500 hover:bg-gray-800"
    :class="[$attrs.class]"
  >
    <input
      type="file"
      class="hidden"
      :accept="accept"
      @change="handleFileChange"
    />
    <span>{{ fileLabel }}</span>
  </label>
</template>

<script setup lang="ts">
const modelValue = defineModel<File | null>();

 defineProps<{
  accept?: string;
}>();

const fileLabel = computed(() => {
  return modelValue.value?.name ?? 'Click to upload';
});

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = input.files;
  modelValue.value = files && files.length > 0 ? files[0] : null;
}
</script>
