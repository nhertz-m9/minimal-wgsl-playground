import "./style.css";
import { WebGPUContext } from "./webgpu";
import { Renderer } from "./renderer";
import { PipelineManager } from "./pipeline";
import { Editor } from "./editor";
import { UI } from "./ui";
import { GlobalUniforms } from "./uniforms";

const INITIAL_SHADER = `
struct Globals {
    time: f32,
    resolution: vec2<f32>,
};

@group(0) @binding(0) var<uniform> globals: Globals;

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
  // Use time to animate color
  let r = 0.5 + 0.5 * sin(globals.time);
  let g = uv.x;
  let b = uv.y;
  return vec4<f32>(r, g, b, 1.0);
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
    const globalUniforms = new GlobalUniforms(ctx);
    const renderer = new Renderer(ctx);
    const pipelineManager = new PipelineManager(ctx);
    
    // Bind globals to renderer
    renderer.setBindGroups([globalUniforms.bindGroup]);

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
