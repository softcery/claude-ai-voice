import OpenAI from 'openai'
import { SpeechCreateParams } from 'openai/resources/audio/speech.mjs'

// base interfaces
export interface STT {
  // transcribe audio to text
  transcribe(audio: Blob): Promise<string>
}

export interface TTS {
  // turn text to speech audio
  speak(text: string): Promise<Blob>
}

export interface LLM {
  // generate text response
  chat(message: string): Promise<string>
}

// openai implementation
export class AIOpenAI implements STT, TTS, LLM {
  private openai: OpenAI

  constructor(
    public config = {
      key: '',
      tts: 'tts-1',
      stt: 'whisper-1',
      llm: 'gpt-4o-mini',
      voice: 'echo' as SpeechCreateParams['voice'],
      speed: 1.2,
    },
  ) {
    this.openai = new OpenAI({
      apiKey: this.config.key,
      dangerouslyAllowBrowser: true,
    })
  }

  public setKey(key: string) {
    this.config.key = key
    this.openai = new OpenAI({
      apiKey: this.config.key,
      dangerouslyAllowBrowser: true,
    })
  }

  public transcribe(audio: Blob): Promise<string> {
    return this.openai.audio.transcriptions
      .create({
        file: new File([audio], 'audio.mp3'),
        model: this.config.stt,
      })
      .then((t) => t.text)
  }

  public speak(text: string): Promise<Blob> {
    return this.openai.audio.speech
      .create({
        model: this.config.tts,
        voice: this.config.voice,
        speed: this.config.speed,
        response_format: 'mp3',
        input: text,
      })
      .then((t) => t.blob())
  }

  public chat(message: string): Promise<string> {
    return this.openai.chat.completions
      .create({
        model: this.config.llm,
        messages: [{ role: 'user', content: message }],
      })
      .then((c) => c.choices[0].message.content)
  }
}
