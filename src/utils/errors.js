"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errors = void 0;
exports.die = die;
exports.errors = process.env.NODE_ENV !== "production"
    ? [
        // All error codes, starting by 0:
        function (plugin) {
            return "The plugin for '".concat(plugin, "' has not been loaded into Immer. To enable the plugin, import and call `enable").concat(plugin, "()` when initializing your application.");
        },
        function (thing) {
            return "produce can only be called on things that are draftable: plain objects, arrays, Map, Set or classes that are marked with '[immerable]: true'. Got '".concat(thing, "'");
        },
        "This object has been frozen and should not be mutated",
        function (data) {
            return ("Cannot use a proxy that has been revoked. Did you pass an object from inside an immer function to an async process? " +
                data);
        },
        "An immer producer returned a new value *and* modified its draft. Either return a new value *or* modify the draft.",
        "Immer forbids circular references",
        "The first or second argument to `produce` must be a function",
        "The third argument to `produce` must be a function or undefined",
        "First argument to `createDraft` must be a plain object, an array, or an immerable object",
        "First argument to `finishDraft` must be a draft returned by `createDraft`",
        function (thing) {
            return "'current' expects a draft, got: ".concat(thing);
        },
        "Object.defineProperty() cannot be used on an Immer draft",
        "Object.setPrototypeOf() cannot be used on an Immer draft",
        "Immer only supports deleting array indices",
        "Immer only supports setting array indices and the 'length' property",
        function (thing) {
            return "'original' expects a draft, got: ".concat(thing);
        }
        // Note: if more errors are added, the errorOffset in Patches.ts should be increased
        // See Patches.ts for additional errors
    ]
    : [];
function die(error) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    if (process.env.NODE_ENV !== "production") {
        var e = exports.errors[error];
        var msg = typeof e === "function" ? e.apply(null, args) : e;
        throw new Error("[Immer] ".concat(msg));
    }
    throw new Error("[Immer] minified error nr: ".concat(error, ". Full error at: https://bit.ly/3cXEKWf"));
}
