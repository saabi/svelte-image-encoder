# svelte-image-encoder ([demo](https://v3.svelte.technology/repl?version=3.0.0-beta.20&gist=cb1ec0dcc5dfaa1e0de3844f3e7348d6))

A component for creating `data:` URLs from images in real time. You can also move and resize the image before encoding.

The data URL enables sending and receiving the image inside JSON AJAX requests and perhaps storing images 
in database string columns, where an image URL would go, simplifying code logic.

The original intended use is for use in a profile picture editor, allowing the user to resize and crop 
images, finally storing them in a small `data:` URL but it may be useful when you need basic image 
resizing/cropping capabilities.

## Installation

```bash
npm i svelte-image-encoder [-D]
```

## Usage

```html
<script>
  import ImgEncoder from 'svelte-image-encoder';
  let src='some-image.jpg';
  let url;
</script>

<ImgEncoder {src} bind:url />
<p>{url}</p>
```

## Parameters

You can specify the following parameters:

* `src` — the original image URL. Any valid image URL will work, except if `crossOrigin` is set to false.
* `url` — the generated `data:` URL. Read only.
* `realTime` — if `true` the data URL is generated in real time while dragging or resizing the image, defaults to `false` and is generally not needed to be `true`.
* `quality` — JPEG quality factor.  Defaults to `0.5`.
* `width` — The encoded image's width. Defaults to `256`.
* `height` — The encoded image's height. Defaults to `256`.
* `crossOrigin` — enables loading cross origin URLs. Defaults to `false`.
* `classes` — Allows for theming by specifying global classes. Defaults to ``.

## Configuring webpack

If you're using webpack with [svelte-loader](https://github.com/sveltejs/svelte-loader), make sure that you add `"svelte"` to [`resolve.mainFields`](https://webpack.js.org/configuration/resolve/#resolve-mainfields) in your webpack config. This ensures that webpack imports the uncompiled component (`src/index.svelte`) rather than the compiled version (`index.mjs`) — this is more efficient.

If you're using Rollup with [rollup-plugin-svelte](https://github.com/rollup/rollup-plugin-svelte), this will happen automatically.


## TODO

* Add a boolean property to choose between displaying the compressed or uncompressed result. Needs som reworking of the internals.

## License

[ISC](LICENSE)
