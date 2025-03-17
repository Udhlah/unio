import { createClient } from '@supabase/supabase-js';
import { db } from '../firebaseConfig';
import { getDoc, getDocs, addDoc, doc, updateDoc, collection,  } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = 'https://ienpjeskcsumantehhdk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllbnBqZXNrY3N1bWFudGVoaGRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwMTUwMDksImV4cCI6MjA1NzU5MTAwOX0.n1SE4XuGyEiGh2yOxTvFGdYIeZ8Acro0l6Sd376rbEo';

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadImage(file, bucketName, filePath, userId) {
    try {
        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (error) {
            console.error('Error uploading image:', error);
            return null;
        } else {
            console.log('Image uploaded:', data);
            const publicUrl = supabase.storage.from(bucketName).getPublicUrl(filePath);
            console.log("Raw publicUrl response:", publicUrl);
            const imageUrl = publicUrl.data.publicUrl;
            console.log("Extracted imageUrl:", imageUrl);
            if (userId) {
                try {
                    const userDocRef = doc(db, 'users', userId);
                    await updateDoc(userDocRef, {
                        profileImage: imageUrl,
                    });
                    console.log('Firestore updated with image URL:', imageUrl);
                } catch (firestoreError) {
                    console.error('Error updating Firestore:', firestoreError);
                    return imageUrl;
                }
            } else {
                console.error('User ID is undefined. Cannot update Firestore.');
            }
            return imageUrl;
        }
    } catch (err) {
        console.error('Error during upload:', err);
        return null;
    }
}

export async function publishPost(postText, selectedImages, currentUser) {
    try {
        if (!currentUser) {
            console.error('User not authenticated.');
            return;
        }

        const imageUrls = [];

        if (selectedImages && selectedImages.length > 0) {
            for (const image of selectedImages) {
                const file = await fetch(image.preview).then((r) => r.blob());
                const uniqueFilename = `${Date.now()}-${uuidv4()}-${image.name}`; // Add UUID
                const filePath = `posts/${currentUser.uid}/${uniqueFilename}`; // Correct path

                const { data, error } = await supabase.storage.from('posts').upload(filePath, file);

                if (error) {
                    console.error('Error uploading image:', error);
                    continue;
                }

                const publicUrl = supabase.storage.from('posts').getPublicUrl(filePath);
                imageUrls.push(publicUrl.data.publicUrl);
            }
        }

        const postData = {
            postText: postText,
            uploaderEmail: currentUser.email,
            uploaderId: currentUser.uid,
            timestamp: new Date(),
            imageUrls: imageUrls,
            likedBy: [],
            comments: [],
        };

        const docRef = await addDoc(collection(db, 'posts'), postData);
        console.log('Post published with ID:', docRef.id);
        return docRef.id;

    } catch (error) {
        console.error('Error publishing post:', error);
        return null;
    }
}

export async function fetchPosts() {
    try {
        const querySnapshot = await getDocs(collection(db, 'posts'));
        const postList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        const postsWithUsernames = await Promise.all(
            postList.map(async (post) => {
                if (post.uploaderId) {
                    const userDoc = await getDoc(doc(db, 'users', post.uploaderId));
                    if (userDoc.exists()) {
                        return { ...post, domain: userDoc.data().domain, username: userDoc.data().username, location: userDoc.data().location, profileImage: userDoc.data().profileImage };
                    }
                }
                return { ...post, username: post.uploaderEmail || 'Unknown User' };
            })
        );

        return postsWithUsernames;

    } catch (err) {
        console.error('Error fetching posts:', err);
        throw err;
    }
}

export async function uploadPdfToSupabase(file, title, currentUser, category, industry, skills) {
    try {
        if (!currentUser) {
            console.error('User not authenticated.');
            return null;
        }

        // Upload the PDF to Supabase storage under 'pdfs' bucket
        const filePath = `pdfs/${currentUser.uid}/${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage.from('pdfs').upload(filePath, file);

        if (error) {
            console.error('Error uploading PDF to Supabase:', error);
            return null;
        }

        // Get public URL of the uploaded PDF
        const publicUrl = await supabase.storage.from('pdfs').getPublicUrl(filePath);
        const pdfUrl = publicUrl.data.publicUrl;

        // Store metadata in Firebase Firestore with the additional fields
        const pdfData = {
            title: title,
            url: pdfUrl,
            time: new Date().toISOString(),
            uploaderId: currentUser.uid,
            uploaderEmail: currentUser.email,
            category: category, // Added category
            industry: industry, // Added industry
            skills: skills, // Added skills taught
        };

        const docRef = await addDoc(collection(db, 'pdfs'), pdfData);
        console.log('PDF metadata added to Firestore with ID:', docRef.id);

        return { id: docRef.id, title, url: pdfUrl, time: new Date().toISOString(), category, industry, skills };
    } catch (error) {
        console.error('Error during PDF upload:', error);
        alert(`Failed to upload PDF: ${error.message || 'An unexpected error occurred.'}`);
        return null;
    }
}

export async function fetchPdfsFromSupabase() {
    try {
        const querySnapshot = await getDocs(collection(db, 'pdfs'));
        const pdfList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        return pdfList;
    } catch (err) {
        console.error('Error fetching PDFs:', err);
        return null;
    }
}

export async function addComment(text, userId, postId, attachedFiles = []) {
    try {
        let fileUrls = [];

        if (attachedFiles.length > 0) {
            for (const file of attachedFiles) {
                const filePath = `comments/<span class="math-inline">\{Date\.now\(\)\}\-</span>{file.name}`;
                const { error: uploadError } = await supabase.storage
                    .from('comments')
                    .upload(filePath, file);

                if (uploadError) {
                    console.error('Error uploading file:', uploadError);
                    throw uploadError;
                }

                const { data: publicUrlData, error: publicUrlError } = supabase.storage
                    .from('comments')
                    .getPublicUrl(filePath);

                if (publicUrlError) {
                    console.error('Error getting public URL:', publicUrlError);
                    throw publicUrlError;
                }

                if (publicUrlData && publicUrlData.publicUrl) {
                    fileUrls.push(publicUrlData.publicUrl);
                } else {
                    console.error('Error getting public URL: No public URL returned');
                    throw new Error('Error getting public URL: No public URL returned');
                }
            }
        }

        // Add comment to Firestore
        const commentDocRef = await addDoc(collection(db, 'comments'), {
            commentText: text,
            uploaderId: userId,
            postId: postId,
            imageUrls: fileUrls,
            likedby: [],
            timestamp: new Date().toISOString(),
        });

        return commentDocRef.id; // Return the ID of the Firestore document
    } catch (error) {
        console.error('Error adding comment:', error);
        throw error;
    }
  }


export async function likeComment(commentId, updatedLikes) {
    try {
        const commentDocRef = doc(db, 'comments', commentId);
        await updateDoc(commentDocRef, {
            likedBy: updatedLikes,
        });
        console.log('Comment like updated:', commentId, updatedLikes);
    } catch (error) {
        console.error('Error liking comment:', error);
        throw error; // Rethrow the error to be handled in the component
    }
}
