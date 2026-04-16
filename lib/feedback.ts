'use client'

import { toast } from 'sonner'

export function notifyError(message: string, eventId?: string) {
  const text = eventId ? `${message} (ref: ${eventId})` : message
  try {
    toast.error(text)
  } catch (err) {
    console.error('notifyError failed', err)
  }
}

export function notifySuccess(message: string) {
  try {
    toast.success(message)
  } catch (err) {
    console.error('notifySuccess failed', err)
  }
}

export function notifyInfo(message: string) {
  try {
    toast(message)
  } catch (err) {
    console.error('notifyInfo failed', err)
  }
}

export function notifyWarning(message: string) {
  try {
    // sonner does not include a dedicated warning variant — use generic toast
    toast(message)
  } catch (err) {
    console.error('notifyWarning failed', err)
  }
}

export function dismissToast(id?: string) {
  try {
    // dismiss single toast or all when id is undefined
    toast.dismiss(id)
  } catch (err) {
    console.error('dismissToast failed', err)
  }
}

export function notifyPromise<T = unknown>(
  promise: Promise<T>,
  messages: { loading: string; success: string | ((data: T) => string); error: string | ((err: unknown) => string) },
) {
  // toast.promise is a stable, documented sonner API.
  return toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
  })
}
// Prefer named exports; do not export default to keep imports explicit.
