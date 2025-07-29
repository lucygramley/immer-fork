"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.current = current;
var internal_1 = require("../internal");
function current(value) {
    if (!(0, internal_1.isDraft)(value))
        (0, internal_1.die)(10, value);
    return currentImpl(value);
}
function currentImpl(value) {
    if (!(0, internal_1.isDraftable)(value) || (0, internal_1.isFrozen)(value))
        return value;
    var state = value[internal_1.DRAFT_STATE];
    var copy;
    if (state) {
        if (!state.modified_)
            return state.base_;
        // Optimization: avoid generating new drafts during copying
        state.finalized_ = true;
        copy = (0, internal_1.shallowCopy)(value, state.scope_.immer_.useStrictShallowCopy_);
    }
    else {
        copy = (0, internal_1.shallowCopy)(value, true);
    }
    // recurse
    (0, internal_1.each)(copy, function (key, childValue) {
        (0, internal_1.set)(copy, key, currentImpl(childValue));
    });
    if (state) {
        state.finalized_ = false;
    }
    return copy;
}
