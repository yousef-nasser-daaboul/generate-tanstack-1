<script setup lang="ts">
interface DropdownProps {
  items: string[];
  label: string;
}

const props = defineProps<DropdownProps>();
const selected = defineModel<string>();
</script>

<template>
  <div class="flex flex-col">
    <label class="text-green-400">{{ props.label }}</label>
    <USelect v-model="selected" :items="props.items" />
  </div>
</template>
