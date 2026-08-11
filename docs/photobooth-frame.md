# PhotoBooth frame implementation notes

## Interaction map

- `src/components/TriangleNav.jsx` links the home Explore prism to `/photo-booth`.
- `src/App.jsx` lazy-loads `src/pages/PhotoBooth.jsx` for that route.
- `src/pages/PhotoBooth.jsx` reads `src/data/characters.js` for character names, agencies, colors, tags, and CDN codes.
- `public/photobooth/characters/{CDN}.webp` contains same-origin character frame cuts copied from `char_img/`.

## Privacy boundary

The user's selected photo must stay in the browser. The page only uses:

- a `File` object from the local file picker,
- `URL.createObjectURL()` for in-memory preview/composition,
- a canvas `data:` URL for the final PNG/WEBP output.

Do not add API uploads, Payload CMS writes, R2 writes, analytics events containing image data, `localStorage`, `sessionStorage`, or IndexedDB persistence for user-generated photos. A future maintainer may add static frame assets, but user photo bytes must never leave the browser.

## Why public frame assets exist

`img.bluehair.blue` currently does not expose an `Access-Control-Allow-Origin` header for character images. If those cross-origin images are drawn directly into a canvas, the browser marks the canvas as tainted and blocks `toDataURL()`.

For this feature, the static character cuts are copied from the approved local source folder `char_img/` into Vite's `public/` folder. They are then served from `intro.bluehair.blue` itself, so the canvas can export PNG/WEBP safely without proxying the user's uploaded photo.

## Output contract

The generated result is intentionally a long markdown string:

```md
![](data:image/png;base64,...)
```

Blob URLs are shorter but only work inside the current page lifetime. A data URL is self-contained, so it can be pasted into a chatbot session without creating a shared server-side object. If a target chatbot blocks data URLs, the safe fallback is downloading the PNG/WEBP and manually attaching it there; do not solve that by uploading generated images to this site's database.
