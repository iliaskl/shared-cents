/*
* index.js
* Main component for the Groups page
* Created by: Ilias Kladakis
* Date: April 2025
*
* This component manages the display of all user groups including:
* - Fetching groups from Firebase
* - Filter functionality for viewing different group categories
* - Group card display in a responsive grid layout
* - Modal for creating new groups
* - Archive/unarchive functionality
* - Multi-currency support
* - Navigation to view group page
*/

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GroupCard from './comps/groupCard';
import CreateGroupModal from './comps/createGroupModal';
import styles from './group.module.css';
import Header from '@/components/header';
import Footer from '@/components/footer';

const API_BASE_URL = 'http://localhost:5000/api';

export default function GroupsPage() {
    const [groups, setGroups] = useState([]);
    const [filterOption, setFilterOption] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const router = useRouter();

    // Fetch current user
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                // Get the current user from auth context or session
                // For now, we'll use a test user that matches your Firebase data
                const currentUser = {
                    id: 'John',
                    name: 'John',
                    email: 'john@example.com',
                    profileImage: '/images/john.jpg'
                };

                setCurrentUser(currentUser);
            } catch (err) {
                console.error('Error fetching current user:', err);
                setError('Failed to authenticate user');
            }
        };

        fetchCurrentUser();
    }, []);

    // Fetch groups from backend
    useEffect(() => {
        const fetchGroups = async () => {
            if (!currentUser) return;

            try {
                setLoading(true);
                console.log('Fetching groups for user:', currentUser.id);

                const response = await fetch(`${API_BASE_URL}/groups/user/${currentUser.id}`);
                console.log('Response status:', response.status);

                if (!response.ok) {
                    // If user-specific endpoint doesn't work, try to get the roommates group directly
                    console.log('Trying roommates endpoint...');
                    const roommatesResponse = await fetch(`${API_BASE_URL}/groups/roommates`);

                    if (roommatesResponse.ok) {
                        const roommatesData = await roommatesResponse.json();
                        console.log('Roommates data:', roommatesData);

                        // Find the user's balance from the members array
                        const userMember = roommatesData.members.find(m => m.userId === currentUser.id);

                        setGroups([{
                            id: roommatesData.id,
                            name: roommatesData.name,
                            balance: userMember ? userMember.balance : 0,
                            creationDate: roommatesData.createdAt,
                            lastActivity: new Date().toISOString(),
                            archived: false,
                            currency: 'USD',
                            currencyLocale: 'en-US',
                            currencySymbol: '$'
                        }]);
                    } else {
                        throw new Error('Failed to fetch groups');
                    }
                } else {
                    const data = await response.json();
                    console.log('Groups data:', data);
                    setGroups(data);
                }
            } catch (err) {
                console.error('Error fetching groups:', err);
                setError('Failed to load groups');
            } finally {
                setLoading(false);
            }
        };

        fetchGroups();
    }, [currentUser]);

    // Handle balance updates from GroupCard components
    const handleBalanceUpdate = (groupId, newBalance) => {
        console.log(`Updating balance for group ${groupId} to ${newBalance}`);

        // Update the groups array with the new balance
        setGroups(prevGroups =>
            prevGroups.map(group =>
                group.id === groupId
                    ? { ...group, balance: newBalance }
                    : group
            )
        );
    };

    // Determine color coding based on balance
    const getGroupColor = (balance) => {
        if (balance < 0) return 'red';
        if (balance > 0) return 'blue';
        return 'green';
    };

    // Filter and sort groups based on selected filter option
    const filterGroups = () => {
        let filteredGroups = [...groups];

        switch (filterOption) {
            case 'all':
                return filteredGroups
                    .filter(group => !group.archived)
                    .sort((a, b) => new Date(b.lastActivity || b.createdAt) - new Date(a.lastActivity || a.createdAt));
            case 'owing':
                return filteredGroups
                    .filter(group => group.balance < 0 && !group.archived)
                    .sort((a, b) => new Date(b.lastActivity || b.createdAt) - new Date(a.lastActivity || a.createdAt));
            case 'owed':
                return filteredGroups
                    .filter(group => group.balance > 0 && !group.archived)
                    .sort((a, b) => new Date(b.lastActivity || b.createdAt) - new Date(a.lastActivity || a.createdAt));
            case 'settled':
                return filteredGroups
                    .filter(group => group.balance === 0 && !group.archived)
                    .sort((a, b) => new Date(b.lastActivity || b.createdAt) - new Date(a.lastActivity || a.createdAt));
            case 'archived':
                return filteredGroups
                    .filter(group => group.archived)
                    .sort((a, b) => new Date(b.lastActivity || b.createdAt) - new Date(a.lastActivity || a.createdAt));
            default:
                return filteredGroups
                    .filter(group => !group.archived)
                    .sort((a, b) => new Date(b.lastActivity || b.createdAt) - new Date(a.lastActivity || a.createdAt));
        }
    };

    // Navigate to group detail page
    const handleViewGroup = (groupId) => {
        router.push(`/group_view?id=${groupId}`);  // Changed from view_groups to group_view
    };

    // Process new group creation
    const handleCreateGroup = async (groupData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/groups`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: groupData.name,
                    currency: groupData.currency,
                    currencyLocale: groupData.currencyLocale,
                    currencySymbol: groupData.currencySymbol,
                    members: groupData.members.map(member => ({
                        userId: member.id,
                        name: member.name,
                        email: member.email,
                        profileImage: member.profileImage,
                        isCreator: member.id === currentUser.id,
                        balance: 0
                    })),
                    createdBy: currentUser.id,
                    createdAt: new Date().toISOString(),
                    lastActivity: new Date().toISOString(),
                    archived: false
                }),
            });

            if (!response.ok) throw new Error('Failed to create group');

            const newGroup = await response.json();
            setGroups(prevGroups => [...prevGroups, newGroup]);
            setIsModalOpen(false);

            // Navigate to the newly created group
            router.push(`/view_groups?id=${newGroup.id}`);
        } catch (err) {
            console.error('Error creating group:', err);
            alert('Failed to create group. Please try again.');
        }
    };

    // Toggle group archived status
    const handleToggleArchive = async (groupId) => {
        try {
            const groupToUpdate = groups.find(g => g.id === groupId);
            const response = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    archived: !groupToUpdate.archived
                }),
            });

            if (!response.ok) throw new Error('Failed to update group');

            setGroups(prevGroups => prevGroups.map(group =>
                group.id === groupId
                    ? { ...group, archived: !group.archived }
                    : group
            ));
        } catch (err) {
            console.error('Error toggling archive status:', err);
            alert('Failed to update group. Please try again.');
        }
    };

    if (loading) {
        return (
            <div>
                <Header name={currentUser ? currentUser.name : ''} />
                <div className={styles.groupsContainer}>
                    <div className={styles.loading}>Loading groups...</div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <Header name={currentUser ? currentUser.name : ''} />
                <div className={styles.groupsContainer}>
                    <div className={styles.error}>{error}</div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div>
            <Header name={currentUser ? currentUser.name : ''} />
            <div className={styles.groupsContainer}>
                <div className={styles.header}>
                    <div className={styles.sortingContainer}>
                        <label htmlFor="filterDropdown">Filter by: </label>
                        <select
                            id="filterDropdown"
                            value={filterOption}
                            onChange={(e) => setFilterOption(e.target.value)}
                            className={styles.sortDropdown}
                        >
                            <option value="all">All Groups</option>
                            <option value="owing">Owing</option>
                            <option value="owed">Owed</option>
                            <option value="settled">Settled</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                    <button
                        className={styles.createButton}
                        onClick={() => setIsModalOpen(true)}
                    >
                        + Create New Group
                    </button>
                </div>

                <div className={styles.groupsGrid}>
                    {filterGroups().map(group => (
                        <GroupCard
                            key={group.id}
                            group={{
                                ...group,
                                creationDate: group.creationDate || group.createdAt
                            }}
                            color={getGroupColor(group.balance)}
                            onToggleArchive={() => handleToggleArchive(group.id)}
                            onBalanceUpdate={handleBalanceUpdate}
                        />
                    ))}
                </div>

                {filterGroups().length === 0 && (
                    <div className={styles.noGroups}>
                        No groups found for the selected filter.
                    </div>
                )}

                {isModalOpen && currentUser && (
                    <CreateGroupModal
                        onClose={() => setIsModalOpen(false)}
                        onCreate={handleCreateGroup}
                        currentUser={{
                            id: currentUser.id,
                            name: currentUser.name,
                            email: currentUser.email,
                            profileImage: currentUser.profileImage
                        }}
                    />
                )}
            </div>
            <Footer />
        </div>
    );
}