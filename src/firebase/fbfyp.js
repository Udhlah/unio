import { collection, query, where, getDocs, orderBy, limit, or, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Adjust the import path

export async function fetchCuratedPosts(userId) {
  try {
    const curatedPosts = [];
    console.log(userId);
    // Fetch user data
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      console.error('User not found');
      return [];
    }
    const userData = userDoc.data();
    const following = userData.following || [];
    const userCategories = userData.categories || [];
    const userIndustries = userData.industries || [];
    console.log(following, userCategories, userIndustries);

    // Fetch posts from followed users
    if (following && following.length > 0) {
      const followedUsersQuery = query(
        collection(db, 'posts'),
        where('uploaderId', 'in', following),
        orderBy('timestamp', 'desc'),
        limit(50) // Adjust limit as needed
      );

      const followedUsersSnapshot = await getDocs(followedUsersQuery);
      followedUsersSnapshot.forEach((doc) => {
        curatedPosts.push({ id: doc.id, ...doc.data() });
      });
    }

    // Fetch posts with similar categories and industries
    if (userCategories && userCategories.length > 0 || userIndustries && userIndustries.length > 0) {
      let similarPostsQuery;

      if (userCategories && userCategories.length > 0 && userIndustries && userIndustries.length > 0) {
        similarPostsQuery = query(
          collection(db, 'posts'),
          or(
            where('categories', 'array-contains-any', userCategories),
            where('industries', 'array-contains-any', userIndustries)
          ),
          orderBy('timestamp', 'desc'),
          limit(50) // Adjust limit as needed
        );
      } else if (userCategories && userCategories.length > 0) {
        similarPostsQuery = query(
          collection(db, 'posts'),
          where('categories', 'array-contains-any', userCategories),
          orderBy('timestamp', 'desc'),
          limit(50)
        );
      } else {
        similarPostsQuery = query(
          collection(db, 'posts'),
          where('industries', 'array-contains-any', userIndustries),
          orderBy('timestamp', 'desc'),
          limit(50)
        );
      }

      const similarPostsSnapshot = await getDocs(similarPostsQuery);
      console.log('Similarpostsnapsho', similarPostsSnapshot);
      similarPostsSnapshot.forEach((doc) => {
        // Exclude posts already added from followed users
        console.log('curatedPosts type:', typeof curatedPosts);
        console.log('curatedPosts value:', curatedPosts);
        if (curatedPosts && Array.isArray(curatedPosts) && !curatedPosts.some((post) => post.id === doc.id)) {
          curatedPosts.push({ id: doc.id, ...doc.data() });
        }
      });
    }

    // Shuffle the posts to mix followed and similar posts
    const shuffledPosts = curatedPosts.sort(() => Math.random() - 0.5);
    console.log('Shuffled posts', shuffledPosts);

    // Fetch user data for each post
    const postsWithUserData = await Promise.all(
      shuffledPosts.map(async (post) => {
        const userDoc = await getDoc(doc(db, 'users', post.uploaderId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          return {
            ...post,
            location: userData.location,
            profileImage: userData.profileImage,
            username: userData.username,
            domain: userData.domain,
          };
        } else {
          // If user doc doesn't exist, return post without user data
          return post;
        }
      })
    );

    return postsWithUserData;
  } catch (error) {
    console.error('Error fetching curated posts:', error);
    return [];
  }
}

export async function fetchTopUsers() {
    try {
      const usersCollection = collection(db, 'users');
      const usersQuery = query(
        usersCollection,
        orderBy('follower', 'desc'),
        limit(10)
      );
  
      const usersSnapshot = await getDocs(usersQuery);
  
      const topUsers = usersSnapshot.docs.map((doc) => {
        const userData = doc.data();
        const followerCount = userData.follower ? userData.follower.length : 0; // Get follower count
        return {
          id: doc.id,
          ...userData,
          followerCount: followerCount,
        };
      });
  
      return topUsers;
    } catch (error) {
      console.error('Error fetching top users:', error);
      return [];
    }
  }