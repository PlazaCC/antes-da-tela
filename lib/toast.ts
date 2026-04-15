export function showToast(message: string, timeout = 4000) {
  if (typeof document === 'undefined') return

  const id = `toast-${Date.now()}`
  const el = document.createElement('div')
  el.id = id
  el.setAttribute('role', 'status')
  el.style.position = 'fixed'
  el.style.right = '16px'
  el.style.bottom = '16px'
  el.style.zIndex = '9999'
  el.style.background = 'rgba(0,0,0,0.85)'
  el.style.color = 'white'
  el.style.padding = '10px 14px'
  el.style.borderRadius = '8px'
  el.style.fontSize = '14px'
  el.style.boxShadow = '0 6px 18px rgba(0,0,0,0.2)'
  el.textContent = message

  document.body.appendChild(el)

  setTimeout(() => {
    el.style.transition = 'opacity 200ms ease'
    el.style.opacity = '0'
    setTimeout(() => el.remove(), 250)
  }, timeout)
}

export default showToast
