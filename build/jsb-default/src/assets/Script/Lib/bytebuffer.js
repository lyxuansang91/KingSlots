/**
 * Constructs a 64 bit two's-complement integer, given its low and high 32 bit values as *signed* integers.
 *  See the from* functions below for more convenient ways of constructing Longs.
 * @exports Long
 * @class A Long class for representing a 64 bit two's-complement integer value.
 * @param {number} low The low (signed) 32 bits of the long
 * @param {number} high The high (signed) 32 bits of the long
 * @param {boolean=} unsigned Whether unsigned or not, defaults to `false` for signed
 * @constructor
 */
function Long(low, high, unsigned) {
    
        /**
         * The low 32 bits as a signed value.
         * @type {number}
         */
        this.low = low | 0;
    
        /**
         * The high 32 bits as a signed value.
         * @type {number}
         */
        this.high = high | 0;
    
        /**
         * Whether unsigned or not.
         * @type {boolean}
         */
        this.unsigned = !!unsigned;
    }
    
    // The internal representation of a long is the two given signed, 32-bit values.
    // We use 32-bit pieces because these are the size of integers on which
    // Javascript performs bit-operations.  For operations like addition and
    // multiplication, we split each number into 16 bit pieces, which can easily be
    // multiplied within Javascript's floating-point representation without overflow
    // or change in sign.
    //
    // In the algorithms below, we frequently reduce the negative case to the
    // positive case by negating the input(s) and then post-processing the result.
    // Note that we must ALWAYS check specially whether those values are MIN_VALUE
    // (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
    // a positive number, it overflows back into a negative).  Not handling this
    // case would often result in infinite recursion.
    //
    // Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the from*
    // methods on which they depend.
    
    /**
     * An indicator used to reliably determine if an object is a Long or not.
     * @type {boolean}
     * @const
     * @private
     */
    Long.prototype.__isLong__;
    
    Object.defineProperty(Long.prototype, "__isLong__", {
        value: true,
        enumerable: false,
        configurable: false
    });
    
    /**
     * @function
     * @param {*} obj Object
     * @returns {boolean}
     * @inner
     */
    function isLong(obj) {
        return (obj && obj["__isLong__"]) === true;
    }
    
    /**
     * Tests if the specified object is a Long.
     * @function
     * @param {*} obj Object
     * @returns {boolean}
     */
    Long.isLong = isLong;
    
    /**
     * A cache of the Long representations of small integer values.
     * @type {!Object}
     * @inner
     */
    var INT_CACHE = {};
    
    /**
     * A cache of the Long representations of small unsigned integer values.
     * @type {!Object}
     * @inner
     */
    var UINT_CACHE = {};
    
    /**
     * @param {number} value
     * @param {boolean=} unsigned
     * @returns {!Long}
     * @inner
     */
    function fromInt(value, unsigned) {
        var obj, cachedObj, cache;
        if (unsigned) {
            value >>>= 0;
            if (cache = (0 <= value && value < 256)) {
                cachedObj = UINT_CACHE[value];
                if (cachedObj)
                    return cachedObj;
            }
            obj = fromBits(value, (value | 0) < 0 ? -1 : 0, true);
            if (cache)
                UINT_CACHE[value] = obj;
            return obj;
        } else {
            value |= 0;
            if (cache = (-128 <= value && value < 128)) {
                cachedObj = INT_CACHE[value];
                if (cachedObj)
                    return cachedObj;
            }
            obj = fromBits(value, value < 0 ? -1 : 0, false);
            if (cache)
                INT_CACHE[value] = obj;
            return obj;
        }
    }
    
    /**
     * Returns a Long representing the given 32 bit integer value.
     * @function
     * @param {number} value The 32 bit integer in question
     * @param {boolean=} unsigned Whether unsigned or not, defaults to `false` for signed
     * @returns {!Long} The corresponding Long value
     */
    Long.fromInt = fromInt;
    
    /**
     * @param {number} value
     * @param {boolean=} unsigned
     * @returns {!Long}
     * @inner
     */
    function fromNumber(value, unsigned) {
        if (isNaN(value) || !isFinite(value))
            return unsigned ? UZERO : ZERO;
        if (unsigned) {
            if (value < 0)
                return UZERO;
            if (value >= TWO_PWR_64_DBL)
                return MAX_UNSIGNED_VALUE;
        } else {
            if (value <= -TWO_PWR_63_DBL)
                return MIN_VALUE;
            if (value + 1 >= TWO_PWR_63_DBL)
                return MAX_VALUE;
        }
        if (value < 0)
            return fromNumber(-value, unsigned).neg();
        return fromBits((value % TWO_PWR_32_DBL) | 0, (value / TWO_PWR_32_DBL) | 0, unsigned);
    }
    
    /**
     * Returns a Long representing the given value, provided that it is a finite number. Otherwise, zero is returned.
     * @function
     * @param {number} value The number in question
     * @param {boolean=} unsigned Whether unsigned or not, defaults to `false` for signed
     * @returns {!Long} The corresponding Long value
     */
    Long.fromNumber = fromNumber;
    
    /**
     * @param {number} lowBits
     * @param {number} highBits
     * @param {boolean=} unsigned
     * @returns {!Long}
     * @inner
     */
    function fromBits(lowBits, highBits, unsigned) {
        return new Long(lowBits, highBits, unsigned);
    }
    
    /**
     * Returns a Long representing the 64 bit integer that comes by concatenating the given low and high bits. Each is
     *  assumed to use 32 bits.
     * @function
     * @param {number} lowBits The low 32 bits
     * @param {number} highBits The high 32 bits
     * @param {boolean=} unsigned Whether unsigned or not, defaults to `false` for signed
     * @returns {!Long} The corresponding Long value
     */
    Long.fromBits = fromBits;
    
    /**
     * @function
     * @param {number} base
     * @param {number} exponent
     * @returns {number}
     * @inner
     */
    var pow_dbl = Math.pow; // Used 4 times (4*8 to 15+4)
    
    /**
     * @param {string} str
     * @param {(boolean|number)=} unsigned
     * @param {number=} radix
     * @returns {!Long}
     * @inner
     */
    function fromString(str, unsigned, radix) {
        if (str.length === 0)
            throw Error('empty string');
        if (str === "NaN" || str === "Infinity" || str === "+Infinity" || str === "-Infinity")
            return ZERO;
        if (typeof unsigned === 'number') {
            // For goog.math.long compatibility
            radix = unsigned,
                unsigned = false;
        } else {
            unsigned = !!unsigned;
        }
        radix = radix || 10;
        if (radix < 2 || 36 < radix)
            throw RangeError('radix');
    
        var p;
        if ((p = str.indexOf('-')) > 0)
            throw Error('interior hyphen');
        else if (p === 0) {
            return fromString(str.substring(1), unsigned, radix).neg();
        }
    
        // Do several (8) digits each time through the loop, so as to
        // minimize the calls to the very expensive emulated div.
        var radixToPower = fromNumber(pow_dbl(radix, 8));
    
        var result = ZERO;
        for (var i = 0; i < str.length; i += 8) {
            var size = Math.min(8, str.length - i),
                value = parseInt(str.substring(i, i + size), radix);
            if (size < 8) {
                var power = fromNumber(pow_dbl(radix, size));
                result = result.mul(power).add(fromNumber(value));
            } else {
                result = result.mul(radixToPower);
                result = result.add(fromNumber(value));
            }
        }
        result.unsigned = unsigned;
        return result;
    }
    
    /**
     * Returns a Long representation of the given string, written using the specified radix.
     * @function
     * @param {string} str The textual representation of the Long
     * @param {(boolean|number)=} unsigned Whether unsigned or not, defaults to `false` for signed
     * @param {number=} radix The radix in which the text is written (2-36), defaults to 10
     * @returns {!Long} The corresponding Long value
     */
    Long.fromString = fromString;
    
    /**
     * @function
     * @param {!Long|number|string|!{low: number, high: number, unsigned: boolean}} val
     * @returns {!Long}
     * @inner
     */
    function fromValue(val) {
        if (val /* is compatible */ instanceof Long)
            return val;
        if (typeof val === 'number')
            return fromNumber(val);
        if (typeof val === 'string')
            return fromString(val);
        // Throws for non-objects, converts non-instanceof Long:
        return fromBits(val.low, val.high, val.unsigned);
    }
    
    /**
     * Converts the specified value to a Long.
     * @function
     * @param {!Long|number|string|!{low: number, high: number, unsigned: boolean}} val Value
     * @returns {!Long}
     */
    Long.fromValue = fromValue;
    
    // NOTE: the compiler should inline these constant values below and then remove these variables, so there should be
    // no runtime penalty for these.
    
    /**
     * @type {number}
     * @const
     * @inner
     */
    var TWO_PWR_16_DBL = 1 << 16;
    
    /**
     * @type {number}
     * @const
     * @inner
     */
    var TWO_PWR_24_DBL = 1 << 24;
    
    /**
     * @type {number}
     * @const
     * @inner
     */
    var TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;
    
    /**
     * @type {number}
     * @const
     * @inner
     */
    var TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;
    
    /**
     * @type {number}
     * @const
     * @inner
     */
    var TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2;
    
    /**
     * @type {!Long}
     * @const
     * @inner
     */
    var TWO_PWR_24 = fromInt(TWO_PWR_24_DBL);
    
    /**
     * @type {!Long}
     * @inner
     */
    var ZERO = fromInt(0);
    
    /**
     * Signed zero.
     * @type {!Long}
     */
    Long.ZERO = ZERO;
    
    /**
     * @type {!Long}
     * @inner
     */
    var UZERO = fromInt(0, true);
    
    /**
     * Unsigned zero.
     * @type {!Long}
     */
    Long.UZERO = UZERO;
    
    /**
     * @type {!Long}
     * @inner
     */
    var ONE = fromInt(1);
    
    /**
     * Signed one.
     * @type {!Long}
     */
    Long.ONE = ONE;
    
    /**
     * @type {!Long}
     * @inner
     */
    var UONE = fromInt(1, true);
    
    /**
     * Unsigned one.
     * @type {!Long}
     */
    Long.UONE = UONE;
    
    /**
     * @type {!Long}
     * @inner
     */
    var NEG_ONE = fromInt(-1);
    
    /**
     * Signed negative one.
     * @type {!Long}
     */
    Long.NEG_ONE = NEG_ONE;
    
    /**
     * @type {!Long}
     * @inner
     */
    var MAX_VALUE = fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0, false);
    
    /**
     * Maximum signed value.
     * @type {!Long}
     */
    Long.MAX_VALUE = MAX_VALUE;
    
    /**
     * @type {!Long}
     * @inner
     */
    var MAX_UNSIGNED_VALUE = fromBits(0xFFFFFFFF | 0, 0xFFFFFFFF | 0, true);
    
    /**
     * Maximum unsigned value.
     * @type {!Long}
     */
    Long.MAX_UNSIGNED_VALUE = MAX_UNSIGNED_VALUE;
    
    /**
     * @type {!Long}
     * @inner
     */
    var MIN_VALUE = fromBits(0, 0x80000000 | 0, false);
    
    /**
     * Minimum signed value.
     * @type {!Long}
     */
    Long.MIN_VALUE = MIN_VALUE;
    
    /**
     * @alias Long.prototype
     * @inner
     */
    var LongPrototype = Long.prototype;
    
    /**
     * Converts the Long to a 32 bit integer, assuming it is a 32 bit integer.
     * @returns {number}
     */
    LongPrototype.toInt = function toInt() {
        return this.unsigned ? this.low >>> 0 : this.low;
    };
    
    /**
     * Converts the Long to a the nearest floating-point representation of this value (double, 53 bit mantissa).
     * @returns {number}
     */
    LongPrototype.toNumber = function toNumber() {
        if (this.unsigned)
            return ((this.high >>> 0) * TWO_PWR_32_DBL) + (this.low >>> 0);
        return this.high * TWO_PWR_32_DBL + (this.low >>> 0);
    };
    
    /**
     * Converts the Long to a string written in the specified radix.
     * @param {number=} radix Radix (2-36), defaults to 10
     * @returns {string}
     * @override
     * @throws {RangeError} If `radix` is out of range
     */
    LongPrototype.toString = function toString(radix) {
        radix = radix || 10;
        if (radix < 2 || 36 < radix)
            throw RangeError('radix');
        if (this.isZero())
            return '0';
        if (this.isNegative()) { // Unsigned Longs are never negative
            if (this.eq(MIN_VALUE)) {
                // We need to change the Long value before it can be negated, so we remove
                // the bottom-most digit in this base and then recurse to do the rest.
                var radixLong = fromNumber(radix),
                    div = this.div(radixLong),
                    rem1 = div.mul(radixLong).sub(this);
                return div.toString(radix) + rem1.toInt().toString(radix);
            } else
                return '-' + this.neg().toString(radix);
        }
    
        // Do several (6) digits each time through the loop, so as to
        // minimize the calls to the very expensive emulated div.
        var radixToPower = fromNumber(pow_dbl(radix, 6), this.unsigned),
            rem = this;
        var result = '';
        while (true) {
            var remDiv = rem.div(radixToPower),
                intval = rem.sub(remDiv.mul(radixToPower)).toInt() >>> 0,
                digits = intval.toString(radix);
            rem = remDiv;
            if (rem.isZero())
                return digits + result;
            else {
                while (digits.length < 6)
                    digits = '0' + digits;
                result = '' + digits + result;
            }
        }
    };
    
    /**
     * Gets the high 32 bits as a signed integer.
     * @returns {number} Signed high bits
     */
    LongPrototype.getHighBits = function getHighBits() {
        return this.high;
    };
    
    /**
     * Gets the high 32 bits as an unsigned integer.
     * @returns {number} Unsigned high bits
     */
    LongPrototype.getHighBitsUnsigned = function getHighBitsUnsigned() {
        return this.high >>> 0;
    };
    
    /**
     * Gets the low 32 bits as a signed integer.
     * @returns {number} Signed low bits
     */
    LongPrototype.getLowBits = function getLowBits() {
        return this.low;
    };
    
    /**
     * Gets the low 32 bits as an unsigned integer.
     * @returns {number} Unsigned low bits
     */
    LongPrototype.getLowBitsUnsigned = function getLowBitsUnsigned() {
        return this.low >>> 0;
    };
    
    /**
     * Gets the number of bits needed to represent the absolute value of this Long.
     * @returns {number}
     */
    LongPrototype.getNumBitsAbs = function getNumBitsAbs() {
        if (this.isNegative()) // Unsigned Longs are never negative
            return this.eq(MIN_VALUE) ? 64 : this.neg().getNumBitsAbs();
        var val = this.high != 0 ? this.high : this.low;
        for (var bit = 31; bit > 0; bit--)
            if ((val & (1 << bit)) != 0)
                break;
        return this.high != 0 ? bit + 33 : bit + 1;
    };
    
    /**
     * Tests if this Long's value equals zero.
     * @returns {boolean}
     */
    LongPrototype.isZero = function isZero() {
        return this.high === 0 && this.low === 0;
    };
    
    /**
     * Tests if this Long's value is negative.
     * @returns {boolean}
     */
    LongPrototype.isNegative = function isNegative() {
        return !this.unsigned && this.high < 0;
    };
    
    /**
     * Tests if this Long's value is positive.
     * @returns {boolean}
     */
    LongPrototype.isPositive = function isPositive() {
        return this.unsigned || this.high >= 0;
    };
    
    /**
     * Tests if this Long's value is odd.
     * @returns {boolean}
     */
    LongPrototype.isOdd = function isOdd() {
        return (this.low & 1) === 1;
    };
    
    /**
     * Tests if this Long's value is even.
     * @returns {boolean}
     */
    LongPrototype.isEven = function isEven() {
        return (this.low & 1) === 0;
    };
    
    /**
     * Tests if this Long's value equals the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.equals = function equals(other) {
        if (!isLong(other))
            other = fromValue(other);
        if (this.unsigned !== other.unsigned && (this.high >>> 31) === 1 && (other.high >>> 31) === 1)
            return false;
        return this.high === other.high && this.low === other.low;
    };
    
    /**
     * Tests if this Long's value equals the specified's. This is an alias of {@link Long#equals}.
     * @function
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.eq = LongPrototype.equals;
    
    /**
     * Tests if this Long's value differs from the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.notEquals = function notEquals(other) {
        return !this.eq(/* validates */ other);
    };
    
    /**
     * Tests if this Long's value differs from the specified's. This is an alias of {@link Long#notEquals}.
     * @function
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.neq = LongPrototype.notEquals;
    
    /**
     * Tests if this Long's value is less than the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.lessThan = function lessThan(other) {
        return this.comp(/* validates */ other) < 0;
    };
    
    /**
     * Tests if this Long's value is less than the specified's. This is an alias of {@link Long#lessThan}.
     * @function
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.lt = LongPrototype.lessThan;
    
    /**
     * Tests if this Long's value is less than or equal the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.lessThanOrEqual = function lessThanOrEqual(other) {
        return this.comp(/* validates */ other) <= 0;
    };
    
    /**
     * Tests if this Long's value is less than or equal the specified's. This is an alias of {@link Long#lessThanOrEqual}.
     * @function
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.lte = LongPrototype.lessThanOrEqual;
    
    /**
     * Tests if this Long's value is greater than the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.greaterThan = function greaterThan(other) {
        return this.comp(/* validates */ other) > 0;
    };
    
    /**
     * Tests if this Long's value is greater than the specified's. This is an alias of {@link Long#greaterThan}.
     * @function
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.gt = LongPrototype.greaterThan;
    
    /**
     * Tests if this Long's value is greater than or equal the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.greaterThanOrEqual = function greaterThanOrEqual(other) {
        return this.comp(/* validates */ other) >= 0;
    };
    
    /**
     * Tests if this Long's value is greater than or equal the specified's. This is an alias of {@link Long#greaterThanOrEqual}.
     * @function
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.gte = LongPrototype.greaterThanOrEqual;
    
    /**
     * Compares this Long's value with the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {number} 0 if they are the same, 1 if the this is greater and -1
     *  if the given one is greater
     */
    LongPrototype.compare = function compare(other) {
        if (!isLong(other))
            other = fromValue(other);
        if (this.eq(other))
            return 0;
        var thisNeg = this.isNegative(),
            otherNeg = other.isNegative();
        if (thisNeg && !otherNeg)
            return -1;
        if (!thisNeg && otherNeg)
            return 1;
        // At this point the sign bits are the same
        if (!this.unsigned)
            return this.sub(other).isNegative() ? -1 : 1;
        // Both are positive if at least one is unsigned
        return (other.high >>> 0) > (this.high >>> 0) || (other.high === this.high && (other.low >>> 0) > (this.low >>> 0)) ? -1 : 1;
    };
    
    /**
     * Compares this Long's value with the specified's. This is an alias of {@link Long#compare}.
     * @function
     * @param {!Long|number|string} other Other value
     * @returns {number} 0 if they are the same, 1 if the this is greater and -1
     *  if the given one is greater
     */
    LongPrototype.comp = LongPrototype.compare;
    
    /**
     * Negates this Long's value.
     * @returns {!Long} Negated Long
     */
    LongPrototype.negate = function negate() {
        if (!this.unsigned && this.eq(MIN_VALUE))
            return MIN_VALUE;
        return this.not().add(ONE);
    };
    
    /**
     * Negates this Long's value. This is an alias of {@link Long#negate}.
     * @function
     * @returns {!Long} Negated Long
     */
    LongPrototype.neg = LongPrototype.negate;
    
    /**
     * Returns the sum of this and the specified Long.
     * @param {!Long|number|string} addend Addend
     * @returns {!Long} Sum
     */
    LongPrototype.add = function add(addend) {
        if (!isLong(addend))
            addend = fromValue(addend);
    
        // Divide each number into 4 chunks of 16 bits, and then sum the chunks.
    
        var a48 = this.high >>> 16;
        var a32 = this.high & 0xFFFF;
        var a16 = this.low >>> 16;
        var a00 = this.low & 0xFFFF;
    
        var b48 = addend.high >>> 16;
        var b32 = addend.high & 0xFFFF;
        var b16 = addend.low >>> 16;
        var b00 = addend.low & 0xFFFF;
    
        var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
        c00 += a00 + b00;
        c16 += c00 >>> 16;
        c00 &= 0xFFFF;
        c16 += a16 + b16;
        c32 += c16 >>> 16;
        c16 &= 0xFFFF;
        c32 += a32 + b32;
        c48 += c32 >>> 16;
        c32 &= 0xFFFF;
        c48 += a48 + b48;
        c48 &= 0xFFFF;
        return fromBits((c16 << 16) | c00, (c48 << 16) | c32, this.unsigned);
    };
    
    /**
     * Returns the difference of this and the specified Long.
     * @param {!Long|number|string} subtrahend Subtrahend
     * @returns {!Long} Difference
     */
    LongPrototype.subtract = function subtract(subtrahend) {
        if (!isLong(subtrahend))
            subtrahend = fromValue(subtrahend);
        return this.add(subtrahend.neg());
    };
    
    /**
     * Returns the difference of this and the specified Long. This is an alias of {@link Long#subtract}.
     * @function
     * @param {!Long|number|string} subtrahend Subtrahend
     * @returns {!Long} Difference
     */
    LongPrototype.sub = LongPrototype.subtract;
    
    /**
     * Returns the product of this and the specified Long.
     * @param {!Long|number|string} multiplier Multiplier
     * @returns {!Long} Product
     */
    LongPrototype.multiply = function multiply(multiplier) {
        if (this.isZero())
            return ZERO;
        if (!isLong(multiplier))
            multiplier = fromValue(multiplier);
        if (multiplier.isZero())
            return ZERO;
        if (this.eq(MIN_VALUE))
            return multiplier.isOdd() ? MIN_VALUE : ZERO;
        if (multiplier.eq(MIN_VALUE))
            return this.isOdd() ? MIN_VALUE : ZERO;
    
        if (this.isNegative()) {
            if (multiplier.isNegative())
                return this.neg().mul(multiplier.neg());
            else
                return this.neg().mul(multiplier).neg();
        } else if (multiplier.isNegative())
            return this.mul(multiplier.neg()).neg();
    
        // If both longs are small, use float multiplication
        if (this.lt(TWO_PWR_24) && multiplier.lt(TWO_PWR_24))
            return fromNumber(this.toNumber() * multiplier.toNumber(), this.unsigned);
    
        // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
        // We can skip products that would overflow.
    
        var a48 = this.high >>> 16;
        var a32 = this.high & 0xFFFF;
        var a16 = this.low >>> 16;
        var a00 = this.low & 0xFFFF;
    
        var b48 = multiplier.high >>> 16;
        var b32 = multiplier.high & 0xFFFF;
        var b16 = multiplier.low >>> 16;
        var b00 = multiplier.low & 0xFFFF;
    
        var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
        c00 += a00 * b00;
        c16 += c00 >>> 16;
        c00 &= 0xFFFF;
        c16 += a16 * b00;
        c32 += c16 >>> 16;
        c16 &= 0xFFFF;
        c16 += a00 * b16;
        c32 += c16 >>> 16;
        c16 &= 0xFFFF;
        c32 += a32 * b00;
        c48 += c32 >>> 16;
        c32 &= 0xFFFF;
        c32 += a16 * b16;
        c48 += c32 >>> 16;
        c32 &= 0xFFFF;
        c32 += a00 * b32;
        c48 += c32 >>> 16;
        c32 &= 0xFFFF;
        c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
        c48 &= 0xFFFF;
        return fromBits((c16 << 16) | c00, (c48 << 16) | c32, this.unsigned);
    };
    
    /**
     * Returns the product of this and the specified Long. This is an alias of {@link Long#multiply}.
     * @function
     * @param {!Long|number|string} multiplier Multiplier
     * @returns {!Long} Product
     */
    LongPrototype.mul = LongPrototype.multiply;
    
    /**
     * Returns this Long divided by the specified. The result is signed if this Long is signed or
     *  unsigned if this Long is unsigned.
     * @param {!Long|number|string} divisor Divisor
     * @returns {!Long} Quotient
     */
    LongPrototype.divide = function divide(divisor) {
        if (!isLong(divisor))
            divisor = fromValue(divisor);
        if (divisor.isZero())
            throw Error('division by zero');
        if (this.isZero())
            return this.unsigned ? UZERO : ZERO;
        var approx, rem, res;
        if (!this.unsigned) {
            // This section is only relevant for signed longs and is derived from the
            // closure library as a whole.
            if (this.eq(MIN_VALUE)) {
                if (divisor.eq(ONE) || divisor.eq(NEG_ONE))
                    return MIN_VALUE;  // recall that -MIN_VALUE == MIN_VALUE
                else if (divisor.eq(MIN_VALUE))
                    return ONE;
                else {
                    // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
                    var halfThis = this.shr(1);
                    approx = halfThis.div(divisor).shl(1);
                    if (approx.eq(ZERO)) {
                        return divisor.isNegative() ? ONE : NEG_ONE;
                    } else {
                        rem = this.sub(divisor.mul(approx));
                        res = approx.add(rem.div(divisor));
                        return res;
                    }
                }
            } else if (divisor.eq(MIN_VALUE))
                return this.unsigned ? UZERO : ZERO;
            if (this.isNegative()) {
                if (divisor.isNegative())
                    return this.neg().div(divisor.neg());
                return this.neg().div(divisor).neg();
            } else if (divisor.isNegative())
                return this.div(divisor.neg()).neg();
            res = ZERO;
        } else {
            // The algorithm below has not been made for unsigned longs. It's therefore
            // required to take special care of the MSB prior to running it.
            if (!divisor.unsigned)
                divisor = divisor.toUnsigned();
            if (divisor.gt(this))
                return UZERO;
            if (divisor.gt(this.shru(1))) // 15 >>> 1 = 7 ; with divisor = 8 ; true
                return UONE;
            res = UZERO;
        }
    
        // Repeat the following until the remainder is less than other:  find a
        // floating-point that approximates remainder / other *from below*, add this
        // into the result, and subtract it from the remainder.  It is critical that
        // the approximate value is less than or equal to the real value so that the
        // remainder never becomes negative.
        rem = this;
        while (rem.gte(divisor)) {
            // Approximate the result of division. This may be a little greater or
            // smaller than the actual value.
            approx = Math.max(1, Math.floor(rem.toNumber() / divisor.toNumber()));
    
            // We will tweak the approximate result by changing it in the 48-th digit or
            // the smallest non-fractional digit, whichever is larger.
            var log2 = Math.ceil(Math.log(approx) / Math.LN2),
                delta = (log2 <= 48) ? 1 : pow_dbl(2, log2 - 48),
    
                // Decrease the approximation until it is smaller than the remainder.  Note
                // that if it is too large, the product overflows and is negative.
                approxRes = fromNumber(approx),
                approxRem = approxRes.mul(divisor);
            while (approxRem.isNegative() || approxRem.gt(rem)) {
                approx -= delta;
                approxRes = fromNumber(approx, this.unsigned);
                approxRem = approxRes.mul(divisor);
            }
    
            // We know the answer can't be zero... and actually, zero would cause
            // infinite recursion since we would make no progress.
            if (approxRes.isZero())
                approxRes = ONE;
    
            res = res.add(approxRes);
            rem = rem.sub(approxRem);
        }
        return res;
    };
    
    /**
     * Returns this Long divided by the specified. This is an alias of {@link Long#divide}.
     * @function
     * @param {!Long|number|string} divisor Divisor
     * @returns {!Long} Quotient
     */
    LongPrototype.div = LongPrototype.divide;
    
    /**
     * Returns this Long modulo the specified.
     * @param {!Long|number|string} divisor Divisor
     * @returns {!Long} Remainder
     */
    LongPrototype.modulo = function modulo(divisor) {
        if (!isLong(divisor))
            divisor = fromValue(divisor);
        return this.sub(this.div(divisor).mul(divisor));
    };
    
    /**
     * Returns this Long modulo the specified. This is an alias of {@link Long#modulo}.
     * @function
     * @param {!Long|number|string} divisor Divisor
     * @returns {!Long} Remainder
     */
    LongPrototype.mod = LongPrototype.modulo;
    
    /**
     * Returns the bitwise NOT of this Long.
     * @returns {!Long}
     */
    LongPrototype.not = function not() {
        return fromBits(~this.low, ~this.high, this.unsigned);
    };
    
    /**
     * Returns the bitwise AND of this Long and the specified.
     * @param {!Long|number|string} other Other Long
     * @returns {!Long}
     */
    LongPrototype.and = function and(other) {
        if (!isLong(other))
            other = fromValue(other);
        return fromBits(this.low & other.low, this.high & other.high, this.unsigned);
    };
    
    /**
     * Returns the bitwise OR of this Long and the specified.
     * @param {!Long|number|string} other Other Long
     * @returns {!Long}
     */
    LongPrototype.or = function or(other) {
        if (!isLong(other))
            other = fromValue(other);
        return fromBits(this.low | other.low, this.high | other.high, this.unsigned);
    };
    
    /**
     * Returns the bitwise XOR of this Long and the given one.
     * @param {!Long|number|string} other Other Long
     * @returns {!Long}
     */
    LongPrototype.xor = function xor(other) {
        if (!isLong(other))
            other = fromValue(other);
        return fromBits(this.low ^ other.low, this.high ^ other.high, this.unsigned);
    };
    
    /**
     * Returns this Long with bits shifted to the left by the given amount.
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     */
    LongPrototype.shiftLeft = function shiftLeft(numBits) {
        if (isLong(numBits))
            numBits = numBits.toInt();
        if ((numBits &= 63) === 0)
            return this;
        else if (numBits < 32)
            return fromBits(this.low << numBits, (this.high << numBits) | (this.low >>> (32 - numBits)), this.unsigned);
        else
            return fromBits(0, this.low << (numBits - 32), this.unsigned);
    };
    
    /**
     * Returns this Long with bits shifted to the left by the given amount. This is an alias of {@link Long#shiftLeft}.
     * @function
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     */
    LongPrototype.shl = LongPrototype.shiftLeft;
    
    /**
     * Returns this Long with bits arithmetically shifted to the right by the given amount.
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     */
    LongPrototype.shiftRight = function shiftRight(numBits) {
        if (isLong(numBits))
            numBits = numBits.toInt();
        if ((numBits &= 63) === 0)
            return this;
        else if (numBits < 32)
            return fromBits((this.low >>> numBits) | (this.high << (32 - numBits)), this.high >> numBits, this.unsigned);
        else
            return fromBits(this.high >> (numBits - 32), this.high >= 0 ? 0 : -1, this.unsigned);
    };
    
    /**
     * Returns this Long with bits arithmetically shifted to the right by the given amount. This is an alias of {@link Long#shiftRight}.
     * @function
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     */
    LongPrototype.shr = LongPrototype.shiftRight;
    
    /**
     * Returns this Long with bits logically shifted to the right by the given amount.
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     */
    LongPrototype.shiftRightUnsigned = function shiftRightUnsigned(numBits) {
        if (isLong(numBits))
            numBits = numBits.toInt();
        numBits &= 63;
        if (numBits === 0)
            return this;
        else {
            var high = this.high;
            if (numBits < 32) {
                var low = this.low;
                return fromBits((low >>> numBits) | (high << (32 - numBits)), high >>> numBits, this.unsigned);
            } else if (numBits === 32)
                return fromBits(high, 0, this.unsigned);
            else
                return fromBits(high >>> (numBits - 32), 0, this.unsigned);
        }
    };
    
    /**
     * Returns this Long with bits logically shifted to the right by the given amount. This is an alias of {@link Long#shiftRightUnsigned}.
     * @function
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     */
    LongPrototype.shru = LongPrototype.shiftRightUnsigned;
    
    /**
     * Converts this Long to signed.
     * @returns {!Long} Signed long
     */
    LongPrototype.toSigned = function toSigned() {
        if (!this.unsigned)
            return this;
        return fromBits(this.low, this.high, false);
    };
    
    /**
     * Converts this Long to unsigned.
     * @returns {!Long} Unsigned long
     */
    LongPrototype.toUnsigned = function toUnsigned() {
        if (this.unsigned)
            return this;
        return fromBits(this.low, this.high, true);
    };
    
    /**
     * Converts this Long to its byte representation.
     * @param {boolean=} le Whether little or big endian, defaults to big endian
     * @returns {!Array.<number>} Byte representation
     */
    LongPrototype.toBytes = function (le) {
        return le ? this.toBytesLE() : this.toBytesBE();
    }
    
    /**
     * Converts this Long to its little endian byte representation.
     * @returns {!Array.<number>} Little endian byte representation
     */
    LongPrototype.toBytesLE = function () {
        var hi = this.high,
            lo = this.low;
        return [
            lo & 0xff,
            (lo >>> 8) & 0xff,
            (lo >>> 16) & 0xff,
            (lo >>> 24) & 0xff,
            hi & 0xff,
            (hi >>> 8) & 0xff,
            (hi >>> 16) & 0xff,
            (hi >>> 24) & 0xff
        ];
    }
    
    /**
     * Converts this Long to its big endian byte representation.
     * @returns {!Array.<number>} Big endian byte representation
     */
    LongPrototype.toBytesBE = function () {
        var hi = this.high,
            lo = this.low;
        return [
            (hi >>> 24) & 0xff,
            (hi >>> 16) & 0xff,
            (hi >>> 8) & 0xff,
            hi & 0xff,
            (lo >>> 24) & 0xff,
            (lo >>> 16) & 0xff,
            (lo >>> 8) & 0xff,
            lo & 0xff
        ];
    }
    
