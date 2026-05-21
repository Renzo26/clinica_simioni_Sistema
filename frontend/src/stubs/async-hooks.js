export class AsyncLocalStorage {
  constructor() {}
  run(store, fn, ...args) { return fn(...args); }
  getStore() { return undefined; }
  enterWith() {}
  disable() {}
}
export class AsyncResource {
  constructor() {}
  static bind(fn) { return fn; }
  bind(fn) { return fn; }
  runInAsyncScope(fn, _thisArg, ...args) { return fn(...args); }
}
