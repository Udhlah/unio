import { collection, query, where, getDocs, doc, getDoc, deleteDoc, arrayUnion, arrayRemove, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Adjust the import path as needed

export async function fetchComments(postId) {
    try {
      const q = query(collection(db, 'comments'), where('postId', '==', postId));
      const querySnapshot = await getDocs(q);
      const fetchedComments = [];
  
      for (const docSnapshot of querySnapshot.docs) {
        const commentData = docSnapshot.data();
        const userDoc = await getDoc(doc(db, 'users', commentData.uploaderId));
        const username = userDoc.exists() ? userDoc.data().username : 'Unknown User';
        const location = userDoc.exists() ? userDoc.data().location : 'Unknown User';
        const profileImage = userDoc.exists() ? userDoc.data().profileImage : 'Unknown User';
        fetchedComments.push({
          id: docSnapshot.id,
          ...commentData,
          username,
          location, 
          profileImage,
        });
      }
  
      return fetchedComments;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error; // Rethrow the error for handling in the component
    }
  }
  
  export async function fetchForProfile(currentUser) {
    let userPosts = [];
    let likedPosts = [];
    console.log(currentUser);
  
    try {
      if (!currentUser) return { userPosts: [], likedPosts: [], commentedPosts: [] };
  
      // Fetch posts uploaded by the current user
      const userPostsQuery = query(collection(db, "posts"), where("uploaderId", "==", currentUser));
      const userPostsSnapshot = await getDocs(userPostsQuery);
      userPosts = userPostsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      // Fetch posts liked by the current user (Corrected Query)
      const likedPostsQuery = query(collection(db, "posts"), where("likedBy", "array-contains", currentUser));
      const likedPostsSnapshot = await getDocs(likedPostsQuery);
      likedPosts = likedPostsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      // Fetch comments made by the current user
      const commentsQuery = query(collection(db, "comments"), where("uploaderId", "==", currentUser));
      const commentsSnapshot = await getDocs(commentsQuery);
  
      // Prepare an array to hold the commented posts with commenter details
      const commentedPosts = [];
  
      // Loop through each comment to fetch post and commenter details
      for (const commentDoc of commentsSnapshot.docs) {
        const commentData = commentDoc.data();
        const postId = commentData.postId;
  
        // Fetch the post
        const postDoc = await getDoc(doc(db, "posts", postId));
        if (postDoc.exists()) {
          const post = { id: postId, ...postDoc.data() };
  
          // Fetch the commenter's user data
          const commentedDoc = await getDoc(doc(db, "users", commentData.uploaderId));
          if (commentedDoc.exists()) {
              
  
            // Add the post with commenter details to the array
            commentedPosts.push({
              ...post,
              username: commentedDoc.data().username || "Unknown User",
              location: commentedDoc.data().location || "Unknown Location",
              profileImage: commentedDoc.data().profileImage || "", // Include commenter details
            });
          } else {
            // If commenter's user data is not found
            commentedPosts.push({
              ...post,
              username: "Unknown User",
              location: "Unknown Location",
              profileImage: "", // Include commenter details
            });
          }
        }
      }
  
      // Get unique uploader IDs to avoid redundant database reads
      const allUploaderIds = [
        ...new Set([...userPosts, ...likedPosts, ...commentedPosts].map((post) => post.uploaderId)),
      ];
  
      // Fetch uploader details (username, location, profileImage) for each uploaderId
      const uploaderDetails = {};
      await Promise.all(
        allUploaderIds.map(async (uploaderId) => {
          const userDoc = await getDoc(doc(db, "users", uploaderId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            uploaderDetails[uploaderId] = {
              username: userData.username || "Unknown User",
              location: userData.location || "Unknown Location",
              profileImage: userData.profileImage || "",
            };
          }
        })
      );
      
      // Modify attachUploaderInfo to attach details directly to the post
      const attachUploaderInfo = (posts) =>
        posts.map((post) => {
          const uploaderInfo = uploaderDetails[post.uploaderId] || {
            username: "Unknown User",
            location: "Unknown Location",
            profileImage: "",
          };
          return {
            ...post,
            username: uploaderInfo.username, // Attach username directly
            location: uploaderInfo.location, // Attach location directly
            profileImage: uploaderInfo.profileImage, // Attach profileImage directly
          };
        });
  
      return {
        userPosts: attachUploaderInfo(userPosts),
        likedPosts: attachUploaderInfo(likedPosts),
        commentedPosts: commentedPosts,
      };
    } catch (err) {
      console.error("Error fetching profile data:", err);
      throw err;
    }
  }

  export async function deletePost(postId) {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await deleteDoc(doc(db, "posts", postId));
      return true;
    } catch (err) {
      console.error("Error deleting post:", err);
      return false;
    }
  }
  
  export async function fetchCompanyProfile (domain) {
    try {
        const companiesCollection = collection(db, "users");
        const q = query(companiesCollection, where("domain", "==", domain));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const companyDoc = querySnapshot.docs[0];
            return { id: companyDoc.id, ...companyDoc.data() };
        } else {
            return null; // Company not found
        }
    } catch (error) {
        console.error('Error fetching company profile:', error);
        return null;
    }
};

