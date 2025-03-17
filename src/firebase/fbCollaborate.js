import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig.js'; // Adjust the import path

// Function to request collaboration
export async function reqCollaborate(userDataUid, companyDataUid) {
    if (!userDataUid || !companyDataUid) {
        console.error("Invalid user or company UID");
        return false;
    }

    const companyRef = doc(db, 'users', companyDataUid);

    try {
        await updateDoc(companyRef, {
            collaborationReq: arrayUnion(userDataUid)
        });
        return true;
    } catch (error) {
        console.error("Error requesting collaboration:", error);
        return false;
    }
}

// Function to accept collaboration
export async function acceptCollaborate(userDataUid, companyDataUid) {
    if (!userDataUid || !companyDataUid) {
        console.error("Invalid user or company UID");
        return false;
    }

    const companyRef = doc(db, 'users', companyDataUid);

    try {
        await updateDoc(companyRef, {
            collaborationReq: arrayRemove(userDataUid),
            collaborating: arrayUnion(userDataUid)
        });

        return true;
    } catch (error) {
        console.error("Error accepting collaboration:", error);
        return false;
    }
}

// Function to decline collaboration
export async function declineCollaborate(userDataUid, companyDataUid) {
    if (!userDataUid || !companyDataUid) {
        console.error("Invalid user or company UID");
        return false;
    }

    const companyRef = doc(db, 'users', companyDataUid);

    try {
        await updateDoc(companyRef, {
            collaborationReq: arrayRemove(userDataUid)
        });
        return true;
    } catch (error) {
        console.error("Error declining collaboration:", error);
        return false;
    }
}