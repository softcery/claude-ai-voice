export class AudioPlayer {
  public audio: HTMLAudioElement | null = null

  public play(audioBlob: Blob): Promise<void> {
    // Stop any currently playing audio
    this.stop()

    // Create and play new audio
    this.audio = new Audio(URL.createObjectURL(audioBlob))

    return new Promise((resolve) => {
      if (!this.audio) return resolve()

      this.audio.addEventListener('ended', () => {
        this.stop()
        resolve()
      })

      this.audio.play()
    })
  }

  public stop(): void {
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0
      this.audio = null
    }
  }

  public pause(): void {
    if (this.audio) {
      this.audio.pause()
    }
  }

  public resume(): void {
    if (this.audio) {
      this.audio.play()
    }
  }

  public isPlaying(): boolean {
    return this.audio !== null && !this.audio?.paused
  }
}
