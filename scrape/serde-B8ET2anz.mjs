import { n as __esmMin } from "./rolldown-runtime-C1I3wEg2.mjs";
import { Readable, Writable } from "node:stream";
import { getRandomValues } from "node:crypto";
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/transport/hasOwn.js
function hasOwn(o, k) {
	return Object.prototype.hasOwnProperty.call(o, k);
}
var init_hasOwn = __esmMin((() => {}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/transport/httpRequest.js
function cloneQuery(query) {
	return Object.keys(query).reduce((carry, paramName) => {
		const param = query[paramName];
		return {
			...carry,
			[paramName]: Array.isArray(param) ? [...param] : param
		};
	}, {});
}
var HttpRequest;
var init_httpRequest = __esmMin((() => {
	HttpRequest = class HttpRequest {
		method;
		protocol;
		hostname;
		port;
		path;
		query;
		headers;
		username;
		password;
		fragment;
		body;
		constructor(options) {
			this.method = options.method || "GET";
			this.hostname = options.hostname || "localhost";
			this.port = options.port;
			this.query = options.query || {};
			this.headers = options.headers || {};
			this.body = options.body;
			this.protocol = options.protocol ? options.protocol.slice(-1) !== ":" ? `${options.protocol}:` : options.protocol : "https:";
			this.path = options.path ? options.path.charAt(0) !== "/" ? `/${options.path}` : options.path : "/";
			this.username = options.username;
			this.password = options.password;
			this.fragment = options.fragment;
		}
		static clone(request) {
			const cloned = new HttpRequest({
				...request,
				headers: { ...request.headers }
			});
			if (cloned.query) cloned.query = cloneQuery(cloned.query);
			return cloned;
		}
		static isInstance(request) {
			if (!request) return false;
			const req = request;
			return "method" in req && "protocol" in req && "hostname" in req && "path" in req && typeof req["query"] === "object" && typeof req["headers"] === "object";
		}
		clone() {
			return HttpRequest.clone(this);
		}
	};
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/transport/httpResponse.js
var HttpResponse;
var init_httpResponse = __esmMin((() => {
	HttpResponse = class {
		statusCode;
		reason;
		headers;
		body;
		constructor(options) {
			this.statusCode = options.statusCode;
			this.reason = options.reason;
			this.headers = options.headers || {};
			this.body = options.body;
		}
		static isInstance(response) {
			if (!response) return false;
			const resp = response;
			return typeof resp.statusCode === "number" && typeof resp.headers === "object";
		}
	};
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/transport/isValidHostLabel.js
var VALID_HOST_LABEL_REGEX, isValidHostLabel;
var init_isValidHostLabel = __esmMin((() => {
	VALID_HOST_LABEL_REGEX = new RegExp(`^(?!.*-$)(?!-)[a-zA-Z0-9-]{1,63}$`);
	isValidHostLabel = (value, allowSubDomains = false) => {
		if (!allowSubDomains) return VALID_HOST_LABEL_REGEX.test(value);
		const labels = value.split(".");
		for (const label of labels) if (!isValidHostLabel(label)) return false;
		return true;
	};
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/transport/isValidHostname.js
function isValidHostname(hostname) {
	return /^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(hostname);
}
var init_isValidHostname = __esmMin((() => {}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/transport/normalizeProvider.js
var normalizeProvider;
var init_normalizeProvider = __esmMin((() => {
	normalizeProvider = (input) => {
		if (typeof input === "function") return input;
		const promisified = Promise.resolve(input);
		return () => promisified;
	};
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/transport/parseQueryString.js
function parseQueryString(querystring) {
	const query = {};
	querystring = querystring.replace(/^\?/, "");
	if (querystring) for (const pair of querystring.split("&")) {
		let [key, value = null] = pair.split("=");
		key = decodeURIComponent(key);
		if (value) value = decodeURIComponent(value);
		if (!(key in query)) query[key] = value;
		else if (Array.isArray(query[key])) query[key].push(value);
		else query[key] = [query[key], value];
	}
	return query;
}
var init_parseQueryString = __esmMin((() => {}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/transport/parseUrl.js
var parseUrl;
var init_parseUrl = __esmMin((() => {
	init_parseQueryString();
	parseUrl = (url) => {
		if (typeof url === "string") return parseUrl(new URL(url));
		const { hostname, pathname, port, protocol, search } = url;
		let query;
		if (search) query = parseQueryString(search);
		return {
			hostname,
			port: port ? parseInt(port) : void 0,
			protocol,
			path: pathname,
			query
		};
	};
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/transport/index.js
var init_transport = __esmMin((() => {
	init_hasOwn();
	init_httpRequest();
	init_httpResponse();
	init_isValidHostLabel();
	init_isValidHostname();
	init_normalizeProvider();
	init_parseQueryString();
	init_parseUrl();
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/schema/deref.js
var deref;
var init_deref = __esmMin((() => {
	deref = (schemaRef) => {
		if (typeof schemaRef === "function") return schemaRef();
		return schemaRef;
	};
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/schema/schemas/translateTraits.js
function translateTraits(indicator) {
	if (typeof indicator === "object") return indicator;
	indicator = indicator | 0;
	if (traitsCache[indicator]) return traitsCache[indicator];
	const traits = {};
	let i = 0;
	for (const trait of [
		"httpLabel",
		"idempotent",
		"idempotencyToken",
		"sensitive",
		"httpPayload",
		"httpResponseCode",
		"httpQueryParams"
	]) if ((indicator >> i++ & 1) === 1) traits[trait] = 1;
	return traitsCache[indicator] = traits;
}
var traitsCache;
var init_translateTraits = __esmMin((() => {
	traitsCache = [];
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/schema/schemas/NormalizedSchema.js
function member(memberSchema, memberName) {
	if (memberSchema instanceof NormalizedSchema) return Object.assign(memberSchema, {
		memberName,
		_isMemberSchema: true
	});
	return new NormalizedSchema(memberSchema, memberName);
}
var anno, simpleSchemaCacheN, simpleSchemaCacheS, NormalizedSchema, isMemberSchema, isStaticSchema;
var init_NormalizedSchema = __esmMin((() => {
	init_deref();
	init_translateTraits();
	anno = {
		it: Symbol.for("@smithy/nor-struct-it"),
		ns: Symbol.for("@smithy/ns")
	};
	simpleSchemaCacheN = [];
	simpleSchemaCacheS = {};
	NormalizedSchema = class NormalizedSchema {
		ref;
		memberName;
		static symbol = Symbol.for("@smithy/nor");
		symbol = NormalizedSchema.symbol;
		name;
		schema;
		_isMemberSchema;
		traits;
		memberTraits;
		normalizedTraits;
		constructor(ref, memberName) {
			this.ref = ref;
			this.memberName = memberName;
			const traitStack = [];
			let _ref = ref;
			let schema = ref;
			this._isMemberSchema = false;
			while (isMemberSchema(_ref)) {
				traitStack.push(_ref[1]);
				_ref = _ref[0];
				schema = deref(_ref);
				this._isMemberSchema = true;
			}
			if (traitStack.length > 0) {
				this.memberTraits = {};
				for (let i = traitStack.length - 1; i >= 0; --i) {
					const traitSet = traitStack[i];
					Object.assign(this.memberTraits, translateTraits(traitSet));
				}
			} else this.memberTraits = 0;
			if (schema instanceof NormalizedSchema) {
				const computedMemberTraits = this.memberTraits;
				Object.assign(this, schema);
				this.memberTraits = Object.assign({}, computedMemberTraits, schema.getMemberTraits(), this.getMemberTraits());
				this.normalizedTraits = void 0;
				this.memberName = memberName ?? schema.memberName;
				return;
			}
			this.schema = deref(schema);
			if (isStaticSchema(this.schema)) {
				this.name = `${this.schema[1]}#${this.schema[2]}`;
				this.traits = this.schema[3];
			} else {
				this.name = this.memberName ?? String(schema);
				this.traits = 0;
			}
			if (this._isMemberSchema && !memberName) throw new Error(`@smithy/core/schema - NormalizedSchema member init ${this.getName(true)} missing member name.`);
		}
		static [Symbol.hasInstance](lhs) {
			const isPrototype = this.prototype.isPrototypeOf(lhs);
			if (!isPrototype && typeof lhs === "object" && lhs !== null) return lhs.symbol === this.symbol;
			return isPrototype;
		}
		static of(ref) {
			const keyAble = typeof ref === "function" || typeof ref === "object" && ref !== null;
			if (typeof ref === "number") {
				if (simpleSchemaCacheN[ref]) return simpleSchemaCacheN[ref];
			} else if (typeof ref === "string") {
				if (simpleSchemaCacheS[ref]) return simpleSchemaCacheS[ref];
			} else if (keyAble) {
				if (ref[anno.ns]) return ref[anno.ns];
			}
			const sc = deref(ref);
			if (sc instanceof NormalizedSchema) return sc;
			if (isMemberSchema(sc)) {
				const [ns, traits] = sc;
				if (ns instanceof NormalizedSchema) {
					Object.assign(ns.getMergedTraits(), translateTraits(traits));
					return ns;
				}
				throw new Error(`@smithy/core/schema - may not init unwrapped member schema=${JSON.stringify(ref, null, 2)}.`);
			}
			const ns = new NormalizedSchema(sc);
			if (keyAble) return ref[anno.ns] = ns;
			if (typeof sc === "string") return simpleSchemaCacheS[sc] = ns;
			if (typeof sc === "number") return simpleSchemaCacheN[sc] = ns;
			return ns;
		}
		getSchema() {
			const sc = this.schema;
			if (Array.isArray(sc) && sc[0] === 0) return sc[4];
			return sc;
		}
		getName(withNamespace = false) {
			const { name } = this;
			return !withNamespace && name && name.includes("#") ? name.split("#")[1] : name || void 0;
		}
		getMemberName() {
			return this.memberName;
		}
		isMemberSchema() {
			return this._isMemberSchema;
		}
		isListSchema() {
			const sc = this.getSchema();
			return typeof sc === "number" ? sc >= 64 && sc < 128 : sc[0] === 1;
		}
		isMapSchema() {
			const sc = this.getSchema();
			return typeof sc === "number" ? sc >= 128 && sc <= 255 : sc[0] === 2;
		}
		isStructSchema() {
			const sc = this.getSchema();
			if (typeof sc !== "object") return false;
			const id = sc[0];
			return id === 3 || id === -3 || id === 4;
		}
		isUnionSchema() {
			const sc = this.getSchema();
			if (typeof sc !== "object") return false;
			return sc[0] === 4;
		}
		isBlobSchema() {
			const sc = this.getSchema();
			return sc === 21 || sc === 42;
		}
		isTimestampSchema() {
			const sc = this.getSchema();
			return typeof sc === "number" && sc >= 4 && sc <= 7;
		}
		isUnitSchema() {
			return this.getSchema() === "unit";
		}
		isDocumentSchema() {
			return this.getSchema() === 15;
		}
		isStringSchema() {
			return this.getSchema() === 0;
		}
		isBooleanSchema() {
			return this.getSchema() === 2;
		}
		isNumericSchema() {
			return this.getSchema() === 1;
		}
		isBigIntegerSchema() {
			return this.getSchema() === 17;
		}
		isBigDecimalSchema() {
			return this.getSchema() === 19;
		}
		isStreaming() {
			const { streaming } = this.getMergedTraits();
			return !!streaming || this.getSchema() === 42;
		}
		isIdempotencyToken() {
			return !!this.getMergedTraits().idempotencyToken;
		}
		getMergedTraits() {
			return this.normalizedTraits ?? (this.normalizedTraits = {
				...this.getOwnTraits(),
				...this.getMemberTraits()
			});
		}
		getMemberTraits() {
			return translateTraits(this.memberTraits);
		}
		getOwnTraits() {
			return translateTraits(this.traits);
		}
		getKeySchema() {
			const [isDoc, isMap] = [this.isDocumentSchema(), this.isMapSchema()];
			if (!isDoc && !isMap) throw new Error(`@smithy/core/schema - cannot get key for non-map: ${this.getName(true)}`);
			const schema = this.getSchema();
			return member([isDoc ? 15 : schema[4] ?? 0, 0], "key");
		}
		getValueSchema() {
			const sc = this.getSchema();
			const [isDoc, isMap, isList] = [
				this.isDocumentSchema(),
				this.isMapSchema(),
				this.isListSchema()
			];
			const memberSchema = typeof sc === "number" ? 63 & sc : sc && typeof sc === "object" && (isMap || isList) ? sc[3 + sc[0]] : isDoc ? 15 : void 0;
			if (memberSchema != null) return member([memberSchema, 0], isMap ? "value" : "member");
			throw new Error(`@smithy/core/schema - ${this.getName(true)} has no value member.`);
		}
		getMemberSchema(memberName) {
			const struct = this.getSchema();
			if (this.isStructSchema() && struct[4].includes(memberName)) {
				const i = struct[4].indexOf(memberName);
				const memberSchema = struct[5][i];
				return member(isMemberSchema(memberSchema) ? memberSchema : [memberSchema, 0], memberName);
			}
			if (this.isDocumentSchema()) return member([15, 0], memberName);
			throw new Error(`@smithy/core/schema - ${this.getName(true)} has no member=${memberName}.`);
		}
		getMemberSchemas() {
			const buffer = {};
			try {
				for (const [k, v] of this.structIterator()) buffer[k] = v;
			} catch (ignored) {}
			return buffer;
		}
		getEventStreamMember() {
			if (this.isStructSchema()) {
				for (const [memberName, memberSchema] of this.structIterator()) if (memberSchema.isStreaming() && memberSchema.isStructSchema()) return memberName;
			}
			return "";
		}
		*structIterator() {
			if (this.isUnitSchema()) return;
			if (!this.isStructSchema()) throw new Error("@smithy/core/schema - cannot iterate non-struct schema.");
			const struct = this.getSchema();
			const z = struct[4].length;
			let it = struct[anno.it];
			if (it && z === it.length) {
				yield* it;
				return;
			}
			it = Array(z);
			for (let i = 0; i < z; ++i) {
				const k = struct[4][i];
				const v = member([struct[5][i], 0], k);
				yield it[i] = [k, v];
			}
			struct[anno.it] = it;
		}
	};
	isMemberSchema = (sc) => Array.isArray(sc) && sc.length === 2;
	isStaticSchema = (sc) => Array.isArray(sc) && sc.length >= 5;
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/schema/TypeRegistry.js
var TypeRegistry;
var init_TypeRegistry = __esmMin((() => {
	TypeRegistry = class TypeRegistry {
		namespace;
		schemas;
		exceptions;
		static registries = /* @__PURE__ */ new Map();
		constructor(namespace, schemas = /* @__PURE__ */ new Map(), exceptions = /* @__PURE__ */ new Map()) {
			this.namespace = namespace;
			this.schemas = schemas;
			this.exceptions = exceptions;
			if (!TypeRegistry.registries.has(namespace)) TypeRegistry.registries.set(namespace, this);
		}
		static for(namespace) {
			return TypeRegistry.registries.get(namespace) ?? new TypeRegistry(namespace);
		}
		copyFrom(other) {
			const { schemas, exceptions } = this;
			for (const [k, v] of other.schemas) if (!schemas.has(k)) schemas.set(k, v);
			for (const [k, v] of other.exceptions) if (!exceptions.has(k)) exceptions.set(k, v);
		}
		register(shapeId, schema) {
			const qualifiedName = this.normalizeShapeId(shapeId);
			for (const r of [this, TypeRegistry.for(qualifiedName.split("#")[0])]) if (!r.schemas.has(qualifiedName)) r.schemas.set(qualifiedName, schema);
		}
		getSchema(shapeId) {
			const id = this.normalizeShapeId(shapeId);
			if (!this.schemas.has(id)) {
				if (!shapeId.includes("#")) {
					const suffix = "#" + shapeId;
					const candidates = [];
					for (const [shapeId, schema] of this.schemas.entries()) if (shapeId.endsWith(suffix)) candidates.push(schema);
					if (candidates.length === 1) return candidates[0];
				}
				throw new Error(`@smithy/core/schema - schema not found for ${id}`);
			}
			return this.schemas.get(id);
		}
		registerError(es, ctor) {
			const $error = es;
			const ns = $error[1];
			const qualifiedName = ns + "#" + $error[2];
			if (!ctor.hasOwnProperty?.("shapeId")) ctor.shapeId = qualifiedName;
			for (const r of [this, TypeRegistry.for(ns)]) if (!r.schemas.has(qualifiedName) && !r.exceptions.has($error)) {
				r.schemas.set(qualifiedName, $error);
				r.exceptions.set($error, ctor);
			}
		}
		getErrorCtor(es) {
			const $error = es;
			if (this.exceptions.has($error)) return this.exceptions.get($error);
			return TypeRegistry.for($error[1]).exceptions.get($error);
		}
		getBaseException() {
			for (const exceptionKey of this.exceptions.keys()) if (Array.isArray(exceptionKey)) {
				const [, ns, name] = exceptionKey;
				const id = ns + "#" + name;
				if (id.startsWith("smithy.ts.sdk.synthetic.") && id.endsWith("ServiceException")) return exceptionKey;
			}
		}
		find(predicate) {
			for (const schema of this.schemas.values()) if (predicate(schema)) return schema;
		}
		clear() {
			this.schemas.clear();
			this.exceptions.clear();
		}
		normalizeShapeId(shapeId) {
			if (shapeId.includes("#")) return shapeId;
			return this.namespace + "#" + shapeId;
		}
	};
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/schema/index.js
var init_schema = __esmMin((() => {
	init_deref();
	init_transport();
	init_NormalizedSchema();
	init_translateTraits();
	init_TypeRegistry();
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/serde/is-array-buffer/is-array-buffer.js
var isArrayBuffer;
var init_is_array_buffer = __esmMin((() => {
	isArrayBuffer = (arg) => typeof ArrayBuffer === "function" && arg instanceof ArrayBuffer || Object.prototype.toString.call(arg) === "[object ArrayBuffer]";
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/serde/util-buffer-from/buffer-from.js
var fromArrayBuffer, fromString;
var init_buffer_from = __esmMin((() => {
	init_is_array_buffer();
	fromArrayBuffer = (input, offset = 0, length = input.byteLength - offset) => {
		if (!isArrayBuffer(input)) throw new TypeError(`The "input" argument must be ArrayBuffer. Received type ${typeof input} (${input})`);
		return Buffer.from(input, offset, length);
	};
	fromString = (input, encoding) => {
		if (typeof input !== "string") throw new TypeError(`The "input" argument must be of type string. Received type ${typeof input} (${input})`);
		return encoding ? Buffer.from(input, encoding) : Buffer.from(input);
	};
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/serde/util-base64/fromBase64.js
var BASE64_REGEX, fromBase64;
var init_fromBase64 = __esmMin((() => {
	init_buffer_from();
	BASE64_REGEX = /^[A-Za-z0-9+/]*={0,2}$/;
	fromBase64 = (input) => {
		if (input.length * 3 % 4 !== 0) throw new TypeError(`Incorrect padding on base64 string.`);
		if (!BASE64_REGEX.exec(input)) throw new TypeError(`Invalid base64 string.`);
		const buffer = fromString(input, "base64");
		return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
	};
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/serde/util-utf8/fromUtf8.js
var fromUtf8$1;
var init_fromUtf8 = __esmMin((() => {
	init_buffer_from();
	fromUtf8$1 = (input) => {
		const buf = fromString(input, "utf8");
		return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength / Uint8Array.BYTES_PER_ELEMENT);
	};
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/serde/util-base64/toBase64.js
var toBase64$1;
var init_toBase64 = __esmMin((() => {
	init_buffer_from();
	init_fromUtf8();
	toBase64$1 = (_input) => {
		let input;
		if (typeof _input === "string") input = fromUtf8$1(_input);
		else input = _input;
		if (typeof input !== "object" || typeof input.byteOffset !== "number" || typeof input.byteLength !== "number") throw new Error("@smithy/util-base64: toBase64 encoder function only accepts string | Uint8Array.");
		return fromArrayBuffer(input.buffer, input.byteOffset, input.byteLength).toString("base64");
	};
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/serde/util-stream/blob/Uint8ArrayBlobAdapter.js
function bindUint8ArrayBlobAdapter(toUtf8, fromUtf8, toBase64, fromBase64) {
	return class Uint8ArrayBlobAdapter extends Uint8Array {
		static fromString(source, encoding = "utf-8") {
			if (typeof source === "string") {
				if (encoding === "base64") return Uint8ArrayBlobAdapter.mutate(fromBase64(source));
				return Uint8ArrayBlobAdapter.mutate(fromUtf8(source));
			}
			throw new Error(`Unsupported conversion from ${typeof source} to Uint8ArrayBlobAdapter.`);
		}
		static mutate(source) {
			Object.setPrototypeOf(source, Uint8ArrayBlobAdapter.prototype);
			return source;
		}
		transformToString(encoding = "utf-8") {
			if (encoding === "base64") return toBase64(this);
			return toUtf8(this);
		}
	};
}
var init_Uint8ArrayBlobAdapter = __esmMin((() => {}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/serde/util-utf8/toUtf8.js
var toUtf8$1;
var init_toUtf8 = __esmMin((() => {
	init_buffer_from();
	toUtf8$1 = (input) => {
		if (typeof input === "string") return input;
		if (typeof input !== "object" || typeof input.byteOffset !== "number" || typeof input.byteLength !== "number") throw new Error("@smithy/util-utf8: toUtf8 encoder function only accepts string | Uint8Array.");
		return fromArrayBuffer(input.buffer, input.byteOffset, input.byteLength).toString("utf8");
	};
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/serde/uuid/v4.js
function bindV4(getRandomValues) {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return () => crypto.randomUUID();
	return () => {
		const rnds = /* @__PURE__ */ new Uint8Array(16);
		getRandomValues(rnds);
		rnds[6] = rnds[6] & 15 | 64;
		rnds[8] = rnds[8] & 63 | 128;
		return decimalToHex[rnds[0]] + decimalToHex[rnds[1]] + decimalToHex[rnds[2]] + decimalToHex[rnds[3]] + "-" + decimalToHex[rnds[4]] + decimalToHex[rnds[5]] + "-" + decimalToHex[rnds[6]] + decimalToHex[rnds[7]] + "-" + decimalToHex[rnds[8]] + decimalToHex[rnds[9]] + "-" + decimalToHex[rnds[10]] + decimalToHex[rnds[11]] + decimalToHex[rnds[12]] + decimalToHex[rnds[13]] + decimalToHex[rnds[14]] + decimalToHex[rnds[15]];
	};
}
var decimalToHex;
var init_v4 = __esmMin((() => {
	decimalToHex = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/serde/date-utils.js
function dateToUtcString(date) {
	const year = date.getUTCFullYear();
	const month = date.getUTCMonth();
	const dayOfWeek = date.getUTCDay();
	const dayOfMonthInt = date.getUTCDate();
	const hoursInt = date.getUTCHours();
	const minutesInt = date.getUTCMinutes();
	const secondsInt = date.getUTCSeconds();
	const dayOfMonthString = dayOfMonthInt < 10 ? `0${dayOfMonthInt}` : `${dayOfMonthInt}`;
	const hoursString = hoursInt < 10 ? `0${hoursInt}` : `${hoursInt}`;
	const minutesString = minutesInt < 10 ? `0${minutesInt}` : `${minutesInt}`;
	const secondsString = secondsInt < 10 ? `0${secondsInt}` : `${secondsInt}`;
	return `${DAYS[dayOfWeek]}, ${dayOfMonthString} ${MONTHS[month]} ${year} ${hoursString}:${minutesString}:${secondsString} GMT`;
}
var DAYS, MONTHS;
var init_date_utils = __esmMin((() => {
	DAYS = [
		"Sun",
		"Mon",
		"Tue",
		"Wed",
		"Thu",
		"Fri",
		"Sat"
	];
	MONTHS = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	];
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/serde/lazy-json.js
var LazyJsonString;
var init_lazy_json = __esmMin((() => {
	LazyJsonString = function LazyJsonString(val) {
		return Object.assign(new String(val), {
			deserializeJSON() {
				return JSON.parse(String(val));
			},
			toString() {
				return String(val);
			},
			toJSON() {
				return String(val);
			}
		});
	};
	LazyJsonString.from = (object) => {
		if (object && typeof object === "object" && (object instanceof LazyJsonString || "deserializeJSON" in object)) return object;
		else if (typeof object === "string" || Object.getPrototypeOf(object) === String.prototype) return LazyJsonString(String(object));
		return LazyJsonString(JSON.stringify(object));
	};
	LazyJsonString.fromObject = LazyJsonString.from;
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/serde/quote-header.js
function quoteHeader(part) {
	if (part.includes(",") || part.includes("\"")) part = `"${part.replace(/"/g, "\\\"")}"`;
	return part;
}
var init_quote_header = __esmMin((() => {}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/serde/schema-serde-lib/schema-date-utils.js
function range(v, min, max) {
	const _v = Number(v);
	if (_v < min || _v > max) throw new Error(`Value ${_v} out of range [${min}, ${max}]`);
}
var ddd, mmm, time, date, year, RFC3339_WITH_OFFSET, IMF_FIXDATE, RFC_850_DATE, ASC_TIME, months, _parseEpochTimestamp, _parseRfc3339DateTimeWithOffset, _parseRfc7231DateTime;
var init_schema_date_utils = __esmMin((() => {
	ddd = `(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)(?:[ne|u?r]?s?day)?`;
	mmm = `(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)`;
	time = `(\\d?\\d):(\\d{2}):(\\d{2})(?:\\.(\\d+))?`;
	date = `(\\d?\\d)`;
	year = `(\\d{4})`;
	RFC3339_WITH_OFFSET = /* @__PURE__ */ new RegExp(/^(\d{4})-(\d\d)-(\d\d)[tT](\d\d):(\d\d):(\d\d)(\.(\d+))?(([-+]\d\d:\d\d)|[zZ])$/);
	IMF_FIXDATE = new RegExp(`^${ddd}, ${date} ${mmm} ${year} ${time} GMT$`);
	RFC_850_DATE = new RegExp(`^${ddd}, ${date}-${mmm}-(\\d\\d) ${time} GMT$`);
	ASC_TIME = new RegExp(`^${ddd} ${mmm} ( [1-9]|\\d\\d) ${time} ${year}$`);
	months = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	];
	_parseEpochTimestamp = (value) => {
		if (value == null) return;
		let num = NaN;
		if (typeof value === "number") num = value;
		else if (typeof value === "string") {
			if (!/^-?\d*\.?\d+$/.test(value)) throw new TypeError(`parseEpochTimestamp - numeric string invalid.`);
			num = Number.parseFloat(value);
		} else if (typeof value === "object" && value.tag === 1) num = value.value;
		if (isNaN(num) || Math.abs(num) === Infinity) throw new TypeError("Epoch timestamps must be valid finite numbers.");
		return new Date(Math.round(num * 1e3));
	};
	_parseRfc3339DateTimeWithOffset = (value) => {
		if (value == null) return;
		if (typeof value !== "string") throw new TypeError("RFC3339 timestamps must be strings");
		const matches = RFC3339_WITH_OFFSET.exec(value);
		if (!matches) throw new TypeError(`Invalid RFC3339 timestamp format ${value}`);
		const [, yearStr, monthStr, dayStr, hours, minutes, seconds, , ms, offsetStr] = matches;
		range(monthStr, 1, 12);
		range(dayStr, 1, 31);
		range(hours, 0, 23);
		range(minutes, 0, 59);
		range(seconds, 0, 60);
		const date = new Date(Date.UTC(Number(yearStr), Number(monthStr) - 1, Number(dayStr), Number(hours), Number(minutes), Number(seconds), Number(ms) ? Math.round(parseFloat(`0.${ms}`) * 1e3) : 0));
		date.setUTCFullYear(Number(yearStr));
		if (offsetStr.toUpperCase() != "Z") {
			const [, sign, offsetH, offsetM] = /([+-])(\d\d):(\d\d)/.exec(offsetStr) || [
				void 0,
				"+",
				0,
				0
			];
			const scalar = sign === "-" ? 1 : -1;
			date.setTime(date.getTime() + scalar * (Number(offsetH) * 60 * 60 * 1e3 + Number(offsetM) * 60 * 1e3));
		}
		return date;
	};
	_parseRfc7231DateTime = (value) => {
		if (value == null) return;
		if (typeof value !== "string") throw new TypeError("RFC7231 timestamps must be strings.");
		let day;
		let month;
		let year;
		let hour;
		let minute;
		let second;
		let fraction;
		let matches;
		if (matches = IMF_FIXDATE.exec(value)) [, day, month, year, hour, minute, second, fraction] = matches;
		else if (matches = RFC_850_DATE.exec(value)) {
			[, day, month, year, hour, minute, second, fraction] = matches;
			year = (Number(year) + 1900).toString();
		} else if (matches = ASC_TIME.exec(value)) [, month, day, hour, minute, second, fraction, year] = matches;
		if (year && second) {
			const timestamp = Date.UTC(Number(year), months.indexOf(month), Number(day), Number(hour), Number(minute), Number(second), fraction ? Math.round(parseFloat(`0.${fraction}`) * 1e3) : 0);
			range(day, 1, 31);
			range(hour, 0, 23);
			range(minute, 0, 59);
			range(second, 0, 60);
			const date = new Date(timestamp);
			date.setUTCFullYear(Number(year));
			return date;
		}
		throw new TypeError(`Invalid RFC7231 date-time value ${value}.`);
	};
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/serde/split-every.js
function splitEvery(value, delimiter, numDelimiters) {
	if (numDelimiters <= 0 || !Number.isInteger(numDelimiters)) throw new Error("Invalid number of delimiters (" + numDelimiters + ") for splitEvery.");
	const segments = value.split(delimiter);
	if (numDelimiters === 1) return segments;
	const compoundSegments = [];
	let currentSegment = "";
	for (let i = 0; i < segments.length; i++) {
		if (currentSegment === "") currentSegment = segments[i];
		else currentSegment += delimiter + segments[i];
		if ((i + 1) % numDelimiters === 0) {
			compoundSegments.push(currentSegment);
			currentSegment = "";
		}
	}
	if (currentSegment !== "") compoundSegments.push(currentSegment);
	return compoundSegments;
}
var init_split_every = __esmMin((() => {}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/serde/split-header.js
var splitHeader;
var init_split_header = __esmMin((() => {
	splitHeader = (value) => {
		const z = value.length;
		const values = [];
		let withinQuotes = false;
		let prevChar = void 0;
		let anchor = 0;
		for (let i = 0; i < z; ++i) {
			const char = value[i];
			switch (char) {
				case `"`:
					if (prevChar !== "\\") withinQuotes = !withinQuotes;
					break;
				case ",": if (!withinQuotes) {
					values.push(value.slice(anchor, i));
					anchor = i + 1;
				}
			}
			prevChar = char;
		}
		values.push(value.slice(anchor));
		return values.map((v) => {
			v = v.trim();
			const z = v.length;
			if (z < 2) return v;
			if (v[0] === `"` && v[z - 1] === `"`) v = v.slice(1, z - 1);
			return v.replace(/\\"/g, "\"");
		});
	};
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/serde/value/NumericValue.js
var format, NumericValue;
var init_NumericValue = __esmMin((() => {
	format = /^-?((0|[1-9]\d*)(\.\d+)?|\.\d+)([eE][+-]?\d+)?$/;
	NumericValue = class NumericValue {
		string;
		type;
		constructor(string, type) {
			this.string = string;
			this.type = type;
			if (!format.test(string)) throw new Error(`@smithy/core/serde - NumericValue string must conform to the Smithy bigDecimal format. Received: "${string}"`);
		}
		toString() {
			return this.string;
		}
		static [Symbol.hasInstance](object) {
			if (!object || typeof object !== "object") return false;
			const _nv = object;
			return NumericValue.prototype.isPrototypeOf(object) || _nv.type === "bigDecimal" && format.test(_nv.string);
		}
	};
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/serde/util-hex-encoding/hex-encoding.js
function fromHex(encoded) {
	if (encoded.length % 2 !== 0) throw new Error("Hex encoded strings must have an even number length");
	const out = new Uint8Array(encoded.length / 2);
	for (let i = 0; i < encoded.length; i += 2) {
		const encodedByte = encoded.slice(i, i + 2).toLowerCase();
		if (encodedByte in HEX_TO_SHORT) out[i / 2] = HEX_TO_SHORT[encodedByte];
		else throw new Error(`Cannot decode unrecognized sequence ${encodedByte} as hexadecimal`);
	}
	return out;
}
function toHex(bytes) {
	let out = "";
	for (let i = 0; i < bytes.byteLength; i++) out += SHORT_TO_HEX[bytes[i]];
	return out;
}
var SHORT_TO_HEX, HEX_TO_SHORT;
var init_hex_encoding = __esmMin((() => {
	SHORT_TO_HEX = {};
	HEX_TO_SHORT = {};
	for (let i = 0; i < 256; i++) {
		let encodedByte = i.toString(16).toLowerCase();
		if (encodedByte.length === 1) encodedByte = `0${encodedByte}`;
		SHORT_TO_HEX[i] = encodedByte;
		HEX_TO_SHORT[encodedByte] = i;
	}
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/serde/concatBytes.js
function concatBytes(arrays, length) {
	if (length === void 0) {
		length = 0;
		for (const bytes of arrays) length += bytes.byteLength;
	}
	const result = new Uint8Array(length);
	let offset = 0;
	for (const buf of arrays) {
		result.set(buf, offset);
		offset += buf.byteLength;
	}
	return result;
}
var init_concatBytes = __esmMin((() => {}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/serde/util-stream/stream-type-check.js
var isReadableStream, isBlob;
var init_stream_type_check = __esmMin((() => {
	isReadableStream = (stream) => typeof ReadableStream === "function" && (stream?.constructor?.name === ReadableStream.name || stream instanceof ReadableStream);
	isBlob = (blob) => {
		return typeof Blob === "function" && (blob?.constructor?.name === Blob.name || blob instanceof Blob);
	};
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/serde/util-utf8/fromUtf8.browser.js
var fromUtf8;
var init_fromUtf8_browser = __esmMin((() => {
	fromUtf8 = (input) => new TextEncoder().encode(input);
})), chars, alphabetByValue;
var init_constants_for_browser = __esmMin((() => {
	chars = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/`;
	Object.entries(chars).reduce((acc, [i, c]) => {
		acc[c] = Number(i);
		return acc;
	}, {});
	alphabetByValue = chars.split("");
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/serde/util-base64/toBase64.browser.js
function toBase64(_input) {
	let input;
	if (typeof _input === "string") input = fromUtf8(_input);
	else input = _input;
	const isArrayLike = typeof input === "object" && typeof input.length === "number";
	const isUint8Array = typeof input === "object" && typeof input.byteOffset === "number" && typeof input.byteLength === "number";
	if (!isArrayLike && !isUint8Array) throw new Error("@smithy/util-base64: toBase64 encoder function only accepts string | Uint8Array.");
	let str = "";
	for (let i = 0; i < input.length; i += 3) {
		let bits = 0;
		let bitLength = 0;
		for (let j = i, limit = Math.min(i + 3, input.length); j < limit; j++) {
			bits |= input[j] << (limit - j - 1) * 8;
			bitLength += 8;
		}
		const bitClusterCount = Math.ceil(bitLength / 6);
		bits <<= bitClusterCount * 6 - bitLength;
		for (let k = 1; k <= bitClusterCount; k++) {
			const offset = (bitClusterCount - k) * 6;
			str += alphabetByValue[(bits & 63 << offset) >> offset];
		}
		str += "==".slice(0, 4 - bitClusterCount);
	}
	return str;
}
var init_toBase64_browser = __esmMin((() => {
	init_fromUtf8_browser();
	init_constants_for_browser();
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/serde/util-utf8/toUtf8.browser.js
var toUtf8;
var init_toUtf8_browser = __esmMin((() => {
	toUtf8 = (input) => {
		if (typeof input === "string") return input;
		if (typeof input !== "object" || typeof input.byteOffset !== "number" || typeof input.byteLength !== "number") throw new Error("@smithy/util-utf8: toUtf8 encoder function only accepts string | Uint8Array.");
		return new TextDecoder("utf-8").decode(input);
	};
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/serde/util-stream/stream-collector.browser.js
async function collectBlob(blob) {
	return blob.arrayBuffer().then((ab) => new Uint8Array(ab));
}
async function collectReadableStream(stream) {
	const chunks = [];
	const reader = stream.getReader();
	let length = 0;
	while (true) {
		const { done, value } = await reader.read();
		if (value) {
			chunks.push(value);
			length += value.length;
		}
		if (done) break;
	}
	return concatBytes(chunks, length);
}
var streamCollector$1;
var init_stream_collector_browser = __esmMin((() => {
	init_concatBytes();
	init_stream_type_check();
	streamCollector$1 = async (stream) => {
		if (isBlob(stream)) return collectBlob(stream);
		return collectReadableStream(stream);
	};
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/serde/util-stream/sdk-stream-mixin.browser.js
var ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED$1, sdkStreamMixin$1, isBlobInstance;
var init_sdk_stream_mixin_browser = __esmMin((() => {
	init_toBase64_browser();
	init_hex_encoding();
	init_toUtf8_browser();
	init_stream_collector_browser();
	init_stream_type_check();
	ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED$1 = "The stream has already been transformed.";
	sdkStreamMixin$1 = (stream) => {
		if (!isBlobInstance(stream) && !isReadableStream(stream)) {
			const name = stream?.__proto__?.constructor?.name || stream;
			throw new Error(`Unexpected stream implementation, expect Blob or ReadableStream, got ${name}`);
		}
		let transformed = false;
		const transformToByteArray = async () => {
			if (transformed) throw new Error(ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED$1);
			transformed = true;
			return await streamCollector$1(stream);
		};
		const blobToWebStream = (blob) => {
			if (typeof blob.stream !== "function") throw new Error("Cannot transform payload Blob to web stream. Please make sure the Blob.stream() is polyfilled.\nIf you are using React Native, this API is not yet supported, see: https://react-native.canny.io/feature-requests/p/fetch-streaming-body");
			return blob.stream();
		};
		return Object.assign(stream, {
			transformToByteArray,
			transformToString: async (encoding) => {
				const buf = await transformToByteArray();
				if (encoding === "base64") return toBase64(buf);
				else if (encoding === "hex") return toHex(buf);
				else if (encoding === void 0 || encoding === "utf8" || encoding === "utf-8") return toUtf8(buf);
				else if (typeof TextDecoder === "function") return new TextDecoder(encoding).decode(buf);
				else throw new Error("TextDecoder is not available, please make sure polyfill is provided.");
			},
			transformToWebStream: () => {
				if (transformed) throw new Error(ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED$1);
				transformed = true;
				if (isBlobInstance(stream)) return blobToWebStream(stream);
				else if (isReadableStream(stream)) return stream;
				else throw new Error(`Cannot transform payload to web stream, got ${stream}`);
			}
		});
	};
	isBlobInstance = (stream) => typeof Blob === "function" && stream instanceof Blob;
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/serde/util-stream/stream-collector.js
var streamCollector, Collector;
var init_stream_collector = __esmMin((() => {
	init_concatBytes();
	init_stream_collector_browser();
	init_stream_type_check();
	streamCollector = (stream) => {
		if (isBlob(stream)) return collectBlob(stream);
		if (isReadableStream(stream)) return collectReadableStream(stream);
		return new Promise((resolve, reject) => {
			const collector = new Collector();
			const nodeStream = stream;
			nodeStream.pipe(collector);
			nodeStream.on("error", (err) => {
				collector.end();
				reject(err);
			});
			collector.on("error", reject);
			collector.on("finish", function() {
				resolve(concatBytes(this.bufferedBytes));
			});
		});
	};
	Collector = class extends Writable {
		bufferedBytes = [];
		_write(chunk, encoding, callback) {
			this.bufferedBytes.push(chunk);
			callback();
		}
	};
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/serde/util-stream/sdk-stream-mixin.js
var ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED, sdkStreamMixin;
var init_sdk_stream_mixin = __esmMin((() => {
	init_buffer_from();
	init_sdk_stream_mixin_browser();
	init_stream_collector();
	ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED = "The stream has already been transformed.";
	sdkStreamMixin = (stream) => {
		if (!(stream instanceof Readable)) try {
			return sdkStreamMixin$1(stream);
		} catch (ignored) {
			const name = stream?.__proto__?.constructor?.name || stream;
			throw new Error(`Unexpected stream implementation, expect Stream.Readable instance, got ${name}`);
		}
		let transformed = false;
		const transformToByteArray = async () => {
			if (transformed) throw new Error(ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED);
			transformed = true;
			return await streamCollector(stream);
		};
		return Object.assign(stream, {
			transformToByteArray,
			transformToString: async (encoding) => {
				const buf = await transformToByteArray();
				if (encoding === void 0 || Buffer.isEncoding(encoding)) return fromArrayBuffer(buf.buffer, buf.byteOffset, buf.byteLength).toString(encoding);
				else return new TextDecoder(encoding).decode(buf);
			},
			transformToWebStream: () => {
				if (transformed) throw new Error(ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED);
				if (stream.readableFlowing !== null) throw new Error("The stream has been consumed by other callbacks.");
				if (typeof Readable.toWeb !== "function") throw new Error("Readable.toWeb() is not supported. Please ensure a polyfill is available.");
				transformed = true;
				return Readable.toWeb(stream);
			}
		});
	};
}));
// ../../../node_modules/.bun/@smithy+core@3.35.2/node_modules/@smithy/core/dist-es/submodules/serde/index.js
var Uint8ArrayBlobAdapter, _getRandomValues, v4, generateIdempotencyToken;
var init_serde = __esmMin((() => {
	init_fromBase64();
	init_toBase64();
	init_Uint8ArrayBlobAdapter();
	init_fromUtf8();
	init_toUtf8();
	init_v4();
	init_date_utils();
	init_lazy_json();
	init_transport();
	init_quote_header();
	init_schema_date_utils();
	init_split_every();
	init_split_header();
	init_NumericValue();
	init_hex_encoding();
	init_buffer_from();
	init_is_array_buffer();
	init_schema();
	init_stream_type_check();
	init_toBase64_browser();
	init_sdk_stream_mixin();
	init_stream_collector();
	Uint8ArrayBlobAdapter = class extends bindUint8ArrayBlobAdapter(toUtf8$1, fromUtf8$1, toBase64$1, fromBase64) {};
	_getRandomValues = getRandomValues;
	v4 = bindV4(_getRandomValues);
	generateIdempotencyToken = v4;
}));
export { HttpRequest as $, init_fromUtf8 as A, init_transport as B, dateToUtcString as C, init_toBase64 as D, toUtf8$1 as E, init_TypeRegistry as F, init_normalizeProvider as G, parseUrl as H, NormalizedSchema as I, isValidHostname as J, normalizeProvider as K, init_NormalizedSchema as L, init_fromBase64 as M, init_schema as N, toBase64$1 as O, TypeRegistry as P, init_httpResponse as Q, init_translateTraits as R, init_lazy_json as S, init_toUtf8 as T, init_parseQueryString as U, init_parseUrl as V, parseQueryString as W, isValidHostLabel as X, init_isValidHostLabel as Y, HttpResponse as Z, _parseRfc7231DateTime as _, sdkStreamMixin as a, quoteHeader as b, toHex as c, init_split_header as d, init_httpRequest as et, splitHeader as f, _parseRfc3339DateTimeWithOffset as g, _parseEpochTimestamp as h, init_sdk_stream_mixin as i, fromBase64 as j, fromUtf8$1 as k, NumericValue as l, splitEvery as m, generateIdempotencyToken as n, init_hasOwn as nt, fromHex as o, init_split_every as p, init_isValidHostname as q, init_serde as r, init_hex_encoding as s, Uint8ArrayBlobAdapter as t, hasOwn as tt, init_NumericValue as u, init_schema_date_utils as v, init_date_utils as w, LazyJsonString as x, init_quote_header as y, translateTraits as z };
