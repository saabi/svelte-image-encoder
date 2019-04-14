<script>
	import { onMount } from 'svelte';

	export let src;
	export let url = '';
	export let quality = 0.5;
	export let width = 256;
	export let height = 256;
	export let realTime = false;
	export let crossOrigin = false;
	export let classes = '';
	//export let showResult = true;

	let canvas;
	let img;
	let ctx;

	let offsetX = 0;
	let offsetY = 0;
	let scale = 1;
	let minScale = 1;

	function redraw() {
		if (offsetX < 0)
			offsetX = 0;
		if (offsetY < 0)
			offsetY = 0;
		let limit = img.width*scale - width;
		if (offsetX > limit)
			offsetX = limit;
		limit = img.height*scale - height;
		if (offsetY > limit)
			offsetY = limit;

		ctx.resetTransform();
		ctx.clearRect(0, 0, width, height);
		ctx.translate(-offsetX, -offsetY);
		ctx.scale(scale, scale);
		ctx.drawImage(img, 0, 0);

		if (realTime || !dragging) url = canvas.toDataURL('image/jpeg', quality);
	}

	onMount(  ()=> {
		ctx = canvas.getContext('2d');
		img = new Image();
		img.onload = function() {
			offsetX = 0;
			offsetY = 0;
			scale = minScale = Math.max(width/img.width, height/img.height);
		};
		canvas.onpointerup = stopDrag; 
	});

	$: img && (img.crossOrigin = crossOrigin);
	$: img && (img.src = src);
	$: quality, width, height, offsetX, offsetY, scale, img && redraw();

	const pointers = [];
	function iterationCopy(src) {
		let target = {};
		for (let prop in src) {
			target[prop] = src[prop];
		}
		return target;
	}
	function store_event(ev) {
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
	function remove_event(ev) {
		for (var i = 0; i < pointers.length; i++) {
			if (pointers[i].pointerId === ev.pointerId) {
				pointers.splice(i, 1);
				break;
			}
		}
	}
	function updateScale(s, x, y) {
		if (s < minScale) s = minScale;
		offsetX = s * (offsetX + x)/scale - x;
		offsetY = s * (offsetY + y)/scale - y;
		scale = s;
	}

	let dragging = false;
	let scaleOrigin;
	function startDrag(e) {
		//console.log(`${e.offsetX}, ${e.offsetY}`)
		e.target.setPointerCapture(e.pointerId);
		if (!dragging) {
			e.target.onpointermove = drag;
			dragging = true;
		}

		e.preventDefault();
		e.cancelBubble = true;
		store_event(e);
	}

	function drag(e) {
		//console.log(`${e.offsetX}, ${e.offsetY} - ${pointers.length}`)

		if (pointers.length === 1) { 
			if (e.shiftKey) {//scale
				if (!scaleOrigin)
					scaleOrigin = {x: e.offsetX, y: e.offsetY, s: scale};
				//console.log(scaleOrigin.y - e.offsetY)
				updateScale(scaleOrigin.s + (scaleOrigin.y - e.offsetY)/50, scaleOrigin.x, scaleOrigin.y);
				//updateScale(scaleOrigin.s + (pointers[0].offsetY - e.offsetY)/50, scaleOrigin.x, scaleOrigin.y);
			}
			else { //drag
				//debugger;
				scaleOrigin = null;
				offsetX -= e.movementX;
				offsetY -= e.movementY;
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
			updateScale(scale * l2/l1, x2, y2);
		}

		e.preventDefault();
		e.cancelBubble = true;
		store_event(e);
	}
	function stopDrag(e) {
		e.preventDefault();
		e.cancelBubble = true;

		remove_event(e);

		e.target.releasePointerCapture(e.pointerId);
		if (pointers.length === 0) {
			dragging = false;
			e.target.onpointermove = null;
			scaleOrigin = null;
		}
		if (!realTime) url = canvas.toDataURL('image/jpeg', quality);
	}
	function rescale(e) {
		e.preventDefault();
		e.cancelBubble = true;
		const delta = Math.sign(e.deltaY);
		updateScale(scale - delta/10, e.offsetX, e.offsetY);
	}
</script>

<canvas bind:this={canvas} {width} {height} on:pointerdown={startDrag} on:pointerup={stopDrag} on:wheel={rescale} class={classes}></canvas>

<style>
	canvas {
		touch-action: none;
		position: relative;
	}
</style>

