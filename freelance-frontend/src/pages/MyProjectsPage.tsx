import { useEffect, useState } from 'react';
import { apiClient } from '../utils/apiClient';
import { Link, useNavigate } from 'react-router-dom';
import styles from './MyProjectsPage.module.css';

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
    category: string;
    tutor_marked_done: boolean;
}

interface Conversation {
    conversation_id: string;
    unread_count: number;
}

interface Notification {
    id: string;
    read: boolean;
}

const MyProjectsPage = () => {
    const [ongoingProjects, setOngoingProjects] = useState<Project[]>([]);
    const [doneProjects, setDoneProjects] = useState<Project[]>([]);
    const [revisionProjects, setRevisionProjects] = useState<Project[]>([]);
    const [completedProjects, setCompletedProjects] = useState<Project[]>([]);
    const [cancelledProjects, setCancelledProjects] = useState<Project[]>([]);
    const [overdueProjects, setOverdueProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('ongoing');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('deadline');
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [inboxCount, setInboxCount] = useState<number>(0);
    const [alertsCount, setAlertsCount] = useState<number>(0);

    const navigate = useNavigate();

    // AUTH
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');
        if (!token || !storedUser) {
            navigate('/login');
            return;
        }

        try {
            const parsed = JSON.parse(storedUser);
            if (parsed.role !== 'tutor') {
                navigate('/');
                return;
            }
            setUser(parsed);
        } catch {
            localStorage.clear();
            navigate('/login');
        }
    }, [navigate]);

    // AUTO-HIDE NOTIFICATIONS
    useEffect(() => {
        if (!notification) return;
        const timer = setTimeout(() => setNotification(null), 3000);
        return () => clearTimeout(timer);
    }, [notification]);

    // LOAD DATA
    useEffect(() => {
        if (!user) return;
        const token = localStorage.getItem('access_token');

        const fetchAll = async (url: string) => {
            let all: any[] = [];
            let next = url;
            while (next) {
                const res = await fetch(next, { headers: { Authorization: `Bearer ${token}` } });
                if (!res.ok) break;
                const data = await res.json();
                all = [...all, ...(data.results || [])];
                next = data?.links?.next || '';
            }
            return all;
        };

        const load = async () => {
            const [projects, conversationsData, notificationsData] = await Promise.all([
                fetchAll(`/api/projects/?tutor=${user.user_id}`),
                apiClient.get('/conversations/?tutor=' + user.user_id, {
                    headers: { 'Authorization': 'Bearer ' + token }
                }).then(res => res.json()),
                apiClient.get('/notifications/', {
                    headers: { 'Authorization': 'Bearer ' + token }
                }).then(res => res.json())
            ]);

            // Process projects
            const ongoing = projects.filter((p: Project) => p.status === 'IN_PROGRESS' && !p.tutor_marked_done);
            const done = projects.filter((p: Project) => p.status === 'IN_PROGRESS' && p.tutor_marked_done);
            const revision = projects.filter((p: Project) => p.status === 'IN_REVISION');
            const completed = projects.filter((p: Project) => p.status === 'COMPLETED');
            const cancelled = projects.filter((p: Project) => p.status === 'CANCELLED');

            const now = new Date();
            const overdue = projects.filter((p: Project) =>
                ['IN_PROGRESS', 'IN_REVISION'].includes(p.status) && new Date(p.deadline) < now
            );

            setOngoingProjects(ongoing);
            setDoneProjects(done);
            setRevisionProjects(revision);
            setCompletedProjects(completed);
            setCancelledProjects(cancelled);
            setOverdueProjects(overdue);

            // Process conversations unread
            const conversations: Conversation[] = conversationsData.results || [];
            const inboxCount = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);
            setInboxCount(inboxCount);

            // Process notifications unread
            let alertsCount = 0;
            if (Array.isArray(notificationsData.results)) {
                alertsCount = notificationsData.results.filter((n: Notification) => !n.read).length;
            } else if (typeof notificationsData.unread_count === 'number') {
                alertsCount = notificationsData.unread_count;
            }
            setAlertsCount(alertsCount);

            setLoading(false);
        };

        load();
    }, [user]);

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
        ' · ' +
        new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    const getCurrentProjects = () => {
        const lists: { [key: string]: Project[] } = {
            ongoing: ongoingProjects,
            done: doneProjects,
            revision: revisionProjects,
            overdue: overdueProjects,
            completed: completedProjects,
            cancelled: cancelledProjects,
        };

        let list = lists[activeTab] || [];

        return list
            .filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
            .sort((a, b) => {
                if (sort === 'deadline') return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
                if (sort === 'budget') return b.budget - a.budget;
                return a.title.localeCompare(b.title);
            });
    };

    const projects = getCurrentProjects();

    if (loading) {
        return <div className={styles.mainContent}>Loading your projects...</div>;
    }

    return (
        <div className={styles.dashboardWrapper}>
            {/* TOP BAR */}
            <nav className={styles.topBar}>
                <div className={styles.barContent}>
                    <Link to="/" className={styles.brandLogo}>
                        <img src="/images/helper-brand-logo.jpg" alt="MyHomeworkHelper" />
                    </Link>
                    <div className={styles.menuItems}>
                        <Link to="/income/boost">Income Boost</Link>
                        <Link to="/tutor/projects">Browse Projects</Link>
                    </div>
                    <div className={styles.iconGroup}>
                        <Link to="/messaging"><i className="material-icons">mail_outline</i>{inboxCount > 0 && <span className={styles.alertBadge}>{inboxCount}</span>}</Link>
                        <Link to="/notifications"><i className="material-icons">notifications</i>{alertsCount > 0 && <span className={styles.alertBadge}>{alertsCount}</span>}</Link>
                        <Link to="/knowledge-base"><i className="material-icons">account_balance</i></Link>
                    </div>
                    <div className={styles.profileSection}>
                        <Link to="/tutor/profile" className={styles.profileLink}>Profile</Link>
                        <span>{user?.username}</span>
                        <button onClick={() => { localStorage.clear(); navigate('/login'); }} className={styles.logoutButton}>
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* SIDEBAR */}
            <aside className={styles.sideNav}>
                <Link to="/tutor/my-projects" className={styles.navActive}>
                    <i className="material-icons">list_alt</i>
                    <span>My Projects</span>
                </Link>

                <div className={styles.sidebarTabs}>
                    <div className={activeTab === 'ongoing' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('ongoing')}>
                        <span>Ongoing</span>
                        {ongoingProjects.length > 0 && <span className={styles.counter}>{ongoingProjects.length}</span>}
                    </div>
                    <div className={activeTab === 'done' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('done')}>
                        <span>Awaiting Review</span>
                        {doneProjects.length > 0 && <span className={styles.counter}>{doneProjects.length}</span>}
                    </div>
                    <div className={activeTab === 'revision' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('revision')}>
                        <span>In Revision</span>
                        {revisionProjects.length > 0 && <span className={styles.counter}>{revisionProjects.length}</span>}
                    </div>
                    <div className={activeTab === 'overdue' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('overdue')}>
                        <span>Overdue</span>
                        {overdueProjects.length > 0 && <span className={styles.counter}>{overdueProjects.length}</span>}
                    </div>
                    <div className={activeTab === 'completed' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('completed')}>
                        <span>Completed</span>
                        {completedProjects.length > 0 && <span className={styles.counter}>{completedProjects.length}</span>}
                    </div>
                    <div className={activeTab === 'cancelled' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('cancelled')}>
                        <span>Cancelled</span>
                        {cancelledProjects.length > 0 && <span className={styles.counter}>{cancelledProjects.length}</span>}
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className={styles.mainContent}>
                {notification && (
                    <div className={`${styles.notification} ${notification.type === 'success' ? styles.success : styles.error}`}>
                        {notification.message}
                    </div>
                )}

                <h1>My Projects</h1>

                <div className={styles.searchBar}>
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <select value={sort} onChange={e => setSort(e.target.value)}>
                        <option value="deadline">Deadline Soonest</option>
                        <option value="budget">Highest Budget</option>
                        <option value="title">A-Z Title</option>
                    </select>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.projectTable}>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Subject</th>
                                <th>Price</th>
                                <th>Deadline</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.length === 0 ? (
                                <tr className={styles.emptyTableRow}>
                                    <td colSpan={5}>
                                        <div className={styles.emptyContent}>
                                            <h3>No projects here yet</h3>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                projects.map(p => {
                                    let displayStatus = p.status.replace('_', ' ');
                                    let statusClass = styles.statusInprogress;

                                    // Show "DONE" if tutor marked done
                                    if (p.tutor_marked_done && p.status === 'IN_PROGRESS') {
                                        displayStatus = 'DONE (Awaiting Approval)';
                                        statusClass = styles.statusDone;
                                    } else if (p.status === 'IN_PROGRESS') {
                                        statusClass = styles.statusInprogress;
                                    } else if (p.status === 'IN_REVISION') {
                                        statusClass = styles.statusRevision;
                                    } else if (p.status === 'COMPLETED') {
                                        statusClass = styles.statusCompleted;
                                    } else if (p.status === 'CANCELLED') {
                                        statusClass = styles.statusCancelled;
                                    }

                                    return (
                                        <tr key={p.project_id}>
                                            <td>
                                                <Link to={`/tutor/project/${p.project_id}`} className={styles.linkFade}>
                                                    {p.title}
                                                </Link>
                                            </td>
                                            <td>{p.category}</td>
                                            <td><strong>${p.budget}</strong></td>
                                            <td>{formatDate(p.deadline)}</td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${statusClass}`}>
                                                    {displayStatus}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default MyProjectsPage;