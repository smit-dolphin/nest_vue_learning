import { ref, type Ref } from 'vue'
import type { z } from 'zod'

type FieldErrors = Record<string, string>

/**
 * Lightweight zod-powered validation helper.
 * Returns a reactive errors map keyed by field name.
 */
export function useForm<T extends z.ZodTypeAny>(schema: T) {
  const errors = ref<FieldErrors>({}) as Ref<FieldErrors>

  const withoutField = (field: string): FieldErrors => {
    const next: FieldErrors = {}
    for (const [key, value] of Object.entries(errors.value)) {
      if (key !== field) next[key] = value
    }
    return next
  }

  const collectErrors = (values: unknown): FieldErrors => {
    const result = schema.safeParse(values)
    if (result.success) return {}

    const next: FieldErrors = {}
    for (const issue of result.error.issues) {
      const field = String(issue.path[0] ?? '')
      if (field && next[field] === undefined) next[field] = issue.message
    }
    return next
  }

  const validate = (values: z.infer<T>): boolean => {
    errors.value = collectErrors(values)
    return Object.keys(errors.value).length === 0
  }

  const touchField = (values: z.infer<T>, field: string) => {
    const fieldErrors = collectErrors(values)
    if (fieldErrors[field]) {
      errors.value = { ...withoutField(field), [field]: fieldErrors[field] }
    } else {
      errors.value = withoutField(field)
    }
  }

  const clearField = (field: string) => {
    errors.value = withoutField(field)
  }

  const clearErrors = () => {
    errors.value = {}
  }

  return { errors, validate, touchField, clearField, clearErrors }
}