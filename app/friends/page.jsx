"use client";
import React, { useState, useEffect } from 'react';
import Header from "@/components/header";
import Footer from "@/components/footer";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";
import FriendsContent from '@/components/pages/friends/FriendsContent';

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
    <>
      <Header />
      <div>
        <Header name={username} />
        <h1>This is the Friends Page</h1>
        return <FriendsContent />;
      </div>
      <Footer />
    </>
  );
}