"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var spec_ts_1 = require("./spec_ts");
var immer_1 = require("../src/immer");
// For checking if a type is assignable to its draft type (and vice versa)
var toDraft = function (x) { return x; };
var fromDraft = function (x) { return x; };
test("draft.ts", function () {
    // Tuple
    {
        var val = spec_ts_1._;
        (0, spec_ts_1.assert)(toDraft(val), val);
        (0, spec_ts_1.assert)(fromDraft(toDraft(val)), val);
    }
    // Tuple (nested in a tuple)
    {
        var val = spec_ts_1._;
        (0, spec_ts_1.assert)(toDraft(val), val);
        (0, spec_ts_1.assert)(fromDraft(toDraft(val)), val);
    }
    // Tuple (nested in two mutable arrays)
    {
        var val = spec_ts_1._;
        var draft = spec_ts_1._;
        val = (0, spec_ts_1.assert)(toDraft(val), draft);
        (0, spec_ts_1.assert)(fromDraft(draft), val);
    }
    // Tuple (nested in two readonly arrays)
    {
        var val = spec_ts_1._;
        var draft = spec_ts_1._;
        val = (0, spec_ts_1.assert)(toDraft(val), draft);
    }
    // Readonly tuple
    {
        // TODO: Uncomment this when readonly tuples are supported.
        //       More info: https://stackoverflow.com/a/53822074/2228559
        // let val: Readonly<[1, 2]> = _
        // let draft: [1, 2] = _
        // draft = assert(toDraft(val), draft)
        // val = fromDraft(draft)
    }
    // Mutable array
    {
        var val = spec_ts_1._;
        (0, spec_ts_1.assert)(toDraft(val), val);
        (0, spec_ts_1.assert)(fromDraft(toDraft(val)), val);
    }
    // Mutable array (nested in tuple)
    {
        var val = spec_ts_1._;
        (0, spec_ts_1.assert)(toDraft(val), val);
        (0, spec_ts_1.assert)(fromDraft(toDraft(val)), val);
    }
    // Readonly array
    {
        var val = spec_ts_1._;
        var draft = spec_ts_1._;
        val = (0, spec_ts_1.assert)(toDraft(val), draft);
        fromDraft(draft);
    }
    // Readonly array (nested in readonly object)
    {
        var val = spec_ts_1._;
        var draft = spec_ts_1._;
        val = (0, spec_ts_1.assert)(toDraft(val), draft);
        fromDraft(draft);
    }
    // Mutable object
    {
        var val = spec_ts_1._;
        (0, spec_ts_1.assert)(toDraft(val), val);
        (0, spec_ts_1.assert)(fromDraft(toDraft(val)), val);
    }
    // Mutable object (nested in mutable object)
    {
        var val = spec_ts_1._;
        (0, spec_ts_1.assert)(toDraft(val), val);
        (0, spec_ts_1.assert)(fromDraft(toDraft(val)), val);
    }
    // Interface
    {
        var val = spec_ts_1._;
        (0, spec_ts_1.assert)(toDraft(val), val);
        (0, spec_ts_1.assert)(fromDraft(toDraft(val)), val);
    }
    // Interface (nested in interface)
    {
        var val = spec_ts_1._;
        (0, spec_ts_1.assert)(toDraft(val), val);
        (0, spec_ts_1.assert)(fromDraft(toDraft(val)), val);
    }
    // Readonly object
    {
        var val = spec_ts_1._;
        var draft = spec_ts_1._;
        val = (0, spec_ts_1.assert)(toDraft(val), draft);
    }
    // Readonly object (nested in tuple)
    {
        var val = spec_ts_1._;
        var draft = spec_ts_1._;
        val = (0, spec_ts_1.assert)(toDraft(val), draft);
    }
    // Loose function
    {
        var val = spec_ts_1._;
        (0, spec_ts_1.assert)(toDraft(val), val);
        (0, spec_ts_1.assert)(fromDraft(toDraft(val)), val);
    }
    // Strict function
    {
        var val = spec_ts_1._;
        (0, spec_ts_1.assert)(toDraft(val), val);
        (0, spec_ts_1.assert)(fromDraft(toDraft(val)), val);
    }
    // Class type (mutable)
    {
        var Foo = /** @class */ (function () {
            function Foo(bar) {
                this.bar = bar;
            }
            return Foo;
        }());
        var val = spec_ts_1._;
        // TODO: Uncomment this when plain object types can be distinguished from class types.
        //       More info here: https://github.com/Microsoft/TypeScript/issues/29063
        // assert(toDraft(val), val)
        // assert(fromDraft(toDraft(val)), val)
    }
    // Class type (readonly)
    {
        var Foo = /** @class */ (function () {
            function Foo(bar) {
                this.bar = bar;
            }
            return Foo;
        }());
        var val = spec_ts_1._;
        // TODO: Uncomment this when plain object types can be distinguished from class types.
        //       More info here: https://github.com/Microsoft/TypeScript/issues/29063
        // assert(toDraft(val), val)
        // assert(fromDraft(toDraft(val)), val)
    }
    // Map instance
    {
        var val = spec_ts_1._;
        (0, spec_ts_1.assert)(toDraft(val), val);
        (0, spec_ts_1.assert)(fromDraft(toDraft(val)), val);
        // Weak maps
        var weak = spec_ts_1._;
        (0, spec_ts_1.assert)(toDraft(weak), weak);
        (0, spec_ts_1.assert)(fromDraft(toDraft(weak)), weak);
    }
    // ReadonlyMap instance
    {
        var val = spec_ts_1._;
        var draft = spec_ts_1._;
        (0, spec_ts_1.assert)(toDraft(val), draft);
    }
    // Set instance
    {
        var val = spec_ts_1._;
        (0, spec_ts_1.assert)(toDraft(val), val);
        (0, spec_ts_1.assert)(fromDraft(toDraft(val)), val);
        // Weak sets
        var weak = spec_ts_1._;
        (0, spec_ts_1.assert)(toDraft(weak), weak);
        (0, spec_ts_1.assert)(fromDraft(toDraft(weak)), weak);
    }
    // ReadonlySet instance
    {
        var val = spec_ts_1._;
        var draft = spec_ts_1._;
        (0, spec_ts_1.assert)(toDraft(val), draft);
    }
    // Promise object
    {
        var val = spec_ts_1._;
        (0, spec_ts_1.assert)(toDraft(val), val);
        (0, spec_ts_1.assert)(fromDraft(toDraft(val)), val);
    }
    // Date instance
    {
        var val = spec_ts_1._;
        (0, spec_ts_1.assert)(toDraft(val), val);
        (0, spec_ts_1.assert)(fromDraft(toDraft(val)), val);
    }
    // RegExp instance
    {
        var val = spec_ts_1._;
        (0, spec_ts_1.assert)(toDraft(val), val);
        (0, spec_ts_1.assert)(fromDraft(toDraft(val)), val);
    }
    // Boxed primitive
    {
        var val = spec_ts_1._;
        (0, spec_ts_1.assert)(toDraft(val), val);
        (0, spec_ts_1.assert)(fromDraft(toDraft(val)), val);
    }
    // String literal
    {
        var val = spec_ts_1._;
        (0, spec_ts_1.assert)(toDraft(val), val);
        (0, spec_ts_1.assert)(fromDraft(toDraft(val)), val);
    }
    // Any
    {
        var val = spec_ts_1._;
        (0, spec_ts_1.assert)(toDraft(val), val);
        (0, spec_ts_1.assert)(fromDraft(toDraft(val)), val);
    }
    // Never
    {
        var val = spec_ts_1._;
        (0, spec_ts_1.assert)(toDraft(val), val);
        (0, spec_ts_1.assert)(fromDraft(toDraft(val)), val);
    }
    // Unknown
    {
        var val = spec_ts_1._;
        (0, spec_ts_1.assert)(toDraft(val), val);
        (0, spec_ts_1.assert)(fromDraft(toDraft(val)), val);
    }
    // Numeral
    {
        var val = spec_ts_1._;
        (0, spec_ts_1.assert)(toDraft(val), val);
        (0, spec_ts_1.assert)(fromDraft(toDraft(val)), val);
    }
    // Union of numerals
    {
        var val = spec_ts_1._;
        (0, spec_ts_1.assert)(toDraft(val), val);
        (0, spec_ts_1.assert)(fromDraft(toDraft(val)), val);
    }
    // Union of tuple, array, object
    {
        var val = spec_ts_1._;
        var draft = spec_ts_1._;
        val = (0, spec_ts_1.assert)(toDraft(val), draft);
    }
    // Generic type
    {
        // NOTE: "extends any" only helps a little.
        var $ = function (val) {
            var draft = spec_ts_1._;
            (0, spec_ts_1.assert)(toDraft(val), draft);
            // $ExpectError: [ts] Argument of type 'DraftArray<T>' is not assignable to parameter of type 'Draft<T>'. [2345]
            // assert(fromDraft(draft), draft)
        };
    }
    expect(true).toBe(true);
});
test("castDraft", function () {
    function markAllFinished(state) {
        (0, immer_1.produce)(state, function (draft) {
            draft.finishedTodos = (0, immer_1.castDraft)(state.unfinishedTodos);
        });
    }
});
test("#505 original", function () {
    var baseState = { users: [{ name: "Richie" }] };
    var nextState = (0, immer_1.produce)(baseState, function (draftState) {
        (0, immer_1.original)(draftState.users) === baseState.users;
    });
});
test("castDraft preserves a value", function () {
    var x = {};
    expect((0, immer_1.castDraft)(x)).toBe(x);
});
test("#512 createDraft creates a draft", function () {
    var x = { y: 1 };
    (0, spec_ts_1.assert)(x, spec_ts_1._);
});
