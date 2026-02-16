/**
 * WebGPU Context Management
 */
export class WebGPUContext {
    private constructor(
        public readonly device: GPUDevice,
        public readonly adapter: GPUAdapter,
        public readonly canvas: HTMLCanvasElement,
        public readonly context: GPUCanvasContext,
        public readonly format: GPUTextureFormat
    ) {}

    static async init(canvas: HTMLCanvasElement): Promise<WebGPUContext> {
        if (!navigator.gpu) {
            throw new Error("WebGPU is not supported in this browser.");
        }

        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            throw new Error("Failed to request WebGPU adapter.");
        }

        const device = await adapter.requestDevice();
        const context = canvas.getContext("webgpu");
        if (!context) {
            throw new Error("Failed to get WebGPU context.");
        }

        const format = navigator.gpu.getPreferredCanvasFormat();
        context.configure({
            device,
            format,
            alphaMode: "premultiplied",
        });

        return new WebGPUContext(device, adapter, canvas, context, format);
    }
}
