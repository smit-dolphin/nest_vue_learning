<script setup lang="ts">
import { Sparkles } from '@lucide/vue'
import { useRouter } from 'vue-router'

import { Button } from '@/components/ui/button'

const router = useRouter()
</script>

<template>
  <div class="grid min-h-screen place-items-center bg-background p-6">
    <div class="flex flex-col items-center text-center">
      <span class="brand-gradient grid size-20 place-items-center rounded-3xl text-white shadow-xl shadow-indigo-500/30">
        <Sparkles class="size-9" />
      </span>
      <p class="mt-6 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Error 404</p>
      <h1 class="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">Page not found</h1>
      <p class="mt-3 max-w-md text-sm text-muted-foreground">
        The page you're looking for doesn't exist or has been moved. Let's get you back home.
      </p>
      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <Button size="lg" @click="router.push('/')">Back to dashboard</Button>
        <Button variant="outline" size="lg" @click="router.back()">Go back</Button>
      </div>
    </div>
  </div>
</template>