/**
 * GroupHistory.js
 * Component to display the transaction history of a group
 * 
 * Created by: Ilias Kladakis
 * Date: May 2025
 */

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import './GroupHistory.css';

const formatDateMMDDYYYY = (dateString) => {
    // Check if dateString is a valid date string
    if (!dateString || isNaN(new Date(dateString).getTime())) {
        return 'Unknown date';
    }

    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
};

const GroupHistory = ({ expenses, members, groupId }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [showPercentages, setShowPercentages] = useState({});

    // Items per page from specifications
    const itemsPerPage = 5;

    // Sort expenses from newest to oldest
    const sortedExpenses = [...expenses].sort((a, b) => {
        const dateA = new Date(a.date || 0);
        const dateB = new Date(b.date || 0);
        return dateB - dateA;
    });

    // Calculate total pages
    const totalPages = Math.ceil(sortedExpenses.length / itemsPerPage);

    // Get current expenses
    const indexOfLastExpense = currentPage * itemsPerPage;
    const indexOfFirstExpense = indexOfLastExpense - itemsPerPage;
    const currentExpenses = sortedExpenses.slice(indexOfFirstExpense, indexOfLastExpense);

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

    // Toggle showing percentages for an expense
    const togglePercentages = (expenseId) => {
        setShowPercentages(prev => ({
            ...prev,
            [expenseId]: !prev[expenseId]
        }));
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown date';

        try {
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        } catch (error) {
            return 'Invalid date';
        }
    };

    // Format currency
    const formatCurrency = (amount) => {
        if (typeof amount !== 'number') {
            amount = parseFloat(amount) || 0;
        }

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    // Find member name by ID
    const getMemberName = (userId) => {
        if (!userId || !members || !Array.isArray(members)) {
            return 'Unknown User';
        }

        const member = members.find(m => m.userId === userId);
        return member ? member.name : 'Unknown User';
    };

    // Check if expenses has any data
    if (!expenses || !Array.isArray(expenses) || expenses.length === 0) {
        return (
            <div className="group-history">
                <div className="history-header">
                    <h2 className="section-title">Group History</h2>
                </div>
                <div className="no-expenses">
                    <p>No expenses have been added to this group yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="group-history">
            <div className="history-header">
                <h2 className="section-title">Group History</h2>
            </div>

            <div className="expense-list">
                {currentExpenses.map((expense) => (
                    <div key={expense.id} className="expense-item">
                        <div className="expense-details">
                            <div className="expense-primary">
                                <h3 className="expense-name">{expense.name || 'Unnamed Expense'}</h3>
                                <span className="expense-amount">{formatCurrency(expense.amount)}</span>
                            </div>

                            <div className="expense-secondary">
                                <div className="expense-metadata">
                                    <span className="expense-payer">
                                        Added by {getMemberName(expense.paidBy)} on {formatDateMMDDYYYY(expense.date)}
                                    </span>
                                </div>

                                <button
                                    className="view-percentages-button"
                                    onClick={() => togglePercentages(expense.id)}
                                >
                                    <Eye size={16} />
                                    <span>View Percentages</span>
                                </button>
                            </div>
                        </div>

                        {showPercentages[expense.id] && expense.splits && (
                            <div className="percentages-breakdown">
                                <h4>Split Percentages</h4>
                                <div className="percentages-list">
                                    {expense.splits.map((split) => (
                                        <div key={`${expense.id}-${split.userId}`} className="percentage-item">
                                            <span className="percentage-name">{getMemberName(split.userId)}</span>
                                            <div className="percentage-values">
                                                <span className="percentage-value">{split.percentage || 0}%</span>
                                                <span className="percentage-amount">{formatCurrency(split.amount)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="pagination-button"
                        onClick={goToPrevPage}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft size={20} />
                        <span>Previous</span>
                    </button>

                    <span className="page-indicator">
                        Page {currentPage} of {totalPages}
                    </span>

                    <button
                        className="pagination-button"
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                    >
                        <span>Next</span>
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default GroupHistory;