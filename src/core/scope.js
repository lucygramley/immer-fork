"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentScope = getCurrentScope;
exports.usePatchesInScope = usePatchesInScope;
exports.revokeScope = revokeScope;
exports.leaveScope = leaveScope;
exports.enterScope = enterScope;
var internal_1 = require("../internal");
var currentScope;
function getCurrentScope() {
    return currentScope;
}
function createScope(parent_, immer_) {
    return {
        drafts_: [],
        parent_: parent_,
        immer_: immer_,
        // Whenever the modified draft contains a draft from another scope, we
        // need to prevent auto-freezing so the unowned draft can be finalized.
        canAutoFreeze_: true,
        unfinalizedDrafts_: 0
    };
}
function usePatchesInScope(scope, patchListener) {
    if (patchListener) {
        (0, internal_1.getPlugin)("Patches"); // assert we have the plugin
        scope.patches_ = [];
        scope.inversePatches_ = [];
        scope.patchListener_ = patchListener;
    }
}
function revokeScope(scope) {
    leaveScope(scope);
    scope.drafts_.forEach(revokeDraft);
    // @ts-ignore
    scope.drafts_ = null;
}
function leaveScope(scope) {
    if (scope === currentScope) {
        currentScope = scope.parent_;
    }
}
function enterScope(immer) {
    return (currentScope = createScope(currentScope, immer));
}
function revokeDraft(draft) {
    var state = draft[internal_1.DRAFT_STATE];
    if (state.type_ === 0 /* ArchType.Object */ || state.type_ === 1 /* ArchType.Array */)
        state.revoke_();
    else
        state.revoked_ = true;
}
