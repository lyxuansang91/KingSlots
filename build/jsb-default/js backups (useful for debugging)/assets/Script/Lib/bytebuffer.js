function Long(t, e, r) {
this.low = 0 | t;
this.high = 0 | e;
this.unsigned = !!r;
}

Long.prototype.__isLong__;

Object.defineProperty(Long.prototype, "__isLong__", {
value: !0,
enumerable: !1,
configurable: !1
});

function isLong(t) {
return !0 === (t && t.__isLong__);
}

Long.isLong = isLong;

var INT_CACHE = {}, UINT_CACHE = {};

function fromInt(t, e) {
var r, i, f;
if (e) {
if ((f = 0 <= (t >>>= 0) && t < 256) && (i = UINT_CACHE[t])) return i;
r = fromBits(t, (0 | t) < 0 ? -1 : 0, !0);
f && (UINT_CACHE[t] = r);
return r;
}
if ((f = -128 <= (t |= 0) && t < 128) && (i = INT_CACHE[t])) return i;
r = fromBits(t, t < 0 ? -1 : 0, !1);
f && (INT_CACHE[t] = r);
return r;
}

Long.fromInt = fromInt;

function fromNumber(t, e) {
if (isNaN(t) || !isFinite(t)) return e ? UZERO : ZERO;
if (e) {
if (t < 0) return UZERO;
if (TWO_PWR_64_DBL <= t) return MAX_UNSIGNED_VALUE;
} else {
if (t <= -TWO_PWR_63_DBL) return MIN_VALUE;
if (TWO_PWR_63_DBL <= t + 1) return MAX_VALUE;
}
return t < 0 ? fromNumber(-t, e).neg() : fromBits(t % TWO_PWR_32_DBL | 0, t / TWO_PWR_32_DBL | 0, e);
}

Long.fromNumber = fromNumber;

function fromBits(t, e, r) {
return new Long(t, e, r);
}

Long.fromBits = fromBits;

var pow_dbl = Math.pow;

function fromString(t, e, r) {
if (0 === t.length) throw Error("empty string");
if ("NaN" === t || "Infinity" === t || "+Infinity" === t || "-Infinity" === t) return ZERO;
"number" == typeof e ? (r = e, e = !1) : e = !!e;
if ((r = r || 10) < 2 || 36 < r) throw RangeError("radix");
var i;
if (0 < (i = t.indexOf("-"))) throw Error("interior hyphen");
if (0 === i) return fromString(t.substring(1), e, r).neg();
for (var f = fromNumber(pow_dbl(r, 8)), n = ZERO, o = 0; o < t.length; o += 8) {
var s = Math.min(8, t.length - o), h = parseInt(t.substring(o, o + s), r);
if (s < 8) {
var u = fromNumber(pow_dbl(r, s));
n = n.mul(u).add(fromNumber(h));
} else n = (n = n.mul(f)).add(fromNumber(h));
}
n.unsigned = e;
return n;
}

Long.fromString = fromString;

function fromValue(t) {
return t instanceof Long ? t : "number" == typeof t ? fromNumber(t) : "string" == typeof t ? fromString(t) : fromBits(t.low, t.high, t.unsigned);
}

Long.fromValue = fromValue;

var TWO_PWR_16_DBL = 65536, TWO_PWR_24_DBL = 1 << 24, TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL, TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL, TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2, TWO_PWR_24 = fromInt(TWO_PWR_24_DBL), ZERO = fromInt(0);

Long.ZERO = ZERO;

var UZERO = fromInt(0, !0);

Long.UZERO = UZERO;

var ONE = fromInt(1);

Long.ONE = ONE;

var UONE = fromInt(1, !0);

Long.UONE = UONE;

var NEG_ONE = fromInt(-1);

Long.NEG_ONE = NEG_ONE;

var MAX_VALUE = fromBits(-1, 2147483647, !1);

Long.MAX_VALUE = MAX_VALUE;

var MAX_UNSIGNED_VALUE = fromBits(-1, -1, !0);

Long.MAX_UNSIGNED_VALUE = MAX_UNSIGNED_VALUE;

var MIN_VALUE = fromBits(0, -2147483648, !1);

Long.MIN_VALUE = MIN_VALUE;

var LongPrototype = Long.prototype;

LongPrototype.toInt = function() {
return this.unsigned ? this.low >>> 0 : this.low;
};

LongPrototype.toNumber = function() {
return this.unsigned ? (this.high >>> 0) * TWO_PWR_32_DBL + (this.low >>> 0) : this.high * TWO_PWR_32_DBL + (this.low >>> 0);
};

LongPrototype.toString = function(t) {
if ((t = t || 10) < 2 || 36 < t) throw RangeError("radix");
if (this.isZero()) return "0";
if (this.isNegative()) {
if (this.eq(MIN_VALUE)) {
var e = fromNumber(t), r = this.div(e), i = r.mul(e).sub(this);
return r.toString(t) + i.toInt().toString(t);
}
return "-" + this.neg().toString(t);
}
for (var f = fromNumber(pow_dbl(t, 6), this.unsigned), n = this, o = ""; ;) {
var s = n.div(f), h = (n.sub(s.mul(f)).toInt() >>> 0).toString(t);
if ((n = s).isZero()) return h + o;
for (;h.length < 6; ) h = "0" + h;
o = "" + h + o;
}
};

LongPrototype.getHighBits = function() {
return this.high;
};

LongPrototype.getHighBitsUnsigned = function() {
return this.high >>> 0;
};

LongPrototype.getLowBits = function() {
return this.low;
};

LongPrototype.getLowBitsUnsigned = function() {
return this.low >>> 0;
};

LongPrototype.getNumBitsAbs = function() {
if (this.isNegative()) return this.eq(MIN_VALUE) ? 64 : this.neg().getNumBitsAbs();
for (var t = 0 != this.high ? this.high : this.low, e = 31; 0 < e && 0 == (t & 1 << e); e--) ;
return 0 != this.high ? e + 33 : e + 1;
};

LongPrototype.isZero = function() {
return 0 === this.high && 0 === this.low;
};

LongPrototype.isNegative = function() {
return !this.unsigned && this.high < 0;
};

LongPrototype.isPositive = function() {
return this.unsigned || 0 <= this.high;
};

LongPrototype.isOdd = function() {
return 1 == (1 & this.low);
};

LongPrototype.isEven = function() {
return 0 == (1 & this.low);
};

LongPrototype.equals = function(t) {
isLong(t) || (t = fromValue(t));
return (this.unsigned === t.unsigned || this.high >>> 31 != 1 || t.high >>> 31 != 1) && (this.high === t.high && this.low === t.low);
};

LongPrototype.eq = LongPrototype.equals;

LongPrototype.notEquals = function(t) {
return !this.eq(t);
};

LongPrototype.neq = LongPrototype.notEquals;

LongPrototype.lessThan = function(t) {
return this.comp(t) < 0;
};

LongPrototype.lt = LongPrototype.lessThan;

LongPrototype.lessThanOrEqual = function(t) {
return this.comp(t) <= 0;
};

LongPrototype.lte = LongPrototype.lessThanOrEqual;

LongPrototype.greaterThan = function(t) {
return 0 < this.comp(t);
};

LongPrototype.gt = LongPrototype.greaterThan;

LongPrototype.greaterThanOrEqual = function(t) {
return 0 <= this.comp(t);
};

LongPrototype.gte = LongPrototype.greaterThanOrEqual;

LongPrototype.compare = function(t) {
isLong(t) || (t = fromValue(t));
if (this.eq(t)) return 0;
var e = this.isNegative(), r = t.isNegative();
return e && !r ? -1 : !e && r ? 1 : this.unsigned ? t.high >>> 0 > this.high >>> 0 || t.high === this.high && t.low >>> 0 > this.low >>> 0 ? -1 : 1 : this.sub(t).isNegative() ? -1 : 1;
};

LongPrototype.comp = LongPrototype.compare;

LongPrototype.negate = function() {
return !this.unsigned && this.eq(MIN_VALUE) ? MIN_VALUE : this.not().add(ONE);
};

LongPrototype.neg = LongPrototype.negate;

LongPrototype.add = function(t) {
isLong(t) || (t = fromValue(t));
var e = this.high >>> 16, r = 65535 & this.high, i = this.low >>> 16, f = 65535 & this.low, n = t.high >>> 16, o = 65535 & t.high, s = t.low >>> 16, h = 0, u = 0, a = 0, g = 0;
a += (g += f + (65535 & t.low)) >>> 16;
u += (a += i + s) >>> 16;
h += (u += r + o) >>> 16;
h += e + n;
return fromBits((a &= 65535) << 16 | (g &= 65535), (h &= 65535) << 16 | (u &= 65535), this.unsigned);
};

LongPrototype.subtract = function(t) {
isLong(t) || (t = fromValue(t));
return this.add(t.neg());
};

LongPrototype.sub = LongPrototype.subtract;

LongPrototype.multiply = function(t) {
if (this.isZero()) return ZERO;
isLong(t) || (t = fromValue(t));
if (t.isZero()) return ZERO;
if (this.eq(MIN_VALUE)) return t.isOdd() ? MIN_VALUE : ZERO;
if (t.eq(MIN_VALUE)) return this.isOdd() ? MIN_VALUE : ZERO;
if (this.isNegative()) return t.isNegative() ? this.neg().mul(t.neg()) : this.neg().mul(t).neg();
if (t.isNegative()) return this.mul(t.neg()).neg();
if (this.lt(TWO_PWR_24) && t.lt(TWO_PWR_24)) return fromNumber(this.toNumber() * t.toNumber(), this.unsigned);
var e = this.high >>> 16, r = 65535 & this.high, i = this.low >>> 16, f = 65535 & this.low, n = t.high >>> 16, o = 65535 & t.high, s = t.low >>> 16, h = 65535 & t.low, u = 0, a = 0, g = 0, l = 0;
g += (l += f * h) >>> 16;
a += (g += i * h) >>> 16;
g &= 65535;
a += (g += f * s) >>> 16;
u += (a += r * h) >>> 16;
a &= 65535;
u += (a += i * s) >>> 16;
a &= 65535;
u += (a += f * o) >>> 16;
u += e * h + r * s + i * o + f * n;
return fromBits((g &= 65535) << 16 | (l &= 65535), (u &= 65535) << 16 | (a &= 65535), this.unsigned);
};

LongPrototype.mul = LongPrototype.multiply;

