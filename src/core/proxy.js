"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.objectTraps = void 0;
exports.createProxyProxy = createProxyProxy;
exports.markChanged = markChanged;
exports.prepareCopy = prepareCopy;
var internal_1 = require("../internal");
/**
 * Returns a new draft of the `base` object.
 *
 * The second argument is the parent draft-state (used internally).
 */
function createProxyProxy(base, parent) {
    var isArray = Array.isArray(base);
    var state = {
        type_: isArray ? 1 /* ArchType.Array */ : 0 /* ArchType.Object */,
        // Track which produce call this is associated with.
        scope_: parent ? parent.scope_ : (0, internal_1.getCurrentScope)(),
        // True for both shallow and deep changes.
        modified_: false,
        // Used during finalization.
        finalized_: false,
        // Track which properties have been assigned (true) or deleted (false).
        assigned_: {},
        // The parent draft state.
        parent_: parent,
        // The base state.
        base_: base,
        // The base proxy.
        draft_: null, // set below
        // The base copy with any updated values.
        copy_: null,
        // Called by the `produce` function.
        revoke_: null,
        isManual_: false
    };
    // the traps must target something, a bit like the 'real' base.
    // but also, we need to be able to determine from the target what the relevant state is
    // (to avoid creating traps per instance to capture the state in closure,
    // and to avoid creating weird hidden properties as well)
    // So the trick is to use 'state' as the actual 'target'! (and make sure we intercept everything)
    // Note that in the case of an array, we put the state in an array to have better Reflect defaults ootb
    var target = state;
    var traps = exports.objectTraps;
    if (isArray) {
        target = [state];
        traps = arrayTraps;
    }
    var _a = Proxy.revocable(target, traps), revoke = _a.revoke, proxy = _a.proxy;
    state.draft_ = proxy;
    state.revoke_ = revoke;
    return proxy;
}
/**
 * Object drafts
 */
exports.objectTraps = {
    get: function (state, prop) {
        if (prop === internal_1.DRAFT_STATE)
            return state;
        var source = (0, internal_1.latest)(state);
        if (!(0, internal_1.has)(source, prop)) {
            // non-existing or non-own property...
            return readPropFromProto(state, source, prop);
        }
        var value = source[prop];
        if (state.finalized_ || !(0, internal_1.isDraftable)(value)) {
            return value;
        }
        // Check for existing draft in modified state.
        // Assigned values are never drafted. This catches any drafts we created, too.
        if (value === peek(state.base_, prop)) {
            prepareCopy(state);
            return (state.copy_[prop] = (0, internal_1.createProxy)(value, state));
        }
        return value;
    },
    has: function (state, prop) {
        return prop in (0, internal_1.latest)(state);
    },
    ownKeys: function (state) {
        return Reflect.ownKeys((0, internal_1.latest)(state));
    },
    set: function (state, prop /* strictly not, but helps TS */, value) {
        var desc = getDescriptorFromProto((0, internal_1.latest)(state), prop);
        if (desc === null || desc === void 0 ? void 0 : desc.set) {
            // special case: if this write is captured by a setter, we have
            // to trigger it with the correct context
            desc.set.call(state.draft_, value);
            return true;
        }
        if (!state.modified_) {
            // the last check is because we need to be able to distinguish setting a non-existing to undefined (which is a change)
            // from setting an existing property with value undefined to undefined (which is not a change)
            var current = peek((0, internal_1.latest)(state), prop);
            // special case, if we assigning the original value to a draft, we can ignore the assignment
            var currentState = current === null || current === void 0 ? void 0 : current[internal_1.DRAFT_STATE];
            if (currentState && currentState.base_ === value) {
                state.copy_[prop] = value;
                state.assigned_[prop] = false;
                return true;
            }
            if ((0, internal_1.is)(value, current) && (value !== undefined || (0, internal_1.has)(state.base_, prop)))
                return true;
            prepareCopy(state);
            markChanged(state);
        }
        if ((state.copy_[prop] === value &&
            // special case: handle new props with value 'undefined'
            (value !== undefined || prop in state.copy_)) ||
            // special case: NaN
            (Number.isNaN(value) && Number.isNaN(state.copy_[prop])))
            return true;
        // @ts-ignore
        state.copy_[prop] = value;
        state.assigned_[prop] = true;
        return true;
    },
    deleteProperty: function (state, prop) {
        // The `undefined` check is a fast path for pre-existing keys.
        if (peek(state.base_, prop) !== undefined || prop in state.base_) {
            state.assigned_[prop] = false;
            prepareCopy(state);
            markChanged(state);
        }
        else {
            // if an originally not assigned property was deleted
            delete state.assigned_[prop];
        }
        if (state.copy_) {
            delete state.copy_[prop];
        }
        return true;
    },
    // Note: We never coerce `desc.value` into an Immer draft, because we can't make
    // the same guarantee in ES5 mode.
    getOwnPropertyDescriptor: function (state, prop) {
        var owner = (0, internal_1.latest)(state);
        var desc = Reflect.getOwnPropertyDescriptor(owner, prop);
        if (!desc)
            return desc;
        return {
            writable: true,
            configurable: state.type_ !== 1 /* ArchType.Array */ || prop !== "length",
            enumerable: desc.enumerable,
            value: owner[prop]
        };
    },
    defineProperty: function () {
        (0, internal_1.die)(11);
    },
    getPrototypeOf: function (state) {
        return (0, internal_1.getPrototypeOf)(state.base_);
    },
    setPrototypeOf: function () {
        (0, internal_1.die)(12);
    }
};
/**
 * Array drafts
 */
