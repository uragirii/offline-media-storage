# Offline Media Storage

Did you know that your browser can be used to offline store media, files
and other stuff? I just [discovered this](https://twitter.com/quacky_batak/status/1670819410611716103) after seeing that you can download Youtube videos on your browser also.

Check the demo here : https://offline-media-storage.vercel.app/

## How it works?

IndexedDB is a powerful storage available inside your browser where you can store Files, Blobs, TypedArrays and much more. You can even access it using service workers. [MDN Resource](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API).

This is build using vanilla-ts template from [vitejs](vitejs)

## I found a bug

Great news! If you found a bug, please open an issue. I would try to resolve it.

## References

- Mozilla Hacks Article : [Storing images and files in IndexedDB](https://hacks.mozilla.org/2012/02/storing-images-and-files-in-indexeddb/)
- `idb` npm library used for IndexedDB
