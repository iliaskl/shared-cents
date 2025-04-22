
import React from 'react';
import Footer from '../../header';
import './groups.css';
function groups() {
    return (
        <div>
            <Footer />
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
        </div>
    );
};

export default groups;