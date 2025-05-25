"use client";
import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";
import Footer from "@/components/footer";
import Header from "@/components/header";
import styles from './page.module.css';
import CreateGroupModal from "@/components/pages/groups/comps/createGroupModal";
import GroupCard from "@/components/pages/groups/comps/groupCard";
import {
  getFirestore,
  collection,
  collectionGroup,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

export default function HomePage() {
  const [username, setUsername] = useState("");
  const [groups, setGroups] = useState([]);
  const [latestExpenses, setLatestExpenses] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;

      const uid = user.uid;
      setUsername(user.email.split("@")[0]); // for display

      // Set current user object for the modal
      setCurrentUser({
        id: uid,
        name: user.displayName || user.email.split("@")[0],
        email: user.email,
        profileImage: user.photoURL
      });

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

        // Sort groups by activity (we'll get activity data later)
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

        // Track the latest activity timestamp for each group
        const groupLastActivity = {};

        expenseSnapshot.forEach((doc) => {
          const data = doc.data();
          const split = data.split || {};
          const userShare = data.amount * (split[uid] || 0);
          const groupName = groupsMap[data.groupId] || "Unknown Group";
          const date = data.date ? new Date(data.date) : new Date();

          // Track the latest activity for this group
          if (!groupLastActivity[data.groupId] || date > groupLastActivity[data.groupId].date) {
            groupLastActivity[data.groupId] = {
              date: date,
              timestamp: date.getTime()
            };
          }

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
            groupId: data.groupId,
            timestamp: date.getTime()
          });
        });

        // Sort groups by most recent activity
        const sortedGroups = [...userGroups].map(group => ({
          ...group,
          lastActivity: groupLastActivity[group.id] ? groupLastActivity[group.id].timestamp : 0
        }))
          .sort((a, b) => b.lastActivity - a.lastActivity)
          .slice(0, 5); // Only show 5 most recently active groups

        setGroups(sortedGroups);
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

  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Helper function to find the balance for a specific group
  const getTotalBalanceForGroup = (groupId) => {
    // Filter expenses for this group and calculate balance
    const groupExpenses = latestExpenses.filter(exp => exp.groupId === groupId);

    if (groupExpenses.length === 0) {
      return 0; // No expenses for this group yet
    }

    // Calculate balance for this group only
    let groupBalance = 0;
    groupExpenses.forEach(exp => {
      const uid = currentUser?.id;
      const split = exp.split || {};
      const userShare = exp.amount * (split[uid] || 0);

      if (exp.paidBy === uid) {
        groupBalance += exp.amount - userShare;
      } else {
        groupBalance -= userShare;
      }
    });

    return groupBalance;
  };

  // Handle balance update from GroupCard component
  const handleBalanceUpdate = (groupId, newBalance) => {
    console.log(`Balance updated for group ${groupId}: ${newBalance}`);
    // You could update your local state here if needed
  };

  // Handle delete/archive group
  const handleDeleteGroup = (groupId) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      // You could implement the actual delete logic here
      setGroups(prevGroups => prevGroups.filter(group => group.id !== groupId));
    }
  };

  // Handler to open the create group modal
  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
  };

  // Handler to close the create group modal
  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  // Handler to create a new group
  const handleCreateGroup = async (groupData) => {
    try {
      const db = getFirestore(app);
      const groupsRef = collection(db, "groups");

      // Add creator's userId to each member object if not already there
      const processedMembers = groupData.members.map(member => {
        if (member.id === currentUser.id) {
          return {
            ...member,
            userId: currentUser.id,
            isCreator: true
          };
        }
        return {
          ...member,
          userId: member.id
        };
      });

      // Create the new group document
      const newGroupData = {
        name: groupData.name,
        currency: groupData.currency,
        currencyLocale: groupData.currencyLocale,
        currencySymbol: groupData.currencySymbol,
        members: processedMembers,
        createdAt: serverTimestamp(),
        createdBy: currentUser.id
      };

      const docRef = await addDoc(groupsRef, newGroupData);

      // Update the local state with the new group
      const newGroup = {
        id: docRef.id,
        ...newGroupData,
        createdAt: { seconds: Date.now() / 1000 }, // For display until server timestamp returns
        lastActivity: Date.now() // Add as most recent group
      };

      setGroups(prevGroups => [newGroup, ...prevGroups.slice(0, 4)]);
      handleCloseCreateModal();

    } catch (error) {
      console.error("Error creating group:", error);
      alert("Failed to create group. Please try again.");
    }
  };

  return (
    <div>
      <Header name={username} />
      <div className={styles.groupContainer}>
        <div className={styles.sectionHeader}>
          <h1 className={styles.sectionTitle}>My Groups</h1>
          <button
            className={styles.createButton}
            onClick={handleOpenCreateModal}
          >
            + Create New Group
          </button>
        </div>
        <div className={styles.groupGrid}>
          {groups.length === 0 ? (
            <div className={`${styles.emptyCard}`}>
              <h2>You are not in any groups yet.</h2>
            </div>
          ) : (
            groups.map((group) => {
              // Determine balance status class
              const balance = getTotalBalanceForGroup(group.id);
              let statusClass = '';

              if (balance < 0) {
                statusClass = styles.red; // Owing (red)
              } else if (balance > 0) {
                statusClass = styles.blue; // Owed (blue)
              } else {
                statusClass = styles.green; // Settled (green)
              }

              return (
                <div className={`${styles.cardWrapper} ${statusClass}`} key={group.id}>
                  <GroupCard
                    group={{
                      id: group.id,
                      name: group.name,
                      balance: balance,
                      creationDate: group.createdAt ? new Date(group.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
                      archived: false,
                      currency: group.currency || 'USD',
                      currencyLocale: group.currencyLocale || 'en-US',
                      currencySymbol: group.currencySymbol || '$'
                    }}
                    onToggleArchive={() => handleDeleteGroup(group.id)}
                    onBalanceUpdate={(id, newBalance) => handleBalanceUpdate(id, newBalance)}
                  />
                </div>
              );
            })
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

      {/* Render the CreateGroupModal conditionally */}
      {showCreateModal && currentUser && (
        <CreateGroupModal
          onClose={handleCloseCreateModal}
          onCreate={handleCreateGroup}
          currentUser={currentUser}
        />
      )}

      <Footer />
    </div>
  );
}