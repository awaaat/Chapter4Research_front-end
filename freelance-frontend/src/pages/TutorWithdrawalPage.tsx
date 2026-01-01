import {
    AlertCircle,
    ArrowDownToLine,
    Building2,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Clock,
    CreditCard,
    DollarSign,
    Loader,
    XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import styles from './TutorWithdrawalPage.module.css';

// API Configuration
const API_URL = import.meta.env.VITE_API_URL + '';

interface WithdrawalStats {
    available_balance: number;
    pending_balance: number;
    total_withdrawn: number;
    total_fees_paid: number;
    pending_withdrawals: number;
    processing_withdrawals: number;
    failed_withdrawals: number;
    minimum_withdrawal: number;
    currency: string;
    tutor_country: string;
    country_supported: boolean;
    available_methods: string[];
}

interface Bank {
    code: string;
    name: string;
}

interface Withdrawal {
    withdrawal_id: string;
    amount: string;
    bank_name: string;
    account_number: string;
    status: string;
    created_at: string;
    can_cancel?: boolean;
}

const TutorWithdrawal = () => {
    // State Management
    const [activeTab, setActiveTab] = useState('withdraw');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [stats, setStats] = useState<WithdrawalStats>({
        available_balance: 0,
        pending_balance: 0,
        total_withdrawn: 0,
        total_fees_paid: 0,
        pending_withdrawals: 0,
        processing_withdrawals: 0,
        failed_withdrawals: 0,
        minimum_withdrawal: 10,
        currency: 'KES',
        tutor_country: 'Kenya',
        country_supported: true,
        available_methods: ['BANK_PAYSTACK']
    });

    // Withdrawal Form
    const [amount, setAmount] = useState('');
    const [bankCode, setBankCode] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');
    const [notes, setNotes] = useState('');
    const [verifying, setVerifying] = useState(false);

    // Banks & Withdrawals
    const [banks, setBanks] = useState<Bank[]>([]);
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [showAll, setShowAll] = useState(false);

    // Load initial data
    useEffect(() => {
        loadStats();
        loadBanks();
        if (activeTab === 'history') loadWithdrawals();
    }, [activeTab]);

    // ========================================
    // API CALLS
    // ========================================

    const getHeaders = () => ({
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
    });

    const loadStats = async () => {
        try {
            const res = await fetch(`${API_URL}/withdrawals/stats/`, {
                headers: getHeaders()
            });

            if (res.ok) {
                const data = await res.json();
                setStats({
                    available_balance: data.available_balance ?? 0,
                    pending_balance: data.pending_balance ?? 0,
                    total_withdrawn: data.total_withdrawn ?? 0,
                    total_fees_paid: data.total_fees_paid ?? 0,
                    pending_withdrawals: data.pending_withdrawals ?? 0,
                    processing_withdrawals: data.processing_withdrawals ?? 0,
                    failed_withdrawals: data.failed_withdrawals ?? 0,
                    minimum_withdrawal: data.minimum_withdrawal ?? 10,
                    currency: data.currency ?? 'KES',
                    tutor_country: data.tutor_country ?? 'Kenya',
                    country_supported: data.country_supported ?? true,
                    available_methods: data.available_methods ?? ['BANK_PAYSTACK']
                });
                setError('');
            } else {
                const errorData = await res.json();
                console.error('Failed to load stats:', errorData);
                setError('Failed to load wallet stats. Using default values.');
            }
        } catch (err) {
            console.error('Failed to load stats:', err);
            setError('Network error loading stats. Using default values.');
        }
    };

    const loadBanks = async () => {
        try {
            const res = await fetch(`${API_URL}/withdrawals/banks/`, {
                headers: getHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                setBanks(data.banks || []);
            } else {
                console.error('Failed to load banks');
                setError('Failed to load bank list');
            }
        } catch (err) {
            console.error('Failed to load banks:', err);
            setError('Network error loading banks');
        }
    };

    const loadWithdrawals = async () => {
        try {
            const res = await fetch(`${API_URL}/withdrawals/`, {
                headers: getHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                setWithdrawals(data.results || data);
            }
        } catch (err) {
            console.error('Failed to load withdrawals:', err);
        }
    };

    // ========================================
    // FORM HANDLERS
    // ========================================

    const handleVerifyAccount = async () => {
        if (!accountNumber || !bankCode) {
            setError('Please select bank and enter account number');
            return;
        }

        setError('');
        setSuccess('');
        setVerifying(true);

        try {
            const res = await fetch(`${API_URL}/withdrawals/verify-bank/`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ account_number: accountNumber, bank_code: bankCode })
            });

            const data = await res.json();

            if (data.success) {
                setAccountName(data.account_name);
                setSuccess('Account verified successfully!');
            } else {
                setError(data.message || 'Verification failed');
                setAccountName('');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setVerifying(false);
        }
    };

    const handleSubmitWithdrawal = async () => {
        if (!accountName) {
            setError('Please verify your bank account first');
            return;
        }

        const withdrawAmount = parseFloat(amount);

        if (withdrawAmount < stats.minimum_withdrawal) {
            setError(`Minimum withdrawal is $${stats.minimum_withdrawal}`);
            return;
        }

        if (withdrawAmount > stats.available_balance) {
            setError('Insufficient balance');
            return;
        }

        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const selectedBank = banks.find(b => b.code === bankCode);

            const res = await fetch(`${API_URL}/withdrawals/`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({
                    amount: withdrawAmount,
                    bank_code: bankCode,
                    bank_name: selectedBank?.name || '',
                    account_number: accountNumber,
                    account_name: accountName,
                    notes: notes
                })
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess('Withdrawal request submitted successfully!');
                // Reset form
                setAmount('');
                setAccountNumber('');
                setAccountName('');
                setNotes('');
                setBankCode('');
                // Reload data
                await loadStats();
                await loadWithdrawals();
            } else {
                setError(data.detail || data.message || 'Failed to submit withdrawal');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelWithdrawal = async (withdrawalId: string) => {
        if (!confirm('Cancel this withdrawal request?')) return;

        try {
            const res = await fetch(`${API_URL}/withdrawals/${withdrawalId}/cancel/`, {
                method: 'POST',
                headers: getHeaders()
            });

            if (res.ok) {
                setSuccess('Withdrawal cancelled');
                await loadWithdrawals();
                await loadStats();
            } else {
                setError('Failed to cancel withdrawal');
            }
        } catch (err) {
            setError('Failed to cancel withdrawal');
        }
    };

    // ========================================
    // UI HELPERS
    // ========================================

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle size={16} />;
            case 'FAILED': return <XCircle size={16} />;
            case 'PENDING': return <Clock size={16} />;
            case 'PROCESSING': return <Loader size={16} className={styles.spin} />;
            default: return <AlertCircle size={16} />;
        }
    };

    const getStatusClass = (status: string) => {
        const statusMap: Record<string, string> = {
            'PENDING': styles.statusBadgePending,
            'APPROVED': styles.statusBadgeApproved,
            'PROCESSING': styles.statusBadgeProcessing,
            'COMPLETED': styles.statusBadgeCompleted,
            'FAILED': styles.statusBadgeFailed,
            'CANCELLED': styles.statusBadgeCancelled
        };
        return statusMap[status] || styles.statusBadgeCancelled;
    };

    const calculateFee = (amt: number) => {
        if (!amt) return 0;
        const feePercent = 2;
        const calculatedFee = amt * (feePercent / 100);
        const minFee = 2;
        return Math.max(calculatedFee, minFee);
    };

    const displayedWithdrawals = showAll ? withdrawals : withdrawals.slice(0, 5);

    // ========================================
    // RENDER
    // ========================================

    return (
        <div className={styles.withdrawalPage}>
            <div className={styles.withdrawalContainer}>

                {/* Header */}
                <div className={styles.withdrawalHeader}>
                    <h1 className={styles.withdrawalHeaderTitle}>Withdraw Funds</h1>
                    <p className={styles.withdrawalHeaderSubtitle}>Transfer your earnings to your bank account</p>
                </div>

                {/* Stats Cards */}
                <div className={styles.statsGrid}>
                    <div className={`${styles.statCard} ${styles.statCardSuccess}`}>
                        <div className={styles.statCardHeader}>
                            <DollarSign size={24} className={`${styles.statCardIcon} ${styles.statCardIconSuccess}`} />
                            <h3 className={styles.statCardLabel}>Available Balance</h3>
                        </div>
                        <p className={styles.statCardValue}>${stats.available_balance.toFixed(2)}</p>
                    </div>

                    <div className={`${styles.statCard} ${styles.statCardWarning}`}>
                        <div className={styles.statCardHeader}>
                            <Clock size={24} className={`${styles.statCardIcon} ${styles.statCardIconWarning}`} />
                            <h3 className={styles.statCardLabel}>In Escrow</h3>
                        </div>
                        <p className={styles.statCardValue}>${stats.pending_balance.toFixed(2)}</p>
                    </div>

                    <div className={`${styles.statCard} ${styles.statCardInfo}`}>
                        <div className={styles.statCardHeader}>
                            <ArrowDownToLine size={24} className={`${styles.statCardIcon} ${styles.statCardIconInfo}`} />
                            <h3 className={styles.statCardLabel}>Total Withdrawn</h3>
                        </div>
                        <p className={styles.statCardValue}>${stats.total_withdrawn.toFixed(2)}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'withdraw' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('withdraw')}
                    >
                        New Withdrawal
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'history' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        Withdrawal History
                    </button>
                </div>

                {/* Alerts */}
                {error && (
                    <div className={`${styles.alert} ${styles.alertError}`}>
                        <AlertCircle size={18} className={styles.alertIcon} />
                        {error}
                    </div>
                )}

                {success && (
                    <div className={`${styles.alert} ${styles.alertSuccess}`}>
                        <CheckCircle size={18} className={styles.alertIcon} />
                        {success}
                    </div>
                )}

                {/* Withdrawal Form */}
                {activeTab === 'withdraw' && (
                    <div className={styles.formCard}>

                        {/* Amount */}
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Withdrawal Amount (USD)</label>
                            <input
                                type="number"
                                step="0.01"
                                min={stats.minimum_withdrawal}
                                max={stats.available_balance}
                                value={amount}
                                onChange={(e) => {
                                    setAmount(e.target.value);
                                    setError('');
                                    setSuccess('');
                                }}
                                placeholder="Enter amount"
                                className={styles.formInput}
                            />
                            <span className={styles.formHint}>
                                Min: ${stats.minimum_withdrawal.toFixed(2)} | Max: ${stats.available_balance.toFixed(2)}
                            </span>

                            {/* Fee Preview */}
                            {amount && parseFloat(amount) > 0 && (
                                <div className={styles.feePreview}>
                                    <div className={styles.feePreviewRow}>
                                        <span className={styles.feePreviewLabel}>Amount:</span>
                                        <span className={styles.feePreviewValue}>${parseFloat(amount).toFixed(2)}</span>
                                    </div>
                                    <div className={styles.feePreviewRow}>
                                        <span className={styles.feePreviewLabel}>Fee (2%):</span>
                                        <span className={`${styles.feePreviewValue} ${styles.feePreviewValueNegative}`}>
                                            -${calculateFee(parseFloat(amount)).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className={`${styles.feePreviewRow} ${styles.feePreviewTotal}`}>
                                        <span className={styles.feePreviewLabel}>You Receive:</span>
                                        <span className={styles.feePreviewValue}>
                                            ${(parseFloat(amount) - calculateFee(parseFloat(amount))).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Bank Selection */}
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>
                                <Building2 size={16} className={styles.formLabelIcon} />
                                Select Bank
                            </label>
                            <select
                                value={bankCode}
                                onChange={(e) => {
                                    setBankCode(e.target.value);
                                    setAccountName('');
                                    setError('');
                                    setSuccess('');
                                }}
                                className={styles.formSelect}
                            >
                                <option value="">-- Choose Bank --</option>
                                {banks.map(bank => (
                                    <option key={bank.code} value={bank.code}>{bank.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Account Number */}
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>
                                <CreditCard size={16} className={styles.formLabelIcon} />
                                Account Number
                            </label>
                            <div className={styles.inputGroup}>
                                <input
                                    type="text"
                                    value={accountNumber}
                                    onChange={(e) => {
                                        setAccountNumber(e.target.value);
                                        setAccountName('');
                                        setError('');
                                        setSuccess('');
                                    }}
                                    placeholder="0123456789"
                                    className={`${styles.formInput} ${styles.inputGroupInput}`}
                                />
                                <button
                                    type="button"
                                    onClick={handleVerifyAccount}
                                    disabled={verifying || !bankCode || !accountNumber}
                                    className={`${styles.btn} ${styles.btnPrimary} ${(verifying || !bankCode || !accountNumber) ? styles.btnDisabled : ''}`}
                                >
                                    {verifying ? 'Verifying...' : 'Verify'}
                                </button>
                            </div>

                            {/* Verified Account Name */}
                            {accountName && (
                                <div className={styles.verificationSuccess}>
                                    <CheckCircle size={18} className={styles.verificationSuccessIcon} />
                                    <div>
                                        <p className={styles.verificationSuccessTitle}>Account Verified</p>
                                        <p className={styles.verificationSuccessName}>{accountName}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Notes */}
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Notes (Optional)</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add any notes..."
                                rows={3}
                                className={styles.formTextarea}
                            />
                        </div>

                        {/* Submit */}
                        <button
                            onClick={handleSubmitWithdrawal}
                            disabled={loading || !accountName}
                            className={`${styles.btn} ${styles.btnPrimary} ${styles.btnFullWidth} ${(loading || !accountName) ? styles.btnDisabled : ''}`}
                        >
                            {loading ? <Loader size={20} className={styles.spin} /> : <ArrowDownToLine size={20} />}
                            {loading ? 'Processing...' : 'Submit Withdrawal Request'}
                        </button>
                    </div>
                )}

                {/* Withdrawal History */}
                {activeTab === 'history' && (
                    <div className={styles.historyCard}>
                        <h3 className={styles.historyCardTitle}>Withdrawal History</h3>

                        {withdrawals.length === 0 ? (
                            <p className={styles.historyEmpty}>No withdrawals yet</p>
                        ) : (
                            <>
                                <div className={styles.tableWrapper}>
                                    <table className={styles.table}>
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Amount</th>
                                                <th>Bank</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {displayedWithdrawals.map(w => (
                                                <tr key={w.withdrawal_id}>
                                                    <td>
                                                        {new Date(w.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className={styles.tableAmount}>
                                                        ${parseFloat(w.amount).toFixed(2)}
                                                    </td>
                                                    <td>
                                                        <div className={styles.tableBank}>{w.bank_name}</div>
                                                        <span className={styles.tableAccount}>****{w.account_number.slice(-4)}</span>
                                                    </td>
                                                    <td>
                                                        <span className={`${styles.statusBadge} ${getStatusClass(w.status)}`}>
                                                            {getStatusIcon(w.status)}
                                                            {w.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {w.can_cancel && (
                                                            <button
                                                                onClick={() => handleCancelWithdrawal(w.withdrawal_id)}
                                                                className={`${styles.btn} ${styles.btnSecondary}`}
                                                            >
                                                                Cancel
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Show More Button */}
                                {withdrawals.length > 5 && (
                                    <button
                                        onClick={() => setShowAll(!showAll)}
                                        className={`${styles.btn} ${styles.btnGhost} ${styles.showMoreBtn}`}
                                    >
                                        {showAll ? (
                                            <>Show Less <ChevronUp size={16} /></>
                                        ) : (
                                            <>Show All ({withdrawals.length}) <ChevronDown size={16} /></>
                                        )}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TutorWithdrawal;