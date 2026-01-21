import { useEffect, useState } from 'react';
import { apiClient } from '../utils/apiClient';
import { Link, useNavigate } from 'react-router-dom';
import styles from './PerformanceMetricsPage.module.css';

interface MonthlyData {
    month: string;
    successRate: number;
    earnings: number;
    refunds: number;
    projectsCompleted: number;
}

interface User {
    user_id: string;
    username: string;
    role: 'tutor';
    first_name?: string;
    last_name?: string;
    profile_picture?: string | null;
}

const PerformanceMetricsPage = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [inboxCount, setInboxCount] = useState(0);
    const [alertsCount, setAlertsCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');
        if (!token || !storedUser) {
            navigate('/login');
            return;
        }
        try {
            const u = JSON.parse(storedUser);
            if (u.role !== 'tutor') {
                navigate('/');
                return;
            }
            setUser(u);
        } catch {
            localStorage.clear();
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        if (!user) return;
        const token = localStorage.getItem('access_token');

        const fetchData = async () => {
            try {
                const [projectsRes, paymentsRes, conversationsRes, notificationsRes] = await Promise.all([
                    apiClient.get('/projects/?tutor=' + user.user_id, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    apiClient.get('/payments/?tutor=' + user.user_id, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    apiClient.get('/conversations/?tutor=' + user.user_id, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    apiClient.get('/notifications/', {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                ]);

                if (!projectsRes.ok) throw new Error('Failed to fetch projects');
                if (!paymentsRes.ok) throw new Error('Failed to fetch payments');

                const [projectsData, paymentsData, convData, notifData] = await Promise.all([
                    projectsRes.json(),
                    paymentsRes.json(),
                    conversationsRes.ok ? conversationsRes.json() : { results: [] },
                    notificationsRes.ok ? notificationsRes.json() : { results: [] }
                ]);

                const projects = projectsData.results || [];
                const payments = paymentsData.results || [];

                const monthlyMetrics: { [key: string]: MonthlyData } = {};
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

                const now = new Date();
                for (let i = 5; i >= 0; i--) {
                    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    const monthKey = months[date.getMonth()];
                    monthlyMetrics[monthKey] = {
                        month: monthKey,
                        successRate: 100,
                        earnings: 0,
                        refunds: 0,
                        projectsCompleted: 0
                    };
                }

                projects.forEach((p: any) => {
                    const deadline = new Date(p.deadline);
                    const monthKey = months[deadline.getMonth()];
                    if (monthlyMetrics[monthKey]) {
                        if (p.status === 'COMPLETED') {
                            monthlyMetrics[monthKey].projectsCompleted++;
                        }
                    }
                });

                payments.forEach((p: any) => {
                    const date = new Date(p.created_at || p.payment_date);
                    const monthKey = months[date.getMonth()];
                    if (monthlyMetrics[monthKey]) {
                        if (p.status === 'COMPLETED') {
                            monthlyMetrics[monthKey].earnings += Number(p.amount);
                        } else if (p.status === 'REFUNDED') {
                            monthlyMetrics[monthKey].refunds += Number(p.amount);
                        }
                    }
                });

                Object.keys(monthlyMetrics).forEach(month => {
                    const total = monthlyMetrics[month].projectsCompleted;
                    const refunded = monthlyMetrics[month].refunds > 0 ? 1 : 0;
                    if (total > 0) {
                        monthlyMetrics[month].successRate = Math.round(((total - refunded) / total) * 100);
                    }
                });

                setMonthlyData(Object.values(monthlyMetrics));

                if (convData.results) {
                    const unread = (convData.results || []).reduce(
                        (sum: number, conv: any) => sum + (conv.unread_count || 0),
                        0
                    );
                    setInboxCount(unread);
                }

                if (notifData.results) {
                    const unread = Array.isArray(notifData.results)
                        ? notifData.results.filter((n: any) => !n.read).length
                        : notifData.unread_count || 0;
                    setAlertsCount(unread);
                }
            } catch (err) {
                setError('Failed to load metrics');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const getProfilePictureUrl = () => {
        if (!user) return '/images/default-helper-profile.jpg';
        if (user.profile_picture) {
            if (user.profile_picture.startsWith('http')) {
                return user.profile_picture;
            }
            if (user.profile_picture.startsWith('/avatars/')) {
                return user.profile_picture;
            }
            return `${import.meta.env.VITE_API_URL.replace("/api", "")}${user.profile_picture}`;
        }
        return '/images/default-helper-profile.jpg';
    };

    const getAvatarInitials = () => {
        if (!user) return 'U';
        const firstInitial = user.first_name?.[0] || '';
        const lastInitial = user.last_name?.[0] || '';
        return (firstInitial + lastInitial).toUpperCase() || user.username?.[0]?.toUpperCase() || 'U';
    };

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Loading metrics...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.page}>
                <div className={styles.errorContainer}>
                    <i className="material-icons" style={{ fontSize: '48px', color: '#dc2626' }}>error_outline</i>
                    <h2>Error Loading Metrics</h2>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const maxEarnings = Math.max(...monthlyData.map(d => d.earnings), 1);
    const totalEarnings = monthlyData.reduce((sum, d) => sum + d.earnings, 0);
    const totalProjects = monthlyData.reduce((sum, d) => sum + d.projectsCompleted, 0);
    const avgSuccessRate = Math.round(monthlyData.reduce((sum, d) => sum + d.successRate, 0) / monthlyData.length);
    const totalRefunds = monthlyData.reduce((sum, d) => sum + d.refunds, 0);

    return (
        <div className={styles.page}>
            <nav className={styles.topBar}>
                <div className={styles.barContent}>
                    <Link to="/" className={styles.brandLogo}>
                        <img src="/images/helper-brand-logo.jpg" alt="MyHomeworkHelper" />
                    </Link>
                    <div className={styles.menuItems}>
                        <Link to="/income/boost">Income Boost</Link>
                        <Link to="/tutor/projects">Browse Projects</Link>
                        <Link to="/tutor/wallet">Balance</Link>
                    </div>
                    <div className={styles.iconGroup}>
                        <Link to="/messaging" className={styles.iconButton}>
                            <i className="material-icons">mail_outline</i>
                            {inboxCount > 0 && <span className={styles.alertBadge}>{inboxCount}</span>}
                        </Link>
                        <Link to="/notifications" className={styles.iconButton}>
                            <i className="material-icons">notifications</i>
                            {alertsCount > 0 && <span className={styles.alertBadge}>{alertsCount}</span>}
                        </Link>
                        <Link to="/knowledge-base" className={styles.iconButton}>
                            <i className="material-icons">account_balance</i>
                        </Link>
                    </div>
                    <div className={styles.profileSection}>
                        <Link to="/tutor/profile" className={styles.profileAvatar}>
                            {user.profile_picture ? (
                                <img src={getProfilePictureUrl()} alt="Profile" />
                            ) : (
                                <div className={styles.avatarInitials}>{getAvatarInitials()}</div>
                            )}
                        </Link>
                        <div className={styles.profileDetails}>
                            <Link to="/tutor/profile" className={styles.profileName}>{user.username}</Link>
                            <button onClick={handleLogout} className={styles.logoutButton}>
                                <i className="material-icons">logout</i>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <h1>Performance Metrics</h1>
                        <p className={styles.subtitle}>Track your success and earnings over time</p>
                    </div>
                    <button onClick={() => navigate('/tutor/dashboard')} className={styles.backBtn}>
                        <i className="material-icons">arrow_back</i>
                        Back to Dashboard
                    </button>
                </div>

                <section className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                            <i className="material-icons">trending_up</i>
                        </div>
                        <div className={styles.statContent}>
                            <h3>Total Earnings</h3>
                            <p className={styles.statValue}>${totalEarnings.toFixed(2)}</p>
                            <span className={styles.statChange}>
                                <i className="material-icons">arrow_upward</i>
                                Last 6 months
                            </span>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                            <i className="material-icons">check_circle</i>
                        </div>
                        <div className={styles.statContent}>
                            <h3>Projects Completed</h3>
                            <p className={styles.statValue}>{totalProjects}</p>
                            <span className={styles.statChange}>
                                <i className="material-icons">done_all</i>
                                Successfully delivered
                            </span>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                            <i className="material-icons">star</i>
                        </div>
                        <div className={styles.statContent}>
                            <h3>Avg Success Rate</h3>
                            <p className={styles.statValue}>{avgSuccessRate}%</p>
                            <span className={styles.statChange}>
                                <i className="material-icons">trending_up</i>
                                Excellent performance
                            </span>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                            <i className="material-icons">trending_down</i>
                        </div>
                        <div className={styles.statContent}>
                            <h3>Total Refunds</h3>
                            <p className={styles.statValue}>${totalRefunds.toFixed(2)}</p>
                            <span className={styles.statChange}>
                                <i className="material-icons">info</i>
                                Keep improving
                            </span>
                        </div>
                    </div>
                </section>

                <section className={styles.chartSection}>
                    <div className={styles.chartHeader}>
                        <div>
                            <h2>Success Rate Trend</h2>
                            <p className={styles.chartSubtitle}>Your completion rate over the last 6 months</p>
                        </div>
                        <div className={styles.chartLegend}>
                            <span className={styles.legendDot} style={{ background: '#667eea' }}></span>
                            <span>Success Rate</span>
                        </div>
                    </div>
                    <div className={styles.barChart}>
                        {monthlyData.map((d) => (
                            <div key={d.month} className={styles.barContainer}>
                                <div className={styles.barWrapper}>
                                    <div
                                        className={styles.bar}
                                        style={{
                                            height: `${d.successRate}%`,
                                            background: `linear-gradient(180deg, ${d.successRate >= 90 ? '#10b981' : d.successRate >= 70 ? '#3b82f6' : '#f59e0b'} 0%, ${d.successRate >= 90 ? '#059669' : d.successRate >= 70 ? '#2563eb' : '#d97706'} 100%)`
                                        }}
                                        title={`${d.successRate}%`}
                                    >
                                        <span className={styles.barValue}>{d.successRate}%</span>
                                    </div>
                                </div>
                                <span className={styles.barLabel}>{d.month}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className={styles.chartSection}>
                    <div className={styles.chartHeader}>
                        <div>
                            <h2>Earnings vs Refunds</h2>
                            <p className={styles.chartSubtitle}>Financial performance comparison</p>
                        </div>
                        <div className={styles.chartLegend}>
                            <div>
                                <span className={styles.legendDot} style={{ background: '#10b981' }}></span>
                                <span>Earnings</span>
                            </div>
                            <div>
                                <span className={styles.legendDot} style={{ background: '#ef4444' }}></span>
                                <span>Refunds</span>
                            </div>
                        </div>
                    </div>
                    <div className={styles.lineChart}>
                        <div className={styles.yAxis}>
                            <span>${Math.round(maxEarnings)}</span>
                            <span>${Math.round(maxEarnings / 2)}</span>
                            <span>$0</span>
                        </div>
                        <div className={styles.chartArea}>
                            {monthlyData.map((d) => (
                                <div key={d.month} className={styles.dataPoint}>
                                    <div className={styles.barGroup}>
                                        <div
                                            className={styles.earningsBar}
                                            style={{ height: `${Math.max((d.earnings / maxEarnings) * 100, 2)}%` }}
                                            title={`Earnings: ${d.earnings.toFixed(2)}`}
                                        >
                                            {d.earnings > 0 && <span className={styles.barTooltip}>${d.earnings.toFixed(0)}</span>}
                                        </div>
                                        <div
                                            className={styles.refundsBar}
                                            style={{ height: `${Math.max((d.refunds / maxEarnings) * 100, 2)}%` }}
                                            title={`Refunds: ${d.refunds.toFixed(2)}`}
                                        >
                                            {d.refunds > 0 && <span className={styles.barTooltip}>${d.refunds.toFixed(0)}</span>}
                                        </div>
                                    </div>
                                    <span className={styles.xLabel}>{d.month}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default PerformanceMetricsPage;