export class Config {
  private storage = chrome.storage.local
  private _config = {
    key: '',
    tts: 'tts-1',
    stt: 'whisper-1',
    llm: 'gpt-4o-mini',
    voice: 'alloy',
    speed: '1.1',
  }

  public get config() {
    return this._config
  }

  public async load() {
    const stored = await this.storage.get()
    const config = Object.assign({}, this._config, stored)
    this._config = config
  }

  public async set(key: keyof typeof this._config, value: string) {
    this._config[key] = value
    await this.storage.set(this._config)
  }

  public get(key: keyof typeof this._config) {
    return this._config[key]
  }
}
