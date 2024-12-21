// ClaudeInterface is responsible for interacting with the claude ui
export class ClaudeInterface {
  private selectors = {
    prompt: 'div[contenteditable="true"]',
  }

  public enterPrompt = (text: string) => {
    const input = document.querySelector(this.selectors.prompt) as HTMLDivElement
    input.textContent = text
  }
}
