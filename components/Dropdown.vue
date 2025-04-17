<script setup lang="ts">
export interface DropdownItem {
  label: string;
  value: string;
}

interface DropdownProps {
  items: DropdownItem[];
  label: string;
}

const props = defineProps<DropdownProps>();

</script>

<template>
  <UDropdown
    :items="[props.items]"
    :popper="{ arrow: true, placement: 'bottom' }"
  >
    <UButton
      color="primary"
      class="w-48 flex justify-between"
      :label="props.label"
      trailing-icon="i-heroicons-chevron-down-20-solid"
    />
    <template #item="{ item }">
      <span class="truncate">{{ item.label }}</span>
    </template>
  </UDropdown>
</template>
