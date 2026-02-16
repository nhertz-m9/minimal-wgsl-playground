import * as monaco from "monaco-editor";

/**
 * Manages the Monaco Editor instance.
 */
export class Editor {
    private readonly instance: monaco.editor.IStandaloneCodeEditor;

    constructor(container: HTMLElement, initialCode: string) {
        this.instance = monaco.editor.create(container, {
            value: initialCode,
            language: "wgsl", // Monaco doesn't have built-in WGSL, we'll use 'rust' or 'cpp' or plain text for now, or register a basic one.
            // basic config
            theme: "vs-dark",
            automaticLayout: true,
            minimap: { enabled: false },
        });
    }

    getCode(): string {
        return this.instance.getValue();
    }

    onChange(callback: (code: string) => void): void {
        this.instance.onDidChangeModelContent(() => {
            callback(this.instance.getValue());
        });
    }
}
