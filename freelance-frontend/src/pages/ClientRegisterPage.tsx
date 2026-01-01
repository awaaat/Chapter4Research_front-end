import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './ClientRegisterPage.module.css';

const RegisterPage = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [checkingEmail, setCheckingEmail] = useState(false);

    const [personalInfo, setPersonalInfo] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        country: ''
    });

    const [accountInfo, setAccountInfo] = useState({
        username: '',
        password: '',
        password_confirm: ''
    });

    const navigate = useNavigate();

    const countries = [
        'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany',
        'France', 'India', 'Nigeria', 'Kenya', 'South Africa', 'Brazil',
        'Mexico', 'Japan', 'China', 'Philippines', 'Pakistan', 'Bangladesh'
    ];

    const cardRef = useRef<HTMLDivElement>(null);

    const validateStep1 = (): boolean => {
        const newErrors: Record<string, string[]> = {};

        if (!personalInfo.first_name.trim()) newErrors.first_name = ['First name is required'];
        if (!personalInfo.last_name.trim()) newErrors.last_name = ['Last name is required'];
        if (!personalInfo.email.trim()) newErrors.email = ['Email is required'];
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfo.email)) newErrors.email = ['Invalid email format'];
        if (!personalInfo.phone.trim()) newErrors.phone = ['Phone number is required'];
        else if (!/^\+?[\d\s\-\(\)]{10,15}$/.test(personalInfo.phone)) newErrors.phone = ['Invalid phone number'];
        if (!personalInfo.country) newErrors.country = ['Please select your country'];

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = (): boolean => {
        const newErrors: Record<string, string[]> = {};

        if (!accountInfo.username.trim()) {
            newErrors.username = ['Username is required'];
        } else if (accountInfo.username.length < 3) {
            newErrors.username = ['Username must be at least 3 characters'];
        }

        if (!accountInfo.password) {
            newErrors.password = ['Password is required'];
        } else if (accountInfo.password.length < 8) {
            newErrors.password = ['Password must be at least 8 characters'];
        }

        if (accountInfo.password !== accountInfo.password_confirm) {
            newErrors.password_confirm = ['Passwords do not match'];
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNextStep1 = async (e: React.FormEvent) => {
        e.preventDefault();

        // First check client-side validation
        if (!validateStep1()) return;

        // Check email availability with server
        setCheckingEmail(true);
        setErrors({});

        try {
            // Create a test payload with minimal data
            const testPayload = {
                email: personalInfo.email.trim(),
                username: 'temp_user_check', // Temporary username
                first_name: personalInfo.first_name.trim(),
                last_name: personalInfo.last_name.trim(),
                phone: personalInfo.phone.trim(),
                country: personalInfo.country,
                password: 'TempPass123!', // Temporary password
                password_confirm: 'TempPass123!',
                role: "client",
                preferred_language: "English"
            };

            const response = await fetch('/api/auth/client/register/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testPayload),
            });

            const data = await response.json();

            if (response.ok) {
                // Registration worked - this shouldn't happen in validation
                // But if it does, go to success
                setSuccess(true);
                setStep(3);
            } else {
                // Check for specific errors
                if (data.email) {
                    setErrors({ email: data.email });
                } else if (data.phone) {
                    setErrors({ phone: data.phone });
                } else if (data.first_name) {
                    setErrors({ first_name: data.first_name });
                } else if (data.last_name) {
                    setErrors({ last_name: data.last_name });
                } else if (data.country) {
                    setErrors({ country: data.country });
                } else {
                    // No errors related to Step 1, safe to proceed
                    setStep(2);
                }
            }
        } catch (error) {
            setErrors({ email: ['Network error. Please try again.'] });
        } finally {
            setCheckingEmail(false);
        }
    };

    const handleSubmit = async () => {
        if (!validateStep2()) return;

        setLoading(true);
        setErrors({});

        const payload = {
            email: personalInfo.email.trim(),
            username: accountInfo.username.trim(),
            first_name: personalInfo.first_name.trim(),
            last_name: personalInfo.last_name.trim(),
            phone: personalInfo.phone.trim(),
            country: personalInfo.country,
            password: accountInfo.password,
            password_confirm: accountInfo.password_confirm,
            role: "client",
            preferred_language: "English"
        };

        try {
            const response = await fetch('/api/auth/client/register/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setStep(3);
            } else {
                // Server-side validation errors
                setErrors(data);
            }
        } catch (error) {
            setErrors({ email: ['Network error. Please try again.'] });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (cardRef.current) {
            cardRef.current.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
    }, [step]);

    return (
        <div className={styles.container}>
            <div className={styles.card} ref={cardRef}>
                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>Create Client Account</h1>
                    <p className={styles.subtitle}>Join 500K+ clients getting A+ grades</p>
                </div>

                {/* Steps */}
                <div className={styles.steps}>
                    <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}>
                        <div className={styles.stepIcon}>1</div>
                        <span>Personal Info</span>
                    </div>
                    <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>
                        <div className={styles.stepIcon}>2</div>
                        <span>Account Setup</span>
                    </div>
                    <div className={`${styles.step} ${step >= 3 ? styles.active : ''}`}>
                        <div className={styles.stepIcon}>3</div>
                        <span>Complete</span>
                    </div>
                </div>

                {/* Step 1: Personal Info */}
                {step === 1 && !success && (
                    <form className={styles.form} onSubmit={handleNextStep1}>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Full Name</label>
                            <div className={styles.nameRow}>
                                <input
                                    name="first_name"
                                    placeholder="First name"
                                    value={personalInfo.first_name}
                                    onChange={(e) => setPersonalInfo({ ...personalInfo, first_name: e.target.value })}
                                    className={`${styles.input} ${errors.first_name ? styles.error : ''}`}
                                    disabled={checkingEmail}
                                />
                                <input
                                    name="last_name"
                                    placeholder="Last name"
                                    value={personalInfo.last_name}
                                    onChange={(e) => setPersonalInfo({ ...personalInfo, last_name: e.target.value })}
                                    className={`${styles.input} ${errors.last_name ? styles.error : ''}`}
                                    disabled={checkingEmail}
                                />
                            </div>
                            {errors.first_name && <div className={styles.errorMsg}>{errors.first_name[0]}</div>}
                            {errors.last_name && <div className={styles.errorMsg}>{errors.last_name[0]}</div>}
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="client@example.com"
                                value={personalInfo.email}
                                onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                                className={`${styles.input} ${errors.email ? styles.error : ''}`}
                                disabled={checkingEmail}
                            />
                            {errors.email && <div className={styles.errorMsg}>{errors.email[0]}</div>}
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="+1 (555) 123-4567"
                                value={personalInfo.phone}
                                onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                                className={`${styles.input} ${errors.phone ? styles.error : ''}`}
                                disabled={checkingEmail}
                            />
                            {errors.phone && <div className={styles.errorMsg}>{errors.phone[0]}</div>}
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Country</label>
                            <select
                                name="country"
                                value={personalInfo.country}
                                onChange={(e) => setPersonalInfo({ ...personalInfo, country: e.target.value })}
                                className={`${styles.input} ${errors.country ? styles.error : ''}`}
                                disabled={checkingEmail}
                            >
                                <option value="">Select your country</option>
                                {countries.map(country => (
                                    <option key={country} value={country}>{country}</option>
                                ))}
                            </select>
                            {errors.country && <div className={styles.errorMsg}>{errors.country[0]}</div>}
                        </div>

                        <button type="submit" className={styles.nextBtn} disabled={checkingEmail}>
                            {checkingEmail ? 'Validating...' : 'Next Step'}
                        </button>
                    </form>
                )}

                {/* Step 2: Account Setup */}
                {step === 2 && !success && (
                    <form className={styles.form} onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Username</label>
                            <input
                                name="username"
                                placeholder="Choose a username"
                                value={accountInfo.username}
                                onChange={(e) => setAccountInfo({ ...accountInfo, username: e.target.value })}
                                className={`${styles.input} ${errors.username ? styles.error : ''}`}
                                disabled={loading}
                            />
                            {errors.username && <div className={styles.errorMsg}>{errors.username[0]}</div>}
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="At least 8 characters"
                                value={accountInfo.password}
                                onChange={(e) => setAccountInfo({ ...accountInfo, password: e.target.value })}
                                className={`${styles.input} ${errors.password ? styles.error : ''}`}
                                disabled={loading}
                            />
                            {errors.password && <div className={styles.errorMsg}>{errors.password[0]}</div>}
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Confirm Password</label>
                            <input
                                type="password"
                                name="password_confirm"
                                placeholder="Repeat your password"
                                value={accountInfo.password_confirm}
                                onChange={(e) => setAccountInfo({ ...accountInfo, password_confirm: e.target.value })}
                                className={`${styles.input} ${errors.password_confirm ? styles.error : ''}`}
                                disabled={loading}
                            />
                            {errors.password_confirm && <div className={styles.errorMsg}>{errors.password_confirm[0]}</div>}
                        </div>

                        <div className={styles.actions}>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className={styles.backBtn}
                                disabled={loading}
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`${styles.submitBtn} ${loading ? styles.loading : ''}`}
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 3: Success Message */}
                {success && (
                    <div className={styles.success}>
                        <div className={styles.successIcon}>✓</div>
                        <h2 className={styles.successTitle}>Account Created Successfully!</h2>
                        <p className={styles.successText}>
                            We've sent a verification email to <strong>{personalInfo.email}</strong>
                        </p>
                        <p className={styles.successSubtext}>
                            Please check your Inbox (and spam/junk folder) then click the link to activate your account.
                        </p>

                        <br />

                        <button onClick={() => navigate('/login')} className={styles.successBtn}>
                            Go to Login
                        </button>
                    </div>
                )}

                {/* Footer */}
                <div className={styles.footer}>
                    <p>Already have an account? <Link to="/login" className={styles.link}>Sign in</Link></p>
                    <p>
                        Want to earn money helping clients?{' '}
                        <Link to="/tutor/register" className={styles.tutorLink}>Become a Tutor</Link>
                    </p>
                </div>
            </div>

            {/* Footer */}
            <footer className={styles.pageFooter}>
                <div className={styles.footerContent}>
                    <div className={styles.footerSection}>
                        <h3>MyHomework Helper</h3>
                        <p className={styles.footerText}>24/7 homework help across all subjects</p>
                    </div>
                    <div className={styles.footerSection}>
                        <h4>Quick Links</h4>
                        <ul className={styles.footerLinks}>
                            <li><Link to="/" className={styles.footerLink}>Home</Link></li>
                            <li><Link to="/login" className={styles.footerLink}>Login</Link></li>
                            <li><a href="#" className={styles.footerLink}>FAQ</a></li>
                        </ul>
                    </div>
                    <div className={styles.footerSection}>
                        <h4>For Tutors</h4>
                        <ul className={styles.footerLinks}>
                            <li><Link to="/tutor/register" className={styles.footerLink}>Become a Tutor</Link></li>
                        </ul>
                    </div>
                    <div className={styles.footerSection}>
                        <h4>Legal</h4>
                        <ul className={styles.footerLinks}>
                            <li><a href="#" className={styles.footerLink}>Terms</a></li>
                            <li><a href="#" className={styles.footerLink}>Privacy</a></li>
                        </ul>
                    </div>
                </div>
                <div className={styles.footerBottom}>
                    <p>© 2025 MyHomework Helper. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default RegisterPage;