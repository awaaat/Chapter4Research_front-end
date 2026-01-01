import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.css";

const API_BASE = "http://localhost:8001";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [generalError, setGeneralError] = useState("");

    const navigate = useNavigate();
    const location = useLocation();
    const emailInputRef = useRef<HTMLInputElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            emailInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            emailInputRef.current?.focus({ preventScroll: true });
        }, 100);
        return () => clearTimeout(timer);
    }, [location.pathname]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGeneralError("");
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE}/api/token/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // THIS IS THE ONLY CORRECT WAY WITH YOUR BACKEND
                localStorage.setItem("access_token", data.access);
                localStorage.setItem("refresh_token", data.refresh);
                localStorage.setItem("user", JSON.stringify(data.user)); // ← ONLY data.user !!

                window.dispatchEvent(new Event("userLogin"));

                if (data.user.role === "tutor") {
                    navigate("/tutor/dashboard", { replace: true });
                } else if (data.user.role === "client") {
                    navigate("/client/dashboard", { replace: true });
                } else {
                    navigate("/", { replace: true });
                }
            } else {
                setGeneralError(data.detail || "Invalid email or password");
            }
        } catch (err) {
            setGeneralError("Network error");
        } finally {
            setLoading(false);
        }
    };

    // ... rest of your JSX exactly the same ...
    return (
        <div className={styles.container}>
            <div className={styles.card} ref={cardRef}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Welcome Back!</h1>
                </div>

                {generalError && <div className={styles.alert}>{generalError}</div>}

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Email Address</label>
                        <input
                            ref={emailInputRef}
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            required
                            autoFocus
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>

                    <div className={styles.options}>
                        <label className={styles.remember}>
                            <input type="checkbox" />
                            <span>Remember me</span>
                        </label>
                        <Link to="/forgot-password" className={styles.forgotLink}>
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`${styles.loginBtn} ${loading ? styles.loading : ""}`}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <div className={styles.divider}><span>or</span></div>
                <div className={styles.footer}>
                    <p>
                        Don't have an account?{" "}
                        <Link to="/client/register" className={styles.link}>Register as Client</Link>{" "}
                        or{" "}
                        <Link to="/tutor/register" className={styles.link}>Become a Tutor</Link>
                    </p>
                </div>
            </div>

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

export default LoginPage;