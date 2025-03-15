import { createClient } from '@supabase/supabase-js';

// Directly putting the Supabase URL and Key here
const supabaseUrl = 'https://ienpjeskcsumantehhdk.supabase.co'; // Replace with your actual URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllbnBqZXNrY3N1bWFudGVoaGRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwMTUwMDksImV4cCI6MjA1NzU5MTAwOX0.n1SE4XuGyEiGh2yOxTvFGdYIeZ8Acro0l6Sd376rbEo'; // Replace with your actual public key

// Creating the Supabase client instance
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;

import { supabase } from '../supabaseClient'; // Adjust the import path
import { db } from '../firebaseConfig'; // Import your Firestore config
import { doc, updateDoc } from 'firebase/firestore'; // Import Firestore functions

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
      const imageUrl = publicUrl.publicUrl;

      // Update Firestore with the image URL
      if (userId) { // Check if userId is available
        try {
          const userDocRef = doc(db, 'users', userId); // Reference to the user's document
          await updateDoc(userDocRef, {
            profileImage: imageUrl,
          });
          console.log('Firestore updated with image URL:', imageUrl);
        } catch (firestoreError) {
          console.error('Error updating Firestore:', firestoreError);
          return imageUrl; // Return the url, even if firestore fails to update.
        }
      } else {
        console.error('User ID is undefined. Cannot update Firestore.');
      }
      return imageUrl; // Return the image URL
    }
  } catch (err) {
    console.error('Error during upload:', err);
    return null;
  }
}