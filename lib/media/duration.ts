/** Reads the duration (seconds) of a local video/audio file in the browser. */
export function readMediaDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const element = document.createElement(file.type.startsWith('video/') ? 'video' : 'audio')
    element.preload = 'metadata'
    element.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      resolve(element.duration)
    }
    element.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Não foi possível ler o arquivo de mídia.'))
    }
    element.src = url
  })
}