/**
 * Constructs a new ByteBuffer.
 * @class The swiss army knife for binary data in JavaScript.
 * @exports ByteBuffer
 * @constructor
 * @param {number=} capacity Initial capacity. Defaults to {@link ByteBuffer.DEFAULT_CAPACITY}.
 * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
 *  {@link ByteBuffer.DEFAULT_ENDIAN}.
 * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
 *  {@link ByteBuffer.DEFAULT_NOASSERT}.
 * @expose
 */
var ByteBuffer = function (capacity, littleEndian, noAssert) {
    if (typeof capacity === 'undefined')
        capacity = ByteBuffer.DEFAULT_CAPACITY;
    if (typeof littleEndian === 'undefined')
        littleEndian = ByteBuffer.DEFAULT_ENDIAN;
    if (typeof noAssert === 'undefined')
        noAssert = ByteBuffer.DEFAULT_NOASSERT;
    if (!noAssert) {
        capacity = capacity | 0;
        if (capacity < 0)
            throw RangeError("Illegal capacity");
        littleEndian = !!littleEndian;
        noAssert = !!noAssert;
    }

    /**
     * Backing ArrayBuffer.
     * @type {!ArrayBuffer}
     * @expose
     */
    this.buffer = capacity === 0 ? EMPTY_BUFFER : new ArrayBuffer(capacity);

    /**
     * Uint8Array utilized to manipulate the backing buffer. Becomes `null` if the backing buffer has a capacity of `0`.
     * @type {?Uint8Array}
     * @expose
     */
    this.view = capacity === 0 ? null : new Uint8Array(this.buffer);

    /**
     * Absolute read/write offset.
     * @type {number}
     * @expose
     * @see ByteBuffer#flip
     * @see ByteBuffer#clear
     */
    this.offset = 0;

    /**
     * Marked offset.
     * @type {number}
     * @expose
     * @see ByteBuffer#mark
     * @see ByteBuffer#reset
     */
    this.markedOffset = -1;

    /**
     * Absolute limit of the contained data. Set to the backing buffer's capacity upon allocation.
     * @type {number}
     * @expose
     * @see ByteBuffer#flip
     * @see ByteBuffer#clear
     */
    this.limit = capacity;

    /**
     * Whether to use little endian byte order, defaults to `false` for big endian.
     * @type {boolean}
     * @expose
     */
    this.littleEndian = littleEndian;

    /**
     * Whether to skip assertions of offsets and values, defaults to `false`.
     * @type {boolean}
     * @expose
     */
    this.noAssert = noAssert;
};

/**
 * ByteBuffer version.
 * @type {string}
 * @const
 * @expose
 */
ByteBuffer.VERSION = "5.0.1";

/**
 * Little endian constant that can be used instead of its boolean value. Evaluates to `true`.
 * @type {boolean}
 * @const
 * @expose
 */
ByteBuffer.LITTLE_ENDIAN = true;

/**
 * Big endian constant that can be used instead of its boolean value. Evaluates to `false`.
 * @type {boolean}
 * @const
 * @expose
 */
ByteBuffer.BIG_ENDIAN = false;

/**
 * Default initial capacity of `16`.
 * @type {number}
 * @expose
 */
ByteBuffer.DEFAULT_CAPACITY = 16;

/**
 * Default endianess of `false` for big endian.
 * @type {boolean}
 * @expose
 */
ByteBuffer.DEFAULT_ENDIAN = ByteBuffer.BIG_ENDIAN;

/**
 * Default no assertions flag of `false`.
 * @type {boolean}
 * @expose
 */
ByteBuffer.DEFAULT_NOASSERT = false;

/**
 * A `Long` class for representing a 64-bit two's-complement integer value. May be `null` if Long.js has not been loaded
 *  and int64 support is not available.
 * @type {?Long}
 * @const
 * @see https://github.com/dcodeIO/long.js
 * @expose
 */
ByteBuffer.Long = Long || null;

/**
 * @alias ByteBuffer.prototype
 * @inner
 */
var ByteBufferPrototype = ByteBuffer.prototype;

/**
 * An indicator used to reliably determine if an object is a ByteBuffer or not.
 * @type {boolean}
 * @const
 * @expose
 * @private
 */
ByteBufferPrototype.__isByteBuffer__;

Object.defineProperty(ByteBufferPrototype, "__isByteBuffer__", {
    value: true,
    enumerable: false,
    configurable: false
});

