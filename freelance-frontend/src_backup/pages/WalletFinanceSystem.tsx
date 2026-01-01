import { ChevronDown, ChevronUp, Clock, CreditCard, DollarSign, Download, FileText, Loader, Plus, RefreshCw, Search, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './WalletFinanceSystem.module.css';

// Types
interface Wallet {
    wallet_id: string;
    username: string;
    balance: string;
    pending_balance: string;
    total_earned: string;
    total_spent: string;
    created_at: string;
}

interface Transaction {
    transaction_id: string;
    transaction_type: string;
    amount: string;
    status: string;
    description: string;
    reference: string;
    created_at: string;
    payment?: {
        project_title?: string;
        client_name?: string;
        tutor_name?: string;
    };
}

interface Invoice {
    invoice_id: string;
    invoice_number: string;
    project_title: string;
    client_name: string;
    tutor_name: string;
    total_amount: string;
    status: string;
    issue_date: string;
    due_date: string;
    paid_date?: string;
}

const downloadCSV = (data: any[], filename: string, columns: string[], getRow: (item: any) => string[]) => {
    const csvRows = [];
    csvRows.push(columns.join(','));
    data.forEach(item => {
        csvRows.push(getRow(item).map(value => `"${value.replace(/"/g, '""')}"`).join(','));
    });
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
};

// Main Component
const WalletFinanceSystem = ({ userRole }: { userRole: 'client' | 'tutor' }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'invoices' | 'topup'>('overview');
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAllActivities, setShowAllActivities] = useState(false);

    // Topup specific states
    const [topupAmount, setTopupAmount] = useState('');
    const [topupLoading, setTopupLoading] = useState(false);
    const [topupError, setTopupError] = useState('');

    // Filters
    const [dateRange, setDateRange] = useState('all');
    const [transactionFilter, setTransactionFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadWalletData();
        if (activeTab === 'transactions') loadTransactions();
        if (activeTab === 'invoices') loadInvoices();
    }, [activeTab]);

    const loadWalletData = async () => {
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch('http://localhost:8001/api/wallets/my-wallet/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to load wallet');
            const data = await res.json();
            setWallet(data);
            setError(null);
        } catch (err) {
            setError('Failed to load wallet data');
        } finally {
            setLoading(false);
        }
    };

    const loadTransactions = async () => {
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch('http://localhost:8001/api/transactions/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to load transactions');
            const data = await res.json();
            setTransactions(data.results || data);
        } catch (err) {
            console.error('Failed to load transactions:', err);
        }
    };

    const loadInvoices = async () => {
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch('http://localhost:8001/api/invoices/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to load invoices');
            const data = await res.json();
            setInvoices(data.results || data);
        } catch (err) {
            console.error('Failed to load invoices:', err);
        }
    };

    const handlePaystackTopUp = async (amount: number) => {
        setTopupError('');

        console.log('🔍 Top-up initiated:');
        console.log('   Amount (raw):', amount);
        console.log('   Amount type:', typeof amount);

        if (!amount || amount <= 0) {
            setTopupError('Please enter a valid amount');
            return;
        }

        const token = localStorage.getItem('access_token');
        setTopupLoading(true);

        try {
            const payload = { amount: Number(amount) };

            console.log('Sending to backend:');
            console.log('   Payload:', JSON.stringify(payload));
            console.log('   Amount:', payload.amount);
            console.log('   Amount type:', typeof payload.amount);

            // Call backend to initialize Paystack payment
            const res = await fetch('http://localhost:8001/api/paystack/initialize/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            console.log('Response status:', res.status);

            const data = await res.json();

            console.log('Response data:', data);

            if (data.success && data.authorization_url) {
                console.log('Redirecting to Paystack:', data.authorization_url);
                // Redirect to Paystack checkout
                window.location.href = data.authorization_url;
            } else {
                console.error('Initialization failed:', data);
                setTopupError(data.message || 'Failed to initialize payment');
            }
        } catch (err) {
            console.error('Network Error:', err);
            setTopupError('Network error. Please try again.');
        } finally {
            setTopupLoading(false);
        }
    };

    const getVisibleTransactions = () => {
        return transactions.filter(txn =>
            userRole !== 'client' ||
            (!txn.description.toLowerCase().includes('platform') &&
                !txn.description.toLowerCase().includes('fee'))
        );
    };

    const handleExportTransactions = () => {
        const visible = getVisibleTransactions();
        const columns = ['Date', 'Description', 'Reference', 'Status', 'Amount'];
        const getRow = (txn: Transaction) => [
            new Date(txn.created_at).toLocaleDateString(),
            txn.description,
            txn.reference,
            txn.status,
            `${txn.transaction_type.includes('credit') ? '+' : '-'}${parseFloat(txn.amount).toFixed(2)}`
        ];
        downloadCSV(visible, 'transactions.csv', columns, getRow);
    };

    const handleExportInvoices = () => {
        const columns = ['Invoice #', 'Project', `${userRole === 'client' ? 'Tutor' : 'Client'}`, 'Issue Date', 'Status', 'Amount'];
        const getRow = (inv: Invoice) => [
            inv.invoice_number,
            inv.project_title,
            userRole === 'client' ? inv.tutor_name : inv.client_name,
            new Date(inv.issue_date).toLocaleDateString(),
            inv.status,
            parseFloat(inv.total_amount).toFixed(2)
        ];
        downloadCSV(invoices, 'invoices.csv', columns, getRow);
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingContent}>
                    <RefreshCw className={styles.loadingSpinner} />
                    <p className={styles.loadingText}>Loading wallet...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <div className={styles.errorCard}>
                    {error}
                </div>
            </div>
        );
    }

    const visibleTransactions = getVisibleTransactions();
    const displayedActivities = showAllActivities ? visibleTransactions : visibleTransactions.slice(0, 3);

    return (
        <div className={styles.container}>
            <div className={styles.maxWidth}>
                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.headerTitle}>Wallet & Finance</h1>
                    <p className={styles.headerSubtitle}>Manage your finances and track transactions</p>
                </div>

                {/* Navigation Tabs */}
                <div className={styles.tabsContainer}>
                    <div className={styles.tabsList}>
                        {[
                            'overview',
                            'transactions',
                            'invoices',
                            ...(userRole === 'client' ? ['topup'] : [])
                        ].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={activeTab === tab ? `${styles.tabButton} ${styles.tabButtonActive}` : styles.tabButton}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && wallet && (
                    <div>
                        {/* Balance Cards */}
                        <div className={styles.balanceGrid}>
                            <div className={`${styles.balanceCard} ${styles.balanceCardBlue}`}>
                                <div className={styles.cardHeader}>
                                    <DollarSign className={styles.cardIcon} />
                                    <RefreshCw
                                        className={styles.refreshIcon}
                                        onClick={loadWalletData}
                                    />
                                </div>
                                <h3 className={styles.cardTitle}>Available Balance</h3>
                                <p className={styles.cardAmount}>${parseFloat(wallet.balance).toFixed(2)}</p>
                                <p className={styles.cardLabel}>Ready to {userRole === 'tutor' ? 'withdraw' : 'spend'}</p>
                            </div>

                            {userRole === 'tutor' && (
                                <div className={`${styles.balanceCard} ${styles.balanceCardYellow}`}>
                                    <div className={styles.cardHeader}>
                                        <Clock className={styles.cardIcon} />
                                    </div>
                                    <h3 className={styles.cardTitle}>Pending (Escrow)</h3>
                                    <p className={styles.cardAmount}>${parseFloat(wallet.pending_balance).toFixed(2)}</p>
                                    <p className={styles.cardLabel}>Awaiting project completion</p>
                                </div>
                            )}

                            <div className={`${styles.balanceCard} ${styles.balanceCardGreen}`}>
                                <div className={styles.cardHeader}>
                                    <TrendingUp className={styles.cardIcon} />
                                </div>
                                <h3 className={styles.cardTitle}>
                                    {userRole === 'tutor' ? 'Total Earned' : 'Total Spent'}
                                </h3>
                                <p className={styles.cardAmount}>
                                    ${parseFloat(userRole === 'tutor' ? wallet.total_earned : wallet.total_spent).toFixed(2)}
                                </p>
                                <p className={styles.cardLabel}>Lifetime {userRole === 'tutor' ? 'earnings' : 'spending'}</p>
                            </div>
                        </div>

                        {/* Recent Activity - Full Width */}
                        <div className={styles.statsCard}>
                            <h3 className={styles.statsCardTitle}>Recent Activity</h3>
                            <div className={styles.activityList}>
                                {displayedActivities.map((txn) => {
                                    const isCredit = txn.transaction_type?.toLowerCase().includes('deposit') ||
                                        txn.transaction_type?.toLowerCase().includes('release') ||
                                        txn.transaction_type?.toLowerCase().includes('refund');

                                    return (
                                        <div key={txn.transaction_id} className={styles.activityItem}>
                                            <div className={styles.activityLeft}>
                                                {isCredit ? (
                                                    <TrendingUp className={`${styles.activityIcon} ${styles.activityIconGreen}`} />
                                                ) : (
                                                    <TrendingDown className={`${styles.activityIcon} ${styles.activityIconRed}`} />
                                                )}
                                                <div>
                                                    <p className={styles.activityDescription}>{txn.description}</p>
                                                    <p className={styles.activityDate}>{new Date(txn.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <span className={`${styles.activityAmount} ${isCredit ? styles.activityAmountPositive : styles.activityAmountNegative}`}>
                                                {isCredit ? '+' : '-'}${parseFloat(txn.amount).toFixed(2)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {visibleTransactions.length > 3 && (
                                <button
                                    onClick={() => setShowAllActivities(!showAllActivities)}
                                    className={styles.viewMoreButton}
                                >
                                    {showAllActivities ? (
                                        <>
                                            <span>Show Less</span>
                                            <ChevronUp size={16} />
                                        </>
                                    ) : (
                                        <>
                                            <span>View More ({visibleTransactions.length - 3} more)</span>
                                            <ChevronDown size={16} />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Quick Actions - Full Width Below */}
                        <div className={styles.statsCard}>
                            <h3 className={styles.statsCardTitle}>Quick Actions</h3>
                            <div className={styles.actionsList}>
                                {userRole === 'client' && (
                                    <button
                                        onClick={() => setActiveTab('topup')}
                                        className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
                                    >
                                        <Plus className={styles.cardIcon} />
                                        <span>Top Up Wallet</span>
                                    </button>
                                )}

                                {userRole === 'tutor' && (
                                    <button
                                        className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
                                        onClick={() => navigate('/tutor/wallet/withdraw')}
                                    >
                                        <Download className={styles.cardIcon} />
                                        <span>Withdraw Funds</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => setActiveTab('transactions')}
                                    className={`${styles.actionButton} ${styles.actionButtonSecondary}`}
                                >
                                    <FileText className={styles.cardIcon} />
                                    <span>View All Transactions</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('invoices')}
                                    className={`${styles.actionButton} ${styles.actionButtonSecondary}`}
                                >
                                    <FileText className={styles.cardIcon} />
                                    <span>View Invoices</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Transactions Tab */}
                {activeTab === 'transactions' && (
                    <div className={styles.transactionsContainer}>
                        {/* Filters */}
                        <div className={styles.filtersContainer}>
                            <div className={styles.filtersGrid}>
                                <div className={styles.searchWrapper}>
                                    <Search className={styles.searchIcon} />
                                    <input
                                        type="text"
                                        placeholder="Search transactions..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className={styles.searchInput}
                                    />
                                </div>
                                <select
                                    value={transactionFilter}
                                    onChange={(e) => setTransactionFilter(e.target.value)}
                                    className={styles.filterSelect}
                                >
                                    <option value="all">All Types</option>
                                    <option value="credit">Credits</option>
                                    <option value="debit">Debits</option>
                                </select>
                                <select
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value)}
                                    className={styles.filterSelect}
                                >
                                    <option value="all">All Time</option>
                                    <option value="today">Today</option>
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                    <option value="year">This Year</option>
                                </select>
                                <button onClick={handleExportTransactions} className={styles.exportButton}>
                                    <Download className={styles.cardIcon} />
                                    <span>Export</span>
                                </button>
                            </div>
                        </div>

                        {/* Transaction List */}
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead className={styles.tableHead}>
                                    <tr>
                                        <th className={styles.tableHeadCell}>Date</th>
                                        <th className={styles.tableHeadCell}>Description</th>
                                        <th className={styles.tableHeadCell}>Reference</th>
                                        <th className={styles.tableHeadCell}>Status</th>
                                        <th className={`${styles.tableHeadCell} ${styles.tableHeadCellRight}`}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody className={styles.tableBody}>
                                    {visibleTransactions.map((txn) => {
                                        const isCredit = txn.transaction_type?.toLowerCase().includes('deposit') ||
                                            txn.transaction_type?.toLowerCase().includes('release') ||
                                            txn.transaction_type?.toLowerCase().includes('refund');

                                        return (
                                            <tr key={txn.transaction_id} className={styles.tableRow}>
                                                <td className={styles.tableCell}>
                                                    {new Date(txn.created_at).toLocaleDateString()}
                                                </td>
                                                <td className={styles.tableCell}>
                                                    <div className={styles.tableCellDescription}>
                                                        {isCredit ? (
                                                            <TrendingUp className={`${styles.activityIcon} ${styles.activityIconGreen}`} />
                                                        ) : (
                                                            <TrendingDown className={`${styles.activityIcon} ${styles.activityIconRed}`} />
                                                        )}
                                                        <span>{txn.description}</span>
                                                    </div>
                                                </td>
                                                <td className={styles.tableCell}>
                                                    {txn.reference}
                                                </td>
                                                <td className={styles.tableCell}>
                                                    <span className={`${styles.statusBadge} ${txn.status === 'completed' ? styles.statusCompleted :
                                                        txn.status === 'pending' ? styles.statusPending :
                                                            styles.statusFailed
                                                        }`}>
                                                        {txn.status}
                                                    </span>
                                                </td>
                                                <td className={`${styles.tableCell} ${styles.tableCellRight}`}>
                                                    <span className={isCredit ? styles.activityAmountPositive : styles.activityAmountNegative}>
                                                        {isCredit ? '+' : '-'}${parseFloat(txn.amount).toFixed(2)}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Invoices Tab */}
                {activeTab === 'invoices' && (
                    <div className={styles.transactionsContainer}>
                        <div className={styles.filtersContainer}>
                            <div className={styles.filtersGrid}>
                                <h2 className={styles.statsCardTitle}>Invoices</h2>
                                <button onClick={handleExportInvoices} className={styles.exportButton}>
                                    <Download className={styles.cardIcon} />
                                    <span>Export All</span>
                                </button>
                            </div>
                        </div>
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead className={styles.tableHead}>
                                    <tr>
                                        <th className={styles.tableHeadCell}>Invoice #</th>
                                        <th className={styles.tableHeadCell}>Project</th>
                                        <th className={styles.tableHeadCell}>
                                            {userRole === 'client' ? 'Tutor' : 'Client'}
                                        </th>
                                        <th className={styles.tableHeadCell}>Issue Date</th>
                                        <th className={styles.tableHeadCell}>Status</th>
                                        <th className={`${styles.tableHeadCell} ${styles.tableHeadCellRight}`}>Amount</th>
                                        <th className={`${styles.tableHeadCell} ${styles.tableHeadCellRight}`}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className={styles.tableBody}>
                                    {invoices.map((invoice) => {
                                        const isPositive = userRole === 'tutor';

                                        return (
                                            <tr key={invoice.invoice_id} className={styles.tableRow}>
                                                <td className={styles.tableCell}>
                                                    {invoice.invoice_number}
                                                </td>
                                                <td className={styles.tableCell}>{invoice.project_title}</td>
                                                <td className={styles.tableCell}>
                                                    {userRole === 'client' ? invoice.tutor_name : invoice.client_name}
                                                </td>
                                                <td className={styles.tableCell}>
                                                    {new Date(invoice.issue_date).toLocaleDateString()}
                                                </td>
                                                <td className={styles.tableCell}>
                                                    <span className={`${styles.statusBadge} ${invoice.status === 'paid' ? styles.statusCompleted :
                                                        invoice.status === 'pending' ? styles.statusPending :
                                                            styles.statusFailed
                                                        }`}>
                                                        {invoice.status}
                                                    </span>
                                                </td>
                                                <td className={`${styles.tableCell} ${styles.tableCellRight}`}>
                                                    <span className={isPositive ? styles.activityAmountPositive : styles.activityAmountNegative}>
                                                        {isPositive ? '+' : '-'}${parseFloat(invoice.total_amount).toFixed(2)}
                                                    </span>
                                                </td>
                                                <td className={`${styles.tableCell} ${styles.tableCellRight}`}>
                                                    <button className={styles.actionButtonSecondary}>
                                                        Download
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ✅ UPDATED: Top Up Tab with Paystack Integration */}
                {activeTab === 'topup' && userRole === 'client' && (
                    <div className={styles.topupContainer}>
                        <div className={styles.topupCard}>
                            <div className={styles.topupHeader}>
                                <div className={styles.topupIconWrapper}>
                                    <CreditCard className={styles.topupIcon} />
                                </div>
                                <h2 className={styles.topupTitle}>Top Up Wallet</h2>
                                <p className={styles.topupSubtitle}>Add funds to your wallet via Paystack</p>
                            </div>

                            <div className={styles.topupForm}>
                                {/* Error Message */}
                                {topupError && (
                                    <div style={{
                                        backgroundColor: '#fee',
                                        border: '1px solid #fcc',
                                        color: '#c33',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        marginBottom: '15px'
                                    }}>
                                        {topupError}
                                    </div>
                                )}

                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>
                                        Enter Amount (USD)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="100.00"
                                        value={topupAmount}
                                        onChange={(e) => setTopupAmount(e.target.value)}
                                        min="1"
                                        step="0.01"
                                        className={styles.amountInput}
                                        disabled={topupLoading}
                                    />
                                    <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                                        Minimum: $1.00
                                    </p>
                                </div>

                                <div className={styles.quickAmounts}>
                                    {[50, 100, 250].map((amount) => (
                                        <button
                                            key={amount}
                                            onClick={() => {
                                                setTopupAmount(amount.toString());
                                                setTopupError('');
                                            }}
                                            className={styles.quickAmountButton}
                                            disabled={topupLoading}
                                        >
                                            ${amount}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => handlePaystackTopUp(parseFloat(topupAmount))}
                                    className={styles.submitButton}
                                    disabled={topupLoading}
                                    style={{
                                        opacity: topupLoading ? 0.6 : 1,
                                        cursor: topupLoading ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px'
                                    }}
                                >
                                    {topupLoading ? (
                                        <>
                                            <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard size={20} />
                                            Proceed to Pay
                                        </>
                                    )}
                                </button>

                                <div className={styles.securityNote}>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default WalletFinanceSystem;