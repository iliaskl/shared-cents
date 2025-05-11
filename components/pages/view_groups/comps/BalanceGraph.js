/**
 * BalanceGraph.js
 * Component to display a bar graph of all members' balances
 * 
 * Created by: Ilias Kladakis
 * Date: May 2025
 */

import React from 'react';
import './BalanceGraph.css';

const BalanceGraph = ({ members, currentUserId, currency = 'USD' }) => {
    const formatCurrency = (amount) => {
        const currencyMap = {
            'USD': { locale: 'en-US', currency: 'USD' },
            'EUR': { locale: 'de-DE', currency: 'EUR' },
            'GBP': { locale: 'en-GB', currency: 'GBP' },
            'JPY': { locale: 'ja-JP', currency: 'JPY' },
            'CAD': { locale: 'en-CA', currency: 'CAD' },
            'AUD': { locale: 'en-AU', currency: 'AUD' },
            'CHF': { locale: 'de-CH', currency: 'CHF' },
            'CNY': { locale: 'zh-CN', currency: 'CNY' },
            'INR': { locale: 'en-IN', currency: 'INR' },
            'MXN': { locale: 'es-MX', currency: 'MXN' },
            'BRL': { locale: 'pt-BR', currency: 'BRL' },
            'KRW': { locale: 'ko-KR', currency: 'KRW' },
        };

        const currencyConfig = currencyMap[currency] || { locale: 'en-US', currency: currency };

        return new Intl.NumberFormat(currencyConfig.locale, {
            style: 'currency',
            currency: currencyConfig.currency,
            maximumFractionDigits: currency === 'JPY' || currency === 'KRW' ? 0 : 2,
            minimumFractionDigits: currency === 'JPY' || currency === 'KRW' ? 0 : 2,
        }).format(amount);
    };

    // Find the maximum absolute balance for scaling
    const maxAbsBalance = Math.max(
        ...members.map(member => Math.abs(member.balance))
    );

    // Sort members by balance (highest to lowest)
    const sortedMembers = [...members].sort((a, b) => b.balance - a.balance);

    return (
        <div className="balance-graph">
            <div className="graph-legend">
                <div className="legend-item">
                    <div className="legend-color owing"></div>
                    <span>Owes</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color owed"></div>
                    <span>Owed</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color settled"></div>
                    <span>Settled</span>
                </div>
            </div>

            <div className="graph-container">
                <div className="center-line"></div>

                {sortedMembers.map(member => {
                    // Calculate bar width as percentage
                    const barWidthPercent = Math.min(
                        40,
                        Math.abs(member.balance) / maxAbsBalance * 40
                    );

                    return (
                        <div key={member.userId} className="balance-row">
                            <div className={`name-cell ${member.userId === currentUserId ? 'current-user' : ''}`}>
                                {member.name}
                            </div>
                            <div className="graph-cell">
                                {member.balance === 0 ? (
                                    <div className="bar settled"></div>
                                ) : member.balance > 0 ? (
                                    <div
                                        className="bar owed"
                                        style={{
                                            width: `${barWidthPercent}%`,
                                            left: '50%'
                                        }}
                                    ></div>
                                ) : (
                                    <div
                                        className="bar owing"
                                        style={{
                                            width: `${barWidthPercent}%`,
                                            right: '50%'
                                        }}
                                    ></div>
                                )}
                            </div>
                            <div className="amount-cell">
                                {formatCurrency(Math.abs(member.balance))}
                            </div>
                        </div>
                    );
                })}

                {members.length === 0 && (
                    <div className="no-members">
                        <p>No member data available</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BalanceGraph;