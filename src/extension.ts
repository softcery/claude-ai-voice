export enum ExtensionStatus {
  Default = 'Record',
  Recording = 'Stop',
  Transcribing = 'Transcribing',
  Formatting = 'Formatting',
  Entering = 'Entering',
  Submitting = 'Submitting',
  Generating = 'Generating',
  Voicing = 'Voicing',
  Playing = 'Playing',
}

// ExtensionInterface is responsible for interacting with the extension ui
export class ExtensionInterface {
  private selectors = {
    button: 'record-button',
    buttonText: 'record-button-text',
    buttonContainer: '.flex.min-w-0.min-h-4.flex-1.items-center.pr-3',
    actions: 'button[title="Share positive feedback"]',
    play: 'play-button',
  }

  private timers = {
    record: 1000,
    play: 1000,
  }

  private elements = {
    // copied from claude ui
    record: `
      <div class="flex items-center min-w-0 max-w-full" id="${this.selectors.button}">
        <div class="min-w-24" type="button" id="radix-:r11:" aria-haspopup="menu" aria-expanded="false" data-state="closed"
          style="opacity: 1">
          <button
            class="inline-flex items-center justify-center relative shrink-0 ring-offset-2 ring-offset-bg-300 ring-accent-main-100 focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:drop-shadow-none max-w-full min-w-0 pl-1.5 pr-1 h-7 ml-0.5 mr-1 hover:bg-bg-200 hover:border-border-400 border-0.5 text-sm rounded-md border-transparent transition text-text-500 hover:text-text-200"
            type="button" data-testid="style-selector-dropdown">
            <div class="inline-flex items-center min-w-0" data-state="closed">
              <span class="flex-1 truncate -translate-y-px font-tiempos mr-px" id="${this.selectors.buttonText}">Record</span>
            
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" class="text-text-500/80 ml-1 shrink-0">
                <path d="M128,176a48.05,48.05,0,0,0,48-48V64a48,48,0,0,0-96,0v64A48.05,48.05,0,0,0,128,176ZM96,64a32,32,0,0,1,64,0v64a32,32,0,0,1-64,0Zm40,143.9V232a8,8,0,0,1-16,0V207.9A80.11,80.11,0,0,1,48,128a8,8,0,0,1,16,0,64,64,0,0,0,128,0,8,8,0,0,1,16,0A80.11,80.11,0,0,1,136,207.9Z"/>
              </svg>

            </div>
          </button>
        </div>
      </div>
    `,
    play: `
      <button id="${this.selectors.play}" class="flex flex-row items-center gap-1 rounded-md p-1 py-0.5 text-xs transition-opacity delay-100 hover:bg-bg-200">
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
          <path d="M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.32-2.35L232.4,141.51a16,16,0,0,0,0-27Z"></path>
        </svg>
        <span class="play-button-text">Play</span>
      </button>
    `,
  }

  private callbacks = {
    record: () => {},
    play: (text: string) => {},
  }

  public onRecordClick(callback: () => void) {
    this.callbacks.record = callback
  }

  public onPlayClick(callback: (text: string) => void) {
    this.callbacks.play = callback
  }

  public launch() {
    // add record button
    setInterval(() => {
      const exists = document.getElementById(this.selectors.button)
      if (exists) return

      // insert recording button
      const container = document.querySelector(this.selectors.buttonContainer)

      // Create a temporary container
      const tempContainer = document.createElement('div')
      tempContainer.innerHTML = this.elements.record

      // Get the button element (first child)
      const obj = tempContainer.firstElementChild
      obj.addEventListener('click', this.callbacks.record)

      container.appendChild(obj)
    }, this.timers.record)

    // add play buttons
    setInterval(() => {
      const actions = document.querySelectorAll(this.selectors.actions)

      // get parent elements
      const parents = Array.from(actions).map(
        (action) => action.parentElement.parentElement,
      )

      // deduplicate
      const uniqueParents = [...new Set(parents)]

      uniqueParents.forEach((action) => {
        // check if has play button
        const playButton = action.querySelector(`#${this.selectors.play}`)
        if (playButton) return

        // add play button
        const tempContainer = document.createElement('div')
        tempContainer.innerHTML = this.elements.play
        const obj = tempContainer.firstElementChild

        obj.addEventListener('click', (t) => {
          const text =
            action.parentElement.parentElement.parentElement.querySelector(
              '.font-claude-message',
            ).textContent
          this.callbacks.play(text)

          const tt = obj.querySelector('.play-button-text') as HTMLSpanElement
          if (tt.textContent == 'Play') {
            tt.textContent = 'Stop'
          } else {
            tt.textContent = 'Play'
          }
        })

        action.insertBefore(obj, action.firstChild)
      })
    }, this.timers.play)
  }

  public setStatus(status: ExtensionStatus) {
    const active =
      status === ExtensionStatus.Default || status === ExtensionStatus.Recording

    const button = document.getElementById(this.selectors.button)
    button.removeEventListener('click', this.callbacks.record)

    const buttonText = document.getElementById(
      this.selectors.buttonText,
    ) as HTMLSpanElement
    buttonText.textContent = status

    if (active) {
      button.style.cursor = 'pointer'
      button.style.opacity = '1'
      button.style.pointerEvents = 'auto'
      button.addEventListener('click', this.callbacks.record)
    } else {
      button.style.cursor = 'default'
      button.style.opacity = '0.5'
      button.style.pointerEvents = 'none'
    }
  }
}
