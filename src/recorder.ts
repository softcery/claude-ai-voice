export class Recorder {
  public isRecording: boolean = false
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private stream: MediaStream | null = null
  private recordingPromise: Promise<Blob> | null = null
  private recordingResolve: ((blob: Blob) => void) | null = null

  /**
   * Starts recording audio from the microphone
   * @returns Promise that resolves with the recorded audio blob
   * @throws Error if recording is already in progress or if microphone access is denied
   */
  public async record(): Promise<Blob> {
    if (this.isRecording) {
      throw new Error('Recording is already in progress')
    }

    try {
      await this.initializeRecording()
      this.startRecording()
      return this.recordingPromise!
    } catch (error) {
      throw new Error(`Error accessing microphone: ${error}`)
    }
  }

  /**
   * Stops the current recording
   * @throws Error if no recording is in progress
   */
  public stopRecording(): void {
    if (!this.isRecording || !this.mediaRecorder) {
      throw new Error('No recording in progress')
    }
    this.mediaRecorder.stop()
  }

  private async initializeRecording(): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    this.audioChunks = []
    this.mediaRecorder = new MediaRecorder(this.stream)
    this.isRecording = true

    this.recordingPromise = new Promise((resolve) => {
      this.recordingResolve = resolve
    })
  }

  private startRecording(): void {
    if (!this.mediaRecorder) return

    this.setupRecordingHandlers()
    this.mediaRecorder.start()
  }

  private setupRecordingHandlers(): void {
    if (!this.mediaRecorder) return

    this.mediaRecorder.ondataavailable = (event) => {
      this.audioChunks.push(event.data)
    }

    this.mediaRecorder.onstop = () => {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' })
      this.cleanup()

      if (this.recordingResolve) {
        this.recordingResolve(audioBlob)
        this.recordingResolve = null
      }
    }
  }

  private cleanup(): void {
    this.isRecording = false

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
      this.stream = null
    }

    this.mediaRecorder = null
    this.audioChunks = []
  }
}
