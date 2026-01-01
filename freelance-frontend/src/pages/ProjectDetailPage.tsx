import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './ProjectDetailPage.module.css';

interface Bid {
    bid_id: string;
    tutor_username: string;
    proposed_amount: number;
    proposed_timeline: string;
    bid_message: string;
    created_at: string;
}

interface Attachment {
    url: string;
    filename: string;
}

interface Submission {
    submission_id: string;
    file_url: string;
    filename: string;
    message?: string;
    submitted_at: string;
    submission_type: 'DRAFT' | 'FINAL';
}

interface Message {
    message_id: string;
    sender: 'CLIENT' | 'TUTOR';
    message_content: string;
    timestamp: string;
    attachment_url?: string;
    filename?: string;
    attachment_type?: string;
}

interface Project {
    project_id: string;
    title: string;
    description: string;
    budget: number;
    deadline: string;
    status: string;
    client_username: string;
    created_at: string;
    bids: Bid[];
    skills_required: string[];
    category: string;
    assigned_tutor?: string;
    attachment_urls: Attachment[];
    submissions?: Submission[];
    tutor_marked_done: boolean;
}

const ProjectDetailPage = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [showMessages, setShowMessages] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any | null>(null);
    const [hasBid, setHasBid] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [bidToDelete, setBidToDelete] = useState<string | null>(null);
    const [selectedBid, setSelectedBid] = useState<string | null>(null);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const [bidForm, setBidForm] = useState({
        proposed_amount: '',
        timelineMonths: '0',
        timelineDays: '0',
        timelineHours: '0',
        timelineMinutes: '0',
        bid_message: '',
    });
    const [bidErrors, setBidErrors] = useState<Record<string, any>>({});
    const [completionFile, setCompletionFile] = useState<File | null>(null);
    const [completionMessage, setCompletionMessage] = useState('');
    const [submissionType, setSubmissionType] = useState<'DRAFT' | 'FINAL'>('DRAFT');
    const navigate = useNavigate();

    // === TIMELINE HELPERS ===
    const parseTimeline = (timelineStr: string) => {
        if (!timelineStr || timelineStr.trim() === '' || timelineStr === '0m') {
            return { months: 0, days: 0, hours: 0, minutes: 0 };
        }
        const parts = timelineStr.trim().split(/\s+/);
        let months = 0, days = 0, hours = 0, minutes = 0;
        parts.forEach(p => {
            const num = parseInt(p.replace(/[^\d]/g, '')) || 0;
            if (p.includes('mo')) months += num;
            else if (p.includes('d')) days += num;
            else if (p.includes('h')) hours += num;
            else if (p.includes('m') && !p.includes('mo')) minutes += num;
        });
        if (days >= 30) { months += Math.floor(days / 30); days %= 30; }
        return { months, days, hours, minutes };
    };

    const formatTimelinePretty = (timelineStr: string): string => {
        const { months, days, hours, minutes } = parseTimeline(timelineStr);
        const parts: string[] = [];
        if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);
        if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
        if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
        if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
        return parts.length === 0 ? 'Immediate' : parts.join(', ');
    };

    const formatTimeline = (months: number, days: number, hours: number, minutes: number): string => {
        const parts = [];
        if (months > 0) parts.push(`${months}mo`);
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        return parts.length > 0 ? parts.join(' ') : 'Immediate';
    };

    // === COUNTDOWN ===
    const calculateCountdown = (deadlineStr: string) => {
        const deadline = new Date(deadlineStr);
        const now = new Date();
        const diff = deadline.getTime() - now.getTime();
        if (diff <= 0) return { days: 0, hours: 0, minutes: 0 };
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return { days, hours, minutes };
    };

    // === TOAST HANDLER ===
    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // === AUTH & LOAD USER ===
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

    // === LOAD PROJECT ===
    useEffect(() => {
        if (!user || !projectId) return;
        const token = localStorage.getItem('access_token');
        const loadProject = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error('Failed to load project');
                const data: any = await res.json();

                let attachmentUrls = data.attachment_urls || [];
                if (Array.isArray(attachmentUrls) && attachmentUrls.length > 0) {
                    if (typeof attachmentUrls[0] === 'string') {
                        attachmentUrls = attachmentUrls.map((url: string) => ({
                            url,
                            filename: decodeURIComponent(url.split('/').pop()?.split('?')[0] || 'file'),
                        }));
                    }
                } else {
                    attachmentUrls = [];
                }
                data.attachment_urls = attachmentUrls;
                setProject(data as Project);

                const userBid = data.bids?.find((b: any) => b.tutor_username === user.username);
                if (userBid) {
                    const t = parseTimeline(userBid.proposed_timeline);
                    setBidForm({
                        proposed_amount: userBid.proposed_amount.toString(),
                        timelineMonths: t.months.toString(),
                        timelineDays: t.days.toString(),
                        timelineHours: t.hours.toString(),
                        timelineMinutes: t.minutes.toString(),
                        bid_message: userBid.bid_message,
                    });
                    setHasBid(true);
                }

                // Load conversation ID for messaging
                const convRes = await fetch(`/api/conversations/?project_id=${projectId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (convRes.ok) {
                    const convData = await convRes.json();
                    if (convData.results && convData.results.length > 0) {
                        setConversationId(convData.results[0].conversation_id);
                    }
                }
            } catch (err) {
                console.error('Error loading project:', err);
                setError('Failed to load project. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        loadProject();
    }, [user, projectId]);

    // === LOAD MESSAGES ===
    const loadMessages = async () => {
        if (!conversationId) return;
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`/api/conversations/${conversationId}/messages/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data.results || []);
            }
        } catch (err) {
            console.error('Error loading messages:', err);
        }
    };

    useEffect(() => {
        if (showMessages && conversationId) {
            loadMessages();
        }
    }, [showMessages, conversationId]);

    // === SEND MESSAGE ===
    const sendMessage = async () => {
        if (!conversationId || !newMessage.trim()) return;
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`/api/conversations/${conversationId}/messages/`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message_content: newMessage,
                    sender: user.role.toUpperCase(),
                }),
            });
            if (res.ok) {
                setNewMessage('');
                loadMessages();
            }
        } catch (err) {
            console.error('Error sending message:', err);
        }
    };

    // === BID VALIDATION & SUBMIT ===
    const validateBid = () => {
        const errors: Record<string, string> = {};
        const amount = parseFloat(bidForm.proposed_amount);
        if (isNaN(amount) || amount <= 0) errors.proposed_amount = 'Enter a valid amount';
        const totalTime =
            parseInt(bidForm.timelineMonths || '0') +
            parseInt(bidForm.timelineDays || '0') +
            parseInt(bidForm.timelineHours || '0') +
            parseInt(bidForm.timelineMinutes || '0');
        if (totalTime === 0) errors.proposed_timeline = 'Specify a delivery timeline';
        if (!bidForm.bid_message.trim() || bidForm.bid_message.length < 50)
            errors.bid_message = 'Message must be at least 50 characters';
        setBidErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleBidChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setBidForm({ ...bidForm, [e.target.name]: e.target.value });
        setBidErrors({ ...bidErrors, [e.target.name]: '' });
    };

    const submitBid = async (e: React.FormEvent) => {
        e.preventDefault();
        if (user?.role !== 'tutor') {
            setError('Only tutors can place bids.');
            return;
        }
        if (!validateBid()) return;
        const token = localStorage.getItem('access_token');
        const timeline = formatTimeline(
            parseInt(bidForm.timelineMonths) || 0,
            parseInt(bidForm.timelineDays) || 0,
            parseInt(bidForm.timelineHours) || 0,
            parseInt(bidForm.timelineMinutes) || 0
        );
        const payload = {
            proposed_amount: parseFloat(bidForm.proposed_amount),
            proposed_timeline: timeline || 'Immediate',
            bid_message: bidForm.bid_message,
        };
        try {
            const res = await fetch(`/api/projects/${projectId}/bids/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('Failed to submit bid');
            const newBid: Bid = await res.json();
            setProject(prev => prev ? { ...prev, bids: [...(prev.bids || []), newBid] } : null);
            setHasBid(true);
            showToast('✓ Bid placed successfully!', 'success');
            setBidForm({
                proposed_amount: '',
                timelineMonths: '0',
                timelineDays: '0',
                timelineHours: '0',
                timelineMinutes: '0',
                bid_message: '',
            });
        } catch {
            showToast('Failed to submit bid. Try again.', 'error');
        }
    };

    // === SUBMIT WORK (NO NAVIGATION) ===
    const submitCompletion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!completionFile) {
            setError('Please select a file to upload.');
            return;
        }
        const token = localStorage.getItem('access_token');
        const formData = new FormData();
        formData.append('file', completionFile);
        formData.append('submission_type', submissionType);
        if (completionMessage) {
            formData.append('message', completionMessage);
        }
        try {
            const res = await fetch(`/api/projects/${projectId}/submissions/`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            if (!res.ok) throw new Error('Failed to submit work');

            // SUCCESS - DO NOT NAVIGATE, just refresh data
            showToast('✓ Work submitted successfully! Files are now visible to the client.', 'success');
            setCompletionFile(null);
            setCompletionMessage('');

            // Refresh project data to show new submission
            const refreshRes = await fetch(`/api/projects/${projectId}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (refreshRes.ok) {
                const data = await refreshRes.json();
                let attachmentUrls = data.attachment_urls || [];
                if (Array.isArray(attachmentUrls) && attachmentUrls.length > 0) {
                    if (typeof attachmentUrls[0] === 'string') {
                        attachmentUrls = attachmentUrls.map((url: string) => ({
                            url,
                            filename: decodeURIComponent(url.split('/').pop()?.split('?')[0] || 'file'),
                        }));
                    }
                }
                data.attachment_urls = attachmentUrls;
                setProject(data);
            }
        } catch {
            showToast('Failed to submit work. Try again.', 'error');
        }
    };

    // === MARK AS DONE (IRREVERSIBLE) ===
    const markAsDone = async () => {
        if (!project || project.tutor_marked_done) return;
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`/api/projects/${projectId}/mark-done/`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || 'Failed to mark as done');
            }

            // Update local state - this makes the button disappear/grey out
            setProject(prev => prev ? { ...prev, tutor_marked_done: true } : null);
            showToast('✓ Project marked as done! Waiting for client approval.', 'success');
        } catch (err: any) {
            showToast(err.message || 'Failed to mark as done', 'error');
        }
    };

    // === COMPLETE PROJECT (CLIENT) ===
    const completeProject = async () => {
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`/api/projects/${projectId}/complete/`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Failed to complete project');
            showToast('✓ Project completed successfully!', 'success');
            setTimeout(() => window.location.reload(), 1500);
        } catch (err: any) {
            showToast(err.message || 'Failed to complete project', 'error');
        }
    };

    const confirmDeleteBid = async () => {
        if (!bidToDelete) return;
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`/api/projects/${projectId}/bids/${bidToDelete}/`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setProject(prev => prev ? { ...prev, bids: prev.bids.filter(b => b.bid_id !== bidToDelete) } : null);
                setHasBid(false);
                showToast('✓ Bid deleted successfully!', 'success');
            }
        } catch {
            showToast('Failed to delete bid', 'error');
        } finally {
            setShowDeleteConfirm(false);
            setBidToDelete(null);
        }
    };

    const assignTutor = async () => {
        if (!selectedBid) return;
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`/api/projects/${projectId}/assign/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ bid_id: selectedBid }),
            });
            if (!res.ok) throw new Error();
            showToast('✓ Tutor assigned successfully!', 'success');
            setTimeout(() => window.location.reload(), 1500);
        } catch {
            showToast('Failed to assign tutor', 'error');
        }
    };

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

    if (loading) return <div className={styles.loading}>Loading project...</div>;
    if (error) return <div className={styles.errorText}>{error}</div>;
    if (!project) return <div className={styles.errorText}>Project not found</div>;

    const countdown = calculateCountdown(project.deadline);
    const sortedBids = [...(project.bids || [])];
    if (user?.role === 'tutor') {
        sortedBids.sort((a, b) =>
            a.tutor_username === user.username ? -1 : b.tutor_username === user.username ? 1 : 0
        );
    }
    const isAssignedTutor = user?.role === 'tutor' && project.assigned_tutor === user.username;
    const canSubmit = isAssignedTutor && (project.status === 'IN_PROGRESS' || project.status === 'OPEN');
    const canMarkDone = isAssignedTutor && !project.tutor_marked_done && project.status === 'IN_PROGRESS';
    const canComplete = user?.role === 'client' && project.tutor_marked_done && project.status === 'IN_PROGRESS';

    // Display status
    let displayStatus = project.status.replace('_', ' ');
    if (project.tutor_marked_done && project.status === 'IN_PROGRESS') {
        displayStatus = 'AWAITING REVIEW';
    }

    return (
        <div className={styles.container}>
            {/* Toast Notification */}
            {toast && (
                <div className={`${styles.toast} ${styles[toast.type]}`}>
                    {toast.message}
                </div>
            )}

            <div className={styles.card}>
                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>{project.title}</h1>
                        <p className={styles.subtitle}>by {project.client_username}</p>
                    </div>
                </div>

                {/* Details Section */}
                <div className={styles.detailsSection}>
                    <h2 className={styles.sectionTitle}>Details</h2>
                    <div className={styles.detailsTable}>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>TOPIC</span>
                            <span className={styles.detailValue}>{project.title}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>CATEGORY</span>
                            <span className={styles.detailValue}>{project.category || 'ESSAY'}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>SUBJECT AREA</span>
                            <span className={styles.detailValue}>{project.skills_required.join(', ') || 'General'}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>STATUS</span>
                            <span className={`${styles.statusBadge} ${project.status === 'OPEN' ? styles.open : styles.closed}`}>
                                {displayStatus}
                            </span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>CPP</span>
                            <span className={styles.detailValue}>${(project.budget / 3).toFixed(2)}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>$ TOTAL</span>
                            <span className={styles.detailValue}>${project.budget.toLocaleString()}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>DEADLINE</span>
                            <span className={styles.detailValue}>{formatDate(project.deadline)}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>TIME LEFT</span>
                            <div className={styles.countdown}>
                                <span>{countdown.days}d</span>
                                <span>{countdown.hours}h</span>
                                <span>{countdown.minutes}m</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Order Additional Information</h2>
                    <div className={styles.infoBox}>
                        <p className={styles.description}>{project.description}</p>
                    </div>
                </div>

                {/* Project Files */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Project Files ({project.attachment_urls.length})</h2>
                    {project.attachment_urls.length === 0 ? (
                        <p className={styles.noBids}>No files attached to this project</p>
                    ) : (
                        <div className={styles.filesGrid}>
                            {project.attachment_urls.map((file, index) => (
                                <a
                                    key={index}
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.fileLink}
                                >
                                    📄 {file.filename}
                                </a>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submissions Section */}
                {(user?.role === 'client' || isAssignedTutor) && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            Submissions ({project.submissions?.length || 0})
                        </h2>
                        {project.submissions && project.submissions.length > 0 ? (
                            <div className={styles.submissionsGrid}>
                                {project.submissions.map((sub) => (
                                    <div key={sub.submission_id} className={styles.submissionItem}>
                                        <div className={styles.submissionHeader}>
                                            <span className={`${styles.submissionBadge} ${sub.submission_type === 'FINAL' ? styles.finalBadge : styles.draftBadge}`}>
                                                {sub.submission_type}
                                            </span>
                                            <span className={styles.submissionDate}>{formatDate(sub.submitted_at)}</span>
                                        </div>
                                        <a href={sub.file_url} target="_blank" rel="noopener noreferrer" className={styles.fileLink}>
                                            📄 {sub.filename}
                                        </a>
                                        {sub.message && <p className={styles.submissionMessage}>{sub.message}</p>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className={styles.noBids}>No submissions yet</p>
                        )}
                    </div>
                )}

                {/* Upload Section - Tutor Only */}
                {canSubmit && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Submit Work</h2>
                        <form onSubmit={submitCompletion} className={styles.uploadForm}>
                            <div className={styles.fieldGroup}>
                                <label>SELECT FILE TO UPLOAD</label>
                                <input
                                    type="file"
                                    onChange={(e) => setCompletionFile(e.target.files?.[0] || null)}
                                    required
                                    className={styles.fileInput}
                                />
                            </div>
                            <div className={styles.fieldGroup}>
                                <label>SUBMISSION TYPE</label>
                                <select
                                    value={submissionType}
                                    onChange={(e) => setSubmissionType(e.target.value as 'DRAFT' | 'FINAL')}
                                    className={styles.submissionTypeSelect}
                                >
                                    <option value="DRAFT">DRAFT VERSION</option>
                                    <option value="FINAL">FINAL VERSION</option>
                                </select>
                            </div>
                            <div className={styles.fieldGroup}>
                                <label>MY NOTES (OPTIONAL)</label>
                                <textarea
                                    value={completionMessage}
                                    onChange={(e) => setCompletionMessage(e.target.value)}
                                    rows={4}
                                    className={styles.textarea}
                                    placeholder="Add any notes or comments about this submission..."
                                />
                            </div>
                            <button type="submit" className={styles.uploadBtn}>SUBMIT WORK</button>
                        </form>
                    </div>
                )}

                {/* Mark as Done - Tutor Only (Disappears after clicking) */}
                {canMarkDone && (
                    <div className={styles.section}>
                        <button
                            onClick={markAsDone}
                            disabled={project.tutor_marked_done}
                            className={`${styles.markDoneBtn} ${project.tutor_marked_done ? styles.disabled : ''}`}
                        >
                            {project.tutor_marked_done ? 'MARKED AS DONE ✓' : 'MARK AS DONE'}
                        </button>
                        <p className={styles.helpText}>
                            Click once when you've completed all work. This notifies the client for final approval.
                        </p>
                    </div>
                )}

                {/* Already Marked Done - Show Info */}
                {isAssignedTutor && project.tutor_marked_done && (
                    <div className={styles.section}>
                        <div className={styles.infoBanner}>
                            You've marked this project as done. Waiting for client approval.
                        </div>
                    </div>
                )}

                {/* Complete Project - Client Only */}
                {canComplete && (
                    <div className={styles.section}>
                        <button onClick={completeProject} className={styles.completeBtn}>
                            MARK PROJECT AS COMPLETE
                        </button>
                        <p className={styles.helpText}>
                            The tutor has marked this project as done. Review their work and click to complete.
                        </p>
                    </div>
                )}

                {/* Messages Section - Inline (No Navigation) */}
                {conversationId && (user?.role === 'client' || isAssignedTutor) && (
                    <div className={styles.section}>
                        <button
                            onClick={() => setShowMessages(!showMessages)}
                            className={styles.toggleMessagesBtn}
                        >
                            {showMessages ? 'HIDE MESSAGES' : 'OPEN MESSAGES'}
                        </button>

                        {showMessages && (
                            <div className={styles.messagesContainer}>
                                <div className={styles.messagesList}>
                                    {messages.length === 0 ? (
                                        <p className={styles.noBids}>No messages yet. Start the conversation!</p>
                                    ) : (
                                        messages.map((msg) => (
                                            <div
                                                key={msg.message_id}
                                                className={`${styles.messageItem} ${msg.sender === user.role.toUpperCase() ? styles.myMessage : ''}`}
                                            >
                                                <div className={styles.messageHeader}>
                                                    <strong>{msg.sender}</strong>
                                                    <span>{formatDate(msg.timestamp)}</span>
                                                </div>
                                                <p>{msg.message_content}</p>
                                                {msg.attachment_url && (
                                                    <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer">
                                                        📎 {msg.filename} {msg.attachment_type && `(${msg.attachment_type})`}
                                                    </a>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className={styles.messageInput}>
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        rows={3}
                                    />
                                    <button onClick={sendMessage} className={styles.sendBtn}>
                                        SEND
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Bid Form — Tutors Only */}
                {user?.role === 'tutor' && project.status === 'OPEN' && !hasBid && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Place Your Bid</h2>
                        <form onSubmit={submitBid} className={styles.bidForm}>
                            <div className={styles.fieldGroup}>
                                <label>Amount ($)</label>
                                <input
                                    type="number"
                                    name="proposed_amount"
                                    value={bidForm.proposed_amount}
                                    onChange={handleBidChange}
                                    required
                                    min="1"
                                    step="0.01"
                                />
                                {bidErrors.proposed_amount && <span className={styles.errorMsg}>{bidErrors.proposed_amount}</span>}
                            </div>
                            <div className={styles.fieldGroup}>
                                <label>Delivery Timeline</label>
                                <div className={styles.timelineGrid}>
                                    <div><input type="number" name="timelineMonths" value={bidForm.timelineMonths} onChange={handleBidChange} min="0" /><small>Months</small></div>
                                    <div><input type="number" name="timelineDays" value={bidForm.timelineDays} onChange={handleBidChange} min="0" /><small>Days</small></div>
                                    <div><input type="number" name="timelineHours" value={bidForm.timelineHours} onChange={handleBidChange} min="0" /><small>Hours</small></div>
                                    <div><input type="number" name="timelineMinutes" value={bidForm.timelineMinutes} onChange={handleBidChange} min="0" /><small>Min</small></div>
                                </div>
                                {bidErrors.proposed_timeline && <span className={styles.errorMsg}>{bidErrors.proposed_timeline}</span>}
                            </div>
                            <div className={styles.fieldGroup}>
                                <label>Your Message / Cover Letter (min 50 chars)</label>
                                <textarea
                                    name="bid_message"
                                    value={bidForm.bid_message}
                                    onChange={handleBidChange}
                                    rows={8}
                                    required
                                />
                                <div className={styles.charCount}>{bidForm.bid_message.length}/50+</div>
                                {bidErrors.bid_message && <span className={styles.errorMsg}>{bidErrors.bid_message}</span>}
                            </div>
                            <button type="submit" className={styles.submitBtn}>Submit Bid</button>
                        </form>
                    </div>
                )}

                {/* Assign Tutor — Client Only */}
                {user?.role === 'client' && project.status === 'OPEN' && project.bids.length > 0 && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Assign Tutor</h2>
                        <div className={styles.assignRow}>
                            <select
                                className={styles.submissionTypeSelect}
                                value={selectedBid || ''}
                                onChange={e => setSelectedBid(e.target.value)}
                            >
                                <option value="">Select a bid to accept</option>
                                {project.bids.map(bid => (
                                    <option key={bid.bid_id} value={bid.bid_id}>
                                        {bid.tutor_username} — ${bid.proposed_amount} — {formatTimelinePretty(bid.proposed_timeline)}
                                    </option>
                                ))}
                            </select>
                            <button onClick={assignTutor} disabled={!selectedBid} className={styles.submitBtn}>
                                Assign Tutor
                            </button>
                        </div>
                    </div>
                )}

                {/* Bids Table */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Bids ({project.bids?.length || 0})</h2>
                    {project.bids.length === 0 ? (
                        <p className={styles.noBids}>No bids yet. Be the first!</p>
                    ) : (
                        <div className={styles.bidsTableWrapper}>
                            <table className={styles.bidsTable}>
                                <thead>
                                    <tr>
                                        <th>Tutor</th>
                                        <th>Amount</th>
                                        <th>Timeline</th>
                                        <th>Date</th>
                                        {user?.role === 'tutor' && <th></th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedBids.map(bid => (
                                        <tr key={bid.bid_id}>
                                            <td><strong>{bid.tutor_username}</strong></td>
                                            <td className={styles.amount}>${bid.proposed_amount.toLocaleString()}</td>
                                            <td>{formatTimelinePretty(bid.proposed_timeline)}</td>
                                            <td className={styles.date}>{formatDate(bid.created_at)}</td>
                                            {user?.role === 'tutor' && bid.tutor_username === user.username && (
                                                <td>
                                                    <button
                                                        className={styles.deleteBtn}
                                                        onClick={() => {
                                                            setBidToDelete(bid.bid_id);
                                                            setShowDeleteConfirm(true);
                                                        }}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirm Modal */}
            {showDeleteConfirm && (
                <div className={styles.modalOverlay} onClick={() => setShowDeleteConfirm(false)}>
                    <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
                        <h2>Confirm Delete</h2>
                        <p>Are you sure you want to delete your bid? This cannot be undone.</p>
                        <div className={styles.modalActions}>
                            <button className={styles.submitBtn} onClick={confirmDeleteBid}>Yes, Delete</button>
                            <button className={styles.cancelBtn} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectDetailPage;