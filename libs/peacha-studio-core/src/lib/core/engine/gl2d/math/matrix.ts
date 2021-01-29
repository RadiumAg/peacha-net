import { Vector2 } from './vector2';
/*
Stupid but fast matrix
*/
export class Matrix44 {
	constructor(initial?: Float32Array) {
		if (initial) {
			this.matrix = initial;
		} else {
			this.matrix = new Float32Array(16);
			this.identity();
		}
	}

	public matrix: Float32Array;

	public static multiply(out: Float32Array | number[], b: Float32Array | number[], a: Float32Array | number[]): void {
		const a00 = a[0],
			a01 = a[1],
			a02 = a[2],
			a03 = a[3];
		const a10 = a[4],
			a11 = a[5],
			a12 = a[6],
			a13 = a[7];
		const a20 = a[8],
			a21 = a[9],
			a22 = a[10],
			a23 = a[11];
		const a30 = a[12],
			a31 = a[13],
			a32 = a[14],
			a33 = a[15];
		// Cache only the current line of the second matrix
		let b0 = b[0],
			b1 = b[1],
			b2 = b[2],
			b3 = b[3];
		out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
		out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
		out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
		out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
		b0 = b[4];
		b1 = b[5];
		b2 = b[6];
		b3 = b[7];
		out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
		out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
		out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
		out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
		b0 = b[8];
		b1 = b[9];
		b2 = b[10];
		b3 = b[11];
		out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
		out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
		out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
		out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
		b0 = b[12];
		b1 = b[13];
		b2 = b[14];
		b3 = b[15];
		out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
		out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
		out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
		out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
	}

	public identity(): void {
		this.matrix[0] = 1.0;
		this.matrix[1] = 0.0;
		this.matrix[2] = 0.0;
		this.matrix[3] = 0.0;
		this.matrix[4] = 0.0;
		this.matrix[5] = 1.0;
		this.matrix[6] = 0.0;
		this.matrix[7] = 0.0;
		this.matrix[8] = 0.0;
		this.matrix[9] = 0.0;
		this.matrix[10] = 1.0;
		this.matrix[11] = 0.0;
		this.matrix[12] = 0.0;
		this.matrix[13] = 0.0;
		this.matrix[14] = 0.0;
		this.matrix[15] = 1.0;
	}

	public getScaleX(): number {
		return this.matrix[0];
	}

	public getScaleY(): number {
		return this.matrix[5];
	}

	public getTranslateX(): number {
		return this.matrix[12];
	}

	public getTranslateY(): number {
		return this.matrix[13];
	}

	public translate(x: number, y: number): void {
		this.matrix[12] = x;
		this.matrix[13] = y;
	}

	public translateX(x: number): void {
		this.matrix[12] = x;
	}

	public translateY(y: number): void {
		this.matrix[13] = y;
	}

	public transformX(src: number): number {
		return this.matrix[0] * src + this.matrix[12];
	}

	public transformY(src: number): number {
		return this.matrix[5] * src + this.matrix[13];
	}
	public scale(x: number, y: number): void {
		this.matrix[0] = x;
		this.matrix[5] = y;
	}

	public invertTransformX(src: number): number {
		return (src - this.matrix[12]) / this.matrix[0];
	}

	public invertTransformY(src: number): number {
		return (src - this.matrix[13]) / this.matrix[5];
	}

	public translateRelative(x: number, y: number): void {
		const tr1: Float32Array = new Float32Array([1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, x, y, 0.0, 1.0]);
		Matrix44.multiply(this.matrix, tr1, this.matrix);
	}

	public scaleRelative(x: number, y: number): void {
		const tr1: Float32Array = new Float32Array([x, 0.0, 0.0, 0.0, 0.0, y, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0]);
		Matrix44.multiply(this.matrix, tr1, this.matrix);
	}
	public adjustScale(cx: number, cy: number, scale: number): void {
		const tr1: Float32Array = new Float32Array([1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, cx, cy, 0.0, 1.0]);

		const tr2: Float32Array = new Float32Array([scale, 0.0, 0.0, 0.0, 0.0, scale, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0]);

		const tr3: Float32Array = new Float32Array([1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, -cx, -cy, 0.0, 1.0]);

		Matrix44.multiply(this.matrix, tr1, this.matrix);
		Matrix44.multiply(this.matrix, tr2, this.matrix);
		Matrix44.multiply(this.matrix, tr3, this.matrix);
	}

