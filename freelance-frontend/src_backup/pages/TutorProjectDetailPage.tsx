import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './ProjectDetailPage.module.css';

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
    skills_required: string[];
    category: string;
    assigned_tutor?: string;
    attachment_urls: Attachment[];
    submissions?: Submission[];
    tutor_marked_done: boolean;
}

interface Toast {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
}

const TutorProjectDetailPage = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any | null>(null);
    const [submissionFiles, setSubmissionFiles] = useState<File[]>([]);
    const [submissionType, setSubmissionType] = useState<'draft' | 'final' | 'revision' | 'additional' | ''>('');
    const [submissionMessage, setSubmissionMessage] = useState('');
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [showMessages, setShowMessages] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const navigate = useNavigate();

    // Toast notification system
    const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
        const id = Date.now().toString() + Math.random();
        const toast: Toast = { id, type, message };
        setToasts(prev => [...prev, toast]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

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

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

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
                    } else if (typeof attachmentUrls[0] === 'object' && attachmentUrls[0].url) {
                        attachmentUrls = attachmentUrls.map((att: any) => ({
                            url: att.url,
                            filename: att.filename || decodeURIComponent(att.url.split('/').pop()?.split('?')[0] || 'file'),
                        }));
                    }
                } else {
                    attachmentUrls = [];
                }
                data.attachment_urls = attachmentUrls;

                setProject(data as Project);

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
                    sender: 'TUTOR',
                }),
            });
            if (res.ok) {
                setNewMessage('');
                loadMessages();
                showToast('Message sent!', 'success');
            }
        } catch (err) {
            console.error('Error sending message:', err);
            showToast('Failed to send message', 'error');
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newFiles = Array.from(files);
        const maxSize = 50 * 1024 * 1024; // 50MB

        const validFiles = newFiles.filter(f => f.size <= maxSize);
        const invalidFiles = newFiles.filter(f => f.size > maxSize);

        if (invalidFiles.length > 0) {
            showToast(
                `${invalidFiles.length} file(s) exceed 50MB limit and were not added`,
                'warning'
            );
        }

        // Add valid files (avoid duplicates by name)
        setSubmissionFiles(prev => {
            const existingNames = prev.map(f => f.name);
            const uniqueFiles = validFiles.filter(f => !existingNames.includes(f.name));

            if (uniqueFiles.length < validFiles.length) {
                showToast(
                    `${validFiles.length - uniqueFiles.length} duplicate file(s) were skipped`,
                    'info'
                );
            }

            if (uniqueFiles.length > 0) {
                showToast(`${uniqueFiles.length} file(s) added`, 'success');
            }

            return [...prev, ...uniqueFiles];
        });
    };

    const removeFile = (index: number) => {
        const fileName = submissionFiles[index].name;
        setSubmissionFiles(prev => prev.filter((_, i) => i !== index));
        showToast(`${fileName} removed`, 'info');
    };

    const handleSubmitWork = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!project) return;

        if (submissionFiles.length === 0) {
            showToast('Please select at least one file to upload', 'error');
            return;
        }

        if (!submissionType) {
            showToast('Please select a submission type', 'error');
            return;
        }

        const token = localStorage.getItem('access_token');
        if (!token) {
            showToast('Authentication required. Please log in again.', 'error');
            navigate('/login');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        const formData = new FormData();

        // Append multiple files with 'files' key (backend expects this)
        submissionFiles.forEach(file => {
            formData.append('files', file);
        });

        // Append other data
        formData.append('type', submissionType);
        if (submissionMessage.trim()) {
            formData.append('message', submissionMessage);
        }

        try {
            showToast(`Uploading ${submissionFiles.length} file(s)...`, 'info');

            // Simulate progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            const res = await fetch(`/api/projects/${project.project_id}/submit/`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || 'Submission failed');
            }

            await res.json();

            showToast(
                `✓ ${submissionFiles.length} file(s) submitted successfully!`,
                'success'
            );

            // Reset form
            setSubmissionFiles([]);
            setSubmissionType('');
            setSubmissionMessage('');

            // Reload page after delay
            setTimeout(() => {
                window.location.reload();
            }, 2000);

        } catch (err) {
            console.error('Submission error:', err);
            showToast(
                err instanceof Error ? err.message : 'Failed to submit work. Please try again.',
                'error'
            );
        } finally {
            setIsUploading(false);
            setTimeout(() => setUploadProgress(0), 1000);
        }
    };

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

            setProject(prev => prev ? { ...prev, tutor_marked_done: true } : null);
            showToast('Project marked as done! Waiting for client approval.', 'success');
        } catch (err: any) {
            showToast(err.message || 'Failed to mark as done', 'error');
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

    const getToastIcon = (type: string) => {
        switch (type) {
            case 'success': return '✓';
            case 'error': return '✕';
            case 'warning': return '⚠';
            case 'info': return 'ℹ';
            default: return '•';
        }
    };

    if (loading) return <div className={styles.loading}>Loading project...</div>;
    if (error) return <div className={styles.errorText}>{error}</div>;
    if (!project) return <div className={styles.errorText}>Project not found</div>;

    const countdown = calculateCountdown(project.deadline);
    const isInProgress = ['IN_PROGRESS', 'IN_REVISION'].includes(project.status) || project.tutor_marked_done;

    return (
        <div className={styles.container}>
            {/* Toast Container */}
            <div style={{
                position: 'fixed',
                top: '1rem',
                right: '1rem',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
            }}>
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        style={{
                            padding: '1rem 1.5rem',
                            borderRadius: '0.5rem',
                            color: 'white',
                            fontWeight: 'bold',
                            minWidth: '300px',
                            maxWidth: '400px',
                            backgroundColor:
                                toast.type === 'success' ? '#10b981' :
                                    toast.type === 'error' ? '#ef4444' :
                                        toast.type === 'warning' ? '#f59e0b' : '#3b82f6',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                            animation: 'slideInRight 0.3s ease-out',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            position: 'relative',
                        }}
                    >
                        <span style={{ fontSize: '1.5rem' }}>{getToastIcon(toast.type)}</span>
                        <span style={{ flex: 1 }}>{toast.message}</span>
                        <button
                            onClick={() => removeToast(toast.id)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                padding: '0 0.5rem',
                                lineHeight: 1,
                            }}
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `}</style>

            {project.tutor_marked_done && (
                <div className={styles.infoBanner}>
                    Success! Final work submitted. Waiting for client to mark project as complete.
                </div>
            )}

            <div className={styles.card}>
                <div className={styles.header}>
                    <h1 className={styles.title}>{project.title}</h1>
                    <p className={styles.subtitle}>Client: {project.client_username}</p>
                </div>

                <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                        <span className={styles.label}>Budget</span>
                        <p className={styles.value}>${project.budget.toLocaleString()}</p>
                    </div>
                    <div className={styles.detailItem}>
                        <span className={styles.label}>Deadline</span>
                        <p className={styles.value}>{formatDate(project.deadline)}</p>
                    </div>
                    <div className={styles.detailItem}>
                        <span className={styles.label}>Time Left</span>
                        <div className={styles.countdown}>
                            <span>{countdown.days.toString().padStart(2, '0')}</span>:
                            <span>{countdown.hours.toString().padStart(2, '0')}</span>:
                            <span>{countdown.minutes.toString().padStart(2, '0')}</span>
                        </div>
                        <div className={styles.countdownLabels}>
                            <small>DAYS</small>
                            <small>HRS</small>
                            <small>MIN</small>
                        </div>
                    </div>
                    <div className={styles.detailItem}>
                        <span className={styles.label}>Status</span>
                        <p className={`${styles.statusBadge} ${project.status === 'IN_PROGRESS' ? styles.open : styles.closed}`}>
                            {project.status.replace('_', ' ')}
                        </p>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Project Description</h2>
                    <p className={styles.description}>{project.description}</p>
                </div>

                {project.skills_required.length > 0 && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Required Skills</h2>
                        <div className={styles.skills}>
                            {project.skills_required.map(skill => (
                                <span key={skill} className={styles.skillTag}>{skill}</span>
                            ))}
                        </div>
                    </div>
                )}

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
                                    className={styles.fileItem}
                                >
                                    <div className={styles.fileIcon}>📄</div>
                                    <div className={styles.fileName}>{file.filename}</div>
                                    <div className={styles.fileSize}>Download</div>
                                </a>
                            ))}
                        </div>
                    )}
                </div>

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

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Messages</h2>
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
                                            className={`${styles.messageItem} ${msg.sender === 'TUTOR' ? styles.myMessage : ''}`}
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

                {isInProgress && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Submit Your Work</h2>
                        <form onSubmit={handleSubmitWork} className={styles.bidForm}>
                            <div className={styles.fieldGroup}>
                                <label>Submission Type *</label>
                                <select
                                    className={styles.submissionTypeSelect}
                                    value={submissionType}
                                    onChange={e => setSubmissionType(e.target.value as any)}
                                    required
                                    disabled={isUploading}
                                >
                                    <option value="">Select type</option>
                                    <option value="draft">Draft Version</option>
                                    <option value="final">Final Version</option>
                                    <option value="revision">Revision</option>
                                    <option value="additional">Additional Materials</option>
                                </select>
                            </div>

                            <div className={styles.fieldGroup}>
                                <label>Upload Files (Multiple Allowed) *</label>
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileSelect}
                                    accept=".pdf,.doc,.docx,.txt,.zip,.jpg,.png,.ppt,.pptx,.xls,.xlsx"
                                    disabled={isUploading}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '2px dashed #d1d5db',
                                        borderRadius: '0.5rem',
                                        cursor: 'pointer',
                                    }}
                                />
                                <small style={{ color: '#6b7280', display: 'block', marginTop: '0.5rem' }}>
                                    Max 50MB per file. Accepted: PDF, DOC, DOCX, TXT, ZIP, JPG, PNG, PPT, XLS
                                </small>
                            </div>

                            {submissionFiles.length > 0 && (
                                <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                                    <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                        Selected Files ({submissionFiles.length})
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {submissionFiles.map((file, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '0.75rem',
                                                    backgroundColor: '#f9fafb',
                                                    borderRadius: '0.5rem',
                                                    border: '1px solid #e5e7eb',
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                                    <span style={{ fontSize: '1.25rem' }}>📄</span>
                                                    <div style={{ flex: 1 }}>
                                                        <p style={{ fontWeight: '500', fontSize: '0.875rem', margin: 0 }}>
                                                            {file.name}
                                                        </p>
                                                        <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                                                            {formatFileSize(file.size)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    disabled={isUploading}
                                                    style={{
                                                        color: '#ef4444',
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.875rem',
                                                        padding: '0.25rem 0.5rem',
                                                    }}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className={styles.fieldGroup}>
                                <label>Notes (Optional)</label>
                                <textarea
                                    value={submissionMessage}
                                    onChange={(e) => setSubmissionMessage(e.target.value)}
                                    rows={4}
                                    className={styles.textarea}
                                    placeholder="Add any notes or comments about this submission..."
                                    disabled={isUploading}
                                />
                            </div>

                            {isUploading && uploadProgress > 0 && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{
                                        width: '100%',
                                        height: '0.5rem',
                                        backgroundColor: '#e5e7eb',
                                        borderRadius: '9999px',
                                        overflow: 'hidden',
                                    }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${uploadProgress}%`,
                                            backgroundColor: '#3b82f6',
                                            transition: 'width 0.3s ease',
                                        }} />
                                    </div>
                                    <p style={{
                                        textAlign: 'center',
                                        fontSize: '0.875rem',
                                        color: '#6b7280',
                                        marginTop: '0.5rem',
                                    }}>
                                        Uploading... {uploadProgress}%
                                    </p>
                                </div>
                            )}

                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={isUploading || submissionFiles.length === 0}
                                style={{
                                    opacity: (isUploading || submissionFiles.length === 0) ? 0.5 : 1,
                                    cursor: (isUploading || submissionFiles.length === 0) ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {isUploading
                                    ? `Uploading ${submissionFiles.length} file(s)...`
                                    : `Submit ${submissionFiles.length > 0 ? submissionFiles.length : ''} Files${submissionFiles.length > 1 ? 's' : ''}`
                                }
                            </button>
                        </form>
                    </div>
                )}

                {isInProgress && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Mark as Done</h2>
                        <button
                            onClick={markAsDone}
                            className={styles.markDoneBtn}
                            disabled={project.tutor_marked_done}
                        >
                            {project.tutor_marked_done ? 'Marked as Done' : 'Mark Project as Done'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TutorProjectDetailPage;