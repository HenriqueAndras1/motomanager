import { decode } from "base-64";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

if (typeof global.atob === "undefined") {
  global.atob = decode;
}

const firebaseConfig = {
  apiKey: "AIzaSyARdrJctkwPo68ZHsqQOnC-Lg6lGk54RaM",
  authDomain: "servidorteste-5b4fd.firebaseapp.com",
  projectId: "servidorteste-5b4fd",
  storageBucket: "servidorteste-5b4fd.firebasestorage.app",
  messagingSenderId: "717861740926",
  appId: "1:717861740926:web:7b8b03cddb0daa24a8532f",
};

const appFirebase =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const banco = getFirestore(appFirebase);
export const storage = getStorage(appFirebase);