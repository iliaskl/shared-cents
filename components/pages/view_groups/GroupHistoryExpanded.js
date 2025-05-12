/**
 * GroupHistoryExpanded.js
 * Full page view of all expense histories from all members in the group
 * 
 * Created by: Ilias Kladakis
 * Date: May 2025
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Filter, SortDesc, SortAsc } from 'lucide-react';
import './GroupHistoryExpanded.css';

const GroupHistoryExpanded = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();

    // State variables
    const [group, setGroup] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortOrder, setSortOrder] = useState('desc'); 
    const [filterMember, setFilterMember] = useState('all');

    // Number of items per page
    const ITEMS_PER_PAGE = 10;

    // Fetch group data when component mounts
    useEffect(() => {
        const fetchGroupData = async () => {
            try {
                setLoading(true);

                // API call to fetch group details
                const groupResponse = await fetch(`/api/groups/${groupId}`);
                if (!groupResponse.ok) {
                    throw new Error('Failed to fetch group details');
                }
                const groupData = await groupResponse.json();
                setGroup(groupData);

                // Fetch group members
                const membersResponse = await fetch(`/api/groups/${groupId}/members`);
                if (!membersResponse.ok) {
                    throw new Error('Failed to fetch group members');
                }
                const membersData = await membersResponse.json();
                setMembers(membersData);

                // Fetch all group expenses
                const expensesResponse = await fetch(`/api/groups/${groupId}/expenses?all=true`);
                if (!expensesResponse.ok) {
                    throw new Error('Failed to fetch group expenses');
                }
                const expensesData = await expensesResponse.json();
                setExpenses(expensesData);

                // Calculate total pages
                setTotalPages(Math.ceil(expensesData.length / ITEMS_PER_PAGE));

                setError(null);
            } catch (err) {
                console.error('Error fetching group data:', err);
                setError('Failed to load group history. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (groupId) {
            fetchGroupData();
        }
    }, [groupId]);

    // Go back to the group view page
    const handleGoBack = () => {
        navigate(`/groups/${groupId}`);
    };

    // Handle pagination
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Toggle sort order
    const toggleSortOrder = () => {
        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    };

    // Change member filter
    const handleFilterChange = (event) => {
        setFilterMember(event.target.value);
        setCurrentPage(1); // Reset to first page when filter changes
    };

    // Filter and sort expenses
    const getFilteredAndSortedExpenses = () => {
        // Apply member filter
        let filtered = filterMember === 'all'
            ? expenses
            : expenses.filter(expense => expense.paidBy === filterMember);

        // Apply sorting
        const sorted = [...filtered].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

        return sorted;
    };

    // Get current page of expenses
    const getCurrentExpenses = () => {
        const filteredAndSorted = getFilteredAndSortedExpenses();
        const indexOfLastExpense = currentPage * ITEMS_PER_PAGE;
        const indexOfFirstExpense = indexOfLastExpense - ITEMS_PER_PAGE;

        // Update total pages whenever the filter changes
        const newTotalPages = Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE);
        if (newTotalPages !== totalPages) {
            setTotalPages(newTotalPages);

            // Adjust current page if it's now out of bounds
            if (currentPage > newTotalPages && newTotalPages > 0) {
                setCurrentPage(newTotalPages);
            }
        }

        return filteredAndSorted.slice(indexOfFirstExpense, indexOfLastExpense);
    };

    // Format date for display
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    // Find member name by ID
    const getMemberName = (userId) => {
        const member = members.find(m => m.userId === userId);
        return member ? member.name : 'Unknown User';
    };

    // Find member avatar by ID
    const getMemberAvatar = (userId) => {
        const member = members.find(m => m.userId === userId);
        return member ? member.avatar : null;
    };

    // Current expenses based on filters, sorting, and pagination
    const currentExpenses = !loading ? getCurrentExpenses() : [];

    return (
        <div className="group-history-expanded">
            <div className="history-header">
                <button className="back-button" onClick={handleGoBack}>
                    <ArrowLeft size={20} />
                    <span>Back to Group</span>
                </button>

                <h1 className="page-title">
                    {group ? `${group.name} - Expense History` : 'Group Expense History'}
                </h1>
            </div>

            <div className="history-content">
                {loading ? (
                    <div className="loading-state">Loading expense history...</div>
                ) : error ? (
                    <div className="error-state">{error}</div>
                ) : (
                    <>
                        <div className="history-controls">
                            <div className="filter-control">
                                <Filter size={18} />
                                <select
                                    value={filterMember}
                                    onChange={handleFilterChange}
                                    className="member-filter"
                                >
                                    <option value="all">All Members</option>
                                    {members.map((member) => (
                                        <option key={member.userId} value={member.userId}>
                                            {member.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button className="sort-button" onClick={toggleSortOrder}>
                                {sortOrder === 'desc' ? (
                                    <>
                                        <SortDesc size={18} />
                                        <span>Newest First</span>
                                    </>
                                ) : (
                                    <>
                                        <SortAsc size={18} />
                                        <span>Oldest First</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {currentExpenses.length > 0 ? (
                            <div className="expenses-table-container">
                                <table className="expenses-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Added By</th>
                                            <th>Expense</th>
                                            <th>Amount</th>
                                            <th>Split Details</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentExpenses.map((expense) => (
                                            <tr key={expense.id} className="expense-row">
                                                <td className="expense-date">{formatDate(expense.date)}</td>
                                                <td className="expense-payer">
                                                    <div className="payer-info">
                                                        {getMemberAvatar(expense.paidBy) ? (
                                                            <img
                                                                src={getMemberAvatar(expense.paidBy)}
                                                                alt={getMemberName(expense.paidBy)}
                                                                className="payer-avatar"
                                                            />
                                                        ) : (
                                                            <div className="payer-avatar-placeholder">
                                                                {getMemberName(expense.paidBy).charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <span>{getMemberName(expense.paidBy)}</span>
                                                    </div>
                                                </td>
                                                <td className="expense-name">{expense.name}</td>
                                                <td className="expense-amount">{formatCurrency(expense.amount)}</td>
                                                <td className="expense-splits">
                                                    <div className="splits-list">
                                                        {expense.splits.map((split) => (
                                                            <div key={`${expense.id}-${split.userId}`} className="split-item">
                                                                <span className="split-name">{getMemberName(split.userId)}</span>
                                                                <div className="split-details">
                                                                    <span className="split-percentage">{split.percentage}%</span>
                                                                    <span className="split-amount">{formatCurrency(split.amount)}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="no-expenses">
                                <p>No expenses found with the current filters.</p>
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    className="pagination-button"
                                    onClick={goToPrevPage}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft size={18} />
                                </button>

                                <span className="page-indicator">
                                    Page {currentPage} of {totalPages}
                                </span>

                                <button
                                    className="pagination-button"
                                    onClick={goToNextPage}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default GroupHistoryExpanded;