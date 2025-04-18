// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: NEXT_JS_API_KEY,
    authDomain: NEXT_JS_AUTH_DOMAIN,
    projectId: NEXT_JS_PROJECT_ID,
    storageBucket: NEXT_JS_STORAGE_BUCKET,
    messagingSenderId: NEXT_JS_MESSAGING_SENDER_ID,
    appId: NEXT_JS_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);