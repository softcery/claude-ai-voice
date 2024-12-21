import { Recorder } from './recorder'
import { ClaudeInterface } from './claude'
import { ExtensionInterface, ExtensionStatus } from './extension'
import { AudioPlayer } from './player'
import { AIOpenAI } from './ai'
import { Config } from './config'
import { SpeechCreateParams } from 'openai/resources/audio/speech.mjs'

export class Application {
  private config = new Config()

  private extension = new ExtensionInterface()
  private claude = new ClaudeInterface()
  private recorder = new Recorder()
  private player = new AudioPlayer()

  private stt = new AIOpenAI()
  private tts = new AIOpenAI()
  private llm = new AIOpenAI()

  public async start() {
    console.log('Starting Application')

    await this.config.load()
    const { config } = this.config
    if (!config.key) {
      throw new Error('OpenAI API key is not set')
    }

    this.llm.setKey(config.key)
    this.tts.setKey(config.key)
    this.stt.setKey(config.key)

    this.tts.config.tts = config.tts
    this.tts.config.voice = config.voice as SpeechCreateParams['voice']
    this.tts.config.speed = parseFloat(config.speed)
    this.llm.config.llm = config.llm
    this.stt.config.stt = config.stt

    this.extension.onRecordClick(async () => {
      if (this.recorder.isRecording) {
        this.recorder.stopRecording()
      } else {
        await this.round()
      }
    })

    let prevText = ''

    this.extension.onPlayClick(async (text) => {
      if (this.player.isPlaying()) {
        this.player.pause()
      } else {
        if (prevText === text) {
          this.player.resume()
        } else {
          const audio = await this.tts.speak(text)
          this.player.play(audio)
        }
      }

      prevText = text
    })

    this.extension.launch()
  }

  private round = async () => {
    // record voice
    this.extension.setStatus(ExtensionStatus.Recording)
    const speech = await this.recorder.record()
    console.log('speech', speech)

    // transcribe voice
    this.extension.setStatus(ExtensionStatus.Transcribing)
    const transcription = await this.stt.transcribe(speech)
    console.log('transcription', transcription)

    // format and fix transcription
    this.extension.setStatus(ExtensionStatus.Formatting)
    const completion = await this.llm.chat(
      `You are a helpful assistant that formats and fixes transcribed text. Correct any obvious transcription errors and add proper punctuation and capitalization. Output ONLY the result as text. Input transcription: ${transcription}`,
    )
    console.log('completion', completion)

    // enter propmt
    this.extension.setStatus(ExtensionStatus.Entering)
    await this.claude.enterPrompt(completion)

    this.extension.setStatus(ExtensionStatus.Default)
  }
}
