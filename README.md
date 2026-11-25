# Sim File Share Enhancer

Languages: **English** | [Portugues (BR)](README.pt-BR.md) | [Espanol](README.es.md)

A userscript that adds a modern theme, filters, sorting, a creators column and safe bulk selection to [Sim File Share](https://simfileshare.net).

## Install

1. Install a userscript manager such as Tampermonkey or Violentmonkey.
2. Open the installer: [simfileshare-enhancer.user.js](https://raw.githubusercontent.com/birb-labs/sim-file-share-enhancer/main/simfileshare-enhancer.user.js)
3. Confirm the installation. The script updates itself from the same address.

## Features

- Light, dark and automatic themes.
- Filters by name, type, size, date and creator, plus sorting on every column.
- Creators column with one chip per creator. Clicking a chip opens a popup with the official links (Patreon, Tumblr, website and others).
- Shift-click range selection and a bulk action bar.
- Export hashes: reads the MD5 of each file from the server ETag, without downloading the file.

## Database

The creators and mods databases are plain JSON files in [`data/`](data) and are loaded from this repository, so they can be updated without reinstalling the script. The script caches them for six hours.

- [`data/creators.json`](data/creators.json): creators, filename patterns, official links and photo.
- [`data/mods.json`](data/mods.json): one entry per file, identified by MD5.

Mod entry:

```json
{
  "md5": "4a758fb6fc6781dd2ce8262de7ecd5a3",
  "name": "casteru_puHair_WMS_AriaHair.package",
  "size": 3311250,
  "creators": ["casteru"],
  "category": null,
  "tags": [],
  "image": null
}
```

Files uploaded in parts (usually the larger ones) have no MD5 in the server ETag. Their entry keeps the ETag in an `etag` field and `md5` is `null`. The same MD5 can appear under different names, so entries are matched by file name first.

To contribute, use **Export hashes** on your file list, add creators, category and image to the generated JSON and open a pull request.

## Development

```sh
npm install
npm test      # builds and runs the tests
npm run build # generates simfileshare-enhancer.user.js from src/
```

Edit the modules in `src/`. The root `simfileshare-enhancer.user.js` is generated and committed because it is the installer.

## License

MIT. Created by Birb Labs, contato@birblabs.com.
