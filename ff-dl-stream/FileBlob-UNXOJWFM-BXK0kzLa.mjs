import { Readable } from "stream";
import { fileURLToPath } from "url";
import { createReadStream } from "fs";
import { open, stat } from "fs/promises";
// ../../../node_modules/.bun/@huggingface+hub@2.17.10/node_modules/@huggingface/hub/dist/FileBlob-UNXOJWFM.mjs
var FileBlob = class extends Blob {
	/**
	* Creates a new FileBlob on the provided file.
	*
	* @param path Path to the file to be lazy readed
	*/
	static async create(path) {
		path = path instanceof URL ? fileURLToPath(path) : path;
		const { size } = await stat(path);
		return new FileBlob(path, 0, size);
	}
	path;
	start;
	end;
	constructor(path, start, end) {
		super();
		this.path = path;
		this.start = start;
		this.end = end;
	}
	/**
	* Returns the size of the blob.
	*/
	get size() {
		return this.end - this.start;
	}
	/**
	* Returns a new instance of FileBlob that is a slice of the current one.
	*
	* The slice is inclusive of the start and exclusive of the end.
	*
	* The slice method does not supports negative start/end.
	*
	* @param start beginning of the slice
	* @param end end of the slice
	*/
	slice(start = 0, end = this.size) {
		if (start < 0 || end < 0) throw new TypeError("Unsupported negative start/end on FileBlob.slice");
		return new FileBlob(this.path, this.start + start, Math.min(this.start + end, this.end));
	}
	/**
	* Read the part of the file delimited by the FileBlob and returns it as an ArrayBuffer.
	*/
	async arrayBuffer() {
		return (await this.execute((file) => file.read(Buffer.alloc(this.size), 0, this.size, this.start))).buffer;
	}
	/**
	* Read the part of the file delimited by the FileBlob and returns it as a string.
	*/
	async text() {
		return (await this.arrayBuffer()).toString("utf8");
	}
	/**
	* Returns a stream around the part of the file delimited by the FileBlob.
	*/
	stream() {
		if (this.start === this.end) return new Blob([]).stream();
		return Readable.toWeb(createReadStream(this.path, {
			start: this.start,
			end: this.end - 1
		}));
	}
	/**
	* We are opening and closing the file for each action to prevent file descriptor leaks.
	*
	* It is an intended choice of developer experience over performances.
	*/
	async execute(action) {
		const file = await open(this.path, "r");
		try {
			return await action(file);
		} finally {
			await file.close();
		}
	}
};
export { FileBlob };
