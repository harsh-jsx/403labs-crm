import { useEffect, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";

export function useCollectionList(collectionName, { orderByField = "createdAt", order = "desc", max = 50 } = {}) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const q = query(
      collection(db, collectionName),
      orderBy(orderByField, order),
      limit(max),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setIsLoading(false);
      },
      (e) => {
        setError(e);
        setIsLoading(false);
      },
    );

    return () => unsub();
  }, [collectionName, orderByField, order, max]);

  return { items, isLoading, error };
}