LongPrototype.divide = function(t) {
isLong(t) || (t = fromValue(t));
if (t.isZero()) throw Error("division by zero");
if (this.isZero()) return this.unsigned ? UZERO : ZERO;
var e, r, i;
if (this.unsigned) {
t.unsigned || (t = t.toUnsigned());
if (t.gt(this)) return UZERO;
if (t.gt(this.shru(1))) return UONE;
i = UZERO;
} else {
if (this.eq(MIN_VALUE)) {
if (t.eq(ONE) || t.eq(NEG_ONE)) return MIN_VALUE;
if (t.eq(MIN_VALUE)) return ONE;
if ((e = this.shr(1).div(t).shl(1)).eq(ZERO)) return t.isNegative() ? ONE : NEG_ONE;
r = this.sub(t.mul(e));
return i = e.add(r.div(t));
}
if (t.eq(MIN_VALUE)) return this.unsigned ? UZERO : ZERO;
if (this.isNegative()) return t.isNegative() ? this.neg().div(t.neg()) : this.neg().div(t).neg();
if (t.isNegative()) return this.div(t.neg()).neg();
i = ZERO;
}
r = this;
for (;r.gte(t); ) {
e = Math.max(1, Math.floor(r.toNumber() / t.toNumber()));
for (var f = Math.ceil(Math.log(e) / Math.LN2), n = f <= 48 ? 1 : pow_dbl(2, f - 48), o = fromNumber(e), s = o.mul(t); s.isNegative() || s.gt(r); ) s = (o = fromNumber(e -= n, this.unsigned)).mul(t);
o.isZero() && (o = ONE);
i = i.add(o);
r = r.sub(s);
}
return i;
};

LongPrototype.div = LongPrototype.divide;

LongPrototype.modulo = function(t) {
isLong(t) || (t = fromValue(t));
return this.sub(this.div(t).mul(t));
};

LongPrototype.mod = LongPrototype.modulo;

LongPrototype.not = function() {
return fromBits(~this.low, ~this.high, this.unsigned);
};

LongPrototype.and = function(t) {
isLong(t) || (t = fromValue(t));
return fromBits(this.low & t.low, this.high & t.high, this.unsigned);
};

LongPrototype.or = function(t) {
isLong(t) || (t = fromValue(t));
return fromBits(this.low | t.low, this.high | t.high, this.unsigned);
};

LongPrototype.xor = function(t) {
isLong(t) || (t = fromValue(t));
return fromBits(this.low ^ t.low, this.high ^ t.high, this.unsigned);
};

LongPrototype.shiftLeft = function(t) {
isLong(t) && (t = t.toInt());
return 0 == (t &= 63) ? this : t < 32 ? fromBits(this.low << t, this.high << t | this.low >>> 32 - t, this.unsigned) : fromBits(0, this.low << t - 32, this.unsigned);
};

LongPrototype.shl = LongPrototype.shiftLeft;

LongPrototype.shiftRight = function(t) {
isLong(t) && (t = t.toInt());
return 0 == (t &= 63) ? this : t < 32 ? fromBits(this.low >>> t | this.high << 32 - t, this.high >> t, this.unsigned) : fromBits(this.high >> t - 32, 0 <= this.high ? 0 : -1, this.unsigned);
};

LongPrototype.shr = LongPrototype.shiftRight;

LongPrototype.shiftRightUnsigned = function(t) {
isLong(t) && (t = t.toInt());
if (0 === (t &= 63)) return this;
var e = this.high;
if (t < 32) {
return fromBits(this.low >>> t | e << 32 - t, e >>> t, this.unsigned);
}
return fromBits(32 === t ? e : e >>> t - 32, 0, this.unsigned);
};

LongPrototype.shru = LongPrototype.shiftRightUnsigned;

LongPrototype.toSigned = function() {
return this.unsigned ? fromBits(this.low, this.high, !1) : this;
};

LongPrototype.toUnsigned = function() {
return this.unsigned ? this : fromBits(this.low, this.high, !0);
};

LongPrototype.toBytes = function(t) {
return t ? this.toBytesLE() : this.toBytesBE();
};

LongPrototype.toBytesLE = function() {
var t = this.high, e = this.low;
return [ 255 & e, e >>> 8 & 255, e >>> 16 & 255, e >>> 24 & 255, 255 & t, t >>> 8 & 255, t >>> 16 & 255, t >>> 24 & 255 ];
};

LongPrototype.toBytesBE = function() {
var t = this.high, e = this.low;
return [ t >>> 24 & 255, t >>> 16 & 255, t >>> 8 & 255, 255 & t, e >>> 24 & 255, e >>> 16 & 255, e >>> 8 & 255, 255 & e ];
};

var ByteBuffer = function(t, e, r) {
"undefined" == typeof t && (t = ByteBuffer.DEFAULT_CAPACITY);
"undefined" == typeof e && (e = ByteBuffer.DEFAULT_ENDIAN);
"undefined" == typeof r && (r = ByteBuffer.DEFAULT_NOASSERT);
if (!r) {
if ((t |= 0) < 0) throw RangeError("Illegal capacity");
e = !!e;
r = !!r;
}
this.buffer = 0 === t ? EMPTY_BUFFER : new ArrayBuffer(t);
this.view = 0 === t ? null : new Uint8Array(this.buffer);
this.offset = 0;
this.markedOffset = -1;
this.limit = t;
this.littleEndian = e;
this.noAssert = r;
};

ByteBuffer.VERSION = "5.0.1";

ByteBuffer.LITTLE_ENDIAN = !0;

ByteBuffer.BIG_ENDIAN = !1;

ByteBuffer.DEFAULT_CAPACITY = 16;

ByteBuffer.DEFAULT_ENDIAN = ByteBuffer.BIG_ENDIAN;

ByteBuffer.DEFAULT_NOASSERT = !1;

ByteBuffer.Long = Long || null;

var ByteBufferPrototype = ByteBuffer.prototype;

ByteBufferPrototype.__isByteBuffer__;

Object.defineProperty(ByteBufferPrototype, "__isByteBuffer__", {
value: !0,
enumerable: !1,
configurable: !1
});

var EMPTY_BUFFER = new ArrayBuffer(0), stringFromCharCode = String.fromCharCode;

function stringSource(t) {
var e = 0;
return function() {
return e < t.length ? t.charCodeAt(e++) : null;
};
}

function stringDestination() {
var t = [], e = [];
return function() {
if (0 === arguments.length) return e.join("") + stringFromCharCode.apply(String, t);
1024 < t.length + arguments.length && (e.push(stringFromCharCode.apply(String, t)), 
t.length = 0);
Array.prototype.push.apply(t, arguments);
};
}

ByteBuffer.accessor = function() {
return Uint8Array;
};

ByteBuffer.allocate = function(t, e, r) {
return new ByteBuffer(t, e, r);
};

ByteBuffer.concat = function(t, e, r, i) {
if ("boolean" == typeof e || "string" != typeof e) {
i = r;
r = e;
e = void 0;
}
for (var f, n = 0, o = 0, s = t.length; o < s; ++o) {
ByteBuffer.isByteBuffer(t[o]) || (t[o] = ByteBuffer.wrap(t[o], e));
0 < (f = t[o].limit - t[o].offset) && (n += f);
}
if (0 === n) return new ByteBuffer(0, r, i);
var h, u = new ByteBuffer(n, r, i);
o = 0;
for (;o < s; ) if (!((f = (h = t[o++]).limit - h.offset) <= 0)) {
u.view.set(h.view.subarray(h.offset, h.limit), u.offset);
u.offset += f;
}
u.limit = u.offset;
u.offset = 0;
return u;
};

ByteBuffer.isByteBuffer = function(t) {
return !0 === (t && t.__isByteBuffer__);
};

ByteBuffer.type = function() {
return ArrayBuffer;
};

ByteBuffer.wrap = function(t, e, r, i) {
if ("string" != typeof e) {
i = r;
r = e;
e = void 0;
}
if ("string" == typeof t) {
"undefined" == typeof e && (e = "utf8");
switch (e) {
case "base64":
return ByteBuffer.fromBase64(t, r);

case "hex":
return ByteBuffer.fromHex(t, r);

case "binary":
return ByteBuffer.fromBinary(t, r);

case "utf8":
return ByteBuffer.fromUTF8(t, r);

case "debug":
return ByteBuffer.fromDebug(t, r);

default:
throw Error("Unsupported encoding: " + e);
}
}
if (null === t || "object" != typeof t) throw TypeError("Illegal buffer");
var f;
if (ByteBuffer.isByteBuffer(t)) {
(f = ByteBufferPrototype.clone.call(t)).markedOffset = -1;
return f;
}
if (t instanceof Uint8Array) {
f = new ByteBuffer(0, r, i);
if (0 < t.length) {
f.buffer = t.buffer;
f.offset = t.byteOffset;
f.limit = t.byteOffset + t.byteLength;
f.view = new Uint8Array(t.buffer);
}
} else if (t instanceof ArrayBuffer) {
f = new ByteBuffer(0, r, i);
if (0 < t.byteLength) {
f.buffer = t;
f.offset = 0;
f.limit = t.byteLength;
f.view = 0 < t.byteLength ? new Uint8Array(t) : null;
}
} else {
if ("[object Array]" !== Object.prototype.toString.call(t)) throw TypeError("Illegal buffer");
(f = new ByteBuffer(t.length, r, i)).limit = t.length;
for (var n = 0; n < t.length; ++n) f.view[n] = t[n];
}
return f;
};

ByteBufferPrototype.writeBitSet = function(t, e) {
var r = "undefined" == typeof e;
r && (e = this.offset);
if (!this.noAssert) {
if (!(t instanceof Array)) throw TypeError("Illegal BitSet: Not an array");
if ("number" != typeof e || e % 1 != 0) throw TypeError("Illegal offset: " + e + " (not an integer)");
if ((e >>>= 0) < 0 || e + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + e + " (+0) <= " + this.buffer.byteLength);
}
var i, f = e, n = t.length, o = n >> 3, s = 0;
e += this.writeVarint32(n, e);
for (;o--; ) {
i = 1 & !!t[s++] | (1 & !!t[s++]) << 1 | (1 & !!t[s++]) << 2 | (1 & !!t[s++]) << 3 | (1 & !!t[s++]) << 4 | (1 & !!t[s++]) << 5 | (1 & !!t[s++]) << 6 | (1 & !!t[s++]) << 7;
this.writeByte(i, e++);
}
if (s < n) {
var h = 0;
i = 0;
for (;s < n; ) i |= (1 & !!t[s++]) << h++;
this.writeByte(i, e++);
}
if (r) {
this.offset = e;
return this;
}
return e - f;
};

ByteBufferPrototype.readBitSet = function(t) {
var e = "undefined" == typeof t;
e && (t = this.offset);
var r, i = this.readVarint32(t), f = i.value, n = f >> 3, o = 0, s = [];
t += i.length;
for (;n--; ) {
r = this.readByte(t++);
s[o++] = !!(1 & r);
s[o++] = !!(2 & r);
s[o++] = !!(4 & r);
s[o++] = !!(8 & r);
s[o++] = !!(16 & r);
s[o++] = !!(32 & r);
s[o++] = !!(64 & r);
s[o++] = !!(128 & r);
}
if (o < f) {
var h = 0;
r = this.readByte(t++);
for (;o < f; ) s[o++] = !!(r >> h++ & 1);
}
e && (this.offset = t);
return s;
};

