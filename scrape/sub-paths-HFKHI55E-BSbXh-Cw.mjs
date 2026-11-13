import { fileURLToPath, pathToFileURL } from "url";
import { readdir, stat } from "fs/promises";
// ../../../node_modules/.bun/@huggingface+hub@2.17.10/node_modules/@huggingface/hub/dist/sub-paths-HFKHI55E.mjs
async function subPaths(path, maxDepth = 10) {
	if (!(await stat(path)).isDirectory()) return [{
		path,
		relativePath: "."
	}];
	const files = await readdir(path, { withFileTypes: true });
	const ret = [];
	for (const file of files) {
		const filePath = pathToFileURL(fileURLToPath(path) + "/" + file.name);
		if (file.isDirectory()) ret.push(...(await subPaths(filePath, maxDepth - 1)).map((subPath) => ({
			...subPath,
			relativePath: `${file.name}/${subPath.relativePath}`
		})));
		else ret.push({
			path: filePath,
			relativePath: file.name
		});
	}
	return ret;
}
export { subPaths };
