"use client";
import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";
import Footer from "@/components/footer";
import Header from "@/components/header";
import styles from './page.module.css';
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
        const groupsMap = {}; // Map to store group names by ID

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
            groupsMap[doc.id] = data.name; // Store group name for reference
          }
        });

        setGroups(userGroups);

        if (userGroupIds.length === 0) {
          console.log("No groups found for UID:", uid);
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

        console.log("Found", expenseSnapshot.size, "expenses for", uid);

        expenseSnapshot.forEach((doc) => {
          const data = doc.data();
          const split = data.split || {};
          const userShare = data.amount * (split[uid] || 0);
          const groupName = groupsMap[data.groupId] || "Unknown Group";
          const date = data.date ? new Date(data.date) : new Date();

          if (data.paidBy === uid) {
            balance += data.amount - userShare;
          } else {
            balance -= userShare;
          }

          expenses.push({
            id: doc.id,
            name: data.description || "Unnamed Expense",
            amount: data.amount,
            userShare,
            groupName,
            date: date.toLocaleDateString("en-US", {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }),
            groupId: data.groupId
          });
        });

        setLatestExpenses(expenses);
        setTotalBalance(balance);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div>
      <Header name={username} />
      <div className={styles.groupContainer}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>My Groups</div>
          <button className={styles.createButton}>Create New Group +</button>
        </div>
        <div className={styles.groupGrid}>
          {groups.length === 0 ? (
            <div className={`${styles.cardContainer} ${styles.emptyCard}`}>
              <h2>You are not in any groups yet.</h2>
              {/* Removed the duplicate Create New Group button */}
            </div>
          ) : (
            groups.map((group) => (
              <div className={styles.cardContainer} key={group.id}>
                <h2 className={styles.groupName}>{group.name}</h2>
                <h2 className={styles.groupDate}>
                  {group.createdAt
                    ? new Date(group.createdAt.seconds * 1000).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                    : "No date provided"}
                </h2>
                <p className={styles.membersList}>
                  Members:{" "}
                  {group.members
                    .map((m) => (typeof m === "string" ? m : m.name))
                    .join(", ")}
                </p>
                <button className={styles.viewButton}>View Group</button>
                <button className={styles.deleteButton}>Delete Group</button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className={styles.bottomSection}>
        <div className={styles.sectionBox}>
          <h2 className={styles.sectionBoxTitle}>Latest Expenses</h2>
          <div className={styles.activityBox}>
            {latestExpenses.length === 0 ? (
              <p className={styles.emptyState}>No expenses found.</p>
            ) : (
              latestExpenses.map((exp) => (
                <div key={exp.id} className={styles.expenseItem}>
                  <div className={styles.expenseDetails}>
                    <div className={styles.expenseName}>{exp.name}</div>
                    <div className={styles.expenseMeta}>
                      <span className={styles.expenseGroup}>{exp.groupName}</span>
                      <span className={styles.expenseDate}>{exp.date}</span>
                    </div>
                  </div>
                  <div className={styles.expenseAmount}>{formatCurrency(exp.amount)}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.sectionBox}>
          <h2 className={styles.sectionBoxTitle}>Cumulative Group Balance</h2>
          <div className={styles.activityBox}>
            <p className={`${styles.balanceStatus} ${totalBalance === 0
              ? styles.settled
              : totalBalance > 0
                ? styles.owed
                : styles.owing
              }`}>
              {totalBalance === 0
                ? "You are settled up."
                : totalBalance > 0
                  ? `You are owed ${formatCurrency(totalBalance)}`
                  : `You owe ${formatCurrency(Math.abs(totalBalance))}`}
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}