export class Rect {
	public constructor(x?: number, y?: number, w?: number, h?: number) {
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
	}

	public x: number; // 左端X座標
	public y: number; // 上端Y座標
	public width: number; // 幅
	public height: number; // 高さ

	/**
	 * 矩形中央のX座標を取得する
	 */
	public getCenterX(): number {
		return this.x + 0.5 * this.width;
	}

	/**
	 * 矩形中央のY座標を取得する
	 */
	public getCenterY(): number {
		return this.y + 0.5 * this.height;
	}

	/**
	 * 右側のX座標を取得する
	 */
	public getRight(): number {
		return this.x + this.width;
	}

	/**
	 * 下端のY座標を取得する
	 */
	public getBottom(): number {
		return this.y + this.height;
	}

	/**
	 * 矩形に値をセットする
	 * @param r 矩形のインスタンス
	 */
	public setRect(r: Rect): void {
		this.x = r.x;
		this.y = r.y;
		this.width = r.width;
		this.height = r.height;
	}

	/**
	 * 矩形中央を軸にして縦横を拡縮する
	 * @param w 幅方向に拡縮する量
	 * @param h 高さ方向に拡縮する量
	 */
	public expand(w: number, h: number): void {
		this.x -= w;
		this.y -= h;
		this.width += w * 2.0;
		this.height += h * 2.0;
	}
}
