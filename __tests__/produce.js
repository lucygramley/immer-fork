"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var spec_ts_1 = require("./spec_ts");
var immer_1 = require("../src/immer");
(0, immer_1.enableMapSet)();
(0, immer_1.enablePatches)();
var state = {
    num: 0,
    bar: "foo",
    baz: {
        x: 1,
        y: 2
    },
    arr: [{ value: "asdf" }],
    arr2: [{ value: "asdf" }]
};
var expectedState = {
    num: 1,
    foo: "bar",
    bar: "foo",
    baz: {
        x: 2,
        y: 3
    },
    arr: [{ value: "foo" }, { value: "asf" }],
    arr2: [{ value: "foo" }, { value: "asf" }]
};
it("can update readonly state via standard api", function () {
    var newState = (0, immer_1.produce)(state, function (draft) {
        draft.num++;
        draft.foo = "bar";
        draft.bar = "foo";
        draft.baz.x++;
        draft.baz.y++;
        draft.arr[0].value = "foo";
        draft.arr.push({ value: "asf" });
        draft.arr2[0].value = "foo";
        draft.arr2.push({ value: "asf" });
    });
    (0, spec_ts_1.assert)(newState, spec_ts_1._);
});
// NOTE: only when the function type is inferred
it("can infer state type from default state", function () {
    var foo = (0, immer_1.produce)(function (_) { }, spec_ts_1._);
    (0, spec_ts_1.assert)(foo, spec_ts_1._);
});
it("can infer state type from recipe function", function () {
    var foo = (0, immer_1.produce)(function (draft) {
        (0, spec_ts_1.assert)(draft, spec_ts_1._);
        if (Math.random() > 0.5)
            return { a: "test" };
        else
            return { b: "boe" };
    });
    var x = foo({ a: "" });
    var y = foo({ b: "" });
    (0, spec_ts_1.assert)(foo, spec_ts_1._);
});
it("can infer state type from recipe function with arguments", function () {
    var foo = (0, immer_1.produce)(function (draft, x) {
        (0, spec_ts_1.assert)(draft, spec_ts_1._);
        (0, spec_ts_1.assert)(x, spec_ts_1._);
    });
    (0, spec_ts_1.assert)(foo, spec_ts_1._);
});
it("can infer state type from recipe function with arguments and initial state", function () {
    var foo = (0, immer_1.produce)(function (draft, x) { }, spec_ts_1._);
    (0, spec_ts_1.assert)(foo, spec_ts_1._);
});
it("cannot infer state type when the function type and default state are missing", function () {
    var foo = (0, immer_1.produce)(function (_) { });
    // @ts-expect-error
    (0, spec_ts_1.assert)(foo, spec_ts_1._);
});
it("can update readonly state via curried api", function () {
    var newState = (0, immer_1.produce)(function (draft) {
        draft.num++;
        draft.foo = "bar";
        draft.bar = "foo";
        draft.baz.x++;
        draft.baz.y++;
        draft.arr[0].value = "foo";
        draft.arr.push({ value: "asf" });
        draft.arr2[0].value = "foo";
        draft.arr2.push({ value: "asf" });
    })(state);
    expect(newState).not.toBe(state);
    expect(newState).toEqual(expectedState);
});
it("can update use the non-default export", function () {
    var newState = (0, immer_1.produce)(function (draft) {
        draft.num++;
        draft.foo = "bar";
        draft.bar = "foo";
        draft.baz.x++;
        draft.baz.y++;
        draft.arr[0].value = "foo";
        draft.arr.push({ value: "asf" });
        draft.arr2[0].value = "foo";
        draft.arr2.push({ value: "asf" });
    })(state);
    expect(newState).not.toBe(state);
    expect(newState).toEqual(expectedState);
});
it("can apply patches", function () {
    var patches = [];
    (0, immer_1.produce)({ x: 3 }, function (d) {
        d.x++;
    }, function (p) {
        patches = p;
    });
    expect((0, immer_1.applyPatches)({}, patches)).toEqual({ x: 4 });
});
it("can apply readonly patches", function () {
    var _a = (0, immer_1.produceWithPatches)({ x: 3 }, function (d) {
        d.x++;
    }), patches = _a[1];
    expect((0, immer_1.applyPatches)({}, patches)).toEqual({ x: 4 });
});
describe("curried producer", function () {
    it("supports rest parameters", function () {
        // No initial state:
        {
            var foo = (0, immer_1.produce)(function (s, a, b) { });
            (0, spec_ts_1.assert)(foo, spec_ts_1._);
            foo(spec_ts_1._, 1, 2);
        }
        // Using argument parameters:
        {
            var woo = (0, immer_1.produce)(function (state) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
            });
            (0, spec_ts_1.assert)(woo, spec_ts_1._);
            woo(spec_ts_1._, 1, 2);
        }
        // With initial state:
        {
            var bar = (0, immer_1.produce)(function (state) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
            }, spec_ts_1._);
            (0, spec_ts_1.assert)(bar, spec_ts_1._);
            bar(spec_ts_1._, 1, 2);
            bar(spec_ts_1._);
            bar();
        }
        // When args is a tuple:
        {
            var tup = (0, immer_1.produce)(function (state) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
            }, spec_ts_1._);
            (0, spec_ts_1.assert)(tup, spec_ts_1._);
            tup({ a: 1 }, "", 2);
            tup(undefined, "", 2);
        }
    });
    it("can be passed a readonly array", function () {
        // No initial state:
        {
            var foo = (0, immer_1.produce)(function (state) { });
            (0, spec_ts_1.assert)(foo, spec_ts_1._);
            foo([]);
        }
        // With initial state:
        {
            var bar = (0, immer_1.produce)(function () { }, []);
            (0, spec_ts_1.assert)(bar, spec_ts_1._);
            bar([]);
            bar(undefined);
            bar();
        }
    });
});
it("works with return type of: number", function () {
    var base = { a: 0 };
    {
        if (Math.random() === 100) {
            // @ts-expect-error, this return accidentally a number, this is probably a dev error!
            var result = (0, immer_1.produce)(base, function (draft) { return draft.a++; });
        }
    }
    {
        var result = (0, immer_1.produce)(base, function (draft) { return void draft.a++; });
        (0, spec_ts_1.assert)(result, spec_ts_1._);
    }
});
it("can return an object type that is identical to the base type", function () {
    var base = { a: 0 };
    var result = (0, immer_1.produce)(base, function (draft) {
        return draft.a < 0 ? { a: 0 } : undefined;
    });
    (0, spec_ts_1.assert)(result, spec_ts_1._);
});
it("can NOT return an object type that is _not_ assignable to the base type", function () {
    var base = { a: 0 };
    // @ts-expect-error
    var result = (0, immer_1.produce)(base, function (draft) {
        return draft.a < 0 ? { a: true } : undefined;
    });
});
it("does not enforce immutability at the type level", function () {
    var result = (0, immer_1.produce)([], function (draft) {
        draft.push(1);
    });
    (0, spec_ts_1.assert)(result, spec_ts_1._);
});
it("can produce an undefined value", function () {
    var base = { a: 0 };
    // Return only nothing.
    var result = (0, immer_1.produce)(base, function (_) { return immer_1.nothing; });
    (0, spec_ts_1.assert)(result, spec_ts_1._);
    // Return maybe nothing.
    var result2 = (0, immer_1.produce)(base, function (draft) {
        var _a;
        if ((_a = draft === null || draft === void 0 ? void 0 : draft.a) !== null && _a !== void 0 ? _a : 0 > 0)
            return immer_1.nothing;
    });
    (0, spec_ts_1.assert)(result2, spec_ts_1._);
});
it("can return the draft itself", function () {
    var base = spec_ts_1._;
    var result = (0, immer_1.produce)(base, function (draft) { return draft; });
    (0, spec_ts_1.assert)(result, spec_ts_1._);
});
it("works with `void` hack", function () {
    var base = { a: 0 };
    var copy = (0, immer_1.produce)(base, function (s) { return void s.a++; });
    (0, spec_ts_1.assert)(copy, base);
});
it("works with generic parameters", function () {
    var insert = function (array, index, elem) {
        // Need explicit cast on draft as T[] is wider than readonly T[]
        return (0, immer_1.produce)(array, function (draft) {
            draft.push(elem);
            draft.splice(index, 0, elem);
            draft.concat([elem]);
        });
    };
    var val = { a: [] };
    var arr = [];
    insert(arr, 0, val);
});
it("can work with non-readonly base types", function () {
    var state = {
        price: 10,
        todos: [
            {
                title: "test",
                done: false
            }
        ]
    };
    var newState = (0, immer_1.produce)(state, function (draft) {
        draft.price += 5;
        draft.todos.push({
            title: "hi",
            done: true
        });
    });
    (0, spec_ts_1.assert)(newState, spec_ts_1._);
    var reducer = function (draft) {
        draft.price += 5;
        draft.todos.push({
            title: "hi",
            done: true
        });
    };
    // base case for with-initial-state
    var newState4 = (0, immer_1.produce)(reducer, state)(state);
    (0, spec_ts_1.assert)(newState4, spec_ts_1._);
    // no argument case, in that case, immutable version recipe first arg will be inferred
    var newState5 = (0, immer_1.produce)(reducer, state)();
    (0, spec_ts_1.assert)(newState5, spec_ts_1._);
    // we can force the return type of the reducer by casting the initial state
    var newState3 = (0, immer_1.produce)(reducer, state)();
    (0, spec_ts_1.assert)(newState3, spec_ts_1._);
});
it("can work with readonly base types", function () {
    var state = {
        price: 10,
        todos: [
            {
                title: "test",
                done: false
            }
        ]
    };
    var newState = (0, immer_1.produce)(state, function (draft) {
        draft.price + 5;
        draft.todos.push({
            title: "hi",
            done: true
        });
    });
    (0, spec_ts_1.assert)(newState, spec_ts_1._);
    (0, spec_ts_1.assert)(newState, spec_ts_1._); // cause that is the same!
    var reducer = function (draft) {
        draft.price += 5;
        draft.todos.push({
            title: "hi",
            done: true
        });
    };
    var newState2 = (0, immer_1.produce)(reducer)(state);
    (0, spec_ts_1.assert)(newState2, spec_ts_1._);
    // base case for with-initial-state
    var newState4 = (0, immer_1.produce)(reducer, state)(state);
    (0, spec_ts_1.assert)(newState4, spec_ts_1._);
    // no argument case, in that case, immutable version recipe first arg will be inferred
    var newState5 = (0, immer_1.produce)(reducer, state)();
    (0, spec_ts_1.assert)(newState5, spec_ts_1._);
    // we can force the return type of the reducer by casting initial argument
    var newState3 = (0, immer_1.produce)(reducer, state)();
    (0, spec_ts_1.assert)(newState3, spec_ts_1._);
});
it("works with generic array", function () {
    var append = function (queue, item) {
        // T[] is needed here v. Too bad.
        return (0, immer_1.produce)(queue, function (queueDraft) {
            queueDraft.push(item);
        });
    };
    var queueBefore = [1, 2, 3];
    var queueAfter = append(queueBefore, 4);
    expect(queueAfter).toEqual([1, 2, 3, 4]);
    expect(queueBefore).toEqual([1, 2, 3]);
});
it("works with Map and Set", function () {
    var m = new Map([["a", { x: 1 }]]);
    var s = new Set([{ x: 2 }]);
    var res1 = (0, immer_1.produce)(m, function (draft) {
        (0, spec_ts_1.assert)(draft, spec_ts_1._);
    });
    (0, spec_ts_1.assert)(res1, spec_ts_1._);
    var res2 = (0, immer_1.produce)(s, function (draft) {
        (0, spec_ts_1.assert)(draft, spec_ts_1._);
    });
    (0, spec_ts_1.assert)(res2, spec_ts_1._);
});
it("works with readonly Map and Set", function () {
    var m = new Map([["a", { x: 1 }]]);
    var s = new Set([{ x: 2 }]);
    var res1 = (0, immer_1.produce)(m, function (draft) {
        (0, spec_ts_1.assert)(draft, spec_ts_1._);
    });
    (0, spec_ts_1.assert)(res1, spec_ts_1._);
    var res2 = (0, immer_1.produce)(s, function (draft) {
        (0, spec_ts_1.assert)(draft, spec_ts_1._);
    });
    (0, spec_ts_1.assert)(res2, spec_ts_1._);
});
it("works with ReadonlyMap and ReadonlySet", function () {
    var m = new Map([["a", { x: 1 }]]);
    var s = new Set([{ x: 2 }]);
    var res1 = (0, immer_1.produce)(m, function (draft) {
        (0, spec_ts_1.assert)(draft, spec_ts_1._);
    });
    (0, spec_ts_1.assert)(res1, spec_ts_1._);
    var res2 = (0, immer_1.produce)(s, function (draft) {
        (0, spec_ts_1.assert)(draft, spec_ts_1._);
    });
    (0, spec_ts_1.assert)(res2, spec_ts_1._);
});
it("shows error in production if called incorrectly", function () {
    expect(function () {
        debugger;
        (0, immer_1.produce)(null);
    }).toThrow(global.USES_BUILD
        ? "[Immer] minified error nr: 6"
        : "[Immer] The first or second argument to `produce` must be a function");
});
it("#749 types Immer", function () {
    var t = {
        x: 3
    };
    var immer = new immer_1.Immer();
    var z = immer.produce(t, function (d) {
        d.x++;
        // @ts-expect-error
        d.y = 0;
    });
    expect(z.x).toBe(4);
    // @ts-expect-error
    expect(z.z).toBeUndefined();
});
it("infers draft, #720", function () {
    function nextNumberCalculator(fn) {
        // noop
    }
    var res2 = nextNumberCalculator((0, immer_1.produce)(function (draft) {
        // @ts-expect-error
        var x = draft;
        return draft + 1;
    }));
    var res = nextNumberCalculator((0, immer_1.produce)(function (draft) {
        // @ts-expect-error
        var x = draft;
        // return draft + 1;
        return undefined;
    }));
});
it("infers draft, #720 - 2", function () {
    function useState(initialState) {
        return [initialState, function () { }];
    }
    var _a = useState({ x: 3 }), n = _a[0], setN = _a[1];
    setN((0, immer_1.produce)(function (draft) {
        // @ts-expect-error
        draft.y = 4;
        draft.x = 5;
        return draft;
    }));
    setN((0, immer_1.produce)(function (draft) {
        // @ts-expect-error
        draft.y = 4;
        draft.x = 5;
        // return draft + 1;
        return undefined;
    }));
    setN((0, immer_1.produce)(function (draft) {
        return { y: 3 };
    }));
});
it("infers draft, #720 - 3", function () {
    function useState(initialState) {
        return [initialState, function () { }];
    }
    var _a = useState({ x: 3 }), n = _a[0], setN = _a[1];
    setN((0, immer_1.produce)(function (draft) {
        // @ts-expect-error
        draft.y = 4;
        draft.x = 5;
        return draft;
    }));
    setN((0, immer_1.produce)(function (draft) {
        // @ts-expect-error
        draft.y = 4;
        draft.x = 5;
        // return draft + 1;
        return undefined;
    }));
    setN((0, immer_1.produce)(function (draft) {
        return { y: 3 };
    }));
});
it("infers curried", function () {
    {
        var fn = (0, immer_1.produce)(function (draft) {
            var x = draft.title;
        });
        fn({ title: "test" });
        // @ts-expect-error
        fn(3);
    }
    {
        var fn = (0, immer_1.produce)(function (draft) {
            var x = draft.title;
            return draft;
        });
        fn({ title: "test" });
        // @ts-expect-error
        fn(3);
    }
});
{
    var base = { count: 0 };
    {
        // basic
        var res = (0, immer_1.produce)(base, function (draft) {
            draft.count++;
        });
        (0, spec_ts_1.assert)(res, spec_ts_1._);
    }
    {
        // basic
        var res = (0, immer_1.produce)(base, function (draft) {
            draft.count++;
        });
        (0, spec_ts_1.assert)(res, spec_ts_1._);
    }
    {
        // basic
        var res = (0, immer_1.produce)(base, function (draft) {
            draft.count++;
        });
        (0, spec_ts_1.assert)(res, spec_ts_1._);
    }
    {
        // curried
        var f = (0, immer_1.produce)(function (state) {
            state.count++;
        });
        (0, spec_ts_1.assert)(f, spec_ts_1._);
    }
    {
        // curried
        var f = (0, immer_1.produce)(function (state) {
            state.count++;
        });
        (0, spec_ts_1.assert)(f, spec_ts_1._);
    }
    {
        // curried
        var f = (0, immer_1.produce)(function (state) {
            state.count++;
        });
    }
    {
        // curried
        var f = (0, immer_1.produce)(function (state) {
            state.count++;
        });
    }
    {
        // curried initial
        var f = (0, immer_1.produce)(function (state) {
            state.count++;
        }, spec_ts_1._);
        (0, spec_ts_1.assert)(f, spec_ts_1._);
    }
    {
        // curried initial
        var f = (0, immer_1.produce)(function (state) {
            state.count++;
        }, spec_ts_1._);
        (0, spec_ts_1.assert)(f, spec_ts_1._);
    }
    {
        // curried
        var f = (0, immer_1.produce)(function (state) {
            state.count++;
        }, base);
    }
    {
        // curried
        var f = (0, immer_1.produce)(function (state) {
            state.count++;
        }, base);
    }
    {
        // nothing allowed
        var res = (0, immer_1.produce)(base, function (draft) {
            return immer_1.nothing;
        });
        (0, spec_ts_1.assert)(res, spec_ts_1._);
    }
    {
        // as any
        var res = (0, immer_1.produce)(base, function (draft) {
            return immer_1.nothing;
        });
        (0, spec_ts_1.assert)(res, spec_ts_1._);
    }
    {
        // nothing not allowed
        // @ts-expect-error
        (0, immer_1.produce)(base, function (draft) {
            return immer_1.nothing;
        });
    }
    {
        var f = (0, immer_1.produce)(function (draft) { });
        var n = f(base);
        (0, spec_ts_1.assert)(n, spec_ts_1._);
    }
    {
        var f = (0, immer_1.produce)(function (draft) {
            draft.count++;
        });
        var n = f(base);
        (0, spec_ts_1.assert)(n, spec_ts_1._);
    }
    {
        // explictly use generic
        var f = (0, immer_1.produce)(function (draft) {
            draft.count++;
        });
        var n = f(base);
        (0, spec_ts_1.assert)(n, spec_ts_1._); // yay!
    }
}
it("allows for mixed property value types", function () {
    var input = { testObjectOrNull: null };
    (0, immer_1.produce)(input, function (draft) {
        if (draft.testObjectOrNull) {
            draft.testObjectOrNull.testProperty = 5;
        }
    });
});
