import { Transform, panHandler } from './pan-zoom';
import { onMount } from 'svelte';

export let src = '';
export let url = '';
export let quality = 0.5;
export let width = 256;
export let height = 256;
export let realTime = false;
export let crossOrigin = false;
export let classes = '';
//export let showResult = true; 
//TODO: add support for optionally showing compressed result instead of original

panHandler; //mentioned so that the Typescript compiler emits the import.

let canvas: HTMLCanvasElement;
let img: HTMLImageElement | undefined;
let ctx: CanvasRenderingContext2D | null;

let offsetX = 0;
let offsetY = 0;
let scale = 1;
let minScale = 1;
let dragging = false;

// not a POJO because getters/setters are instrumentable by Svelte
// and `transform` is updated by imported functions
let transform: Transform = {
    getMinScale() { // read only, TODO: maxScale
        return minScale;
    },
    getScale() {
        return scale;
    },
    setScale(s) {
        scale = s;
    },
    getOffsetX() {
        return offsetX;
    },
    getOffsetY() {
        return offsetY;
    },
    setOffsetX(ox) {
        offsetX = ox;
    },
    setOffsetY(oy) {
        offsetY = oy;
    },
    setDragging(d) {
        if (!realTime && d === false ) url = canvas.toDataURL('image/jpeg', quality);
        dragging = d;
    },
    getDragging() {
        return dragging;
    }
}

function redraw() {
    if (!img || !ctx)
        return;
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

$: img && (img.crossOrigin = crossOrigin ? 'anonymous' : null);
$: img && (img.src = src);
$: quality, width, height, offsetX, offsetY, scale, redraw();

onMount( ()=> {
    ctx = canvas.getContext('2d');
    img = new Image();
    img.onload = function() {
        offsetX = 0;
        offsetY = 0;
        scale = minScale = Math.max(width/img!.width, height/img!.height);
    };
});
