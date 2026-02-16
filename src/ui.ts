/**
 * Manages UI elements like the error panel.
 */
export class UI {
    private readonly errorPanel: HTMLElement;

    constructor() {
        // We'll create the UI elements dynamically or assume they exist in HTML
        this.errorPanel = document.createElement("div");
        this.errorPanel.id = "error-panel";
        this.errorPanel.style.position = "absolute";
        this.errorPanel.style.bottom = "0";
        this.errorPanel.style.left = "0";
        this.errorPanel.style.width = "100%";
        this.errorPanel.style.padding = "10px";
        this.errorPanel.style.backgroundColor = "rgba(255, 0, 0, 0.8)";
        this.errorPanel.style.color = "white";
        this.errorPanel.style.fontFamily = "monospace";
        this.errorPanel.style.display = "none";
        document.body.appendChild(this.errorPanel);
    }

    showError(message: string): void {
        this.errorPanel.textContent = message;
        this.errorPanel.style.display = "block";
    }

    clearError(): void {
        this.errorPanel.textContent = "";
        this.errorPanel.style.display = "none";
    }
}
