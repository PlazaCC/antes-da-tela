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

export async function notifyPromise<T = unknown>(
  promise: Promise<T>,
  messages: { loading: string; success: string | ((data: T) => string); error: string | ((err: unknown) => string) },
) {
  try {
    const maybeToast = toast as unknown as {
      promise?: (
        p: Promise<T>,
        opts: {
          loading: string
          success: string | ((data: T) => string)
          error: string | ((err: unknown) => string)
        },
      ) => Promise<T>
    }

    if (typeof maybeToast.promise === 'function') {
      return maybeToast.promise(promise, {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      })
    }

    // Fallback: show loading, await, then show success/error
    const id = toast(messages.loading)
    try {
      const res = await promise
      dismissToast(String(id))
      const text = typeof messages.success === 'function' ? messages.success(res) : messages.success
      notifySuccess(text)
      return res
    } catch (err) {
      dismissToast(String(id))
      const text = typeof messages.error === 'function' ? messages.error(err) : messages.error
      notifyError(text)
      throw err
    }
  } catch (err) {
    console.error('notifyPromise failed', err)
    return promise
  }
}
// Prefer named exports; do not export default to keep imports explicit.
