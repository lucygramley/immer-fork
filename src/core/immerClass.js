"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Immer = void 0;
exports.createProxy = createProxy;
var internal_1 = require("../internal");
var Immer = /** @class */ (function () {
    function Immer(config) {
        var _this = this;
        this.autoFreeze_ = true;
        this.useStrictShallowCopy_ = false;
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
         * @param {Function} recipe - function that receives a proxy of the base state as first argument and which can be freely modified
         * @param {Function} patchListener - optional function that will be called with all the patches produced here
         * @returns {any} a new state, or the initial state if nothing was modified
         */
        this.produce = function (base, recipe, patchListener) {
            // curried invocation
            if (typeof base === "function" && typeof recipe !== "function") {
                var defaultBase_1 = recipe;
                recipe = base;
                var self_1 = _this;
                return function curriedProduce(base) {
                    var _this = this;
                    if (base === void 0) { base = defaultBase_1; }
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    return self_1.produce(base, function (draft) { return recipe.call.apply(recipe, __spreadArray([_this, draft], args, false)); }); // prettier-ignore
                };
            }
            if (typeof recipe !== "function")
                (0, internal_1.die)(6);
            if (patchListener !== undefined && typeof patchListener !== "function")
                (0, internal_1.die)(7);
            var result;
            // Only plain objects, arrays, and "immerable classes" are drafted.
            if ((0, internal_1.isDraftable)(base)) {
                var scope = (0, internal_1.enterScope)(_this);
                var proxy = createProxy(base, undefined);
                var hasError = true;
                try {
                    result = recipe(proxy);
                    hasError = false;
                }
                finally {
                    // finally instead of catch + rethrow better preserves original stack
                    if (hasError)
                        (0, internal_1.revokeScope)(scope);
                    else
                        (0, internal_1.leaveScope)(scope);
                }
                (0, internal_1.usePatchesInScope)(scope, patchListener);
                return (0, internal_1.processResult)(result, scope);
            }
            else if (!base || typeof base !== "object") {
                result = recipe(base);
                if (result === undefined)
                    result = base;
                if (result === internal_1.NOTHING)
                    result = undefined;
                if (_this.autoFreeze_)
                    (0, internal_1.freeze)(result, true);
                if (patchListener) {
                    var p = [];
                    var ip = [];
                    (0, internal_1.getPlugin)("Patches").generateReplacementPatches_(base, result, p, ip);
                    patchListener(p, ip);
                }
                return result;
            }
            else
                (0, internal_1.die)(1, base);
        };
        this.produceWithPatches = function (base, recipe) {
            // curried invocation
            if (typeof base === "function") {
                return function (state) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    return _this.produceWithPatches(state, function (draft) { return base.apply(void 0, __spreadArray([draft], args, false)); });
                };
            }
            var patches, inversePatches;
            var result = _this.produce(base, recipe, function (p, ip) {
                patches = p;
                inversePatches = ip;
            });
            return [result, patches, inversePatches];
        };
        if (typeof (config === null || config === void 0 ? void 0 : config.autoFreeze) === "boolean")
            this.setAutoFreeze(config.autoFreeze);
        if (typeof (config === null || config === void 0 ? void 0 : config.useStrictShallowCopy) === "boolean")
            this.setUseStrictShallowCopy(config.useStrictShallowCopy);
    }
    Immer.prototype.createDraft = function (base) {
        if (!(0, internal_1.isDraftable)(base))
            (0, internal_1.die)(8);
        if ((0, internal_1.isDraft)(base))
            base = (0, internal_1.current)(base);
        var scope = (0, internal_1.enterScope)(this);
        var proxy = createProxy(base, undefined);
        proxy[internal_1.DRAFT_STATE].isManual_ = true;
        (0, internal_1.leaveScope)(scope);
        return proxy;
    };
    Immer.prototype.finishDraft = function (draft, patchListener) {
        var state = draft && draft[internal_1.DRAFT_STATE];
        if (!state || !state.isManual_)
            (0, internal_1.die)(9);
        var scope = state.scope_;
        (0, internal_1.usePatchesInScope)(scope, patchListener);
        return (0, internal_1.processResult)(undefined, scope);
    };
    /**
     * Pass true to automatically freeze all copies created by Immer.
     *
     * By default, auto-freezing is enabled.
     */
    Immer.prototype.setAutoFreeze = function (value) {
        this.autoFreeze_ = value;
    };
    /**
     * Pass true to enable strict shallow copy.
     *
     * By default, immer does not copy the object descriptors such as getter, setter and non-enumrable properties.
     */
    Immer.prototype.setUseStrictShallowCopy = function (value) {
        this.useStrictShallowCopy_ = value;
    };
    Immer.prototype.applyPatches = function (base, patches) {
        // If a patch replaces the entire state, take that replacement as base
        // before applying patches
        var i;
        for (i = patches.length - 1; i >= 0; i--) {
            var patch = patches[i];
            if (patch.path.length === 0 && patch.op === "replace") {
                base = patch.value;
                break;
            }
        }
        // If there was a patch that replaced the entire state, start from the
        // patch after that.
        if (i > -1) {
            patches = patches.slice(i + 1);
        }
        var applyPatchesImpl = (0, internal_1.getPlugin)("Patches").applyPatches_;
        if ((0, internal_1.isDraft)(base)) {
            // N.B: never hits if some patch a replacement, patches are never drafts
            return applyPatchesImpl(base, patches);
        }
        // Otherwise, produce a copy of the base state.
        return this.produce(base, function (draft) {
            return applyPatchesImpl(draft, patches);
        });
    };
    return Immer;
}());
exports.Immer = Immer;
function createProxy(value, parent) {
    // precondition: createProxy should be guarded by isDraftable, so we know we can safely draft
    var draft = (0, internal_1.isMap)(value)
        ? (0, internal_1.getPlugin)("MapSet").proxyMap_(value, parent)
        : (0, internal_1.isSet)(value)
            ? (0, internal_1.getPlugin)("MapSet").proxySet_(value, parent)
            : (0, internal_1.createProxyProxy)(value, parent);
    var scope = parent ? parent.scope_ : (0, internal_1.getCurrentScope)();
    scope.drafts_.push(draft);
    return draft;
}
