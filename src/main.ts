import "./style.css";
import { WebGPUContext } from "./webgpu";
import { Renderer } from "./renderer";
import { PipelineManager } from "./pipeline";
import { Editor } from "./editor";
import { UI } from "./ui";

const INITIAL_SHADER = `
struct VertexOutput {
  @builtin(position) position : vec4<f32>,
  @location(0) uv : vec2<f32>,
};

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex : u32) -> VertexOutput {
  var pos = array<vec2<f32>, 3>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>( 3.0, -1.0),
    vec2<f32>(-1.0,  3.0)
  );

  var output : VertexOutput;
  output.position = vec4<f32>(pos[vertexIndex], 0.0, 1.0);
  output.uv = output.position.xy * 0.5 + 0.5;
  return output;
}

@fragment
fn fs_main(@location(0) uv : vec2<f32>) -> @location(0) vec4<f32> {
  return vec4<f32>(uv, 0.5, 1.0);
}
`;

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
    const renderer = new Renderer(ctx);
    const pipelineManager = new PipelineManager(ctx);
    
    // Initialize Editor
    const editor = new Editor(editorContainer, INITIAL_SHADER);

    // Initial compilation
    const compile = async (code: string) => {
      try {
        const pipeline = await pipelineManager.createPipeline(code);
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
    // Simple debounce
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
    renderer.start();

  } catch (err: unknown) {
    if (err instanceof Error) {
       ui.showError(`WebGPU Init Failed: ${err.message}`);
    }
  }
}

void main();