var arrayTraps = {};
(0, internal_1.each)(exports.objectTraps, function (key, fn) {
    // @ts-ignore
    arrayTraps[key] = function () {
        arguments[0] = arguments[0][0];
        return fn.apply(this, arguments);
    };
});
arrayTraps.deleteProperty = function (state, prop) {
    if (process.env.NODE_ENV !== "production" && isNaN(parseInt(prop)))
        (0, internal_1.die)(13);
    // @ts-ignore
    return arrayTraps.set.call(this, state, prop, undefined);
};
arrayTraps.set = function (state, prop, value) {
    if (process.env.NODE_ENV !== "production" &&
        prop !== "length" &&
        isNaN(parseInt(prop)))
        (0, internal_1.die)(14);
    return exports.objectTraps.set.call(this, state[0], prop, value, state[0]);
};
// Access a property without creating an Immer draft.
function peek(draft, prop) {
    var state = draft[internal_1.DRAFT_STATE];
    var source = state ? (0, internal_1.latest)(state) : draft;
    return source[prop];
}
function readPropFromProto(state, source, prop) {
    var _a;
    var desc = getDescriptorFromProto(source, prop);
    return desc
        ? "value" in desc
            ? desc.value
            : // This is a very special case, if the prop is a getter defined by the
                // prototype, we should invoke it with the draft as context!
                (_a = desc.get) === null || _a === void 0 ? void 0 : _a.call(state.draft_)
        : undefined;
}
function getDescriptorFromProto(source, prop) {
    // 'in' checks proto!
    if (!(prop in source))
        return undefined;
    var proto = (0, internal_1.getPrototypeOf)(source);
    while (proto) {
        var desc = Object.getOwnPropertyDescriptor(proto, prop);
        if (desc)
            return desc;
        proto = (0, internal_1.getPrototypeOf)(proto);
    }
    return undefined;
}
function markChanged(state) {
    if (!state.modified_) {
        state.modified_ = true;
        if (state.parent_) {
            markChanged(state.parent_);
        }
    }
}
function prepareCopy(state) {
    if (!state.copy_) {
        state.copy_ = (0, internal_1.shallowCopy)(state.base_, state.scope_.immer_.useStrictShallowCopy_);
    }
}
