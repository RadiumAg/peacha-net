export type Vector2 = {
  x: number;
  y: number;
};

export function vec2(x: number, y: number): Vector2 {
  return {
    x,
    y
  };
}

export function vec2add(a: Vector2, b: Vector2): Vector2 {
  return {
    x: a.x + b.x,
    y: a.y + b.y
  };
}

export function vec2sub(a: Vector2, b: Vector2): Vector2 {
  return {
    x: a.x - b.x,
    y: a.y - b.y
  };
}

export function vec2mul(a: Vector2, b: Vector2): Vector2 {
  return {
    x: a.x * b.x,
    y: a.y * b.y
  };
}

export function vec2mulByScalar(a: Vector2, b: number): Vector2 {
  return {
    x: a.x * b,
    y: a.y * b
  };
}

export function vec2dot(a: Vector2, b: Vector2): number {
  return (a.x * b.x) + (a.y * b.y);
}

export function vec2normalize(a: Vector2): Vector2 {
  const length: number = Math.pow((a.x * a.x) + (a.y * a.y), 0.5);
  return {
    x: a.x / length,
    y: a.y / length
  };
}
