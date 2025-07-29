"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enableMapSet = exports.enablePatches = exports.Immer = exports.finishDraft = exports.createDraft = exports.applyPatches = exports.setUseStrictShallowCopy = exports.setAutoFreeze = exports.produceWithPatches = exports.produce = exports.freeze = exports.immerable = exports.nothing = exports.isDraftable = exports.isDraft = exports.current = exports.original = void 0;
exports.castDraft = castDraft;
exports.castImmutable = castImmutable;
var internal_1 = require("./internal");
Object.defineProperty(exports, "Immer", { enumerable: true, get: function () { return internal_1.Immer; } });
var internal_2 = require("./internal");
Object.defineProperty(exports, "original", { enumerable: true, get: function () { return internal_2.original; } });
Object.defineProperty(exports, "current", { enumerable: true, get: function () { return internal_2.current; } });
Object.defineProperty(exports, "isDraft", { enumerable: true, get: function () { return internal_2.isDraft; } });
Object.defineProperty(exports, "isDraftable", { enumerable: true, get: function () { return internal_2.isDraftable; } });
Object.defineProperty(exports, "nothing", { enumerable: true, get: function () { return internal_2.NOTHING; } });
Object.defineProperty(exports, "immerable", { enumerable: true, get: function () { return internal_2.DRAFTABLE; } });
Object.defineProperty(exports, "freeze", { enumerable: true, get: function () { return internal_2.freeze; } });
var immer = new internal_1.Immer();
/**
 * The `produce` function takes a value and a "recipe function" (whose
 * return value often depends on the base state). The recipe function is
 * free to mutate its first argument however it wants. All mutations are
 * only ever applied to a __copy__ of the base state.
 *
 * Pass only a function to create a "curried producer" which relieves you
 * from passing the recipe function every time.
 *
 * Only plain objects and arrays are made mutable. All other objects are
 * considered uncopyable.
 *
 * Note: This function is __bound__ to its `Immer` instance.
 *
 * @param {any} base - the initial state
 * @param {Function} producer - function that receives a proxy of the base state as first argument and which can be freely modified
 * @param {Function} patchListener - optional function that will be called with all the patches produced here
 * @returns {any} a new state, or the initial state if nothing was modified
 */
exports.produce = immer.produce;
/**
 * Like `produce`, but `produceWithPatches` always returns a tuple
 * [nextState, patches, inversePatches] (instead of just the next state)
 */
exports.produceWithPatches = immer.produceWithPatches.bind(immer);
/**
 * Pass true to automatically freeze all copies created by Immer.
 *
 * Always freeze by default, even in production mode
 */
exports.setAutoFreeze = immer.setAutoFreeze.bind(immer);
/**
 * Pass true to enable strict shallow copy.
 *
 * By default, immer does not copy the object descriptors such as getter, setter and non-enumrable properties.
 */
exports.setUseStrictShallowCopy = immer.setUseStrictShallowCopy.bind(immer);
/**
 * Apply an array of Immer patches to the first argument.
 *
 * This function is a producer, which means copy-on-write is in effect.
 */
exports.applyPatches = immer.applyPatches.bind(immer);
/**
 * Create an Immer draft from the given base state, which may be a draft itself.
 * The draft can be modified until you finalize it with the `finishDraft` function.
 */
exports.createDraft = immer.createDraft.bind(immer);
/**
 * Finalize an Immer draft from a `createDraft` call, returning the base state
 * (if no changes were made) or a modified copy. The draft must *not* be
 * mutated afterwards.
 *
 * Pass a function as the 2nd argument to generate Immer patches based on the
 * changes that were made.
 */
exports.finishDraft = immer.finishDraft.bind(immer);
/**
 * This function is actually a no-op, but can be used to cast an immutable type
 * to an draft type and make TypeScript happy
 *
 * @param value
 */
function castDraft(value) {
    return value;
}
/**
 * This function is actually a no-op, but can be used to cast a mutable type
 * to an immutable type and make TypeScript happy
 * @param value
 */
function castImmutable(value) {
    return value;
}
var patches_1 = require("./plugins/patches");
Object.defineProperty(exports, "enablePatches", { enumerable: true, get: function () { return patches_1.enablePatches; } });
var mapset_1 = require("./plugins/mapset");
Object.defineProperty(exports, "enableMapSet", { enumerable: true, get: function () { return mapset_1.enableMapSet; } });
