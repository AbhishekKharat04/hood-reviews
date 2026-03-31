/**
 * storage.js — Local storage adapter that mimics the window.storage API
 * used in the Claude-generated code. Data persists in the browser's
 * localStorage so reviews survive page refreshes.
 *
 * When you're ready to share your app with the world, swap this out
 * for the Firebase version described in the README.
 */

window.storage = {
  /**
   * Read a key from localStorage.
   * Returns { value } if found, or null if not.
   */
  get: async (key) => {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return { value: raw };
  },

  /**
   * Write a value (string) to localStorage.
   * Returns { key, value }.
   */
  set: async (key, value) => {
    localStorage.setItem(key, value);
    return { key, value };
  },

  /**
   * Delete a key from localStorage.
   * Returns { key, deleted: true }.
   */
  delete: async (key) => {
    localStorage.removeItem(key);
    return { key, deleted: true };
  },
};