ByteBufferPrototype.readBytes = function(t, e) {
var r = "undefined" == typeof e;
r && (e = this.offset);
if (!this.noAssert) {
if ("number" != typeof e || e % 1 != 0) throw TypeError("Illegal offset: " + e + " (not an integer)");
if ((e >>>= 0) < 0 || e + t > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + e + " (+" + t + ") <= " + this.buffer.byteLength);
}
var i = this.slice(e, e + t);
r && (this.offset += t);
return i;
};

ByteBufferPrototype.writeInt8 = function(t, e) {
var r = "undefined" == typeof e;
r && (e = this.offset);
if (!this.noAssert) {
if ("number" != typeof t || t % 1 != 0) throw TypeError("Illegal value: " + t + " (not an integer)");
t |= 0;
if ("number" != typeof e || e % 1 != 0) throw TypeError("Illegal offset: " + e + " (not an integer)");
if ((e >>>= 0) < 0 || e + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + e + " (+0) <= " + this.buffer.byteLength);
}
e += 1;
var i = this.buffer.byteLength;
i < e && this.resize((i *= 2) > e ? i : e);
e -= 1;
this.view[e] = t;
r && (this.offset += 1);
return this;
};

ByteBufferPrototype.writeByte = ByteBufferPrototype.writeInt8;

ByteBufferPrototype.readInt8 = function(t) {
var e = "undefined" == typeof t;
e && (t = this.offset);
if (!this.noAssert) {
if ("number" != typeof t || t % 1 != 0) throw TypeError("Illegal offset: " + t + " (not an integer)");
if ((t >>>= 0) < 0 || t + 1 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + t + " (+1) <= " + this.buffer.byteLength);
}
var r = this.view[t];
128 == (128 & r) && (r = -(255 - r + 1));
e && (this.offset += 1);
return r;
};

ByteBufferPrototype.readByte = ByteBufferPrototype.readInt8;

ByteBufferPrototype.writeUint8 = function(t, e) {
var r = "undefined" == typeof e;
r && (e = this.offset);
if (!this.noAssert) {
if ("number" != typeof t || t % 1 != 0) throw TypeError("Illegal value: " + t + " (not an integer)");
t >>>= 0;
if ("number" != typeof e || e % 1 != 0) throw TypeError("Illegal offset: " + e + " (not an integer)");
if ((e >>>= 0) < 0 || e + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + e + " (+0) <= " + this.buffer.byteLength);
}
e += 1;
var i = this.buffer.byteLength;
i < e && this.resize((i *= 2) > e ? i : e);
e -= 1;
this.view[e] = t;
r && (this.offset += 1);
return this;
};

ByteBufferPrototype.writeUInt8 = ByteBufferPrototype.writeUint8;

ByteBufferPrototype.readUint8 = function(t) {
var e = "undefined" == typeof t;
e && (t = this.offset);
if (!this.noAssert) {
if ("number" != typeof t || t % 1 != 0) throw TypeError("Illegal offset: " + t + " (not an integer)");
if ((t >>>= 0) < 0 || t + 1 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + t + " (+1) <= " + this.buffer.byteLength);
}
var r = this.view[t];
e && (this.offset += 1);
return r;
};

ByteBufferPrototype.readUInt8 = ByteBufferPrototype.readUint8;

ByteBufferPrototype.writeInt16 = function(t, e) {
var r = "undefined" == typeof e;
r && (e = this.offset);
if (!this.noAssert) {
if ("number" != typeof t || t % 1 != 0) throw TypeError("Illegal value: " + t + " (not an integer)");
t |= 0;
if ("number" != typeof e || e % 1 != 0) throw TypeError("Illegal offset: " + e + " (not an integer)");
if ((e >>>= 0) < 0 || e + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + e + " (+0) <= " + this.buffer.byteLength);
}
e += 2;
var i = this.buffer.byteLength;
i < e && this.resize((i *= 2) > e ? i : e);
e -= 2;
if (this.littleEndian) {
this.view[e + 1] = (65280 & t) >>> 8;
this.view[e] = 255 & t;
} else {
this.view[e] = (65280 & t) >>> 8;
this.view[e + 1] = 255 & t;
}
r && (this.offset += 2);
return this;
};

ByteBufferPrototype.writeShort = ByteBufferPrototype.writeInt16;

ByteBufferPrototype.readInt16 = function(t) {
var e = "undefined" == typeof t;
e && (t = this.offset);
if (!this.noAssert) {
if ("number" != typeof t || t % 1 != 0) throw TypeError("Illegal offset: " + t + " (not an integer)");
if ((t >>>= 0) < 0 || t + 2 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + t + " (+2) <= " + this.buffer.byteLength);
}
var r = 0;
if (this.littleEndian) {
r = this.view[t];
r |= this.view[t + 1] << 8;
} else {
r = this.view[t] << 8;
r |= this.view[t + 1];
}
32768 == (32768 & r) && (r = -(65535 - r + 1));
e && (this.offset += 2);
return r;
};

ByteBufferPrototype.readShort = ByteBufferPrototype.readInt16;

ByteBufferPrototype.writeUint16 = function(t, e) {
var r = "undefined" == typeof e;
r && (e = this.offset);
if (!this.noAssert) {
if ("number" != typeof t || t % 1 != 0) throw TypeError("Illegal value: " + t + " (not an integer)");
t >>>= 0;
if ("number" != typeof e || e % 1 != 0) throw TypeError("Illegal offset: " + e + " (not an integer)");
if ((e >>>= 0) < 0 || e + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + e + " (+0) <= " + this.buffer.byteLength);
}
e += 2;
var i = this.buffer.byteLength;
i < e && this.resize((i *= 2) > e ? i : e);
e -= 2;
if (this.littleEndian) {
this.view[e + 1] = (65280 & t) >>> 8;
this.view[e] = 255 & t;
} else {
this.view[e] = (65280 & t) >>> 8;
this.view[e + 1] = 255 & t;
}
r && (this.offset += 2);
return this;
};

ByteBufferPrototype.writeUInt16 = ByteBufferPrototype.writeUint16;

ByteBufferPrototype.readUint16 = function(t) {
var e = "undefined" == typeof t;
e && (t = this.offset);
if (!this.noAssert) {
if ("number" != typeof t || t % 1 != 0) throw TypeError("Illegal offset: " + t + " (not an integer)");
if ((t >>>= 0) < 0 || t + 2 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + t + " (+2) <= " + this.buffer.byteLength);
}
var r = 0;
if (this.littleEndian) {
r = this.view[t];
r |= this.view[t + 1] << 8;
} else {
r = this.view[t] << 8;
r |= this.view[t + 1];
}
e && (this.offset += 2);
return r;
};

ByteBufferPrototype.readUInt16 = ByteBufferPrototype.readUint16;

ByteBufferPrototype.writeInt32 = function(t, e) {
var r = "undefined" == typeof e;
r && (e = this.offset);
if (!this.noAssert) {
if ("number" != typeof t || t % 1 != 0) throw TypeError("Illegal value: " + t + " (not an integer)");
t |= 0;
if ("number" != typeof e || e % 1 != 0) throw TypeError("Illegal offset: " + e + " (not an integer)");
if ((e >>>= 0) < 0 || e + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + e + " (+0) <= " + this.buffer.byteLength);
}
e += 4;
var i = this.buffer.byteLength;
i < e && this.resize((i *= 2) > e ? i : e);
e -= 4;
if (this.littleEndian) {
this.view[e + 3] = t >>> 24 & 255;
this.view[e + 2] = t >>> 16 & 255;
this.view[e + 1] = t >>> 8 & 255;
this.view[e] = 255 & t;
} else {
this.view[e] = t >>> 24 & 255;
this.view[e + 1] = t >>> 16 & 255;
this.view[e + 2] = t >>> 8 & 255;
this.view[e + 3] = 255 & t;
}
r && (this.offset += 4);
return this;
};

ByteBufferPrototype.writeInt = ByteBufferPrototype.writeInt32;

ByteBufferPrototype.readInt32 = function(t) {
var e = "undefined" == typeof t;
e && (t = this.offset);
if (!this.noAssert) {
if ("number" != typeof t || t % 1 != 0) throw TypeError("Illegal offset: " + t + " (not an integer)");
if ((t >>>= 0) < 0 || t + 4 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + t + " (+4) <= " + this.buffer.byteLength);
}
var r = 0;
if (this.littleEndian) {
r = this.view[t + 2] << 16;
r |= this.view[t + 1] << 8;
r |= this.view[t];
r += this.view[t + 3] << 24 >>> 0;
} else {
r = this.view[t + 1] << 16;
r |= this.view[t + 2] << 8;
r |= this.view[t + 3];
r += this.view[t] << 24 >>> 0;
}
r |= 0;
e && (this.offset += 4);
return r;
};

ByteBufferPrototype.readInt = ByteBufferPrototype.readInt32;

ByteBufferPrototype.writeUint32 = function(t, e) {
var r = "undefined" == typeof e;
r && (e = this.offset);
if (!this.noAssert) {
if ("number" != typeof t || t % 1 != 0) throw TypeError("Illegal value: " + t + " (not an integer)");
t >>>= 0;
if ("number" != typeof e || e % 1 != 0) throw TypeError("Illegal offset: " + e + " (not an integer)");
if ((e >>>= 0) < 0 || e + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + e + " (+0) <= " + this.buffer.byteLength);
}
e += 4;
var i = this.buffer.byteLength;
i < e && this.resize((i *= 2) > e ? i : e);
e -= 4;
if (this.littleEndian) {
this.view[e + 3] = t >>> 24 & 255;
this.view[e + 2] = t >>> 16 & 255;
this.view[e + 1] = t >>> 8 & 255;
this.view[e] = 255 & t;
} else {
this.view[e] = t >>> 24 & 255;
this.view[e + 1] = t >>> 16 & 255;
this.view[e + 2] = t >>> 8 & 255;
this.view[e + 3] = 255 & t;
}
r && (this.offset += 4);
return this;
};

ByteBufferPrototype.writeUInt32 = ByteBufferPrototype.writeUint32;

ByteBufferPrototype.readUint32 = function(t) {
var e = "undefined" == typeof t;
e && (t = this.offset);
if (!this.noAssert) {
if ("number" != typeof t || t % 1 != 0) throw TypeError("Illegal offset: " + t + " (not an integer)");
if ((t >>>= 0) < 0 || t + 4 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + t + " (+4) <= " + this.buffer.byteLength);
}
var r = 0;
if (this.littleEndian) {
r = this.view[t + 2] << 16;
r |= this.view[t + 1] << 8;
r |= this.view[t];
r += this.view[t + 3] << 24 >>> 0;
} else {
r = this.view[t + 1] << 16;
r |= this.view[t + 2] << 8;
r |= this.view[t + 3];
r += this.view[t] << 24 >>> 0;
}
e && (this.offset += 4);
return r;
};

