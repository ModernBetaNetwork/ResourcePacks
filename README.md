# Modern Beta resource packs

Textures, models, and language files for the visual trickery that makes Modern Beta possible!

## Building the packs

We use a script to package all the resource packs and produce SHA1 hashes for the resource pack
delivery service. If you prefer not to use the script, it essentially just zips the contents of
each pack folder, which you can do manually.

- Install [Bun](https://bun.sh) if you don't have it already.
- Open a terminal to the project root. (The directory that contains this `README.md` file)
	- When you work in this repository for the first time, you must install the script dependencies. (`bun install --cwd scripts`)
- Run the [build script](./scripts/build.ts) to package all the packs. (`bun run ./scripts/build.ts`)
	- The script will output all files to the `out` directory in the project root.
