import { EventEmitter } from 'events';

// NOTE: This is a node.js-only export, and will not work in the browser.
export const errorEmitter = new EventEmitter();
