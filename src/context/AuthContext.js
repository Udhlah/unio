import React, { createContext, useState, useEffect, useContext } from "react";
import { auth } from "../firebaseConfig.js";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig.js";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (user) => {
    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserData(userSnap.data());
        } else {
          console.log("User data not found");
          setUserData(null);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserData(null);
      }
    } else {
      setUserData(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      await fetchUserData(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateUserData = async (updatedData) => {
    if (currentUser) {
      setLoading(true); //set loading to true.
      try {
        const userRef = doc(db, "users", currentUser.uid);
        await setDoc(
          userRef,
          {
            ...userData,
            ...updatedData,
          },
          { merge: true }
        );
        console.log("User data updated in Firestore");

        // Update local state AFTER successful Firestore update
        setUserData((prevData) => ({
          ...prevData,
          ...updatedData,
        }));
      } catch (error) {
        console.error("Error updating user data in Firestore:", error);
      } finally {
        setLoading(false); // set loading to false.
      }
    }
  };

  const value = {
    currentUser,
    userData,
    loading,
    updateUserData,
    fetchUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};