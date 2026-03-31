/**
 * storage.js — Firestore adapter
 * Images and small key-value data are stored as individual Firestore
 * documents in the "storage" collection. Reviews have their own
 * "reviews" collection (managed directly in App.jsx with onSnapshot).
 */
import { db } from "./firebase.js";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";

window.storage = {
  get: async (key) => {
    const d = await getDoc(doc(db, "storage", key));
    return d.exists() ? { value: d.data().value } : null;
  },
  set: async (key, value) => {
    await setDoc(doc(db, "storage", key), { value });
    return { key, value };
  },
  delete: async (key) => {
    await deleteDoc(doc(db, "storage", key));
    return { key, deleted: true };
  },
};
