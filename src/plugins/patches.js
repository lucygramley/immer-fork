"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enablePatches = enablePatches;
var immer_1 = require("../immer");
var internal_1 = require("../internal");
function enablePatches() {
    var errorOffset = 16;
    if (process.env.NODE_ENV !== "production") {
        internal_1.errors.push('Sets cannot have "replace" patches.', function (op) {
            return "Unsupported patch operation: " + op;
        }, function (path) {
            return "Cannot apply patch, path doesn't resolve: " + path;
        }, "Patching reserved attributes like __proto__, prototype and constructor is not allowed");
    }
    var REPLACE = "replace";
    var ADD = "add";
    var REMOVE = "remove";
    function generatePatches_(state, basePath, patches, inversePatches) {
        switch (state.type_) {
            case 0 /* ArchType.Object */:
            case 2 /* ArchType.Map */:
                return generatePatchesFromAssigned(state, basePath, patches, inversePatches);
            case 1 /* ArchType.Array */:
                return generateArrayPatches(state, basePath, patches, inversePatches);
            case 3 /* ArchType.Set */:
                return generateSetPatches(state, basePath, patches, inversePatches);
        }
    }
    function generateArrayPatches(state, basePath, patches, inversePatches) {
        var _a, _b;
        var base_ = state.base_, assigned_ = state.assigned_;
        var copy_ = state.copy_;
        // Reduce complexity by ensuring `base` is never longer.
        if (copy_.length < base_.length) {
            // @ts-ignore
            ;
            _a = [copy_, base_], base_ = _a[0], copy_ = _a[1];
            _b = [inversePatches, patches], patches = _b[0], inversePatches = _b[1];
        }
        // Process replaced indices.
        for (var i = 0; i < base_.length; i++) {
            if (assigned_[i] && copy_[i] !== base_[i]) {
                var path = basePath.concat([i]);
                patches.push({
                    op: REPLACE,
                    path: path,
                    // Need to maybe clone it, as it can in fact be the original value
                    // due to the base/copy inversion at the start of this function
                    value: clonePatchValueIfNeeded(copy_[i])
                });
                inversePatches.push({
                    op: REPLACE,
                    path: path,
                    value: clonePatchValueIfNeeded(base_[i])
                });
            }
        }
        // Process added indices.
        for (var i = base_.length; i < copy_.length; i++) {
            var path = basePath.concat([i]);
            patches.push({
                op: ADD,
                path: path,
                // Need to maybe clone it, as it can in fact be the original value
                // due to the base/copy inversion at the start of this function
                value: clonePatchValueIfNeeded(copy_[i])
            });
        }
        for (var i = copy_.length - 1; base_.length <= i; --i) {
            var path = basePath.concat([i]);
            inversePatches.push({
                op: REMOVE,
                path: path
            });
        }
    }
    // This is used for both Map objects and normal objects.
    function generatePatchesFromAssigned(state, basePath, patches, inversePatches) {
        var base_ = state.base_, copy_ = state.copy_;
        (0, internal_1.each)(state.assigned_, function (key, assignedValue) {
            var origValue = (0, internal_1.get)(base_, key);
            var value = (0, internal_1.get)(copy_, key);
            var op = !assignedValue ? REMOVE : (0, internal_1.has)(base_, key) ? REPLACE : ADD;
            if (origValue === value && op === REPLACE)
                return;
            var path = basePath.concat(key);
            patches.push(op === REMOVE ? { op: op, path: path } : { op: op, path: path, value: value });
            inversePatches.push(op === ADD
                ? { op: REMOVE, path: path }
                : op === REMOVE
                    ? { op: ADD, path: path, value: clonePatchValueIfNeeded(origValue) }
                    : { op: REPLACE, path: path, value: clonePatchValueIfNeeded(origValue) });
        });
    }
    function generateSetPatches(state, basePath, patches, inversePatches) {
        var base_ = state.base_, copy_ = state.copy_;
        var i = 0;
        base_.forEach(function (value) {
            if (!copy_.has(value)) {
                var path = basePath.concat([i]);
                patches.push({
                    op: REMOVE,
                    path: path,
                    value: value
                });
                inversePatches.unshift({
                    op: ADD,
                    path: path,
                    value: value
                });
            }
            i++;
        });
        i = 0;
        copy_.forEach(function (value) {
            if (!base_.has(value)) {
                var path = basePath.concat([i]);
                patches.push({
                    op: ADD,
                    path: path,
                    value: value
                });
                inversePatches.unshift({
                    op: REMOVE,
                    path: path,
                    value: value
                });
            }
            i++;
        });
    }
    function generateReplacementPatches_(baseValue, replacement, patches, inversePatches) {
        patches.push({
            op: REPLACE,
            path: [],
            value: replacement === internal_1.NOTHING ? undefined : replacement
        });
        inversePatches.push({
            op: REPLACE,
            path: [],
            value: baseValue
        });
    }
    function applyPatches_(draft, patches) {
        patches.forEach(function (patch) {
            var path = patch.path, op = patch.op;
            var base = draft;
            for (var i = 0; i < path.length - 1; i++) {
                var parentType = (0, internal_1.getArchtype)(base);
                var p = path[i];
                if (typeof p !== "string" && typeof p !== "number") {
                    p = "" + p;
                }
                // See #738, avoid prototype pollution
                if ((parentType === 0 /* ArchType.Object */ || parentType === 1 /* ArchType.Array */) &&
                    (p === "__proto__" || p === "constructor"))
                    (0, internal_1.die)(errorOffset + 3);
                if (typeof base === "function" && p === "prototype")
                    (0, internal_1.die)(errorOffset + 3);
                base = (0, internal_1.get)(base, p);
                if (typeof base !== "object")
                    (0, internal_1.die)(errorOffset + 2, path.join("/"));
            }
            var type = (0, internal_1.getArchtype)(base);
            var value = deepClonePatchValue(patch.value); // used to clone patch to ensure original patch is not modified, see #411
            var key = path[path.length - 1];
            switch (op) {
                case REPLACE:
                    switch (type) {
                        case 2 /* ArchType.Map */:
                            return base.set(key, value);
                        /* istanbul ignore next */
                        case 3 /* ArchType.Set */:
                            (0, internal_1.die)(errorOffset);
                        default:
                            // if value is an object, then it's assigned by reference
                            // in the following add or remove ops, the value field inside the patch will also be modifyed
                            // so we use value from the cloned patch
                            // @ts-ignore
                            return (base[key] = value);
                    }
                case ADD:
                    switch (type) {
                        case 1 /* ArchType.Array */:
                            return key === "-"
                                ? base.push(value)
                                : base.splice(key, 0, value);
                        case 2 /* ArchType.Map */:
                            return base.set(key, value);
                        case 3 /* ArchType.Set */:
                            return base.add(value);
                        default:
                            return (base[key] = value);
                    }
                case REMOVE:
                    switch (type) {
                        case 1 /* ArchType.Array */:
                            return base.splice(key, 1);
                        case 2 /* ArchType.Map */:
                            return base.delete(key);
                        case 3 /* ArchType.Set */:
                            return base.delete(patch.value);
                        default:
                            return delete base[key];
                    }
                default:
                    (0, internal_1.die)(errorOffset + 1, op);
            }
        });
        return draft;
    }
    function deepClonePatchValue(obj) {
        if (!(0, internal_1.isDraftable)(obj))
            return obj;
        if (Array.isArray(obj))
            return obj.map(deepClonePatchValue);
        if ((0, internal_1.isMap)(obj))
            return new Map(Array.from(obj.entries()).map(function (_a) {
                var k = _a[0], v = _a[1];
                return [k, deepClonePatchValue(v)];
            }));
        if ((0, internal_1.isSet)(obj))
            return new Set(Array.from(obj).map(deepClonePatchValue));
        var cloned = Object.create((0, internal_1.getPrototypeOf)(obj));
        for (var key in obj)
            cloned[key] = deepClonePatchValue(obj[key]);
        if ((0, internal_1.has)(obj, immer_1.immerable))
            cloned[immer_1.immerable] = obj[immer_1.immerable];
        return cloned;
    }
    function clonePatchValueIfNeeded(obj) {
        if ((0, internal_1.isDraft)(obj)) {
            return deepClonePatchValue(obj);
        }
        else
            return obj;
    }
    (0, internal_1.loadPlugin)("Patches", {
        applyPatches_: applyPatches_,
        generatePatches_: generatePatches_,
        generateReplacementPatches_: generateReplacementPatches_
    });
}
