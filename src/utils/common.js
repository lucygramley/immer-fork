"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrototypeOf = void 0;
exports.isDraft = isDraft;
exports.isDraftable = isDraftable;
exports.isPlainObject = isPlainObject;
exports.original = original;
exports.each = each;
exports.getArchtype = getArchtype;
exports.has = has;
exports.get = get;
exports.set = set;
exports.is = is;
exports.isMap = isMap;
exports.isSet = isSet;
exports.latest = latest;
exports.shallowCopy = shallowCopy;
exports.freeze = freeze;
exports.isFrozen = isFrozen;
var internal_1 = require("../internal");
exports.getPrototypeOf = Object.getPrototypeOf;
/** Returns true if the given value is an Immer draft */
/*#__PURE__*/
function isDraft(value) {
    return !!value && !!value[internal_1.DRAFT_STATE];
}
/** Returns true if the given value can be drafted by Immer */
/*#__PURE__*/
function isDraftable(value) {
    var _a;
    if (!value)
        return false;
    return (isPlainObject(value) ||
        Array.isArray(value) ||
        !!value[internal_1.DRAFTABLE] ||
        !!((_a = value.constructor) === null || _a === void 0 ? void 0 : _a[internal_1.DRAFTABLE]) ||
        isMap(value) ||
        isSet(value));
}
var objectCtorString = Object.prototype.constructor.toString();
/*#__PURE__*/
function isPlainObject(value) {
    if (!value || typeof value !== "object")
        return false;
    var proto = (0, exports.getPrototypeOf)(value);
    if (proto === null) {
        return true;
    }
    var Ctor = Object.hasOwnProperty.call(proto, "constructor") && proto.constructor;
    if (Ctor === Object)
        return true;
    return (typeof Ctor == "function" &&
        Function.toString.call(Ctor) === objectCtorString);
}
function original(value) {
    if (!isDraft(value))
        (0, internal_1.die)(15, value);
    return value[internal_1.DRAFT_STATE].base_;
}
function each(obj, iter) {
    if (getArchtype(obj) === 0 /* ArchType.Object */) {
        Reflect.ownKeys(obj).forEach(function (key) {
            iter(key, obj[key], obj);
        });
    }
    else {
        obj.forEach(function (entry, index) { return iter(index, entry, obj); });
    }
}
/*#__PURE__*/
function getArchtype(thing) {
    var state = thing[internal_1.DRAFT_STATE];
    return state
        ? state.type_
        : Array.isArray(thing)
            ? 1 /* ArchType.Array */
            : isMap(thing)
                ? 2 /* ArchType.Map */
                : isSet(thing)
                    ? 3 /* ArchType.Set */
                    : 0 /* ArchType.Object */;
}
/*#__PURE__*/
function has(thing, prop) {
    return getArchtype(thing) === 2 /* ArchType.Map */
        ? thing.has(prop)
        : Object.prototype.hasOwnProperty.call(thing, prop);
}
/*#__PURE__*/
function get(thing, prop) {
    // @ts-ignore
    return getArchtype(thing) === 2 /* ArchType.Map */ ? thing.get(prop) : thing[prop];
}
/*#__PURE__*/
function set(thing, propOrOldValue, value) {
    var t = getArchtype(thing);
    if (t === 2 /* ArchType.Map */)
        thing.set(propOrOldValue, value);
    else if (t === 3 /* ArchType.Set */) {
        thing.add(value);
    }
    else
        thing[propOrOldValue] = value;
}
/*#__PURE__*/
function is(x, y) {
    // From: https://github.com/facebook/fbjs/blob/c69904a511b900266935168223063dd8772dfc40/packages/fbjs/src/core/shallowEqual.js
    if (x === y) {
        return x !== 0 || 1 / x === 1 / y;
    }
    else {
        return x !== x && y !== y;
    }
}
/*#__PURE__*/
function isMap(target) {
    return target instanceof Map;
}
/*#__PURE__*/
function isSet(target) {
    return target instanceof Set;
}
/*#__PURE__*/
function latest(state) {
    return state.copy_ || state.base_;
}
/*#__PURE__*/
function shallowCopy(base, strict) {
    if (isMap(base)) {
        return new Map(base);
    }
    if (isSet(base)) {
        return new Set(base);
    }
    if (Array.isArray(base))
        return Array.prototype.slice.call(base);
    var isPlain = isPlainObject(base);
    if (strict === true || (strict === "class_only" && !isPlain)) {
        // Perform a strict copy
        var descriptors = Object.getOwnPropertyDescriptors(base);
        delete descriptors[internal_1.DRAFT_STATE];
        var keys = Reflect.ownKeys(descriptors);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var desc = descriptors[key];
            if (desc.writable === false) {
                desc.writable = true;
                desc.configurable = true;
            }
            // like object.assign, we will read any _own_, get/set accessors. This helps in dealing
            // with libraries that trap values, like mobx or vue
            // unlike object.assign, non-enumerables will be copied as well
            if (desc.get || desc.set)
                descriptors[key] = {
                    configurable: true,
                    writable: true, // could live with !!desc.set as well here...
                    enumerable: desc.enumerable,
                    value: base[key]
                };
        }
        return Object.create((0, exports.getPrototypeOf)(base), descriptors);
    }
    else {
        // perform a sloppy copy
        var proto = (0, exports.getPrototypeOf)(base);
        if (proto !== null && isPlain) {
            return __assign({}, base); // assumption: better inner class optimization than the assign below
        }
        var obj = Object.create(proto);
        return Object.assign(obj, base);
    }
}
function freeze(obj, deep) {
    if (deep === void 0) { deep = false; }
    if (isFrozen(obj) || isDraft(obj) || !isDraftable(obj))
        return obj;
    if (getArchtype(obj) > 1 /* Map or Set */) {
        obj.set = obj.add = obj.clear = obj.delete = dontMutateFrozenCollections;
    }
    Object.freeze(obj);
    if (deep)
        // See #590, don't recurse into non-enumerable / Symbol properties when freezing
        // So use Object.values (only string-like, enumerables) instead of each()
        Object.values(obj).forEach(function (value) { return freeze(value, true); });
    return obj;
}
function dontMutateFrozenCollections() {
    (0, internal_1.die)(2);
}
function isFrozen(obj) {
    return Object.isFrozen(obj);
}
