// TutorDashboardPage.tsx - PRODUCTION-READY (FIXED VERSION)
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './TutorDashboardPage.module.css';

// ============================================================
// TYPES
// ============================================================
interface User {
    user_id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    role: 'tutor';
    tutor_level: 'new' | 'junior' | 'senior' | 'advanced';
    profile_picture: string | null;
    hourly_rate: number;
    skills: string[];
    experience_years: number;
    is_available: boolean;
    is_email_verified: boolean;
    is_active: boolean;
}

interface Award {
    label: string;
    description: string;
}

interface Metrics {
    completionRate: number;
    responseRate: number;
    activeProjects: number;
    overdue: number;
    warnings: number;
    earnings: number;
    awaiting: number;
    score: number;
    feedbackCount: number;
    proficiencyTier: number;
    recentCompletions: number;
}

// ✅ NEW: Wallet data structure
interface WalletData {
    balance: number;
    pending_balance: number;
    total_earned: number;
}

// ============================================================
// COMPONENT
// ============================================================
const TutorDashboardPage = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [metrics, setMetrics] = useState<Metrics>({
        completionRate: 100,
        responseRate: 100,
        activeProjects: 0,
        overdue: 0,
        warnings: 0,
        earnings: 0,
        awaiting: 0,
        score: 5.0,
        feedbackCount: 0,
        proficiencyTier: 1,
        recentCompletions: 0,
    });
    const [awards, setAwards] = useState<Award[]>([]);
    const [alertsCount, setAlertsCount] = useState<number>(0);
    const [inboxCount, setInboxCount] = useState<number>(0);

    // ✅ NEW: Wallet state
    const [walletData, setWalletData] = useState<WalletData>({
        balance: 0,
        pending_balance: 0,
        total_earned: 0,
    });

    const navigate = useNavigate();
    const location = useLocation();
    const hasFetched = useRef(false);

    // ============================================================
    // ✅ FETCH FRESH USER DATA (with profile picture)
    // ============================================================
    const fetchUserData = useCallback(async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            const userId = storedUser.user_id;

            if (!userId) {
                throw new Error('User ID not found');
            }

            const res = await fetch(`/api/users/${userId}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                throw new Error('Failed to fetch user data');
            }

            const freshUserData = await res.json();

            // Update localStorage with fresh data
            localStorage.setItem('user', JSON.stringify(freshUserData));

            setUser(freshUserData);

            console.log('✅ User data refreshed:', freshUserData);

        } catch (err) {
            console.error('❌ Failed to fetch user data:', err);
        }
    }, []);

    // ============================================================
    // ✅ FETCH WALLET DATA (correct balance)
    // ============================================================
    const fetchWalletData = useCallback(async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            const res = await fetch('/api/wallets/my-wallet/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                throw new Error('Failed to fetch wallet data');
            }

            const data = await res.json();

            setWalletData({
                balance: parseFloat(data.balance),
                pending_balance: parseFloat(data.pending_balance),
                total_earned: parseFloat(data.total_earned),
            });

            console.log('✅ Wallet data fetched:', data);

        } catch (err) {
            console.error('❌ Failed to fetch wallet:', err);
        }
    }, []);

    // ============================================================
    // AUTH CHECK (runs once)
    // ============================================================
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');

        if (!token || !storedUser) {
            navigate('/login');
            return;
        }

        try {
            const userData = JSON.parse(storedUser) as User;
            if (userData.role !== 'tutor') {
                navigate('/');
                return;
            }
            setUser(userData);
        } catch (e) {
            localStorage.clear();
            navigate('/login');
        }
    }, [navigate]);

    // ============================================================
    // DASHBOARD FETCH (runs ONCE)
    // ============================================================
    const fetchDashboard = useCallback(async () => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const token = localStorage.getItem('access_token');
        if (!token) return;

        setLoading(true);

        try {
            // Fetch dashboard
            const res = await fetch('/api/tutor/dashboard/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                throw new Error(`Failed to load dashboard`);
            }

            const data = await res.json();

            setMetrics(data.metrics);
            setInboxCount(data.counts.unread_messages);
            setAlertsCount(data.counts.unread_notifications);
            setAwards(data.awards);

            // ✅ Fetch fresh user data (profile picture)
            await fetchUserData();

            // ✅ Fetch wallet data (correct balance)
            await fetchWalletData();

        } catch (err) {
            setError('Failed to load dashboard');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [fetchUserData, fetchWalletData]);

    useEffect(() => {
        if (user) {
            fetchDashboard();
        }
    }, [user, fetchDashboard]);

    // ============================================================
    // ✅ HELPER: Get Profile Picture URL
    // ============================================================
    const getProfilePictureUrl = () => {
        if (!user) return '/images/default-helper-profile.jpg';

        if (user.profile_picture) {
            // If it's already a full URL, use it
            if (user.profile_picture.startsWith('http')) {
                return user.profile_picture;
            }

            // ✅ FIX: Check if it's a preset avatar (frontend public folder)
            if (user.profile_picture.startsWith('/avatars/')) {
                // These are in React's public folder, not Django media
                return user.profile_picture;
            }

            // ✅ Otherwise, it's an uploaded file in Django's media folder
            return `${import.meta.env.VITE_API_URL.replace("/api", "")}${user.profile_picture}`;
        }

        // Default avatar
        return '/images/default-helper-profile.jpg';
    };

    // ============================================================
    // ✅ HELPER: Generate Avatar Initials
    // ============================================================
    const getAvatarInitials = () => {
        if (!user) return 'U';

        const firstInitial = user.first_name?.[0] || '';
        const lastInitial = user.last_name?.[0] || '';

        return (firstInitial + lastInitial).toUpperCase() || user.username?.[0]?.toUpperCase() || 'U';
    };

    // ============================================================
    // HANDLERS
    // ============================================================
    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // ============================================================
    // RENDER
    // ============================================================
    if (loading) {
        return (
            <div className={styles.dashboardWrapper}>
                <div className={styles.loadingOverlay}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.dashboardWrapper}>
                <div className={styles.errorMessage}>
                    {error}
                    <button onClick={() => window.location.reload()} className={styles.retryButton}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className={styles.dashboardWrapper}>
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
            <nav className={styles.sideNav}>
                <Link to="/tutor/dashboard" className={location.pathname === '/tutor/dashboard' ? styles.navActive : styles.navItem}>
                    <i className="material-icons">home</i> Overview
                </Link>
                <Link to="/tutor/my-projects" className={location.pathname === '/tutor/my-projects' ? styles.navActive : styles.navItem}>
                    <i className="material-icons">list</i> Project Catalogue
                </Link>
                <Link to="/tutor/performance/metrics" className={location.pathname === '/tutor/performance/metrics' ? styles.navActive : styles.navItem}>
                    <i className="material-icons">bar_chart</i> Performance Metrics
                </Link>
                <Link to="/tutor/calendar" className={location.pathname === '/tutor/calendar' ? styles.navActive : styles.navItem}>
                    <i className="material-icons">event</i> Calendar
                </Link>
                <Link to="/tutor/evaluation/reports" className={location.pathname === '/tutor/evaluation/reports' ? styles.navActive : styles.navItem}>
                    <i className="material-icons">mood</i> Evaluation Reports
                </Link>
            </nav>

            <div className={styles.mainContent}>
                <div className={styles.progressBar}>
                    <div className={styles.levelProgress}>
                        <div className={styles.levelStepActive}>
                            New <i className="material-icons" style={{ color: 'green' }}>check_circle</i>
                        </div>
                        <i className="material-icons">arrow_forward</i>
                        <div className={['junior', 'senior', 'advanced'].includes(user.tutor_level) ? styles.levelStepActive : styles.levelStepPending}>
                            Junior {['junior', 'senior', 'advanced'].includes(user.tutor_level) ?
                                <i className="material-icons" style={{ color: 'green' }}>check_circle</i> :
                                <i className="material-icons" style={{ color: 'gray' }}>hourglass_empty</i>}
                        </div>
                        <i className="material-icons">arrow_forward</i>
                        <div className={['senior', 'advanced'].includes(user.tutor_level) ? styles.levelStepActive : styles.levelStepPending}>
                            Senior {['senior', 'advanced'].includes(user.tutor_level) ?
                                <i className="material-icons" style={{ color: 'green' }}>check_circle</i> :
                                <i className="material-icons" style={{ color: 'gray' }}>hourglass_empty</i>}
                        </div>
                        <i className="material-icons">arrow_forward</i>
                        <div className={user.tutor_level === 'advanced' ? styles.levelStepActive : styles.levelStepPending}>
                            Advanced {user.tutor_level === 'advanced' ?
                                <i className="material-icons" style={{ color: 'green' }}>check_circle</i> :
                                <i className="material-icons" style={{ color: 'gray' }}>hourglass_empty</i>}
                        </div>
                    </div>
                    <div className={styles.achievementIcons}>
                        {awards.map((award, idx) => (
                            <span key={idx} title={award.description} className={styles.achievement}>
                                {award.label}
                            </span>
                        ))}
                        {awards.length > 0 && <i className="material-icons">more_horiz</i>}
                    </div>
                </div>

                <header className={styles.profileHeader}>
                    <div className={styles.helperProfile}>
                        {/* ✅ FIXED: Profile picture with fallback */}
                        <div className={styles.profilePictureWrapper}>
                            {user.profile_picture ? (
                                <img
                                    src={getProfilePictureUrl()}
                                    alt="Profile"
                                    className={styles.mainProfileImage}
                                    onError={(e) => {
                                        // Fallback to initials avatar if image fails
                                        console.log('❌ Image failed to load, using avatar');
                                        e.currentTarget.style.display = 'none';
                                        const parent = e.currentTarget.parentElement;
                                        if (parent) {
                                            const avatar = document.createElement('div');
                                            avatar.className = styles.avatarFallback;
                                            avatar.textContent = getAvatarInitials();
                                            parent.appendChild(avatar);
                                        }
                                    }}
                                />
                            ) : (
                                <div className={styles.avatarFallback}>
                                    {getAvatarInitials()}
                                </div>
                            )}
                        </div>

                        <div className={styles.profileInfo}>
                            <h1>{user.username}</h1>
                            <div className={styles.scoreDisplay}>
                                <div className={styles.stars}>
                                    {'★'.repeat(Math.floor(metrics.score))}
                                    {metrics.score % 1 !== 0 && '☆'}
                                    {'☆'.repeat(5 - Math.ceil(metrics.score))}
                                    <span className={styles.ratingValue}>{metrics.score.toFixed(1)}</span>
                                </div>
                                <div className={styles.reviewMeta}>
                                    Based on {metrics.feedbackCount} review{metrics.feedbackCount !== 1 && 's'}
                                </div>
                            </div>
                            <div className={styles.metricList}>
                                <div>Success Rate <i className="material-icons">data_usage</i> {metrics.completionRate}%</div>
                                <div>Replies <i className="material-icons">sms</i> {metrics.responseRate}%</div>
                                <div>In Progress <i className="material-icons">assignment</i> {metrics.activeProjects}</div>
                                <div>Warnings <i className="material-icons">warning</i> {metrics.warnings}</div>
                                <div>Overdue <i className="material-icons">access_time</i> {metrics.overdue}</div>
                            </div>
                        </div>
                    </div>
                </header>

                <section className={styles.quickActions}>
                    <div className={styles.actionPanel}>
                        <div className={styles.cardImage}>
                            <img src="/images/laptop-writing.jpg" alt="Available Projects" />
                        </div>
                        <h4 className={styles.primaryText}>Available Projects</h4>
                        <p>Take on student projects and earn</p>
                        <Link to="/tutor/projects"><button>View</button></Link>
                    </div>

                    <div className={styles.actionPanel}>
                        <div className={styles.cardImage}>
                            <img src="/images/delegate-icon.jpg" alt="Outsource" />
                        </div>
                        <h4 className={styles.secondaryText}>Outsource</h4>
                        <p>Delegate projects to other tutors</p>
                        <button>View</button>
                    </div>

                    <div className={styles.actionPanel}>
                        <div className={styles.cardImage}>
                            <img src="/images/finances-icon.jpg" alt="Finances" />
                        </div>
                        <h4 className={styles.successText}>Earnings Overview</h4>
                        <p>Track your payments and withdraw</p>
                        <p>${walletData.balance.toFixed(2)} | ${walletData.pending_balance.toFixed(2)} pending</p>
                        <Link to="/tutor/wallet"><button>View</button></Link>
                    </div>
                </section>


                <footer className={styles.bottomSection}>
                    <p>© 2025 MyHomeworkHelper</p>
                </footer>
            </div>
        </div>
    );
};

export default TutorDashboardPage;