export async function checkFollowingStatus (userId, companyUid, setIsFollowing) {
    if (userId && companyUid) {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const following = userDoc.data().following || [];
        setIsFollowing(following.includes(companyUid));
      }
    }
  };
  
  export async function handleFollowToggle(userId, companyUid, isFollowing) {
      if (userId && companyUid) {
          const userRef = doc(db, 'users', userId);
          const companyRef = doc(db, 'users', companyUid);
  
          try {
              if (isFollowing) {
                  // Remove companyUid from user's following array
                  await updateDoc(userRef, { following: arrayRemove(companyUid) });
                  // Remove userId from company's followers array
                  await updateDoc(companyRef, { follower: arrayRemove(userId) });
                  return false; // Indicate unfollow success
              } else {
                  // Add companyUid to user's following array
                  await updateDoc(userRef, { following: arrayUnion(companyUid) });
                  // Add userId to company's followers array
                  await updateDoc(companyRef, { follower: arrayUnion(userId) });
                  return true; // Indicate follow success
              }
          } catch (error) {
              console.error('Error toggling follow:', error);
              return null; // Indicate an error occurred
          }
      } else {
          return null; // Indicate invalid input
      }
  }

  export async function fetchTrending() {
    try {
      const pdfsCollection = collection(db, 'pdfs');
      const querySnapshot = await getDocs(pdfsCollection);
  
      const pdfs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      const trendingPdfs = pdfs
        .map((pdf) => {
          const likesCount = pdf.likes ? pdf.likes.length : 0;
          const createdAt = pdf.createdAt instanceof Timestamp ? pdf.createdAt.toDate() : new Date(); // Handle timestamp
          const ageInDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
          const trendingScore = ageInDays > 0 ? likesCount / ageInDays : likesCount; // Avoid division by zero
          return { ...pdf, trendingScore };
        })
        .sort((a, b) => b.trendingScore - a.trendingScore)
        .slice(0, 5);
  
      return trendingPdfs.map(pdf => {
        const { trendingScore, ...pdfData } = pdf;
        return pdfData;
      });
  
    } catch (error) {
      console.error('Error fetching trending PDFs:', error);
      return [];
    }
  }

  export async function followUser(userId, companyUid) {
    if (userId && companyUid) {
      const userRef = doc(db, 'users', userId);
      const companyRef = doc(db, 'companies', companyUid);
  
      try {
        // Add companyUid to user's following array
        await updateDoc(userRef, { following: arrayUnion(companyUid) });
        // Add userId to company's followers array
        await updateDoc(companyRef, { follower: arrayUnion(userId) });
        return true; // Indicate follow success
      } catch (error) {
        console.error('Error following user:', error);
        return null; // Indicate an error occurred
      }
    } else {
      return null; // Indicate invalid input
    }
  }
  
  export async function unfollowUser(userId, companyUid) {
    if (userId && companyUid) {
      const userRef = doc(db, 'users', userId);
      const companyRef = doc(db, 'companies', companyUid);
  
      try {
        // Remove companyUid from user's following array
        await updateDoc(userRef, { following: arrayRemove(companyUid) });
        // Remove userId from company's followers array
        await updateDoc(companyRef, { follower: arrayRemove(userId) });
        return false; // Indicate unfollow success
      } catch (error) {
        console.error('Error unfollowing user:', error);
        return null; // Indicate an error occurred
      }
    } else {
      return null; // Indicate invalid input
    }
  }