// helpers

/**
 * @type {!ArrayBuffer}
 * @inner
 */
var EMPTY_BUFFER = new ArrayBuffer(0);

/**
 * String.fromCharCode reference for compile-time renaming.
 * @type {function(...number):string}
 * @inner
 */
var stringFromCharCode = String.fromCharCode;

/**
 * Creates a source function for a string.
 * @param {string} s String to read from
 * @returns {function():number|null} Source function returning the next char code respectively `null` if there are
 *  no more characters left.
 * @throws {TypeError} If the argument is invalid
 * @inner
 */
function stringSource(s) {
    var i = 0;
    return function () {
        return i < s.length ? s.charCodeAt(i++) : null;
    };
}

/**
 * Creates a destination function for a string.
 * @returns {function(number=):undefined|string} Destination function successively called with the next char code.
 *  Returns the final string when called without arguments.
 * @inner
 */
function stringDestination() {
    var cs = [], ps = [];
    return function () {
        if (arguments.length === 0)
            return ps.join('') + stringFromCharCode.apply(String, cs);
        if (cs.length + arguments.length > 1024)
            ps.push(stringFromCharCode.apply(String, cs)),
                cs.length = 0;
        Array.prototype.push.apply(cs, arguments);
    };
}

/**
 * Gets the accessor type.
 * @returns {Function} `Buffer` under node.js, `Uint8Array` respectively `DataView` in the browser (classes)
 * @expose
 */
ByteBuffer.accessor = function () {
    return Uint8Array;
};
/**
 * Allocates a new ByteBuffer backed by a buffer of the specified capacity.
 * @param {number=} capacity Initial capacity. Defaults to {@link ByteBuffer.DEFAULT_CAPACITY}.
 * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
 *  {@link ByteBuffer.DEFAULT_ENDIAN}.
 * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
 *  {@link ByteBuffer.DEFAULT_NOASSERT}.
 * @returns {!ByteBuffer}
 * @expose
 */
ByteBuffer.allocate = function (capacity, littleEndian, noAssert) {
    return new ByteBuffer(capacity, littleEndian, noAssert);
};

/**
 * Concatenates multiple ByteBuffers into one.
 * @param {!Array.<!ByteBuffer|!ArrayBuffer|!Uint8Array|string>} buffers Buffers to concatenate
 * @param {(string|boolean)=} encoding String encoding if `buffers` contains a string ("base64", "hex", "binary",
 *  defaults to "utf8")
 * @param {boolean=} littleEndian Whether to use little or big endian byte order for the resulting ByteBuffer. Defaults
 *  to {@link ByteBuffer.DEFAULT_ENDIAN}.
 * @param {boolean=} noAssert Whether to skip assertions of offsets and values for the resulting ByteBuffer. Defaults to
 *  {@link ByteBuffer.DEFAULT_NOASSERT}.
 * @returns {!ByteBuffer} Concatenated ByteBuffer
 * @expose
 */
ByteBuffer.concat = function (buffers, encoding, littleEndian, noAssert) {
    if (typeof encoding === 'boolean' || typeof encoding !== 'string') {
        noAssert = littleEndian;
        littleEndian = encoding;
        encoding = undefined;
    }
    var capacity = 0;
    for (var i = 0, k = buffers.length, length; i < k; ++i) {
        if (!ByteBuffer.isByteBuffer(buffers[i]))
            buffers[i] = ByteBuffer.wrap(buffers[i], encoding);
        length = buffers[i].limit - buffers[i].offset;
        if (length > 0) capacity += length;
    }
    if (capacity === 0)
        return new ByteBuffer(0, littleEndian, noAssert);
    var bb = new ByteBuffer(capacity, littleEndian, noAssert),
        bi;
    i = 0;
    while (i < k) {
        bi = buffers[i++];
        length = bi.limit - bi.offset;
        if (length <= 0) continue;
        bb.view.set(bi.view.subarray(bi.offset, bi.limit), bb.offset);
        bb.offset += length;
    }
    bb.limit = bb.offset;
    bb.offset = 0;
    return bb;
};

/**
 * Tests if the specified type is a ByteBuffer.
 * @param {*} bb ByteBuffer to test
 * @returns {boolean} `true` if it is a ByteBuffer, otherwise `false`
 * @expose
 */
ByteBuffer.isByteBuffer = function (bb) {
    return (bb && bb["__isByteBuffer__"]) === true;
};
/**
 * Gets the backing buffer type.
 * @returns {Function} `Buffer` under node.js, `ArrayBuffer` in the browser (classes)
 * @expose
 */
ByteBuffer.type = function () {
    return ArrayBuffer;
};
/**
 * Wraps a buffer or a string. Sets the allocated ByteBuffer's {@link ByteBuffer#offset} to `0` and its
 *  {@link ByteBuffer#limit} to the length of the wrapped data.
 * @param {!ByteBuffer|!ArrayBuffer|!Uint8Array|string|!Array.<number>} buffer Anything that can be wrapped
 * @param {(string|boolean)=} encoding String encoding if `buffer` is a string ("base64", "hex", "binary", defaults to
 *  "utf8")
 * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
 *  {@link ByteBuffer.DEFAULT_ENDIAN}.
 * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
 *  {@link ByteBuffer.DEFAULT_NOASSERT}.
 * @returns {!ByteBuffer} A ByteBuffer wrapping `buffer`
 * @expose
 */
ByteBuffer.wrap = function (buffer, encoding, littleEndian, noAssert) {
    if (typeof encoding !== 'string') {
        noAssert = littleEndian;
        littleEndian = encoding;
        encoding = undefined;
    }
    if (typeof buffer === 'string') {
        if (typeof encoding === 'undefined')
            encoding = "utf8";
        switch (encoding) {
            case "base64":
                return ByteBuffer.fromBase64(buffer, littleEndian);
            case "hex":
                return ByteBuffer.fromHex(buffer, littleEndian);
            case "binary":
                return ByteBuffer.fromBinary(buffer, littleEndian);
            case "utf8":
                return ByteBuffer.fromUTF8(buffer, littleEndian);
            case "debug":
                return ByteBuffer.fromDebug(buffer, littleEndian);
            default:
                throw Error("Unsupported encoding: " + encoding);
        }
    }
    if (buffer === null || typeof buffer !== 'object')
        throw TypeError("Illegal buffer");
    var bb;
    if (ByteBuffer.isByteBuffer(buffer)) {
        bb = ByteBufferPrototype.clone.call(buffer);
        bb.markedOffset = -1;
        return bb;
    }
    if (buffer instanceof Uint8Array) { // Extract ArrayBuffer from Uint8Array
        bb = new ByteBuffer(0, littleEndian, noAssert);
        if (buffer.length > 0) { // Avoid references to more than one EMPTY_BUFFER
            bb.buffer = buffer.buffer;
            bb.offset = buffer.byteOffset;
            bb.limit = buffer.byteOffset + buffer.byteLength;
            bb.view = new Uint8Array(buffer.buffer);
        }
    } else if (buffer instanceof ArrayBuffer) { // Reuse ArrayBuffer
        bb = new ByteBuffer(0, littleEndian, noAssert);
        if (buffer.byteLength > 0) {
            bb.buffer = buffer;
            bb.offset = 0;
            bb.limit = buffer.byteLength;
            bb.view = buffer.byteLength > 0 ? new Uint8Array(buffer) : null;
        }
    } else if (Object.prototype.toString.call(buffer) === "[object Array]") { // Create from octets
        bb = new ByteBuffer(buffer.length, littleEndian, noAssert);
        bb.limit = buffer.length;
        for (var i = 0; i < buffer.length; ++i)
            bb.view[i] = buffer[i];
    } else
        throw TypeError("Illegal buffer"); // Otherwise fail
    return bb;
};

/**
 * Writes the array as a bitset.
 * @param {Array<boolean>} value Array of booleans to write
 * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `length` if omitted.
 * @returns {!ByteBuffer}
 * @expose
 */
ByteBufferPrototype.writeBitSet = function (value, offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
        if (!(value instanceof Array))
            throw TypeError("Illegal BitSet: Not an array");
        if (typeof offset !== 'number' || offset % 1 !== 0)
            throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength)
            throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
    }

    var start = offset,
        bits = value.length,
        bytes = (bits >> 3),
        bit = 0,
        k;

    offset += this.writeVarint32(bits, offset);

    while (bytes--) {
        k = (!!value[bit++] & 1) |
            ((!!value[bit++] & 1) << 1) |
            ((!!value[bit++] & 1) << 2) |
            ((!!value[bit++] & 1) << 3) |
            ((!!value[bit++] & 1) << 4) |
            ((!!value[bit++] & 1) << 5) |
            ((!!value[bit++] & 1) << 6) |
            ((!!value[bit++] & 1) << 7);
        this.writeByte(k, offset++);
    }

    if (bit < bits) {
        var m = 0;
        k = 0;
        while (bit < bits) k = k | ((!!value[bit++] & 1) << (m++));
        this.writeByte(k, offset++);
    }

    if (relative) {
        this.offset = offset;
        return this;
    }
    return offset - start;
}

/**
 * Reads a BitSet as an array of booleans.
 * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `length` if omitted.
 * @returns {Array<boolean>
 * @expose
 */
ByteBufferPrototype.readBitSet = function (offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;

    var ret = this.readVarint32(offset),
        bits = ret.value,
        bytes = (bits >> 3),
        bit = 0,
        value = [],
        k;

    offset += ret.length;

    while (bytes--) {
        k = this.readByte(offset++);
        value[bit++] = !!(k & 0x01);
        value[bit++] = !!(k & 0x02);
        value[bit++] = !!(k & 0x04);
        value[bit++] = !!(k & 0x08);
        value[bit++] = !!(k & 0x10);
        value[bit++] = !!(k & 0x20);
        value[bit++] = !!(k & 0x40);
        value[bit++] = !!(k & 0x80);
    }

    if (bit < bits) {
        var m = 0;
        k = this.readByte(offset++);
        while (bit < bits) value[bit++] = !!((k >> (m++)) & 1);
    }

    if (relative) {
        this.offset = offset;
    }
    return value;
}
/**
 * Reads the specified number of bytes.
 * @param {number} length Number of bytes to read
 * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `length` if omitted.
 * @returns {!ByteBuffer}
 * @expose
 */
ByteBufferPrototype.readBytes = function (length, offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0)
            throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + length > this.buffer.byteLength)
            throw RangeError("Illegal offset: 0 <= " + offset + " (+" + length + ") <= " + this.buffer.byteLength);
    }
    var slice = this.slice(offset, offset + length);
    if (relative) this.offset += length;
    return slice;
};



// types/ints/int8

/**
 * Writes an 8bit signed integer.
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
 * @returns {!ByteBuffer} this
 * @expose
 */
ByteBufferPrototype.writeInt8 = function (value, offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
        if (typeof value !== 'number' || value % 1 !== 0)
            throw TypeError("Illegal value: " + value + " (not an integer)");
        value |= 0;
        if (typeof offset !== 'number' || offset % 1 !== 0)
            throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength)
            throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
    }
    offset += 1;
    var capacity0 = this.buffer.byteLength;
    if (offset > capacity0)
        this.resize((capacity0 *= 2) > offset ? capacity0 : offset);
    offset -= 1;
    this.view[offset] = value;
    if (relative) this.offset += 1;
    return this;
};

/**
 * Writes an 8bit signed integer. This is an alias of {@link ByteBuffer#writeInt8}.
 * @function
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
 * @returns {!ByteBuffer} this
 * @expose
 */
ByteBufferPrototype.writeByte = ByteBufferPrototype.writeInt8;

/**
 * Reads an 8bit signed integer.
 * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
 * @returns {number} Value read
 * @expose
 */
ByteBufferPrototype.readInt8 = function (offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0)
            throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 1 > this.buffer.byteLength)
            throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 1 + ") <= " + this.buffer.byteLength);
    }
    var value = this.view[offset];
    if ((value & 0x80) === 0x80) value = -(0xFF - value + 1); // Cast to signed
    if (relative) this.offset += 1;
    return value;
};

/**
 * Reads an 8bit signed integer. This is an alias of {@link ByteBuffer#readInt8}.
 * @function
 * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
 * @returns {number} Value read
 * @expose
 */
ByteBufferPrototype.readByte = ByteBufferPrototype.readInt8;

/**
 * Writes an 8bit unsigned integer.
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
 * @returns {!ByteBuffer} this
 * @expose
 */
ByteBufferPrototype.writeUint8 = function (value, offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
        if (typeof value !== 'number' || value % 1 !== 0)
            throw TypeError("Illegal value: " + value + " (not an integer)");
        value >>>= 0;
        if (typeof offset !== 'number' || offset % 1 !== 0)
            throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength)
            throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
    }
    offset += 1;
    var capacity1 = this.buffer.byteLength;
    if (offset > capacity1)
        this.resize((capacity1 *= 2) > offset ? capacity1 : offset);
    offset -= 1;
    this.view[offset] = value;
    if (relative) this.offset += 1;
    return this;
};

/**
 * Writes an 8bit unsigned integer. This is an alias of {@link ByteBuffer#writeUint8}.
 * @function
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
 * @returns {!ByteBuffer} this
 * @expose
 */
ByteBufferPrototype.writeUInt8 = ByteBufferPrototype.writeUint8;

/**
 * Reads an 8bit unsigned integer.
 * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
 * @returns {number} Value read
 * @expose
 */
ByteBufferPrototype.readUint8 = function (offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0)
            throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 1 > this.buffer.byteLength)
            throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 1 + ") <= " + this.buffer.byteLength);
    }
    var value = this.view[offset];
    if (relative) this.offset += 1;
    return value;
};

/**
 * Reads an 8bit unsigned integer. This is an alias of {@link ByteBuffer#readUint8}.
 * @function
 * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
 * @returns {number} Value read
 * @expose
 */
ByteBufferPrototype.readUInt8 = ByteBufferPrototype.readUint8;

// types/ints/int16

/**
 * Writes a 16bit signed integer.
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
 * @throws {TypeError} If `offset` or `value` is not a valid number
 * @throws {RangeError} If `offset` is out of bounds
 * @expose
 */
ByteBufferPrototype.writeInt16 = function (value, offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
        if (typeof value !== 'number' || value % 1 !== 0)
            throw TypeError("Illegal value: " + value + " (not an integer)");
        value |= 0;
        if (typeof offset !== 'number' || offset % 1 !== 0)
            throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength)
            throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
    }
    offset += 2;
    var capacity2 = this.buffer.byteLength;
    if (offset > capacity2)
        this.resize((capacity2 *= 2) > offset ? capacity2 : offset);
    offset -= 2;
    if (this.littleEndian) {
        this.view[offset + 1] = (value & 0xFF00) >>> 8;
        this.view[offset] = value & 0x00FF;
    } else {
        this.view[offset] = (value & 0xFF00) >>> 8;
        this.view[offset + 1] = value & 0x00FF;
    }
    if (relative) this.offset += 2;
    return this;
};

/**
 * Writes a 16bit signed integer. This is an alias of {@link ByteBuffer#writeInt16}.
 * @function
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
 * @throws {TypeError} If `offset` or `value` is not a valid number
 * @throws {RangeError} If `offset` is out of bounds
 * @expose
 */
ByteBufferPrototype.writeShort = ByteBufferPrototype.writeInt16;

/**
 * Reads a 16bit signed integer.
 * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
 * @returns {number} Value read
 * @throws {TypeError} If `offset` is not a valid number
 * @throws {RangeError} If `offset` is out of bounds
 * @expose
 */
ByteBufferPrototype.readInt16 = function (offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0)
            throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 2 > this.buffer.byteLength)
            throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 2 + ") <= " + this.buffer.byteLength);
    }
    var value = 0;
    if (this.littleEndian) {
        value = this.view[offset];
        value |= this.view[offset + 1] << 8;
    } else {
        value = this.view[offset] << 8;
        value |= this.view[offset + 1];
    }
    if ((value & 0x8000) === 0x8000) value = -(0xFFFF - value + 1); // Cast to signed
    if (relative) this.offset += 2;
    return value;
};

/**
 * Reads a 16bit signed integer. This is an alias of {@link ByteBuffer#readInt16}.
 * @function
 * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
 * @returns {number} Value read
 * @throws {TypeError} If `offset` is not a valid number
 * @throws {RangeError} If `offset` is out of bounds
 * @expose
 */
ByteBufferPrototype.readShort = ByteBufferPrototype.readInt16;

/**
 * Writes a 16bit unsigned integer.
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
 * @throws {TypeError} If `offset` or `value` is not a valid number
 * @throws {RangeError} If `offset` is out of bounds
 * @expose
 */
ByteBufferPrototype.writeUint16 = function (value, offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
        if (typeof value !== 'number' || value % 1 !== 0)
            throw TypeError("Illegal value: " + value + " (not an integer)");
        value >>>= 0;
        if (typeof offset !== 'number' || offset % 1 !== 0)
            throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength)
            throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
    }
    offset += 2;
    var capacity3 = this.buffer.byteLength;
    if (offset > capacity3)
        this.resize((capacity3 *= 2) > offset ? capacity3 : offset);
    offset -= 2;
    if (this.littleEndian) {
        this.view[offset + 1] = (value & 0xFF00) >>> 8;
        this.view[offset] = value & 0x00FF;
    } else {
        this.view[offset] = (value & 0xFF00) >>> 8;
        this.view[offset + 1] = value & 0x00FF;
    }
    if (relative) this.offset += 2;
    return this;
};

/**
 * Writes a 16bit unsigned integer. This is an alias of {@link ByteBuffer#writeUint16}.
 * @function
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
 * @throws {TypeError} If `offset` or `value` is not a valid number
 * @throws {RangeError} If `offset` is out of bounds
 * @expose
 */
ByteBufferPrototype.writeUInt16 = ByteBufferPrototype.writeUint16;

/**
 * Reads a 16bit unsigned integer.
 * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
 * @returns {number} Value read
 * @throws {TypeError} If `offset` is not a valid number
 * @throws {RangeError} If `offset` is out of bounds
 * @expose
 */
ByteBufferPrototype.readUint16 = function (offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0)
            throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 2 > this.buffer.byteLength)
            throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 2 + ") <= " + this.buffer.byteLength);
    }
    var value = 0;
    if (this.littleEndian) {
        value = this.view[offset];
        value |= this.view[offset + 1] << 8;
    } else {
        value = this.view[offset] << 8;
        value |= this.view[offset + 1];
    }
    if (relative) this.offset += 2;
    return value;
};

/**
 * Reads a 16bit unsigned integer. This is an alias of {@link ByteBuffer#readUint16}.
 * @function
 * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
 * @returns {number} Value read
 * @throws {TypeError} If `offset` is not a valid number
 * @throws {RangeError} If `offset` is out of bounds
 * @expose
 */
ByteBufferPrototype.readUInt16 = ByteBufferPrototype.readUint16;

