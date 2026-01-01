// BrowseProjectsPage.tsx - FIXED (Using localStorage like rest of app)
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './BrowseProjectsPage.module.css';

interface Project {
    project_id: string;
    title: string;
    description: string;
    budget: number;
    deadline: string;
    status: string;
    client_username: string;
    created_at: string;
    skills_required: string[];
    category?: string;
    amount_of_work: number;
}

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

// ✅ FIXED: Proper validation
const getAPIBase = (): string => {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) {
        throw new Error(
            'VITE_API_URL is not defined. Check your .env file:\n' +
            'VITE_API_URL=/api'
        );
    }
    return apiUrl;
};

const getWSBase = (): string => {
    const wsUrl = import.meta.env.VITE_WS_URL;
    if (!wsUrl) {
        console.warn('VITE_WS_URL not defined, using production default');
        return 'wss://chapter4research.com/ws';
    }
    return wsUrl;
};

const API_BASE = getAPIBase();
const WS_BASE = getWSBase();

const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

const BrowseProjectsPage = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 200);
    const [categorySearch, setCategorySearch] = useState('');
    const debouncedCategory = useDebounce(categorySearch, 500);
    const [sortBy, setSortBy] = useState<'budget' | 'deadline' | 'created_at'>('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [viewedProjects, setViewedProjects] = useState<string[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [inboxCount, setInboxCount] = useState(0);
    const [alertsCount, setAlertsCount] = useState(0);

    const navigate = useNavigate();
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<number | null>(null);

    // ✅ FIXED: Use localStorage (like rest of app)
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

            const key = `viewed_projects_${userData.user_id}`;
            const stored = localStorage.getItem(key);
            if (stored) setViewedProjects(JSON.parse(stored));
        } catch {
            localStorage.clear();
            navigate('/login');
        }
    }, [navigate]);

    // Fetch counts
    useEffect(() => {
        if (!user) return;

        const loadCounts = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            try {
                const [convRes, notifRes] = await Promise.all([
                    fetch(`${API_BASE}/conversations/`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    fetch(`${API_BASE}/notifications/`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                if (convRes.ok) {
                    const d = await convRes.json();
                    const unreadCount = Array.isArray(d)
                        ? d.reduce((sum, conv) => sum + (conv.unread_count || 0), 0)
                        : 0;
                    setInboxCount(unreadCount);
                }

                if (notifRes.ok) {
                    const d = await notifRes.json();
                    setAlertsCount(d.unread_count || 0);
                }
            } catch (e) {
                console.error('Failed to load counts:', e);
            }
        };

        loadCounts();
        const interval = setInterval(loadCounts, 30000);
        return () => clearInterval(interval);
    }, [user]);

    // Fetch projects
    const fetchProjects = useCallback(async (pageNum: number, append = false) => {
        const token = localStorage.getItem('access_token');
        if (!token || !user) return;

        try {
            let url = `${API_BASE}/projects/?status=OPEN&page=${pageNum}`;
            if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`;
            if (debouncedCategory) url += `&category=${encodeURIComponent(debouncedCategory)}`;
            url += `&ordering=${sortOrder === 'desc' ? '-' : ''}${sortBy}`;

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error('Failed to fetch projects');

            const data = await res.json();
            const newProjects: Project[] =
                (Array.isArray(data) ? data :
                    data.results ?? data.data ?? data.projects ?? [])
                    .map((p: Project) => ({ ...p, category: p.category || 'General' }));

            if (append) {
                setProjects(prev => [...prev, ...newProjects]);
            } else {
                setProjects(newProjects);
                setTotalCount(data.count || newProjects.length);
            }

            const nextUrl = data.next || data.links?.next;
            setHasNext(!!nextUrl);
        } catch (err) {
            setError('Failed to load projects');
            console.error(err);
        } finally {
            setLoading(false);
            setIsLoadingMore(false);
        }
    }, [user, debouncedSearch, debouncedCategory, sortBy, sortOrder]);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        setPage(1);
        fetchProjects(1, false);
    }, [user, debouncedSearch, debouncedCategory, sortBy, sortOrder, fetchProjects]);

    // Filtering
    useEffect(() => {
        const lowerSearch = debouncedSearch.toLowerCase();
        const lowerCategory = debouncedCategory.toLowerCase();
        setFilteredProjects(
            projects.filter(project => {
                const matchesSearch =
                    !debouncedSearch ||
                    project.title.toLowerCase().includes(lowerSearch) ||
                    project.description.toLowerCase().includes(lowerSearch) ||
                    project.skills_required.some(skill => skill.toLowerCase().includes(lowerSearch));
                const projectCategory = (project.category || 'General').toLowerCase();
                const matchesCategory =
                    !debouncedCategory || projectCategory.includes(lowerCategory);
                return matchesSearch && matchesCategory;
            })
        );
    }, [projects, debouncedSearch, debouncedCategory]);

    // WebSocket
    useEffect(() => {
        if (!user) return;

        const token = localStorage.getItem('access_token');
        if (!token) return;

        const wsUrl = `${WS_BASE}/projects/?token=${token}`;
        console.log('Connecting to WebSocket:', wsUrl);

        const connect = () => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.close();
            }

            try {
                wsRef.current = new WebSocket(wsUrl);

                wsRef.current.onopen = () => {
                    console.log('WebSocket connected');
                };

                wsRef.current.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);

                        if (data.type === 'project_update') {
                            if (data.update_type === 'new_project') {
                                const newProject: Project = {
                                    ...data.project,
                                    category: data.project.category || 'General'
                                };
                                setProjects(prev => [newProject, ...prev]);
                                setTotalCount(prev => prev + 1);
                            } else if (data.update_type === 'project_updated') {
                                const updatedProject: Project = {
                                    ...data.project,
                                    category: data.project.category || 'General'
                                };
                                setProjects(prev => prev.map(p =>
                                    p.project_id === updatedProject.project_id ? updatedProject : p
                                ));
                            } else if (data.update_type === 'project_deleted') {
                                setProjects(prev => prev.filter(p => p.project_id !== data.project.project_id));
                                setTotalCount(prev => Math.max(0, prev - 1));
                            }
                        }
                    } catch (e) {
                        console.error('WebSocket parse error:', e);
                    }
                };

                wsRef.current.onclose = () => {
                    if (reconnectTimeoutRef.current) {
                        clearTimeout(reconnectTimeoutRef.current);
                    }
                    reconnectTimeoutRef.current = window.setTimeout(connect, 5000);
                };

                wsRef.current.onerror = (err) => {
                    console.error('WebSocket error:', err);
                };
            } catch (error) {
                console.error('WebSocket connection failed:', error);
            }
        };

        connect();

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [user]);

    const loadMore = () => {
        if (isLoadingMore || !hasNext) return;
        setIsLoadingMore(true);
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProjects(nextPage, true);
    };

    const markAsViewed = (id: string) => {
        if (viewedProjects.includes(id)) return;
        const updated = [...viewedProjects, id];
        setViewedProjects(updated);
        if (user) {
            localStorage.setItem(`viewed_projects_${user.user_id}`, JSON.stringify(updated));
        }
    };

    const formatDeadline = (deadline: string) => {
        const now = new Date();
        const end = new Date(deadline);
        const diffMs = end.getTime() - now.getTime();
        if (diffMs < 0) return 'Expired';
        const diffSecs = Math.floor(diffMs / 1000);
        let days = Math.floor(diffSecs / (3600 * 24));
        const months = Math.floor(days / 30);
        days = days % 30;
        const hours = Math.floor((diffSecs % (3600 * 24)) / 3600);
        const minutes = Math.floor((diffSecs % 3600) / 60);
        let result = '';
        if (months > 0) result += `${months}m `;
        if (days > 0) result += `${days}d `;
        result += `${hours}h ${minutes}m`;
        return result.trim();
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    if (loading && projects.length === 0) {
        return <div className={styles.loadingIndicator}>Loading projects...</div>;
    }
    if (error) {
        return <div className={styles.loadingIndicator}>Error: {error}</div>;
    }

    return (
        <div className={styles.dashboardWrapper}>
            <nav className={styles.topBar}>
                <div className={styles.barContent}>
                    <Link to="/tutor/dashboard" className={styles.brandLogo}>
                        <img src="/images/helper-brand-logo.jpg" alt="MyHomework Helper" />
                    </Link>
                    <div className={styles.menuItems}>
                        <Link to="/income/boost">Income Boost</Link>
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
                        <img
                            src={user?.profile_picture || '/images/default-helper-profile.jpg'}
                            alt="Profile"
                            className={styles.profileImage}
                        />
                        <span>{user?.username}</span>
                        <button onClick={handleLogout} className={styles.logoutButton}>
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <div className={styles.mainContent}>
                <div className={styles.filters}>
                    <input
                        type="text"
                        placeholder="Search by keyword or Order ID"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className={styles.keywordSearch}
                    />
                    <input
                        type="text"
                        placeholder="Search by category (e.g., Business)..."
                        value={categorySearch}
                        onChange={e => setCategorySearch(e.target.value)}
                        className={styles.keywordSearch}
                    />
                    <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className={styles.sortSelect}>
                        <option value="created_at">Sort by: Newest</option>
                        <option value="budget">Budget</option>
                        <option value="deadline">Deadline</option>
                    </select>
                    <select value={sortOrder} onChange={e => setSortOrder(e.target.value as any)} className={styles.sortSelect}>
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
                    </select>
                </div>
                <div className={styles.resultsInfo}>
                    <span>{totalCount} Projects Found</span>
                </div>
                {totalCount === 0 ? (
                    <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        None Found, come back later.
                    </p>
                ) : (
                    <>
                        <div className={styles.projectList}>
                            <div className={styles.projectHeader}>
                                <span className={styles.orderId}>Order ID</span>
                                <span className={styles.subject}>Subject</span>
                                <span className={styles.workAmount}>Amount of Work</span>
                                <span className={styles.price}>Price</span>
                                <span className={styles.deadline}>Deadline</span>
                                <span className={styles.topic}>Topic</span>
                            </div>
                            {filteredProjects.map(project => (
                                <div
                                    key={project.project_id}
                                    className={`${styles.projectRow} ${viewedProjects.includes(project.project_id) ? styles.viewed : ''} ${!viewedProjects.includes(project.project_id) ? styles.newHighlight : ''}`}
                                    onClick={() => {
                                        markAsViewed(project.project_id);
                                        navigate(`/tutor/projects/${project.project_id}`);
                                    }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className={styles.projectDetails}>
                                        <span className={styles.orderId}>ID {project.project_id.slice(0, 8)}</span>
                                        <span className={styles.subject}>{project.category || 'General'}</span>
                                        <span className={styles.workAmount}>{project.amount_of_work} pages</span>
                                        <span className={styles.price}>${Number(project.budget).toFixed(2)}</span>
                                        <span className={styles.deadline}>{formatDeadline(project.deadline)}</span>
                                        <span className={styles.topic}>{project.title}</span>
                                    </div>
                                    <div className={styles.separator}></div>
                                </div>
                            ))}
                        </div>
                        {hasNext && (
                            <button onClick={loadMore} disabled={isLoadingMore} className={styles.loadMore}>
                                {isLoadingMore ? 'Loading...' : 'Load More Projects'}
                            </button>
                        )}
                        {!hasNext && filteredProjects.length > 0 && (
                            <p style={{ textAlign: 'center', marginTop: '2rem', color: '#666' }}>
                                You've reached the end
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default BrowseProjectsPage;