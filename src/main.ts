import "./style.css";
import { WebGPUContext } from "./webgpu";
import { Renderer } from "./renderer";
import { PipelineManager } from "./pipeline";
import { Editor } from "./editor";
import { UI } from "./ui";
import { GlobalUniforms } from "./uniforms";
import { INITIAL_SHADER } from "./shaders";

async function main() {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const editorContainer = document.getElementById("editor-container") as HTMLElement;

  if (!canvas || !editorContainer) {
    console.error("Missing DOM elements");
    return;
  }

  const ui = new UI();

  try {
    const ctx = await WebGPUContext.init(canvas);
    const globalUniforms = new GlobalUniforms(ctx);
    const renderer = new Renderer(ctx);
    const pipelineManager = new PipelineManager(ctx);
    
    // Bind globals to renderer
    // Bind globals to renderer
    renderer.setBindGroups([globalUniforms.bindGroup]);

    // Handle Resize
    const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
            let width: number;
            let height: number;
            const dpr = window.devicePixelRatio || 1;

            if (entry.contentBoxSize && entry.contentBoxSize[0]) {
                 width = entry.contentBoxSize[0].inlineSize;
                 height = entry.contentBoxSize[0].blockSize;
            } else {
                 width = entry.contentRect.width;
                 height = entry.contentRect.height;
            }
            
            canvas.width = Math.max(1, Math.floor(width * dpr));
            canvas.height = Math.max(1, Math.floor(height * dpr));
        }
    });
    observer.observe(canvas);

    // Initialize Editor
    const editor = new Editor(editorContainer, INITIAL_SHADER);

    // Initial compilation
    const compile = async (code: string) => {
      try {
        const pipeline = await pipelineManager.createPipeline(code, [globalUniforms.bindGroupLayout]);
        renderer.setPipeline(pipeline);
        ui.clearError();
      } catch (err: unknown) {
        if (err instanceof Error) {
            ui.showError(err.message);
        } else {
            ui.showError("Unknown error occurred");
        }
      }
    };

    await compile(INITIAL_SHADER);

    // Handle updates
    let timeoutId: number | undefined; 
    editor.onChange((code) => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(() => {
        void compile(code);
      }, 500); 
    });

    // Start render loop
    renderer.setOnFrame((time) => {
       const width = canvas.width;
       const height = canvas.height;
       // time is in ms, convert to seconds
       globalUniforms.update(time * 0.001, width, height);
    });
    renderer.start();

  } catch (err: unknown) {
    if (err instanceof Error) {
       ui.showError(`WebGPU Init Failed: ${err.message}`);
    }
  }
}

void main();