// types/ints/int32

/**
 * Writes a 32bit signed integer.
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
 * @expose
 */
ByteBufferPrototype.writeInt32 = function (value, offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
        if (typeof value !== 'number' || value % 1 !== 0)
            throw TypeError("Illegal value: " + value + " (not an integer)");
        value |= 0;
        if (typeof offset !== 'number' || offset % 1 !== 0)
            throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength)
            throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
    }
    offset += 4;
    var capacity4 = this.buffer.byteLength;
    if (offset > capacity4)
        this.resize((capacity4 *= 2) > offset ? capacity4 : offset);
    offset -= 4;
    if (this.littleEndian) {
        this.view[offset + 3] = (value >>> 24) & 0xFF;
        this.view[offset + 2] = (value >>> 16) & 0xFF;
        this.view[offset + 1] = (value >>> 8) & 0xFF;
        this.view[offset] = value & 0xFF;
    } else {
        this.view[offset] = (value >>> 24) & 0xFF;
        this.view[offset + 1] = (value >>> 16) & 0xFF;
        this.view[offset + 2] = (value >>> 8) & 0xFF;
        this.view[offset + 3] = value & 0xFF;
    }
    if (relative) this.offset += 4;
    return this;
};

/**
 * Writes a 32bit signed integer. This is an alias of {@link ByteBuffer#writeInt32}.
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
 * @expose
 */
ByteBufferPrototype.writeInt = ByteBufferPrototype.writeInt32;

/**
 * Reads a 32bit signed integer.
 * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
 * @returns {number} Value read
 * @expose
 */
ByteBufferPrototype.readInt32 = function (offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0)
            throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 4 > this.buffer.byteLength)
            throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 4 + ") <= " + this.buffer.byteLength);
    }
    var value = 0;
    if (this.littleEndian) {
        value = this.view[offset + 2] << 16;
        value |= this.view[offset + 1] << 8;
        value |= this.view[offset];
        value += this.view[offset + 3] << 24 >>> 0;
    } else {
        value = this.view[offset + 1] << 16;
        value |= this.view[offset + 2] << 8;
        value |= this.view[offset + 3];
        value += this.view[offset] << 24 >>> 0;
    }
    value |= 0; // Cast to signed
    if (relative) this.offset += 4;
    return value;
};

/**
 * Reads a 32bit signed integer. This is an alias of {@link ByteBuffer#readInt32}.
 * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `4` if omitted.
 * @returns {number} Value read
 * @expose
 */
ByteBufferPrototype.readInt = ByteBufferPrototype.readInt32;

/**
 * Writes a 32bit unsigned integer.
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
 * @expose
 */
ByteBufferPrototype.writeUint32 = function (value, offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
        if (typeof value !== 'number' || value % 1 !== 0)
            throw TypeError("Illegal value: " + value + " (not an integer)");
        value >>>= 0;
        if (typeof offset !== 'number' || offset % 1 !== 0)
            throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength)
            throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
    }
    offset += 4;
    var capacity5 = this.buffer.byteLength;
    if (offset > capacity5)
        this.resize((capacity5 *= 2) > offset ? capacity5 : offset);
    offset -= 4;
    if (this.littleEndian) {
        this.view[offset + 3] = (value >>> 24) & 0xFF;
        this.view[offset + 2] = (value >>> 16) & 0xFF;
        this.view[offset + 1] = (value >>> 8) & 0xFF;
        this.view[offset] = value & 0xFF;
    } else {
        this.view[offset] = (value >>> 24) & 0xFF;
        this.view[offset + 1] = (value >>> 16) & 0xFF;
        this.view[offset + 2] = (value >>> 8) & 0xFF;
        this.view[offset + 3] = value & 0xFF;
    }
    if (relative) this.offset += 4;
    return this;
};

/**
 * Writes a 32bit unsigned integer. This is an alias of {@link ByteBuffer#writeUint32}.
 * @function
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
 * @expose
 */
ByteBufferPrototype.writeUInt32 = ByteBufferPrototype.writeUint32;

/**
 * Reads a 32bit unsigned integer.
 * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
 * @returns {number} Value read
 * @expose
 */
ByteBufferPrototype.readUint32 = function (offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0)
            throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 4 > this.buffer.byteLength)
            throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 4 + ") <= " + this.buffer.byteLength);
    }
    var value = 0;
    if (this.littleEndian) {
        value = this.view[offset + 2] << 16;
        value |= this.view[offset + 1] << 8;
        value |= this.view[offset];
        value += this.view[offset + 3] << 24 >>> 0;
    } else {
        value = this.view[offset + 1] << 16;
        value |= this.view[offset + 2] << 8;
        value |= this.view[offset + 3];
        value += this.view[offset] << 24 >>> 0;
    }
    if (relative) this.offset += 4;
    return value;
};

/**
 * Reads a 32bit unsigned integer. This is an alias of {@link ByteBuffer#readUint32}.
 * @function
 * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
 * @returns {number} Value read
 * @expose
 */
ByteBufferPrototype.readUInt32 = ByteBufferPrototype.readUint32;

// types/ints/int64

if (Long) {

    /**
     * Writes a 64bit signed integer.
     * @param {number|!Long} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.writeInt64 = function (value, offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof value === 'number')
                value = Long.fromNumber(value);
            else if (typeof value === 'string')
                value = Long.fromString(value);
            else if (!(value && value instanceof Long))
                throw TypeError("Illegal value: " + value + " (not an integer or Long)");
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: " + offset + " (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 0 > this.buffer.byteLength)
                throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
        }
        if (typeof value === 'number')
            value = Long.fromNumber(value);
        else if (typeof value === 'string')
            value = Long.fromString(value);
        offset += 8;
        var capacity6 = this.buffer.byteLength;
        if (offset > capacity6)
            this.resize((capacity6 *= 2) > offset ? capacity6 : offset);
        offset -= 8;
        var lo = value.low,
            hi = value.high;
        if (this.littleEndian) {
            this.view[offset + 3] = (lo >>> 24) & 0xFF;
            this.view[offset + 2] = (lo >>> 16) & 0xFF;
            this.view[offset + 1] = (lo >>> 8) & 0xFF;
            this.view[offset] = lo & 0xFF;
            offset += 4;
            this.view[offset + 3] = (hi >>> 24) & 0xFF;
            this.view[offset + 2] = (hi >>> 16) & 0xFF;
            this.view[offset + 1] = (hi >>> 8) & 0xFF;
            this.view[offset] = hi & 0xFF;
        } else {
            this.view[offset] = (hi >>> 24) & 0xFF;
            this.view[offset + 1] = (hi >>> 16) & 0xFF;
            this.view[offset + 2] = (hi >>> 8) & 0xFF;
            this.view[offset + 3] = hi & 0xFF;
            offset += 4;
            this.view[offset] = (lo >>> 24) & 0xFF;
            this.view[offset + 1] = (lo >>> 16) & 0xFF;
            this.view[offset + 2] = (lo >>> 8) & 0xFF;
            this.view[offset + 3] = lo & 0xFF;
        }
        if (relative) this.offset += 8;
        return this;
    };

    /**
     * Writes a 64bit signed integer. This is an alias of {@link ByteBuffer#writeInt64}.
     * @param {number|!Long} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.writeLong = ByteBufferPrototype.writeInt64;

    /**
     * Reads a 64bit signed integer.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {!Long}
     * @expose
     */
    ByteBufferPrototype.readInt64 = function (offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: " + offset + " (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 8 > this.buffer.byteLength)
                throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 8 + ") <= " + this.buffer.byteLength);
        }
        var lo = 0,
            hi = 0;
        if (this.littleEndian) {
            lo = this.view[offset + 2] << 16;
            lo |= this.view[offset + 1] << 8;
            lo |= this.view[offset];
            lo += this.view[offset + 3] << 24 >>> 0;
            offset += 4;
            hi = this.view[offset + 2] << 16;
            hi |= this.view[offset + 1] << 8;
            hi |= this.view[offset];
            hi += this.view[offset + 3] << 24 >>> 0;
        } else {
            hi = this.view[offset + 1] << 16;
            hi |= this.view[offset + 2] << 8;
            hi |= this.view[offset + 3];
            hi += this.view[offset] << 24 >>> 0;
            offset += 4;
            lo = this.view[offset + 1] << 16;
            lo |= this.view[offset + 2] << 8;
            lo |= this.view[offset + 3];
            lo += this.view[offset] << 24 >>> 0;
        }
        var value = new Long(lo, hi, false);
        if (relative) this.offset += 8;
        return value;
    };

    /**
     * Reads a 64bit signed integer. This is an alias of {@link ByteBuffer#readInt64}.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {!Long}
     * @expose
     */
    ByteBufferPrototype.readLong = ByteBufferPrototype.readInt64;

    /**
     * Writes a 64bit unsigned integer.
     * @param {number|!Long} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.writeUint64 = function (value, offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof value === 'number')
                value = Long.fromNumber(value);
            else if (typeof value === 'string')
                value = Long.fromString(value);
            else if (!(value && value instanceof Long))
                throw TypeError("Illegal value: " + value + " (not an integer or Long)");
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: " + offset + " (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 0 > this.buffer.byteLength)
                throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
        }
        if (typeof value === 'number')
            value = Long.fromNumber(value);
        else if (typeof value === 'string')
            value = Long.fromString(value);
        offset += 8;
        var capacity7 = this.buffer.byteLength;
        if (offset > capacity7)
            this.resize((capacity7 *= 2) > offset ? capacity7 : offset);
        offset -= 8;
        var lo = value.low,
            hi = value.high;
        if (this.littleEndian) {
            this.view[offset + 3] = (lo >>> 24) & 0xFF;
            this.view[offset + 2] = (lo >>> 16) & 0xFF;
            this.view[offset + 1] = (lo >>> 8) & 0xFF;
            this.view[offset] = lo & 0xFF;
            offset += 4;
            this.view[offset + 3] = (hi >>> 24) & 0xFF;
            this.view[offset + 2] = (hi >>> 16) & 0xFF;
            this.view[offset + 1] = (hi >>> 8) & 0xFF;
            this.view[offset] = hi & 0xFF;
        } else {
            this.view[offset] = (hi >>> 24) & 0xFF;
            this.view[offset + 1] = (hi >>> 16) & 0xFF;
            this.view[offset + 2] = (hi >>> 8) & 0xFF;
            this.view[offset + 3] = hi & 0xFF;
            offset += 4;
            this.view[offset] = (lo >>> 24) & 0xFF;
            this.view[offset + 1] = (lo >>> 16) & 0xFF;
            this.view[offset + 2] = (lo >>> 8) & 0xFF;
            this.view[offset + 3] = lo & 0xFF;
        }
        if (relative) this.offset += 8;
        return this;
    };

    /**
     * Writes a 64bit unsigned integer. This is an alias of {@link ByteBuffer#writeUint64}.
     * @function
     * @param {number|!Long} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.writeUInt64 = ByteBufferPrototype.writeUint64;

    /**
     * Reads a 64bit unsigned integer.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {!Long}
     * @expose
     */
    ByteBufferPrototype.readUint64 = function (offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: " + offset + " (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 8 > this.buffer.byteLength)
                throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 8 + ") <= " + this.buffer.byteLength);
        }
        var lo = 0,
            hi = 0;
        if (this.littleEndian) {
            lo = this.view[offset + 2] << 16;
            lo |= this.view[offset + 1] << 8;
            lo |= this.view[offset];
            lo += this.view[offset + 3] << 24 >>> 0;
            offset += 4;
            hi = this.view[offset + 2] << 16;
            hi |= this.view[offset + 1] << 8;
            hi |= this.view[offset];
            hi += this.view[offset + 3] << 24 >>> 0;
        } else {
            hi = this.view[offset + 1] << 16;
            hi |= this.view[offset + 2] << 8;
            hi |= this.view[offset + 3];
            hi += this.view[offset] << 24 >>> 0;
            offset += 4;
            lo = this.view[offset + 1] << 16;
            lo |= this.view[offset + 2] << 8;
            lo |= this.view[offset + 3];
            lo += this.view[offset] << 24 >>> 0;
        }
        var value = new Long(lo, hi, true);
        if (relative) this.offset += 8;
        return value;
    };

    /**
     * Reads a 64bit unsigned integer. This is an alias of {@link ByteBuffer#readUint64}.
     * @function
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {!Long}
     * @expose
     */
    ByteBufferPrototype.readUInt64 = ByteBufferPrototype.readUint64;

} // Long


// types/floats/float32

/*
 ieee754 - https://github.com/feross/ieee754

 The MIT License (MIT)

 Copyright (c) Feross Aboukhadijeh

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

/**
 * Reads an IEEE754 float from a byte array.
 * @param {!Array} buffer
 * @param {number} offset
 * @param {boolean} isLE
 * @param {number} mLen
 * @param {number} nBytes
 * @returns {number}
 * @inner
 */
function ieee754_read(buffer, offset, isLE, mLen, nBytes) {
    var e, m,
        eLen = nBytes * 8 - mLen - 1,
        eMax = (1 << eLen) - 1,
        eBias = eMax >> 1,
        nBits = -7,
        i = isLE ? (nBytes - 1) : 0,
        d = isLE ? -1 : 1,
        s = buffer[offset + i];

    i += d;

    e = s & ((1 << (-nBits)) - 1);
    s >>= (-nBits);
    nBits += eLen;
    for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {
    }

    m = e & ((1 << (-nBits)) - 1);
    e >>= (-nBits);
    nBits += mLen;
    for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {
    }

    if (e === 0) {
        e = 1 - eBias;
    } else if (e === eMax) {
        return m ? NaN : ((s ? -1 : 1) * Infinity);
    } else {
        m = m + Math.pow(2, mLen);
        e = e - eBias;
    }
    return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
}

/**
 * Writes an IEEE754 float to a byte array.
 * @param {!Array} buffer
 * @param {number} value
 * @param {number} offset
 * @param {boolean} isLE
 * @param {number} mLen
 * @param {number} nBytes
 * @inner
 */
function ieee754_write(buffer, value, offset, isLE, mLen, nBytes) {
    var e, m, c,
        eLen = nBytes * 8 - mLen - 1,
        eMax = (1 << eLen) - 1,
        eBias = eMax >> 1,
        rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
        i = isLE ? 0 : (nBytes - 1),
        d = isLE ? 1 : -1,
        s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

    value = Math.abs(value);

    if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
    } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
            e--;
            c *= 2;
        }
        if (e + eBias >= 1) {
            value += rt / c;
        } else {
            value += rt * Math.pow(2, 1 - eBias);
        }
        if (value * c >= 2) {
            e++;
            c /= 2;
        }

        if (e + eBias >= eMax) {
            m = 0;
            e = eMax;
        } else if (e + eBias >= 1) {
            m = (value * c - 1) * Math.pow(2, mLen);
            e = e + eBias;
        } else {
            m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
            e = 0;
        }
    }

    for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {
    }

    e = (e << mLen) | m;
    eLen += mLen;
    for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {
    }

    buffer[offset + i - d] |= s * 128;
}

/**
 * Writes a 32bit float.
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
 * @returns {!ByteBuffer} this
 * @expose
 */
ByteBufferPrototype.writeFloat32 = function (value, offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
        if (typeof value !== 'number')
            throw TypeError("Illegal value: " + value + " (not a number)");
        if (typeof offset !== 'number' || offset % 1 !== 0)
            throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength)
            throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
    }
    offset += 4;
    var capacity8 = this.buffer.byteLength;
    if (offset > capacity8)
        this.resize((capacity8 *= 2) > offset ? capacity8 : offset);
    offset -= 4;
    ieee754_write(this.view, value, offset, this.littleEndian, 23, 4);
    if (relative) this.offset += 4;
    return this;
};

/**
 * Writes a 32bit float. This is an alias of {@link ByteBuffer#writeFloat32}.
 * @function
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
 * @returns {!ByteBuffer} this
 * @expose
 */
ByteBufferPrototype.writeFloat = ByteBufferPrototype.writeFloat32;

/**
 * Reads a 32bit float.
 * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
 * @returns {number}
 * @expose
 */
ByteBufferPrototype.readFloat32 = function (offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0)
            throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 4 > this.buffer.byteLength)
            throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 4 + ") <= " + this.buffer.byteLength);
    }
    var value = ieee754_read(this.view, offset, this.littleEndian, 23, 4);
    if (relative) this.offset += 4;
    return value;
};

/**
 * Reads a 32bit float. This is an alias of {@link ByteBuffer#readFloat32}.
 * @function
 * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
 * @returns {number}
 * @expose
 */
ByteBufferPrototype.readFloat = ByteBufferPrototype.readFloat32;

// types/floats/float64

/**
 * Writes a 64bit float.
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
 * @returns {!ByteBuffer} this
 * @expose
 */
ByteBufferPrototype.writeFloat64 = function (value, offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
        if (typeof value !== 'number')
            throw TypeError("Illegal value: " + value + " (not a number)");
        if (typeof offset !== 'number' || offset % 1 !== 0)
            throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength)
            throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
    }
    offset += 8;
    var capacity9 = this.buffer.byteLength;
    if (offset > capacity9)
        this.resize((capacity9 *= 2) > offset ? capacity9 : offset);
    offset -= 8;
    ieee754_write(this.view, value, offset, this.littleEndian, 52, 8);
    if (relative) this.offset += 8;
    return this;
};

/**
 * Writes a 64bit float. This is an alias of {@link ByteBuffer#writeFloat64}.
 * @function
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
 * @returns {!ByteBuffer} this
 * @expose
 */
ByteBufferPrototype.writeDouble = ByteBufferPrototype.writeFloat64;

/**
 * Reads a 64bit float.
 * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
 * @returns {number}
 * @expose
 */
ByteBufferPrototype.readFloat64 = function (offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0)
            throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 8 > this.buffer.byteLength)
            throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 8 + ") <= " + this.buffer.byteLength);
    }
    var value = ieee754_read(this.view, offset, this.littleEndian, 52, 8);
    if (relative) this.offset += 8;
    return value;
};

/**
 * Reads a 64bit float. This is an alias of {@link ByteBuffer#readFloat64}.
 * @function
 * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
 * @returns {number}
 * @expose
 */
ByteBufferPrototype.readDouble = ByteBufferPrototype.readFloat64;


// types/varints/varint32

/**
 * Maximum number of bytes required to store a 32bit base 128 variable-length integer.
 * @type {number}
 * @const
 * @expose
 */
ByteBuffer.MAX_VARINT32_BYTES = 5;

/**
 * Calculates the actual number of bytes required to store a 32bit base 128 variable-length integer.
 * @param {number} value Value to encode
 * @returns {number} Number of bytes required. Capped to {@link ByteBuffer.MAX_VARINT32_BYTES}
 * @expose
 */
