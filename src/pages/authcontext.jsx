import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  auth,
  provider,
  db,
} from '../firebase.js'; // Added .js extension to the import path
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [pendingApproval, setPendingApproval] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check user status in Firestore
  const checkUserStatus = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists()) {
        setPendingApproval(true);
        return false;
      }
      const userData = userDoc.data();
      if (userData.approved === true && userData.status === 'approved') {
        setPendingApproval(false);
        return true;
      } else if (userData.approved === false && userData.status === 'revoked') {
        setPendingApproval(true);
        return false;
      } else {
        await signOut(auth);
        setError('Your registration was rejected. Contact support.');
        return false;
      }
    } catch {
      setError('Failed to verify user status. Try again.');
      return false;
    }
  };

  // Email Login
  async function login(email, password) {
    setError('');
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const approved = await checkUserStatus(userCredential.user.uid);
      if (approved) {
        setCurrentUser(userCredential.user);
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      setError(err.message);
      setCurrentUser(null);
    }
    setLoading(false);
  }

  // Email Signup
  // The 'name' parameter is added here. If the UserAuth component doesn't send it, it will be undefined and stored as null.
  async function signup(email, password, role) {
    setError('');
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        approved: false,
        createdAt: new Date(), // Timestamp for creation
        email,
        role,
        status: 'pending',
        name: null, // For email/password signups, name is initially null as not collected in UI
      });
      setPendingApproval(true);
      setCurrentUser(null);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  // Google Auth
  async function googleAuth() {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (!userDoc.exists()) {
        // New Google user registration
        await setDoc(doc(db, 'users', user.uid), {
          approved: false,
          createdAt: new Date(), // Timestamp for creation
          email: user.email,
          role: 'Editor', // Default role for Google sign-ups
          status: 'pending',
          name: user.displayName || null, // Use Google display name, or null if not available
        });
        setPendingApproval(true);
        setCurrentUser(null);
      } else {
        // Existing Google user login
        const data = userDoc.data();
        if (data.approved === true && data.status === 'approved') {
          setPendingApproval(false);
          setCurrentUser(user);
        } else if (data.approved === false && data.status !== 'approved') {
          setPendingApproval(true);
          setCurrentUser(null);
        } else {
          await signOut(auth);
          setError('Your registration was rejected. Contact support.');
          setCurrentUser(null);
        }
      }
    } catch (err) {
      setError(err.message);
      setCurrentUser(null);
    }
    setLoading(false);
  }

  // Logout
  async function logout() {
    setError('');
    setLoading(true);
    try {
      await signOut(auth);
      setCurrentUser(null);
      setPendingApproval(false);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  // ✅ Listen for auth state changes AND real-time user status updates
  useEffect(() => {
    let unsubscribeUserDoc = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;

        // Real-time listener to Firestore user's status
        unsubscribeUserDoc = onSnapshot(doc(db, 'users', uid), (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();

            if (data.status === 'approved' && data.approved === true) {
              setCurrentUser(user);
              setPendingApproval(false);
              setError('');
            } else if (data.status !== 'approved' || data.approved === false) {
              // If status is not approved or 'approved' flag is false, treat as pending/rejected
              setPendingApproval(true);
              setCurrentUser(null); // Clear current user to prevent access
              // Only sign out and navigate if the status is explicitly 'rejected' or 'revoked'
              // to prevent logout loops if it's genuinely just 'pending'.
              if (data.status === 'rejected' || data.status === 'revoked') {
                setError('Your account status requires attention. Please contact support.');
                signOut(auth).then(() => {
                  navigate('/login'); // Redirect to login after explicit rejection/revocation
                });
              } else {
                setError('Your account is pending approval.'); // Generic message for pending
              }
            } else {
              // Fallback for any other unexpected state
              setPendingApproval(true);
              setCurrentUser(null);
            }
          } else {
            // If user document doesn't exist for an authenticated user, it's pending approval
            setPendingApproval(true);
            setCurrentUser(null);
          }
          setLoading(false);
        });
      } else {
        setCurrentUser(null);
        setPendingApproval(false);
        setLoading(false);
      }
    });

    return () => {
      if (unsubscribeUserDoc) unsubscribeUserDoc();
      unsubscribeAuth();
    };
  }, [navigate]); // Added navigate to dependency array for useEffect safety

  const value = {
    currentUser,
    pendingApproval,
    loading,
    error,
    login,
    signup,
    googleAuth,
    logout,
    setError,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
