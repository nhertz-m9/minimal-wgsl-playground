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

fn palette(t: f32) -> vec3<f32> {
    let a = vec3<f32>(0.5, 0.5, 0.5);
    let b = vec3<f32>(0.5, 0.5, 0.5);
    let c = vec3<f32>(1.0, 1.0, 1.0);
    let d = vec3<f32>(0.263, 0.416, 0.557);

    return a + b * cos(6.28318 * (c * t + d));
}

@fragment
fn fs_main(@location(0) uv : vec2<f32>) -> @location(0) vec4<f32> {
    var uv0 = (uv - 0.5) * 2.0;
    // Aspect ratio correction
    uv0.x *= globals.resolution.x / globals.resolution.y;
    
    var uv_final = uv0;
    var color = vec3<f32>(0.0);

    for (var i = 0.0; i < 4.0; i += 1.0) {
        uv_final = fract(uv_final * 1.5) - 0.5;

        var d = length(uv_final) * exp(-length(uv0));

        var col = palette(length(uv0) + i * 0.4 + globals.time * 0.4);

        d = sin(d * 8.0 + globals.time) / 8.0;
        d = abs(d);

        d = pow(0.01 / d, 1.2);

        color += col * d;
    }

    return vec4<f32>(color, 1.0);
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
