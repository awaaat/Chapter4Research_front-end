// ResetPasswordPage.tsx - COMPLETE WITH BUILT-IN TOAST
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

const ResetPasswordPage = () => {
    const { uid, token } = useParams();
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const showToast = (message: string, type: string) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    const passwordRequirements = [
        { regex: /.{8,}/, text: 'At least 8 characters' },
        { regex: /[A-Z]/, text: 'One uppercase letter' },
        { regex: /[a-z]/, text: 'One lowercase letter' },
        { regex: /[0-9]/, text: 'One number' },
        { regex: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/, text: 'One special character' }
    ];

    const getPasswordStrength = (password: string) => {
        const passed = passwordRequirements.filter(req => req.regex.test(password)).length;
        return (passed / passwordRequirements.length) * 100;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        const failedRequirements = passwordRequirements.filter(
            req => !req.regex.test(newPassword)
        );

        if (failedRequirements.length > 0) {
            showToast(`Password must have: ${failedRequirements[0].text}`, 'error');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:8001/api/auth/password-reset-confirm/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid,
                    token,
                    new_password: newPassword,
                    confirm_password: confirmPassword
                })
            });

            const data = await response.json();

            if (data.success) {
                showToast('✓ Password reset successful! Redirecting to login...', 'success');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                switch (data.error_code) {
                    case 'INVALID_TOKEN':
                        showToast('This reset link is invalid or expired. Please request a new one.', 'error');
                        break;
                    case 'PASSWORD_MISMATCH':
                        showToast('Passwords do not match', 'error');
                        break;
                    case 'WEAK_PASSWORD':
                        showToast(data.message || 'Password does not meet requirements', 'error');
                        break;
                    default:
                        showToast(data.message || 'Failed to reset password', 'error');
                }
            }
        } catch (err) {
            showToast('Network error. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const strength = getPasswordStrength(newPassword);
    const strengthColor = strength < 40 ? '#ef4444' : strength < 80 ? '#f59e0b' : '#10b981';

    return (
        <>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Reset Password</h1>
                        <p className={styles.subtitle}>
                            Enter your new password below
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>New Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="At least 8 characters"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className={styles.input}
                                    style={{ paddingRight: '45px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '18px',
                                        color: '#64748b'
                                    }}
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                            {newPassword && (
                                <div style={{ marginTop: '8px' }}>
                                    <div style={{
                                        height: '4px',
                                        background: '#e2e8f0',
                                        borderRadius: '4px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${strength}%`,
                                            background: strengthColor,
                                            transition: 'all 0.3s'
                                        }} />
                                    </div>
                                    <p style={{
                                        fontSize: '12px',
                                        color: strengthColor,
                                        marginTop: '4px'
                                    }}>
                                        {strength < 40 ? 'Weak' : strength < 80 ? 'Medium' : 'Strong'}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Confirm Password</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Repeat your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className={styles.input}
                            />
                        </div>

                        <div style={{
                            background: '#f1f5f9',
                            padding: '12px',
                            borderRadius: '8px',
                            fontSize: '13px'
                        }}>
                            <p style={{ fontWeight: '600', marginBottom: '8px', color: '#334155' }}>
                                Password must contain:
                            </p>
                            {passwordRequirements.map((req, i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    color: req.regex.test(newPassword) ? '#10b981' : '#94a3b8',
                                    marginBottom: '4px'
                                }}>
                                    <span>{req.regex.test(newPassword) ? '✓' : '○'}</span>
                                    <span>{req.text}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={styles.submitBtn}
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default ResetPasswordPage;