# Modern Beta resource packs
Textures, models, and language files for the visual trickery that makes Modern Beta possible!

## Folder structure
```
/
├── BasePacks/                # Packs merged into other packs before its own files (also builds itself)
│   ├── <PackName>/
│   │   ├── java/             # Java Edition assets
│   │   ├── bedrock/          
│   │   └── build-config.json 
├── _OverlayPacks/            # Packs merged into other packs on top of its own files (also builds itself)
│   ├── <PackName>/
│   │   ├── java/             
│   │   ├── bedrock/          # Bedrock Edition assets (optional)
│   │   └── build-config.json 
├── <PackName>/               # A root pack — built into its own zip/mcpack
│   ├── java/                 
│   ├── bedrock/              
│   └── build-config.json     # controls aspects of built pack, including base/overlay, MB credits, etc.
└── out/                      # Build output (generated, not committed)
```

Each pack folder at the root level is discovered automatically. A folder is treated as a pack if it contains a `java` and/or `bedrock` subfolder. The same applies to packs inside `_BasePacks` and `_OverlayPacks`.

## build-config.json
Place a `build-config.json` at the root of any pack folder to control how it is built. Config is split into `java` and `bedrock` sections so each platform can be configured independently. If a section is absent, defaults for that location are used.

```json
{
    "java": {
        "basePacks": true,
        "overlayPacks": true,
        "includeCredits": true
    },
    "bedrock": {
        "basePacks": true,
        "overlayPacks": true,
        "includeCredits": true
    }
}
```

| Field | Type | Description |
|---|---|---|
| `basePacks` | `boolean` | Merge files from `_BasePacks` into this pack before its own files. |
| `overlayPacks` | `boolean` | Merge files from `_OverlayPacks` into this pack on top of its own files. |
| `includeCredits` | `boolean` | Include `CREDITS.txt` in the output zip. |

### Root packs — defaults: all `true`

### `_BasePacks` packs — defaults: `overlayPacks: true`, `includeCredits: true`
- `basePacks` is not applicable here — base packs cannot include other base packs.

### `_OverlayPacks` packs — defaults: `overlayPacks: false`, `includeCredits: true`
- `basePacks` is not applicable here — overlay packs cannot include base packs.
- `overlayPacks` defaults to `false` — opt in via `build-config.json` when an overlay needs other overlays applied.

### Merge order 
1. Base pack files (if `basePacks: true`)
2. The pack's own files (always, overrides base)
3. Overlay pack files (if `overlayPacks: true`, overrides everything)

`pack.mcmeta` and `pack.png` are never copied from overlay packs — each pack keeps its own. Similarly for Bedrock, `manifest.json` and `pack_icon.png` are excluded.

## Building
- Install [Bun](https://bun.sh) if you don't have it already.
- Open a terminal to the project root.
- On first use, install script dependencies: `bun install --cwd scripts`
- Run the build script: `bun run ./scripts/build.ts`
- Output is written to the `out/` directory along with a `checksums.txt` (SHA1 hashes).
