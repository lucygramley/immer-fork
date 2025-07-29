"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processResult = processResult;
var internal_1 = require("../internal");
function processResult(result, scope) {
    scope.unfinalizedDrafts_ = scope.drafts_.length;
    var baseDraft = scope.drafts_[0];
    var isReplaced = result !== undefined && result !== baseDraft;
    if (isReplaced) {
        if (baseDraft[internal_1.DRAFT_STATE].modified_) {
            (0, internal_1.revokeScope)(scope);
            (0, internal_1.die)(4);
        }
        if ((0, internal_1.isDraftable)(result)) {
            // Finalize the result in case it contains (or is) a subset of the draft.
            result = finalize(scope, result);
            if (!scope.parent_)
                maybeFreeze(scope, result);
        }
        if (scope.patches_) {
            (0, internal_1.getPlugin)("Patches").generateReplacementPatches_(baseDraft[internal_1.DRAFT_STATE].base_, result, scope.patches_, scope.inversePatches_);
        }
    }
    else {
        // Finalize the base draft.
        result = finalize(scope, baseDraft, []);
    }
    (0, internal_1.revokeScope)(scope);
    if (scope.patches_) {
        scope.patchListener_(scope.patches_, scope.inversePatches_);
    }
    return result !== internal_1.NOTHING ? result : undefined;
}
function finalize(rootScope, value, path) {
    // Don't recurse in tho recursive data structures
    if ((0, internal_1.isFrozen)(value))
        return value;
    var state = value[internal_1.DRAFT_STATE];
    // A plain object, might need freezing, might contain drafts
    if (!state) {
        (0, internal_1.each)(value, function (key, childValue) {
            return finalizeProperty(rootScope, state, value, key, childValue, path);
        });
        return value;
    }
    // Never finalize drafts owned by another scope.
    if (state.scope_ !== rootScope)
        return value;
    // Unmodified draft, return the (frozen) original
    if (!state.modified_) {
        maybeFreeze(rootScope, state.base_, true);
        return state.base_;
    }
    // Not finalized yet, let's do that now
    if (!state.finalized_) {
        state.finalized_ = true;
        state.scope_.unfinalizedDrafts_--;
        var result_1 = state.copy_;
        // Finalize all children of the copy
        // For sets we clone before iterating, otherwise we can get in endless loop due to modifying during iteration, see #628
        // To preserve insertion order in all cases we then clear the set
        // And we let finalizeProperty know it needs to re-add non-draft children back to the target
        var resultEach = result_1;
        var isSet_1 = false;
        if (state.type_ === 3 /* ArchType.Set */) {
            resultEach = new Set(result_1);
            result_1.clear();
            isSet_1 = true;
        }
        (0, internal_1.each)(resultEach, function (key, childValue) {
            return finalizeProperty(rootScope, state, result_1, key, childValue, path, isSet_1);
        });
        // everything inside is frozen, we can freeze here
        maybeFreeze(rootScope, result_1, false);
        // first time finalizing, let's create those patches
        if (path && rootScope.patches_) {
            (0, internal_1.getPlugin)("Patches").generatePatches_(state, path, rootScope.patches_, rootScope.inversePatches_);
        }
    }
    return state.copy_;
}
function finalizeProperty(rootScope, parentState, targetObject, prop, childValue, rootPath, targetIsSet) {
    if (process.env.NODE_ENV !== "production" && childValue === targetObject)
        (0, internal_1.die)(5);
    if ((0, internal_1.isDraft)(childValue)) {
        var path = rootPath &&
            parentState &&
            parentState.type_ !== 3 /* ArchType.Set */ && // Set objects are atomic since they have no keys.
            !(0, internal_1.has)(parentState.assigned_, prop) // Skip deep patches for assigned keys.
            ? rootPath.concat(prop)
            : undefined;
        // Drafts owned by `scope` are finalized here.
        var res = finalize(rootScope, childValue, path);
        (0, internal_1.set)(targetObject, prop, res);
        // Drafts from another scope must prevented to be frozen
        // if we got a draft back from finalize, we're in a nested produce and shouldn't freeze
        if ((0, internal_1.isDraft)(res)) {
            rootScope.canAutoFreeze_ = false;
        }
        else
            return;
    }
    else if (targetIsSet) {
        targetObject.add(childValue);
    }
    // Search new objects for unfinalized drafts. Frozen objects should never contain drafts.
    if ((0, internal_1.isDraftable)(childValue) && !(0, internal_1.isFrozen)(childValue)) {
        if (!rootScope.immer_.autoFreeze_ && rootScope.unfinalizedDrafts_ < 1) {
            // optimization: if an object is not a draft, and we don't have to
            // deepfreeze everything, and we are sure that no drafts are left in the remaining object
            // cause we saw and finalized all drafts already; we can stop visiting the rest of the tree.
            // This benefits especially adding large data tree's without further processing.
            // See add-data.js perf test
            return;
        }
        finalize(rootScope, childValue);
        // Immer deep freezes plain objects, so if there is no parent state, we freeze as well
        // Per #590, we never freeze symbolic properties. Just to make sure don't accidentally interfere
        // with other frameworks.
        if ((!parentState || !parentState.scope_.parent_) &&
            typeof prop !== "symbol" &&
            Object.prototype.propertyIsEnumerable.call(targetObject, prop))
            maybeFreeze(rootScope, childValue);
    }
}
function maybeFreeze(scope, value, deep) {
    if (deep === void 0) { deep = false; }
    // we never freeze for a non-root scope; as it would prevent pruning for drafts inside wrapping objects
    if (!scope.parent_ && scope.immer_.autoFreeze_ && scope.canAutoFreeze_) {
        (0, internal_1.freeze)(value, deep);
    }
}
