import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig.js";  // Ensure you have the Firestore db initialized

// Function to update user profile
export const editProfile = async (uid, updatedData) => {
  try {
    const userRef = doc(db, "users", uid); // Reference to user's Firestore document
    await updateDoc(userRef, updatedData); // Update the document with new data
    console.log("Profile updated successfully!");
  } catch (error) {
    console.error("Error updating profile: ", error);
  }
};