ByteBufferPrototype.readUInt32 = ByteBufferPrototype.readUint32;

if (Long) {
ByteBufferPrototype.writeInt64 = function(t, e) {
var r = "undefined" == typeof e;
r && (e = this.offset);
if (!this.noAssert) {
if ("number" == typeof t) t = Long.fromNumber(t); else if ("string" == typeof t) t = Long.fromString(t); else if (!(t && t instanceof Long)) throw TypeError("Illegal value: " + t + " (not an integer or Long)");
if ("number" != typeof e || e % 1 != 0) throw TypeError("Illegal offset: " + e + " (not an integer)");
if ((e >>>= 0) < 0 || e + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + e + " (+0) <= " + this.buffer.byteLength);
}
"number" == typeof t ? t = Long.fromNumber(t) : "string" == typeof t && (t = Long.fromString(t));
e += 8;
var i = this.buffer.byteLength;
i < e && this.resize((i *= 2) > e ? i : e);
e -= 8;
var f = t.low, n = t.high;
if (this.littleEndian) {
this.view[e + 3] = f >>> 24 & 255;
this.view[e + 2] = f >>> 16 & 255;
this.view[e + 1] = f >>> 8 & 255;
this.view[e] = 255 & f;
e += 4;
this.view[e + 3] = n >>> 24 & 255;
this.view[e + 2] = n >>> 16 & 255;
this.view[e + 1] = n >>> 8 & 255;
this.view[e] = 255 & n;
} else {
this.view[e] = n >>> 24 & 255;
this.view[e + 1] = n >>> 16 & 255;
this.view[e + 2] = n >>> 8 & 255;
this.view[e + 3] = 255 & n;
e += 4;
this.view[e] = f >>> 24 & 255;
this.view[e + 1] = f >>> 16 & 255;
this.view[e + 2] = f >>> 8 & 255;
this.view[e + 3] = 255 & f;
}
r && (this.offset += 8);
return this;
};
ByteBufferPrototype.writeLong = ByteBufferPrototype.writeInt64;
ByteBufferPrototype.readInt64 = function(t) {
var e = "undefined" == typeof t;
e && (t = this.offset);
if (!this.noAssert) {
if ("number" != typeof t || t % 1 != 0) throw TypeError("Illegal offset: " + t + " (not an integer)");
if ((t >>>= 0) < 0 || t + 8 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + t + " (+8) <= " + this.buffer.byteLength);
}
var r = 0, i = 0;
if (this.littleEndian) {
r = this.view[t + 2] << 16;
r |= this.view[t + 1] << 8;
r |= this.view[t];
r += this.view[t + 3] << 24 >>> 0;
t += 4;
i = this.view[t + 2] << 16;
i |= this.view[t + 1] << 8;
i |= this.view[t];
i += this.view[t + 3] << 24 >>> 0;
} else {
i = this.view[t + 1] << 16;
i |= this.view[t + 2] << 8;
i |= this.view[t + 3];
i += this.view[t] << 24 >>> 0;
t += 4;
r = this.view[t + 1] << 16;
r |= this.view[t + 2] << 8;
r |= this.view[t + 3];
r += this.view[t] << 24 >>> 0;
}
var f = new Long(r, i, !1);
e && (this.offset += 8);
return f;
};
ByteBufferPrototype.readLong = ByteBufferPrototype.readInt64;
ByteBufferPrototype.writeUint64 = function(t, e) {
var r = "undefined" == typeof e;
r && (e = this.offset);
if (!this.noAssert) {
if ("number" == typeof t) t = Long.fromNumber(t); else if ("string" == typeof t) t = Long.fromString(t); else if (!(t && t instanceof Long)) throw TypeError("Illegal value: " + t + " (not an integer or Long)");
if ("number" != typeof e || e % 1 != 0) throw TypeError("Illegal offset: " + e + " (not an integer)");
if ((e >>>= 0) < 0 || e + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + e + " (+0) <= " + this.buffer.byteLength);
}
"number" == typeof t ? t = Long.fromNumber(t) : "string" == typeof t && (t = Long.fromString(t));
e += 8;
var i = this.buffer.byteLength;
i < e && this.resize((i *= 2) > e ? i : e);
e -= 8;
var f = t.low, n = t.high;
if (this.littleEndian) {
this.view[e + 3] = f >>> 24 & 255;
this.view[e + 2] = f >>> 16 & 255;
this.view[e + 1] = f >>> 8 & 255;
this.view[e] = 255 & f;
e += 4;
this.view[e + 3] = n >>> 24 & 255;
this.view[e + 2] = n >>> 16 & 255;
this.view[e + 1] = n >>> 8 & 255;
this.view[e] = 255 & n;
} else {
this.view[e] = n >>> 24 & 255;
this.view[e + 1] = n >>> 16 & 255;
this.view[e + 2] = n >>> 8 & 255;
this.view[e + 3] = 255 & n;
e += 4;
this.view[e] = f >>> 24 & 255;
this.view[e + 1] = f >>> 16 & 255;
this.view[e + 2] = f >>> 8 & 255;
this.view[e + 3] = 255 & f;
}
r && (this.offset += 8);
return this;
};
ByteBufferPrototype.writeUInt64 = ByteBufferPrototype.writeUint64;
ByteBufferPrototype.readUint64 = function(t) {
var e = "undefined" == typeof t;
e && (t = this.offset);
if (!this.noAssert) {
if ("number" != typeof t || t % 1 != 0) throw TypeError("Illegal offset: " + t + " (not an integer)");
if ((t >>>= 0) < 0 || t + 8 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + t + " (+8) <= " + this.buffer.byteLength);
}
var r = 0, i = 0;
if (this.littleEndian) {
r = this.view[t + 2] << 16;
r |= this.view[t + 1] << 8;
r |= this.view[t];
r += this.view[t + 3] << 24 >>> 0;
t += 4;
i = this.view[t + 2] << 16;
i |= this.view[t + 1] << 8;
i |= this.view[t];
i += this.view[t + 3] << 24 >>> 0;
} else {
i = this.view[t + 1] << 16;
i |= this.view[t + 2] << 8;
i |= this.view[t + 3];
i += this.view[t] << 24 >>> 0;
t += 4;
r = this.view[t + 1] << 16;
r |= this.view[t + 2] << 8;
r |= this.view[t + 3];
r += this.view[t] << 24 >>> 0;
}
var f = new Long(r, i, !0);
e && (this.offset += 8);
return f;
};
ByteBufferPrototype.readUInt64 = ByteBufferPrototype.readUint64;
}

function ieee754_read(t, e, r, i, f) {
var n, o, s = 8 * f - i - 1, h = (1 << s) - 1, u = h >> 1, a = -7, g = r ? f - 1 : 0, l = r ? -1 : 1, y = t[e + g];
g += l;
n = y & (1 << -a) - 1;
y >>= -a;
a += s;
for (;0 < a; n = 256 * n + t[e + g], g += l, a -= 8) ;
o = n & (1 << -a) - 1;
n >>= -a;
a += i;
for (;0 < a; o = 256 * o + t[e + g], g += l, a -= 8) ;
if (0 === n) n = 1 - u; else {
if (n === h) return o ? NaN : Infinity * (y ? -1 : 1);
o += Math.pow(2, i);
n -= u;
}
return (y ? -1 : 1) * o * Math.pow(2, n - i);
}

function ieee754_write(t, e, r, i, f, n) {
var o, s, h, u = 8 * n - f - 1, a = (1 << u) - 1, g = a >> 1, l = 23 === f ? Math.pow(2, -24) - Math.pow(2, -77) : 0, y = i ? 0 : n - 1, p = i ? 1 : -1, B = e < 0 || 0 === e && 1 / e < 0 ? 1 : 0;
e = Math.abs(e);
if (isNaN(e) || Infinity === e) {
s = isNaN(e) ? 1 : 0;
o = a;
} else {
o = Math.floor(Math.log(e) / Math.LN2);
if (e * (h = Math.pow(2, -o)) < 1) {
o--;
h *= 2;
}
if (2 <= (e += 1 <= o + g ? l / h : l * Math.pow(2, 1 - g)) * h) {
o++;
h /= 2;
}
if (a <= o + g) {
s = 0;
o = a;
} else if (1 <= o + g) {
s = (e * h - 1) * Math.pow(2, f);
o += g;
} else {
s = e * Math.pow(2, g - 1) * Math.pow(2, f);
o = 0;
}
}
for (;8 <= f; t[r + y] = 255 & s, y += p, s /= 256, f -= 8) ;
o = o << f | s;
u += f;
for (;0 < u; t[r + y] = 255 & o, y += p, o /= 256, u -= 8) ;
t[r + y - p] |= 128 * B;
}

ByteBufferPrototype.writeFloat32 = function(t, e) {
var r = "undefined" == typeof e;
r && (e = this.offset);
if (!this.noAssert) {
if ("number" != typeof t) throw TypeError("Illegal value: " + t + " (not a number)");
if ("number" != typeof e || e % 1 != 0) throw TypeError("Illegal offset: " + e + " (not an integer)");
if ((e >>>= 0) < 0 || e + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + e + " (+0) <= " + this.buffer.byteLength);
}
e += 4;
var i = this.buffer.byteLength;
i < e && this.resize((i *= 2) > e ? i : e);
e -= 4;
ieee754_write(this.view, t, e, this.littleEndian, 23, 4);
r && (this.offset += 4);
return this;
};

ByteBufferPrototype.writeFloat = ByteBufferPrototype.writeFloat32;

ByteBufferPrototype.readFloat32 = function(t) {
var e = "undefined" == typeof t;
e && (t = this.offset);
if (!this.noAssert) {
if ("number" != typeof t || t % 1 != 0) throw TypeError("Illegal offset: " + t + " (not an integer)");
if ((t >>>= 0) < 0 || t + 4 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + t + " (+4) <= " + this.buffer.byteLength);
}
var r = ieee754_read(this.view, t, this.littleEndian, 23, 4);
e && (this.offset += 4);
return r;
};

ByteBufferPrototype.readFloat = ByteBufferPrototype.readFloat32;

ByteBufferPrototype.writeFloat64 = function(t, e) {
var r = "undefined" == typeof e;
r && (e = this.offset);
if (!this.noAssert) {
if ("number" != typeof t) throw TypeError("Illegal value: " + t + " (not a number)");
if ("number" != typeof e || e % 1 != 0) throw TypeError("Illegal offset: " + e + " (not an integer)");
if ((e >>>= 0) < 0 || e + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + e + " (+0) <= " + this.buffer.byteLength);
}
e += 8;
var i = this.buffer.byteLength;
i < e && this.resize((i *= 2) > e ? i : e);
e -= 8;
ieee754_write(this.view, t, e, this.littleEndian, 52, 8);
r && (this.offset += 8);
return this;
};

