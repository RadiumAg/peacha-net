import { Injectable } from '@angular/core';
import { SystemBase } from '../ecs/system';
import { Keyboard } from './keyboard';
import { EventHub } from '../ecs/event';
import { getShortcutMap } from '../utils/keymap';

export type ShortcutRef = symbol;

@Injectable()
export class Shortcuts {
	shortcuts: {
		handler: ShortcutRef;
		map: number[];
		channel: string;
		active: boolean;
	}[] = [];

	registerShortcut(a: string, channel: string): ShortcutRef {
		const shortcutMap = {
			handler: Symbol(),
			map: getShortcutMap(a),
			channel,
			active: false,
		};
		this.shortcuts.push(shortcutMap);
		return shortcutMap.handler;
	}

	unregisterShortcut(handler: ShortcutRef): void {
		this.shortcuts = this.shortcuts.filter(s => {
			return s.handler != handler;
		});
	}
}

export const SHORTCUT_RELEASE = Symbol('shortcut release');
export const SHORTCUT_HOLD = Symbol('shortcut hold');

@Injectable()
export class ShortcutSystem extends SystemBase {
	constructor(public keyboard: Keyboard, public shortcut: Shortcuts, public event: EventHub) {
		super();
	}

	allBeforeUpdate(): void {
		if (!this.keyboard.hasUpdated) {
			return;
		}
		// optimize: keyboard.hasUpdated?
		for (const shortcut of this.shortcut.shortcuts) {
			if (shortcut.active) {
				if (!this.keyboard.isPressed(shortcut.map)) {
					// emit : release
					this.event.emitEvent(shortcut.channel, {
						type: SHORTCUT_RELEASE,
						payload: {},
					});
					shortcut.active = false;
				}
			} else {
				if (this.keyboard.isPressed(shortcut.map)) {
					// emit: hold
					this.event.emitEvent(shortcut.channel, {
						type: SHORTCUT_HOLD,
						payload: {},
					});
					shortcut.active = true;
				}
			}
		}
	}
}
