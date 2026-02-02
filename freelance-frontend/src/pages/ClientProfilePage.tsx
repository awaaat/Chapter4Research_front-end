import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../utils/apiClient';
import styles from './ClientProfilePage.module.css';

interface User {
    user_id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar?: string;
    phone?: string;
}

const defaultAvatars = [
    '/avatars/avatar1.png',
    '/avatars/avatar2.png',
    '/avatars/avatar3.png',
    '/avatars/avatar4.png',
    '/avatars/avatar5.png',
];

const ClientProfilePage = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('account');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [initialPhone, setInitialPhone] = useState('');
    const [emailPrefs, setEmailPrefs] = useState({
        newBid: false,
        newMessage: false,
        projectUpdate: false,
        paymentReminder: false,
    });
    const [initialEmailPrefs, setInitialEmailPrefs] = useState({
        newBid: false,
        newMessage: false,
        projectUpdate: false,
        paymentReminder: false,
    });
    const [notificationConditions, setNotificationConditions] = useState({
        projects: false,
        payments: false,
        communication: false,
        other: false,
    });
    const [initialNotificationConditions, setInitialNotificationConditions] = useState({
        projects: false,
        payments: false,
        communication: false,
        other: false,
    });
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [nameOnCard, setNameOnCard] = useState('');
    const [billingLine1, setBillingLine1] = useState('');
    const [billingLine2, setBillingLine2] = useState('');
    const [country, setCountry] = useState('');
    const [state, setState] = useState('');
    const [city, setCity] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [paypalEmail, setPaypalEmail] = useState('');
    const [initialBillingData, setInitialBillingData] = useState({
        cardNumber: '',
        expiry: '',
        cvv: '',
        nameOnCard: '',
        billingLine1: '',
        billingLine2: '',
        country: '',
        state: '',
        city: '',
        zipCode: '',
        paypalEmail: '',
    });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const navigate = useNavigate();

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');
        if (!token || !storedUser) {
            navigate('/login');
            return;
        }
        try {
            const u = JSON.parse(storedUser);
            if (u.role !== 'client') {
                navigate('/login');
                return;
            }
            setUser(u);
            setPhone(u.phone || '');
            setInitialPhone(u.phone || '');
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

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            showToast('Please fill in all password fields', 'error');
            return;
        }
        if (newPassword !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }
        if (newPassword.length < 8) {
            showToast('Password must be at least 8 characters', 'error');
            return;
        }
        try {
            const res = await apiClient.post('/change-password/', {
                old_password: oldPassword,
                new_password: newPassword
            });
            if (!res.ok) throw new Error('Failed to change password');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            showToast('✓ Password changed successfully!', 'success');
        } catch (err) {
            showToast('Error changing password', 'error');
        }
    };

    const hasEmailPrefsChanged = () => {
        return JSON.stringify(emailPrefs) !== JSON.stringify(initialEmailPrefs);
    };

    const handleUpdateEmailSettings = () => {
        if (!hasEmailPrefsChanged()) {
            showToast('No changes to save', 'error');
            return;
        }
        // TODO: API call to update email preferences
        setInitialEmailPrefs({ ...emailPrefs });
        showToast('✓ Email settings updated!', 'success');
    };

    const hasMobileChanged = () => {
        return phone !== initialPhone;
    };

    const handleUpdateMobile = () => {
        if (!hasMobileChanged()) {
            showToast('No changes to save', 'error');
            return;
        }
        // TODO: API call to update phone
        setInitialPhone(phone);
        showToast('✓ Mobile settings updated!', 'success');
    };

    const hasNotificationConditionsChanged = () => {
        return JSON.stringify(notificationConditions) !== JSON.stringify(initialNotificationConditions);
    };

    const handleUpdateNotifications = () => {
        if (!hasNotificationConditionsChanged()) {
            showToast('No changes to save', 'error');
            return;
        }
        // TODO: API call to update notification conditions
        setInitialNotificationConditions({ ...notificationConditions });
        showToast('✓ Notification conditions updated!', 'success');
    };

    const hasBillingChanged = () => {
        return (
            cardNumber !== initialBillingData.cardNumber ||
            expiry !== initialBillingData.expiry ||
            cvv !== initialBillingData.cvv ||
            nameOnCard !== initialBillingData.nameOnCard ||
            billingLine1 !== initialBillingData.billingLine1 ||
            billingLine2 !== initialBillingData.billingLine2 ||
            country !== initialBillingData.country ||
            state !== initialBillingData.state ||
            city !== initialBillingData.city ||
            zipCode !== initialBillingData.zipCode ||
            paypalEmail !== initialBillingData.paypalEmail
        );
    };

    const handleSaveBilling = () => {
        if (!hasBillingChanged()) {
            showToast('No changes to save', 'error');
            return;
        }
        // TODO: API call to update billing info
        setInitialBillingData({
            cardNumber,
            expiry,
            cvv,
            nameOnCard,
            billingLine1,
            billingLine2,
            country,
            state,
            city,
            zipCode,
            paypalEmail,
        });
        showToast('✓ Billing settings updated!', 'success');
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') {
            showToast('Please type DELETE to confirm', 'error');
            return;
        }
        try {
            const res = await apiClient.delete(`/users/${user?.user_id}/`);
            if (!res.ok) throw new Error('Failed to delete account');
            localStorage.clear();
            showToast('Account deleted successfully', 'success');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            showToast('Error deleting account', 'error');
        }
    };

    const handleAvatarSelect = (avatarUrl: string) => {
        setSelectedAvatar(avatarUrl);
        setAvatarPreview(avatarUrl);
        setAvatarFile(null);
    };

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const previewUrl = URL.createObjectURL(file);
            setAvatarPreview(previewUrl);
            setSelectedAvatar(null);
        }
    };

    const handleSaveAvatar = async () => {
        try {
            let newAvatarUrl: string;
            if (avatarFile) {
                const formData = new FormData();
                formData.append('avatar', avatarFile);
                const res = await apiClient.post('/upload-avatar/', formData);
                if (!res.ok) throw new Error('Failed to upload avatar');
                const data = await res.json();
                newAvatarUrl = data.avatar_url;
            } else if (selectedAvatar) {
                const res = await apiClient.post('/update-avatar/', {
                    avatar: selectedAvatar
                });
                if (!res.ok) throw new Error('Failed to update avatar');
                const data = await res.json();
                newAvatarUrl = data.avatar;
            } else {
                return;
            }
            setUser((prev) => prev ? { ...prev, avatar: newAvatarUrl } : null);
            localStorage.setItem('user', JSON.stringify({ ...user, avatar: newAvatarUrl }));
            setShowAvatarModal(false);
            setAvatarPreview(null);
            setAvatarFile(null);
            setSelectedAvatar(null);
            showToast('✓ Avatar updated successfully!', 'success');
        } catch (err) {
            showToast('Error updating avatar', 'error');
        }
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (!user) return null;

    return (
        <div className={styles.page}>
            <nav className={styles.navbar}>
                <div className={styles.navContent}>
                    <Link to="/" className={styles.logo}>HomeworkHelper</Link>
                    <Link to="/client/profile" className={styles.username}>@{user.username}</Link>
                    <div className={styles.navLinks}>
                        <Link to="/client/dashboard">Dashboard</Link>
                        <Link to="/client/projects">My Projects</Link>
                        <Link to="/messaging">Messages</Link>
                        <Link to="/client/wallet">Balance</Link>
                        <Link to="/client/profile">Profile</Link>
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                </div>
            </nav>

            <div className={styles.container}>
                <header className={styles.header}>
                    <h1>Profile Settings</h1>
                    <p>Manage your account, notifications, and billing information.</p>
                </header>

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
                    <button
                        className={`${styles.tab} ${activeTab === 'billing' ? styles.active : ''}`}
                        onClick={() => setActiveTab('billing')}
                    >
                        Billing
                    </button>
                </div>

                {activeTab === 'account' && (
                    <div className={styles.tabContent}>
                        <div className={styles.card}>
                            <h2>Account Settings</h2>
                            <div className={styles.profileInfo}>
                                <div className={styles.avatarContainer}>
                                    <img src={user.avatar || '/default-avatar.png'} alt="Profile" className={styles.avatar} />
                                    <button className={styles.changeAvatarButton} onClick={() => setShowAvatarModal(true)}>
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
                        <div className={styles.card}>
                            <h3>Change Password</h3>
                            <div className={styles.formGroup}>
                                <input
                                    type="password"
                                    placeholder="Old Password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                />
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <input
                                    type="password"
                                    placeholder="Confirm New Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <button className={styles.primaryButton} onClick={handleChangePassword}>
                                    Change Password
                                </button>
                            </div>
                            <p className={styles.note}>Your new password must be at least 8 characters.</p>
                        </div>
                        <div className={styles.card + ' ' + styles.dangerZone}>
                            <h3>Delete Account</h3>
                            <p>This action is permanent and cannot be undone. All your data will be removed.</p>
                            <button className={styles.deleteButton} onClick={() => setShowDeleteConfirm(true)}>
                                Delete Account
                            </button>
                            {showDeleteConfirm && (
                                <div className={styles.confirmModal}>
                                    <p>Type "DELETE" to confirm:</p>
                                    <input
                                        type="text"
                                        value={deleteConfirmText}
                                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    />
                                    <div>
                                        <button
                                            className={styles.confirmButton}
                                            disabled={deleteConfirmText !== 'DELETE'}
                                            onClick={handleDeleteAccount}
                                        >
                                            Confirm Delete
                                        </button>
                                        <button className={styles.cancelButton} onClick={() => setShowDeleteConfirm(false)}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className={styles.security}>
                            <img src="/norton-logo.png" alt="Norton Secured" />
                            <img src="/symantec-logo.png" alt="Powered by Symantec" />
                        </div>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className={styles.tabContent}>
                        <div className={styles.card}>
                            <h2>Notifications</h2>
                            <h3>Email me when</h3>
                            <div className={styles.checkboxGroup}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={emailPrefs.newBid}
                                        onChange={() => setEmailPrefs((prev) => ({ ...prev, newBid: !prev.newBid }))}
                                    />
                                    Receive new bid on my project
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={emailPrefs.newMessage}
                                        onChange={() => setEmailPrefs((prev) => ({ ...prev, newMessage: !prev.newMessage }))}
                                    />
                                    Receive new message
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={emailPrefs.projectUpdate}
                                        onChange={() => setEmailPrefs((prev) => ({ ...prev, projectUpdate: !prev.projectUpdate }))}
                                    />
                                    Project status updates
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={emailPrefs.paymentReminder}
                                        onChange={() => setEmailPrefs((prev) => ({ ...prev, paymentReminder: !prev.paymentReminder }))}
                                    />
                                    Payment reminders
                                </label>
                            </div>
                            <button
                                className={styles.primaryButton}
                                onClick={handleUpdateEmailSettings}
                                disabled={!hasEmailPrefsChanged()}
                            >
                                Update Email Settings
                            </button>
                        </div>
                        <div className={styles.card}>
                            <h3>Mobile Preferences</h3>
                            <p>Receive SMS notifications for important updates.</p>
                            <h4>Phone Number</h4>
                            <input
                                type="tel"
                                placeholder="Phone number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                            <p className={styles.verified}>Your phone number has been verified.</p>
                            <button
                                className={styles.primaryButton}
                                onClick={handleUpdateMobile}
                                disabled={!hasMobileChanged()}
                            >
                                Update Mobile Settings
                            </button>
                        </div>
                        <div className={styles.card}>
                            <h3>Notification Conditions</h3>
                            <p>Select conditions for notifications</p>
                            <div className={styles.conditions}>
                                <label>PROJECTS <input type="checkbox" checked={notificationConditions.projects} onChange={() => setNotificationConditions((prev) => ({ ...prev, projects: !prev.projects }))} /></label>
                                <label>PAYMENTS <input type="checkbox" checked={notificationConditions.payments} onChange={() => setNotificationConditions((prev) => ({ ...prev, payments: !prev.payments }))} /></label>
                                <label>COMMUNICATION <input type="checkbox" checked={notificationConditions.communication} onChange={() => setNotificationConditions((prev) => ({ ...prev, communication: !prev.communication }))} /></label>
                                <label>OTHER <input type="checkbox" checked={notificationConditions.other} onChange={() => setNotificationConditions((prev) => ({ ...prev, other: !prev.other }))} /></label>
                            </div>
                            <button
                                className={styles.saveButton}
                                onClick={handleUpdateNotifications}
                                disabled={!hasNotificationConditionsChanged()}
                            >
                                Save & Update
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'billing' && (
                    <div className={styles.tabContent}>
                        <div className={styles.card}>
                            <h2>Billing Settings</h2>
                            <button className={styles.addCardButton}>Add Credit/Debit Card</button>
                            <div className={styles.cardForm}>
                                <input
                                    type="text"
                                    placeholder="Card number"
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="MM/YY"
                                    value={expiry}
                                    onChange={(e) => setExpiry(e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="CVC"
                                    value={cvv}
                                    onChange={(e) => setCvv(e.target.value)}
                                />
                                <img src="/payment-logos.png" alt="Visa Mastercard etc." className={styles.paymentLogos} />
                            </div>
                        </div>
                        <div className={styles.card}>
                            <h3>PayPal</h3>
                            <img src="/paypal-logo.png" alt="PayPal" className={styles.paypalLogo} />
                            <input
                                type="email"
                                placeholder="PayPal Email"
                                value={paypalEmail}
                                onChange={(e) => setPaypalEmail(e.target.value)}
                            />
                        </div>
                        <div className={styles.card}>
                            <h3>Billing Address</h3>
                            <input
                                type="text"
                                placeholder="Name on card"
                                value={nameOnCard}
                                onChange={(e) => setNameOnCard(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Billing Line 1"
                                value={billingLine1}
                                onChange={(e) => setBillingLine1(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Billing Line 2"
                                value={billingLine2}
                                onChange={(e) => setBillingLine2(e.target.value)}
                            />
                            <select value={country} onChange={(e) => setCountry(e.target.value)}>
                                <option>Country</option>
                            </select>
                            <select value={state} onChange={(e) => setState(e.target.value)}>
                                <option>State</option>
                            </select>
                            <input
                                type="text"
                                placeholder="City"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Zip Code"
                                value={zipCode}
                                onChange={(e) => setZipCode(e.target.value)}
                            />
                            <button
                                className={styles.saveButton}
                                onClick={handleSaveBilling}
                                disabled={!hasBillingChanged()}
                            >
                                Save & Update
                            </button>
                        </div>
                        <div className={styles.security}>
                            <img src="/norton-logo.png" alt="Norton Secured" />
                            <img src="/symantec-logo.png" alt="Powered by Symantec" />
                        </div>
                    </div>
                )}

                {showAvatarModal && (
                    <>
                        <div className={styles.overlay} onClick={() => setShowAvatarModal(false)} />
                        <div className={styles.modal}>
                            <h2>Update Avatar</h2>
                            <div className={styles.avatarPreview}>
                                {avatarPreview && <img src={avatarPreview} alt="Preview" className={styles.avatar} />}
                            </div>
                            <div className={styles.avatarGrid}>
                                {defaultAvatars.map((avatar, index) => (
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
                                <label htmlFor="avatarUpload">Upload Custom Avatar</label>
                                <input
                                    id="avatarUpload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                />
                            </div>
                            <div className={styles.modalActions}>
                                <button className={styles.primaryButton} onClick={handleSaveAvatar} disabled={!avatarPreview}>
                                    Save
                                </button>
                                <button className={styles.cancelButton} onClick={() => setShowAvatarModal(false)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {toast && (
                <div className={styles.toast}>
                    <div className={styles[`toast${toast.type === 'success' ? 'Success' : 'Error'}`]}>
                        {toast.message}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientProfilePage;