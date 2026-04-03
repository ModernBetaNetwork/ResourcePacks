#!/usr/bin/env bun

import { SHA1 } from "bun";
import { mkdir, readdir } from "node:fs/promises";
import { basename, join } from "node:path";
import { exit } from "node:process";
import { CompressionLevel, createArchive } from "zip-bun";

const cwd = process.cwd();
const outDir = join(cwd, "out");

const licenseFile = Bun.file(join(cwd, "LICENSE"));
const creditsFile = Bun.file(join(cwd, "CREDITS.txt"));

if (!(await licenseFile.exists()))
	throw new Error("`LICENSE` file does not exist in the working directory!");
if (!(await creditsFile.exists()))
	throw new Error(
		"`CREDITS.txt` file does not exist in the working directory!",
	);

const JAVA_PREFIX = "java-";
const BEDROCK_NAME = "bedrock";

const packDirs = (await readdir(cwd, { recursive: false }))
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

for (const path of packDirs) {
	const fullPath = join(cwd, path);

	let packId = basename(path);
	if (packId.startsWith(JAVA_PREFIX))
		packId = packId.slice(JAVA_PREFIX.length);

	const zipPath = join(outDir, `${packId}.zip`);
	const zip = createArchive(zipPath);

	zip.addFile(
		basename(licenseFile.name!),
		await licenseFile.arrayBuffer(),
		CompressionLevel.NO_COMPRESSION,
	);
	zip.addFile(
		basename(creditsFile.name!),
		await creditsFile.arrayBuffer(),
		CompressionLevel.NO_COMPRESSION,
	);

	for (const filePath of await readdir(fullPath, { recursive: true })) {
		try {
			zip.addFile(
				filePath,
				await Bun.file(join(fullPath, filePath)).arrayBuffer(),
				CompressionLevel.DEFAULT,
			);
		} catch (err) {
			if (Error.isError(err) && "code" in err && err.code === "EISDIR")
				continue;
		}
	}

	const savedSuccessfully = zip.finalize();
	if (!savedSuccessfully) {
		console.error(
			`${packId} not saved successfully, but didn't throw an error!`,
		);
		exit(1);
	}

	const hash = SHA1.hash(await Bun.file(zipPath).arrayBuffer(), "hex");
	Bun.write(Bun.file(zipPath + ".sha1"), hash);

	console.info(`Saved ${packId} (${hash})`);
}
