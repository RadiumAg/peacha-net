import { Injectable, Inject } from '@angular/core';
import { DOM_ELEMENT } from '../ecs/world';
import { SystemBase } from '../ecs/system';
import { getShortcutMap } from '../utils/keymap';

@Injectable()
/**
 * singleton gloabl component
 */
export class Keyboard {
	pressed: {
		[key: number]: boolean;
	} = {};

	meta: {
		ctrl: boolean;
		alt: boolean;
		meta: boolean;
		shift: boolean;
	};

	hasUpdated = false;

	hasUpdatedCurrentFrame = false;

	isPressed(keymap: number[]): boolean {
		return keymap.every(s => {
			return this.pressed[s] == true;
		});
	}

	isPressedKey(key: string): boolean {
		return this.isPressed(getShortcutMap(key));
	}
}

@Injectable()
export class DomKeyboardSystem extends SystemBase {
	constructor(@Inject(DOM_ELEMENT) private domElement: HTMLElement, private keyboard: Keyboard) {
		super();
		window.addEventListener('keyup', this._keyup.bind(this));
		window.addEventListener('keydown', this._keydown.bind(this));
	}

	allBeforeUpdate(): void {
		this.keyboard.hasUpdated = this.keyboard.hasUpdatedCurrentFrame;
		this.keyboard.hasUpdatedCurrentFrame = false;
	}

	_keyup(ev: KeyboardEvent): void {
		this.keyboard.pressed[ev.keyCode] = false;
		// console.log('keyup');
		this.keyboard.hasUpdatedCurrentFrame = true;
	}

	_keydown(ev: KeyboardEvent): void {
		if (!this.keyboard.pressed[ev.keyCode]) {
			// console.log('keydown');
			this.keyboard.hasUpdatedCurrentFrame = true;
		}
		this.keyboard.pressed[ev.keyCode] = true;
	}

	onDestroy(): void {
		window.removeEventListener('keyup', this._keyup.bind(this));
		window.removeEventListener('keydown', this._keydown.bind(this));
	}
}
