import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CalendarPage.module.css';

interface Project {
    project_id: string;
    title: string;
    deadline: string;
    status: string;
    budget: number;
}

interface User {
    user_id: string;
    username: string;
    role: 'tutor';
}

const CalendarPage = () => {
    const [user, setUser] = useState<User | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
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
                const projectsRes = await fetch('/api/projects/?tutor=' + user.user_id, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!projectsRes.ok) throw new Error('Failed to fetch projects');
                const projectsData = await projectsRes.json();
                setProjects(projectsData.results || []);
            } catch (err) {
                setError('Failed to load calendar data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const changeMonth = (delta: number) => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1));
    };

    const groupProjectsByDate = () => {
        const groups: { [date: string]: Project[] } = {};
        projects.forEach(p => {
            if (p.status !== 'COMPLETED' && p.status !== 'CANCELLED') {
                const dateKey = new Date(p.deadline).toDateString();
                if (!groups[dateKey]) groups[dateKey] = [];
                groups[dateKey].push(p);
            }
        });
        return groups;
    };

    const projectGroups = groupProjectsByDate();
    const today = new Date().toDateString();

    const renderCalendar = () => {
        const days = getDaysInMonth(currentMonth);
        const firstDay = getFirstDayOfMonth(currentMonth);
        const weeks = Math.ceil((days + firstDay) / 7);
        const calendar = [];

        let day = 1;
        for (let i = 0; i < weeks; i++) {
            const week = [];
            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < firstDay) {
                    week.push(<td key={`${i}-${j}`} className={styles.empty}></td>);
                } else if (day > days) {
                    week.push(<td key={`${i}-${j}`} className={styles.empty}></td>);
                } else {
                    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                    const dateKey = date.toDateString();
                    const dayProjects = projectGroups[dateKey] || [];
                    const isToday = dateKey === today;

                    week.push(
                        <td
                            key={`${i}-${j}`}
                            className={`${styles.day} ${isToday ? styles.today : ''} ${dayProjects.length > 0 ? styles.hasProjects : ''}`}
                        >
                            <div className={styles.dayNumber}>{day}</div>
                            {dayProjects.length > 0 && (
                                <div className={styles.projectCount}>
                                    {dayProjects.length} project{dayProjects.length > 1 ? 's' : ''}
                                </div>
                            )}
                            <div className={styles.projectsList}>
                                {dayProjects.slice(0, 2).map(p => (
                                    <div
                                        key={p.project_id}
                                        className={styles.projectEvent}
                                        onClick={() => navigate(`/tutor/projects/${p.project_id}`)}
                                        title={`${p.title} - $${p.budget}`}
                                    >
                                        {p.project_id.substring(0, 8)}...
                                    </div>
                                ))}
                                {dayProjects.length > 2 && (
                                    <div className={styles.moreProjects}>
                                        +{dayProjects.length - 2} more
                                    </div>
                                )}
                            </div>
                        </td>
                    );
                    day++;
                }
            }
            calendar.push(<tr key={i}>{week}</tr>);
        }
        return calendar;
    };

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Loading calendar...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.page}>
                <div className={styles.errorContainer}>
                    <h2>Error Loading Calendar</h2>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>
                        <i className="material-icons">event</i>
                        Project Calendar
                    </h1>
                    <button onClick={() => navigate('/tutor/dashboard')} className={styles.backBtn}>
                        <i className="material-icons">arrow_back</i>
                        Back to Dashboard
                    </button>
                </div>

                <div className={styles.calendarCard}>
                    <div className={styles.monthNav}>
                        <button onClick={() => changeMonth(-1)} className={styles.navBtn}>
                            <i className="material-icons">chevron_left</i>
                        </button>
                        <h2>
                            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h2>
                        <button onClick={() => changeMonth(1)} className={styles.navBtn}>
                            <i className="material-icons">chevron_right</i>
                        </button>
                    </div>

                    <div className={styles.legend}>
                        <span className={styles.legendItem}>
                            <span className={styles.legendDot} style={{ background: '#dbeafe', border: '2px solid #3b82f6' }}></span>
                            Today
                        </span>
                        <span className={styles.legendItem}>
                            <span className={styles.legendDot} style={{ background: '#f0f9ff' }}></span>
                            Has Projects
                        </span>
                    </div>

                    <table className={styles.calendarTable}>
                        <thead>
                            <tr>
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <th key={day}>{day}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>{renderCalendar()}</tbody>
                    </table>
                </div>

                <div className={styles.upcomingCard}>
                    <h3>
                        <i className="material-icons">schedule</i>
                        Upcoming Deadlines
                    </h3>
                    <div className={styles.upcomingList}>
                        {projects
                            .filter(p =>
                                p.status !== 'COMPLETED' &&
                                p.status !== 'CANCELLED' &&
                                new Date(p.deadline) >= new Date()
                            )
                            .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                            .slice(0, 5)
                            .map(p => (
                                <div
                                    key={p.project_id}
                                    className={styles.upcomingItem}
                                    onClick={() => navigate(`/tutor/projects/${p.project_id}`)}
                                >
                                    <div className={styles.upcomingDate}>
                                        <div className={styles.dateDay}>
                                            {new Date(p.deadline).getDate()}
                                        </div>
                                        <div className={styles.dateMonth}>
                                            {new Date(p.deadline).toLocaleDateString('en-US', { month: 'short' })}
                                        </div>
                                    </div>
                                    <div className={styles.upcomingDetails}>
                                        <div className={styles.upcomingTitle}>{p.project_id.substring(0, 12)}...</div>
                                        <div className={styles.upcomingMeta}>
                                            <span className={styles.upcomingBudget}>${p.budget}</span>
                                            <span className={styles.upcomingStatus}>{p.status}</span>
                                        </div>
                                    </div>
                                    <i className="material-icons">arrow_forward</i>
                                </div>
                            ))}
                        {projects.filter(p =>
                            p.status !== 'COMPLETED' &&
                            p.status !== 'CANCELLED' &&
                            new Date(p.deadline) >= new Date()
                        ).length === 0 && (
                                <p className={styles.noUpcoming}>
                                    <i className="material-icons">check_circle</i>
                                    No upcoming deadlines
                                </p>
                            )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;