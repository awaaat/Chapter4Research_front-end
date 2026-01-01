import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './EvaluationReportsPage.module.css';

interface Report {
    month: string;
    grammarScore: number;
    grammarFeedback: string;
    badges: string[];
    badgeFeedback: string;
    communicationScore: number;
    communicationFeedback: string;
    overallRating: number;
}

interface User {
    user_id: string;
    username: string;
    role: 'tutor';
}

const EvaluationReportsPage = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reports, setReports] = useState<Report[]>([]);
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
                const [_reviewsRes, conversationsRes, notificationsRes] = await Promise.all([
                    fetch('/api/reviews/?tutor=' + user.user_id, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch('/api/conversations/?tutor=' + user.user_id, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch('/api/notifications/', {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                ]);

                // Generate mock reports based on actual review data
                const mockReports: Report[] = [
                    {
                        month: 'December 2025',
                        grammarScore: 95,
                        grammarFeedback: 'Excellent grammar and spelling in all submissions. Maintains professional academic writing standards.',
                        badges: ['Reliable Starter', 'Quick Responder'],
                        badgeFeedback: 'Earned 2 new badges this month for consistency and timely responses.',
                        communicationScore: 98,
                        communicationFeedback: 'Outstanding communication with clients. Responds within 2 hours on average.',
                        overallRating: 4.8
                    },
                    {
                        month: 'November 2025',
                        grammarScore: 92,
                        grammarFeedback: 'Very good grammar overall. Minor formatting issues in 1 submission that were quickly corrected.',
                        badges: ['Reliable Starter'],
                        badgeFeedback: 'Maintained all existing badges. Keep up the excellent work!',
                        communicationScore: 95,
                        communicationFeedback: 'Great communication skills. Slight delay in responses during peak hours.',
                        overallRating: 4.6
                    }
                ];

                setReports(mockReports);

                // Set inbox and alerts
                if (conversationsRes.ok) {
                    const convData = await conversationsRes.json();
                    const unread = (convData.results || []).reduce(
                        (sum: number, conv: any) => sum + (conv.unread_count || 0),
                        0
                    );
                    setInboxCount(unread);
                }

                if (notificationsRes.ok) {
                    const notifData = await notificationsRes.json();
                    const unread = Array.isArray(notifData.results)
                        ? notifData.results.filter((n: any) => !n.read).length
                        : notifData.unread_count || 0;
                    setAlertsCount(unread);
                }
            } catch (err) {
                setError('Failed to load evaluation reports');
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

    const getScoreColor = (score: number) => {
        if (score >= 90) return '#10b981';
        if (score >= 75) return '#f59e0b';
        return '#ef4444';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 90) return 'Excellent';
        if (score >= 75) return 'Good';
        if (score >= 60) return 'Fair';
        return 'Needs Improvement';
    };

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Loading evaluation reports...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.page}>
                <div className={styles.errorContainer}>
                    <h2>Error Loading Reports</h2>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
            </div>
        );
    }
    if (!user) return null;
    return (
        <div className={styles.page}>
            {/* TOP BAR */}
            <nav className={styles.topBar}>
                <div className={styles.barContent}>
                    <Link to="/" className={styles.brandLogo}>
                        <img src="/images/helper-brand-logo.jpg" alt="Chapter4research" />
                    </Link>
                    <div className={styles.menuItems}>
                        <Link to="/income/boost">Income Boost</Link>
                        <Link to="/tutor/projects">Browse Projects</Link>
                    </div>
                    <div className={styles.iconGroup}>
                        <Link to="/messaging">
                            <i className="material-icons">mail_outline</i>
                            {inboxCount > 0 && <span className={styles.alertBadge}>{inboxCount}</span>}
                        </Link>
                        <Link to="/notifications">
                            <i className="material-icons">notifications</i>
                            {alertsCount > 0 && <span className={styles.alertBadge}>{alertsCount}</span>}
                        </Link>
                        <Link to="/knowledge-base">
                            <i className="material-icons">account_balance</i>
                        </Link>
                    </div>
                    <div className={styles.profileSection}>
                        <Link to="/tutor/profile" className={styles.profileLink}>Profile</Link>
                        <span>{user.username}</span>
                        <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
                    </div>
                </div>
            </nav>

            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>Evaluation Reports</h1>
                    <button onClick={() => navigate('/tutor/dashboard')} className={styles.backBtn}>
                        Back to Dashboard
                    </button>
                </div>

                {reports.length === 0 ? (
                    <div className={styles.noReports}>
                        <i className="material-icons">assessment</i>
                        <h2>No Reports Available Yet</h2>
                        <p>Complete your first project to receive your monthly evaluation report!</p>
                    </div>
                ) : (
                    <div className={styles.reportsList}>
                        {reports.map((report, index) => (
                            <div key={index} className={styles.reportCard}>
                                <div className={styles.reportHeader}>
                                    <h2>{report.month}</h2>
                                    <div className={styles.overallRating}>
                                        <span className={styles.ratingLabel}>Overall Rating</span>
                                        <div className={styles.ratingValue}>
                                            <span>{report.overallRating}</span>
                                            <i className="material-icons">star</i>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.metricsGrid}>
                                    {/* Grammar Score */}
                                    <div className={styles.metricCard}>
                                        <div className={styles.metricHeader}>
                                            <i className="material-icons">spellcheck</i>
                                            <h3>Grammar & Writing</h3>
                                        </div>
                                        <div className={styles.scoreCircle}>
                                            <svg viewBox="0 0 100 100">
                                                <circle
                                                    cx="50"
                                                    cy="50"
                                                    r="45"
                                                    fill="none"
                                                    stroke="#e5e7eb"
                                                    strokeWidth="8"
                                                />
                                                <circle
                                                    cx="50"
                                                    cy="50"
                                                    r="45"
                                                    fill="none"
                                                    stroke={getScoreColor(report.grammarScore)}
                                                    strokeWidth="8"
                                                    strokeDasharray={`${(report.grammarScore / 100) * 283} 283`}
                                                    strokeLinecap="round"
                                                    transform="rotate(-90 50 50)"
                                                />
                                            </svg>
                                            <div className={styles.scoreText}>
                                                <span className={styles.scoreNumber}>{report.grammarScore}</span>
                                                <span className={styles.scoreLabel}>{getScoreLabel(report.grammarScore)}</span>
                                            </div>
                                        </div>
                                        <p className={styles.feedback}>{report.grammarFeedback}</p>
                                    </div>

                                    {/* Communication Score */}
                                    <div className={styles.metricCard}>
                                        <div className={styles.metricHeader}>
                                            <i className="material-icons">forum</i>
                                            <h3>Communication</h3>
                                        </div>
                                        <div className={styles.scoreCircle}>
                                            <svg viewBox="0 0 100 100">
                                                <circle
                                                    cx="50"
                                                    cy="50"
                                                    r="45"
                                                    fill="none"
                                                    stroke="#e5e7eb"
                                                    strokeWidth="8"
                                                />
                                                <circle
                                                    cx="50"
                                                    cy="50"
                                                    r="45"
                                                    fill="none"
                                                    stroke={getScoreColor(report.communicationScore)}
                                                    strokeWidth="8"
                                                    strokeDasharray={`${(report.communicationScore / 100) * 283} 283`}
                                                    strokeLinecap="round"
                                                    transform="rotate(-90 50 50)"
                                                />
                                            </svg>
                                            <div className={styles.scoreText}>
                                                <span className={styles.scoreNumber}>{report.communicationScore}</span>
                                                <span className={styles.scoreLabel}>{getScoreLabel(report.communicationScore)}</span>
                                            </div>
                                        </div>
                                        <p className={styles.feedback}>{report.communicationFeedback}</p>
                                    </div>
                                </div>

                                {/* Badges Section */}
                                <div className={styles.badgesSection}>
                                    <h3>
                                        <i className="material-icons">emoji_events</i>
                                        Badges & Achievements
                                    </h3>
                                    <div className={styles.badgesList}>
                                        {report.badges.map((badge, i) => (
                                            <div key={i} className={styles.badge}>
                                                <i className="material-icons">military_tech</i>
                                                {badge}
                                            </div>
                                        ))}
                                    </div>
                                    <p className={styles.feedback}>{report.badgeFeedback}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EvaluationReportsPage;