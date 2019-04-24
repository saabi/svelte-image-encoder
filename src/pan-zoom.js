import detectPointerEvents from 'detect-pointer-events';

// Firefox resets some properties in stored/cached 
// Event objects when new events are fired so
// we have to store a clone.
// TODO: Should we store the original object when using Chrome?
function iterationCopy(src) {
	let target = {};
	for (let prop in src) {
		target[prop] = src[prop];
	}
	return target;
}

function withPointers(node, transform) {
	function updateScale(s, x, y) {
		if (s < transform.minScale) s = transform.minScale;
		let offset = transform.offset;

		offset.x = s * (offset.x + x)/transform.scale - x;
		offset.y = s * (offset.y + y)/transform.scale - y;

		transform.offset = offset;

		return s;
	}

	function rescaleWithWheel(e) {
		e.preventDefault();
		e.cancelBubble = true;
		const delta = Math.sign(e.deltaY);
		transform.scale = updateScale(transform.scale - delta/10, e.offsetX, e.offsetY);
	}

	// pointer event cache
	const pointers = [];
	function storeEvent(ev) {
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
	function removeEvent(ev) {
		for (var i = 0; i < pointers.length; i++) {
			if (pointers[i].pointerId === ev.pointerId) {
				pointers.splice(i, 1);
				break;
			}
		}
	}


	let scaleOrigin;
	function startDrag(e) {
		e.target.setPointerCapture(e.pointerId);
		if (!transform.dragging) {
			node.addEventListener(detectPointerEvents.prefix('pointermove'), drag, true);
			transform.dragging = true;
		}

		e.preventDefault();
		e.cancelBubble = true;
		storeEvent(e);
	}

	function drag(e) {
		if (pointers.length === 1) { 
			if (e.shiftKey) {//scale
				if (!scaleOrigin)
					scaleOrigin = {x: e.offsetX, y: e.offsetY, s: transform.scale};
				//console.log(scaleOrigin.y - e.offsetY)
				transform.scale = updateScale(scaleOrigin.s + (scaleOrigin.y - e.offsetY)/50, scaleOrigin.x, scaleOrigin.y);
				//updateScale(scaleOrigin.s + (pointers[0].offsetY - e.offsetY)/50, scaleOrigin.x, scaleOrigin.y);
			}
			else { //drag
				//debugger;
				scaleOrigin = null;
				let offset = transform.offset;
				offset.x -= e.movementX;
				offset.y -= e.movementY;
				transform.offset = offset;
				//console.log(`${pointers[0].offsetX}, ${pointers[0].offsetY}`)
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
			updateScale(transform.scale * l2/l1, x2, y2); 
		}

		e.preventDefault();
		e.cancelBubble = true;
		storeEvent(e);
	}
	function stopDrag(e) {
		e.preventDefault();
		e.cancelBubble = true;

		removeEvent(e);

		e.target.releasePointerCapture(e.pointerId);
		if (pointers.length === 0) {
			transform.dragging = false;
			node.removeEventListener(detectPointerEvents.prefix('pointermove'), true);
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

function withMouse(node, transform) {
	function updateScale(s, x, y) {
		if (s < transform.minScale) s = transform.minScale;
		let offset = transform.offset;

		offset.x = s * (offset.x + x)/transform.scale - x;
		offset.y = s * (offset.y + y)/transform.scale - y;

		transform.offset = offset;

		return s;
	}

	function rescaleWithWheel(e) {
		e.preventDefault();
		e.cancelBubble = true;
		const delta = Math.sign(e.deltaY);
		transform.scale = updateScale(transform.scale - delta/10, e.offsetX, e.offsetY);
	}

	// pointer event cache
	let mouseEvent;

	let scaleOrigin;
	function startDrag(e) {
		if (typeof e.target.setCapture === 'function')
			e.target.setCapture();
		if (!transform.dragging) {
			node.addEventListener('mousemove', drag, true);
			transform.dragging = true;
		}

		e.preventDefault();
		e.cancelBubble = true;
		mouseEvent = iterationCopy(e);
	}

	function drag(e) {
		if (e.shiftKey) {//scale
			if (!scaleOrigin)
				scaleOrigin = {x: e.offsetX, y: e.offsetY, s: transform.scale};
			transform.scale = updateScale(scaleOrigin.s + (scaleOrigin.y - e.offsetY)/50, scaleOrigin.x, scaleOrigin.y);
		}
		else { //drag
			scaleOrigin = null;
			let offset = transform.offset;
			offset.x -= e.movementX;
			offset.y -= e.movementY;
			transform.offset = offset;
		}

		e.preventDefault();
		e.cancelBubble = true;
		mouseEvent = iterationCopy(e);
	}
	function stopDrag(e) {
		e.preventDefault();
		e.cancelBubble = true;

		mouseEvent = null;

		if (typeof e.target.setCapture === 'function')
			e.target.releaseCapture();
		transform.dragging = false;
		node.removeEventListener('mousemove', drag, true);
		scaleOrigin = null;
	}

	node.addEventListener('mousedown', startDrag, true);
	node.addEventListener('mouseup', stopDrag, true);
	node.addEventListener('wheel', rescaleWithWheel, true);

	return () => {
		node.removeEventListener('nousedown', startDrag, true);
		node.removeEventListener('mouseup', stopDrag, true);
		node.removeEventListener('wheel', rescaleWithWheel, true);
	}
}

const usePointerEvents = !!detectPointerEvents.maxTouchPoints;
const panHandler = usePointerEvents ? withPointers : withMouse;

console.log(usePointerEvents)
export default panHandler;
