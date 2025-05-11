/**
 * ViewMembersPopup.js
 * Component for viewing the list of group members
 * 
 * Created by: Ilias Kladakis
 * Date: May 2025
 */

import React from 'react';
import { X, CheckCircle, LogOut } from 'lucide-react';
import './ViewMembersPopup.css';

const ViewMembersPopup = ({ onClose, members, currentUserId, groupId, onLeaveGroup }) => {
    // Calculate if all members are settled
    const allSettled = members.every(member => member.settled);

    // Find current user's data
    const currentUser = members.find(member => member.userId === currentUserId);
    const isUserSettled = currentUser?.settled || false;

    // Determine if user can leave group
    const canLeaveGroup = isUserSettled || allSettled;

    // Handle leave group
    const handleLeaveGroup = async () => {
        if (!canLeaveGroup) return;

        try {
            // API call to leave group
            const response = await fetch(`/api/groups/${groupId}/leave`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: currentUserId }),
            });

            if (response.ok) {
                // Call the callback to handle what happens after leaving
                onLeaveGroup();
                // Close the popup
                onClose();
            } else {
                console.error('Failed to leave group');
            }
        } catch (error) {
            console.error('Error leaving group:', error);
        }
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content view-members-popup">
                <div className="popup-header">
                    <h2>Group Members</h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="members-list">
                    {members.length > 0 ? (
                        members.map((member) => (
                            <div key={member.userId} className="member-item">
                                <div className="member-info">
                                    {member.avatar ? (
                                        <img src={member.avatar} alt={member.name} className="member-avatar" />
                                    ) : (
                                        <div className="member-avatar-placeholder">
                                            {member.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}

                                    <div className="member-details">
                                        <div className="member-name">{member.name}</div>
                                        <div className="member-status">
                                            {member.isCreator && <span className="creator-badge">Creator</span>}
                                        </div>
                                    </div>
                                </div>

                                {member.settled && (
                                    <div className="settlement-status">
                                        <CheckCircle size={18} className="settled-icon" />
                                        <span>Settled</span>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="no-members">
                            <p>No members in this group</p>
                        </div>
                    )}
                </div>

                <div className="popup-actions">
                    <button className="cancel-button" onClick={onClose}>
                        Close
                    </button>

                    <button
                        className={`leave-group-button ${canLeaveGroup ? '' : 'disabled'}`}
                        onClick={handleLeaveGroup}
                        disabled={!canLeaveGroup}
                        title={canLeaveGroup ? "Leave this group" : "You must settle your balance before leaving"}
                    >
                        <LogOut size={16} />
                        Leave Group
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewMembersPopup;