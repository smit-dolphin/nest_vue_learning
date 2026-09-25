<script setup lang="ts">
import type { AlertDialogEmits, AlertDialogProps } from 'reka-ui'
import { AlertDialogContent, AlertDialogDescription, AlertDialogOverlay, AlertDialogPortal, AlertDialogRoot, AlertDialogTitle } from 'reka-ui'
import { AlertTriangle, Loader2 } from '@lucide/vue'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<AlertDialogProps & {
    title: string
    description: string
    confirmLabel?: string
    cancelLabel?: string
    loading?: boolean
    class?: string
  }>(),
  {
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    loading: false,
  },
)

const emit = defineEmits<AlertDialogEmits & {
  confirm: []
  cancel: []
}>()

const handleOpenChange = (value: boolean) => {
  if (!value && props.loading) return
  emit('update:open', value)
}

const preventClose = (event: Event) => {
  if (props.loading) event.preventDefault()
}

const cancel = () => {
  if (props.loading) return
  emit('cancel')
  emit('update:open', false)
}
</script>

<template>
  <AlertDialogRoot
    :open="props.open"
    :default-open="props.defaultOpen"
    :unmount-on-hide="props.unmountOnHide"
    @update:open="handleOpenChange"
  >
    <AlertDialogPortal>
      <AlertDialogOverlay class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
      <AlertDialogContent
        :class="cn(
          'fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-5 rounded-2xl border bg-background p-6 shadow-lg duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:max-w-md',
          props.class,
        )"
        @escape-key-down="preventClose"
      >
        <div class="flex items-start gap-4">
          <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-destructive/10 text-destructive">
            <AlertTriangle class="size-5" />
          </span>
          <div class="min-w-0 space-y-2">
            <AlertDialogTitle class="text-lg font-semibold tracking-tight">{{ title }}</AlertDialogTitle>
            <AlertDialogDescription class="text-sm leading-relaxed text-muted-foreground">
              {{ description }}
            </AlertDialogDescription>
            <slot />
          </div>
        </div>

        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" :disabled="loading" @click="cancel">
            {{ cancelLabel }}
          </Button>
          <Button type="button" variant="destructive" :disabled="loading" @click="emit('confirm')">
            <Loader2 v-if="loading" class="size-4 animate-spin" />
            {{ loading ? 'Deleting…' : confirmLabel }}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialogPortal>
  </AlertDialogRoot>
</template>