	public adjustRotate(cx: number, cy: number, rad: number, axis: ArrayLike<number>): void {
		const tr1: Float32Array = new Float32Array([1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, cx, cy, 0.0, 1.0]);

		let x = axis[0],
			y = axis[1],
			z = axis[2];
		let len = Math.hypot(x, y, z);
		// if (len < glMatrix.EPSILON) { return null; }
		len = 1 / len;
		x *= len;
		y *= len;
		z *= len;
		const s = Math.sin(rad);
		const c = Math.cos(rad);
		const t = 1 - c;
		// Perform rotation-specific matrix multiplication
		const out = new Float32Array(16);
		out[0] = x * x * t + c;
		out[1] = y * x * t + z * s;
		out[2] = z * x * t - y * s;
		out[3] = 0;
		out[4] = x * y * t - z * s;
		out[5] = y * y * t + c;
		out[6] = z * y * t + x * s;
		out[7] = 0;
		out[8] = x * z * t + y * s;
		out[9] = y * z * t - x * s;
		out[10] = z * z * t + c;
		out[11] = 0;
		out[12] = 0;
		out[13] = 0;
		out[14] = 0;
		out[15] = 1;

		const tr3: Float32Array = new Float32Array([1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, -cx, -cy, 0.0, 1.0]);
		Matrix44.multiply(this.matrix, tr1, this.matrix);
		Matrix44.multiply(this.matrix, out, this.matrix);
		Matrix44.multiply(this.matrix, tr3, this.matrix);
	}

	public invert(): Matrix44 {
		const a = this.matrix;
		const ret = new Matrix44();
		const out = ret.matrix;
		const a00 = a[0],
			a01 = a[1],
			a02 = a[2],
			a03 = a[3];
		const a10 = a[4],
			a11 = a[5],
			a12 = a[6],
			a13 = a[7];
		const a20 = a[8],
			a21 = a[9],
			a22 = a[10],
			a23 = a[11];
		const a30 = a[12],
			a31 = a[13],
			a32 = a[14],
			a33 = a[15];

		const b00 = a00 * a11 - a01 * a10;
		const b01 = a00 * a12 - a02 * a10;
		const b02 = a00 * a13 - a03 * a10;
		const b03 = a01 * a12 - a02 * a11;
		const b04 = a01 * a13 - a03 * a11;
		const b05 = a02 * a13 - a03 * a12;
		const b06 = a20 * a31 - a21 * a30;
		const b07 = a20 * a32 - a22 * a30;
		const b08 = a20 * a33 - a23 * a30;
		const b09 = a21 * a32 - a22 * a31;
		const b10 = a21 * a33 - a23 * a31;
		const b11 = a22 * a33 - a23 * a32;

		// Calculate the determinant
		let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

		if (!det) {
			return null;
		}
		det = 1.0 / det;

		out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
		out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
		out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
		out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
		out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
		out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
		out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
		out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
		out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
		out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
		out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
		out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
		out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
		out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
		out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
		out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

		return ret;
	}

	public multiplyByVector(vector2: Vector2): Vector2 {
		const x = vector2.x,
			y = vector2.y,
			z = 0,
			w = 1;
		const m = this.matrix;
		const out = new Float32Array(4);
		out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
		out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
		out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
		out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
		return {
			x: out[0],
			y: out[1],
		};
	}

	public multiplyByMatrix(matrix2: Matrix44): void {
		Matrix44.multiply(this.matrix, this.matrix, matrix2.matrix);
	}

	public multiplyNewMatrix(matrix2: Matrix44): Matrix44 {
		const d = this.clone();
		Matrix44.multiply(d.matrix, d.matrix, matrix2.matrix);
		return d;
	}

	public getArray(): Float32Array {
		return this.matrix;
	}

	public clone(): Matrix44 {
		const out = new Float32Array(16);
		out[0] = this.matrix[0];
		out[1] = this.matrix[1];
		out[2] = this.matrix[2];
		out[3] = this.matrix[3];
		out[4] = this.matrix[4];
		out[5] = this.matrix[5];
		out[6] = this.matrix[6];
		out[7] = this.matrix[7];
		out[8] = this.matrix[8];
		out[9] = this.matrix[9];
		out[10] = this.matrix[10];
		out[11] = this.matrix[11];
		out[12] = this.matrix[12];
		out[13] = this.matrix[13];
		out[14] = this.matrix[14];
		out[15] = this.matrix[15];
		return new Matrix44(out);
	}

	public setMatrix(a: Float32Array | number[]): void {
		this.matrix[0] = a[0];
		this.matrix[1] = a[1];
		this.matrix[2] = a[2];
		this.matrix[3] = a[3];
		this.matrix[4] = a[4];
		this.matrix[5] = a[5];
		this.matrix[6] = a[6];
		this.matrix[7] = a[7];
		this.matrix[8] = a[8];
		this.matrix[9] = a[9];
		this.matrix[10] = a[10];
		this.matrix[11] = a[11];
		this.matrix[12] = a[12];
		this.matrix[13] = a[13];
		this.matrix[14] = a[14];
		this.matrix[15] = a[15];
	}
}

export type Mat4 = [
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number
];

export function mat4(arr?: ArrayLike<number>): Mat4 {
	if (arr) {
	} else {
		return mat4iden();
	}
}

export function mat4iden(): Mat4 {
	return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

// export function mat4mul() {

// }

// export function mat4clone() {

// }

// export function mat4invert() {

// }

// export function mat4scale() {

// }
