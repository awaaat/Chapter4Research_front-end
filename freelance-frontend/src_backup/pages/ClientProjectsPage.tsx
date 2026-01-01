// pages/ClientProjectsPage.tsx - COMPLETE PRODUCTION VERSION
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import styles from './ClientProjectsPage.module.css';

interface Project {
    project_id: string;
    title: string;
    description: string;
    budget: number;
    deadline: string;
    status: string;
    created_at: string;
    bids: Bid[];
    assigned_tutor?: string;
    conversations?: Conversation[];
    tutor_marked_done?: boolean;
}

interface Bid {
    bid_id: string;
    tutor_username: string;
    proposed_amount: number;
    proposed_timeline: string;
    bid_message: string;
    created_at: string;
}

interface Conversation {
    conversation_id: string;
    tutor: {
        user_id: string;
        username: string;
        first_name: string;
        last_name: string;
    };
    client: {
        user_id: string;
        username: string;
        first_name: string;
        last_name: string;
    };
    project: any;
    unread_count: number;
}

interface Message {
    message_id: string;
    sender: 'CLIENT' | 'TUTOR';
    message_content: string;
    timestamp: string;
}

interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
}

const ClientProjectsPage = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
    const [expandedChats, setExpandedChats] = useState<Set<string>>(new Set());
    const [projectMessages, setProjectMessages] = useState<{ [key: string]: Message[] }>({});
    const [newMessages, setNewMessages] = useState<{ [key: string]: string }>({});
    const [editingProject, setEditingProject] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{ title: string; description: string; budget: number; deadline: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);
    const [showCompleteConfirm, setShowCompleteConfirm] = useState<string | null>(null);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const navigate = useNavigate();
    const { projectId } = useParams<{ projectId?: string }>();
    const projectRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const isSingleMode = !!projectId;

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');
        if (!token || !storedUser) {
            navigate('/login');
            return;
        }
        try {
            setUser(JSON.parse(storedUser));
        } catch {
            localStorage.clear();
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        if (!user) return;
        const token = localStorage.getItem('access_token');
        const loadProjects = async () => {
            try {
                const res = await fetch(`/api/projects/?client_id=${user.user_id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error('Failed to load projects');
                const data = await res.json();

                const projectsWithDetails = await Promise.all(
                    (data.results || []).map(async (p: Project) => {
                        const bidsRes = await fetch(`/api/projects/${p.project_id}/bids/`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        const bids = bidsRes.ok ? await bidsRes.json() : { results: [] };

                        const convRes = await fetch(`/api/conversations/?project_id=${p.project_id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        const convs = convRes.ok ? await convRes.json() : { results: [] };

                        return { ...p, bids: bids.results || [], conversations: convs.results || [] };
                    })
                );

                setProjects(projectsWithDetails);

                if (projectId) {
                    setExpandedProjects(new Set([projectId]));
                    setTimeout(() => {
                        projectRefs.current[projectId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                }
            } catch (err) {
                console.error('Load projects error:', err);
                setError('Error loading projects');
            } finally {
                setLoading(false);
            }
        };
        loadProjects();
    }, [user, projectId]);

    const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 6000);
    };

    const toggleExpand = (id: string) => {
        setExpandedProjects(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const toggleChat = (id: string, tutorUsername?: string) => {
        setExpandedChats(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
                fetchMessages(id, tutorUsername);
            }
            return newSet;
        });
    };

    const fetchMessages = async (id: string, tutorUsername?: string) => {
        try {
            const p = projects.find(p => p.project_id === id);

            if (!p || !p.conversations || p.conversations.length === 0) {
                addToast('No conversations available yet', 'info');
                return;
            }

            let conv;
            if (tutorUsername) {
                conv = p.conversations.find(c =>
                    c.tutor.username.trim().toLowerCase() === tutorUsername.trim().toLowerCase()
                );
            }

            if (!conv && p.conversations.length > 0) {
                conv = p.conversations[0];
            }

            if (!conv) {
                addToast('No conversation found for this tutor', 'info');
                return;
            }

            const token = localStorage.getItem('access_token');
            const res = await fetch(`/api/conversations/${conv.conversation_id}/messages/`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                if (res.status === 404) {
                    setProjectMessages(prev => ({ ...prev, [id]: [] }));
                    return;
                }
                throw new Error('Failed to load messages');
            }

            const data = await res.json();
            setProjectMessages(prev => ({ ...prev, [id]: data.results || [] }));
        } catch (err) {
            console.error('Fetch messages error:', err);
            addToast('Error loading messages', 'error');
        }
    };

    const handleSendMessage = async (id: string, tutorUsername?: string) => {
        const content = newMessages[id];
        if (!content?.trim()) return;

        try {
            const p = projects.find(p => p.project_id === id);
            if (!p || !p.conversations || p.conversations.length === 0) {
                addToast('No conversation available', 'error');
                return;
            }

            let conv;
            if (tutorUsername) {
                conv = p.conversations.find(c =>
                    c.tutor.username.trim().toLowerCase() === tutorUsername.trim().toLowerCase()
                );
            }

            if (!conv && p.conversations.length > 0) {
                conv = p.conversations[0];
            }

            if (!conv) {
                addToast('Cannot send message - no conversation found', 'error');
                return;
            }

            const token = localStorage.getItem('access_token');
            const res = await fetch(`/api/conversations/${conv.conversation_id}/messages/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ message_content: content }),
            });

            if (!res.ok) {
                throw new Error('Failed to send message');
            }

            const newMsg = await res.json();
            setProjectMessages(prev => ({ ...prev, [id]: [...(prev[id] || []), newMsg] }));
            setNewMessages(prev => ({ ...prev, [id]: '' }));
            addToast('Message sent', 'success');
        } catch (err) {
            console.error('Send message error:', err);
            addToast('Error sending message', 'error');
        }
    };

    const filteredProjects = projects.filter(p => {
        if (isSingleMode && p.project_id !== projectId) return false;
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = !statusFilter || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleAssignTutor = async (projectId: string, bidId: string) => {
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`/api/projects/${projectId}/assign/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ bid_id: bidId }),
            });

            const data = await res.json();

            if (res.status === 402) {
                addToast(
                    `Insufficient Wallet Balance! You have: $${data.balance}. Required: $${data.required}`,
                    'warning'
                );
                setTimeout(() => navigate('/client/wallet'), 4000);
                return;
            }

            if (res.status === 403) {
                addToast(data.detail || 'You do not have permission to assign tutors to this project.', 'error');
                return;
            }

            if (res.status === 404) {
                addToast(data.detail || 'Project or bid not found.', 'error');
                return;
            }

            if (res.status === 400) {
                addToast(data.detail || data.error || 'Invalid request. Please check project status.', 'error');
                return;
            }

            if (!res.ok) {
                addToast(data.detail || data.error || 'Failed to assign tutor. Please try again.', 'error');
                return;
            }

            setProjects(prev =>
                prev.map(p =>
                    p.project_id === projectId
                        ? {
                            ...p,
                            assigned_tutor: data.project?.assigned_tutor || p.bids.find(b => b.bid_id === bidId)?.tutor_username,
                            status: 'IN_PROGRESS'
                        }
                        : p
                )
            );

            const paymentDetails = data.payment_details || {};
            addToast(
                `Tutor Assigned Successfully! Payment: $${paymentDetails.amount_paid || '0.00'}`,
                'success'
            );
        } catch (err: any) {
            console.error('Assign tutor error:', err);
            addToast('Network error. Please check your connection and try again.', 'error');
        }
    };

    const handleCancelProject = async (projectId: string) => {
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`/api/projects/${projectId}/cancel/`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();

            if (!res.ok) {
                addToast(data.detail || data.error || 'Failed to cancel project', 'error');
                return;
            }

            setProjects(prev =>
                prev.map(p =>
                    p.project_id === projectId
                        ? { ...p, status: 'CANCELLED' }
                        : p
                )
            );

            if (data.refund) {
                addToast(
                    `Project cancelled. $${data.refund.refund_amount} refunded to your wallet. New Balance: $${data.refund.client_new_balance}`,
                    'info'
                );
            } else {
                addToast(data.message || 'Project cancelled successfully', 'info');
            }

            setShowCancelConfirm(null);
        } catch (err: any) {
            console.error('Cancel project error:', err);
            addToast('Error cancelling project', 'error');
        }
    };

    const handleMarkComplete = async (projectId: string) => {
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`/api/projects/${projectId}/complete/`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();

            if (!res.ok) {
                addToast(data.detail || data.error || 'Failed to mark as complete', 'error');
                return;
            }

            setProjects(prev =>
                prev.map(p =>
                    p.project_id === projectId
                        ? {
                            ...p,
                            status: 'COMPLETED',
                            tutor_marked_done: false
                        }
                        : p
                )
            );

            const payment = data.payment || {};
            addToast(
                `Project Completed! $${payment.amount_released || '0.00'} released to tutor.`,
                'success'
            );
            setShowCompleteConfirm(null);
        } catch (err: any) {
            console.error('Complete project error:', err);
            addToast('Error marking as complete', 'error');
        }
    };

    const handleStartEdit = (project: Project) => {
        setEditForm({
            title: project.title,
            description: project.description,
            budget: project.budget,
            deadline: project.deadline,
        });
        setEditingProject(project.project_id);
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!editForm) return;
        setEditForm({
            ...editForm,
            [e.target.name]: e.target.value,
        });
    };

    const handleUpdateProject = async (projectId: string) => {
        if (!editForm) return;
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`/api/projects/${projectId}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(editForm),
            });
            if (!res.ok) throw new Error('Failed to update project');
            const updated = await res.json();
            setProjects(prev =>
                prev.map(p =>
                    p.project_id === projectId ? { ...p, ...updated } : p
                )
            );
            addToast('Project updated successfully', 'success');
            setEditingProject(null);
        } catch (err) {
            addToast('Error updating project', 'error');
        }
    };

    const handleChat = (conversationId: string) => {
        navigate(`/messaging?conversation=${conversationId}`);
    };

    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    if (loading) return <div className={styles.loading}>Loading projects...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.page}>
            <nav className={styles.navbar}>
                <div className={styles.navContent}>
                    <Link to="/" className={styles.logo}>HomeworkHelper</Link>
                    <span className={styles.username}>@{user.username}</span>
                    <div className={styles.navLinks}>
                        <Link to="/client/dashboard">Dashboard</Link>
                        <Link to="/client/projects">My Projects</Link>
                        <Link to="/client/messages">Messages</Link>
                        <Link to="/client/wallet">Balance</Link>
                        <Link to="/client/profile">Profile</Link>
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                </div>
            </nav>

            <div className={styles.container}>
                <header className={styles.header}>
                    <h1>{isSingleMode ? 'Manage Project' : 'My Projects'}</h1>
                    <p>Manage your posted questions, bids, and assignments.</p>
                </header>

                {!isSingleMode && (
                    <div className={styles.filters}>
                        <input
                            type="text"
                            placeholder="Search by title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className={styles.statusSelect}
                        >
                            <option value="">All Statuses</option>
                            <option value="OPEN">Open</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                        <button className={styles.primaryButton} onClick={() => navigate('/post-project')}>
                            Post New Question
                        </button>
                    </div>
                )}

                <div className={styles.projectGrid}>
                    {filteredProjects.length === 0 ? (
                        <p className={styles.noResults}>{isSingleMode ? 'Project not found.' : 'No projects match your filters.'}</p>
                    ) : (
                        filteredProjects.map((project) => {
                            const messages = projectMessages[project.project_id] || [];
                            const unreadTotal = project.conversations?.reduce((sum, c) => sum + c.unread_count, 0) || 0;
                            const hasConversations = project.conversations && project.conversations.length > 0;

                            return (
                                <div
                                    key={project.project_id}
                                    ref={(el) => {
                                        projectRefs.current[project.project_id] = el;
                                    }}
                                    className={styles.projectCard}
                                >
                                    <div className={styles.cardHeader} onClick={() => toggleExpand(project.project_id)}>
                                        <h3>{project.title}</h3>
                                        <span className={`${styles.statusBadge} ${styles[`status${project.status.replace(/ /g, '')}`]}`}>
                                            {project.status}
                                        </span>
                                        {!isSingleMode && (
                                            <button className={styles.expandButton}>
                                                {expandedProjects.has(project.project_id) ? '▲' : '▼'}
                                            </button>
                                        )}
                                    </div>
                                    {(isSingleMode || expandedProjects.has(project.project_id)) && (
                                        <div className={styles.cardContent}>
                                            {editingProject === project.project_id ? (
                                                <form onSubmit={(e) => { e.preventDefault(); handleUpdateProject(project.project_id); }} className={styles.editForm}>
                                                    <div className={styles.formGroup}>
                                                        <label>Title</label>
                                                        <input name="title" value={editForm?.title} onChange={handleEditChange} required />
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <label>Description</label>
                                                        <textarea name="description" value={editForm?.description} onChange={handleEditChange} required />
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <label>Budget</label>
                                                        <input type="number" name="budget" value={editForm?.budget} onChange={handleEditChange} required />
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <label>Deadline</label>
                                                        <input type="datetime-local" name="deadline" value={editForm?.deadline.slice(0, 16)} onChange={handleEditChange} required />
                                                    </div>
                                                    <div className={styles.formActions}>
                                                        <button type="submit" className={styles.primaryButton}>Save</button>
                                                        <button type="button" className={styles.cancelButton} onClick={() => setEditingProject(null)}>Cancel</button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <>
                                                    <p className={styles.description}>{project.description}</p>
                                                    <div className={styles.details}>
                                                        <span>Budget: ${project.budget}</span>
                                                        <span>Deadline: {formatDate(project.deadline)}</span>
                                                        <span>Created: {formatDate(project.created_at)}</span>
                                                        {project.assigned_tutor && <span>Assigned to: {project.assigned_tutor}</span>}
                                                    </div>

                                                    {project.status === 'OPEN' && (
                                                        <div className={styles.bidsSection}>
                                                            <h4>Bids ({project.bids.length})</h4>
                                                            <div className={styles.bidsList}>
                                                                {project.bids.map((bid) => (
                                                                    <div key={bid.bid_id} className={styles.bidCard}>
                                                                        <div className={styles.bidHeader}>
                                                                            <span>{bid.tutor_username}</span>
                                                                            <span>${bid.proposed_amount} / {bid.proposed_timeline}</span>
                                                                        </div>
                                                                        <p>{bid.bid_message}</p>
                                                                        <div className={styles.bidActions}>
                                                                            <button
                                                                                className={styles.primaryButton}
                                                                                onClick={() => handleAssignTutor(project.project_id, bid.bid_id)}
                                                                            >
                                                                                Assign
                                                                            </button>
                                                                            <button
                                                                                className={styles.chatButton}
                                                                                onClick={() => {
                                                                                    const conv = project.conversations?.find(c => c.tutor.username === bid.tutor_username);
                                                                                    if (conv) {
                                                                                        handleChat(conv.conversation_id);
                                                                                    } else {
                                                                                        addToast('Start a conversation by messaging the tutor.', 'info');
                                                                                    }
                                                                                }}
                                                                            >
                                                                                Chat
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className={styles.cardActions}>
                                                        {project.status === 'OPEN' && (
                                                            <button className={styles.editButton} onClick={() => handleStartEdit(project)}>
                                                                Edit Project
                                                            </button>
                                                        )}
                                                        {project.status !== 'CANCELLED' && project.status !== 'COMPLETED' && (
                                                            <button
                                                                className={styles.dangerButton}
                                                                onClick={() => setShowCancelConfirm(project.project_id)}
                                                            >
                                                                Cancel Project
                                                            </button>
                                                        )}

                                                        {(project.tutor_marked_done === true || project.status === 'TUTOR_DONE') &&
                                                            project.assigned_tutor &&
                                                            project.status !== 'COMPLETED' && (
                                                                <>
                                                                    <div className={styles.tutorDoneWarning}>
                                                                        Warning: Tutor has marked this question as done. Please review the work and mark as complete to release payment.
                                                                    </div>
                                                                    <button
                                                                        className={styles.completeButton}
                                                                        onClick={() => setShowCompleteConfirm(project.project_id)}
                                                                    >
                                                                        Mark as Complete
                                                                    </button>
                                                                </>
                                                            )}
                                                        {project.status === 'COMPLETED' && (
                                                            <button
                                                                className={styles.primaryButton}
                                                                onClick={() => navigate(`/review/${project.project_id}`)}
                                                            >
                                                                Leave Review
                                                            </button>
                                                        )}
                                                        {project.assigned_tutor && hasConversations && project.status !== 'CANCELLED' && (
                                                            <button
                                                                className={styles.chatButton}
                                                                onClick={() => toggleChat(project.project_id, project.assigned_tutor)}
                                                            >
                                                                {expandedChats.has(project.project_id) ? 'Hide' : 'Show'} Chat ({unreadTotal} unread)
                                                            </button>
                                                        )}
                                                        {!project.assigned_tutor && hasConversations && project.status !== 'CANCELLED' && (
                                                            <button
                                                                className={styles.chatButton}
                                                                onClick={() => toggleChat(project.project_id)}
                                                            >
                                                                {expandedChats.has(project.project_id) ? 'Hide' : 'Show'} Chats ({unreadTotal} unread)
                                                            </button>
                                                        )}
                                                    </div>

                                                    {expandedChats.has(project.project_id) && hasConversations && (
                                                        <div className={styles.chatContainer}>
                                                            <div className={styles.messageList}>
                                                                {messages.length === 0 ? (
                                                                    <p className={styles.noMessages}>No messages yet</p>
                                                                ) : (
                                                                    messages.map((msg) => (
                                                                        <div
                                                                            key={msg.message_id}
                                                                            className={msg.sender === 'CLIENT' ? styles.sent : styles.received}
                                                                        >
                                                                            <p>{msg.message_content}</p>
                                                                            <small>{formatDate(msg.timestamp)}</small>
                                                                        </div>
                                                                    ))
                                                                )}
                                                            </div>
                                                            <div className={styles.messageInput}>
                                                                <input
                                                                    type="text"
                                                                    value={newMessages[project.project_id] || ''}
                                                                    onChange={(e) => setNewMessages(prev => ({ ...prev, [project.project_id]: e.target.value }))}
                                                                    placeholder="Type your message..."
                                                                    onKeyPress={(e) => {
                                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                                            e.preventDefault();
                                                                            handleSendMessage(project.project_id, project.assigned_tutor);
                                                                        }
                                                                    }}
                                                                />
                                                                <button onClick={() => handleSendMessage(project.project_id, project.assigned_tutor)}>Send</button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {showCancelConfirm && (
                    <>
                        <div className={styles.overlay} onClick={() => setShowCancelConfirm(null)} />
                        <div className={styles.modal}>
                            <h2>Confirm Cancel</h2>
                            <p>Are you sure you want to cancel this project? This action cannot be undone.</p>
                            <div className={styles.modalActions}>
                                <button className={styles.dangerButton} onClick={() => handleCancelProject(showCancelConfirm)}>
                                    Yes, Cancel
                                </button>
                                <button className={styles.cancelButton} onClick={() => setShowCancelConfirm(null)}>
                                    No
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {showCompleteConfirm && (
                    <>
                        <div className={styles.overlay} onClick={() => setShowCompleteConfirm(null)} />
                        <div className={styles.modal}>
                            <h2>Confirm Complete</h2>
                            <p>Are you sure you want to mark this question as complete? Payment will be released to the tutor.</p>
                            <div className={styles.modalActions}>
                                <button className={styles.primaryButton} onClick={() => handleMarkComplete(showCompleteConfirm)}>
                                    Yes, Complete
                                </button>
                                <button className={styles.cancelButton} onClick={() => setShowCompleteConfirm(null)}>
                                    No
                                </button>
                            </div>
                        </div>
                    </>
                )}

                <div className={styles.toastContainer}>
                    {toasts.map((toast) => (
                        <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
                            {toast.message}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ClientProjectsPage;