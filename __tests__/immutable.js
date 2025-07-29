"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var spec_ts_1 = require("./spec_ts");
var immer_1 = require("../src/immer");
test("types are ok", function () {
    // array in tuple
    {
        var val = spec_ts_1._;
        (0, spec_ts_1.assert)(val, spec_ts_1._);
    }
    // tuple in array
    {
        var val = spec_ts_1._;
        (0, spec_ts_1.assert)(val, spec_ts_1._);
    }
    // tuple in tuple
    {
        var val = spec_ts_1._;
        (0, spec_ts_1.assert)(val, spec_ts_1._);
    }
    // array in array
    {
        var val = spec_ts_1._;
        (0, spec_ts_1.assert)(val, spec_ts_1._);
    }
    // tuple in object
    {
        var val = spec_ts_1._;
        (0, spec_ts_1.assert)(val, spec_ts_1._);
    }
    // object in tuple
    {
        var val = spec_ts_1._;
        (0, spec_ts_1.assert)(val, spec_ts_1._);
    }
    // array in object
    {
        var val = spec_ts_1._;
        (0, spec_ts_1.assert)(val, spec_ts_1._);
    }
    // object in array
    {
        var val = spec_ts_1._;
        (0, spec_ts_1.assert)(val, spec_ts_1._);
    }
    // object in object
    {
        var val = spec_ts_1._;
        (0, spec_ts_1.assert)(val, spec_ts_1._);
    }
    // Map
    {
        var val = spec_ts_1._;
        (0, spec_ts_1.assert)(val, spec_ts_1._);
    }
    // Already immutable Map
    {
        var val = spec_ts_1._;
        (0, spec_ts_1.assert)(val, spec_ts_1._);
    }
    // object in Map
    {
        var val = spec_ts_1._;
        (0, spec_ts_1.assert)(val, spec_ts_1._);
    }
    // Set
    {
        var val = spec_ts_1._;
        (0, spec_ts_1.assert)(val, spec_ts_1._);
    }
    // Already immutable Set
    {
        var val = spec_ts_1._;
        (0, spec_ts_1.assert)(val, spec_ts_1._);
    }
    // object in Set
    {
        var val = spec_ts_1._;
        (0, spec_ts_1.assert)(val, spec_ts_1._);
    }
    expect(true).toBe(true);
});
test("#381 produce immutable state", function () {
    var someState = {
        todos: [
            {
                done: false
            }
        ]
    };
    var immutable = (0, immer_1.castImmutable)((0, immer_1.produce)(someState, function (_draft) { }));
    (0, spec_ts_1.assert)(immutable, spec_ts_1._);
});
test("castImmutable preserves a value", function () {
    var x = {};
    expect((0, immer_1.castImmutable)(x)).toBe(x);
});
