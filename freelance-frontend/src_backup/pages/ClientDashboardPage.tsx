// src/pages/ClientDashboardPage.tsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './ClientDashboardPage.module.css';

interface DashboardMetrics {
    total_projects: number;
    open_projects: number;
    in_progress: number;
    completed: number;
    cancelled: number;
    overdue: number;
    avg_budget: number;
    total_spent: number;
    pending_payments: number;
    unread_messages: number;
    unread_notifications: number;
}

interface WalletInfo {
    balance: number;
    pending_balance: number;
    total_spent: number;
}

interface RecentActivity {
    project_id: string;
    title: string;
    status: string;
    tutor: string | null;
    created_at: string;
    deadline: string;
}

interface AttentionItem {
    type: 'no_bids' | 'pending_completion' | 'overdue';
    project_id: string;
    title: string;
    message: string;
}

interface DashboardData {
    metrics: DashboardMetrics;
    wallet: WalletInfo;
    recent_activity: RecentActivity[];
    needs_attention: AttentionItem[];
}

const ClientDashboardPage = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');

        if (!token || !storedUser) {
            navigate('/login');
            return;
        }

        try {
            const userData = JSON.parse(storedUser);
            if (userData.role !== 'client') {
                navigate('/');
                return;
            }
            setUser(userData);
        } catch (e) {
            localStorage.clear();
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        if (!user) return;

        const token = localStorage.getItem('access_token');
        if (!token) return;

        const fetchDashboard = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch('/api/client/dashboard/', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        localStorage.clear();
                        navigate('/login');
                        return;
                    }
                    throw new Error(`Dashboard fetch failed: ${response.statusText}`);
                }

                const dashboardData = await response.json();
                setData(dashboardData);
            } catch (err) {
                console.error('Dashboard error:', err);
                setError('Failed to load dashboard. Please refresh the page.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [user, navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return styles.statusCompleted;
            case 'IN_PROGRESS':
                return styles.statusInProgress;
            case 'OPEN':
                return styles.statusOpen;
            case 'CANCELLED':
                return styles.statusCancelled;
            default:
                return '';
        }
    };

    const getAttentionIcon = (type: string) => {
        switch (type) {
            case 'no_bids':
                return '⚠️';
            case 'pending_completion':
                return '✅';
            case 'overdue':
                return '🔴';
            default:
                return '📌';
        }
    };

    if (loading) {
        return (
            <div className={styles.dashboardWrapper}>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className={styles.dashboardWrapper}>
                <div className={styles.errorContainer}>
                    <p>{error || 'Failed to load dashboard'}</p>
                    <button onClick={() => window.location.reload()} className={styles.retryButton}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const { metrics, wallet, recent_activity, needs_attention } = data;

    return (
        <div className={styles.dashboardWrapper}>
            {/* Navigation Bar */}
            <nav className={styles.navbar}>
                <div className={styles.navContent}>
                    <Link to="/" className={styles.logo}>
                        Chapter4research.com
                    </Link>

                    <div className={styles.navLinks}>
                        <Link to="/client/post-project">Post Project</Link>
                        <Link to="/client/projects">My Projects</Link>
                        <Link to="/client/wallet">Wallet</Link>

                        <Link to="/messaging" className={styles.iconButton}>
                            <i className="material-icons">mail_outline</i>
                            {metrics.unread_messages > 0 && (
                                <span className={styles.badge}>{metrics.unread_messages}</span>
                            )}
                        </Link>

                        <Link to="/notifications" className={styles.iconButton}>
                            <i className="material-icons">notifications</i>
                            {metrics.unread_notifications > 0 && (
                                <span className={styles.badge}>{metrics.unread_notifications}</span>
                            )}
                        </Link>

                        <span className={styles.username}>{user?.username}</span>
                        <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className={styles.mainContent}>
                {/* Welcome Header */}
                <section className={styles.welcomeSection}>
                    <div className={styles.welcomeContent}>
                        <div>
                            <h1>Welcome back, {user?.first_name || user?.username}!</h1>
                            <p>Manage your projects and connect with expert tutors</p>
                        </div>
                        <Link to="/client/post-project">
                            <button className={styles.primaryButton}>
                                <span className="material-symbols-rounded">Post New Project</span>
                            </button>
                        </Link>
                    </div>
                </section>

                {/* Wallet & Stats Grid */}
                <section className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>WALLET BALANCE</div>
                        <div className={styles.statValue}>${wallet.balance.toFixed(2)}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>IN ESCROW</div>
                        <div className={styles.statValue}>${wallet.pending_balance.toFixed(2)}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>TOTAL SPENT</div>
                        <div className={styles.statValue}>${wallet.total_spent.toFixed(2)}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>ACTIVE PROJECTS</div>
                        <div className={styles.statValue}>{metrics.in_progress}</div>
                    </div>
                </section>

                {/* Project Metrics */}
                <section className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>TOTAL PROJECTS</div>
                        <div className={styles.statValue}>{metrics.total_projects}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>OPEN</div>
                        <div className={styles.statValue}>{metrics.open_projects}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>COMPLETED</div>
                        <div className={styles.statValue}>{metrics.completed}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>OVERDUE</div>
                        <div className={`${styles.statValue} ${metrics.overdue > 0 ? styles.overdueValue : ''}`}>
                            {metrics.overdue}
                        </div>
                    </div>
                </section>

                {/* Needs Attention */}
                {needs_attention.length > 0 && (
                    <section className={styles.attentionSection}>
                        <h2>Needs Your Attention</h2>
                        <div className={styles.attentionGrid}>
                            {needs_attention.map((item, idx) => (
                                <div key={idx} className={styles.attentionCard}>
                                    <div className={styles.attentionIcon}>
                                        {getAttentionIcon(item.type)}
                                    </div>
                                    <div className={styles.attentionContent}>
                                        <h3>{item.title}</h3>
                                        <p>{item.message}</p>
                                    </div>
                                    <Link to={`/client/projects/${item.project_id}`}>
                                        <button className={styles.actionButton}>View</button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Recent Projects */}
                <section className={styles.projectsSection}>
                    <div className={styles.sectionHeader}>
                        <h2>Recent Projects</h2>
                        <Link to="/client/projects" className={styles.viewAllLink}>
                            View All Projects →
                        </Link>
                    </div>

                    <div className={styles.projectsTable}>
                        <div className={styles.tableHeader}>
                            <div>Project Title</div>
                            <div>Created</div>
                            <div>Status</div>
                            <div>Action</div>
                        </div>

                        {recent_activity.length > 0 ? (
                            recent_activity.map((project) => (
                                <div key={project.project_id} className={styles.tableRow}>
                                    <div className={styles.projectInfo}>
                                        <div className={styles.projectTitle}>{project.title}</div>
                                        {project.tutor && (
                                            <div className={styles.projectMeta}>
                                                Tutor: {project.tutor}
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.projectDate}>
                                        {formatDate(project.created_at)}
                                    </div>
                                    <div className={styles.projectStatus}>
                                        <span className={`${styles.statusBadge} ${getStatusColor(project.status)}`}>
                                            {project.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className={styles.projectAction}>
                                        <Link to={`/client/projects/${project.project_id}`}>
                                            <button className={styles.viewButton}>View</button>
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={styles.emptyState}>
                                <p>No projects yet. Post your first project to get started!</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default ClientDashboardPage;