import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './TutorProfilePage.module.css';

interface User {
    user_id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_picture_url?: string;
    phone?: string;
    role: 'tutor';
}

// ✅ PROFESSIONAL TOAST COMPONENT (Inline)
// FIND AND REPLACE THIS SECTION IN YOUR TutorProfilePage.tsx
// Replace from "// ✅ PROFESSIONAL TOAST COMPONENT (Inline)" to "const TutorProfilePage = () => {"

// ✅ PROFESSIONAL TOAST COMPONENT (Inline)
const Toast = ({
    message,
    type,
    onClose
}: {
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
    onClose: () => void
}) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    // Industry-standard colors (proper success/error colors)
    const config = {
        success: {
            bg: '#ECFDF5',        // Light mint/green
            icon: '✓',
            iconBg: '#10B981',    // Professional green
            text: '#047857',      // Dark green text
            border: '#D1FAE5'     // Subtle green border
        },
        error: {
            bg: '#FEF2F2',        // Light red
            icon: '✕',
            iconBg: '#DC2626',    // Professional red
            text: '#991B1B',      // Dark red text
            border: '#FECACA'     // Subtle red border
        },
        warning: {
            bg: '#FFFBEB',        // Light amber
            icon: '⚠',
            iconBg: '#F59E0B',    // Professional amber
            text: '#92400E',      // Dark amber text
            border: '#FDE68A'     // Subtle amber border
        },
        info: {
            bg: '#EFF6FF',        // Light blue
            icon: 'ℹ',
            iconBg: '#0284C7',    // Professional blue
            text: '#0C2340',      // Dark blue text
            border: '#BAE6FD'     // Subtle blue border
        }
    };

    const c = config[type];

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            animation: 'slideInRight 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
        }}>
            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(400px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes progressBar {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .toast-progress { animation: progressBar 5000ms linear forwards; }
            `}</style>

            <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                background: c.bg,
                padding: '14px 16px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                minWidth: '320px',
                maxWidth: '480px',
                border: `1px solid ${c.border}`,
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Icon Circle */}
                <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: c.iconBg,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '18px',
                    flexShrink: 0
                }}>
                    {c.icon}
                </div>

                {/* Message */}
                <p style={{
                    color: c.text,
                    fontSize: '14px',
                    fontWeight: '500',
                    lineHeight: '1.5',
                    margin: '2px 0 0 0',
                    flex: 1
                }}>
                    {message}
                </p>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: c.text,
                        fontSize: '18px',
                        cursor: 'pointer',
                        padding: '4px 0',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'opacity 0.2s ease',
                        flexShrink: 0,
                        opacity: 0.7
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
                >
                    ✕
                </button>

                {/* Progress Bar (bottom) */}
                <div
                    className="toast-progress"
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        height: '2px',
                        background: c.iconBg
                    }}
                />
            </div>
        </div>
    );
};

const TutorProfilePage = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('account');

    // Password state
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Avatar state
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarLoading, setAvatarLoading] = useState(false);

    // Toast
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

    const navigate = useNavigate();

    const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
        setToast({ message, type });
    };

    // ════════════════════════════════════════════════════
    // AUTH CHECK & LOAD USER
    // ════════════════════════════════════════════════════
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
                navigate('/login');
                return;
            }
            setUser(u);
        } catch {
            localStorage.clear();
            navigate('/login');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // ════════════════════════════════════════════════════
    // PASSWORD CHANGE
    // ════════════════════════════════════════════════════
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

    const handleChangePassword = async () => {
        const token = localStorage.getItem('access_token');

        if (!token) {
            showToast('Session expired. Please login again.', 'error');
            navigate('/login');
            return;
        }

        if (!oldPassword || !newPassword || !confirmPassword) {
            showToast('Please fill in all password fields', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }

        const failedRequirements = passwordRequirements.filter(req => !req.regex.test(newPassword));
        if (failedRequirements.length > 0) {
            showToast(`Password must have: ${failedRequirements[0].text}`, 'error');
            return;
        }

        setPasswordLoading(true);

        try {
            // ✅ CORRECT ENDPOINT with user ID
            const res = await fetch(
                `http://localhost:8001/api/users/${user?.user_id}/change-password/`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        old_password: oldPassword,
                        new_password: newPassword
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to change password');
            }

            if (data.success) {
                showToast('Password changed successfully!', 'success');
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                showToast(data.message || 'Failed to change password', 'error');
            }
        } catch (err: any) {
            console.error('Password change error:', err);
            showToast(err.message || 'Network error. Please try again.', 'error');
        } finally {
            setPasswordLoading(false);
        }
    };

    // ════════════════════════════════════════════════════
    // AVATAR MANAGEMENT
    // ════════════════════════════════════════════════════
    const presetAvatars = [
        '/avatars/avatar_1.png',
        '/avatars/avatar_2.svg',
    ];

    const handleAvatarSelect = (avatarUrl: string) => {
        setSelectedAvatar(avatarUrl);
        setAvatarPreview(avatarUrl);
        setAvatarFile(null);
    };

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showToast('File size must be less than 5MB', 'error');
                return;
            }

            if (!file.type.startsWith('image/')) {
                showToast('Please upload an image file', 'error');
                return;
            }

            setAvatarFile(file);
            const previewUrl = URL.createObjectURL(file);
            setAvatarPreview(previewUrl);
            setSelectedAvatar(null);
        }
    };

    const handleSaveAvatar = async () => {
        const token = localStorage.getItem('access_token');

        if (!token) {
            showToast('Session expired. Please login again.', 'error');
            navigate('/login');
            return;
        }

        setAvatarLoading(true);

        try {
            const formData = new FormData();

            if (avatarFile) {
                formData.append('avatar', avatarFile);
            } else if (selectedAvatar) {
                formData.append('avatar_url', selectedAvatar);
            } else {
                showToast('Please select or upload an avatar', 'warning');
                setAvatarLoading(false);
                return;
            }

            // ✅ CORRECT ENDPOINT with user ID
            const res = await fetch(
                `http://localhost:8001/api/users/${user?.user_id}/update-avatar/`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Failed to update avatar');
            }

            // Update local state
            const updatedUser = { ...user, profile_picture_url: data.avatar_url };
            setUser(updatedUser as User);
            localStorage.setItem('user', JSON.stringify(updatedUser));

            // Close modal
            setShowAvatarModal(false);
            setAvatarPreview(null);
            setAvatarFile(null);
            setSelectedAvatar(null);

            showToast('Avatar updated successfully!', 'success');

        } catch (err: any) {
            console.error('Avatar update error:', err);
            showToast(err.message || 'Failed to update avatar', 'error');
        } finally {
            setAvatarLoading(false);
        }
    };

    // ════════════════════════════════════════════════════
    // RENDER
    // ════════════════════════════════════════════════════
    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (!user) return null;

    const strength = getPasswordStrength(newPassword);
    const strengthColor = strength < 40 ? '#ef4444' : strength < 80 ? '#f59e0b' : '#10b981';

    return (
        <div className={styles.page}>
            {/* ✅ PROFESSIONAL TOAST */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* NAVBAR */}
            <nav className={styles.navbar}>
                <div className={styles.navContent}>
                    <Link to="/" className={styles.logo}>HomeworkHelper</Link>
                    <Link to="/tutor/profile" className={styles.username}>@{user.username}</Link>
                    <div className={styles.navLinks}>
                        <Link to="/tutor/dashboard">Dashboard</Link>
                        <Link to="/tutor/my-projects">My Projects</Link>
                        <Link to="/messaging">Messages</Link>
                        <Link to="/tutor/payments">Payments</Link>
                        <Link to="/tutor/profile">Profile</Link>
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                </div>
            </nav>

            {/* MAIN CONTAINER */}
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1>Profile Settings</h1>
                    <p>Manage your account, notifications, and preferences.</p>
                </header>

                {/* TABS */}
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'account' ? styles.active : ''}`}
                        onClick={() => setActiveTab('account')}
                    >
                        Account
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'notifications' ? styles.active : ''}`}
                        onClick={() => setActiveTab('notifications')}
                    >
                        Notifications
                    </button>
                </div>

                {/* ACCOUNT TAB */}
                {activeTab === 'account' && (
                    <div className={styles.tabContent}>
                        {/* Profile Info Card */}
                        <div className={styles.card}>
                            <h2>Account Settings</h2>
                            <div className={styles.profileInfo}>
                                <div className={styles.avatarContainer}>
                                    <img
                                        src={user.profile_picture_url || '/images/default-helper-profile.jpg'}
                                        alt="Profile"
                                        className={styles.avatar}
                                    />
                                    <button
                                        className={styles.changeAvatarButton}
                                        onClick={() => setShowAvatarModal(true)}
                                    >
                                        Change Avatar
                                    </button>
                                </div>
                                <div>
                                    <label>Username</label>
                                    <input type="text" value={user.username} readOnly />
                                </div>
                                <div>
                                    <label>Email</label>
                                    <input type="email" value={user.email} readOnly />
                                </div>
                            </div>
                        </div>

                        {/* Change Password Card */}
                        <div className={styles.card}>
                            <h3>Change Password</h3>
                            <div className={styles.formGroup}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Current Password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
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
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Confirm New Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                    <input
                                        type="checkbox"
                                        checked={showPassword}
                                        onChange={() => setShowPassword(!showPassword)}
                                    />
                                    Show passwords
                                </label>
                                <button
                                    className={styles.primaryButton}
                                    onClick={handleChangePassword}
                                    disabled={passwordLoading}
                                >
                                    {passwordLoading ? 'Changing...' : 'Change Password'}
                                </button>
                            </div>

                            {/* Requirements */}
                            <div style={{
                                background: '#f1f5f9',
                                padding: '12px',
                                borderRadius: '8px',
                                fontSize: '13px',
                                marginTop: '12px'
                            }}>
                                <p style={{ fontWeight: '600', marginBottom: '8px' }}>
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
                        </div>
                    </div>
                )}

                {/* NOTIFICATIONS TAB */}
                {activeTab === 'notifications' && (
                    <div className={styles.tabContent}>
                        <div className={styles.card}>
                            <h2>Notifications</h2>
                            <p>Email notification preferences coming soon...</p>
                        </div>
                    </div>
                )}

                {/* AVATAR MODAL */}
                {showAvatarModal && (
                    <>
                        <div className={styles.overlay} onClick={() => setShowAvatarModal(false)} />
                        <div className={styles.modal}>
                            <h2>Update Avatar</h2>

                            <div className={styles.avatarPreview}>
                                {avatarPreview && (
                                    <img src={avatarPreview} alt="Preview" className={styles.avatar} />
                                )}
                            </div>

                            <h3>Choose Preset Avatar</h3>
                            <div className={styles.avatarGrid}>
                                {presetAvatars.map((avatar, index) => (
                                    <img
                                        key={index}
                                        src={avatar}
                                        alt={`Avatar ${index + 1}`}
                                        className={`${styles.avatarOption} ${selectedAvatar === avatar ? styles.selected : ''}`}
                                        onClick={() => handleAvatarSelect(avatar)}
                                    />
                                ))}
                            </div>

                            <div className={styles.uploadSection}>
                                <label htmlFor="avatarUpload">Or Upload Custom Profile Picture</label>
                                <input
                                    id="avatarUpload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                />
                                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                    Max size: 5MB. Supported: JPG, PNG, GIF, WebP
                                </p>
                            </div>

                            <div className={styles.modalActions}>
                                <button
                                    className={styles.primaryButton}
                                    onClick={handleSaveAvatar}
                                    disabled={!avatarPreview || avatarLoading}
                                >
                                    {avatarLoading ? 'Saving...' : 'Save Avatar'}
                                </button>
                                <button
                                    className={styles.cancelButton}
                                    onClick={() => setShowAvatarModal(false)}
                                    disabled={avatarLoading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TutorProfilePage;