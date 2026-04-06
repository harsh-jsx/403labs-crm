import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AdminAuthContext = createContext(null);

const USERS_COLLECTION = "users";

/**
 * Loads `users/{uid}` and returns profile + whether isAdmin is strictly true.
 */
export async function getAdminStateForUid(uid) {
  const snap = await getDoc(doc(db, USERS_COLLECTION, uid));
  if (!snap.exists()) {
    return { profile: null, isAdmin: false };
  }
  const data = snap.data();
  return { profile: data, isAdmin: data?.isAdmin === true };
}

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const { profile: nextProfile, isAdmin: nextIsAdmin } =
        await getAdminStateForUid(firebaseUser.uid);

      if (!nextIsAdmin) {
        await firebaseSignOut(auth);
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      setUser(firebaseUser);
      setProfile(nextProfile);
      setIsAdmin(true);
      setIsLoading(false);
    });
  }, []);

  const signOut = useCallback(() => firebaseSignOut(auth), []);

  const value = useMemo(
    () => ({
      user,
      profile,
      isAdmin,
      isLoading,
      signOut,
    }),
    [user, profile, isAdmin, isLoading, signOut],
  );

  return (
    <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return ctx;
}
