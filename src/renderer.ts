import { WebGPUContext } from "./webgpu";

/**
 * Handles the render loop and drawing operations.
 */
export class Renderer {
    private animationFrameId: number | null = null;

    constructor(
        private readonly ctx: WebGPUContext,
        private pipeline: GPURenderPipeline | null = null,
        private bindGroups: GPUBindGroup[] = [],
        private onFrame?: (time: number) => void
    ) {}

    setOnFrame(callback: (time: number) => void): void {
        this.onFrame = callback;
    }

    start(): void {
        this.animationFrameId = requestAnimationFrame(this.render);
    }

    stop(): void {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    setPipeline(pipeline: GPURenderPipeline): void {
        this.pipeline = pipeline;
    }

    setBindGroups(bindGroups: GPUBindGroup[]): void {
        this.bindGroups = bindGroups;
    }

    private render = (time: number): void => {
        if (this.onFrame) {
            this.onFrame(time);
        }

        if (!this.pipeline) {
            this.animationFrameId = requestAnimationFrame(this.render);
            return;
        }

        const commandEncoder = this.ctx.device.createCommandEncoder();
        const textureView = this.ctx.context.getCurrentTexture().createView();

        const passEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [
                {
                    view: textureView,
                    clearValue: { r: 0, g: 0, b: 0, a: 1 },
                    loadOp: "clear",
                    storeOp: "store",
                },
            ],
        });

        passEncoder.setPipeline(this.pipeline);
        
        for (let i = 0; i < this.bindGroups.length; i++) {
            passEncoder.setBindGroup(i, this.bindGroups[i]);
        }

        passEncoder.draw(3); // Fullscreen triangle
        passEncoder.end();

        this.ctx.device.queue.submit([commandEncoder.finish()]);

        this.animationFrameId = requestAnimationFrame(this.render);
    };
}