ByteBufferPrototype.writeDouble = ByteBufferPrototype.writeFloat64;

ByteBufferPrototype.readFloat64 = function(t) {
var e = "undefined" == typeof t;
e && (t = this.offset);
if (!this.noAssert) {
if ("number" != typeof t || t % 1 != 0) throw TypeError("Illegal offset: " + t + " (not an integer)");
if ((t >>>= 0) < 0 || t + 8 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + t + " (+8) <= " + this.buffer.byteLength);
}
var r = ieee754_read(this.view, t, this.littleEndian, 52, 8);
e && (this.offset += 8);
return r;
};

ByteBufferPrototype.readDouble = ByteBufferPrototype.readFloat64;

ByteBuffer.MAX_VARINT32_BYTES = 5;

ByteBuffer.calculateVarint32 = function(t) {
return (t >>>= 0) < 128 ? 1 : t < 16384 ? 2 : t < 1 << 21 ? 3 : t < 1 << 28 ? 4 : 5;
};

ByteBuffer.zigZagEncode32 = function(t) {
return ((t |= 0) << 1 ^ t >> 31) >>> 0;
};

ByteBuffer.zigZagDecode32 = function(t) {
return t >>> 1 ^ -(1 & t) | 0;
};

ByteBufferPrototype.writeVarint32 = function(t, e) {
var r = "undefined" == typeof e;
r && (e = this.offset);
if (!this.noAssert) {
if ("number" != typeof t || t % 1 != 0) throw TypeError("Illegal value: " + t + " (not an integer)");
t |= 0;
if ("number" != typeof e || e % 1 != 0) throw TypeError("Illegal offset: " + e + " (not an integer)");
if ((e >>>= 0) < 0 || e + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + e + " (+0) <= " + this.buffer.byteLength);
}
var i, f = ByteBuffer.calculateVarint32(t);
e += f;
var n = this.buffer.byteLength;
n < e && this.resize((n *= 2) > e ? n : e);
e -= f;
t >>>= 0;
for (;128 <= t; ) {
i = 127 & t | 128;
this.view[e++] = i;
t >>>= 7;
}
this.view[e++] = t;
if (r) {
this.offset = e;
return this;
}
return f;
};

ByteBufferPrototype.writeVarint32ZigZag = function(t, e) {
return this.writeVarint32(ByteBuffer.zigZagEncode32(t), e);
};

ByteBufferPrototype.readVarint32 = function(t) {
var e = "undefined" == typeof t;
e && (t = this.offset);
if (!this.noAssert) {
if ("number" != typeof t || t % 1 != 0) throw TypeError("Illegal offset: " + t + " (not an integer)");
if ((t >>>= 0) < 0 || t + 1 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + t + " (+1) <= " + this.buffer.byteLength);
}
var r, i = 0, f = 0;
do {
if (!this.noAssert && t > this.limit) {
var n = Error("Truncated");
n.truncated = !0;
throw n;
}
r = this.view[t++];
i < 5 && (f |= (127 & r) << 7 * i);
++i;
} while (0 != (128 & r));
f |= 0;
if (e) {
this.offset = t;
return f;
}
return {
value: f,
length: i
};
};

ByteBufferPrototype.readVarint32ZigZag = function(t) {
var e = this.readVarint32(t);
"object" == typeof e ? e.value = ByteBuffer.zigZagDecode32(e.value) : e = ByteBuffer.zigZagDecode32(e);
return e;
};

if (Long) {
ByteBuffer.MAX_VARINT64_BYTES = 10;
ByteBuffer.calculateVarint64 = function(t) {
"number" == typeof t ? t = Long.fromNumber(t) : "string" == typeof t && (t = Long.fromString(t));
var e = t.toInt() >>> 0, r = t.shiftRightUnsigned(28).toInt() >>> 0, i = t.shiftRightUnsigned(56).toInt() >>> 0;
return 0 == i ? 0 == r ? e < 16384 ? e < 128 ? 1 : 2 : e < 1 << 21 ? 3 : 4 : r < 16384 ? r < 128 ? 5 : 6 : r < 1 << 21 ? 7 : 8 : i < 128 ? 9 : 10;
};
ByteBuffer.zigZagEncode64 = function(t) {
"number" == typeof t ? t = Long.fromNumber(t, !1) : "string" == typeof t ? t = Long.fromString(t, !1) : !1 !== t.unsigned && (t = t.toSigned());
return t.shiftLeft(1).xor(t.shiftRight(63)).toUnsigned();
};
ByteBuffer.zigZagDecode64 = function(t) {
"number" == typeof t ? t = Long.fromNumber(t, !1) : "string" == typeof t ? t = Long.fromString(t, !1) : !1 !== t.unsigned && (t = t.toSigned());
return t.shiftRightUnsigned(1).xor(t.and(Long.ONE).toSigned().negate()).toSigned();
};
ByteBufferPrototype.writeVarint64 = function(t, e) {
var r = "undefined" == typeof e;
r && (e = this.offset);
if (!this.noAssert) {
if ("number" == typeof t) t = Long.fromNumber(t); else if ("string" == typeof t) t = Long.fromString(t); else if (!(t && t instanceof Long)) throw TypeError("Illegal value: " + t + " (not an integer or Long)");
if ("number" != typeof e || e % 1 != 0) throw TypeError("Illegal offset: " + e + " (not an integer)");
if ((e >>>= 0) < 0 || e + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + e + " (+0) <= " + this.buffer.byteLength);
}
"number" == typeof t ? t = Long.fromNumber(t, !1) : "string" == typeof t ? t = Long.fromString(t, !1) : !1 !== t.unsigned && (t = t.toSigned());
var i = ByteBuffer.calculateVarint64(t), f = t.toInt() >>> 0, n = t.shiftRightUnsigned(28).toInt() >>> 0, o = t.shiftRightUnsigned(56).toInt() >>> 0;
e += i;
var s = this.buffer.byteLength;
s < e && this.resize((s *= 2) > e ? s : e);
e -= i;
switch (i) {
case 10:
this.view[e + 9] = o >>> 7 & 1;

case 9:
this.view[e + 8] = 9 !== i ? 128 | o : 127 & o;

case 8:
this.view[e + 7] = 8 !== i ? n >>> 21 | 128 : n >>> 21 & 127;

case 7:
this.view[e + 6] = 7 !== i ? n >>> 14 | 128 : n >>> 14 & 127;

case 6:
this.view[e + 5] = 6 !== i ? n >>> 7 | 128 : n >>> 7 & 127;

case 5:
this.view[e + 4] = 5 !== i ? 128 | n : 127 & n;

case 4:
this.view[e + 3] = 4 !== i ? f >>> 21 | 128 : f >>> 21 & 127;

case 3:
this.view[e + 2] = 3 !== i ? f >>> 14 | 128 : f >>> 14 & 127;

case 2:
this.view[e + 1] = 2 !== i ? f >>> 7 | 128 : f >>> 7 & 127;

case 1:
this.view[e] = 1 !== i ? 128 | f : 127 & f;
}
if (r) {
this.offset += i;
return this;
}
return i;
};
ByteBufferPrototype.writeVarint64ZigZag = function(t, e) {
return this.writeVarint64(ByteBuffer.zigZagEncode64(t), e);
};
ByteBufferPrototype.readVarint64 = function(t) {
var e = "undefined" == typeof t;
e && (t = this.offset);
if (!this.noAssert) {
if ("number" != typeof t || t % 1 != 0) throw TypeError("Illegal offset: " + t + " (not an integer)");
if ((t >>>= 0) < 0 || t + 1 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + t + " (+1) <= " + this.buffer.byteLength);
}
var r = t, i = 0, f = 0, n = 0, o = 0;
i = 127 & (o = this.view[t++]);
if (128 & o) {
i |= (127 & (o = this.view[t++])) << 7;
if (128 & o || this.noAssert && "undefined" == typeof o) {
i |= (127 & (o = this.view[t++])) << 14;
if (128 & o || this.noAssert && "undefined" == typeof o) {
i |= (127 & (o = this.view[t++])) << 21;
if (128 & o || this.noAssert && "undefined" == typeof o) {
f = 127 & (o = this.view[t++]);
if (128 & o || this.noAssert && "undefined" == typeof o) {
f |= (127 & (o = this.view[t++])) << 7;
if (128 & o || this.noAssert && "undefined" == typeof o) {
f |= (127 & (o = this.view[t++])) << 14;
if (128 & o || this.noAssert && "undefined" == typeof o) {
f |= (127 & (o = this.view[t++])) << 21;
if (128 & o || this.noAssert && "undefined" == typeof o) {
n = 127 & (o = this.view[t++]);
if (128 & o || this.noAssert && "undefined" == typeof o) {
n |= (127 & (o = this.view[t++])) << 7;
if (128 & o || this.noAssert && "undefined" == typeof o) throw Error("Buffer overrun");
}
}
}
}
}
}
}
}
}
var s = Long.fromBits(i | f << 28, f >>> 4 | n << 24, !1);
if (e) {
this.offset = t;
return s;
}
return {
value: s,
length: t - r
};
};
ByteBufferPrototype.readVarint64ZigZag = function(t) {
var e = this.readVarint64(t);
e && e.value instanceof Long ? e.value = ByteBuffer.zigZagDecode64(e.value) : e = ByteBuffer.zigZagDecode64(e);
return e;
};
}

ByteBufferPrototype.writeCString = function(t, e) {
var r = "undefined" == typeof e;
r && (e = this.offset);
var i, f = t.length;
if (!this.noAssert) {
if ("string" != typeof t) throw TypeError("Illegal str: Not a string");
for (i = 0; i < f; ++i) if (0 === t.charCodeAt(i)) throw RangeError("Illegal str: Contains NULL-characters");
if ("number" != typeof e || e % 1 != 0) throw TypeError("Illegal offset: " + e + " (not an integer)");
if ((e >>>= 0) < 0 || e + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + e + " (+0) <= " + this.buffer.byteLength);
}
f = utfx.calculateUTF16asUTF8(stringSource(t))[1];
e += f + 1;
var n = this.buffer.byteLength;
n < e && this.resize((n *= 2) > e ? n : e);
e -= f + 1;
utfx.encodeUTF16toUTF8(stringSource(t), function(t) {
this.view[e++] = t;
}.bind(this));
this.view[e++] = 0;
if (r) {
this.offset = e;
return this;
}
return f;
};

