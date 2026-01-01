import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './TutorRegisterPage.module.css';

const API_BASE = '/api';

const TutorRegisterPage = () => {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [errors, setErrors] = useState<Record<string, string[]>>({})
    const [touched, setTouched] = useState<Record<string, boolean>>({})
    const [validating, setValidating] = useState(false)

    const [personalInfo, setPersonalInfo] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        country: ''
    })

    const [professionalInfo, setProfessionalInfo] = useState({
        username: '',
        password: '',
        password_confirm: '',
        hourly_rate: '',
        experience_years: '',
        bio: ''
    })

    const [skillsInfo, setSkillsInfo] = useState({
        skills: [] as string[],
        is_available: true
    })

    const navigate = useNavigate()

    const countries = [
        'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany',
        'France', 'India', 'Nigeria', 'Kenya', 'South Africa', 'Brazil',
        'Mexico', 'Japan', 'China', 'Philippines', 'Pakistan', 'Bangladesh'
    ]

    const allSkills = [
        'Mathematics', 'Algebra', 'Calculus', 'Geometry', 'Statistics',
        'Physics', 'Chemistry', 'Biology', 'Accounting', 'Economics',
        'Python', 'Java', 'JavaScript', 'C++', 'Data Structures',
        'Essay Writing', 'Research Papers', 'Business', 'Marketing',
        'History', 'Psychology', 'Engineering', 'Excel'
    ]

    const validateStep1 = (): boolean => {
        const newErrors: Record<string, string[]> = {}
        if (!personalInfo.first_name.trim()) newErrors.first_name = ['First name is required']
        if (!personalInfo.last_name.trim()) newErrors.last_name = ['Last name is required']
        if (!personalInfo.email.trim()) newErrors.email = ['Email is required']
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfo.email)) newErrors.email = ['Invalid email format']
        if (!personalInfo.phone.trim()) newErrors.phone = ['Phone number is required']
        else if (!/^\+?[\d\s\-\(\)]{10,15}$/.test(personalInfo.phone)) newErrors.phone = ['Invalid phone number']
        if (!personalInfo.country) newErrors.country = ['Please select your country']
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const validateField = (field: string, value: string, step: number) => {
        const newErrors = { ...errors }

        if (step === 1) {
            if (field === 'first_name' && touched.first_name) {
                if (!value.trim()) newErrors.first_name = ['First name is required']
                else delete newErrors.first_name
            }
            if (field === 'last_name' && touched.last_name) {
                if (!value.trim()) newErrors.last_name = ['Last name is required']
                else delete newErrors.last_name
            }
            if (field === 'email' && touched.email) {
                if (!value.trim()) newErrors.email = ['Email is required']
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) newErrors.email = ['Invalid email format']
                else delete newErrors.email
            }
            if (field === 'phone' && touched.phone) {
                if (!value.trim()) newErrors.phone = ['Phone number is required']
                else if (!/^\+?[\d\s\-\(\)]{10,15}$/.test(value)) newErrors.phone = ['Invalid phone number']
                else delete newErrors.phone
            }
        }

        if (step === 2) {
            if (field === 'username' && touched.username) {
                if (!value.trim()) newErrors.username = ['Username is required']
                else if (value.length < 3) newErrors.username = ['Username must be at least 3 characters']
                else delete newErrors.username
            }
            if (field === 'password' && touched.password) {
                if (!value) newErrors.password = ['Password is required']
                else if (value.length < 8) newErrors.password = ['Password must be at least 8 characters']
                else delete newErrors.password
            }
            if (field === 'password_confirm' && touched.password_confirm) {
                if (!value) newErrors.password_confirm = ['Please confirm your password']
                else if (professionalInfo.password !== value) newErrors.password_confirm = ['Passwords do not match']
                else delete newErrors.password_confirm
            }
            if (field === 'hourly_rate' && touched.hourly_rate) {
                if (!value) newErrors.hourly_rate = ['Hourly rate is required']
                else if (parseFloat(value) < 5 || parseFloat(value) > 200)
                    newErrors.hourly_rate = ['Hourly rate must be between $5-$200']
                else delete newErrors.hourly_rate
            }
            if (field === 'experience_years' && touched.experience_years) {
                if (!value || parseInt(value) < 0)
                    newErrors.experience_years = ['Experience years must be 0 or more']
                else delete newErrors.experience_years
            }
            if (field === 'bio' && touched.bio) {
                if (!value.trim()) newErrors.bio = ['Tell us about your teaching experience']
                else if (value.length < 50) newErrors.bio = ['Bio must be at least 50 characters']
                else delete newErrors.bio
            }
        }

        setErrors(newErrors)
    }

    const validateStep2 = (): boolean => {
        const newErrors: Record<string, string[]> = {}
        if (!professionalInfo.username.trim()) newErrors.username = ['Username is required']
        else if (professionalInfo.username.length < 3) newErrors.username = ['Username must be at least 3 characters']
        if (!professionalInfo.password) newErrors.password = ['Password is required']
        else if (professionalInfo.password.length < 8) newErrors.password = ['Password must be at least 8 characters']
        if (!professionalInfo.password_confirm) newErrors.password_confirm = ['Please confirm your password']
        else if (professionalInfo.password !== professionalInfo.password_confirm) newErrors.password_confirm = ['Passwords do not match']
        if (!professionalInfo.hourly_rate) newErrors.hourly_rate = ['Hourly rate is required']
        else if (parseFloat(professionalInfo.hourly_rate) < 5 || parseFloat(professionalInfo.hourly_rate) > 200)
            newErrors.hourly_rate = ['Hourly rate must be between $5-$200']
        if (!professionalInfo.experience_years || parseInt(professionalInfo.experience_years) < 0)
            newErrors.experience_years = ['Experience years must be 0 or more']
        if (!professionalInfo.bio.trim()) newErrors.bio = ['Tell us about your teaching experience']
        else if (professionalInfo.bio.length < 50) newErrors.bio = ['Bio must be at least 50 characters']
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const validateStep3 = (): boolean => {
        const newErrors: Record<string, string[]> = {}
        if (skillsInfo.skills.length < 3) newErrors.skills = ['Select at least 3 skills']
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleNextStep1 = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateStep1()) return;

        // Validate with server
        setValidating(true);
        setErrors({});

        try {
            const testPayload = {
                email: personalInfo.email,
                username: 'temp_check_user',
                first_name: personalInfo.first_name,
                last_name: personalInfo.last_name,
                phone: personalInfo.phone,
                country: personalInfo.country,
                password: 'TempPass123!',
                password_confirm: 'TempPass123!',
                hourly_rate: 25,
                experience_years: 1,
                bio: 'Temporary bio for validation purposes that is long enough to pass minimum requirements.',
                skills: ['Mathematics', 'Physics', 'Chemistry'],
                is_available: true,
                address: '',
                time_zone: '',
                preferred_language: 'English',
                portfolio_url: '',
                role: 'tutor'
            };

            const response = await fetch(`${API_BASE}/auth/tutor/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testPayload)
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setStep(4);
            } else {
                // Check for Step 1 related errors
                const step1Errors: Record<string, string[]> = {};
                if (data.email) step1Errors.email = Array.isArray(data.email) ? data.email : [data.email];
                if (data.phone) step1Errors.phone = Array.isArray(data.phone) ? data.phone : [data.phone];
                if (data.first_name) step1Errors.first_name = Array.isArray(data.first_name) ? data.first_name : [data.first_name];
                if (data.last_name) step1Errors.last_name = Array.isArray(data.last_name) ? data.last_name : [data.last_name];
                if (data.country) step1Errors.country = Array.isArray(data.country) ? data.country : [data.country];

                if (Object.keys(step1Errors).length > 0) {
                    setErrors(step1Errors);
                } else {
                    // No Step 1 errors, proceed
                    setStep(2);
                }
            }
        } catch (error) {
            setErrors({ email: ['Network error. Please try again.'] });
        } finally {
            setValidating(false);
        }
    }

    const handleNextStep2 = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateStep2()) return;

        // Validate with server
        setValidating(true);
        setErrors({});

        try {
            const testPayload = {
                email: personalInfo.email,
                username: professionalInfo.username,
                first_name: personalInfo.first_name,
                last_name: personalInfo.last_name,
                phone: personalInfo.phone,
                country: personalInfo.country,
                password: professionalInfo.password,
                password_confirm: professionalInfo.password_confirm,
                hourly_rate: parseFloat(professionalInfo.hourly_rate),
                experience_years: parseInt(professionalInfo.experience_years),
                bio: professionalInfo.bio,
                skills: ['Mathematics', 'Physics', 'Chemistry'],
                is_available: true,
                address: '',
                time_zone: '',
                preferred_language: 'English',
                portfolio_url: '',
                role: 'tutor'
            };

            const response = await fetch(`${API_BASE}/auth/tutor/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testPayload)
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setStep(4);
            } else {
                // Check for Step 2 related errors
                const step2Errors: Record<string, string[]> = {};
                if (data.username) step2Errors.username = Array.isArray(data.username) ? data.username : [data.username];
                if (data.password) step2Errors.password = Array.isArray(data.password) ? data.password : [data.password];
                if (data.password_confirm) step2Errors.password_confirm = Array.isArray(data.password_confirm) ? data.password_confirm : [data.password_confirm];
                if (data.hourly_rate) step2Errors.hourly_rate = Array.isArray(data.hourly_rate) ? data.hourly_rate : [data.hourly_rate];
                if (data.experience_years) step2Errors.experience_years = Array.isArray(data.experience_years) ? data.experience_years : [data.experience_years];
                if (data.bio) step2Errors.bio = Array.isArray(data.bio) ? data.bio : [data.bio];

                if (Object.keys(step2Errors).length > 0) {
                    setErrors(step2Errors);
                } else {
                    // No Step 2 errors, proceed
                    setStep(3);
                }
            }
        } catch (error) {
            setErrors({ general: ['Network error. Please try again.'] });
        } finally {
            setValidating(false);
        }
    }

    const handleSubmit = async () => {
        if (!validateStep3()) return
        setLoading(true)
        setErrors({})

        const payload = {
            email: personalInfo.email,
            username: professionalInfo.username,
            first_name: personalInfo.first_name,
            last_name: personalInfo.last_name,
            phone: personalInfo.phone,
            country: personalInfo.country,
            password: professionalInfo.password,
            password_confirm: professionalInfo.password_confirm,
            hourly_rate: parseFloat(professionalInfo.hourly_rate),
            experience_years: parseInt(professionalInfo.experience_years),
            bio: professionalInfo.bio,
            skills: skillsInfo.skills,
            is_available: skillsInfo.is_available,
            address: '',
            time_zone: '',
            preferred_language: 'English',
            portfolio_url: '',
            role: 'tutor'
        }

        try {
            const response = await fetch(`${API_BASE}/auth/tutor/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            const data = await response.json()
            if (response.ok) {
                setSuccess(true)
                setStep(4)
            } else {
                const formattedErrors: Record<string, string[]> = {}
                Object.keys(data).forEach(key => {
                    const value = data[key]
                    formattedErrors[key] = Array.isArray(value) ? value : [value]
                })
                if (data.non_field_errors) formattedErrors.general = data.non_field_errors
                if (data.detail) formattedErrors.general = [data.detail]
                setErrors(formattedErrors)
            }
        } catch (error) {
            setErrors({ general: ['Network error. Please try again.'] })
        } finally {
            setLoading(false)
        }
    }

    const toggleSkill = (skill: string) => {
        setSkillsInfo(prev => ({
            ...prev,
            skills: prev.skills.includes(skill)
                ? prev.skills.filter(s => s !== skill)
                : [...prev.skills, skill]
        }))
    }

    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    }, [step]);

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <br />
                <div className={styles.header}>
                    <div className={styles.tutorBadge}>👨</div>
                    <h1 className={styles.title}>Become a Tutor</h1>
                    <p className={styles.subtitle}>Earn $25+/hour • Flexible schedule • Help students worldwide</p>
                </div>

                <div className={styles.steps}>
                    <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}>
                        <div className={styles.stepIcon}>1</div>
                        <span>Personal Info</span>
                    </div>
                    <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>
                        <div className={styles.stepIcon}>2</div>
                        <span>Professional</span>
                    </div>
                    <div className={`${styles.step} ${step >= 3 ? styles.active : ''}`}>
                        <div className={styles.stepIcon}>3</div>
                        <span>Skills</span>
                    </div>
                    <div className={`${styles.step} ${step === 4 ? styles.active : ''}`}>
                        <div className={styles.stepIcon}>4</div>
                        <span>Complete</span>
                    </div>
                </div>

                {errors.general && (
                    <div className={styles.errorMsg} style={{ margin: '20px 0', padding: '15px', background: '#fee2e2', borderRadius: '8px' }}>
                        {errors.general.map((msg, i) => <p key={i}>{msg}</p>)}
                    </div>
                )}

                <div ref={contentRef}>
                    {step === 1 && (
                        <form className={styles.form} onSubmit={handleNextStep1}>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Full Name</label>
                                <div className={styles.nameRow}>
                                    <input
                                        name="first_name"
                                        placeholder="First name"
                                        value={personalInfo.first_name}
                                        onChange={(e) => {
                                            setPersonalInfo({ ...personalInfo, first_name: e.target.value })
                                            validateField('first_name', e.target.value, 1)
                                        }}
                                        onBlur={() => setTouched({ ...touched, first_name: true })}
                                        className={`${styles.input} ${errors.first_name ? styles.error : ''}`}
                                        disabled={validating}
                                    />
                                    <input
                                        name="last_name"
                                        placeholder="Last name"
                                        value={personalInfo.last_name}
                                        onChange={(e) => {
                                            setPersonalInfo({ ...personalInfo, last_name: e.target.value })
                                            validateField('last_name', e.target.value, 1)
                                        }}
                                        onBlur={() => setTouched({ ...touched, last_name: true })}
                                        className={`${styles.input} ${errors.last_name ? styles.error : ''}`}
                                        disabled={validating}
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
                                    placeholder="tutor@example.com"
                                    value={personalInfo.email}
                                    onChange={(e) => {
                                        setPersonalInfo({ ...personalInfo, email: e.target.value })
                                        validateField('email', e.target.value, 1)
                                    }}
                                    onBlur={() => setTouched({ ...touched, email: true })}
                                    className={`${styles.input} ${errors.email ? styles.error : ''}`}
                                    disabled={validating}
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
                                    onChange={(e) => {
                                        setPersonalInfo({ ...personalInfo, phone: e.target.value })
                                        validateField('phone', e.target.value, 1)
                                    }}
                                    onBlur={() => setTouched({ ...touched, phone: true })}
                                    className={`${styles.input} ${errors.phone ? styles.error : ''}`}
                                    disabled={validating}
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
                                    disabled={validating}
                                >
                                    <option value="">Select your country</option>
                                    {countries.map(country => (
                                        <option key={country} value={country}>{country}</option>
                                    ))}
                                </select>
                                {errors.country && <div className={styles.errorMsg}>{errors.country[0]}</div>}
                            </div>
                            <button type="submit" className={styles.nextBtn} disabled={validating}>
                                {validating ? 'Validating...' : 'Next Step →'}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form className={styles.form} onSubmit={handleNextStep2}>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Username</label>
                                <input
                                    name="username"
                                    placeholder="Choose a username"
                                    value={professionalInfo.username}
                                    onChange={(e) => {
                                        setProfessionalInfo({ ...professionalInfo, username: e.target.value })
                                        validateField('username', e.target.value, 2)
                                    }}
                                    onBlur={() => setTouched({ ...touched, username: true })}
                                    className={`${styles.input} ${errors.username ? styles.error : ''}`}
                                    disabled={validating}
                                />
                                {errors.username && <div className={styles.errorMsg}>{errors.username[0]}</div>}
                            </div>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Enter password"
                                    value={professionalInfo.password}
                                    onChange={(e) => {
                                        setProfessionalInfo({ ...professionalInfo, password: e.target.value })
                                        validateField('password', e.target.value, 2)
                                    }}
                                    onBlur={() => setTouched({ ...touched, password: true })}
                                    className={`${styles.input} ${errors.password ? styles.error : ''}`}
                                    disabled={validating}
                                />
                                {errors.password && <div className={styles.errorMsg}>{errors.password[0]}</div>}
                            </div>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Confirm Password</label>
                                <input
                                    type="password"
                                    name="password_confirm"
                                    placeholder="Confirm password"
                                    value={professionalInfo.password_confirm}
                                    onChange={(e) => {
                                        setProfessionalInfo({ ...professionalInfo, password_confirm: e.target.value })
                                        validateField('password_confirm', e.target.value, 2)
                                    }}
                                    onBlur={() => setTouched({ ...touched, password_confirm: true })}
                                    className={`${styles.input} ${errors.password_confirm ? styles.error : ''}`}
                                    disabled={validating}
                                />
                                {errors.password_confirm && <div className={styles.errorMsg}>{errors.password_confirm[0]}</div>}
                            </div>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Hourly Rate</label>
                                <div className={styles.inputGroup}>
                                    <span className={styles.currency}>$</span>
                                    <input
                                        type="number"
                                        name="hourly_rate"
                                        placeholder="25"
                                        min="5"
                                        max="200"
                                        step="0.5"
                                        value={professionalInfo.hourly_rate}
                                        onChange={(e) => {
                                            setProfessionalInfo({ ...professionalInfo, hourly_rate: e.target.value })
                                            validateField('hourly_rate', e.target.value, 2)
                                        }}
                                        onBlur={() => setTouched({ ...touched, hourly_rate: true })}
                                        className={`${styles.input} ${styles.rateInput} ${errors.hourly_rate ? styles.error : ''}`}
                                        disabled={validating}
                                    />
                                    <span className={styles.currency}>/hour</span>
                                </div>
                                {errors.hourly_rate && <div className={styles.errorMsg}>{errors.hourly_rate[0]}</div>}
                            </div>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Years of Experience</label>
                                <input
                                    type="number"
                                    name="experience_years"
                                    placeholder="5"
                                    min="0"
                                    value={professionalInfo.experience_years}
                                    onChange={(e) => {
                                        setProfessionalInfo({ ...professionalInfo, experience_years: e.target.value })
                                        validateField('experience_years', e.target.value, 2)
                                    }}
                                    onBlur={() => setTouched({ ...touched, experience_years: true })}
                                    className={`${styles.input} ${errors.experience_years ? styles.error : ''}`}
                                    disabled={validating}
                                />
                                {errors.experience_years && <div className={styles.errorMsg}>{errors.experience_years[0]}</div>}
                            </div>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>About You (Teaching Bio)</label>
                                <textarea
                                    name="bio"
                                    placeholder="Tell us about your teaching experience, subjects you excel in, and why students love learning from you..."
                                    value={professionalInfo.bio}
                                    onChange={(e) => {
                                        setProfessionalInfo({ ...professionalInfo, bio: e.target.value })
                                        validateField('bio', e.target.value, 2)
                                    }}
                                    onBlur={() => setTouched({ ...touched, bio: true })}
                                    rows={4}
                                    className={`${styles.textarea} ${errors.bio ? styles.error : ''}`}
                                    disabled={validating}
                                />
                                <p className={styles.helperText}>
                                    {professionalInfo.bio.length}/500 characters - Be specific about your expertise!
                                </p>
                                {errors.bio && <div className={styles.errorMsg}>{errors.bio[0]}</div>}
                            </div>
                            <div className={styles.actions}>
                                <button type="button" onClick={() => setStep(1)} className={styles.backBtn} disabled={validating}>← Back</button>
                                <button type="submit" className={styles.nextBtn} disabled={validating}>
                                    {validating ? 'Validating...' : 'Next: Skills →'}
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <form className={styles.form} onSubmit={(e) => { e.preventDefault(); handleSubmit() }}>
                            {errors.skills && <div className={styles.errorMsg}>{errors.skills[0]}</div>}
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Select Your Expertise (Min 3)</label>
                                <p className={styles.helperText}>
                                    Choose subjects you can teach confidently. Students will find you based on these skills.
                                </p>
                                <div className={styles.skillsGrid}>
                                    {allSkills.map(skill => (
                                        <button
                                            key={skill}
                                            type="button"
                                            className={`${styles.skillTag} ${skillsInfo.skills.includes(skill) ? styles.skillActive : ''}`}
                                            onClick={() => toggleSkill(skill)}
                                            disabled={loading}
                                        >
                                            {skill}
                                        </button>
                                    ))}
                                </div>
                                <p className={styles.skillCount}>
                                    {skillsInfo.skills.length} skills selected {skillsInfo.skills.length < 3 && '(Minimum 3 required)'}
                                </p>
                            </div>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>
                                    <input
                                        type="checkbox"
                                        checked={skillsInfo.is_available}
                                        onChange={(e) => setSkillsInfo({ ...skillsInfo, is_available: e.target.checked })}
                                        className={styles.checkbox}
                                        disabled={loading}
                                    />
                                    <span className={styles.checkboxLabel}>I'm available to accept students now</span>
                                </label>
                            </div>
                            <div className={styles.actions}>
                                <button type="button" onClick={() => setStep(2)} className={styles.backBtn} disabled={loading}>← Back</button>
                                <button
                                    type="submit"
                                    disabled={skillsInfo.skills.length < 3 || loading}
                                    className={`${styles.submitBtn} ${loading ? styles.loading : ''}`}
                                >
                                    {loading ? 'Creating Profile...' : 'Start Earning →'}
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 4 && success && (
                        <div className={styles.success}>
                            <div className={styles.successIcon}>✓</div>
                            <h2 className={styles.successTitle}>Tutor Profile Created!</h2>
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
                </div>

                <div className={styles.footer}>
                    <p>Already have an account? <Link to="/login" className={styles.link}>Sign in</Link></p>
                    <p>
                        Want to get help instead? <Link to="/client/register" className={styles.clientLink}>Register as Client</Link>
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
    )
}

export default TutorRegisterPage