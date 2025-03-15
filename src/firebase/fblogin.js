import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

// SignUp function
export async function userSignUp(username, email, password) {
  try {
    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create a user directory in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      username: username,
      email: email,
      createdAt: new Date(),
      location: "",
      address: "",
      number: "",
      about: "",
      profileImage: "",
      reviews: [],
      rating: []
    });

    console.log("User registered:", user);
    return { success: true, user };
  } catch (error) {
    console.error("SignUp Error:", error.message);
    return { success: false, error: error.message };
  }
}

// SignIn function
export async function userSignIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User signed in:", userCredential.user);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("SignIn Error:", error.message);
    return { success: false, error: error.message };
  }
}