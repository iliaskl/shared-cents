"use client";
import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";
import Footer from "@/components/footer";
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
                        <p>Member: Kenny, John</p>
                        <button>View Group</button>
                        <button>Delete Group</button>
                    </div>
                </div>

            </div>
            <div className="bottom-section">

                <div className="recent-activity">
                    <h2>The lastest 5 expenese</h2>
                    <div className="activity-box">
                        <p>Home Expense           <span>price</span></p><hr/>
                        <p>Dinner                   <span>19.45</span></p><hr/>
                        <p>Rent                     <span>500</span></p><hr/>
                        <p>grocery                   <span>78</span></p><hr/>
                        <p>Tuition                     <span>3100</span></p><hr/>
                    </div>
                </div>

                <div className="spending-insights">
                    <h2>Cumulative Group Balance</h2>
                    <div className="activity-box">
                        <p>bar graph</p>
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
  );
}