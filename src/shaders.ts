export const INITIAL_SHADER = `
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
