// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, getDoc, deleteDoc, collection, addDoc, getDocs, updateDoc, doc } from "firebase/firestore";
import { deleteObject, ref, uploadBytes, getDownloadURL, getStorage  } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA4he1ToOWZyNW4gNBvl5QBAELJcUyai6o",
    authDomain: "mega-1df5e.firebaseapp.com",
    projectId: "mega-1df5e",
    storageBucket: "mega-1df5e.firebasestorage.app",
    messagingSenderId: "555903627580",
    appId: "1:555903627580:web:f63180c493a0d3e326ae39",
    measurementId: "G-33FYFTG2G8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };

// Function to upload a PDF to Firebase Storage
export async function uploadPdfToFirebase(file, title) {
    try {
        const storageRef = ref(storage, 'pdfs/' + file.name);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);

        // Add PDF metadata to Firestore
        const docRef = await addDoc(collection(db, 'pdfs'), {
            title: title,
            url: url,
            time: new Date(),
            likes: [] // Initialize likes as an empty array
        });

        return { id: docRef.id, title, url, time: new Date(), likes: [] }; // Return PDF data
    } catch (error) {
        console.error("Error uploading PDF to Firebase:", error);
        return null;
    }
}

// Function to fetch PDFs from Firebase Firestore
export async function fetchPdfsFromFirebase() {
    try {
        const querySnapshot = await getDocs(collection(db, 'pdfs'));
        const pdfs = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return pdfs;
    } catch (error) {
        console.error("Error fetching PDFs from Firebase:", error);
        return null;
    }
}

// Function to update PDF likes in Firebase Firestore
export async function updatePdfLikesFirebase(pdfId, likes) {
    try {
        const pdfDocRef = doc(db, 'pdfs', pdfId);
        await updateDoc(pdfDocRef, { likes: likes });
        return true; // Indicate success
    } catch (error) {
        console.error("Error updating PDF likes in Firebase:", error);
        return null;
    }
}

export async function deletePdfFromFirebase(pdfId, storageUrl) {
    try {
        // Check if document exists in Firestore
        const pdfDocRef = doc(db, 'pdfs', pdfId);
        const docSnap = await getDoc(pdfDocRef);

        if (!docSnap.exists()) {
            console.error(`PDF with ID ${pdfId} does not exist in Firestore.`);
            return "PDF does not exist in Firestore.";
        }

        // Delete document from Firestore
        await deleteDoc(pdfDocRef);
        console.log(`PDF document with ID ${pdfId} deleted from Firestore.`);

        // Delete file from Firebase Storage
        const storageRef = ref(storage, storageUrl);
        await deleteObject(storageRef);
        console.log(`PDF file with URL ${storageUrl} deleted from Storage.`);

        console.log(`PDF with ID ${pdfId} deleted successfully.`);
        return null; // Return null on success
    } catch (error) {
        console.error(`Error deleting PDF with ID ${pdfId}:`, error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);

        // Provide more specific error messages
        if (error.code === 'storage/object-not-found') {
            return "PDF file not found in Storage.";
        } else if (error.code === 'permission-denied') {
            return "Permission denied. Please check your security rules.";
        } else {
            return `Failed to delete PDF: ${error.message}`;
        }
    }
}

export async function deletePostFromFirebase(postId, imageUrls) {
    try {
        // Check if document exists in Firestore
        const postDocRef = doc(db, 'posts', postId);
        const docSnap = await getDoc(postDocRef);

        if (!docSnap.exists()) {
            console.error(`Post with ID ${postId} does not exist in Firestore.`);
            return "Post does not exist in Firestore.";
        }

        // Delete document from Firestore
        await deleteDoc(postDocRef);
        console.log(`Post document with ID ${postId} deleted from Firestore.`);

        // Delete images from Firebase Storage if imageUrls exist
        if (imageUrls && imageUrls.length > 0) {
            for (const imageUrl of imageUrls) {
                try {
                    const storageRef = ref(storage, imageUrl);
                    await deleteObject(storageRef);
                    console.log(`Image file with URL ${imageUrl} deleted from Storage.`);
                } catch (storageError) {
                    console.error(`Error deleting image ${imageUrl}:`, storageError);
                    // Continue trying to delete other images, even if one fails
                }
            }
        }

        console.log(`Post with ID ${postId} deleted successfully.`);
        return null; // Return null on success
    } catch (error) {
        console.error(`Error deleting post with ID ${postId}:`, error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);

        // Provide more specific error messages
        if (error.code === 'storage/object-not-found') {
            return "Post image file not found in Storage.";
        } else if (error.code === 'permission-denied') {
            return "Permission denied. Please check your security rules.";
        } else {
            return `Failed to delete post: ${error.message}`;
        }
    }
}

export const updatePostInDatabase = async (postId, newText) => {
    try {
      const postRef = doc(db, 'posts', postId);  // Adjust to your Firestore collection
      await updateDoc(postRef, {
        postText: newText,
        timestamp: new Date(),  // Optionally update the timestamp
      });
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  export const deleteCommentFromFirebase = async (commentId, imageUrls) => {
    try {
        // Check if comment exists in Firestore
        const commentDocRef = doc(db, 'comments', commentId);
        const docSnap = await getDoc(commentDocRef);

        if (!docSnap.exists()) {
            console.error(`Comment with ID ${commentId} does not exist in Firestore.`);
            return "Comment does not exist in Firestore.";
        }

        // Delete comment document from Firestore
        await deleteDoc(commentDocRef);
        console.log(`Comment document with ID ${commentId} deleted from Firestore.`);

        // Delete images from Firebase Storage if imageUrls exist
        if (imageUrls && imageUrls.length > 0) {
            for (const imageUrl of imageUrls) {
                try {
                    const storageRef = ref(storage, imageUrl);
                    await deleteObject(storageRef);
                    console.log(`Image file with URL ${imageUrl} deleted from Storage.`);
                } catch (storageError) {
                    console.error(`Error deleting image ${imageUrl}:`, storageError);
                    // Continue trying to delete other images, even if one fails
                }
            }
        }

        console.log(`Comment with ID ${commentId} deleted successfully.`);
        return null; // Return null on success
    } catch (error) {
        console.error(`Error deleting comment with ID ${commentId}:`, error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);

        // Provide more specific error messages
        if (error.code === 'storage/object-not-found') {
            return "Comment image file not found in Storage.";
        } else if (error.code === 'permission-denied') {
            return "Permission denied. Please check your security rules.";
        } else {
            return `Failed to delete comment: ${error.message}`;
        }
    }
};