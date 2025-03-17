import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig'; // Adjust the import path if necessary

export async function userSignUp(username, email, password) {
  try {
    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Send email verification
    await sendEmailVerification(user);

    // Generate the domain
    const generatedDomain = username.toLowerCase().replace(/\s+/g, "-");

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
      rating: [],
      following: [],
      follower: [],
      website: "",
      socials: "",
      category: [],
      industry: [],
      collaborationReq: [],
      collaborating: [],
      ourReq: [],
      domain: generatedDomain, // Store the generated domain
      bannerImage: "",
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
    const user = userCredential.user;

    if (!user.emailVerified) {
      console.error("SignIn Error: Email not verified");
      return { success: false, error: "Email not verified" };
    }

    console.log("User signed in:", user);
    return { success: true, user: user };
  } catch (error) {
    console.error("SignIn Error:", error.message);
    return { success: false, error: error.message };
  }
}