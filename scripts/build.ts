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
	throw new Error(
		"`CREDITS.txt` file does not exist in the working directory!",
	);

const JAVA_DIR = "java";
const BEDROCK_DIR = "bedrock";

// A pack folder is any directory that contains a "java" or "bedrock" subfolder
const allEntries = await readdir(rootDir, { withFileTypes: true });
const packDirs = (
	await Promise.all(
		allEntries
			.filter((e) => e.isDirectory())
			.map(async (e) => {
				const sub = await readdir(join(rootDir, e.name), { recursive: false });
				const hasJava = sub.includes(JAVA_DIR);
				const hasBedrock = sub.includes(BEDROCK_DIR);
				return hasJava || hasBedrock ? { name: e.name, hasJava, hasBedrock } : null;
			}),
	)
).filter((x) => x !== null);

if (packDirs.length < 1)
	throw new Error(
		"Working directory contains no pack folders. Each pack folder must have a `java` and/or `bedrock` subfolder.",
	);

makeOutputDir: {
	try {
		await mkdir(outDir);
	} catch (err) {
		if (Error.isError(err) && "code" in err && err.code === "EEXIST")
			break makeOutputDir;
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

async function buildZip(sourceDir: string): Promise<Zippable> {
	const contents: Zippable = {};
	await addFile(contents, basename(licenseFile.name!), licenseFile);
	await addFile(contents, basename(creditsFile.name!), creditsFile);
	for (const filePath of await readdir(sourceDir, { recursive: true })) {
		try {
			await addFile(contents, filePath, Bun.file(join(sourceDir, filePath)));
		} catch (err) {
			if (Error.isError(err) && "code" in err && err.code === "EISDIR")
				continue;
			else throw err;
		}
	}
	return contents;
}

const hashes: Record<string, string> = {};

for (const { name: packName, hasJava, hasBedrock } of packDirs) {
	const packRoot = join(rootDir, packName);

	const variants: { subDir: string; ext: string }[] = [];
	if (hasJava)    variants.push({ subDir: JAVA_DIR,    ext: "zip"    });
	if (hasBedrock) variants.push({ subDir: BEDROCK_DIR, ext: "mcpack" });

	for (const { subDir, ext } of variants) {
		const sourceDir = join(packRoot, subDir);
		const zipPath   = join(outDir, `${packName}.${ext}`);

		const contents = await buildZip(sourceDir);
		const zip      = zipSync(contents, { level: CompressionLevel.DEFAULT });

		await Bun.write(Bun.file(zipPath), zip);

		const hash = SHA1.hash(await Bun.file(zipPath).arrayBuffer(), "hex");
		hashes[basename(zipPath)] = hash;
		console.info(`Saved ${packName}.${ext} (${hash})`);
	}
}

const longestFilenameLength = Object.keys(hashes)
	.map((filename) => filename.length)
	.toSorted((a, b) => b - a)[0]!;

await Bun.write(
	Bun.file(join(outDir, "checksums.txt")),
	Object.entries(hashes).map(
		([filename, hash]) =>
			`${filename.padEnd(longestFilenameLength, " ")} ${hash}\n`,
	),
);
