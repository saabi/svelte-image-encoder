declare module DetectPointerEvents {
	export const hasApi: boolean;
	export const requiresPrefix: boolean;
	export const hasTouch: boolean;
	export const maxTouchPoints: number;
	// Below we lie to the compiler since `prefix(name)` returns the
	// browser equivalent of (the event, method or property) `name`.
	// Declaring the real behavior makes the compiler emit an error
	// when used elsewhere in `node.addEventListener(name, handler)`.
	export function prefix(value: 'pointerdown'): 'pointerdown';
	export function prefix(value: 'pointerup'): 'pointerup';
	export function prefix(value: 'pointercancel'): 'pointercancel';
	export function prefix(value: 'pointermove'): 'pointermove';
	export function prefix(value: 'pointerover'): 'pointerover';
	export function prefix(value: 'pointerout'): 'pointerout';
	export function prefix(value: 'pointerenter'): 'pointerenter';
	export function prefix(value: 'pointerleave'): 'pointerleave';
	export function prefix(value: 'gotpointercapture'): 'gotpointercapture';
	export function prefix(value: 'lostpointercapture'): 'lostpointercapture';
	export function prefix(value: 'maxTouchPoints'): 'maxTouchPoints';
	export function update(): void;
}

export default DetectPointerEvents;
