<script setup lang="ts">
import type { DialogRootEmits, DialogRootProps } from 'reka-ui'
import { DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogRoot, DialogTitle } from 'reka-ui'
import { X } from '@lucide/vue'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<DialogRootProps & {
    title: string
    description?: string
    class?: string
    closeOnBackdrop?: boolean
    showCloseButton?: boolean
  }>(),
  {
    closeOnBackdrop: true,
    showCloseButton: true,
  },
)

const emit = defineEmits<DialogRootEmits>()

const handleOpenChange = (value: boolean) => {
  emit('update:open', value)
}

const preventClose = (event: Event) => {
  if (!props.closeOnBackdrop) event.preventDefault()
}

const close = () => {
  if (props.closeOnBackdrop) emit('update:open', false)
}
</script>

<template>
  <DialogRoot
    :open="props.open"
    :default-open="props.defaultOpen"
    :modal="props.modal"
    :unmount-on-hide="props.unmountOnHide"
    @update:open="handleOpenChange"
  >
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0"
      />
      <DialogContent
        :disable-outside-pointer-events="!closeOnBackdrop"
        :class="cn(
          'fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-2xl border bg-background p-6 shadow-lg duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:max-w-lg',
          props.class,
        )"
        @escape-key-down="preventClose"
        @interact-outside="preventClose"
        @pointer-down-outside="preventClose"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="space-y-1.5">
            <DialogTitle class="text-lg font-semibold tracking-tight">{{ title }}</DialogTitle>
            <DialogDescription v-if="description" class="text-sm leading-relaxed text-muted-foreground">
              {{ description }}
            </DialogDescription>
          </div>
          <button
            v-if="showCloseButton"
            type="button"
            class="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close dialog"
            @click="close"
          >
            <X class="size-4" />
          </button>
        </div>

        <div class="min-w-0">
          <slot />
        </div>

        <div v-if="$slots.footer" class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <slot name="footer" />
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
