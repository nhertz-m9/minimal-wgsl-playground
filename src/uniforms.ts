import { WebGPUContext } from "./webgpu";

/**
 * Manages global uniforms (Time, Resolution, etc.)
 * Layout:
 * struct Globals {
 *   time: f32,
 *   resolution: vec2<f32>,
 *   _pad: f32, // Padding to align to 16 bytes if needed, though vec2<f32> + f32 is 12 bytes. 
 *              // WGSL struct alignment rules: 
 *              // time (0), resolution (4-11), total 12. 
 *              // But usually 16-byte alignment is safer or required for uniform buffers if array or struct is larger.
 *              // Let's use: time(f32), resolution(vec2f), mouse(vec2f)? 
 *              // For now: time (f32), resolution (vec2f).
 *              // Layout: 
 *              // Offset 0: time (f32)
 *              // Offset 4: resolution.x (f32)
 *              // Offset 8: resolution.y (f32)
 *              // Size: 12 bytes. aligned to 16 bytes for uniform buffer binding usually recommended.
 * }
 */
export class GlobalUniforms {
    public readonly bindGroupName = "globals";
    public readonly bindGroupLayout: GPUBindGroupLayout;
    public readonly bindGroup: GPUBindGroup;
    
    private readonly buffer: GPUBuffer;
    private readonly values: Float32Array<ArrayBuffer>;

    constructor(private readonly ctx: WebGPUContext) {
        // Size: 4 floats (time, res.x, res.y, padding) = 16 bytes
        const byteSize = 4 * 4; 
        
        this.buffer = ctx.device.createBuffer({
            size: byteSize,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this.values = new Float32Array(4);

        this.bindGroupLayout = ctx.device.createBindGroupLayout({
            label: "globals-layout",
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX,
                    buffer: {
                        type: "uniform",
                    },
                },
            ],
        });

        this.bindGroup = ctx.device.createBindGroup({
            label: "globals-bind-group",
            layout: this.bindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.buffer,
                    },
                },
            ],
        });
    }

    public update(time: number, width: number, height: number): void {
        this.values[0] = time;
        this.values[1] = 0; // Padding
        this.values[2] = width;
        this.values[3] = height;
        
        this.ctx.device.queue.writeBuffer(
            this.buffer,
            0,
            this.values
        );
    }
}
