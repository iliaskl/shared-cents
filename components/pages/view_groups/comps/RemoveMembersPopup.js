/**
 * RemoveMembersPopup.js
 * Component for removing members from a group (creator only)
 * 
 * Created by: Ilias Kladakis
 * Date: May 2025
 */

import React, { useState } from 'react';
import { X, AlertTriangle, UserMinus, Check } from 'lucide-react';
import './RemoveMembersPopup.css';

const RemoveMembersPopup = ({ onClose, groupId, members, onMemberRemoved }) => {
    // Changed from single selection to multiple selections array
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [confirmingRemoval, setConfirmingRemoval] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Toggle member selection (add/remove from array)
    const toggleMemberSelection = (member) => {
        setSelectedMembers(prev => {
            // Check if member is already selected
            const isSelected = prev.some(m => m.userId === member.userId);

            if (isSelected) {
                // Remove from selection
                return prev.filter(m => m.userId !== member.userId);
            } else {
                // Add to selection
                return [...prev, member];
            }
        });

        // Reset confirmation state when selection changes
        setConfirmingRemoval(false);
        setError(null);
    };

    // Check if a member is selected
    const isMemberSelected = (userId) => {
        return selectedMembers.some(m => m.userId === userId);
    };

    // Show confirmation dialog
    const handleConfirmClick = () => {
        if (selectedMembers.length === 0) return;
        setConfirmingRemoval(true);
    };

    // Handle member removal
    const handleRemoveMembers = async () => {
        if (selectedMembers.length === 0) return;

        setLoading(true);

        try {
            // For each selected member, make an API call to remove
            const promises = selectedMembers.map(member =>
                fetch(`/api/groups/${groupId}/members/${member.userId}`, {
                    method: 'DELETE',
                })
            );

            // Wait for all API calls to complete
            const results = await Promise.allSettled(promises);

            // Check if all were successful
            const allSuccessful = results.every(result => result.status === 'fulfilled' && result.value.ok);

            if (allSuccessful) {
                // Show success message
                if (selectedMembers.length === 1) {
                    setSuccessMessage(`${selectedMembers[0].name} has been removed from the group`);
                } else {
                    setSuccessMessage(`${selectedMembers.length} members have been removed from the group`);
                }

                // Notify parent component about the removals
                selectedMembers.forEach(member => {
                    onMemberRemoved(member.userId);
                });

                // Reset states
                setSelectedMembers([]);
                setConfirmingRemoval(false);
            } else {
                throw new Error(`Failed to remove some members from the group`);
            }
        } catch (err) {
            setError(err.message || 'Error removing members. Please try again.');
            console.error('Error removing members:', err);
        } finally {
            setLoading(false);
        }
    };

    // Cancel removal confirmation
    const handleCancelRemoval = () => {
        setConfirmingRemoval(false);
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content remove-members-popup">
                <div className="popup-header">
                    <h2>Remove Members</h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="instructions">
                    <p>Select members to remove from the group</p>
                </div>

                {members.length === 0 ? (
                    <div className="no-members-message">
                        <p>No members available to remove</p>
                    </div>
                ) : (
                    <>
                        <div className="members-list">
                            {members.map((member) => (
                                <div
                                    key={member.userId}
                                    className={`member-item ${isMemberSelected(member.userId) ? 'selected' : ''}`}
                                >
                                    <div className="member-info">
                                        {member.avatar ? (
                                            <img src={member.avatar} alt={member.name} className="member-avatar" />
                                        ) : (
                                            <div className="member-avatar-placeholder">
                                                {member.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <span className="member-name">{member.name}</span>
                                    </div>

                                    <button
                                        className="member-action-button"
                                        onClick={() => toggleMemberSelection(member)}
                                    >
                                        {isMemberSelected(member.userId) ? (
                                            <Check size={20} className="selected-icon" />
                                        ) : (
                                            <UserMinus size={20} className="remove-icon" />
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>

                        {confirmingRemoval && selectedMembers.length > 0 && (
                            <div className="confirmation-dialog">
                                <div className="confirmation-icon">
                                    <AlertTriangle size={24} />
                                </div>
                                <div className="confirmation-message">
                                    {selectedMembers.length === 1 ? (
                                        <p>Are you sure you want to remove <strong>{selectedMembers[0].name}</strong> from this group?</p>
                                    ) : (
                                        <p>Are you sure you want to remove <strong>{selectedMembers.length} members</strong> from this group?</p>
                                    )}
                                    <p className="confirmation-warning">This action cannot be undone.</p>
                                </div>
                                <div className="confirmation-actions">
                                    <button
                                        className="cancel-removal-button"
                                        onClick={handleCancelRemoval}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="confirm-removal-button"
                                        onClick={handleRemoveMembers}
                                        disabled={loading}
                                    >
                                        {loading ? 'Removing...' : 'Remove'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {error && (
                    <div className="error-message">{error}</div>
                )}

                {successMessage && (
                    <div className="success-message">{successMessage}</div>
                )}

                <div className="popup-actions">
                    <button type="button" className="cancel-button" onClick={onClose}>
                        Cancel
                    </button>

                    {!confirmingRemoval && members.length > 0 && (
                        <button
                            type="button"
                            className="remove-button"
                            onClick={handleConfirmClick}
                            disabled={selectedMembers.length === 0 || loading}
                        >
                            {selectedMembers.length === 0 ? 'Remove Members' :
                                `Remove ${selectedMembers.length} ${selectedMembers.length === 1 ? 'Member' : 'Members'}`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RemoveMembersPopup;