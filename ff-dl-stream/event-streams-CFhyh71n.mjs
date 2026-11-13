import { n as __esmMin } from "./rolldown-runtime-C1I3wEg2.mjs";
import { f as init_transport, i as toHex, l as init_schema, n as fromHex, o as toUtf8, p as hasOwn, s as fromUtf8, t as init_serde, u as TypeRegistry } from "./app.mjs";
import { Readable } from "node:stream";
import * as zlib from "node:zlib";
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/checksum/crc32/Crc32Js.js
var CRC32_TABLE, ONES, Crc32Js;
var init_Crc32Js = __esmMin((() => {
	CRC32_TABLE = /* @__PURE__ */ new Uint32Array(256);
	for (let i = 0; i < 256; ++i) {
		let c = i;
		for (let j = 0; j < 8; ++j) c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
		CRC32_TABLE[i] = c >>> 0;
	}
	ONES = 4294967295;
	Crc32Js = class {
		digestLength = 4;
		checksum = ONES;
		update(data) {
			for (let i = 0; i < data.length; ++i) this.checksum = this.checksum >>> 8 ^ CRC32_TABLE[(this.checksum ^ data[i]) & 255];
		}
		digestSync() {
			return (this.checksum ^ ONES) >>> 0;
		}
		async digest() {
			const value = this.digestSync();
			const out = /* @__PURE__ */ new Uint8Array(4);
			new DataView(out.buffer).setUint32(0, value, false);
			return out;
		}
		reset() {
			this.checksum = ONES;
		}
	};
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/checksum/crc32/Crc32Node.js
function buildNativeClass(nativeCrc32) {
	return class Crc32Node {
		digestLength = 4;
		value = 0;
		update(data) {
			this.value = nativeCrc32(data, this.value);
		}
		digestSync() {
			return this.value >>> 0;
		}
		async digest() {
			const out = /* @__PURE__ */ new Uint8Array(4);
			new DataView(out.buffer).setUint32(0, this.digestSync(), false);
			return out;
		}
		reset() {
			this.value = 0;
		}
	};
}
var zlibCrc32, Crc32Node;
var init_Crc32Node = __esmMin((() => {
	init_Crc32Js();
	zlibCrc32 = typeof zlib.crc32 === "function" ? zlib.crc32 : void 0;
	Crc32Node = zlibCrc32 ? buildNativeClass(zlibCrc32) : Crc32Js;
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/checksum/index.js
var init_checksum = __esmMin((() => {
	init_Crc32Js();
	init_Crc32Node();
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-codec/Int64.js
function negate(bytes) {
	for (let i = 0; i < 8; i++) bytes[i] ^= 255;
	for (let i = 7; i > -1; i--) {
		bytes[i]++;
		if (bytes[i] !== 0) break;
	}
}
var Int64;
var init_Int64 = __esmMin((() => {
	init_serde();
	Int64 = class Int64 {
		bytes;
		constructor(bytes) {
			this.bytes = bytes;
			if (bytes.byteLength !== 8) throw new Error("Int64 buffers must be exactly 8 bytes");
		}
		static fromNumber(number) {
			if (number > 0x8000000000000000 || number < -0x8000000000000000) throw new Error(`${number} is too large (or, if negative, too small) to represent as an Int64`);
			const bytes = /* @__PURE__ */ new Uint8Array(8);
			for (let i = 7, remaining = Math.abs(Math.round(number)); i > -1 && remaining > 0; i--, remaining /= 256) bytes[i] = remaining;
			if (number < 0) negate(bytes);
			return new Int64(bytes);
		}
		valueOf() {
			const bytes = this.bytes.slice(0);
			const negative = bytes[0] & 128;
			if (negative) negate(bytes);
			return parseInt(toHex(bytes), 16) * (negative ? -1 : 1);
		}
		toString() {
			return String(this.valueOf());
		}
	};
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-codec/HeaderMarshaller.js
var HeaderMarshaller, HEADER_VALUE_TYPE, BOOLEAN_TAG, BYTE_TAG, SHORT_TAG, INT_TAG, LONG_TAG, BINARY_TAG, STRING_TAG, TIMESTAMP_TAG, UUID_TAG, UUID_PATTERN;
var init_HeaderMarshaller = __esmMin((() => {
	init_transport();
	init_serde();
	init_Int64();
	HeaderMarshaller = class {
		toUtf8;
		fromUtf8;
		constructor(toUtf8, fromUtf8) {
			this.toUtf8 = toUtf8;
			this.fromUtf8 = fromUtf8;
		}
		format(headers) {
			const chunks = [];
			for (const headerName in headers) {
				if (!hasOwn(headers, headerName)) continue;
				const bytes = this.fromUtf8(headerName);
				chunks.push(Uint8Array.from([bytes.byteLength]), bytes, this.formatHeaderValue(headers[headerName]));
			}
			const out = new Uint8Array(chunks.reduce((carry, bytes) => carry + bytes.byteLength, 0));
			let position = 0;
			for (const chunk of chunks) {
				out.set(chunk, position);
				position += chunk.byteLength;
			}
			return out;
		}
		formatHeaderValue(header) {
			switch (header.type) {
				case "boolean": return Uint8Array.from([header.value ? 0 : 1]);
				case "byte": return Uint8Array.from([2, header.value]);
				case "short":
					const shortView = /* @__PURE__ */ new DataView(/* @__PURE__ */ new ArrayBuffer(3));
					shortView.setUint8(0, 3);
					shortView.setInt16(1, header.value, false);
					return new Uint8Array(shortView.buffer);
				case "integer":
					const intView = /* @__PURE__ */ new DataView(/* @__PURE__ */ new ArrayBuffer(5));
					intView.setUint8(0, 4);
					intView.setInt32(1, header.value, false);
					return new Uint8Array(intView.buffer);
				case "long":
					const longBytes = /* @__PURE__ */ new Uint8Array(9);
					longBytes[0] = 5;
					longBytes.set(header.value.bytes, 1);
					return longBytes;
				case "binary":
					const binView = new DataView(new ArrayBuffer(3 + header.value.byteLength));
					binView.setUint8(0, 6);
					binView.setUint16(1, header.value.byteLength, false);
					const binBytes = new Uint8Array(binView.buffer);
					binBytes.set(header.value, 3);
					return binBytes;
				case "string":
					const utf8Bytes = this.fromUtf8(header.value);
					const strView = new DataView(new ArrayBuffer(3 + utf8Bytes.byteLength));
					strView.setUint8(0, 7);
					strView.setUint16(1, utf8Bytes.byteLength, false);
					const strBytes = new Uint8Array(strView.buffer);
					strBytes.set(utf8Bytes, 3);
					return strBytes;
				case "timestamp":
					const tsBytes = /* @__PURE__ */ new Uint8Array(9);
					tsBytes[0] = 8;
					tsBytes.set(Int64.fromNumber(header.value.valueOf()).bytes, 1);
					return tsBytes;
				case "uuid":
					if (!UUID_PATTERN.test(header.value)) throw new Error(`Invalid UUID received: ${header.value}`);
					const uuidBytes = /* @__PURE__ */ new Uint8Array(17);
					uuidBytes[0] = 9;
					uuidBytes.set(fromHex(header.value.replace(/-/g, "")), 1);
					return uuidBytes;
			}
		}
		parse(headers) {
			const out = {};
			let position = 0;
			while (position < headers.byteLength) {
				const nameLength = headers.getUint8(position++);
				const name = this.toUtf8(new Uint8Array(headers.buffer, headers.byteOffset + position, nameLength));
				position += nameLength;
				switch (headers.getUint8(position++)) {
					case 0:
						out[name] = {
							type: BOOLEAN_TAG,
							value: true
						};
						break;
					case 1:
						out[name] = {
							type: BOOLEAN_TAG,
							value: false
						};
						break;
					case 2:
						out[name] = {
							type: BYTE_TAG,
							value: headers.getInt8(position++)
						};
						break;
					case 3:
						out[name] = {
							type: SHORT_TAG,
							value: headers.getInt16(position, false)
						};
						position += 2;
						break;
					case 4:
						out[name] = {
							type: INT_TAG,
							value: headers.getInt32(position, false)
						};
						position += 4;
						break;
					case 5:
						out[name] = {
							type: LONG_TAG,
							value: new Int64(new Uint8Array(headers.buffer, headers.byteOffset + position, 8))
						};
						position += 8;
						break;
					case 6:
						const binaryLength = headers.getUint16(position, false);
						position += 2;
						out[name] = {
							type: BINARY_TAG,
							value: new Uint8Array(headers.buffer, headers.byteOffset + position, binaryLength)
						};
						position += binaryLength;
						break;
					case 7:
						const stringLength = headers.getUint16(position, false);
						position += 2;
						out[name] = {
							type: STRING_TAG,
							value: this.toUtf8(new Uint8Array(headers.buffer, headers.byteOffset + position, stringLength))
						};
						position += stringLength;
						break;
					case 8:
						out[name] = {
							type: TIMESTAMP_TAG,
							value: new Date(new Int64(new Uint8Array(headers.buffer, headers.byteOffset + position, 8)).valueOf())
						};
						position += 8;
						break;
					case 9:
						const uuidBytes = new Uint8Array(headers.buffer, headers.byteOffset + position, 16);
						position += 16;
						out[name] = {
							type: UUID_TAG,
							value: `${toHex(uuidBytes.subarray(0, 4))}-${toHex(uuidBytes.subarray(4, 6))}-${toHex(uuidBytes.subarray(6, 8))}-${toHex(uuidBytes.subarray(8, 10))}-${toHex(uuidBytes.subarray(10))}`
						};
						break;
					default: throw new Error(`Unrecognized header type tag`);
				}
			}
			return out;
		}
	};
	(function(HEADER_VALUE_TYPE) {
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["boolTrue"] = 0] = "boolTrue";
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["boolFalse"] = 1] = "boolFalse";
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["byte"] = 2] = "byte";
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["short"] = 3] = "short";
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["integer"] = 4] = "integer";
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["long"] = 5] = "long";
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["byteArray"] = 6] = "byteArray";
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["string"] = 7] = "string";
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["timestamp"] = 8] = "timestamp";
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["uuid"] = 9] = "uuid";
	})(HEADER_VALUE_TYPE || (HEADER_VALUE_TYPE = {}));
	BOOLEAN_TAG = "boolean";
	BYTE_TAG = "byte";
	SHORT_TAG = "short";
	INT_TAG = "integer";
	LONG_TAG = "long";
	BINARY_TAG = "binary";
	STRING_TAG = "string";
	TIMESTAMP_TAG = "timestamp";
	UUID_TAG = "uuid";
	UUID_PATTERN = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-codec/splitMessage.js
function splitMessage({ byteLength, byteOffset, buffer }) {
	if (byteLength < MINIMUM_MESSAGE_LENGTH) throw new Error("Provided message too short to accommodate event stream message overhead");
	const view = new DataView(buffer, byteOffset, byteLength);
	const messageLength = view.getUint32(0, false);
	if (byteLength !== messageLength) throw new Error("Reported message length does not match received message length");
	const headerLength = view.getUint32(PRELUDE_MEMBER_LENGTH, false);
	const expectedPreludeChecksum = view.getUint32(PRELUDE_LENGTH, false);
	const expectedMessageChecksum = view.getUint32(byteLength - CHECKSUM_LENGTH, false);
	const checksummer = new Crc32Node();
	checksummer.update(new Uint8Array(buffer, byteOffset, PRELUDE_LENGTH));
	if (expectedPreludeChecksum !== checksummer.digestSync()) throw new Error(`The prelude checksum specified in the message (${expectedPreludeChecksum}) does not match the calculated CRC32 checksum (${checksummer.digestSync()})`);
	checksummer.update(new Uint8Array(buffer, byteOffset + PRELUDE_LENGTH, byteLength - 12));
	if (expectedMessageChecksum !== checksummer.digestSync()) throw new Error(`The message checksum (${checksummer.digestSync()}) did not match the expected value of ${expectedMessageChecksum}`);
	return {
		headers: new DataView(buffer, byteOffset + PRELUDE_LENGTH + CHECKSUM_LENGTH, headerLength),
		body: new Uint8Array(buffer, byteOffset + PRELUDE_LENGTH + CHECKSUM_LENGTH + headerLength, messageLength - headerLength - 16)
	};
}
var PRELUDE_MEMBER_LENGTH, PRELUDE_LENGTH, CHECKSUM_LENGTH, MINIMUM_MESSAGE_LENGTH;
var init_splitMessage = __esmMin((() => {
	init_checksum();
	PRELUDE_MEMBER_LENGTH = 4;
	PRELUDE_LENGTH = 8;
	CHECKSUM_LENGTH = 4;
	MINIMUM_MESSAGE_LENGTH = 16;
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-codec/EventStreamCodec.js
var EventStreamCodec;
var init_EventStreamCodec = __esmMin((() => {
	init_checksum();
	init_HeaderMarshaller();
	init_splitMessage();
	EventStreamCodec = class {
		headerMarshaller;
		messageBuffer;
		isEndOfStream;
		constructor(toUtf8, fromUtf8) {
			this.headerMarshaller = new HeaderMarshaller(toUtf8, fromUtf8);
			this.messageBuffer = [];
			this.isEndOfStream = false;
		}
		feed(message) {
			this.messageBuffer.push(this.decode(message));
		}
		endOfStream() {
			this.isEndOfStream = true;
		}
		getMessage() {
			const message = this.messageBuffer.pop();
			const isEndOfStream = this.isEndOfStream;
			return {
				getMessage() {
					return message;
				},
				isEndOfStream() {
					return isEndOfStream;
				}
			};
		}
		getAvailableMessages() {
			const messages = this.messageBuffer;
			this.messageBuffer = [];
			const isEndOfStream = this.isEndOfStream;
			return {
				getMessages() {
					return messages;
				},
				isEndOfStream() {
					return isEndOfStream;
				}
			};
		}
		encode({ headers: rawHeaders, body }) {
			const headers = this.headerMarshaller.format(rawHeaders);
			const length = headers.byteLength + body.byteLength + 16;
			const out = new Uint8Array(length);
			const view = new DataView(out.buffer, out.byteOffset, out.byteLength);
			const checksum = new Crc32Node();
			view.setUint32(0, length, false);
			view.setUint32(4, headers.byteLength, false);
			checksum.update(out.subarray(0, 8));
			view.setUint32(8, checksum.digestSync(), false);
			out.set(headers, 12);
			out.set(body, headers.byteLength + 12);
			checksum.update(out.subarray(8, length - 4));
			view.setUint32(length - 4, checksum.digestSync(), false);
			return out;
		}
		decode(message) {
			const { headers, body } = splitMessage(message);
			return {
				headers: this.headerMarshaller.parse(headers),
				body
			};
		}
		formatHeaders(rawHeaders) {
			return this.headerMarshaller.format(rawHeaders);
		}
	};
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-codec/MessageDecoderStream.js
var MessageDecoderStream;
var init_MessageDecoderStream = __esmMin((() => {
	MessageDecoderStream = class {
		options;
		constructor(options) {
			this.options = options;
		}
		[Symbol.asyncIterator]() {
			return this.asyncIterator();
		}
		async *asyncIterator() {
			for await (const bytes of this.options.inputStream) yield this.options.decoder.decode(bytes);
		}
	};
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-codec/MessageEncoderStream.js
var MessageEncoderStream;
var init_MessageEncoderStream = __esmMin((() => {
	MessageEncoderStream = class {
		options;
		constructor(options) {
			this.options = options;
		}
		[Symbol.asyncIterator]() {
			return this.asyncIterator();
		}
		async *asyncIterator() {
			for await (const msg of this.options.messageStream) yield this.options.encoder.encode(msg);
			if (this.options.includeEndFrame) yield /* @__PURE__ */ new Uint8Array(0);
		}
	};
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-codec/SmithyMessageDecoderStream.js
var SmithyMessageDecoderStream;
var init_SmithyMessageDecoderStream = __esmMin((() => {
	SmithyMessageDecoderStream = class {
		options;
		constructor(options) {
			this.options = options;
		}
		[Symbol.asyncIterator]() {
			return this.asyncIterator();
		}
		async *asyncIterator() {
			for await (const message of this.options.messageStream) {
				const deserialized = await this.options.deserializer(message);
				if (deserialized === void 0) continue;
				yield deserialized;
			}
		}
	};
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-codec/SmithyMessageEncoderStream.js
var SmithyMessageEncoderStream;
var init_SmithyMessageEncoderStream = __esmMin((() => {
	SmithyMessageEncoderStream = class {
		options;
		constructor(options) {
			this.options = options;
		}
		[Symbol.asyncIterator]() {
			return this.asyncIterator();
		}
		async *asyncIterator() {
			for await (const chunk of this.options.inputStream) yield this.options.serializer(chunk);
		}
	};
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-serde-universal/getChunkedStream.js
function getChunkedStream(source) {
	let currentMessageTotalLength = 0;
	let currentMessagePendingLength = 0;
	let currentMessage = null;
	let messageLengthBuffer = null;
	const allocateMessage = (size) => {
		if (typeof size !== "number") throw new Error("Attempted to allocate an event message where size was not a number: " + size);
		currentMessageTotalLength = size;
		currentMessagePendingLength = 4;
		currentMessage = new Uint8Array(size);
		new DataView(currentMessage.buffer).setUint32(0, size, false);
	};
	const iterator = async function* () {
		const sourceIterator = source[Symbol.asyncIterator]();
		while (true) {
			const { value, done } = await sourceIterator.next();
			if (done) {
				if (!currentMessageTotalLength) return;
				else if (currentMessageTotalLength === currentMessagePendingLength) yield currentMessage;
				else throw new Error("Truncated event message received.");
				return;
			}
			const chunkLength = value.length;
			let currentOffset = 0;
			while (currentOffset < chunkLength) {
				if (!currentMessage) {
					const bytesRemaining = chunkLength - currentOffset;
					if (!messageLengthBuffer) messageLengthBuffer = /* @__PURE__ */ new Uint8Array(4);
					const numBytesForTotal = Math.min(4 - currentMessagePendingLength, bytesRemaining);
					messageLengthBuffer.set(value.slice(currentOffset, currentOffset + numBytesForTotal), currentMessagePendingLength);
					currentMessagePendingLength += numBytesForTotal;
					currentOffset += numBytesForTotal;
					if (currentMessagePendingLength < 4) break;
					allocateMessage(new DataView(messageLengthBuffer.buffer).getUint32(0, false));
					messageLengthBuffer = null;
				}
				const numBytesToWrite = Math.min(currentMessageTotalLength - currentMessagePendingLength, chunkLength - currentOffset);
				currentMessage.set(value.slice(currentOffset, currentOffset + numBytesToWrite), currentMessagePendingLength);
				currentMessagePendingLength += numBytesToWrite;
				currentOffset += numBytesToWrite;
				if (currentMessageTotalLength && currentMessageTotalLength === currentMessagePendingLength) {
					yield currentMessage;
					currentMessage = null;
					currentMessageTotalLength = 0;
					currentMessagePendingLength = 0;
				}
			}
		}
	};
	return { [Symbol.asyncIterator]: iterator };
}
var init_getChunkedStream = __esmMin((() => {}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-serde-universal/getUnmarshalledStream.js
function getMessageUnmarshaller(deserializer, toUtf8) {
	return async function(message) {
		const { value: messageType } = message.headers[":message-type"];
		if (messageType === "error") {
			const unmodeledError = new Error(message.headers[":error-message"].value || "UnknownError");
			unmodeledError.name = message.headers[":error-code"].value;
			throw unmodeledError;
		} else if (messageType === "exception") {
			const code = message.headers[":exception-type"].value;
			const deserializedException = await deserializer({ [code]: message });
			if (deserializedException.$unknown) {
				const error = new Error(toUtf8(message.body));
				error.name = code;
				throw error;
			}
			throw deserializedException[code];
		} else if (messageType === "event") {
			const deserialized = await deserializer({ [message.headers[":event-type"].value]: message });
			if (deserialized.$unknown) return;
			return deserialized;
		} else throw Error(`Unrecognizable event type: ${message.headers[":event-type"].value}`);
	};
}
var init_getUnmarshalledStream = __esmMin((() => {}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-serde-universal/EventStreamMarshaller.js
var EventStreamMarshaller$1;
var init_EventStreamMarshaller$1 = __esmMin((() => {
	init_EventStreamCodec();
	init_MessageDecoderStream();
	init_MessageEncoderStream();
	init_SmithyMessageDecoderStream();
	init_SmithyMessageEncoderStream();
	init_getChunkedStream();
	init_getUnmarshalledStream();
	EventStreamMarshaller$1 = class {
		eventStreamCodec;
		utfEncoder;
		constructor({ utf8Encoder, utf8Decoder }) {
			this.eventStreamCodec = new EventStreamCodec(utf8Encoder, utf8Decoder);
			this.utfEncoder = utf8Encoder;
		}
		deserialize(body, deserializer) {
			const inputStream = getChunkedStream(body);
			return new SmithyMessageDecoderStream({
				messageStream: new MessageDecoderStream({
					inputStream,
					decoder: this.eventStreamCodec
				}),
				deserializer: getMessageUnmarshaller(deserializer, this.utfEncoder)
			});
		}
		serialize(inputStream, serializer) {
			return new MessageEncoderStream({
				messageStream: new SmithyMessageEncoderStream({
					inputStream,
					serializer
				}),
				encoder: this.eventStreamCodec,
				includeEndFrame: true
			});
		}
	};
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-serde/EventStreamMarshaller.js
async function* readableToIterable(readStream) {
	let streamEnded = false;
	let generationEnded = false;
	const records = new Array();
	readStream.on("error", (err) => {
		if (!streamEnded) streamEnded = true;
		if (err) throw err;
	});
	readStream.on("data", (data) => {
		records.push(data);
	});
	readStream.on("end", () => {
		streamEnded = true;
	});
	while (!generationEnded) {
		const value = await new Promise((resolve) => setTimeout(() => resolve(records.shift()), 0));
		if (value) yield value;
		generationEnded = streamEnded && records.length === 0;
	}
}
var EventStreamMarshaller, eventStreamSerdeProvider;
var init_EventStreamMarshaller = __esmMin((() => {
	init_EventStreamMarshaller$1();
	EventStreamMarshaller = class {
		universalMarshaller;
		constructor({ utf8Encoder, utf8Decoder }) {
			this.universalMarshaller = new EventStreamMarshaller$1({
				utf8Decoder,
				utf8Encoder
			});
		}
		deserialize(body, deserializer) {
			const bodyIterable = typeof body[Symbol.asyncIterator] === "function" ? body : readableToIterable(body);
			return this.universalMarshaller.deserialize(bodyIterable, deserializer);
		}
		serialize(input, serializer) {
			return Readable.from(this.universalMarshaller.serialize(input, serializer));
		}
	};
	eventStreamSerdeProvider = (options) => new EventStreamMarshaller(options);
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/event-streams/EventStreamSerde.js
var EventStreamSerde;
var init_EventStreamSerde = __esmMin((() => {
	init_transport();
	init_schema();
	init_serde();
	EventStreamSerde = class {
		marshaller;
		serializer;
		deserializer;
		serdeContext;
		defaultContentType;
		compositeErrorRegistry;
		constructor({ marshaller, serializer, deserializer, serdeContext, defaultContentType, compositeErrorRegistry }) {
			this.marshaller = marshaller;
			this.serializer = serializer;
			this.deserializer = deserializer;
			this.serdeContext = serdeContext;
			this.defaultContentType = defaultContentType;
			this.compositeErrorRegistry = compositeErrorRegistry;
		}
		async serializeEventStream({ eventStream, requestSchema, initialRequest, initialMessageType }) {
			const marshaller = this.marshaller;
			const eventStreamMember = requestSchema.getEventStreamMember();
			const unionSchema = requestSchema.getMemberSchema(eventStreamMember);
			const serializer = this.serializer;
			const defaultContentType = this.defaultContentType;
			const initialRequestMarker = Symbol("initialRequestMarker");
			const eventStreamIterable = { async *[Symbol.asyncIterator]() {
				if (initialRequest) {
					const headers = {
						":event-type": {
							type: "string",
							value: initialMessageType ?? "initial-request"
						},
						":message-type": {
							type: "string",
							value: "event"
						},
						":content-type": {
							type: "string",
							value: defaultContentType
						}
					};
					serializer.write(requestSchema, initialRequest);
					const body = serializer.flush();
					yield {
						[initialRequestMarker]: true,
						headers,
						body
					};
				}
				for await (const page of eventStream) yield page;
			} };
			return marshaller.serialize(eventStreamIterable, (event) => {
				if (event[initialRequestMarker]) return {
					headers: event.headers,
					body: event.body
				};
				let unionMember = "";
				for (const key in event) {
					if (!hasOwn(event, key)) continue;
					if (key !== "__type") {
						unionMember = key;
						break;
					}
				}
				const { additionalHeaders, body, eventType, explicitPayloadContentType } = this.writeEventBody(unionMember, unionSchema, event);
				return {
					headers: {
						":event-type": {
							type: "string",
							value: eventType
						},
						":message-type": {
							type: "string",
							value: "event"
						},
						":content-type": {
							type: "string",
							value: explicitPayloadContentType ?? defaultContentType
						},
						...additionalHeaders
					},
					body
				};
			});
		}
		async deserializeEventStream({ response, responseSchema, initialResponseContainer, initialMessageType }) {
			const marshaller = this.marshaller;
			const eventStreamMember = responseSchema.getEventStreamMember();
			const memberSchemas = responseSchema.getMemberSchema(eventStreamMember).getMemberSchemas();
			const initialResponseMarker = Symbol("initialResponseMarker");
			const asyncIterable = marshaller.deserialize(response.body, async (event) => {
				let unionMember = "";
				for (const key in event) {
					if (!hasOwn(event, key)) continue;
					if (key !== "__type") {
						unionMember = key;
						break;
					}
				}
				const body = event[unionMember].body;
				if (unionMember === (initialMessageType ?? "initial-response")) {
					const dataObject = await this.deserializer.read(responseSchema, body);
					delete dataObject[eventStreamMember];
					return {
						[initialResponseMarker]: true,
						...dataObject
					};
				} else if (unionMember in memberSchemas) {
					const eventStreamSchema = memberSchemas[unionMember];
					if (eventStreamSchema.isStructSchema()) {
						const out = {};
						let hasBindings = false;
						for (const [name, member] of eventStreamSchema.structIterator()) {
							const { eventHeader, eventPayload } = member.getMergedTraits();
							hasBindings = hasBindings || Boolean(eventHeader || eventPayload);
							if (eventPayload) {
								if (member.isBlobSchema()) out[name] = body;
								else if (member.isStringSchema()) out[name] = (this.serdeContext?.utf8Encoder ?? toUtf8)(body);
								else if (member.isStructSchema()) out[name] = await this.deserializer.read(member, body);
							} else if (eventHeader) {
								const value = event[unionMember].headers[name]?.value;
								if (value != null) {
									if (member.isNumericSchema()) {
										if (value && typeof value === "object" && "bytes" in value) out[name] = BigInt(value.toString());
										else out[name] = Number(value);
									} else out[name] = value;
								}
							}
						}
						return { [unionMember]: await this.readEventMember(eventStreamSchema, body, hasBindings, out) };
					}
					return { [unionMember]: await this.deserializer.read(eventStreamSchema, body) };
				} else return { $unknown: event };
			});
			const asyncIterator = asyncIterable[Symbol.asyncIterator]();
			const firstEvent = await asyncIterator.next();
			if (firstEvent.done) return asyncIterable;
			if (firstEvent.value?.[initialResponseMarker]) {
				if (!responseSchema) throw new Error("@smithy::core/protocols - initial-response event encountered in event stream but no response schema given.");
				for (const key in firstEvent.value) {
					if (!hasOwn(firstEvent.value, key)) continue;
					initialResponseContainer[key] = firstEvent.value[key];
				}
			}
			return { async *[Symbol.asyncIterator]() {
				if (!firstEvent?.value?.[initialResponseMarker]) yield firstEvent.value;
				while (true) {
					const { done, value } = await asyncIterator.next();
					if (done) break;
					yield value;
				}
			} };
		}
		async readEventMember(eventStreamSchema, body, hasBindings, out) {
			let ErrCtor;
			const staticStructuralSchema = eventStreamSchema.getSchema();
			if (Array.isArray(staticStructuralSchema) && staticStructuralSchema[0] === -3) {
				const namespace = staticStructuralSchema[1];
				const nsRegistry = TypeRegistry.for(namespace);
				this.compositeErrorRegistry?.copyFrom(nsRegistry);
				ErrCtor = (this.compositeErrorRegistry ?? nsRegistry)?.getErrorCtor(staticStructuralSchema);
			}
			const dataObject = hasBindings ? out : body.byteLength === 0 ? {} : await this.deserializer.read(eventStreamSchema, body);
			if (ErrCtor) {
				const message = dataObject.message ?? dataObject.Message ?? "Unknown";
				const metadata = {};
				const $fault = eventStreamSchema.getMergedTraits().error;
				if ($fault) metadata.$fault = $fault;
				return Object.assign(new ErrCtor({}), metadata, { message }, dataObject);
			}
			return dataObject;
		}
		writeEventBody(unionMember, unionSchema, event) {
			const serializer = this.serializer;
			let eventType = unionMember;
			let explicitPayloadMember = null;
			let explicitPayloadContentType;
			const isKnownSchema = (() => {
				return unionSchema.getSchema()[4].includes(unionMember);
			})();
			const additionalHeaders = {};
			if (!isKnownSchema) {
				const [type, value] = event[unionMember];
				eventType = type;
				serializer.write(15, value);
			} else {
				const eventSchema = unionSchema.getMemberSchema(unionMember);
				if (eventSchema.isStructSchema()) {
					for (const [memberName, memberSchema] of eventSchema.structIterator()) {
						const { eventHeader, eventPayload } = memberSchema.getMergedTraits();
						if (eventPayload) explicitPayloadMember = memberName;
						else if (eventHeader) {
							const value = event[unionMember][memberName];
							let type = "binary";
							if (memberSchema.isNumericSchema()) {
								if ((-2) ** 31 <= value && value <= 2 ** 31 - 1) type = "integer";
								else type = "long";
							} else if (memberSchema.isTimestampSchema()) type = "timestamp";
							else if (memberSchema.isStringSchema()) type = "string";
							else if (memberSchema.isBooleanSchema()) type = "boolean";
							if (value != null) {
								additionalHeaders[memberName] = {
									type,
									value
								};
								delete event[unionMember][memberName];
							}
						}
					}
					if (explicitPayloadMember !== null) {
						const payloadSchema = eventSchema.getMemberSchema(explicitPayloadMember);
						if (payloadSchema.isBlobSchema()) explicitPayloadContentType = "application/octet-stream";
						else if (payloadSchema.isStringSchema()) explicitPayloadContentType = "text/plain";
						serializer.write(payloadSchema, event[unionMember][explicitPayloadMember]);
					} else serializer.write(eventSchema, event[unionMember]);
				} else if (eventSchema.isUnitSchema()) serializer.write(eventSchema, {});
				else throw new Error("@smithy/core/event-streams - non-struct member not supported in event stream union.");
			}
			const messageSerialization = serializer.flush() ?? /* @__PURE__ */ new Uint8Array();
			return {
				body: typeof messageSerialization === "string" ? (this.serdeContext?.utf8Decoder ?? fromUtf8)(messageSerialization) : messageSerialization,
				eventType,
				explicitPayloadContentType,
				additionalHeaders
			};
		}
	};
}));
__esmMin((() => {
	init_EventStreamCodec();
	init_HeaderMarshaller();
	init_Int64();
	init_MessageDecoderStream();
	init_MessageEncoderStream();
	init_SmithyMessageDecoderStream();
	init_SmithyMessageEncoderStream();
	init_EventStreamMarshaller();
	init_EventStreamMarshaller$1();
	init_EventStreamSerde();
}))();
export { EventStreamSerde, eventStreamSerdeProvider };
