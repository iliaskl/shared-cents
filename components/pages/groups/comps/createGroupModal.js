/*
* createGroupModal.js
* Modal component for creating new groups
* Created by: Ilias Kladakis
* Date: April 2025
*
* This component provides a modal interface for creating new expense groups:
* - Group name and currency selection
* - Friend search and selection functionality from Firebase
* - Member management with add/remove capabilities
* - Form validation and submission handling
*/

"use client";

import { useState, useEffect } from 'react';
import styles from './createGroupModal.module.css';

/* CreateGroupModal Component */
const CreateGroupModal = ({ onClose, onCreate, currentUser }) => {
    // Form state management
    const [groupName, setGroupName] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);

    // Enhanced currency data with locales and full information
    const currencies = [
        { code: 'USD', name: 'United States Dollar', symbol: '$', locale: 'en-US' },
        { code: 'EUR', name: 'Euro', symbol: '€', locale: 'de-DE' },
        { code: 'GBP', name: 'British Pound Sterling', symbol: '£', locale: 'en-GB' },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥', locale: 'ja-JP' },
        { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', locale: 'en-CA' },
        { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', locale: 'en-AU' },
        { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', locale: 'de-CH' },
        { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', locale: 'zh-CN' },
        { code: 'INR', name: 'Indian Rupee', symbol: '₹', locale: 'en-IN' },
        { code: 'MXN', name: 'Mexican Peso', symbol: '$', locale: 'es-MX' },
        { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', locale: 'pt-BR' },
        { code: 'KRW', name: 'South Korean Won', symbol: '₩', locale: 'ko-KR' }
    ];

    // Fetch all users from the database
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoadingUsers(true);

                // Check if we can fetch from the users API
                try {
                    const response = await fetch('http://localhost:5000/api/users');
                    if (response.ok) {
                        const users = await response.json();
                        const filteredUsers = users.filter(user => user.id !== currentUser.id);
                        setAllUsers(filteredUsers);
                        return;
                    }
                } catch (apiError) {
                    console.log('API not available, using mock users');
                }

                // Fallback to mock users if API is not available
                const mockUsers = [
                    { id: 'John', name: 'John', email: 'john@example.com' },
                    { id: 'Paul', name: 'Paul', email: 'paul@example.com' },
                    { id: 'user-3', name: 'Sarah', email: 'sarah@example.com' },
                    { id: 'user-4', name: 'Mike', email: 'mike@example.com' }
                ];

                // Filter out the current user
                const filteredUsers = mockUsers.filter(user => user.id !== currentUser.id);
                setAllUsers(filteredUsers);

            } catch (error) {
                console.error('Error fetching users:', error);
                setAllUsers([]);
            } finally {
                setLoadingUsers(false);
            }
        };

        if (currentUser) {
            fetchUsers();
        }
    }, [currentUser]);

    /**
     * Filter users based on search term and already selected friends
     * Updates search results whenever search term or selected friends change
     */
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setSearchResults([]);
            return;
        }

        const term = searchTerm.toLowerCase();
        const results = allUsers.filter(
            user => user.name.toLowerCase().includes(term) &&
                !selectedFriends.some(selected => selected.id === user.id)
        );

        // Sort alphabetically
        results.sort((a, b) => a.name.localeCompare(b.name));

        setSearchResults(results);
    }, [searchTerm, selectedFriends, allUsers]);

    /**
     * Add a friend to the selected friends list
     * Limited to maximum of 4 friends (5 total group members including creator) 
     */
    const handleSelectFriend = (friend) => {
        // Max 5 users including yourself (so 4 friends max)
        if (selectedFriends.length < 4) {
            setSelectedFriends([...selectedFriends, friend]);
            setSearchTerm('');
            setSearchResults([]);
        }
    };

    /* Remove a friend from the selected friends list */
    const handleRemoveFriend = (friendId) => {
        setSelectedFriends(selectedFriends.filter(friend => friend.id !== friendId));
    };

    /* Handle form submission and validates input and creates group data object */
    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic validation
        if (!groupName.trim()) {
            alert('Please enter a group name');
            return;
        }

        // Find the complete currency object
        const selectedCurrency = currencies.find(c => c.code === currency);

        // Create group data object with locale information
        const groupData = {
            name: groupName,
            currency: currency,
            currencyLocale: selectedCurrency.locale,
            currencySymbol: selectedCurrency.symbol,
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
                            placeholder={
                                loadingUsers ? "Loading users..." :
                                    selectedFriends.length >= 4 ? "Maximum friends reached" :
                                        "Search users..."
                            }
                            disabled={selectedFriends.length >= 4 || loadingUsers}
                        />

                        {searchResults.length > 0 && (
                            <div className={styles.searchResults}>
                                {searchResults.map(user => (
                                    <div
                                        key={user.id}
                                        className={styles.searchResultItem}
                                        onClick={() => handleSelectFriend(user)}
                                    >
                                        <div className={styles.profileImage}>
                                            {user.profileImage ? (
                                                <img src={user.profileImage} alt={user.name} />
                                            ) : (
                                                <div className={styles.imagePlaceholder}></div>
                                            )}
                                        </div>
                                        <span>{user.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {searchTerm && searchResults.length === 0 && !loadingUsers && (
                            <div className={styles.noResults}>
                                No users found matching "{searchTerm}"
                            </div>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label>Group Members</label>
                        <div className={styles.membersList}>
                            <div className={styles.memberItem}>
                                <div className={styles.profileImage}>
                                    {currentUser.profileImage ? (
                                        <img src={currentUser.profileImage} alt={currentUser.name} />
                                    ) : (
                                        <div className={styles.imagePlaceholder}></div>
                                    )}
                                </div>
                                <span>{currentUser.name}</span>
                                <span className={styles.creatorBadge}>(Creator)</span>
                            </div>

                            {selectedFriends.map(friend => (
                                <div key={friend.id} className={styles.memberItem}>
                                    <div className={styles.profileImage}>
                                        {friend.profileImage ? (
                                            <img src={friend.profileImage} alt={friend.name} />
                                        ) : (
                                            <div className={styles.imagePlaceholder}></div>
                                        )}
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