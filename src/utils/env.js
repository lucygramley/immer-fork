"use strict";
// Should be no imports here!
Object.defineProperty(exports, "__esModule", { value: true });
exports.DRAFT_STATE = exports.DRAFTABLE = exports.NOTHING = void 0;
/**
 * The sentinel value returned by producers to replace the draft with undefined.
 */
exports.NOTHING = Symbol.for("immer-nothing");
/**
 * To let Immer treat your class instances as plain immutable objects
 * (albeit with a custom prototype), you must define either an instance property
 * or a static property on each of your custom classes.
 *
 * Otherwise, your class instance will never be drafted, which means it won't be
 * safe to mutate in a produce callback.
 */
exports.DRAFTABLE = Symbol.for("immer-draftable");
exports.DRAFT_STATE = Symbol.for("immer-state");
