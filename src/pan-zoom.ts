import detectPointerEvents from 'detect-pointer-events';

export interface Transform {
	getMinScale(): number;
	getScale(): number;
	setScale(s: number): void; 
	getOffsetX(): number;
	getOffsetY(): number;
	setOffsetX(o: number): void;
	setOffsetY(o: number): void;
	setDragging(d: boolean): void;
	getDragging(): boolean;
}

// Firefox resets some properties in stored/cached 
// Event objects when new events are fired so
// we have to store a clone.
// TODO: Should we store the original object when using Chrome?
function iterationCopy(src: any) {
	let target: any = {};
	for (let prop in src) {
		target[prop] = src[prop];
	}
	return target;
}

function updateScale(transform:Transform, s: number, x: number, y: number) {
	const minScale = transform.getMinScale();
	const scale = transform.getScale();
	if (s < minScale) s = minScale;
	let offsetX = transform.getOffsetX();
	let offsetY = transform.getOffsetY();

	offsetX = s * (offsetX + x)/scale - x;
	offsetY = s * (offsetY + y)/scale - y;

	transform.setOffsetX(offsetX);
	transform.setOffsetY(offsetY);

	return s;
}

function withPointers(node: HTMLElement, transform: Transform) {
	function rescaleWithWheel(e: MouseWheelEvent) {
		e.preventDefault();
		e.cancelBubble = true;
		const delta = Math.sign(e.deltaY);
		transform.setScale(updateScale(transform, transform.getScale() - delta/10, e.offsetX, e.offsetY));
	}

	// pointer event cache
	const pointers: PointerEvent[] = [];
	function storeEvent(ev: PointerEvent) {
		for (var i = 0; i < pointers.length; i++) {
			if (pointers[i].pointerId === ev.pointerId) {
				const ev2 = iterationCopy(ev);
				pointers[i] = ev2;
				break;
			}
		}
		if(i === pointers.length)
			pointers.push(ev);
	}
	function removeEvent(ev: PointerEvent) {
		for (var i = 0; i < pointers.length; i++) {
			if (pointers[i].pointerId === ev.pointerId) {
				pointers.splice(i, 1);
				break;
			}
		}
	}


	let scaleOrigin: {x: number, y: number, s: number} | null = null;
	function startDrag(e: PointerEvent) {
		node.setPointerCapture(e.pointerId);
		if (!transform.getDragging()) {
			node.addEventListener(detectPointerEvents.prefix('pointermove'), drag, true);
			transform.setDragging(true);
		}

		e.preventDefault();
		e.cancelBubble = true;
		storeEvent(e);
	}

	function drag(e: PointerEvent) {
		if (pointers.length === 1) { 
			if (e.shiftKey) {//scale
				if (!scaleOrigin)
					scaleOrigin = {x: e.offsetX, y: e.offsetY, s: transform.getScale()};
				transform.setScale(updateScale(transform, scaleOrigin.s + (scaleOrigin.y - e.offsetY)/50, scaleOrigin.x, scaleOrigin.y));
			}
			else { //drag
				scaleOrigin = null;
				let offsetX = transform.getOffsetX();
				let offsetY = transform.getOffsetY();
				offsetX -= e.movementX;
				offsetY -= e.movementY;
				transform.setOffsetX(offsetX);
				transform.setOffsetY(offsetY);
			}
		}
		else if (pointers.length === 2) { //scale
			const x0 = pointers[0].offsetX;
			const y0 = pointers[0].offsetY;
			const x1 = pointers[1].offsetX;
			const y1 = pointers[1].offsetY;
			const x2 = e.offsetX;
			const y2 = e.offsetY;
			const dx = x0-x1;
			const dy = y0-y1;
			const l1 = Math.sqrt(dx*dx + dy*dy);
			let dx1, dy1;
			if (e.pointerId === pointers[0].pointerId) {
				dx1 = x2 - x1;
				dy1 = y2 - y1;
			}
			else {
				dx1 = x2 - x0;
				dy1 = y2 - y0;
			}
			var l2 = Math.sqrt(dx1*dx1+dy1*dy1);
			transform.setScale(updateScale(transform, transform.getScale() * l2/l1, x2, y2)); 
		}

		e.preventDefault();
		e.cancelBubble = true;
		storeEvent(e);
	}
	function stopDrag(e: PointerEvent) {
		e.preventDefault();
		e.cancelBubble = true;

		removeEvent(e);

		node.releasePointerCapture(e.pointerId);
		if (pointers.length === 0) {
			transform.setDragging(false);
			node.removeEventListener(detectPointerEvents.prefix('pointermove'), drag, true);
			scaleOrigin = null;
		}
	}

	node.addEventListener(detectPointerEvents.prefix('pointerdown'), startDrag, true);
	node.addEventListener(detectPointerEvents.prefix('pointerup'), stopDrag, true);
	node.addEventListener('wheel', rescaleWithWheel, true);

	return () => {
		node.removeEventListener(detectPointerEvents.prefix('pointerdown'), startDrag, true);
		node.removeEventListener(detectPointerEvents.prefix('pointerup'), stopDrag, true);
		node.removeEventListener('wheel', rescaleWithWheel, true);
	}
}

function withMouse(node: HTMLElement, transform: Transform) {
	function rescaleWithWheel(e: MouseWheelEvent) {
		e.preventDefault();
		e.cancelBubble = true;
		const delta = Math.sign(e.deltaY);
		transform.setScale(updateScale(transform, transform.getScale() - delta/10, e.offsetX, e.offsetY));
	}

	let scaleOrigin: {x: number, y: number, s: number} | null = null;
	function startDrag(e: MouseEvent) {
		if (typeof (<any>node).setCapture === 'function')
			(<any>node).setCapture();
		if (!transform.getDragging()) {
			node.addEventListener('mousemove', drag, true);
			transform.setDragging(true);
		}

		e.preventDefault();
		e.cancelBubble = true;
	}

	function drag(e: MouseEvent) {
		if (e.shiftKey) {//scale
			if (!scaleOrigin)
				scaleOrigin = {x: e.offsetX, y: e.offsetY, s: transform.getScale()};
			transform.setScale(updateScale(transform, scaleOrigin.s + (scaleOrigin.y - e.offsetY)/50, scaleOrigin.x, scaleOrigin.y));
		}
		else { //drag
			scaleOrigin = null;
			let offsetX = transform.getOffsetX();
			let offsetY = transform.getOffsetY();
			offsetX -= e.movementX;
			offsetY -= e.movementY;
			transform.setOffsetX(offsetX);
			transform.setOffsetY(offsetY);
		}

		e.preventDefault();
		e.cancelBubble = true;
	}
	function stopDrag(e: MouseEvent) {
		e.preventDefault();
		e.cancelBubble = true;

		if (typeof (<any>node).releaseCapture === 'function')
			(<any>node).releaseCapture();
		transform.setDragging(false);
		node.removeEventListener('mousemove', drag, true);
		scaleOrigin = null;
	}

	node.addEventListener('mousedown', startDrag, true);
	node.addEventListener('mouseup', stopDrag, true);
	node.addEventListener('wheel', rescaleWithWheel, true);

	return () => {
		node.removeEventListener('mousedown', startDrag, true);
		node.removeEventListener('mouseup', stopDrag, true);
		node.removeEventListener('wheel', rescaleWithWheel, true);
	}
}

const usePointerEvents = !!detectPointerEvents.maxTouchPoints;
export const panHandler = usePointerEvents ? withPointers : withMouse;
