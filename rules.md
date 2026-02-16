# TypeScript Best Practices

For a WebGPU / WGSL Shader Playground Application

This document defines strict TypeScript coding standards. These rules are
mandatory unless explicitly justified.

---

# 1. Compiler Configuration (Mandatory)

`tsconfig.json` must enable strict type safety:

```json
{
    "compilerOptions": {
        "strict": true,
        "noImplicitAny": true,
        "strictNullChecks": true,
        "noUncheckedIndexedAccess": true,
        "exactOptionalPropertyTypes": true,
        "noImplicitOverride": true,
        "noFallthroughCasesInSwitch": true,
        "useUnknownInCatchVariables": true
    }
}
```

Disabling any of these requires documented justification.

---

# 2. Type Safety Rules

## 2.1 `any` is Prohibited

- `any` must never be used.
- If type is unknown → use `unknown`.
- If narrowing is required → use type guards.

Incorrect:

```ts
function parse(data: any) {}
```

Correct:

```ts
function parse(data: unknown) {
  if (typeof data === "string") {
    ...
  }
}
```

---

## 2.2 Avoid Type Assertions (`as`)

- `as` must not be used unless:

  - Interfacing with browser APIs
  - Narrowing after runtime validation

Prohibited:

```ts
const x = value as number;
```

Allowed only with guard:

```ts
if (typeof value === "number") {
    const x = value;
}
```

---

## 2.3 No Non-Null Assertion (`!`)

Prohibited:

```ts
adapter!.requestDevice();
```

Required:

```ts
if (!adapter) {
    throw new Error("Adapter not available");
}
```

---

# 3. Explicit Typing Rules

## 3.1 Public APIs Must Be Explicitly Typed

All exported functions must declare:

- Parameter types
- Return type

Incorrect:

```ts
export function init(device) {}
```

Correct:

```ts
export function init(device: GPUDevice): GPURenderPipeline {}
```

---

## 3.2 No Implicit Return Types on Public Methods

Internal private methods may rely on inference. Exported or class public methods
must declare return types.

---

## 3.3 Prefer `interface` for Public Contracts

Use:

- `interface` for object shapes
- `type` for unions and utility compositions

Example:

```ts
interface RendererConfig {
    canvas: HTMLCanvasElement;
    format: GPUTextureFormat;
}
```

---

# 4. Nullability Rules

## 4.1 Explicit Nullable Types

Never rely on implicit undefined.

Correct:

```ts
let pipeline: GPURenderPipeline | null = null;
```

---

## 4.2 Narrow Before Use

```ts
if (this.pipeline === null) {
    return;
}
```

Direct usage without check is forbidden.

---

# 5. Immutability Rules

## 5.1 Prefer `const`

- Default to `const`
- Use `let` only when reassignment required
- Never use `var`

---

## 5.2 Readonly by Default

For config objects:

```ts
interface Config {
    readonly width: number;
    readonly height: number;
}
```

For arrays:

```ts
readonly number[]
```

---

# 6. Function Design Rules

## 6.1 Single Responsibility

Functions must:

- Perform one logical task
- Not exceed ~40 lines
- Avoid nested complexity

---

## 6.2 Pure Functions Preferred

Utility logic must not:

- Mutate external state
- Depend on global variables

---

## 6.3 No Boolean Parameter Smell

Avoid:

```ts
function compile(reload: boolean);
```

Prefer:

```ts
function compileWithReload();
function compileOnce();
```

---

# 7. Error Handling Rules

## 7.1 Never Swallow Errors

Prohibited:

```ts
try {
} catch {}
```

Correct:

```ts
try {
} catch (err: unknown) {
    if (err instanceof Error) {
        console.error(err.message);
    }
}
```

---

## 7.2 Custom Error Types

Define domain-specific errors:

```ts
class ShaderCompilationError extends Error {}
```

---

# 8. Asynchronous Code Rules

## 8.1 Always Use `async/await`

Avoid raw `.then()` chains.

Incorrect:

```ts
navigator.gpu.requestAdapter().then(...)
```

Correct:

```ts
const adapter = await navigator.gpu.requestAdapter();
```

---

## 8.2 Never Fire-and-Forget Promises

If a promise is intentionally ignored:

```ts
void someAsyncTask();
```

Must be explicit.

---

# 9. Class Design Rules

## 9.1 Explicit Access Modifiers

All members must declare:

- `private`
- `protected`
- `public`
- `readonly` where applicable

---

## 9.2 Constructor Injection

Dependencies must be injected:

```ts
constructor(private readonly device: GPUDevice) {}
```

Global access is forbidden.

---

# 10. Enums and Unions

## 10.1 Prefer Union Types Over Enums

Avoid:

```ts
enum Mode {
    Render,
    Compute,
}
```

Prefer:

```ts
type Mode = "render" | "compute";
```

---

# 11. Exhaustive Checking

All discriminated unions must be exhaustively checked:

```ts
switch (mode) {
    case "render":
        break;
    case "compute":
        break;
    default:
        const _exhaustive: never = mode;
        return _exhaustive;
}
```

---

# 12. Linting Requirements

Must use:

- ESLint
- Prettier

Required ESLint rules:

- no-explicit-any
- no-non-null-assertion
- no-floating-promises
- prefer-const
- no-unused-vars

---

# 13. Documentation Rules

## 13.1 Public API Requires JSDoc

```ts
/**
 * Compiles WGSL source into a render pipeline.
 * Throws ShaderCompilationError on failure.
 */
```

---

# 14. Testing Rules

- All utility modules must be unit-testable.
- WebGPU-dependent code must isolate side effects.
- Pure logic must not depend on DOM.

---

# 15. Forbidden Patterns

- `any`
- `!`
- `as unknown as`
- mutable exported variables
- circular imports
- dynamic property access without index signature typing

---

# 16. Summary

This codebase must prioritize:

- Maximum type safety
- Zero implicit behavior
- Strict null discipline
- Deterministic async control
- Minimal mutation
- Explicit contracts

Deviation from these rules requires documented technical justification.
