import { Vector2, vec2 } from '../gl2d';

export class CubismMath {
	/**
	 * 第一引数の値を最小値と最大値の範囲に収めた値を返す
	 *
	 * @param value 収められる値
	 * @param min   範囲の最小値
	 * @param max   範囲の最大値
	 * @return 最小値と最大値の範囲に収めた値
	 */
	static range(value: number, min: number, max: number): number {
		if (value < min) {
			value = min;
		} else if (value > max) {
			value = max;
		}

		return value;
	}

	/**
	 * イージング処理されたサインを求める
	 * フェードイン・アウト時のイージングに利用できる
	 *
	 * @param value イージングを行う値
	 * @return イージング処理されたサイン値
	 */
	static getEasingSine(value: number): number {
		if (value < 0.0) {
			return 0.0;
		} else if (value > 1.0) {
			return 1.0;
		}

		return 0.5 - 0.5 * Math.cos(value * Math.PI);
	}

	/**
	 * 角度値をラジアン値に変換する
	 *
	 * @param degrees   角度値
	 * @return 角度値から変換したラジアン値
	 */
	static degreesToRadian(degrees: number): number {
		return (degrees / 180.0) * Math.PI;
	}

	/**
	 * ラジアン値を角度値に変換する
	 *
	 * @param radian    ラジアン値
	 * @return ラジアン値から変換した角度値
	 */
	static radianToDegrees(radian: number): number {
		return (radian * 180.0) / Math.PI;
	}

	/**
	 * ２つのベクトルからラジアン値を求める
	 *
	 * @param from  始点ベクトル
	 * @param to    終点ベクトル
	 * @return ラジアン値から求めた方向ベクトル
	 */
	static directionToRadian(from: Vector2, to: Vector2): number {
		const q1: number = Math.atan2(to.y, to.x);
		const q2: number = Math.atan2(from.y, from.x);

		let ret: number = q1 - q2;

		while (ret < -Math.PI) {
			ret += Math.PI * 2.0;
		}

		while (ret > Math.PI) {
			ret -= Math.PI * 2.0;
		}

		return ret;
	}

	/**
	 * ２つのベクトルから角度値を求める
	 *
	 * @param from  始点ベクトル
	 * @param to    終点ベクトル
	 * @return 角度値から求めた方向ベクトル
	 */
	static directionToDegrees(from: Vector2, to: Vector2): number {
		const radian: number = this.directionToRadian(from, to);
		let degree: number = this.radianToDegrees(radian);

		if (to.x - from.x > 0.0) {
			degree = -degree;
		}

		return degree;
	}

	/**
	 * ラジアン値を方向ベクトルに変換する。
	 *
	 * @param totalAngle    ラジアン値
	 * @return ラジアン値から変換した方向ベクトル
	 */

	static radianToDirection(totalAngle: number): Vector2 {
		const ret: Vector2 = vec2(Math.sin(totalAngle), Math.cos(totalAngle));
		return ret;
	}

	static distance(from: Vector2, to: Vector2): number {
		return Math.sqrt((to.x - from.x) * (to.x - from.x) + (to.y - from.y) * (to.y - from.y));
	}
}
