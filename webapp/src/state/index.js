import { createStore, combineReducers } from "redux";

let reducersTable = {};

export function attachHandler(handler) {
  Object.assign(reducersTable, handler);
}

export function buildStore() {
  return createStore(combineReducers(reducersTable));
}