ByteBufferPrototype.readCString = function(t) {
var e = "undefined" == typeof t;
e && (t = this.offset);
if (!this.noAssert) {
if ("number" != typeof t || t % 1 != 0) throw TypeError("Illegal offset: " + t + " (not an integer)");
if ((t >>>= 0) < 0 || t + 1 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + t + " (+1) <= " + this.buffer.byteLength);
}
var r, i = t, f = -1;
utfx.decodeUTF8toUTF16(function() {
if (0 === f) return null;
if (t >= this.limit) throw RangeError("Illegal range: Truncated data, " + t + " < " + this.limit);
return 0 === (f = this.view[t++]) ? null : f;
}.bind(this), r = stringDestination(), !0);
if (e) {
this.offset = t;
return r();
}
return {
string: r(),
length: t - i
};
};

ByteBufferPrototype.writeIString = function(t, e) {
var r = "undefined" == typeof e;
r && (e = this.offset);
if (!this.noAssert) {
if ("string" != typeof t) throw TypeError("Illegal str: Not a string");
if ("number" != typeof e || e % 1 != 0) throw TypeError("Illegal offset: " + e + " (not an integer)");
if ((e >>>= 0) < 0 || e + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + e + " (+0) <= " + this.buffer.byteLength);
}
var i, f = e;
i = utfx.calculateUTF16asUTF8(stringSource(t), this.noAssert)[1];
e += 4 + i;
var n = this.buffer.byteLength;
n < e && this.resize((n *= 2) > e ? n : e);
e -= 4 + i;
if (this.littleEndian) {
this.view[e + 3] = i >>> 24 & 255;
this.view[e + 2] = i >>> 16 & 255;
this.view[e + 1] = i >>> 8 & 255;
this.view[e] = 255 & i;
} else {
this.view[e] = i >>> 24 & 255;
this.view[e + 1] = i >>> 16 & 255;
this.view[e + 2] = i >>> 8 & 255;
this.view[e + 3] = 255 & i;
}
e += 4;
utfx.encodeUTF16toUTF8(stringSource(t), function(t) {
this.view[e++] = t;
}.bind(this));
if (e !== f + 4 + i) throw RangeError("Illegal range: Truncated data, " + e + " == " + (e + 4 + i));
if (r) {
this.offset = e;
return this;
}
return e - f;
};

ByteBufferPrototype.readIString = function(t) {
var e = "undefined" == typeof t;
e && (t = this.offset);
if (!this.noAssert) {
if ("number" != typeof t || t % 1 != 0) throw TypeError("Illegal offset: " + t + " (not an integer)");
if ((t >>>= 0) < 0 || t + 4 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + t + " (+4) <= " + this.buffer.byteLength);
}
var r = t, i = this.readUint32(t), f = this.readUTF8String(i, ByteBuffer.METRICS_BYTES, t += 4);
t += f.length;
if (e) {
this.offset = t;
return f.string;
}
return {
string: f.string,
length: t - r
};
};

ByteBuffer.METRICS_CHARS = "c";

ByteBuffer.METRICS_BYTES = "b";

ByteBufferPrototype.writeUTF8String = function(t, e) {
var r, i = "undefined" == typeof e;
i && (e = this.offset);
if (!this.noAssert) {
if ("number" != typeof e || e % 1 != 0) throw TypeError("Illegal offset: " + e + " (not an integer)");
if ((e >>>= 0) < 0 || e + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + e + " (+0) <= " + this.buffer.byteLength);
}
var f = e;
r = utfx.calculateUTF16asUTF8(stringSource(t))[1];
e += r;
var n = this.buffer.byteLength;
n < e && this.resize((n *= 2) > e ? n : e);
e -= r;
utfx.encodeUTF16toUTF8(stringSource(t), function(t) {
this.view[e++] = t;
}.bind(this));
if (i) {
this.offset = e;
return this;
}
return e - f;
};

ByteBufferPrototype.writeString = ByteBufferPrototype.writeUTF8String;

ByteBuffer.calculateUTF8Chars = function(t) {
return utfx.calculateUTF16asUTF8(stringSource(t))[0];
};

ByteBuffer.calculateUTF8Bytes = function(t) {
return utfx.calculateUTF16asUTF8(stringSource(t))[1];
};

ByteBuffer.calculateString = ByteBuffer.calculateUTF8Bytes;

ByteBufferPrototype.readUTF8String = function(t, e, r) {
if ("number" == typeof e) {
r = e;
e = void 0;
}
var i = "undefined" == typeof r;
i && (r = this.offset);
"undefined" == typeof e && (e = ByteBuffer.METRICS_CHARS);
if (!this.noAssert) {
if ("number" != typeof t || t % 1 != 0) throw TypeError("Illegal length: " + t + " (not an integer)");
t |= 0;
if ("number" != typeof r || r % 1 != 0) throw TypeError("Illegal offset: " + r + " (not an integer)");
if ((r >>>= 0) < 0 || r + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + r + " (+0) <= " + this.buffer.byteLength);
}
var f, n = 0, o = r;
if (e === ByteBuffer.METRICS_CHARS) {
f = stringDestination();
utfx.decodeUTF8(function() {
return n < t && r < this.limit ? this.view[r++] : null;
}.bind(this), function(t) {
++n;
utfx.UTF8toUTF16(t, f);
});
if (n !== t) throw RangeError("Illegal range: Truncated data, " + n + " == " + t);
if (i) {
this.offset = r;
return f();
}
return {
string: f(),
length: r - o
};
}
if (e === ByteBuffer.METRICS_BYTES) {
if (!this.noAssert) {
if ("number" != typeof r || r % 1 != 0) throw TypeError("Illegal offset: " + r + " (not an integer)");
if ((r >>>= 0) < 0 || r + t > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + r + " (+" + t + ") <= " + this.buffer.byteLength);
}
var s = r + t;
utfx.decodeUTF8toUTF16(function() {
return r < s ? this.view[r++] : null;
}.bind(this), f = stringDestination(), this.noAssert);
if (r !== s) throw RangeError("Illegal range: Truncated data, " + r + " == " + s);
if (i) {
this.offset = r;
return f();
}
return {
string: f(),
length: r - o
};
}
throw TypeError("Unsupported metrics: " + e);
};

ByteBufferPrototype.readString = ByteBufferPrototype.readUTF8String;

ByteBufferPrototype.writeVString = function(t, e) {
var r = "undefined" == typeof e;
r && (e = this.offset);
if (!this.noAssert) {
if ("string" != typeof t) throw TypeError("Illegal str: Not a string");
if ("number" != typeof e || e % 1 != 0) throw TypeError("Illegal offset: " + e + " (not an integer)");
if ((e >>>= 0) < 0 || e + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + e + " (+0) <= " + this.buffer.byteLength);
}
var i, f, n = e;
i = utfx.calculateUTF16asUTF8(stringSource(t), this.noAssert)[1];
f = ByteBuffer.calculateVarint32(i);
e += f + i;
var o = this.buffer.byteLength;
o < e && this.resize((o *= 2) > e ? o : e);
e -= f + i;
e += this.writeVarint32(i, e);
utfx.encodeUTF16toUTF8(stringSource(t), function(t) {
this.view[e++] = t;
}.bind(this));
if (e !== n + i + f) throw RangeError("Illegal range: Truncated data, " + e + " == " + (e + i + f));
if (r) {
this.offset = e;
return this;
}
return e - n;
};

ByteBufferPrototype.readVString = function(t) {
var e = "undefined" == typeof t;
e && (t = this.offset);
if (!this.noAssert) {
if ("number" != typeof t || t % 1 != 0) throw TypeError("Illegal offset: " + t + " (not an integer)");
if ((t >>>= 0) < 0 || t + 1 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + t + " (+1) <= " + this.buffer.byteLength);
}
var r = t, i = this.readVarint32(t), f = this.readUTF8String(i.value, ByteBuffer.METRICS_BYTES, t += i.length);
t += f.length;
if (e) {
this.offset = t;
return f.string;
}
return {
string: f.string,
length: t - r
};
};

ByteBufferPrototype.append = function(t, e, r) {
if ("number" == typeof e || "string" != typeof e) {
r = e;
e = void 0;
}
var i = "undefined" == typeof r;
i && (r = this.offset);
if (!this.noAssert) {
if ("number" != typeof r || r % 1 != 0) throw TypeError("Illegal offset: " + r + " (not an integer)");
if ((r >>>= 0) < 0 || r + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + r + " (+0) <= " + this.buffer.byteLength);
}
t instanceof ByteBuffer || (t = ByteBuffer.wrap(t, e));
var f = t.limit - t.offset;
if (f <= 0) return this;
r += f;
var n = this.buffer.byteLength;
n < r && this.resize((n *= 2) > r ? n : r);
r -= f;
this.view.set(t.view.subarray(t.offset, t.limit), r);
t.offset += f;
i && (this.offset += f);
return this;
};

ByteBufferPrototype.appendTo = function(t, e) {
t.append(this, e);
return this;
};

ByteBufferPrototype.writeBytes = ByteBufferPrototype.append;

ByteBufferPrototype.assert = function(t) {
this.noAssert = !t;
return this;
};

ByteBufferPrototype.capacity = function() {
return this.buffer.byteLength;
};

ByteBufferPrototype.clear = function() {
this.offset = 0;
this.limit = this.buffer.byteLength;
this.markedOffset = -1;
return this;
};

ByteBufferPrototype.clone = function(t) {
var e = new ByteBuffer(0, this.littleEndian, this.noAssert);
if (t) {
e.buffer = new ArrayBuffer(this.buffer.byteLength);
e.view = new Uint8Array(e.buffer);
} else {
e.buffer = this.buffer;
e.view = this.view;
}
e.offset = this.offset;
e.markedOffset = this.markedOffset;
e.limit = this.limit;
return e;
};

ByteBufferPrototype.compact = function(t, e) {
"undefined" == typeof t && (t = this.offset);
"undefined" == typeof e && (e = this.limit);
if (!this.noAssert) {
if ("number" != typeof t || t % 1 != 0) throw TypeError("Illegal begin: Not an integer");
t >>>= 0;
if ("number" != typeof e || e % 1 != 0) throw TypeError("Illegal end: Not an integer");
e >>>= 0;
if (t < 0 || e < t || e > this.buffer.byteLength) throw RangeError("Illegal range: 0 <= " + t + " <= " + e + " <= " + this.buffer.byteLength);
}
if (0 === t && e === this.buffer.byteLength) return this;
var r = e - t;
if (0 === r) {
this.buffer = EMPTY_BUFFER;
this.view = null;
0 <= this.markedOffset && (this.markedOffset -= t);
this.offset = 0;
this.limit = 0;
return this;
}
var i = new ArrayBuffer(r), f = new Uint8Array(i);
f.set(this.view.subarray(t, e));
this.buffer = i;
this.view = f;
0 <= this.markedOffset && (this.markedOffset -= t);
this.offset = 0;
this.limit = r;
return this;
};