ByteBuffer.calculateVarint32 = function (value) {
    // ref: src/google/protobuf/io/coded_stream.cc
    value = value >>> 0;
    if (value < 1 << 7) return 1;
    else if (value < 1 << 14) return 2;
    else if (value < 1 << 21) return 3;
    else if (value < 1 << 28) return 4;
    else                      return 5;
};

/**
 * Zigzag encodes a signed 32bit integer so that it can be effectively used with varint encoding.
 * @param {number} n Signed 32bit integer
 * @returns {number} Unsigned zigzag encoded 32bit integer
 * @expose
 */
ByteBuffer.zigZagEncode32 = function (n) {
    return (((n |= 0) << 1) ^ (n >> 31)) >>> 0; // ref: src/google/protobuf/wire_format_lite.h
};

/**
 * Decodes a zigzag encoded signed 32bit integer.
 * @param {number} n Unsigned zigzag encoded 32bit integer
 * @returns {number} Signed 32bit integer
 * @expose
 */
ByteBuffer.zigZagDecode32 = function (n) {
    return ((n >>> 1) ^ -(n & 1)) | 0; // // ref: src/google/protobuf/wire_format_lite.h
};

/**
 * Writes a 32bit base 128 variable-length integer.
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  written if omitted.
 * @returns {!ByteBuffer|number} this if `offset` is omitted, else the actual number of bytes written
 * @expose
 */
ByteBufferPrototype.writeVarint32 = function (value, offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
        if (typeof value !== 'number' || value % 1 !== 0)
            throw TypeError("Illegal value: " + value + " (not an integer)");
        value |= 0;
        if (typeof offset !== 'number' || offset % 1 !== 0)
            throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength)
            throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
    }
    var size = ByteBuffer.calculateVarint32(value),
        b;
    offset += size;
    var capacity10 = this.buffer.byteLength;
    if (offset > capacity10)
        this.resize((capacity10 *= 2) > offset ? capacity10 : offset);
    offset -= size;
    value >>>= 0;
    while (value >= 0x80) {
        b = (value & 0x7f) | 0x80;
        this.view[offset++] = b;
        value >>>= 7;
    }
    this.view[offset++] = value;
    if (relative) {
        this.offset = offset;
        return this;
    }
    return size;
};

/**
 * Writes a zig-zag encoded (signed) 32bit base 128 variable-length integer.
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  written if omitted.
 * @returns {!ByteBuffer|number} this if `offset` is omitted, else the actual number of bytes written
 * @expose
 */
ByteBufferPrototype.writeVarint32ZigZag = function (value, offset) {
    return this.writeVarint32(ByteBuffer.zigZagEncode32(value), offset);
};

/**
 * Reads a 32bit base 128 variable-length integer.
 * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  written if omitted.
 * @returns {number|!{value: number, length: number}} The value read if offset is omitted, else the value read
 *  and the actual number of bytes read.
 * @throws {Error} If it's not a valid varint. Has a property `truncated = true` if there is not enough data available
 *  to fully decode the varint.
 * @expose
 */
ByteBufferPrototype.readVarint32 = function (offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0)
            throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 1 > this.buffer.byteLength)
            throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 1 + ") <= " + this.buffer.byteLength);
    }
    var c = 0,
        value = 0 >>> 0,
        b;
    do {
        if (!this.noAssert && offset > this.limit) {
            var err = Error("Truncated");
            err['truncated'] = true;
            throw err;
        }
        b = this.view[offset++];
        if (c < 5)
            value |= (b & 0x7f) << (7 * c);
        ++c;
    } while ((b & 0x80) !== 0);
    value |= 0;
    if (relative) {
        this.offset = offset;
        return value;
    }
    return {
        "value": value,
        "length": c
    };
};

/**
 * Reads a zig-zag encoded (signed) 32bit base 128 variable-length integer.
 * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  written if omitted.
 * @returns {number|!{value: number, length: number}} The value read if offset is omitted, else the value read
 *  and the actual number of bytes read.
 * @throws {Error} If it's not a valid varint
 * @expose
 */
ByteBufferPrototype.readVarint32ZigZag = function (offset) {
    var val = this.readVarint32(offset);
    if (typeof val === 'object')
        val["value"] = ByteBuffer.zigZagDecode32(val["value"]);
    else
        val = ByteBuffer.zigZagDecode32(val);
    return val;
};

// types/varints/varint64

if (Long) {

    /**
     * Maximum number of bytes required to store a 64bit base 128 variable-length integer.
     * @type {number}
     * @const
     * @expose
     */
    ByteBuffer.MAX_VARINT64_BYTES = 10;

    /**
     * Calculates the actual number of bytes required to store a 64bit base 128 variable-length integer.
     * @param {number|!Long} value Value to encode
     * @returns {number} Number of bytes required. Capped to {@link ByteBuffer.MAX_VARINT64_BYTES}
     * @expose
     */
    ByteBuffer.calculateVarint64 = function (value) {
        if (typeof value === 'number')
            value = Long.fromNumber(value);
        else if (typeof value === 'string')
            value = Long.fromString(value);
        // ref: src/google/protobuf/io/coded_stream.cc
        var part0 = value.toInt() >>> 0,
            part1 = value.shiftRightUnsigned(28).toInt() >>> 0,
            part2 = value.shiftRightUnsigned(56).toInt() >>> 0;
        if (part2 == 0) {
            if (part1 == 0) {
                if (part0 < 1 << 14)
                    return part0 < 1 << 7 ? 1 : 2;
                else
                    return part0 < 1 << 21 ? 3 : 4;
            } else {
                if (part1 < 1 << 14)
                    return part1 < 1 << 7 ? 5 : 6;
                else
                    return part1 < 1 << 21 ? 7 : 8;
            }
        } else
            return part2 < 1 << 7 ? 9 : 10;
    };

    /**
     * Zigzag encodes a signed 64bit integer so that it can be effectively used with varint encoding.
     * @param {number|!Long} value Signed long
     * @returns {!Long} Unsigned zigzag encoded long
     * @expose
     */
    ByteBuffer.zigZagEncode64 = function (value) {
        if (typeof value === 'number')
            value = Long.fromNumber(value, false);
        else if (typeof value === 'string')
            value = Long.fromString(value, false);
        else if (value.unsigned !== false) value = value.toSigned();
        // ref: src/google/protobuf/wire_format_lite.h
        return value.shiftLeft(1).xor(value.shiftRight(63)).toUnsigned();
    };

    /**
     * Decodes a zigzag encoded signed 64bit integer.
     * @param {!Long|number} value Unsigned zigzag encoded long or JavaScript number
     * @returns {!Long} Signed long
     * @expose
     */
    ByteBuffer.zigZagDecode64 = function (value) {
        if (typeof value === 'number')
            value = Long.fromNumber(value, false);
        else if (typeof value === 'string')
            value = Long.fromString(value, false);
        else if (value.unsigned !== false) value = value.toSigned();
        // ref: src/google/protobuf/wire_format_lite.h
        return value.shiftRightUnsigned(1).xor(value.and(Long.ONE).toSigned().negate()).toSigned();
    };

    /**
     * Writes a 64bit base 128 variable-length integer.
     * @param {number|Long} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  written if omitted.
     * @returns {!ByteBuffer|number} `this` if offset is omitted, else the actual number of bytes written.
     * @expose
     */
    ByteBufferPrototype.writeVarint64 = function (value, offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof value === 'number')
                value = Long.fromNumber(value);
            else if (typeof value === 'string')
                value = Long.fromString(value);
            else if (!(value && value instanceof Long))
                throw TypeError("Illegal value: " + value + " (not an integer or Long)");
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: " + offset + " (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 0 > this.buffer.byteLength)
                throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
        }
        if (typeof value === 'number')
            value = Long.fromNumber(value, false);
        else if (typeof value === 'string')
            value = Long.fromString(value, false);
        else if (value.unsigned !== false) value = value.toSigned();
        var size = ByteBuffer.calculateVarint64(value),
            part0 = value.toInt() >>> 0,
            part1 = value.shiftRightUnsigned(28).toInt() >>> 0,
            part2 = value.shiftRightUnsigned(56).toInt() >>> 0;
        offset += size;
        var capacity11 = this.buffer.byteLength;
        if (offset > capacity11)
            this.resize((capacity11 *= 2) > offset ? capacity11 : offset);
        offset -= size;
        switch (size) {
            case 10:
                this.view[offset + 9] = (part2 >>> 7) & 0x01;
            case 9 :
                this.view[offset + 8] = size !== 9 ? (part2       ) | 0x80 : (part2       ) & 0x7F;
            case 8 :
                this.view[offset + 7] = size !== 8 ? (part1 >>> 21) | 0x80 : (part1 >>> 21) & 0x7F;
            case 7 :
                this.view[offset + 6] = size !== 7 ? (part1 >>> 14) | 0x80 : (part1 >>> 14) & 0x7F;
            case 6 :
                this.view[offset + 5] = size !== 6 ? (part1 >>> 7) | 0x80 : (part1 >>> 7) & 0x7F;
            case 5 :
                this.view[offset + 4] = size !== 5 ? (part1       ) | 0x80 : (part1       ) & 0x7F;
            case 4 :
                this.view[offset + 3] = size !== 4 ? (part0 >>> 21) | 0x80 : (part0 >>> 21) & 0x7F;
            case 3 :
                this.view[offset + 2] = size !== 3 ? (part0 >>> 14) | 0x80 : (part0 >>> 14) & 0x7F;
            case 2 :
                this.view[offset + 1] = size !== 2 ? (part0 >>> 7) | 0x80 : (part0 >>> 7) & 0x7F;
            case 1 :
                this.view[offset] = size !== 1 ? (part0       ) | 0x80 : (part0       ) & 0x7F;
        }
        if (relative) {
            this.offset += size;
            return this;
        } else {
            return size;
        }
    };

    /**
     * Writes a zig-zag encoded 64bit base 128 variable-length integer.
     * @param {number|Long} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  written if omitted.
     * @returns {!ByteBuffer|number} `this` if offset is omitted, else the actual number of bytes written.
     * @expose
     */
    ByteBufferPrototype.writeVarint64ZigZag = function (value, offset) {
        return this.writeVarint64(ByteBuffer.zigZagEncode64(value), offset);
    };

    /**
     * Reads a 64bit base 128 variable-length integer. Requires Long.js.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  read if omitted.
     * @returns {!Long|!{value: Long, length: number}} The value read if offset is omitted, else the value read and
     *  the actual number of bytes read.
     * @throws {Error} If it's not a valid varint
     * @expose
     */
    ByteBufferPrototype.readVarint64 = function (offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: " + offset + " (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 1 > this.buffer.byteLength)
                throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 1 + ") <= " + this.buffer.byteLength);
        }
        // ref: src/google/protobuf/io/coded_stream.cc
        var start = offset,
            part0 = 0,
            part1 = 0,
            part2 = 0,
            b = 0;
        b = this.view[offset++];
        part0 = (b & 0x7F);
        if (b & 0x80) {
            b = this.view[offset++];
            part0 |= (b & 0x7F) << 7;
            if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
                b = this.view[offset++];
                part0 |= (b & 0x7F) << 14;
                if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
                    b = this.view[offset++];
                    part0 |= (b & 0x7F) << 21;
                    if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
                        b = this.view[offset++];
                        part1 = (b & 0x7F);
                        if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
                            b = this.view[offset++];
                            part1 |= (b & 0x7F) << 7;
                            if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
                                b = this.view[offset++];
                                part1 |= (b & 0x7F) << 14;
                                if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
                                    b = this.view[offset++];
                                    part1 |= (b & 0x7F) << 21;
                                    if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
                                        b = this.view[offset++];
                                        part2 = (b & 0x7F);
                                        if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
                                            b = this.view[offset++];
                                            part2 |= (b & 0x7F) << 7;
                                            if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
                                                throw Error("Buffer overrun");
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        var value = Long.fromBits(part0 | (part1 << 28), (part1 >>> 4) | (part2) << 24, false);
        if (relative) {
            this.offset = offset;
            return value;
        } else {
            return {
                'value': value,
                'length': offset - start
            };
        }
    };

    /**
     * Reads a zig-zag encoded 64bit base 128 variable-length integer. Requires Long.js.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  read if omitted.
     * @returns {!Long|!{value: Long, length: number}} The value read if offset is omitted, else the value read and
     *  the actual number of bytes read.
     * @throws {Error} If it's not a valid varint
     * @expose
     */
    ByteBufferPrototype.readVarint64ZigZag = function (offset) {
        var val = this.readVarint64(offset);
        if (val && val['value'] instanceof Long)
            val["value"] = ByteBuffer.zigZagDecode64(val["value"]);
        else
            val = ByteBuffer.zigZagDecode64(val);
        return val;
    };

} // Long


// types/strings/cstring

/**
 * Writes a NULL-terminated UTF8 encoded string. For this to work the specified string must not contain any NULL
 *  characters itself.
 * @param {string} str String to write
 * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  contained in `str` + 1 if omitted.
 * @returns {!ByteBuffer|number} this if offset is omitted, else the actual number of bytes written
 * @expose
 */
ByteBufferPrototype.writeCString = function (str, offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    var i,
        k = str.length;
    if (!this.noAssert) {
        if (typeof str !== 'string')
            throw TypeError("Illegal str: Not a string");
        for (i = 0; i < k; ++i) {
            if (str.charCodeAt(i) === 0)
                throw RangeError("Illegal str: Contains NULL-characters");
        }
        if (typeof offset !== 'number' || offset % 1 !== 0)
            throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength)
            throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
    }
    // UTF8 strings do not contain zero bytes in between except for the zero character, so:
    k = utfx.calculateUTF16asUTF8(stringSource(str))[1];
    offset += k + 1;
    var capacity12 = this.buffer.byteLength;
    if (offset > capacity12)
        this.resize((capacity12 *= 2) > offset ? capacity12 : offset);
    offset -= k + 1;
    utfx.encodeUTF16toUTF8(stringSource(str), function (b) {
        this.view[offset++] = b;
    }.bind(this));
    this.view[offset++] = 0;
    if (relative) {
        this.offset = offset;
        return this;
    }
    return k;
};

/**
 * Reads a NULL-terminated UTF8 encoded string. For this to work the string read must not contain any NULL characters
 *  itself.
 * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  read if omitted.
 * @returns {string|!{string: string, length: number}} The string read if offset is omitted, else the string
 *  read and the actual number of bytes read.
 * @expose
 */
ByteBufferPrototype.readCString = function (offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0)
            throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 1 > this.buffer.byteLength)
            throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 1 + ") <= " + this.buffer.byteLength);
    }
    var start = offset,
        temp;
    // UTF8 strings do not contain zero bytes in between except for the zero character itself, so:
    var sd, b = -1;
    utfx.decodeUTF8toUTF16(function () {
        if (b === 0) return null;
        if (offset >= this.limit)
            throw RangeError("Illegal range: Truncated data, " + offset + " < " + this.limit);
        b = this.view[offset++];
        return b === 0 ? null : b;
    }.bind(this), sd = stringDestination(), true);
    if (relative) {
        this.offset = offset;
        return sd();
    } else {
        return {
            "string": sd(),
            "length": offset - start
        };
    }
};

// types/strings/istring

/**
 * Writes a length as uint32 prefixed UTF8 encoded string.
 * @param {string} str String to write
 * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  written if omitted.
 * @returns {!ByteBuffer|number} `this` if `offset` is omitted, else the actual number of bytes written
 * @expose
 * @see ByteBuffer#writeVarint32
 */
ByteBufferPrototype.writeIString = function (str, offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
        if (typeof str !== 'string')
            throw TypeError("Illegal str: Not a string");
        if (typeof offset !== 'number' || offset % 1 !== 0)
            throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength)
            throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
    }
    var start = offset,
        k;
    k = utfx.calculateUTF16asUTF8(stringSource(str), this.noAssert)[1];
    offset += 4 + k;
    var capacity13 = this.buffer.byteLength;
    if (offset > capacity13)
        this.resize((capacity13 *= 2) > offset ? capacity13 : offset);
    offset -= 4 + k;
    if (this.littleEndian) {
        this.view[offset + 3] = (k >>> 24) & 0xFF;
        this.view[offset + 2] = (k >>> 16) & 0xFF;
        this.view[offset + 1] = (k >>> 8) & 0xFF;
        this.view[offset] = k & 0xFF;
    } else {
        this.view[offset] = (k >>> 24) & 0xFF;
        this.view[offset + 1] = (k >>> 16) & 0xFF;
        this.view[offset + 2] = (k >>> 8) & 0xFF;
        this.view[offset + 3] = k & 0xFF;
    }
    offset += 4;
    utfx.encodeUTF16toUTF8(stringSource(str), function (b) {
        this.view[offset++] = b;
    }.bind(this));
    if (offset !== start + 4 + k)
        throw RangeError("Illegal range: Truncated data, " + offset + " == " + (offset + 4 + k));
    if (relative) {
        this.offset = offset;
        return this;
    }
    return offset - start;
};

/**
 * Reads a length as uint32 prefixed UTF8 encoded string.
 * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  read if omitted.
 * @returns {string|!{string: string, length: number}} The string read if offset is omitted, else the string
 *  read and the actual number of bytes read.
 * @expose
 * @see ByteBuffer#readVarint32
 */
ByteBufferPrototype.readIString = function (offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0)
            throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 4 > this.buffer.byteLength)
            throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 4 + ") <= " + this.buffer.byteLength);
    }
    var start = offset;
    var len = this.readUint32(offset);
    var str = this.readUTF8String(len, ByteBuffer.METRICS_BYTES, offset += 4);
    offset += str['length'];
    if (relative) {
        this.offset = offset;
        return str['string'];
    } else {
        return {
            'string': str['string'],
            'length': offset - start
        };
    }
};

// types/strings/utf8string

/**
 * Metrics representing number of UTF8 characters. Evaluates to `c`.
 * @type {string}
 * @const
 * @expose
 */
ByteBuffer.METRICS_CHARS = 'c';

/**
 * Metrics representing number of bytes. Evaluates to `b`.
 * @type {string}
 * @const
 * @expose
 */
ByteBuffer.METRICS_BYTES = 'b';

/**
 * Writes an UTF8 encoded string.
 * @param {string} str String to write
 * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} if omitted.
 * @returns {!ByteBuffer|number} this if offset is omitted, else the actual number of bytes written.
 * @expose
 */
ByteBufferPrototype.writeUTF8String = function (str, offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0)
            throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength)
            throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
    }
    var k;
    var start = offset;
    k = utfx.calculateUTF16asUTF8(stringSource(str))[1];
    offset += k;
    var capacity14 = this.buffer.byteLength;
    if (offset > capacity14)
        this.resize((capacity14 *= 2) > offset ? capacity14 : offset);
    offset -= k;
    utfx.encodeUTF16toUTF8(stringSource(str), function (b) {
        this.view[offset++] = b;
    }.bind(this));
    if (relative) {
        this.offset = offset;
        return this;
    }
    return offset - start;
};

