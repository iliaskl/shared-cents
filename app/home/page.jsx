"use client";
import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";
import Footer from "@/components/footer";
import "@/components/pages/groups/groups.css";
import Header from "@/components/header";

export default function HomePage() {
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
            <Header name={username}/>
            <div className="group-container">
                <div className="section-1">
                    <div>My Groups</div>
                    <button> Create New Group</button>
                </div>
                <div className="section-2">
                    <div className="card-container">
                        <h2>Home Expenses</h2>
                        <h2>Mar 2025 - Present</h2>
                        <p>icon You</p>
                        <button>View Group</button>
                        <button>Delete Group</button>
                    </div>
                </div>

            </div>
            <div className="bottom-section">

                <div className="recent-activity">
                    <h2>Recent Activity</h2>
                    <div className="activity-box">
                        <p><span>Home Exprenses</span>           <span>price</span></p><hr/>
                        <p>Dinner                   price</p><hr/>
                        <p>Rent                     price</p><hr/>
                    </div>
                </div>

                <div className="spending-insights">
                    <h2>Spending Insights</h2>
                    <div className="activity-box">
                        <p>bar graph</p>
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
  );
}