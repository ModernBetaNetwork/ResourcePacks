# Modern Beta resource packs
Textures, models, and language files for the visual trickery that makes Modern Beta possible!

## Folder structure
```
/
├── _BasePacks/        # Files merged into every pack before its own files (e.g. shared base assets)
├── _OverlayPacks/     # Files merged into every pack on top of its own files (e.g. shared overlays)
├── <PackName>/        # A root pack — built into its own zip/mcpack
│   ├── java/          # Java Edition assets
│   ├── bedrock/       # Bedrock Edition assets (optional)
│   └── build-config.json
└── out/               # Build output (generated, not committed)
```

Each pack folder at the root level is discovered automatically. A folder is treated as a pack if it contains a `java` and/or `bedrock` subfolder. The same applies to packs inside `_BasePacks` and `_OverlayPacks`.

## build-config.json
Place a `build-config.json` at the root of any pack folder to control how it is built. All fields are optional and fall back to the defaults for that location.

### Root packs — defaults: all `true`
| Field | Type | Description |
|---|---|---|
| `basePacks` | `boolean` | Merge files from `_BasePacks` into this pack before its own files. |
| `overlayPacks` | `boolean` | Merge files from `_OverlayPacks` into this pack on top of its own files. |
| `includeCredits` | `boolean` | Include `CREDITS.txt` in the output zip. |

### `_BasePacks` packs — defaults: `overlayPacks: true`, `includeCredits: true`
`basePacks` is not applicable here — base packs cannot include other base packs.

### `_OverlayPacks` packs — defaults: `includeCredits: true`
`basePacks` is not applicable here — overlay packs cannot include base packs.
`overlayPacks` is not applicable here — overlay packs cannot include other overlay packs.

### Merge order 
1. Base pack files (if `basePacks: true`)
2. The pack's own files (always, overrides base)
3. Overlay pack files (if `overlayPacks: true`, overrides everything)

`pack.mcmeta` and `pack.png` are never copied from overlay packs — each pack keeps its own.

## Building
- Install [Bun](https://bun.sh) if you don't have it already.
- Open a terminal to the project root.
- On first use, install script dependencies: `bun install --cwd scripts`
- Run the build script: `bun run ./scripts/build.ts`
- Output is written to the `out/` directory along with a `checksums.txt` (SHA1 hashes).