/**
 * Writes an UTF8 encoded string. This is an alias of {@link ByteBuffer#writeUTF8String}.
 * @function
 * @param {string} str String to write
 * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} if omitted.
 * @returns {!ByteBuffer|number} this if offset is omitted, else the actual number of bytes written.
 * @expose
 */
ByteBufferPrototype.writeString = ByteBufferPrototype.writeUTF8String;

/**
 * Calculates the number of UTF8 characters of a string. JavaScript itself uses UTF-16, so that a string's
 *  `length` property does not reflect its actual UTF8 size if it contains code points larger than 0xFFFF.
 * @param {string} str String to calculate
 * @returns {number} Number of UTF8 characters
 * @expose
 */
ByteBuffer.calculateUTF8Chars = function (str) {
    return utfx.calculateUTF16asUTF8(stringSource(str))[0];
};

/**
 * Calculates the number of UTF8 bytes of a string.
 * @param {string} str String to calculate
 * @returns {number} Number of UTF8 bytes
 * @expose
 */
ByteBuffer.calculateUTF8Bytes = function (str) {
    return utfx.calculateUTF16asUTF8(stringSource(str))[1];
};

/**
 * Calculates the number of UTF8 bytes of a string. This is an alias of {@link ByteBuffer.calculateUTF8Bytes}.
 * @function
 * @param {string} str String to calculate
 * @returns {number} Number of UTF8 bytes
 * @expose
 */
ByteBuffer.calculateString = ByteBuffer.calculateUTF8Bytes;

/**
 * Reads an UTF8 encoded string.
 * @param {number} length Number of characters or bytes to read.
 * @param {string=} metrics Metrics specifying what `length` is meant to count. Defaults to
 *  {@link ByteBuffer.METRICS_CHARS}.
 * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  read if omitted.
 * @returns {string|!{string: string, length: number}} The string read if offset is omitted, else the string
 *  read and the actual number of bytes read.
 * @expose
 */
ByteBufferPrototype.readUTF8String = function (length, metrics, offset) {
    if (typeof metrics === 'number') {
        offset = metrics;
        metrics = undefined;
    }
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (typeof metrics === 'undefined') metrics = ByteBuffer.METRICS_CHARS;
    if (!this.noAssert) {
        if (typeof length !== 'number' || length % 1 !== 0)
            throw TypeError("Illegal length: " + length + " (not an integer)");
        length |= 0;
        if (typeof offset !== 'number' || offset % 1 !== 0)
            throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength)
            throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
    }
    var i = 0,
        start = offset,
        sd;
    if (metrics === ByteBuffer.METRICS_CHARS) { // The same for node and the browser
        sd = stringDestination();
        utfx.decodeUTF8(function () {
            return i < length && offset < this.limit ? this.view[offset++] : null;
        }.bind(this), function (cp) {
            ++i;
            utfx.UTF8toUTF16(cp, sd);
        });
        if (i !== length)
            throw RangeError("Illegal range: Truncated data, " + i + " == " + length);
        if (relative) {
            this.offset = offset;
            return sd();
        } else {
            return {
                "string": sd(),
                "length": offset - start
            };
        }
    } else if (metrics === ByteBuffer.METRICS_BYTES) {
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: " + offset + " (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + length > this.buffer.byteLength)
                throw RangeError("Illegal offset: 0 <= " + offset + " (+" + length + ") <= " + this.buffer.byteLength);
        }
        var k = offset + length;
        utfx.decodeUTF8toUTF16(function () {
            return offset < k ? this.view[offset++] : null;
        }.bind(this), sd = stringDestination(), this.noAssert);
        if (offset !== k)
            throw RangeError("Illegal range: Truncated data, " + offset + " == " + k);
        if (relative) {
            this.offset = offset;
            return sd();
        } else {
            return {
                'string': sd(),
                'length': offset - start
            };
        }
    } else
        throw TypeError("Unsupported metrics: " + metrics);
};

/**
 * Reads an UTF8 encoded string. This is an alias of {@link ByteBuffer#readUTF8String}.
 * @function
 * @param {number} length Number of characters or bytes to read
 * @param {number=} metrics Metrics specifying what `n` is meant to count. Defaults to
 *  {@link ByteBuffer.METRICS_CHARS}.
 * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  read if omitted.
 * @returns {string|!{string: string, length: number}} The string read if offset is omitted, else the string
 *  read and the actual number of bytes read.
 * @expose
 */
ByteBufferPrototype.readString = ByteBufferPrototype.readUTF8String;

// types/strings/vstring

/**
 * Writes a length as varint32 prefixed UTF8 encoded string.
 * @param {string} str String to write
 * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  written if omitted.
 * @returns {!ByteBuffer|number} `this` if `offset` is omitted, else the actual number of bytes written
 * @expose
 * @see ByteBuffer#writeVarint32
 */
ByteBufferPrototype.writeVString = function (str, offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
        if (typeof str !== 'string')
            throw TypeError("Illegal str: Not a string");
        if (typeof offset !== 'number' || offset % 1 !== 0)
            throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength)
            throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
    }
    var start = offset,
        k, l;
    k = utfx.calculateUTF16asUTF8(stringSource(str), this.noAssert)[1];
    l = ByteBuffer.calculateVarint32(k);
    offset += l + k;
    var capacity15 = this.buffer.byteLength;
    if (offset > capacity15)
        this.resize((capacity15 *= 2) > offset ? capacity15 : offset);
    offset -= l + k;
    offset += this.writeVarint32(k, offset);
    utfx.encodeUTF16toUTF8(stringSource(str), function (b) {
        this.view[offset++] = b;
    }.bind(this));
    if (offset !== start + k + l)
        throw RangeError("Illegal range: Truncated data, " + offset + " == " + (offset + k + l));
    if (relative) {
        this.offset = offset;
        return this;
    }
    return offset - start;
};

/**
 * Reads a length as varint32 prefixed UTF8 encoded string.
 * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  read if omitted.
 * @returns {string|!{string: string, length: number}} The string read if offset is omitted, else the string
 *  read and the actual number of bytes read.
 * @expose
 * @see ByteBuffer#readVarint32
 */
ByteBufferPrototype.readVString = function (offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0)
            throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 1 > this.buffer.byteLength)
            throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 1 + ") <= " + this.buffer.byteLength);
    }
    var start = offset;
    var len = this.readVarint32(offset);
    var str = this.readUTF8String(len['value'], ByteBuffer.METRICS_BYTES, offset += len['length']);
    offset += str['length'];
    if (relative) {
        this.offset = offset;
        return str['string'];
    } else {
        return {
            'string': str['string'],
            'length': offset - start
        };
    }
};


/**
 * Appends some data to this ByteBuffer. This will overwrite any contents behind the specified offset up to the appended
 *  data's length.
 * @param {!ByteBuffer|!ArrayBuffer|!Uint8Array|string} source Data to append. If `source` is a ByteBuffer, its offsets
 *  will be modified according to the performed read operation.
 * @param {(string|number)=} encoding Encoding if `data` is a string ("base64", "hex", "binary", defaults to "utf8")
 * @param {number=} offset Offset to append at. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  written if omitted.
 * @returns {!ByteBuffer} this
 * @expose
 * @example A relative `<01 02>03.append(<04 05>)` will result in `<01 02 04 05>, 04 05|`
 * @example An absolute `<01 02>03.append(04 05>, 1)` will result in `<01 04>05, 04 05|`
 */
ByteBufferPrototype.append = function (source, encoding, offset) {
    if (typeof encoding === 'number' || typeof encoding !== 'string') {
        offset = encoding;
        encoding = undefined;
    }
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0)
            throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength)
            throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
    }
    if (!(source instanceof ByteBuffer))
        source = ByteBuffer.wrap(source, encoding);
    var length = source.limit - source.offset;
    if (length <= 0) return this; // Nothing to append
    offset += length;
    var capacity16 = this.buffer.byteLength;
    if (offset > capacity16)
        this.resize((capacity16 *= 2) > offset ? capacity16 : offset);
    offset -= length;
    this.view.set(source.view.subarray(source.offset, source.limit), offset);
    source.offset += length;
    if (relative) this.offset += length;
    return this;
};

/**
 * Appends this ByteBuffer's contents to another ByteBuffer. This will overwrite any contents at and after the
 specified offset up to the length of this ByteBuffer's data.
 * @param {!ByteBuffer} target Target ByteBuffer
 * @param {number=} offset Offset to append to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  read if omitted.
 * @returns {!ByteBuffer} this
 * @expose
 * @see ByteBuffer#append
 */
ByteBufferPrototype.appendTo = function (target, offset) {
    target.append(this, offset);
    return this;
};
/**
 * Writes a payload of bytes. This is an alias of {@link ByteBuffer#append}.
 * @function
 * @param {!ByteBuffer|!ArrayBuffer|!Uint8Array|string} source Data to write. If `source` is a ByteBuffer, its offsets
 *  will be modified according to the performed read operation.
 * @param {(string|number)=} encoding Encoding if `data` is a string ("base64", "hex", "binary", defaults to "utf8")
 * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  written if omitted.
 * @returns {!ByteBuffer} this
 * @expose
 */
ByteBufferPrototype.writeBytes = ByteBufferPrototype.append;
/**
 * Enables or disables assertions of argument types and offsets. Assertions are enabled by default but you can opt to
 *  disable them if your code already makes sure that everything is valid.
 * @param {boolean} assert `true` to enable assertions, otherwise `false`
 * @returns {!ByteBuffer} this
 * @expose
 */
ByteBufferPrototype.assert = function (assert) {
    this.noAssert = !assert;
    return this;
};

/**
 * Gets the capacity of this ByteBuffer's backing buffer.
 * @returns {number} Capacity of the backing buffer
 * @expose
 */
ByteBufferPrototype.capacity = function () {
    return this.buffer.byteLength;
};
/**
 * Clears this ByteBuffer's offsets by setting {@link ByteBuffer#offset} to `0` and {@link ByteBuffer#limit} to the
 *  backing buffer's capacity. Discards {@link ByteBuffer#markedOffset}.
 * @returns {!ByteBuffer} this
 * @expose
 */
ByteBufferPrototype.clear = function () {
    this.offset = 0;
    this.limit = this.buffer.byteLength;
    this.markedOffset = -1;
    return this;
};

/**
 * Creates a cloned instance of this ByteBuffer, preset with this ByteBuffer's values for {@link ByteBuffer#offset},
 *  {@link ByteBuffer#markedOffset} and {@link ByteBuffer#limit}.
 * @param {boolean=} copy Whether to copy the backing buffer or to return another view on the same, defaults to `false`
 * @returns {!ByteBuffer} Cloned instance
 * @expose
 */
ByteBufferPrototype.clone = function (copy) {
    var bb = new ByteBuffer(0, this.littleEndian, this.noAssert);
    if (copy) {
        bb.buffer = new ArrayBuffer(this.buffer.byteLength);
        bb.view = new Uint8Array(bb.buffer);
    } else {
        bb.buffer = this.buffer;
        bb.view = this.view;
    }
    bb.offset = this.offset;
    bb.markedOffset = this.markedOffset;
    bb.limit = this.limit;
    return bb;
};

/**
 * Compacts this ByteBuffer to be backed by a {@link ByteBuffer#buffer} of its contents' length. Contents are the bytes
 *  between {@link ByteBuffer#offset} and {@link ByteBuffer#limit}. Will set `offset = 0` and `limit = capacity` and
 *  adapt {@link ByteBuffer#markedOffset} to the same relative position if set.
 * @param {number=} begin Offset to start at, defaults to {@link ByteBuffer#offset}
 * @param {number=} end Offset to end at, defaults to {@link ByteBuffer#limit}
 * @returns {!ByteBuffer} this
 * @expose
 */
ByteBufferPrototype.compact = function (begin, end) {
    if (typeof begin === 'undefined') begin = this.offset;
    if (typeof end === 'undefined') end = this.limit;
    if (!this.noAssert) {
        if (typeof begin !== 'number' || begin % 1 !== 0)
            throw TypeError("Illegal begin: Not an integer");
        begin >>>= 0;
        if (typeof end !== 'number' || end % 1 !== 0)
            throw TypeError("Illegal end: Not an integer");
        end >>>= 0;
        if (begin < 0 || begin > end || end > this.buffer.byteLength)
            throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.byteLength);
    }
    if (begin === 0 && end === this.buffer.byteLength)
        return this; // Already compacted
    var len = end - begin;
    if (len === 0) {
        this.buffer = EMPTY_BUFFER;
        this.view = null;
        if (this.markedOffset >= 0) this.markedOffset -= begin;
        this.offset = 0;
        this.limit = 0;
        return this;
    }
    var buffer = new ArrayBuffer(len);
    var view = new Uint8Array(buffer);
    view.set(this.view.subarray(begin, end));
    this.buffer = buffer;
    this.view = view;
    if (this.markedOffset >= 0) this.markedOffset -= begin;
    this.offset = 0;
    this.limit = len;
    return this;
};

/**
 * Creates a copy of this ByteBuffer's contents. Contents are the bytes between {@link ByteBuffer#offset} and
 *  {@link ByteBuffer#limit}.
 * @param {number=} begin Begin offset, defaults to {@link ByteBuffer#offset}.
 * @param {number=} end End offset, defaults to {@link ByteBuffer#limit}.
 * @returns {!ByteBuffer} Copy
 * @expose
 */
ByteBufferPrototype.copy = function (begin, end) {
    if (typeof begin === 'undefined') begin = this.offset;
    if (typeof end === 'undefined') end = this.limit;
    if (!this.noAssert) {
        if (typeof begin !== 'number' || begin % 1 !== 0)
            throw TypeError("Illegal begin: Not an integer");
        begin >>>= 0;
        if (typeof end !== 'number' || end % 1 !== 0)
            throw TypeError("Illegal end: Not an integer");
        end >>>= 0;
        if (begin < 0 || begin > end || end > this.buffer.byteLength)
            throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.byteLength);
    }
    if (begin === end)
        return new ByteBuffer(0, this.littleEndian, this.noAssert);
    var capacity = end - begin,
        bb = new ByteBuffer(capacity, this.littleEndian, this.noAssert);
    bb.offset = 0;
    bb.limit = capacity;
    if (bb.markedOffset >= 0) bb.markedOffset -= begin;
    this.copyTo(bb, 0, begin, end);
    return bb;
};

/**
 * Copies this ByteBuffer's contents to another ByteBuffer. Contents are the bytes between {@link ByteBuffer#offset} and
 *  {@link ByteBuffer#limit}.
 * @param {!ByteBuffer} target Target ByteBuffer
 * @param {number=} targetOffset Offset to copy to. Will use and increase the target's {@link ByteBuffer#offset}
 *  by the number of bytes copied if omitted.
 * @param {number=} sourceOffset Offset to start copying from. Will use and increase {@link ByteBuffer#offset} by the
 *  number of bytes copied if omitted.
 * @param {number=} sourceLimit Offset to end copying from, defaults to {@link ByteBuffer#limit}
 * @returns {!ByteBuffer} this
 * @expose
 */
ByteBufferPrototype.copyTo = function (target, targetOffset, sourceOffset, sourceLimit) {
    var relative,
        targetRelative;
    if (!this.noAssert) {
        if (!ByteBuffer.isByteBuffer(target))
            throw TypeError("Illegal target: Not a ByteBuffer");
    }
    targetOffset = (targetRelative = typeof targetOffset === 'undefined') ? target.offset : targetOffset | 0;
    sourceOffset = (relative = typeof sourceOffset === 'undefined') ? this.offset : sourceOffset | 0;
    sourceLimit = typeof sourceLimit === 'undefined' ? this.limit : sourceLimit | 0;

    if (targetOffset < 0 || targetOffset > target.buffer.byteLength)
        throw RangeError("Illegal target range: 0 <= " + targetOffset + " <= " + target.buffer.byteLength);
    if (sourceOffset < 0 || sourceLimit > this.buffer.byteLength)
        throw RangeError("Illegal source range: 0 <= " + sourceOffset + " <= " + this.buffer.byteLength);

    var len = sourceLimit - sourceOffset;
    if (len === 0)
        return target; // Nothing to copy

    target.ensureCapacity(targetOffset + len);

    target.view.set(this.view.subarray(sourceOffset, sourceLimit), targetOffset);

    if (relative) this.offset += len;
    if (targetRelative) target.offset += len;

    return this;
};

/**
 * Makes sure that this ByteBuffer is backed by a {@link ByteBuffer#buffer} of at least the specified capacity. If the
 *  current capacity is exceeded, it will be doubled. If double the current capacity is less than the required capacity,
 *  the required capacity will be used instead.
 * @param {number} capacity Required capacity
 * @returns {!ByteBuffer} this
 * @expose
 */
ByteBufferPrototype.ensureCapacity = function (capacity) {
    var current = this.buffer.byteLength;
    if (current < capacity)
        return this.resize((current *= 2) > capacity ? current : capacity);
    return this;
};

/**
 * Overwrites this ByteBuffer's contents with the specified value. Contents are the bytes between
 *  {@link ByteBuffer#offset} and {@link ByteBuffer#limit}.
 * @param {number|string} value Byte value to fill with. If given as a string, the first character is used.
 * @param {number=} begin Begin offset. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  written if omitted. defaults to {@link ByteBuffer#offset}.
 * @param {number=} end End offset, defaults to {@link ByteBuffer#limit}.
 * @returns {!ByteBuffer} this
 * @expose
 * @example `someByteBuffer.clear().fill(0)` fills the entire backing buffer with zeroes
 */
ByteBufferPrototype.fill = function (value, begin, end) {
    var relative = typeof begin === 'undefined';
    if (relative) begin = this.offset;
    if (typeof value === 'string' && value.length > 0)
        value = value.charCodeAt(0);
    if (typeof begin === 'undefined') begin = this.offset;
    if (typeof end === 'undefined') end = this.limit;
    if (!this.noAssert) {
        if (typeof value !== 'number' || value % 1 !== 0)
            throw TypeError("Illegal value: " + value + " (not an integer)");
        value |= 0;
        if (typeof begin !== 'number' || begin % 1 !== 0)
            throw TypeError("Illegal begin: Not an integer");
        begin >>>= 0;
        if (typeof end !== 'number' || end % 1 !== 0)
            throw TypeError("Illegal end: Not an integer");
        end >>>= 0;
        if (begin < 0 || begin > end || end > this.buffer.byteLength)
            throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.byteLength);
    }
    if (begin >= end)
        return this; // Nothing to fill
    while (begin < end) this.view[begin++] = value;
    if (relative) this.offset = begin;
    return this;
};

/**
 * Makes this ByteBuffer ready for a new sequence of write or relative read operations. Sets `limit = offset` and
 *  `offset = 0`. Make sure always to flip a ByteBuffer when all relative read or write operations are complete.
 * @returns {!ByteBuffer} this
 * @expose
 */
