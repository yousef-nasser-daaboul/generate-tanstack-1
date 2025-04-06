<script setup lang="ts">
defineProps<{ label: string; placeholder: string }>();

const errorMsg = defineModel<string>("errorMsg");
const value = defineModel<string>("value");
</script>

<template>
  <div>
    <UFormField :label="label" :error="errorMsg">
      <UInput v-model="value" :placeholder="placeholder" class="w-full" />
    </UFormField>
  </div>
</template>