ByteBufferPrototype.copy = function(t, e) {
"undefined" == typeof t && (t = this.offset);
"undefined" == typeof e && (e = this.limit);
if (!this.noAssert) {
if ("number" != typeof t || t % 1 != 0) throw TypeError("Illegal begin: Not an integer");
t >>>= 0;
if ("number" != typeof e || e % 1 != 0) throw TypeError("Illegal end: Not an integer");
e >>>= 0;
if (t < 0 || e < t || e > this.buffer.byteLength) throw RangeError("Illegal range: 0 <= " + t + " <= " + e + " <= " + this.buffer.byteLength);
}
if (t === e) return new ByteBuffer(0, this.littleEndian, this.noAssert);
var r = e - t, i = new ByteBuffer(r, this.littleEndian, this.noAssert);
i.offset = 0;
i.limit = r;
0 <= i.markedOffset && (i.markedOffset -= t);
this.copyTo(i, 0, t, e);
return i;
};

ByteBufferPrototype.copyTo = function(t, e, r, i) {
var f, n;
if (!this.noAssert && !ByteBuffer.isByteBuffer(t)) throw TypeError("Illegal target: Not a ByteBuffer");
e = (n = "undefined" == typeof e) ? t.offset : 0 | e;
r = (f = "undefined" == typeof r) ? this.offset : 0 | r;
i = "undefined" == typeof i ? this.limit : 0 | i;
if (e < 0 || e > t.buffer.byteLength) throw RangeError("Illegal target range: 0 <= " + e + " <= " + t.buffer.byteLength);
if (r < 0 || i > this.buffer.byteLength) throw RangeError("Illegal source range: 0 <= " + r + " <= " + this.buffer.byteLength);
var o = i - r;
if (0 === o) return t;
t.ensureCapacity(e + o);
t.view.set(this.view.subarray(r, i), e);
f && (this.offset += o);
n && (t.offset += o);
return this;
};

ByteBufferPrototype.ensureCapacity = function(t) {
var e = this.buffer.byteLength;
return e < t ? this.resize((e *= 2) > t ? e : t) : this;
};

ByteBufferPrototype.fill = function(t, e, r) {
var i = "undefined" == typeof e;
i && (e = this.offset);
"string" == typeof t && 0 < t.length && (t = t.charCodeAt(0));
"undefined" == typeof e && (e = this.offset);
"undefined" == typeof r && (r = this.limit);
if (!this.noAssert) {
if ("number" != typeof t || t % 1 != 0) throw TypeError("Illegal value: " + t + " (not an integer)");
t |= 0;
if ("number" != typeof e || e % 1 != 0) throw TypeError("Illegal begin: Not an integer");
e >>>= 0;
if ("number" != typeof r || r % 1 != 0) throw TypeError("Illegal end: Not an integer");
r >>>= 0;
if (e < 0 || r < e || r > this.buffer.byteLength) throw RangeError("Illegal range: 0 <= " + e + " <= " + r + " <= " + this.buffer.byteLength);
}
if (r <= e) return this;
for (;e < r; ) this.view[e++] = t;
i && (this.offset = e);
return this;
};

ByteBufferPrototype.flip = function() {
this.limit = this.offset;
this.offset = 0;
return this;
};

ByteBufferPrototype.mark = function(t) {
t = "undefined" == typeof t ? this.offset : t;
if (!this.noAssert) {
if ("number" != typeof t || t % 1 != 0) throw TypeError("Illegal offset: " + t + " (not an integer)");
if ((t >>>= 0) < 0 || t + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + t + " (+0) <= " + this.buffer.byteLength);
}
this.markedOffset = t;
return this;
};

ByteBufferPrototype.order = function(t) {
if (!this.noAssert && "boolean" != typeof t) throw TypeError("Illegal littleEndian: Not a boolean");
this.littleEndian = !!t;
return this;
};

ByteBufferPrototype.LE = function(t) {
this.littleEndian = "undefined" == typeof t || !!t;
return this;
};

ByteBufferPrototype.BE = function(t) {
this.littleEndian = "undefined" != typeof t && !t;
return this;
};

ByteBufferPrototype.prepend = function(t, e, r) {
if ("number" == typeof e || "string" != typeof e) {
r = e;
e = void 0;
}
var i = "undefined" == typeof r;
i && (r = this.offset);
if (!this.noAssert) {
if ("number" != typeof r || r % 1 != 0) throw TypeError("Illegal offset: " + r + " (not an integer)");
if ((r >>>= 0) < 0 || r + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + r + " (+0) <= " + this.buffer.byteLength);
}
t instanceof ByteBuffer || (t = ByteBuffer.wrap(t, e));
var f = t.limit - t.offset;
if (f <= 0) return this;
var n = f - r;
if (0 < n) {
var o = new ArrayBuffer(this.buffer.byteLength + n), s = new Uint8Array(o);
s.set(this.view.subarray(r, this.buffer.byteLength), f);
this.buffer = o;
this.view = s;
this.offset += n;
0 <= this.markedOffset && (this.markedOffset += n);
this.limit += n;
r += n;
} else new Uint8Array(this.buffer);
this.view.set(t.view.subarray(t.offset, t.limit), r - f);
t.offset = t.limit;
i && (this.offset -= f);
return this;
};

ByteBufferPrototype.prependTo = function(t, e) {
t.prepend(this, e);
return this;
};

ByteBufferPrototype.printDebug = function(t) {
"function" != typeof t && (t = console.log.bind(console));
t(this.toString() + "\n-------------------------------------------------------------------\n" + this.toDebug(!0));
};

ByteBufferPrototype.remaining = function() {
return this.limit - this.offset;
};

ByteBufferPrototype.reset = function() {
if (0 <= this.markedOffset) {
this.offset = this.markedOffset;
this.markedOffset = -1;
} else this.offset = 0;
return this;
};

ByteBufferPrototype.resize = function(t) {
if (!this.noAssert) {
if ("number" != typeof t || t % 1 != 0) throw TypeError("Illegal capacity: " + t + " (not an integer)");
if ((t |= 0) < 0) throw RangeError("Illegal capacity: 0 <= " + t);
}
if (this.buffer.byteLength < t) {
var e = new ArrayBuffer(t), r = new Uint8Array(e);
r.set(this.view);
this.buffer = e;
this.view = r;
}
return this;
};

ByteBufferPrototype.reverse = function(t, e) {
"undefined" == typeof t && (t = this.offset);
"undefined" == typeof e && (e = this.limit);
if (!this.noAssert) {
if ("number" != typeof t || t % 1 != 0) throw TypeError("Illegal begin: Not an integer");
t >>>= 0;
if ("number" != typeof e || e % 1 != 0) throw TypeError("Illegal end: Not an integer");
e >>>= 0;
if (t < 0 || e < t || e > this.buffer.byteLength) throw RangeError("Illegal range: 0 <= " + t + " <= " + e + " <= " + this.buffer.byteLength);
}
if (t === e) return this;
Array.prototype.reverse.call(this.view.subarray(t, e));
return this;
};

ByteBufferPrototype.skip = function(t) {
if (!this.noAssert) {
if ("number" != typeof t || t % 1 != 0) throw TypeError("Illegal length: " + t + " (not an integer)");
t |= 0;
}
var e = this.offset + t;
if (!this.noAssert && (e < 0 || e > this.buffer.byteLength)) throw RangeError("Illegal length: 0 <= " + this.offset + " + " + t + " <= " + this.buffer.byteLength);
this.offset = e;
return this;
};

ByteBufferPrototype.slice = function(t, e) {
"undefined" == typeof t && (t = this.offset);
"undefined" == typeof e && (e = this.limit);
if (!this.noAssert) {
if ("number" != typeof t || t % 1 != 0) throw TypeError("Illegal begin: Not an integer");
t >>>= 0;
if ("number" != typeof e || e % 1 != 0) throw TypeError("Illegal end: Not an integer");
e >>>= 0;
if (t < 0 || e < t || e > this.buffer.byteLength) throw RangeError("Illegal range: 0 <= " + t + " <= " + e + " <= " + this.buffer.byteLength);
}
var r = this.clone();
r.offset = t;
r.limit = e;
return r;
};

ByteBufferPrototype.toBuffer = function(t) {
var e = this.offset, r = this.limit;
if (!this.noAssert) {
if ("number" != typeof e || e % 1 != 0) throw TypeError("Illegal offset: Not an integer");
e >>>= 0;
if ("number" != typeof r || r % 1 != 0) throw TypeError("Illegal limit: Not an integer");
r >>>= 0;
if (e < 0 || r < e || r > this.buffer.byteLength) throw RangeError("Illegal range: 0 <= " + e + " <= " + r + " <= " + this.buffer.byteLength);
}
if (!t && 0 === e && r === this.buffer.byteLength) return this.buffer;
if (e === r) return EMPTY_BUFFER;
var i = new ArrayBuffer(r - e);
new Uint8Array(i).set(new Uint8Array(this.buffer).subarray(e, r), 0);
return i;
};

ByteBufferPrototype.toArrayBuffer = ByteBufferPrototype.toBuffer;

ByteBufferPrototype.toString = function(t, e, r) {
if ("undefined" == typeof t) return "ByteBufferAB(offset=" + this.offset + ",markedOffset=" + this.markedOffset + ",limit=" + this.limit + ",capacity=" + this.capacity() + ")";
"number" == typeof t && (r = e = t = "utf8");
switch (t) {
case "utf8":
return this.toUTF8(e, r);

case "base64":
return this.toBase64(e, r);

case "hex":
return this.toHex(e, r);

case "binary":
return this.toBinary(e, r);

case "debug":
return this.toDebug();

case "columns":
return this.toColumns();

default:
throw Error("Unsupported encoding: " + t);
}
};

var lxiv = function() {
"use strict";
for (var t = {}, f = [ 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 43, 47 ], o = [], e = 0, r = f.length; e < r; ++e) o[f[e]] = e;
t.encode = function(t, e) {
for (var r, i; null !== (r = t()); ) {
e(f[r >> 2 & 63]);
i = (3 & r) << 4;
if (null !== (r = t())) {
e(f[63 & ((i |= r >> 4 & 15) | r >> 4 & 15)]);
i = (15 & r) << 2;
null !== (r = t()) ? (e(f[63 & (i | r >> 6 & 3)]), e(f[63 & r])) : (e(f[63 & i]), 
e(61));
} else e(f[63 & i]), e(61), e(61);
}
};
t.decode = function(t, e) {
var r, i, f;
function n(t) {
throw Error("Illegal character code: " + t);
}
for (;null !== (r = t()); ) {
"undefined" == typeof (i = o[r]) && n(r);
if (null !== (r = t())) {
"undefined" == typeof (f = o[r]) && n(r);
e(i << 2 >>> 0 | (48 & f) >> 4);
if (null !== (r = t())) {
if ("undefined" == typeof (i = o[r])) {
if (61 === r) break;
n(r);
}
e((15 & f) << 4 >>> 0 | (60 & i) >> 2);
if (null !== (r = t())) {
if ("undefined" == typeof (f = o[r])) {
if (61 === r) break;
n(r);
}
e((3 & i) << 6 >>> 0 | f);
}
}
}
}
};
t.test = function(t) {
return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(t);
};
return t;
}();