ByteBufferPrototype.flip = function () {
    this.limit = this.offset;
    this.offset = 0;
    return this;
};
/**
 * Marks an offset on this ByteBuffer to be used later.
 * @param {number=} offset Offset to mark. Defaults to {@link ByteBuffer#offset}.
 * @returns {!ByteBuffer} this
 * @throws {TypeError} If `offset` is not a valid number
 * @throws {RangeError} If `offset` is out of bounds
 * @see ByteBuffer#reset
 * @expose
 */
ByteBufferPrototype.mark = function (offset) {
    offset = typeof offset === 'undefined' ? this.offset : offset;
    if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0)
            throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength)
            throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
    }
    this.markedOffset = offset;
    return this;
};
/**
 * Sets the byte order.
 * @param {boolean} littleEndian `true` for little endian byte order, `false` for big endian
 * @returns {!ByteBuffer} this
 * @expose
 */
ByteBufferPrototype.order = function (littleEndian) {
    if (!this.noAssert) {
        if (typeof littleEndian !== 'boolean')
            throw TypeError("Illegal littleEndian: Not a boolean");
    }
    this.littleEndian = !!littleEndian;
    return this;
};

/**
 * Switches (to) little endian byte order.
 * @param {boolean=} littleEndian Defaults to `true`, otherwise uses big endian
 * @returns {!ByteBuffer} this
 * @expose
 */
ByteBufferPrototype.LE = function (littleEndian) {
    this.littleEndian = typeof littleEndian !== 'undefined' ? !!littleEndian : true;
    return this;
};

/**
 * Switches (to) big endian byte order.
 * @param {boolean=} bigEndian Defaults to `true`, otherwise uses little endian
 * @returns {!ByteBuffer} this
 * @expose
 */
ByteBufferPrototype.BE = function (bigEndian) {
    this.littleEndian = typeof bigEndian !== 'undefined' ? !bigEndian : false;
    return this;
};
/**
 * Prepends some data to this ByteBuffer. This will overwrite any contents before the specified offset up to the
 *  prepended data's length. If there is not enough space available before the specified `offset`, the backing buffer
 *  will be resized and its contents moved accordingly.
 * @param {!ByteBuffer|string|!ArrayBuffer} source Data to prepend. If `source` is a ByteBuffer, its offset will be
 *  modified according to the performed read operation.
 * @param {(string|number)=} encoding Encoding if `data` is a string ("base64", "hex", "binary", defaults to "utf8")
 * @param {number=} offset Offset to prepend at. Will use and decrease {@link ByteBuffer#offset} by the number of bytes
 *  prepended if omitted.
 * @returns {!ByteBuffer} this
 * @expose
 * @example A relative `00<01 02 03>.prepend(<04 05>)` results in `<04 05 01 02 03>, 04 05|`
 * @example An absolute `00<01 02 03>.prepend(<04 05>, 2)` results in `04<05 02 03>, 04 05|`
 */
ByteBufferPrototype.prepend = function (source, encoding, offset) {
    if (typeof encoding === 'number' || typeof encoding !== 'string') {
        offset = encoding;
        encoding = undefined;
    }
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0)
            throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength)
            throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
    }
    if (!(source instanceof ByteBuffer))
        source = ByteBuffer.wrap(source, encoding);
    var len = source.limit - source.offset;
    if (len <= 0) return this; // Nothing to prepend
    var diff = len - offset;
    if (diff > 0) { // Not enough space before offset, so resize + move
        var buffer = new ArrayBuffer(this.buffer.byteLength + diff);
        var view = new Uint8Array(buffer);
        view.set(this.view.subarray(offset, this.buffer.byteLength), len);
        this.buffer = buffer;
        this.view = view;
        this.offset += diff;
        if (this.markedOffset >= 0) this.markedOffset += diff;
        this.limit += diff;
        offset += diff;
    } else {
        var arrayView = new Uint8Array(this.buffer);
    }
    this.view.set(source.view.subarray(source.offset, source.limit), offset - len);

    source.offset = source.limit;
    if (relative)
        this.offset -= len;
    return this;
};

/**
 * Prepends this ByteBuffer to another ByteBuffer. This will overwrite any contents before the specified offset up to the
 *  prepended data's length. If there is not enough space available before the specified `offset`, the backing buffer
 *  will be resized and its contents moved accordingly.
 * @param {!ByteBuffer} target Target ByteBuffer
 * @param {number=} offset Offset to prepend at. Will use and decrease {@link ByteBuffer#offset} by the number of bytes
 *  prepended if omitted.
 * @returns {!ByteBuffer} this
 * @expose
 * @see ByteBuffer#prepend
 */
ByteBufferPrototype.prependTo = function (target, offset) {
    target.prepend(this, offset);
    return this;
};
/**
 * Prints debug information about this ByteBuffer's contents.
 * @param {function(string)=} out Output function to call, defaults to console.log
 * @expose
 */
ByteBufferPrototype.printDebug = function (out) {
    if (typeof out !== 'function') out = console.log.bind(console);
    out(
        this.toString() + "\n" +
        "-------------------------------------------------------------------\n" +
        this.toDebug(/* columns */ true)
    );
};

/**
 * Gets the number of remaining readable bytes. Contents are the bytes between {@link ByteBuffer#offset} and
 *  {@link ByteBuffer#limit}, so this returns `limit - offset`.
 * @returns {number} Remaining readable bytes. May be negative if `offset > limit`.
 * @expose
 */
ByteBufferPrototype.remaining = function () {
    return this.limit - this.offset;
};
/**
 * Resets this ByteBuffer's {@link ByteBuffer#offset}. If an offset has been marked through {@link ByteBuffer#mark}
 *  before, `offset` will be set to {@link ByteBuffer#markedOffset}, which will then be discarded. If no offset has been
 *  marked, sets `offset = 0`.
 * @returns {!ByteBuffer} this
 * @see ByteBuffer#mark
 * @expose
 */
ByteBufferPrototype.reset = function () {
    if (this.markedOffset >= 0) {
        this.offset = this.markedOffset;
        this.markedOffset = -1;
    } else {
        this.offset = 0;
    }
    return this;
};
/**
 * Resizes this ByteBuffer to be backed by a buffer of at least the given capacity. Will do nothing if already that
 *  large or larger.
 * @param {number} capacity Capacity required
 * @returns {!ByteBuffer} this
 * @throws {TypeError} If `capacity` is not a number
 * @throws {RangeError} If `capacity < 0`
 * @expose
 */
ByteBufferPrototype.resize = function (capacity) {
    if (!this.noAssert) {
        if (typeof capacity !== 'number' || capacity % 1 !== 0)
            throw TypeError("Illegal capacity: " + capacity + " (not an integer)");
        capacity |= 0;
        if (capacity < 0)
            throw RangeError("Illegal capacity: 0 <= " + capacity);
    }
    if (this.buffer.byteLength < capacity) {
        var buffer = new ArrayBuffer(capacity);
        var view = new Uint8Array(buffer);
        view.set(this.view);
        this.buffer = buffer;
        this.view = view;
    }
    return this;
};
/**
 * Reverses this ByteBuffer's contents.
 * @param {number=} begin Offset to start at, defaults to {@link ByteBuffer#offset}
 * @param {number=} end Offset to end at, defaults to {@link ByteBuffer#limit}
 * @returns {!ByteBuffer} this
 * @expose
 */
ByteBufferPrototype.reverse = function (begin, end) {
    if (typeof begin === 'undefined') begin = this.offset;
    if (typeof end === 'undefined') end = this.limit;
    if (!this.noAssert) {
        if (typeof begin !== 'number' || begin % 1 !== 0)
            throw TypeError("Illegal begin: Not an integer");
        begin >>>= 0;
        if (typeof end !== 'number' || end % 1 !== 0)
            throw TypeError("Illegal end: Not an integer");
        end >>>= 0;
        if (begin < 0 || begin > end || end > this.buffer.byteLength)
            throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.byteLength);
    }
    if (begin === end)
        return this; // Nothing to reverse
    Array.prototype.reverse.call(this.view.subarray(begin, end));
    return this;
};
/**
 * Skips the next `length` bytes. This will just advance
 * @param {number} length Number of bytes to skip. May also be negative to move the offset back.
 * @returns {!ByteBuffer} this
 * @expose
 */
ByteBufferPrototype.skip = function (length) {
    if (!this.noAssert) {
        if (typeof length !== 'number' || length % 1 !== 0)
            throw TypeError("Illegal length: " + length + " (not an integer)");
        length |= 0;
    }
    var offset = this.offset + length;
    if (!this.noAssert) {
        if (offset < 0 || offset > this.buffer.byteLength)
            throw RangeError("Illegal length: 0 <= " + this.offset + " + " + length + " <= " + this.buffer.byteLength);
    }
    this.offset = offset;
    return this;
};

/**
 * Slices this ByteBuffer by creating a cloned instance with `offset = begin` and `limit = end`.
 * @param {number=} begin Begin offset, defaults to {@link ByteBuffer#offset}.
 * @param {number=} end End offset, defaults to {@link ByteBuffer#limit}.
 * @returns {!ByteBuffer} Clone of this ByteBuffer with slicing applied, backed by the same {@link ByteBuffer#buffer}
 * @expose
 */
ByteBufferPrototype.slice = function (begin, end) {
    if (typeof begin === 'undefined') begin = this.offset;
    if (typeof end === 'undefined') end = this.limit;
    if (!this.noAssert) {
        if (typeof begin !== 'number' || begin % 1 !== 0)
            throw TypeError("Illegal begin: Not an integer");
        begin >>>= 0;
        if (typeof end !== 'number' || end % 1 !== 0)
            throw TypeError("Illegal end: Not an integer");
        end >>>= 0;
        if (begin < 0 || begin > end || end > this.buffer.byteLength)
            throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.byteLength);
    }
    var bb = this.clone();
    bb.offset = begin;
    bb.limit = end;
    return bb;
};
/**
 * Returns a copy of the backing buffer that contains this ByteBuffer's contents. Contents are the bytes between
 *  {@link ByteBuffer#offset} and {@link ByteBuffer#limit}.
 * @param {boolean=} forceCopy If `true` returns a copy, otherwise returns a view referencing the same memory if
 *  possible. Defaults to `false`
 * @returns {!ArrayBuffer} Contents as an ArrayBuffer
 * @expose
 */
ByteBufferPrototype.toBuffer = function (forceCopy) {
    var offset = this.offset,
        limit = this.limit;
    if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0)
            throw TypeError("Illegal offset: Not an integer");
        offset >>>= 0;
        if (typeof limit !== 'number' || limit % 1 !== 0)
            throw TypeError("Illegal limit: Not an integer");
        limit >>>= 0;
        if (offset < 0 || offset > limit || limit > this.buffer.byteLength)
            throw RangeError("Illegal range: 0 <= " + offset + " <= " + limit + " <= " + this.buffer.byteLength);
    }
    // NOTE: It's not possible to have another ArrayBuffer reference the same memory as the backing buffer. This is
    // possible with Uint8Array#subarray only, but we have to return an ArrayBuffer by contract. So:
    if (!forceCopy && offset === 0 && limit === this.buffer.byteLength)
        return this.buffer;
    if (offset === limit)
        return EMPTY_BUFFER;
    var buffer = new ArrayBuffer(limit - offset);
    new Uint8Array(buffer).set(new Uint8Array(this.buffer).subarray(offset, limit), 0);
    return buffer;
};

/**
 * Returns a raw buffer compacted to contain this ByteBuffer's contents. Contents are the bytes between
 *  {@link ByteBuffer#offset} and {@link ByteBuffer#limit}. This is an alias of {@link ByteBuffer#toBuffer}.
 * @function
 * @param {boolean=} forceCopy If `true` returns a copy, otherwise returns a view referencing the same memory.
 *  Defaults to `false`
 * @returns {!ArrayBuffer} Contents as an ArrayBuffer
 * @expose
 */
ByteBufferPrototype.toArrayBuffer = ByteBufferPrototype.toBuffer;

/**
 * Converts the ByteBuffer's contents to a string.
 * @param {string=} encoding Output encoding. Returns an informative string representation if omitted but also allows
 *  direct conversion to "utf8", "hex", "base64" and "binary" encoding. "debug" returns a hex representation with
 *  highlighted offsets.
 * @param {number=} begin Offset to begin at, defaults to {@link ByteBuffer#offset}
 * @param {number=} end Offset to end at, defaults to {@link ByteBuffer#limit}
 * @returns {string} String representation
 * @throws {Error} If `encoding` is invalid
 * @expose
 */
ByteBufferPrototype.toString = function (encoding, begin, end) {
    if (typeof encoding === 'undefined')
        return "ByteBufferAB(offset=" + this.offset + ",markedOffset=" + this.markedOffset + ",limit=" + this.limit + ",capacity=" + this.capacity() + ")";
    if (typeof encoding === 'number')
        encoding = "utf8",
            begin = encoding,
            end = begin;
    switch (encoding) {
        case "utf8":
            return this.toUTF8(begin, end);
        case "base64":
            return this.toBase64(begin, end);
        case "hex":
            return this.toHex(begin, end);
        case "binary":
            return this.toBinary(begin, end);
        case "debug":
            return this.toDebug();
        case "columns":
            return this.toColumns();
        default:
            throw Error("Unsupported encoding: " + encoding);
    }
};

// lxiv-embeddable

/**
 * lxiv-embeddable (c) 2014 Daniel Wirtz <dcode@dcode.io>
 * Released under the Apache License, Version 2.0
 * see: https://github.com/dcodeIO/lxiv for details
 */
var lxiv = function () {
    "use strict";

    /**
     * lxiv namespace.
     * @type {!Object.<string,*>}
     * @exports lxiv
     */
    var lxiv = {};

    /**
     * Character codes for output.
     * @type {!Array.<number>}
     * @inner
     */
    var aout = [
        65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80,
        81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 97, 98, 99, 100, 101, 102,
        103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118,
        119, 120, 121, 122, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 43, 47
    ];

    /**
     * Character codes for input.
     * @type {!Array.<number>}
     * @inner
     */
    var ain = [];
    for (var i = 0, k = aout.length; i < k; ++i)
        ain[aout[i]] = i;

    /**
     * Encodes bytes to base64 char codes.
     * @param {!function():number|null} src Bytes source as a function returning the next byte respectively `null` if
     *  there are no more bytes left.
     * @param {!function(number)} dst Characters destination as a function successively called with each encoded char
     *  code.
     */
    lxiv.encode = function (src, dst) {
        var b, t;
        while ((b = src()) !== null) {
            dst(aout[(b >> 2) & 0x3f]);
            t = (b & 0x3) << 4;
            if ((b = src()) !== null) {
                t |= (b >> 4) & 0xf;
                dst(aout[(t | ((b >> 4) & 0xf)) & 0x3f]);
                t = (b & 0xf) << 2;
                if ((b = src()) !== null)
                    dst(aout[(t | ((b >> 6) & 0x3)) & 0x3f]),
                        dst(aout[b & 0x3f]);
                else
                    dst(aout[t & 0x3f]),
                        dst(61);
            } else
                dst(aout[t & 0x3f]),
                    dst(61),
                    dst(61);
        }
    };

    /**
     * Decodes base64 char codes to bytes.
     * @param {!function():number|null} src Characters source as a function returning the next char code respectively
     *  `null` if there are no more characters left.
     * @param {!function(number)} dst Bytes destination as a function successively called with the next byte.
     * @throws {Error} If a character code is invalid
     */
    lxiv.decode = function (src, dst) {
        var c, t1, t2;

        function fail(c) {
            throw Error("Illegal character code: " + c);
        }

        while ((c = src()) !== null) {
            t1 = ain[c];
            if (typeof t1 === 'undefined') fail(c);
            if ((c = src()) !== null) {
                t2 = ain[c];
                if (typeof t2 === 'undefined') fail(c);
                dst((t1 << 2) >>> 0 | (t2 & 0x30) >> 4);
                if ((c = src()) !== null) {
                    t1 = ain[c];
                    if (typeof t1 === 'undefined')
                        if (c === 61) break; else fail(c);
                    dst(((t2 & 0xf) << 4) >>> 0 | (t1 & 0x3c) >> 2);
                    if ((c = src()) !== null) {
                        t2 = ain[c];
                        if (typeof t2 === 'undefined')
                            if (c === 61) break; else fail(c);
                        dst(((t1 & 0x3) << 6) >>> 0 | t2);
                    }
                }
            }
        }
    };

    /**
     * Tests if a string is valid base64.
     * @param {string} str String to test
     * @returns {boolean} `true` if valid, otherwise `false`
     */
    lxiv.test = function (str) {
        return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(str);
    };

    return lxiv;
}();

// encodings/base64

/**
 * Encodes this ByteBuffer's contents to a base64 encoded string.
 * @param {number=} begin Offset to begin at, defaults to {@link ByteBuffer#offset}.
 * @param {number=} end Offset to end at, defaults to {@link ByteBuffer#limit}.
 * @returns {string} Base64 encoded string
 * @throws {RangeError} If `begin` or `end` is out of bounds
 * @expose
 */
ByteBufferPrototype.toBase64 = function (begin, end) {
    if (typeof begin === 'undefined')
        begin = this.offset;
    if (typeof end === 'undefined')
        end = this.limit;
    begin = begin | 0;
    end = end | 0;
    if (begin < 0 || end > this.capacity || begin > end)
        throw RangeError("begin, end");
    var sd;
    lxiv.encode(function () {
        return begin < end ? this.view[begin++] : null;
    }.bind(this), sd = stringDestination());
    return sd();
};

/**
 * Decodes a base64 encoded string to a ByteBuffer.
 * @param {string} str String to decode
 * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
 *  {@link ByteBuffer.DEFAULT_ENDIAN}.
 * @returns {!ByteBuffer} ByteBuffer
 * @expose
 */
ByteBuffer.fromBase64 = function (str, littleEndian) {
    if (typeof str !== 'string')
        throw TypeError("str");
    var bb = new ByteBuffer(str.length / 4 * 3, littleEndian),
        i = 0;
    lxiv.decode(stringSource(str), function (b) {
        bb.view[i++] = b;
    });
    bb.limit = i;
    return bb;
};

/**
 * Encodes a binary string to base64 like `window.btoa` does.
 * @param {string} str Binary string
 * @returns {string} Base64 encoded string
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window.btoa
 * @expose
 */
ByteBuffer.btoa = function (str) {
    return ByteBuffer.fromBinary(str).toBase64();
};

/**
 * Decodes a base64 encoded string to binary like `window.atob` does.
 * @param {string} b64 Base64 encoded string
 * @returns {string} Binary string
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window.atob
 * @expose
 */
ByteBuffer.atob = function (b64) {
    return ByteBuffer.fromBase64(b64).toBinary();
};

// encodings/binary

/**
 * Encodes this ByteBuffer to a binary encoded string, that is using only characters 0x00-0xFF as bytes.
 * @param {number=} begin Offset to begin at. Defaults to {@link ByteBuffer#offset}.
 * @param {number=} end Offset to end at. Defaults to {@link ByteBuffer#limit}.
 * @returns {string} Binary encoded string
 * @throws {RangeError} If `offset > limit`
 * @expose
 */
