import showToast from './toast'

export function notifyError(message: string, eventId?: string) {
  const text = eventId ? `${message} (ref: ${eventId})` : message
  try {
    showToast(text)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('notifyError failed', err)
  }
}

export function notifySuccess(message: string) {
  try {
    showToast(message)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('notifySuccess failed', err)
  }
}

export default {
  notifyError,
  notifySuccess,
}
