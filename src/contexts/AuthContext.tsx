import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { demoUsers } from '../services/mockData';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, password?: string, role?: UserRole) => Promise<boolean>;
  register: (email: string, password: string, fullName: string, role: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AUTH_STORAGE_KEY = 'smart_class_auth_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return demoUsers.TEACHER;
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const profile = userSnap.data() as UserProfile;
            setUser(profile);
          } else {
            const defaultProfile: UserProfile = {
              id: firebaseUser.uid,
              fullName: firebaseUser.displayName || 'Thành viên mới',
              email: firebaseUser.email || '',
              role: 'TEACHER',
              avatarUrl: '',
              schoolId: 'school_01',
              createdAt: new Date().toISOString()
            };
            setUser(defaultProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const login = async (email: string, password?: string, requestedRole?: UserRole): Promise<boolean> => {
    if (password && password !== 'password123') {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const userDocRef = doc(db, 'users', cred.user.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          setUser(userSnap.data() as UserProfile);
          return true;
        }
      } catch (error) {
        console.warn('Firebase signin fallback to demo:', error);
      }
    }

    let targetUser: UserProfile | undefined;
    if (requestedRole && demoUsers[requestedRole]) {
      targetUser = demoUsers[requestedRole];
    } else {
      targetUser = Object.values(demoUsers).find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!targetUser) {
        targetUser = {
          id: 'user_' + Date.now(),
          fullName: email.split('@')[0],
          email: email,
          role: requestedRole || 'TEACHER',
          schoolId: 'school_01',
          createdAt: new Date().toISOString()
        };
      }
    }
    setUser(targetUser || null);
    return true;
  };

  const register = async (email: string, password: string, fullName: string, role: UserRole): Promise<boolean> => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const newUserProfile: UserProfile = {
        id: cred.user.uid,
        fullName,
        email,
        role,
        schoolId: 'school_01',
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', cred.user.uid), newUserProfile);
      setUser(newUserProfile);
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/new`);
      const fallbackUser: UserProfile = {
        id: 'user_' + Date.now(),
        fullName,
        email,
        role,
        schoolId: 'school_01',
        createdAt: new Date().toISOString()
      };
      setUser(fallbackUser);
      return true;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
    setUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    const targetUser = demoUsers[newRole];
    if (targetUser) {
      setUser(targetUser);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    try {
      if (user.id) {
        await setDoc(doc(db, 'users', user.id), updated, { merge: true });
      }
    } catch (error) {
      console.error('Failed to update profile in firestore:', error);
    }
  };

  const role = user?.role || 'TEACHER';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        login,
        register,
        logout,
        switchRole,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
