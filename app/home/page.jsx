"use client";
import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";
import Footer from "@/components/footer";
import Header from "@/components/header";
import {
  getFirestore,
  collection,
  collectionGroup,
  getDocs,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";

export default function HomePage() {
  const [username, setUsername] = useState(""); // Display name/email
  const [groups, setGroups] = useState([]);
  const [latestExpenses, setLatestExpenses] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;

      const uid = user.uid;
      setUsername(user.email.split("@")[0]); // for display

      try {
        const db = getFirestore(app);
        const groupsRef = collection(db, "groups");
        const groupSnapshot = await getDocs(groupsRef);
        const userGroups = [];
        const userGroupIds = [];

        groupSnapshot.forEach((doc) => {
          const data = doc.data();
          const isMember =
            Array.isArray(data.members) &&
            data.members.some((m) =>
              typeof m === "string" ? m === uid : m.userId === uid
            );
          if (isMember) {
            userGroups.push({ id: doc.id, ...data });
            userGroupIds.push(doc.id.trim());
          }
        });

        setGroups(userGroups);

        if (userGroupIds.length === 0) {
          console.log(" No groups found for UID:", uid);
          setLoading(false);
          return;
        }

        const expensesRef = collectionGroup(db, "expenses");
        const q = query(
          expensesRef,
          where("splitUsers", "array-contains", uid),
          orderBy("date", "desc"),
          limit(5)
        );

        const expenseSnapshot = await getDocs(q);
        const expenses = [];
        let balance = 0;

        console.log(" Found", expenseSnapshot.size, "expenses for", uid);

        expenseSnapshot.forEach((doc) => {
          const data = doc.data();
          const split = data.split || {};
          const userShare = data.amount * (split[uid] || 0);

          console.log("➡️ Expense:", data.description);
          console.log("   Amount:", data.amount);
          console.log("   Your share:", userShare);
          console.log("   Paid by:", data.paidBy);
          console.log("   Full split map:", split);

          if (data.paidBy === uid) {
            balance += data.amount - userShare;
          } else {
            balance -= userShare;
          }

          expenses.push({
            id: doc.id,
            name: data.description || "Unnamed",
            userShare,
          });
        });

        setLatestExpenses(expenses);
        setTotalBalance(balance);
      } catch (err) {
        console.error(" Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    });
    

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <Header name={username} />
      <div className="group-container">
        <div className="section-1">
          <div>My Groups</div>
          <button>Create New Group</button>
        </div>
        <div className="section-2">
          {groups.length === 0 ? (
            <div className="card-container">
              <h2>You are not in any groups yet.</h2>
              <button onClick={() => {}}>+ Create New Group</button>
            </div>
          ) : (
            groups.map((group) => (
              <div className="card-container" key={group.id}>
                <h2>{group.name}</h2>
                <h2>
                    {group.createdAt
                        ? new Date(group.createdAt.seconds * 1000).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        })
                    : "No date provided"}
                </h2>
                <p>
                  Members:{" "}
                  {group.members
                    .map((m) => (typeof m === "string" ? m : m.name))
                    .join(", ")}
                </p>
                <button>View Group</button>
                <button>Delete Group</button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bottom-section">
        <div className="recent-activity">
          <h2>The latest 5 expenses</h2>
          <div className="activity-box">
            {latestExpenses.length === 0 ? (
              <p>No expenses found.</p>
            ) : (
              latestExpenses.map((exp) => (
                <p key={exp.id}>
                  {exp.name} <span>${exp.userShare.toFixed(2)}</span>
                </p>
              ))
            )}
          </div>
        </div>

        <div className="spending-insights">
          <h2>Cumulative Group Balance</h2>
          <div className="activity-box">
            <p>
              {totalBalance === 0
                ? "You are settled up."
                : totalBalance > 0
                ? `You are owed $${totalBalance.toFixed(2)}`
                : `You owe $${Math.abs(totalBalance).toFixed(2)}`}
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
