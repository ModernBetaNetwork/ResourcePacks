#!/usr/bin/env bun

import { SHA1, type BunFile } from "bun";
import { zipSync, type Zippable } from "fflate";
import { mkdir, readdir } from "node:fs/promises";
import { basename, dirname, join } from "node:path";

const rootDir = dirname(import.meta.dir); // the `scripts` dir's parent dir path - which is the project root
const outDir = join(rootDir, "out");

const licenseFile = Bun.file(join(rootDir, "LICENSE"));
const creditsFile = Bun.file(join(rootDir, "CREDITS.txt"));

if (!(await licenseFile.exists()))
	throw new Error("`LICENSE` file does not exist in the working directory!");
if (!(await creditsFile.exists()))
	throw new Error("`CREDITS.txt` file does not exist in the working directory!");

const JAVA_DIR = "java";
const BEDROCK_DIR = "bedrock";

// Special subdirectories that group packs by role
const BASE_DIR = "_BasePacks";
const OVERLAY_DIR = "_OverlayPacks";
const STANDALONE_DIR = "_StandalonePacks";

type PackEntry = { name: string; dir: string; hasJava: boolean; hasBedrock: boolean };

async function discoverPacks(searchDir: string): Promise<PackEntry[]> {
	let entries: Awaited<ReturnType<typeof readdir>>;
	try {
		entries = await readdir(searchDir, { withFileTypes: true });
	} catch {
		return [];
	}
	return (
		await Promise.all(
			entries
				.filter((e) => e.isDirectory())
				.map(async (e) => {
					const sub = await readdir(join(searchDir, e.name), { recursive: false });
					const hasJava = sub.includes(JAVA_DIR);
					const hasBedrock = sub.includes(BEDROCK_DIR);
					return hasJava || hasBedrock
						? ({ name: e.name, dir: searchDir, hasJava, hasBedrock } satisfies PackEntry)
						: null;
				}),
		)
	).filter((x) => x !== null);
}

// Discover packs from each location
const [mainPacks, basePacks, overlayPacks, standalonePacks] = await Promise.all([
	discoverPacks(rootDir),
	discoverPacks(join(rootDir, BASE_DIR)),
	discoverPacks(join(rootDir, OVERLAY_DIR)),
	discoverPacks(join(rootDir, STANDALONE_DIR)),
]);

// Filter out the base/ overlay/ standalone/ out/ scripts/ dirs from mainPacks
const RESERVED_DIRS = new Set([BASE_DIR, OVERLAY_DIR, STANDALONE_DIR, "out", "scripts"]);
const filteredMainPacks = mainPacks.filter((p) => !RESERVED_DIRS.has(p.name));

const allPacks = [...filteredMainPacks, ...basePacks, ...overlayPacks, ...standalonePacks];

if (allPacks.length < 1)
	throw new Error(
		"Working directory contains no pack folders. Each pack folder must have a `java` and/or `bedrock` subfolder.",
	);

makeOutputDir: {
	try {
		await mkdir(outDir);
	} catch (err) {
		if (Error.isError(err) && "code" in err && err.code === "EEXIST") break makeOutputDir;
		else throw err;
	}
}

const CompressionLevel = {
	NONE: 0,
	LESS: 1,
	DEFAULT: 6,
	HIGHEST: 9,
} as const;
type CompressionLevel = 0 | 1 | 6 | 9;

async function addFile(zip: Zippable, path: string, file: BunFile) {
	zip[path.replaceAll("\\", "/")] = await file.bytes();
}

async function dirExists(path: string): Promise<boolean> {
	try {
		await readdir(path);
		return true;
	} catch {
		return false;
	}
}

async function addDirToZip(zip: Zippable, sourceDir: string, exclude?: Set<string>): Promise<void> {
	for (const filePath of await readdir(sourceDir, { recursive: true })) {
		if (exclude && exclude.has(basename(filePath))) continue;
		try {
			await addFile(zip, filePath, Bun.file(join(sourceDir, filePath)));
		} catch (err) {
			if (Error.isError(err) && "code" in err && err.code === "EISDIR") continue;
			else throw err;
		}
	}
}

// Files that should never be copied from overlay packs (each pack has its own)
const OVERLAY_EXCLUDE = new Set(["pack.mcmeta", "pack.png"]);

async function buildZip(
	pack: PackEntry,
	subDir: string,
	isStandalone: boolean,
): Promise<Zippable> {
	const contents: Zippable = {};
	const sourceDir = join(pack.dir, pack.name, subDir);

	await addFile(contents, basename(licenseFile.name!), licenseFile);
	await addFile(contents, basename(creditsFile.name!), creditsFile);

	if (!isStandalone) {
		// 1. Add all base pack files (pack's own files will override these)
		for (const basePack of basePacks) {
			const baseDir = join(basePack.dir, basePack.name, subDir);
			if (await dirExists(baseDir)) {
				await addDirToZip(contents, baseDir);
			}
		}
	}

	// 2. Add this pack's own files
	await addDirToZip(contents, sourceDir);

	if (!isStandalone) {
		// 3. Add all overlay pack files on top (overrides everything)
		for (const overlayPack of overlayPacks) {
			const overlayDir = join(overlayPack.dir, overlayPack.name, subDir);
			if (await dirExists(overlayDir)) {
				await addDirToZip(contents, overlayDir, OVERLAY_EXCLUDE);
			}
		}
	}

	return contents;
}

const hashes: Record<string, string> = {};

for (const pack of allPacks) {
	// Packs inside _BasePacks/, _OverlayPacks/, or _StandalonePacks/ are built standalone
	const isStandalone = pack.dir !== rootDir;

	const variants: { subDir: string; ext: string }[] = [];
	if (pack.hasJava) variants.push({ subDir: JAVA_DIR, ext: "zip" });
	if (pack.hasBedrock) variants.push({ subDir: BEDROCK_DIR, ext: "mcpack" });

	for (const { subDir, ext } of variants) {
		const zipPath = join(outDir, `${pack.name}.${ext}`);

		const contents = await buildZip(pack, subDir, isStandalone);
		const zip = zipSync(contents, { level: CompressionLevel.DEFAULT });

		await Bun.write(Bun.file(zipPath), zip);

		const hash = SHA1.hash(await Bun.file(zipPath).arrayBuffer(), "hex");
		hashes[basename(zipPath)] = hash;
		console.info(`Saved ${pack.name}.${ext} (${hash})`);
	}
}

const longestFilenameLength = Object.keys(hashes)
	.map((filename) => filename.length)
	.toSorted((a, b) => b - a)[0]!;

await Bun.write(
	Bun.file(join(outDir, "checksums.txt")),
	Object.entries(hashes).map(
		([filename, hash]) => `${filename.padEnd(longestFilenameLength, " ")} ${hash}\n`,
	),
);
