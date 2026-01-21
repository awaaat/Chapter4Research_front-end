// NotificationsPage.tsx - FIXED VERSION
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../utils/apiClient';
import styles from './NotificationsPage.module.css';

interface Notification {
    id: string;
    type: string;
    message: string;
    link?: string;
    read: boolean;
    created_at: string;
}

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [inboxCount, setInboxCount] = useState(0);
    const [alertsCount, setAlertsCount] = useState(0);
    const navigate = useNavigate();

    // Track processed notification IDs to prevent duplicates
    const processedIds = useRef(new Set<string>());
    const wsRef = useRef<WebSocket | null>(null);
    const hasFetched = useRef(false);

    // Auth check
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');
        if (!token || !storedUser) {
            navigate('/login');
            return;
        }
        try {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
        } catch {
            localStorage.clear();
            navigate('/login');
        }
    }, [navigate]);

    // Fetch notifications and message counts
    const fetchData = useCallback(async () => {
        if (hasFetched.current || !user) return;
        hasFetched.current = true;

        try {
            const [notifRes, convRes] = await Promise.all([
                apiClient.get('/notifications/'),
                apiClient.get('/conversations/')
            ]);

            if (!notifRes.ok) throw new Error('Failed to load notifications');
            const notifData = await notifRes.json();

            const fetchedNotifications = notifData.results || [];
            setNotifications(fetchedNotifications);

            // Initialize processed IDs with fetched notifications
            fetchedNotifications.forEach((n: Notification) => {
                processedIds.current.add(n.id);
            });

            // Update alerts count
            const unread = fetchedNotifications.filter((n: Notification) => !n.read).length;
            setAlertsCount(unread);

            // Count unread messages
            if (convRes.ok) {
                const convData = await convRes.json();
                const unreadMessages = (convData.results || []).reduce((sum: number, conv: any) =>
                    sum + (conv.unread_count || 0), 0
                );
                setInboxCount(unreadMessages);
            }
        } catch (err: any) {
            console.error('❌ Fetch error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user, fetchData]);

    // WebSocket setup
    useEffect(() => {
        if (!user) return;

        const token = localStorage.getItem('access_token');
        if (!token) return;

        // Close existing WebSocket if any
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        // WebSocket for real-time notifications
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const socket = new WebSocket(`${wsProtocol}//${window.location.host}/ws/notifications/?token=${token}`);
        wsRef.current = socket;

        socket.onopen = () => console.log('✅ Notifications WS connected');

        socket.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                if (data.notification) {
                    const notificationId = data.notification.id;

                    // Check if already processed
                    if (processedIds.current.has(notificationId)) {
                        console.log('Duplicate notification blocked:', notificationId);
                        return;
                    }

                    // Mark as processed
                    processedIds.current.add(notificationId);

                    // Add to state
                    setNotifications((prev) => {
                        const exists = prev.some(n => n.id === notificationId);
                        if (exists) {
                            console.log('Duplicate notification blocked (in array):', notificationId);
                            return prev;
                        }
                        return [data.notification, ...prev];
                    });

                    // Increment unread count only for new unread notifications
                    if (!data.notification.read) {
                        setAlertsCount(prev => prev + 1);
                    }
                }
            } catch (err) {
                console.error('Error processing WebSocket message:', err);
            }
        };

        socket.onclose = () => console.log('Notifications WS closed');
        socket.onerror = (err) => console.error('Notifications WS error:', err);

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [user]);

    const markAsRead = async (id: string, link?: string) => {
        try {
            const res = await apiClient.patch(`/notifications/${id}/`, {
                read: true
            });

            if (res.ok) {
                setNotifications((prev) =>
                    prev.map((n) => (n.id === id ? { ...n, read: true } : n))
                );
                setAlertsCount(prev => Math.max(0, prev - 1));
                if (link) navigate(link);
            }
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const markAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id);

        if (unreadIds.length === 0) return;

        try {
            await Promise.all(
                unreadIds.map(id =>
                    apiClient.patch(`/notifications/${id}/`, {
                        read: true
                    })
                )
            );
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setAlertsCount(0);
        } catch (err) {
            console.error('Error marking all as read:', err);
        }
    };

    const deleteNotification = async (id: string) => {
        const notif = notifications.find(n => n.id === id);
        try {
            const res = await apiClient.delete(`/notifications/${id}/`);
            if (res.ok) {
                setNotifications(prev => prev.filter(n => n.id !== id));
                processedIds.current.delete(id);
                if (notif && !notif.read) {
                    setAlertsCount(prev => Math.max(0, prev - 1));
                }
            }
        } catch (err) {
            console.error('Error deleting notification:', err);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.read)
        : notifications;

    const unreadCount = notifications.filter(n => !n.read).length;

    const getNotificationIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'new_project':
            case 'project_update':
                return '📋';
            case 'bid_accepted':
            case 'bid_received':
            case 'bid':
                return '💰';
            case 'message':
                return '💬';
            case 'payment':
                return '💳';
            case 'review':
                return '⭐';
            case 'warning':
                return '⚠️';
            default:
                return '🔔';
        }
    };

    if (loading) {
        return (
            <div className={styles.page}>
                <nav className={styles.topBar}>
                    <div className={styles.barContent}>
                        <Link to="/" className={styles.brandLogo}>
                            <img src="/images/helper-brand-logo.jpg" alt="MyHomeworkHelper" />
                        </Link>
                        <div className={styles.menuItems}>
                            <Link to="/income/boost">Income Boost</Link>
                            <Link to={user?.role === 'tutor' ? '/tutor/projects' : '/client/dashboard'}>
                                {user?.role === 'tutor' ? 'Browse Projects' : 'Dashboard'}
                            </Link>
                        </div>
                        <div className={styles.iconGroup}>
                            <Link to="/messaging">
                                <i className="material-icons">mail_outline</i>
                                {inboxCount > 0 && <span className={styles.alertBadge}>{inboxCount}</span>}
                            </Link>
                            <Link to="/notifications" className={styles.activeIcon}>
                                <i className="material-icons">notifications</i>
                                {alertsCount > 0 && <span className={styles.alertBadge}>{alertsCount}</span>}
                            </Link>
                            <Link to="/knowledge-base">
                                <i className="material-icons">account_balance</i>
                            </Link>
                        </div>
                        <div className={styles.profileSection}>
                            <Link to={user?.role === 'tutor' ? '/tutor/profile' : '/client/profile'} className={styles.profileLink}>
                                Profile
                            </Link>
                            <span>{user?.username}</span>
                            <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
                        </div>
                    </div>
                </nav>
                <div className={styles.container}>
                    <div className={styles.loading}>
                        <div className={styles.spinner}></div>
                        <p>Loading notifications...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.page}>
                <div className={styles.container}>
                    <div className={styles.error}>
                        <h2>Error Loading Notifications</h2>
                        <p>{error}</p>
                        <button onClick={() => window.location.reload()}>Retry</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <nav className={styles.topBar}>
                <div className={styles.barContent}>
                    <Link to="/" className={styles.brandLogo}>
                        <img src="/images/helper-brand-logo.jpg" alt="MyHomeworkHelper" />
                    </Link>
                    <div className={styles.menuItems}>
                        <Link to="/income/boost">Income Boost</Link>
                        <Link to={user?.role === 'tutor' ? '/tutor/projects' : '/client/dashboard'}>
                            {user?.role === 'tutor' ? 'Browse Projects' : 'Dashboard'}
                        </Link>
                    </div>
                    <div className={styles.iconGroup}>
                        <Link to="/messaging">
                            <i className="material-icons">mail_outline</i>
                            {inboxCount > 0 && <span className={styles.alertBadge}>{inboxCount}</span>}
                        </Link>
                        <Link to="/notifications" className={styles.activeIcon}>
                            <i className="material-icons">notifications</i>
                            {alertsCount > 0 && <span className={styles.alertBadge}>{alertsCount}</span>}
                        </Link>
                        <Link to="/knowledge-base">
                            <i className="material-icons">account_balance</i>
                        </Link>
                    </div>
                    <div className={styles.profileSection}>
                        <Link to={user?.role === 'tutor' ? '/tutor/profile' : '/client/profile'} className={styles.profileLink}>
                            Profile
                        </Link>
                        <span>{user?.username}</span>
                        <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
                    </div>
                </div>
            </nav>

            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <h1>Notifications</h1>
                        {unreadCount > 0 && (
                            <span className={styles.unreadBadge}>{unreadCount} unread</span>
                        )}
                    </div>
                    <div className={styles.headerRight}>
                        <button
                            onClick={() => setFilter('all')}
                            className={filter === 'all' ? styles.filterActive : styles.filterBtn}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={filter === 'unread' ? styles.filterActive : styles.filterBtn}
                        >
                            Unread
                        </button>
                        {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className={styles.markAllBtn}>
                                Mark All Read
                            </button>
                        )}
                        <button onClick={() => navigate(-1)} className={styles.backBtn}>
                            Back
                        </button>
                    </div>
                </div>

                <div className={styles.list}>
                    {filteredNotifications.length === 0 ? (
                        <div className={styles.empty}>
                            <div className={styles.emptyIcon}>🔔</div>
                            <h2>No {filter === 'unread' ? 'unread ' : ''}notifications</h2>
                            <p>
                                {filter === 'unread'
                                    ? "You're all caught up! Check back later for new updates."
                                    : "You don't have any notifications yet."}
                            </p>
                        </div>
                    ) : (
                        filteredNotifications.map((notif) => (
                            <div
                                key={notif.id}
                                className={`${styles.item} ${notif.read ? styles.read : styles.unread}`}
                            >
                                <div className={styles.itemIcon}>
                                    {getNotificationIcon(notif.type)}
                                </div>
                                <div
                                    className={styles.itemContent}
                                    onClick={() => markAsRead(notif.id, notif.link)}
                                    style={{ cursor: notif.link ? 'pointer' : 'default' }}
                                >
                                    <div className={styles.itemHeader}>
                                        <span className={styles.itemType}>
                                            {notif.type.replace(/_/g, ' ').toUpperCase()}
                                        </span>
                                        <span className={styles.itemTime}>
                                            {formatTimeAgo(notif.created_at)}
                                        </span>
                                    </div>
                                    <p className={styles.itemMessage}>{notif.message}</p>
                                    {notif.link && (
                                        <span className={styles.itemLink}>
                                            View Details →
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNotification(notif.id);
                                    }}
                                    className={styles.deleteBtn}
                                    title="Delete notification"
                                >
                                    ×
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

function formatTimeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
}

export default NotificationsPage;