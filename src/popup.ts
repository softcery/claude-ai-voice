import { Config } from './config'

const config = new Config()

// Load saved values from storage
document.addEventListener('DOMContentLoaded', async () => {
  await config.load()

  // Update UI with loaded values
  Object.entries(config.config).forEach(([key, value]) => {
    const element = document.getElementById(key)
    if (element) {
      // @ts-expect-error
      element.value = value
      if (key === 'speed') {
        document.getElementById('speed-value').textContent = value
      }
    }
  })
})

// Save values to storage when changed
document.querySelectorAll('select, input').forEach((element) => {
  element.addEventListener('change', async (e) => {
    // @ts-expect-error
    const { id, value } = e.target
    await config.set(id as keyof typeof config.config, value)

    if (id === 'speed') {
      document.getElementById('speed-value').textContent = value
    }
  })
})