import { WebGPUContext } from "./webgpu";

/**
 * Manages shader compilation and pipeline creation.
 */
export class PipelineManager {
    constructor(private readonly ctx: WebGPUContext) {}

    public async createPipeline(wgslCode: string, bindGroupLayouts: GPUBindGroupLayout[] = []): Promise<GPURenderPipeline> {
        this.ctx.device.pushErrorScope("validation");

        const shaderModule = this.ctx.device.createShaderModule({
            code: wgslCode,
        });

        const pipelineLayout = this.ctx.device.createPipelineLayout({
            bindGroupLayouts: bindGroupLayouts,
        });

        const pipeline = this.ctx.device.createRenderPipeline({
            layout: pipelineLayout,
            vertex: {
                module: shaderModule,
                entryPoint: "vs_main",
            },
            fragment: {
                module: shaderModule,
                entryPoint: "fs_main",
                targets: [
                    {
                        format: this.ctx.format,
                    },
                ],
            },
            primitive: {
                topology: "triangle-list",
            },
        });

        const error = await this.ctx.device.popErrorScope();
        if (error) {
            throw new Error(`Pipeline creation failed: ${error.message}`);
        }

        return pipeline;
    }
}
