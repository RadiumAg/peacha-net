export type IOEvent =
	| {
			type: 'keyup' | 'keydown';
			keyCode: number;
			alt: boolean;
			meta: boolean;
			ctrl: boolean;
			shift: boolean;
	  }
	| {
			type: 'mousedown' | 'mouseup';
			button: number;
			x: number;
			y: number;
	  }
	| {
			type: 'mousemove';
			x: number;
			y: number;
	  }
	| {
			type: 'mousewheel';
			x: number;
			y: number;
			delta: number;
	  };
