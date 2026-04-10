import { useEffect, useMemo, useState } from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../firebase";

function asDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value?.toDate === "function") return value.toDate();
  return null;
}

export function useDashboardData() {
  const [activities, setActivities] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const unsubs = [];

    try {
      const activitiesQ = query(
        collection(db, "activities"),
        orderBy("dueAt", "desc"),
        limit(8),
      );
      const meetingsQ = query(
        collection(db, "meetings"),
        orderBy("startAt", "asc"),
        limit(24),
      );
      const leadsQ = query(
        collection(db, "leads"),
        orderBy("createdAt", "desc"),
        limit(50),
      );

      unsubs.push(
        onSnapshot(
          activitiesQ,
          (snap) => {
            setActivities(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
          },
          (e) => setError(e),
        ),
      );

      unsubs.push(
        onSnapshot(
          meetingsQ,
          (snap) => {
            setMeetings(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
          },
          (e) => setError(e),
        ),
      );

      unsubs.push(
        onSnapshot(
          leadsQ,
          (snap) => {
            setLeads(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
          },
          (e) => setError(e),
        ),
      );
    } catch (e) {
      setError(e);
    } finally {
      setIsLoading(false);
    }

    return () => unsubs.forEach((fn) => fn?.());
  }, []);

  const leadSourceCounts = useMemo(() => {
    const counts = new Map();
    for (const l of leads) {
      const k = String(l.source ?? "Unknown");
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [leads]);

  const upcomingMeetings = useMemo(() => {
    const now = new Date();
    return meetings
      .map((m) => ({
        ...m,
        startAtDate: asDate(m.startAt),
        endAtDate: asDate(m.endAt),
      }))
      .filter((m) => (m.startAtDate ? m.startAtDate >= now : false))
      .slice(0, 10);
  }, [meetings]);

  return {
    activities,
    meetings,
    upcomingMeetings,
    leads,
    leadSourceCounts,
    isLoading,
    error,
  };
}
