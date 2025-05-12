// app/pages/landing/landing.js

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import MySimpleCard from "./MySimpleCard"; // adjust path if needed

export default function HomePage() {
  const [groups, setGroups] = useState([]);
  const currentUserId = "John"; // replace with real auth later

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const q = query(
          collection(db, "groups"),
          where("memberIds", "array-contains", currentUserId)
        );

        const snapshot = await getDocs(q);
        const groupList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setGroups(groupList);
      } catch (err) {
        console.error("Failed to load groups from Firestore:", err);
      }
    };

    fetchGroups();
  }, []);

  return (
    <div style={{ padding: "24px" }}>
      <h1>Hi {currentUserId}</h1>
      <div>
        {groups.length === 0 ? (
          <p>No groups found.</p>
        ) : (
          groups.map(group => (
            <MySimpleCard key={group.id} group={group} />
          ))
        )}
      </div>
    </div>
  );
}
