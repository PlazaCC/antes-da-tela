/**
 * A tiny valid WAV (silence) the browser can decode to read its duration —
 * used as the narration presentation, so no real media file is needed.
 */
export function silentWav(seconds = 2, sampleRate = 8000): Buffer {
  const samples = seconds * sampleRate
  const buffer = Buffer.alloc(44 + samples)
  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + samples, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16) // PCM chunk size
  buffer.writeUInt16LE(1, 20) // PCM
  buffer.writeUInt16LE(1, 22) // mono
  buffer.writeUInt32LE(sampleRate, 24)
  buffer.writeUInt32LE(sampleRate, 28) // byte rate (8-bit mono)
  buffer.writeUInt16LE(1, 32) // block align
  buffer.writeUInt16LE(8, 34) // bits per sample
  buffer.write('data', 36)
  buffer.writeUInt32LE(samples, 40)
  buffer.fill(128, 44) // 8-bit silence
  return buffer
}
