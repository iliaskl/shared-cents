/**
 * InviteMembersPopup.js
 * Component for inviting friends to a group
 * 
 * Created by: Ilias Kladakis
 * Date: May 2025
 */

import React, { useState, useEffect } from 'react';
import { X, Search, CheckCircle, UserPlus } from 'lucide-react';
import './InviteMembersPopup.css';

const InviteMembersPopup = ({ onClose, groupId, currentMembers }) => {
    const [friends, setFriends] = useState([]);
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const MAX_GROUP_MEMBERS = 5;

    // Calculate how many more members can be added
    const availableSlots = MAX_GROUP_MEMBERS - currentMembers.length;

    // Fetch user's friends when component mounts
    useEffect(() => {
        const fetchFriends = async () => {
            try {
                setLoading(true);

                // Get current user ID from local storage
                const userId = localStorage.getItem('userId');

                // API call to get user's friends
                const response = await fetch(`/api/users/${userId}/friends`);

                if (!response.ok) {
                    throw new Error('Failed to fetch friends list');
                }

                const friendsData = await response.json();

                // Filter out friends who are already in the group
                const currentMemberIds = currentMembers.map(member => member.userId);
                const filteredFriends = friendsData.filter(
                    friend => !currentMemberIds.includes(friend.userId)
                );

                setFriends(filteredFriends);
                setError(null);
            } catch (err) {
                setError('Error loading friends. Please try again.');
                console.error('Error fetching friends:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchFriends();
    }, [currentMembers]);

    // Filter friends based on search query
    const filteredFriends = searchQuery.trim() === ''
        ? friends
        : friends.filter(friend =>
            friend.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

    // Toggle friend selection
    const toggleFriendSelection = (friendId) => {
        if (selectedFriends.includes(friendId)) {
            // If already selected, remove from selection
            setSelectedFriends(selectedFriends.filter(id => id !== friendId));
        } else {
            // If not selected and we haven't reached the limit, add to selection
            if (selectedFriends.length < availableSlots) {
                setSelectedFriends([...selectedFriends, friendId]);
            }
        }
    };

    // Handle invite submission
    const handleInvite = async () => {
        if (selectedFriends.length === 0) return;

        try {
            // API call to invite friends to the group
            const response = await fetch(`/api/groups/${groupId}/invite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userIds: selectedFriends }),
            });

            if (!response.ok) {
                throw new Error('Failed to send invites');
            }

            // Show success message
            setSuccessMessage('Invitations sent successfully!');

            // Clear selection
            setSelectedFriends([]);

            // After 2 seconds, close the popup
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err) {
            setError('Error sending invites. Please try again.');
            console.error('Error inviting friends:', err);
        }
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content invite-members-popup">
                <div className="popup-header">
                    <h2>Invite Friends</h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="capacity-info">
                    <p>
                        {availableSlots > 0
                            ? `You can invite up to ${availableSlots} more ${availableSlots === 1 ? 'person' : 'people'}`
                            : 'This group has reached its maximum capacity of 5 members'}
                    </p>
                </div>

                {availableSlots > 0 && (
                    <>
                        <div className="search-container">
                            <Search size={18} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search friends..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        <div className="friends-list">
                            {loading ? (
                                <div className="loading-message">Loading friends...</div>
                            ) : error ? (
                                <div className="error-message">{error}</div>
                            ) : filteredFriends.length === 0 ? (
                                <div className="no-friends-message">
                                    {searchQuery.trim() !== ''
                                        ? 'No friends match your search'
                                        : 'No friends available to invite'}
                                </div>
                            ) : (
                                filteredFriends.map((friend) => (
                                    <div
                                        key={friend.userId}
                                        className={`friend-item ${selectedFriends.includes(friend.userId) ? 'selected' : ''}`}
                                        onClick={() => toggleFriendSelection(friend.userId)}
                                    >
                                        <div className="friend-info">
                                            {friend.avatar ? (
                                                <img src={friend.avatar} alt={friend.name} className="friend-avatar" />
                                            ) : (
                                                <div className="friend-avatar-placeholder">
                                                    {friend.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <span className="friend-name">{friend.name}</span>
                                        </div>

                                        <div className="friend-selection">
                                            {selectedFriends.includes(friend.userId) ? (
                                                <CheckCircle size={20} className="selected-icon" />
                                            ) : (
                                                <UserPlus size={20} className="add-icon" />
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}

                {successMessage && (
                    <div className="success-message">{successMessage}</div>
                )}

                <div className="popup-actions">
                    <button type="button" className="cancel-button" onClick={onClose}>
                        Cancel
                    </button>

                    {availableSlots > 0 && (
                        <button
                            type="button"
                            className="confirm-button"
                            onClick={handleInvite}
                            disabled={selectedFriends.length === 0 || loading}
                        >
                            {selectedFriends.length === 0
                                ? 'Invite Friends'
                                : `Invite ${selectedFriends.length} ${selectedFriends.length === 1 ? 'Friend' : 'Friends'}`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InviteMembersPopup;