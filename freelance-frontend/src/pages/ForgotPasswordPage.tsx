// ForgotPasswordPage.tsx - COMPLETE WITH BUILT-IN TOAST
import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './ForgotPasswordPage.module.css';

// Built-in Toast Component
const Toast = ({ message, type, onClose }: { message: string; type: string; onClose: () => void }) => {
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    const colors = {
        success: { bg: '#d1fae5', border: '#10b981', icon: '#065f46' },
        error: { bg: '#fee2e2', border: '#ef4444', icon: '#991b1b' },
        warning: { bg: '#fef3c7', border: '#f59e0b', icon: '#92400e' },
        info: { bg: '#dbeafe', border: '#3b82f6', icon: '#1e40af' }
    };

    const color = colors[type as keyof typeof colors] || colors.info;

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
            minWidth: '320px',
            maxWidth: '420px',
            animation: 'slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            borderLeft: `4px solid ${color.border}`
        }}>
            <style>{`
                @keyframes slideIn {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `}</style>
            <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: color.bg,
                color: color.icon,
                fontWeight: 'bold',
                fontSize: '18px',
                flexShrink: 0
            }}>
                {icons[type as keyof typeof icons]}
            </div>
            <div style={{
                flex: 1,
                color: '#1f2937',
                fontSize: '14px',
                fontWeight: '500',
                lineHeight: '1.5'
            }}>
                {message}
            </div>
            <button
                onClick={onClose}
                style={{
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    fontSize: '20px',
                    padding: '4px',
                    lineHeight: 1,
                    transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#4b5563'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
            >
                ✕
            </button>
        </div>
    );
};

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

    const showToast = (message: string, type: string) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(import.meta.env.VITE_API_URL + '/auth/password-reset/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(true);
                showToast('Password reset link sent! Check your email.', 'success');
            } else {
                switch (data.error_code) {
                    case 'EMAIL_NOT_FOUND':
                        showToast('No account found with this email address', 'error');
                        break;
                    case 'ACCOUNT_INACTIVE':
                        showToast('This account is inactive. Please contact support.', 'error');
                        break;
                    case 'EMAIL_NOT_VERIFIED':
                        showToast('Please verify your email first. Check your inbox.', 'warning');
                        break;
                    case 'RATE_LIMIT_EXCEEDED':
                        showToast('Too many attempts. Please try again in 1 hour.', 'warning');
                        break;
                    default:
                        showToast(data.message || 'Failed to send reset email', 'error');
                }
            }
        } catch (err) {
            showToast('Network error. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Forgot Password?</h1>
                        <p className={styles.subtitle}>
                            Enter your email and we'll send you a reset link
                        </p>
                    </div>

                    {success ? (
                        <div className={styles.success}>
                            <div className={styles.successIcon}>✓</div>
                            <h2>Check Your Email</h2>
                            <p>
                                We've sent a password reset link to <strong>{email}</strong>
                            </p>
                            <p className={styles.note}>
                                The link will expire in 1 hour. Check your spam folder if you don't see it.
                            </p>
                            <Link to="/login" className={styles.backBtn}>
                                Back to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Email Address</label>
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className={styles.input}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={styles.submitBtn}
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>

                            <div className={styles.footer}>
                                <Link to="/login" className={styles.link}>
                                    ← Back to Login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
};

export default ForgotPasswordPage;