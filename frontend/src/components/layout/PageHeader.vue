<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  icon: Component
  title: string
  subtitle?: string
  gradient?: string
}>()
</script>

<template>
  <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
    <div class="flex items-center gap-4">
      <span
        class="grid size-12 shrink-0 place-items-center rounded-2xl text-white shadow-lg"
        :class="gradient ?? 'brand-gradient'"
      >
        <component :is="icon" class="size-6" />
      </span>
      <div>
        <h2 class="text-xl font-bold tracking-tight sm:text-2xl">{{ title }}</h2>
        <p v-if="subtitle" class="text-sm text-muted-foreground">{{ subtitle }}</p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <slot />
    </div>
  </div>
</template>