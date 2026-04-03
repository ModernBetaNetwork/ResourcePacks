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

const JAVA_PREFIX = "java-";
const BEDROCK_NAME = "bedrock";

const packDirs = (await readdir(rootDir, { recursive: false }))
	.map((path) => basename(path))
	.filter((name) => name.startsWith(JAVA_PREFIX) || name === BEDROCK_NAME);

if (packDirs.length < 1)
	throw new Error(
		"Working directory does not contain any packs! Please run the script from the resource packs root.",
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
	zip[path] = await file.bytes();
}

const hashes: Record<string, string> = {};

for (const path of packDirs) {
	const fullPath = join(rootDir, path);

	let packId = basename(path);
	let zipPath: string;
	if (packId.startsWith(JAVA_PREFIX)) {
		packId = packId.slice(JAVA_PREFIX.length);
		zipPath = join(outDir, `${packId}.zip`);
	} else if (packId === BEDROCK_NAME) {
		zipPath = join(outDir, `${packId}.mcpack`);
	} else {
		console.warn(
			"Unsupported pack id: " +
				packId +
				". This should never happen. Skipping",
		);
		continue;
	}

	const zipContents: Zippable = {};

	addFile(zipContents, basename(licenseFile.name!), licenseFile);
	addFile(zipContents, basename(creditsFile.name!), creditsFile);

	for (const filePath of await readdir(fullPath, { recursive: true })) {
		try {
			await addFile(
				zipContents,
				filePath,
				Bun.file(join(fullPath, filePath)),
			);
		} catch (err) {
			if (Error.isError(err) && "code" in err && err.code === "EISDIR")
				continue;
			else throw err;
		}
	}

	const zip = zipSync(zipContents, { level: CompressionLevel.DEFAULT });
	await Bun.write(Bun.file(zipPath), zip);

	const hash = SHA1.hash(await Bun.file(zipPath).arrayBuffer(), "hex");
	hashes[basename(zipPath)] = hash;

	console.info(`Saved ${packId} (${hash})`);
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
