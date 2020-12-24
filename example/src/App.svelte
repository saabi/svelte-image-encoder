<script>
	import ImgEncoder from '../../dist/ImgEncoder.svelte';

	let src = 'https://i.imgur.com/37nlxAP.jpg';

	let url;
	let quality = 0.1;
	let imageChosen = false;
	let realTime = true;
	let showResult = true;

	function loadFile(e) {
		src = URL.createObjectURL(e.target.files[0]);
	}
</script>

<p><input on:change={loadFile} type='file' > Quality: <input type='number' bind:value={quality} min='0' max='1' step='0.05'></p>

<ImgEncoder {src} {quality} bind:url {realTime} width={256} height={256} crossOrigin='anonymous' classes='profile-image'/>
<img src={url} alt=''>

<p>Result ({url && url.length} bytes):</p>
<p>{ url }</p>

<style>
	:global(body) {
		overflow: hidden;
		width: 100%;
	}
	:global(.profile-image) { /* Ideally, something like this would go in a global theme definition CSS */
		box-shadow: 2px 2px 8px rgba(0,0,0,.85);
		margin: 1em;
	}
	p {
		word-break: break-word;
	}
	img {
		margin: 1em;
	}
</style>
