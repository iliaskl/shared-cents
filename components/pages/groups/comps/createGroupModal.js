/*
* createGroupModal.js
* Modal component for creating new groups
* Created by: Ilias Kladakis
* Date: April 2025
*
* This component provides a modal interface for creating new expense groups:
* - Group name and currency selection
* - Friend search and selection functionality
* - Member management with add/remove capabilities
* - Form validation and submission handling
*/

"use client";

import { useState, useEffect } from 'react';
import styles from './createGroupModal.module.css';

/**
 * CreateGroupModal Component
 * 
 * @param {Function} onClose - Callback function to close the modal without creating a group
 * @param {Function} onCreate - Callback function to handle group creation with form data
 * @returns {JSX.Element} - Rendered modal component
 */
const CreateGroupModal = ({ onClose, onCreate }) => {
    // Form state management
    const [groupName, setGroupName] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [searchResults, setSearchResults] = useState([]);

    // Currency data with symbols and full names
    const currencies = [
        { code: 'USD', name: 'United States Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'GBP', name: 'British Pound Sterling', symbol: '£' },
        { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
        { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
        { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
        { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    ];

    // Mock user data for demonstration
    const currentUser = {
        id: 'user-1',
        name: 'Bill Moss',
        profileImage: '/images/profile-placeholder.jpg'
    };

    // Mock friends list for demonstration
    const friends = [
        { id: 'friend-1', name: 'John Anderson', profileImage: '/images/john-a.jpg' },
        { id: 'friend-2', name: 'John Brown', profileImage: '/images/john-b.jpg' },
        { id: 'friend-3', name: 'John Carter', profileImage: '/images/john-c.jpg' },
        { id: 'friend-4', name: 'Sarah Johnson', profileImage: '/images/sarah.jpg' },
        { id: 'friend-5', name: 'Michael Smith', profileImage: '/images/michael.jpg' },
        { id: 'friend-6', name: 'Jessica Williams', profileImage: '/images/jessica.jpg' },
        { id: 'friend-7', name: 'David Lee', profileImage: '/images/david.jpg' },
        { id: 'friend-8', name: 'Emma Wilson', profileImage: '/images/emma.jpg' },
    ];

    /**
     * Filter friends based on search term and already selected friends
     * Updates search results whenever search term or selected friends change
     */
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setSearchResults([]);
            return;
        }

        const term = searchTerm.toLowerCase();
        const results = friends.filter(
            friend => friend.name.toLowerCase().includes(term) &&
                !selectedFriends.some(selected => selected.id === friend.id)
        );

        // Sort alphabetically
        results.sort((a, b) => a.name.localeCompare(b.name));

        setSearchResults(results);
    }, [searchTerm, selectedFriends]);

    /**
     * Add a friend to the selected friends list
     * Limited to maximum of 4 friends (5 total group members including creator)
     * 
     * @param {Object} friend - Friend object to add to selected list
     */
    const handleSelectFriend = (friend) => {
        // Max 5 users including yourself (so 4 friends max)
        if (selectedFriends.length < 4) {
            setSelectedFriends([...selectedFriends, friend]);
            setSearchTerm('');
            setSearchResults([]);
        }
    };

    /**
     * Remove a friend from the selected friends list
     * 
     * @param {string} friendId - ID of friend to remove
     */
    const handleRemoveFriend = (friendId) => {
        setSelectedFriends(selectedFriends.filter(friend => friend.id !== friendId));
    };

    /**
     * Handle form submission
     * Validates input and creates group data object
     * 
     * @param {Event} e - Form submission event
     */
    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic validation
        if (!groupName.trim()) {
            alert('Please enter a group name');
            return;
        }

        // Create group data object
        const groupData = {
            name: groupName,
            currency,
            members: [currentUser, ...selectedFriends]
        };

        // Call onCreate function passed from parent
        onCreate(groupData);
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Create New Group</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="groupName">Group Name</label>
                        <input
                            type="text"
                            id="groupName"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            maxLength={100}
                            placeholder="Enter group name"
                            required
                        />
                        <div className={styles.charCount}>
                            {groupName.length}/100 characters
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="currency">Select Currency</label>
                        <select
                            id="currency"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                        >
                            {currencies.map(curr => (
                                <option key={curr.code} value={curr.code}>
                                    {curr.code} - {curr.name} ({curr.symbol})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <div className={styles.labelContainer}>
                            <label htmlFor="friendSearch">Invite Friends</label>
                            <span className={styles.friendCounter}>
                                {selectedFriends.length}/4 friends added
                            </span>
                        </div>
                        <input
                            type="text"
                            id="friendSearch"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={selectedFriends.length >= 4 ? "Maximum friends reached" : "Search friends..."}
                            disabled={selectedFriends.length >= 4}
                        />

                        {searchResults.length > 0 && (
                            <div className={styles.searchResults}>
                                {searchResults.map(friend => (
                                    <div
                                        key={friend.id}
                                        className={styles.searchResultItem}
                                        onClick={() => handleSelectFriend(friend)}
                                    >
                                        <div className={styles.profileImage}>
                                            <div className={styles.imagePlaceholder}></div>
                                        </div>
                                        <span>{friend.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {searchTerm && searchResults.length === 0 && (
                            <div className={styles.noResults}>
                                No user with name in your friends list
                            </div>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label>Group Members</label>
                        <div className={styles.membersList}>
                            <div className={styles.memberItem}>
                                <div className={styles.profileImage}>
                                    <div className={styles.imagePlaceholder}></div>
                                </div>
                                <span>{currentUser.name}</span>
                                <span className={styles.creatorBadge}>(Creator)</span>
                            </div>

                            {selectedFriends.map(friend => (
                                <div key={friend.id} className={styles.memberItem}>
                                    <div className={styles.profileImage}>
                                        <div className={styles.imagePlaceholder}></div>
                                    </div>
                                    <span>{friend.name}</span>
                                    <button
                                        type="button"
                                        className={styles.removeFriendButton}
                                        onClick={() => handleRemoveFriend(friend.id)}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}

                            {selectedFriends.length === 0 && (
                                <div className={styles.emptyState}>
                                    No friends added yet
                                </div>
                            )}
                        </div>
                    </div>

                    <button type="submit" className={styles.createButton}>
                        Invite and Create
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateGroupModal;