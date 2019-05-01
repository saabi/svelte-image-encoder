<script src='./ImgEncoder.ts'></script>

<canvas bind:this={canvas} {width} {height} class={classes} use:panHandler={transform}></canvas>

<style>
	canvas {
		touch-action: none;
		position: relative;
	}
</style>