ByteBufferPrototype.toBase64 = function(t, e) {
"undefined" == typeof t && (t = this.offset);
"undefined" == typeof e && (e = this.limit);
e |= 0;
if ((t |= 0) < 0 || e > this.capacity || e < t) throw RangeError("begin, end");
var r;
lxiv.encode(function() {
return t < e ? this.view[t++] : null;
}.bind(this), r = stringDestination());
return r();
};

ByteBuffer.fromBase64 = function(t, e) {
if ("string" != typeof t) throw TypeError("str");
var r = new ByteBuffer(t.length / 4 * 3, e), i = 0;
lxiv.decode(stringSource(t), function(t) {
r.view[i++] = t;
});
r.limit = i;
return r;
};

ByteBuffer.btoa = function(t) {
return ByteBuffer.fromBinary(t).toBase64();
};

ByteBuffer.atob = function(t) {
return ByteBuffer.fromBase64(t).toBinary();
};

ByteBufferPrototype.toBinary = function(t, e) {
"undefined" == typeof t && (t = this.offset);
"undefined" == typeof e && (e = this.limit);
e |= 0;
if ((t |= 0) < 0 || e > this.capacity() || e < t) throw RangeError("begin, end");
if (t === e) return "";
for (var r = [], i = []; t < e; ) {
r.push(this.view[t++]);
1024 <= r.length && (i.push(String.fromCharCode.apply(String, r)), r = []);
}
return i.join("") + String.fromCharCode.apply(String, r);
};

ByteBuffer.fromBinary = function(t, e) {
if ("string" != typeof t) throw TypeError("str");
for (var r, i = 0, f = t.length, n = new ByteBuffer(f, e); i < f; ) {
if (255 < (r = t.charCodeAt(i))) throw RangeError("illegal char code: " + r);
n.view[i++] = r;
}
n.limit = f;
return n;
};

ByteBufferPrototype.toDebug = function(t) {
for (var e, r = -1, i = this.buffer.byteLength, f = "", n = "", o = ""; r < i; ) {
if (-1 !== r) {
f += (e = this.view[r]) < 16 ? "0" + e.toString(16).toUpperCase() : e.toString(16).toUpperCase();
t && (n += 32 < e && e < 127 ? String.fromCharCode(e) : ".");
}
++r;
if (t && 0 < r && r % 16 == 0 && r !== i) {
for (;f.length < 51; ) f += " ";
o += f + n + "\n";
f = n = "";
}
r === this.offset && r === this.limit ? f += r === this.markedOffset ? "!" : "|" : r === this.offset ? f += r === this.markedOffset ? "[" : "<" : r === this.limit ? f += r === this.markedOffset ? "]" : ">" : f += r === this.markedOffset ? "'" : t || 0 !== r && r !== i ? " " : "";
}
if (t && " " !== f) {
for (;f.length < 51; ) f += " ";
o += f + n + "\n";
}
return t ? o : f;
};

ByteBuffer.fromDebug = function(t, e, r) {
for (var i, f, n = t.length, o = new ByteBuffer((n + 1) / 3 | 0, e, r), s = 0, h = 0, u = !1, a = !1, g = !1, l = !1, y = !1; s < n; ) {
switch (i = t.charAt(s++)) {
case "!":
if (!r) {
if (a || g || l) {
y = !0;
break;
}
a = g = l = !0;
}
o.offset = o.markedOffset = o.limit = h;
u = !1;
break;

case "|":
if (!r) {
if (a || l) {
y = !0;
break;
}
a = l = !0;
}
o.offset = o.limit = h;
u = !1;
break;

case "[":
if (!r) {
if (a || g) {
y = !0;
break;
}
a = g = !0;
}
o.offset = o.markedOffset = h;
u = !1;
break;

case "<":
if (!r) {
if (a) {
y = !0;
break;
}
a = !0;
}
o.offset = h;
u = !1;
break;

case "]":
if (!r) {
if (l || g) {
y = !0;
break;
}
l = g = !0;
}
o.limit = o.markedOffset = h;
u = !1;
break;

case ">":
if (!r) {
if (l) {
y = !0;
break;
}
l = !0;
}
o.limit = h;
u = !1;
break;

case "'":
if (!r) {
if (g) {
y = !0;
break;
}
g = !0;
}
o.markedOffset = h;
u = !1;
break;

case " ":
u = !1;
break;

default:
if (!r && u) {
y = !0;
break;
}
f = parseInt(i + t.charAt(s++), 16);
if (!r && (isNaN(f) || f < 0 || 255 < f)) throw TypeError("Illegal str: Not a debug encoded string");
o.view[h++] = f;
u = !0;
}
if (y) throw TypeError("Illegal str: Invalid symbol at " + s);
}
if (!r) {
if (!a || !l) throw TypeError("Illegal str: Missing offset or limit");
if (h < o.buffer.byteLength) throw TypeError("Illegal str: Not a debug encoded string (is it hex?) " + h + " < " + n);
}
return o;
};

ByteBufferPrototype.toHex = function(t, e) {
t = "undefined" == typeof t ? this.offset : t;
e = "undefined" == typeof e ? this.limit : e;
if (!this.noAssert) {
if ("number" != typeof t || t % 1 != 0) throw TypeError("Illegal begin: Not an integer");
t >>>= 0;
if ("number" != typeof e || e % 1 != 0) throw TypeError("Illegal end: Not an integer");
e >>>= 0;
if (t < 0 || e < t || e > this.buffer.byteLength) throw RangeError("Illegal range: 0 <= " + t + " <= " + e + " <= " + this.buffer.byteLength);
}
for (var r, i = new Array(e - t); t < e; ) (r = this.view[t++]) < 16 ? i.push("0", r.toString(16)) : i.push(r.toString(16));
return i.join("");
};

ByteBuffer.fromHex = function(t, e, r) {
if (!r) {
if ("string" != typeof t) throw TypeError("Illegal str: Not a string");
if (t.length % 2 != 0) throw TypeError("Illegal str: Length not a multiple of 2");
}
for (var i, f = t.length, n = new ByteBuffer(f / 2 | 0, e), o = 0, s = 0; o < f; o += 2) {
i = parseInt(t.substring(o, o + 2), 16);
if (!r && (!isFinite(i) || i < 0 || 255 < i)) throw TypeError("Illegal str: Contains non-hex characters");
n.view[s++] = i;
}
n.limit = s;
return n;
};

var utfx = function() {
"use strict";
var i = {
MAX_CODEPOINT: 1114111,
encodeUTF8: function(t, e) {
var r = null;
"number" == typeof t && (r = t, t = function() {
return null;
});
for (;null !== r || null !== (r = t()); ) {
r < 128 ? e(127 & r) : (r < 2048 ? e(r >> 6 & 31 | 192) : (r < 65536 ? e(r >> 12 & 15 | 224) : (e(r >> 18 & 7 | 240), 
e(r >> 12 & 63 | 128)), e(r >> 6 & 63 | 128)), e(63 & r | 128));
r = null;
}
},
decodeUTF8: function(t, e) {
for (var r, i, f, n, o = function(t) {
t = t.slice(0, t.indexOf(null));
var e = Error(t.toString());
e.name = "TruncatedError";
e.bytes = t;
throw e;
}; null !== (r = t()); ) if (0 == (128 & r)) e(r); else if (192 == (224 & r)) null === (i = t()) && o([ r, i ]), 
e((31 & r) << 6 | 63 & i); else if (224 == (240 & r)) (null === (i = t()) || null === (f = t())) && o([ r, i, f ]), 
e((15 & r) << 12 | (63 & i) << 6 | 63 & f); else {
if (240 != (248 & r)) throw RangeError("Illegal starting byte: " + r);
(null === (i = t()) || null === (f = t()) || null === (n = t())) && o([ r, i, f, n ]), 
e((7 & r) << 18 | (63 & i) << 12 | (63 & f) << 6 | 63 & n);
}
},
UTF16toUTF8: function(t, e) {
for (var r, i = null; null !== (r = null !== i ? i : t()); ) if (55296 <= r && r <= 57343 && null !== (i = t()) && 56320 <= i && i <= 57343) {
e(1024 * (r - 55296) + i - 56320 + 65536);
i = null;
} else e(r);
null !== i && e(i);
},
UTF8toUTF16: function(t, e) {
var r = null;
"number" == typeof t && (r = t, t = function() {
return null;
});
for (;null !== r || null !== (r = t()); ) {
r <= 65535 ? e(r) : (e(55296 + ((r -= 65536) >> 10)), e(r % 1024 + 56320));
r = null;
}
},
encodeUTF16toUTF8: function(t, e) {
i.UTF16toUTF8(t, function(t) {
i.encodeUTF8(t, e);
});
},
decodeUTF8toUTF16: function(t, e) {
i.decodeUTF8(t, function(t) {
i.UTF8toUTF16(t, e);
});
},
calculateCodePoint: function(t) {
return t < 128 ? 1 : t < 2048 ? 2 : t < 65536 ? 3 : 4;
},
calculateUTF8: function(t) {
for (var e, r = 0; null !== (e = t()); ) r += e < 128 ? 1 : e < 2048 ? 2 : e < 65536 ? 3 : 4;
return r;
},
calculateUTF16asUTF8: function(t) {
var e = 0, r = 0;
i.UTF16toUTF8(t, function(t) {
++e;
r += t < 128 ? 1 : t < 2048 ? 2 : t < 65536 ? 3 : 4;
});
return [ e, r ];
}
};
return i;
}();

ByteBufferPrototype.toUTF8 = function(e, r) {
"undefined" == typeof e && (e = this.offset);
"undefined" == typeof r && (r = this.limit);
if (!this.noAssert) {
if ("number" != typeof e || e % 1 != 0) throw TypeError("Illegal begin: Not an integer");
e >>>= 0;
if ("number" != typeof r || r % 1 != 0) throw TypeError("Illegal end: Not an integer");
r >>>= 0;
if (e < 0 || r < e || r > this.buffer.byteLength) throw RangeError("Illegal range: 0 <= " + e + " <= " + r + " <= " + this.buffer.byteLength);
}
var t;
try {
utfx.decodeUTF8toUTF16(function() {
return e < r ? this.view[e++] : null;
}.bind(this), t = stringDestination());
} catch (t) {
if (e !== r) throw RangeError("Illegal range: Truncated data, " + e + " != " + r);
}
return t();
};

ByteBuffer.fromUTF8 = function(t, e, r) {
if (!r && "string" != typeof t) throw TypeError("Illegal str: Not a string");
var i = new ByteBuffer(utfx.calculateUTF16asUTF8(stringSource(t), !0)[1], e, r), f = 0;
utfx.encodeUTF16toUTF8(stringSource(t), function(t) {
i.view[f++] = t;
});
i.limit = f;
return i;
};