ByteBufferPrototype.toBinary = function (begin, end) {
    if (typeof begin === 'undefined')
        begin = this.offset;
    if (typeof end === 'undefined')
        end = this.limit;
    begin |= 0;
    end |= 0;
    if (begin < 0 || end > this.capacity() || begin > end)
        throw RangeError("begin, end");
    if (begin === end)
        return "";
    var chars = [],
        parts = [];
    while (begin < end) {
        chars.push(this.view[begin++]);
        if (chars.length >= 1024)
            parts.push(String.fromCharCode.apply(String, chars)),
                chars = [];
    }
    return parts.join('') + String.fromCharCode.apply(String, chars);
};

/**
 * Decodes a binary encoded string, that is using only characters 0x00-0xFF as bytes, to a ByteBuffer.
 * @param {string} str String to decode
 * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
 *  {@link ByteBuffer.DEFAULT_ENDIAN}.
 * @returns {!ByteBuffer} ByteBuffer
 * @expose
 */
ByteBuffer.fromBinary = function (str, littleEndian) {
    if (typeof str !== 'string')
        throw TypeError("str");
    var i = 0,
        k = str.length,
        charCode,
        bb = new ByteBuffer(k, littleEndian);
    while (i < k) {
        charCode = str.charCodeAt(i);
        if (charCode > 0xff)
            throw RangeError("illegal char code: " + charCode);
        bb.view[i++] = charCode;
    }
    bb.limit = k;
    return bb;
};

// encodings/debug

/**
 * Encodes this ByteBuffer to a hex encoded string with marked offsets. Offset symbols are:
 * * `<` : offset,
 * * `'` : markedOffset,
 * * `>` : limit,
 * * `|` : offset and limit,
 * * `[` : offset and markedOffset,
 * * `]` : markedOffset and limit,
 * * `!` : offset, markedOffset and limit
 * @param {boolean=} columns If `true` returns two columns hex + ascii, defaults to `false`
 * @returns {string|!Array.<string>} Debug string or array of lines if `asArray = true`
 * @expose
 * @example `>00'01 02<03` contains four bytes with `limit=0, markedOffset=1, offset=3`
 * @example `00[01 02 03>` contains four bytes with `offset=markedOffset=1, limit=4`
 * @example `00|01 02 03` contains four bytes with `offset=limit=1, markedOffset=-1`
 * @example `|` contains zero bytes with `offset=limit=0, markedOffset=-1`
 */
ByteBufferPrototype.toDebug = function (columns) {
    var i = -1,
        k = this.buffer.byteLength,
        b,
        hex = "",
        asc = "",
        out = "";
    while (i < k) {
        if (i !== -1) {
            b = this.view[i];
            if (b < 0x10) hex += "0" + b.toString(16).toUpperCase();
            else hex += b.toString(16).toUpperCase();
            if (columns)
                asc += b > 32 && b < 127 ? String.fromCharCode(b) : '.';
        }
        ++i;
        if (columns) {
            if (i > 0 && i % 16 === 0 && i !== k) {
                while (hex.length < 3 * 16 + 3) hex += " ";
                out += hex + asc + "\n";
                hex = asc = "";
            }
        }
        if (i === this.offset && i === this.limit)
            hex += i === this.markedOffset ? "!" : "|";
        else if (i === this.offset)
            hex += i === this.markedOffset ? "[" : "<";
        else if (i === this.limit)
            hex += i === this.markedOffset ? "]" : ">";
        else
            hex += i === this.markedOffset ? "'" : (columns || (i !== 0 && i !== k) ? " " : "");
    }
    if (columns && hex !== " ") {
        while (hex.length < 3 * 16 + 3)
            hex += " ";
        out += hex + asc + "\n";
    }
    return columns ? out : hex;
};

/**
 * Decodes a hex encoded string with marked offsets to a ByteBuffer.
 * @param {string} str Debug string to decode (not be generated with `columns = true`)
 * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
 *  {@link ByteBuffer.DEFAULT_ENDIAN}.
 * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
 *  {@link ByteBuffer.DEFAULT_NOASSERT}.
 * @returns {!ByteBuffer} ByteBuffer
 * @expose
 * @see ByteBuffer#toDebug
 */
ByteBuffer.fromDebug = function (str, littleEndian, noAssert) {
    var k = str.length,
        bb = new ByteBuffer(((k + 1) / 3) | 0, littleEndian, noAssert);
    var i = 0, j = 0, ch, b,
        rs = false, // Require symbol next
        ho = false, hm = false, hl = false, // Already has offset (ho), markedOffset (hm), limit (hl)?
        fail = false;
    while (i < k) {
        switch (ch = str.charAt(i++)) {
            case '!':
                if (!noAssert) {
                    if (ho || hm || hl) {
                        fail = true;
                        break;
                    }
                    ho = hm = hl = true;
                }
                bb.offset = bb.markedOffset = bb.limit = j;
                rs = false;
                break;
            case '|':
                if (!noAssert) {
                    if (ho || hl) {
                        fail = true;
                        break;
                    }
                    ho = hl = true;
                }
                bb.offset = bb.limit = j;
                rs = false;
                break;
            case '[':
                if (!noAssert) {
                    if (ho || hm) {
                        fail = true;
                        break;
                    }
                    ho = hm = true;
                }
                bb.offset = bb.markedOffset = j;
                rs = false;
                break;
            case '<':
                if (!noAssert) {
                    if (ho) {
                        fail = true;
                        break;
                    }
                    ho = true;
                }
                bb.offset = j;
                rs = false;
                break;
            case ']':
                if (!noAssert) {
                    if (hl || hm) {
                        fail = true;
                        break;
                    }
                    hl = hm = true;
                }
                bb.limit = bb.markedOffset = j;
                rs = false;
                break;
            case '>':
                if (!noAssert) {
                    if (hl) {
                        fail = true;
                        break;
                    }
                    hl = true;
                }
                bb.limit = j;
                rs = false;
                break;
            case "'":
                if (!noAssert) {
                    if (hm) {
                        fail = true;
                        break;
                    }
                    hm = true;
                }
                bb.markedOffset = j;
                rs = false;
                break;
            case ' ':
                rs = false;
                break;
            default:
                if (!noAssert) {
                    if (rs) {
                        fail = true;
                        break;
                    }
                }
                b = parseInt(ch + str.charAt(i++), 16);
                if (!noAssert) {
                    if (isNaN(b) || b < 0 || b > 255)
                        throw TypeError("Illegal str: Not a debug encoded string");
                }
                bb.view[j++] = b;
                rs = true;
        }
        if (fail)
            throw TypeError("Illegal str: Invalid symbol at " + i);
    }
    if (!noAssert) {
        if (!ho || !hl)
            throw TypeError("Illegal str: Missing offset or limit");
        if (j < bb.buffer.byteLength)
            throw TypeError("Illegal str: Not a debug encoded string (is it hex?) " + j + " < " + k);
    }
    return bb;
};

// encodings/hex

/**
 * Encodes this ByteBuffer's contents to a hex encoded string.
 * @param {number=} begin Offset to begin at. Defaults to {@link ByteBuffer#offset}.
 * @param {number=} end Offset to end at. Defaults to {@link ByteBuffer#limit}.
 * @returns {string} Hex encoded string
 * @expose
 */
ByteBufferPrototype.toHex = function (begin, end) {
    begin = typeof begin === 'undefined' ? this.offset : begin;
    end = typeof end === 'undefined' ? this.limit : end;
    if (!this.noAssert) {
        if (typeof begin !== 'number' || begin % 1 !== 0)
            throw TypeError("Illegal begin: Not an integer");
        begin >>>= 0;
        if (typeof end !== 'number' || end % 1 !== 0)
            throw TypeError("Illegal end: Not an integer");
        end >>>= 0;
        if (begin < 0 || begin > end || end > this.buffer.byteLength)
            throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.byteLength);
    }
    var out = new Array(end - begin),
        b;
    while (begin < end) {
        b = this.view[begin++];
        if (b < 0x10)
            out.push("0", b.toString(16));
        else out.push(b.toString(16));
    }
    return out.join('');
};

/**
 * Decodes a hex encoded string to a ByteBuffer.
 * @param {string} str String to decode
 * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
 *  {@link ByteBuffer.DEFAULT_ENDIAN}.
 * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
 *  {@link ByteBuffer.DEFAULT_NOASSERT}.
 * @returns {!ByteBuffer} ByteBuffer
 * @expose
 */
ByteBuffer.fromHex = function (str, littleEndian, noAssert) {
    if (!noAssert) {
        if (typeof str !== 'string')
            throw TypeError("Illegal str: Not a string");
        if (str.length % 2 !== 0)
            throw TypeError("Illegal str: Length not a multiple of 2");
    }
    var k = str.length,
        bb = new ByteBuffer((k / 2) | 0, littleEndian),
        b;
    for (var i = 0, j = 0; i < k; i += 2) {
        b = parseInt(str.substring(i, i + 2), 16);
        if (!noAssert)
            if (!isFinite(b) || b < 0 || b > 255)
                throw TypeError("Illegal str: Contains non-hex characters");
        bb.view[j++] = b;
    }
    bb.limit = j;
    return bb;
};

// utfx-embeddable

/**
 * utfx-embeddable (c) 2014 Daniel Wirtz <dcode@dcode.io>
 * Released under the Apache License, Version 2.0
 * see: https://github.com/dcodeIO/utfx for details
 */
var utfx = function () {
    "use strict";

    /**
     * utfx namespace.
     * @inner
     * @type {!Object.<string,*>}
     */
    var utfx = {};

    /**
     * Maximum valid code point.
     * @type {number}
     * @const
     */
    utfx.MAX_CODEPOINT = 0x10FFFF;

    /**
     * Encodes UTF8 code points to UTF8 bytes.
     * @param {(!function():number|null) | number} src Code points source, either as a function returning the next code point
     *  respectively `null` if there are no more code points left or a single numeric code point.
     * @param {!function(number)} dst Bytes destination as a function successively called with the next byte
     */
    utfx.encodeUTF8 = function (src, dst) {
        var cp = null;
        if (typeof src === 'number')
            cp = src,
                src = function () {
                    return null;
                };
        while (cp !== null || (cp = src()) !== null) {
            if (cp < 0x80)
                dst(cp & 0x7F);
            else if (cp < 0x800)
                dst(((cp >> 6) & 0x1F) | 0xC0),
                    dst((cp & 0x3F) | 0x80);
            else if (cp < 0x10000)
                dst(((cp >> 12) & 0x0F) | 0xE0),
                    dst(((cp >> 6) & 0x3F) | 0x80),
                    dst((cp & 0x3F) | 0x80);
            else
                dst(((cp >> 18) & 0x07) | 0xF0),
                    dst(((cp >> 12) & 0x3F) | 0x80),
                    dst(((cp >> 6) & 0x3F) | 0x80),
                    dst((cp & 0x3F) | 0x80);
            cp = null;
        }
    };

    /**
     * Decodes UTF8 bytes to UTF8 code points.
     * @param {!function():number|null} src Bytes source as a function returning the next byte respectively `null` if there
     *  are no more bytes left.
     * @param {!function(number)} dst Code points destination as a function successively called with each decoded code point.
     * @throws {RangeError} If a starting byte is invalid in UTF8
     * @throws {Error} If the last sequence is truncated. Has an array property `bytes` holding the
     *  remaining bytes.
     */
    utfx.decodeUTF8 = function (src, dst) {
        var a, b, c, d, fail = function (b) {
            b = b.slice(0, b.indexOf(null));
            var err = Error(b.toString());
            err.name = "TruncatedError";
            err['bytes'] = b;
            throw err;
        };
        while ((a = src()) !== null) {
            if ((a & 0x80) === 0)
                dst(a);
            else if ((a & 0xE0) === 0xC0)
                ((b = src()) === null) && fail([a, b]),
                    dst(((a & 0x1F) << 6) | (b & 0x3F));
            else if ((a & 0xF0) === 0xE0)
                ((b = src()) === null || (c = src()) === null) && fail([a, b, c]),
                    dst(((a & 0x0F) << 12) | ((b & 0x3F) << 6) | (c & 0x3F));
            else if ((a & 0xF8) === 0xF0)
                ((b = src()) === null || (c = src()) === null || (d = src()) === null) && fail([a, b, c, d]),
                    dst(((a & 0x07) << 18) | ((b & 0x3F) << 12) | ((c & 0x3F) << 6) | (d & 0x3F));
            else throw RangeError("Illegal starting byte: " + a);
        }
    };

    /**
     * Converts UTF16 characters to UTF8 code points.
     * @param {!function():number|null} src Characters source as a function returning the next char code respectively
     *  `null` if there are no more characters left.
     * @param {!function(number)} dst Code points destination as a function successively called with each converted code
     *  point.
     */
    utfx.UTF16toUTF8 = function (src, dst) {
        var c1, c2 = null;
        while (true) {
            if ((c1 = c2 !== null ? c2 : src()) === null)
                break;
            if (c1 >= 0xD800 && c1 <= 0xDFFF) {
                if ((c2 = src()) !== null) {
                    if (c2 >= 0xDC00 && c2 <= 0xDFFF) {
                        dst((c1 - 0xD800) * 0x400 + c2 - 0xDC00 + 0x10000);
                        c2 = null;
                        continue;
                    }
                }
            }
            dst(c1);
        }
        if (c2 !== null) dst(c2);
    };

    /**
     * Converts UTF8 code points to UTF16 characters.
     * @param {(!function():number|null) | number} src Code points source, either as a function returning the next code point
     *  respectively `null` if there are no more code points left or a single numeric code point.
     * @param {!function(number)} dst Characters destination as a function successively called with each converted char code.
     * @throws {RangeError} If a code point is out of range
     */
    utfx.UTF8toUTF16 = function (src, dst) {
        var cp = null;
        if (typeof src === 'number')
            cp = src, src = function () {
                return null;
            };
        while (cp !== null || (cp = src()) !== null) {
            if (cp <= 0xFFFF)
                dst(cp);
            else
                cp -= 0x10000,
                    dst((cp >> 10) + 0xD800),
                    dst((cp % 0x400) + 0xDC00);
            cp = null;
        }
    };

    /**
     * Converts and encodes UTF16 characters to UTF8 bytes.
     * @param {!function():number|null} src Characters source as a function returning the next char code respectively `null`
     *  if there are no more characters left.
     * @param {!function(number)} dst Bytes destination as a function successively called with the next byte.
     */
    utfx.encodeUTF16toUTF8 = function (src, dst) {
        utfx.UTF16toUTF8(src, function (cp) {
            utfx.encodeUTF8(cp, dst);
        });
    };

    /**
     * Decodes and converts UTF8 bytes to UTF16 characters.
     * @param {!function():number|null} src Bytes source as a function returning the next byte respectively `null` if there
     *  are no more bytes left.
     * @param {!function(number)} dst Characters destination as a function successively called with each converted char code.
     * @throws {RangeError} If a starting byte is invalid in UTF8
     * @throws {Error} If the last sequence is truncated. Has an array property `bytes` holding the remaining bytes.
     */
    utfx.decodeUTF8toUTF16 = function (src, dst) {
        utfx.decodeUTF8(src, function (cp) {
            utfx.UTF8toUTF16(cp, dst);
        });
    };

    /**
     * Calculates the byte length of an UTF8 code point.
     * @param {number} cp UTF8 code point
     * @returns {number} Byte length
     */
    utfx.calculateCodePoint = function (cp) {
        return (cp < 0x80) ? 1 : (cp < 0x800) ? 2 : (cp < 0x10000) ? 3 : 4;
    };

    /**
     * Calculates the number of UTF8 bytes required to store UTF8 code points.
     * @param {(!function():number|null)} src Code points source as a function returning the next code point respectively
     *  `null` if there are no more code points left.
     * @returns {number} The number of UTF8 bytes required
     */
    utfx.calculateUTF8 = function (src) {
        var cp, l = 0;
        while ((cp = src()) !== null)
            l += (cp < 0x80) ? 1 : (cp < 0x800) ? 2 : (cp < 0x10000) ? 3 : 4;
        return l;
    };

    /**
     * Calculates the number of UTF8 code points respectively UTF8 bytes required to store UTF16 char codes.
     * @param {(!function():number|null)} src Characters source as a function returning the next char code respectively
     *  `null` if there are no more characters left.
     * @returns {!Array.<number>} The number of UTF8 code points at index 0 and the number of UTF8 bytes required at index 1.
     */
    utfx.calculateUTF16asUTF8 = function (src) {
        var n = 0, l = 0;
        utfx.UTF16toUTF8(src, function (cp) {
            ++n;
            l += (cp < 0x80) ? 1 : (cp < 0x800) ? 2 : (cp < 0x10000) ? 3 : 4;
        });
        return [n, l];
    };

    return utfx;
}();

// encodings/utf8

/**
 * Encodes this ByteBuffer's contents between {@link ByteBuffer#offset} and {@link ByteBuffer#limit} to an UTF8 encoded
 *  string.
 * @returns {string} Hex encoded string
 * @throws {RangeError} If `offset > limit`
 * @expose
 */
ByteBufferPrototype.toUTF8 = function (begin, end) {
    if (typeof begin === 'undefined') begin = this.offset;
    if (typeof end === 'undefined') end = this.limit;
    if (!this.noAssert) {
        if (typeof begin !== 'number' || begin % 1 !== 0)
            throw TypeError("Illegal begin: Not an integer");
        begin >>>= 0;
        if (typeof end !== 'number' || end % 1 !== 0)
            throw TypeError("Illegal end: Not an integer");
        end >>>= 0;
        if (begin < 0 || begin > end || end > this.buffer.byteLength)
            throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.byteLength);
    }
    var sd;
    try {
        utfx.decodeUTF8toUTF16(function () {
            return begin < end ? this.view[begin++] : null;
        }.bind(this), sd = stringDestination());
    } catch (e) {
        if (begin !== end)
            throw RangeError("Illegal range: Truncated data, " + begin + " != " + end);
    }
    return sd();
};

/**
 * Decodes an UTF8 encoded string to a ByteBuffer.
 * @param {string} str String to decode
 * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
 *  {@link ByteBuffer.DEFAULT_ENDIAN}.
 * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
 *  {@link ByteBuffer.DEFAULT_NOASSERT}.
 * @returns {!ByteBuffer} ByteBuffer
 * @expose
 */
ByteBuffer.fromUTF8 = function (str, littleEndian, noAssert) {
    if (!noAssert)
        if (typeof str !== 'string')
            throw TypeError("Illegal str: Not a string");
    var bb = new ByteBuffer(utfx.calculateUTF16asUTF8(stringSource(str), true)[1], littleEndian, noAssert),
        i = 0;
    utfx.encodeUTF16toUTF8(stringSource(str), function (b) {
        bb.view[i++] = b;
    });
    bb.limit = i;
    return bb;
};