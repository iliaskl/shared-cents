"use client";
import React, { useState, useEffect } from 'react';
import Header from "@/components/header";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";

export default function FriendsPage() {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUsername(user.email.split("@")[0]);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <Header name={username} />
      <h1>This is the Friends Page</h1>
    </div>
  );
}