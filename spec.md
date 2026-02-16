## Proposal: Web App for Testing WGSL Shaders (WebGPU)

This document specifies a minimal but extensible web application that allows dynamic editing, compilation, and execution of WGSL shaders in the browser using WebGPU. It is written for implementation by a coding agent.

---

# 1. Goals

* Edit WGSL shader code in-browser
* Compile dynamically
* Display validation errors
* Render output to canvas
* Support hot-reload
* Extensible to compute shaders and post-processing

---

# 2. Technology Stack

* WebGPU (browser API)
* WGSL (shader language)
* TypeScript
* React
* Editor component:

  * Monaco Editor (recommended)
  * or CodeMirror

---

# 3. Application Architecture

## Core Components

### 1. Editor Module

* Displays WGSL source
* Emits change events
* Provides "Compile" trigger
* Optional: debounce auto-compile

### 2. WebGPU Module

* Initializes adapter/device
* Configures canvas context
* Creates pipelines
* Handles error scopes

### 3. Renderer

* Creates fullscreen quad
* Recreates pipeline on shader change
* Executes render pass

### 4. Error Panel

* Displays validation or compilation errors
* Highlights lines

---

# 4. Directory Structure

```
/src
  main.ts
  webgpu.ts
  renderer.ts
  pipeline.ts
  editor.ts
  ui.ts
index.html
```

---

# 5. Implementation Specification

## 5.1 WebGPU Initialization

Requirements:

* Check `navigator.gpu`
* Request adapter
* Request device
* Configure canvas context

Behavior:

* Fail gracefully if unsupported
* Store device globally or via dependency injection

---

## 5.2 Shader Requirements

User-provided WGSL must contain:

```
@vertex
fn vs_main(...) -> ...
```

```
@fragment
fn fs_main(...) -> ...
```

Assume a fixed fullscreen triangle or quad vertex layout for simplicity.

---

## 5.3 Pipeline Creation

Steps:

1. Create shader module:

   ```
   device.createShaderModule({ code })
   ```

2. Create render pipeline:

   * layout: "auto"
   * primitive: triangle-list
   * target format: preferred canvas format

3. Wrap in error scope:

   ```
   device.pushErrorScope("validation")
   ...
   await device.popErrorScope()
   ```

If error:

* Display error.message
* Do not replace existing pipeline

---

## 5.4 Render Loop

Simple continuous loop:

```
requestAnimationFrame(render)
```

Each frame:

* Acquire current texture
* Begin render pass
* Set pipeline
* Draw fullscreen quad
* Submit

Optional:

* Pass time uniform
* Pass resolution uniform

---

# 6. Live Reload Behavior

Editor change event:

* Debounce 200–500ms
* Attempt recompilation
* If success → swap pipeline
* If failure → keep previous pipeline

---

# 7. Uniform System (Optional Enhancement)

Detect pattern:

```
@group(0) @binding(0)
var<uniform> params : Params;
```

Future extension:

* Parse struct
* Auto-generate sliders
* Update uniform buffer on change

---

# 8. Compute Shader Support (Future Extension)

Add mode switch:

* Render Mode
* Compute Mode

For compute:

* Require:

  ```
  @compute @workgroup_size(...)
  fn cs_main(...)
  ```
* Create compute pipeline
* Dispatch workgroups
* Visualize output via storage texture

---

# 9. Error Handling Strategy

Must handle:

* Shader validation errors
* Pipeline creation errors
* Device lost
* Unsupported WebGPU

Display:

* Raw error message
* Preserve previous working pipeline

---

# 10. Minimal Working Version (MVP)

MVP must include:

* WGSL editor
* Compile button
* Error panel
* Fullscreen fragment shader rendering
* Continuous frame loop
* Pipeline hot reload

---

# 11. Reference Implementations

For design inspiration:

* WebGPU Samples
* Shadertoy

---

# 12. Advanced Extensions

Future capabilities:

* Multiple render passes
* Frame graph system
* Buffer inspector
* Texture upload UI
* Timestamp queries
* IndexedDB project saving
* WGSL AST parser (WASM)

---

# 13. Implementation Priority Order

1. WebGPU initialization
2. Fullscreen triangle rendering
3. Dynamic WGSL compilation
4. Error display
5. Live reload
6. Uniform UI
7. Compute mode

---

If needed, this specification can be refined into:

* A detailed class diagram
* A complete TypeScript scaffold
* A production-ready project template
* Or a version specialized for FXAA / post-processing validation
