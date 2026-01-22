// ============================================
import { apiClient } from '../utils/apiClient';
// ClientPostProjectPage.tsx - ENHANCED
// Better error handling with wallet balance checks
// ============================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import styles from './ClientPostProjectPage.module.css';

const subjects = [
    { value: 'Mathematics', label: 'Mathematics', skills: ['Algebra', 'Calculus', 'Geometry', 'Statistics', 'Trigonometry'] },
    { value: 'Physics', label: 'Physics', skills: ['Mechanics', 'Electromagnetism', 'Quantum Physics', 'Thermodynamics', 'Optics'] },
    { value: 'Chemistry', label: 'Chemistry', skills: ['Organic', 'Inorganic', 'Physical', 'Biochemistry', 'Analytical'] },
    { value: 'Biology', label: 'Biology', skills: ['Genetics', 'Microbiology', 'Ecology', 'Physiology', 'Botany'] },
    { value: 'English', label: 'English', skills: ['Grammar', 'Literature', 'Writing', 'Poetry', 'Vocabulary'] },
    { value: 'History', label: 'History', skills: ['World History', 'US History', 'European History', 'Ancient History', 'Modern History'] },
    { value: 'Computer Science', label: 'Computer Science', skills: ['Python', 'Java', 'Algorithms', 'Data Structures', 'Web Development'] },
    { value: 'Economics', label: 'Economics', skills: ['Microeconomics', 'Macroeconomics', 'Finance', 'Trade', 'Behavioral'] },
    { value: 'Spanish', label: 'Spanish', skills: ['Verbs', 'Vocabulary', 'Grammar', 'Conversation', 'Culture'] },
    { value: 'Statistics', label: 'Statistics', skills: ['Probability', 'Regression', 'Hypothesis Testing', 'Data Analysis', 'ANOVA'] },
    { value: 'Accounting', label: 'Accounting', skills: ['Financial Reporting', 'Auditing', 'Tax', 'Cost Analysis', 'Balance Sheets'] },
    { value: 'Psychology', label: 'Psychology', skills: ['Cognitive', 'Social', 'Developmental', 'Disorders', 'Research'] },
    { value: 'Philosophy', label: 'Philosophy', skills: ['Ethics', 'Logic', 'Metaphysics', 'Existentialism', 'Political'] },
    { value: 'Other', label: 'Other', skills: [] },
];

const ClientPostProjectPage = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [amountOfWork, setAmountOfWork] = useState<number | ''>('');
    const [selectedCategory, setSelectedCategory] = useState<{ value: string; label: string; skills: string[] } | null>(null);
    const [selectedSkills, setSelectedSkills] = useState<{ value: string; label: string }[]>([]);
    const [customSkill, setCustomSkill] = useState('');
    const [budget, setBudget] = useState('');
    const [deadline, setDeadline] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('access_token');

    const skillOptions = selectedCategory ? selectedCategory.skills.map(skill => ({ value: skill, label: skill })).concat({ value: 'Other', label: 'Other' }) : [];
    const isOtherSelected = selectedSkills.some(s => s.value === 'Other');

    const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    const handleCategoryChange = (option: any) => {
        setSelectedCategory(option);
        setSelectedSkills([]);
    };

    const handleSkillsChange = (options: any) => {
        setSelectedSkills(options || []);
    };

    const handleAddCustomSkill = () => {
        if (customSkill.trim()) {
            const newSkill = { value: customSkill.trim(), label: customSkill.trim() };
            setSelectedSkills(prev => [...prev.filter(s => s.value !== 'Other'), newSkill]);
            setCustomSkill('');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = e.target.files ? Array.from(e.target.files) : [];
        setFiles(prevFiles => [...prevFiles, ...newFiles]);
    };

    const handleRemoveFile = (index: number) => {
        setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };

    const notifyTutors = async (projectData: any) => {
        try {
            await fetch('/api/notifications/broadcast/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    type: 'new_project',
                    message: `New question posted: ${projectData.title}`,
                    link: `/tutor/projects/${projectData.project_id}`,
                    skills: selectedSkills.map(s => s.value),
                }),
            });
        } catch (err) {
            console.error('Failed to notify tutors:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!selectedCategory) {
            setError('Please select a category');
            showToast('Please select a category', 'error');
            return;
        }
        if (!amountOfWork || amountOfWork <= 0) {
            setError('Please enter a valid amount of work (greater than 0)');
            showToast('Please enter a valid amount of work', 'error');
            return;
        }
        if (selectedSkills.some(s => s.value === 'Other')) {
            setError('Please add your custom skill or remove "Other" from skills');
            showToast('Please add your custom skill', 'error');
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('amount_of_work', amountOfWork.toString());
        formData.append('category', selectedCategory.value);
        formData.append('skills_required', JSON.stringify(selectedSkills.map(s => s.value)));
        formData.append('budget', budget);
        formData.append('deadline', deadline);
        formData.append('client', user.user_id);

        files.forEach(file => {
            formData.append('attachments', file);
        });
        try {
            const response = await apiClient.post('/projects/', formData);

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));

                // Enhanced error handling for wallet balance
                if (response.status === 400 && errData.detail) {
                    const errorMsg = errData.detail.toLowerCase();

                    if (errorMsg.includes('insufficient') || errorMsg.includes('balance') || errorMsg.includes('wallet')) {
                        const insufficientBalanceMsg = '💰 Insufficient wallet balance. Please add funds to your wallet before posting a question.';
                        setError(insufficientBalanceMsg);
                        showToast(insufficientBalanceMsg, 'warning');

                        // Optional: Redirect to payments page after showing toast
                        setTimeout(() => {
                            navigate('/client/wallet');
                        }, 3000);

                        throw new Error(insufficientBalanceMsg);
                    }
                }

                throw new Error(errData.detail || 'Failed to post question');
            }

            const projectData = await response.json();

            setSuccess(true);
            showToast('Question successfully posted!', 'success');

            // Notify matching tutors
            await notifyTutors(projectData);

            // Play success sound
            try {
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3');
                audio.play().catch(err => console.log('Audio play failed:', err));
            } catch (err) {
                console.log('Audio error:', err);
            }

            setTimeout(() => navigate('/client/dashboard'), 2000);
        } catch (err: any) {
            console.error('Post project error:', err);
            setError(err.message);

            // Determine toast type based on error
            const toastType = err.message.includes('Insufficient') ? 'warning' : 'error';
            showToast(err.message || 'Failed to post question', toastType);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className={styles.page}>
            <nav className={styles.navbar}>
                <div className={styles.navContent}>
                    <a href="/" className={styles.logo}>HomeworkHelper</a>
                    <span className={styles.username}>@{user.username}</span>
                    <div className={styles.navLinks}>
                        <a href="/client/dashboard">Dashboard</a>
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                </div>
            </nav>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1>Post a New Question</h1>
                    <p className={styles.subheader}>Share your question and get expert help quickly!</p>
                </header>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Title <span className={styles.tooltip}>? <span>Keep it concise and descriptive</span></span></label>
                        <input className={styles.input} type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g., Help with Calculus Derivatives" />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Description <span className={styles.tooltip}>? <span>Provide details, equations, or context</span></span></label>
                        <textarea className={styles.textarea} value={description} onChange={e => setDescription(e.target.value)} required placeholder="Explain the problem in detail..." />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Amount of Work (# Pages) <span className={styles.tooltip}>? <span>Enter the estimated number of pages or amount of work</span></span></label>
                        <input className={styles.input} type="number" min="1" step="1" value={amountOfWork} onChange={e => { const val = e.target.value; setAmountOfWork(val === '' ? '' : Number(val)); }} required placeholder="e.g., 5" />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Category <span className={styles.tooltip}>? <span>Select the main subject area or 'Other'</span></span></label>
                        <Select options={subjects} value={selectedCategory} onChange={handleCategoryChange} placeholder="Select a category..." isSearchable className={styles.select} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Skills Required <span className={styles.tooltip}>? <span>Select skills or 'Other' to add custom</span></span></label>
                        <Select isMulti options={skillOptions} value={selectedSkills} onChange={handleSkillsChange} placeholder="Select skills..." isSearchable className={styles.select} required />
                        {isOtherSelected && (
                            <div className={styles.customSkillGroup}>
                                <label className={styles.label}>Custom Skill</label>
                                <input className={styles.input} type="text" value={customSkill} onChange={e => setCustomSkill(e.target.value)} placeholder="Enter custom skill..." />
                                <button type="button" onClick={handleAddCustomSkill} className={styles.addButton}>
                                    Add Custom Skill
                                </button>
                            </div>
                        )}
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Budget ($) <span className={styles.tooltip}>? <span>Enter your budget for this question</span></span></label>
                        <input className={styles.input} type="number" step="0.01" value={budget} onChange={e => setBudget(e.target.value)} required placeholder="e.g., 50.00" />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Deadline <span className={styles.tooltip}>? <span>Select date and time (local timezone)</span></span></label>
                        <input className={styles.input} type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Upload Files (optional, multiple) <span className={styles.tooltip}>? <span>Attach images, docs, or data. Select files multiple times to add more.</span></span></label>
                        <input type="file" multiple onChange={handleFileChange} className={styles.fileInput} />
                        {files.length > 0 && (
                            <ul className={styles.fileList}>
                                {files.map((file, index) => (
                                    <li key={index}>
                                        {file.name}
                                        <button type="button" onClick={() => handleRemoveFile(index)} className={styles.removeButton}>Remove</button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className={styles.previewToggle}>
                        <button type="button" onClick={() => setPreview(!preview)} className={styles.previewButton}>
                            {preview ? 'Hide Preview' : 'Preview Question'}
                        </button>
                    </div>
                    {preview && (
                        <div className={styles.preview}>
                            <h3>Preview</h3>
                            <p><strong>Title:</strong> {title}</p>
                            <p><strong>Description:</strong> {description}</p>
                            <p><strong>Amount of Work:</strong> {amountOfWork} pages</p>
                            <p><strong>Category:</strong> {selectedCategory?.label}</p>
                            <p><strong>Skills:</strong> {selectedSkills.map(s => s.label).join(', ')}</p>
                            <p><strong>Budget:</strong> ${budget}</p>
                            <p><strong>Deadline:</strong> {deadline}</p>
                            {files.length > 0 && <p><strong>Files:</strong> {files.map(f => f.name).join(', ')}</p>}
                        </div>
                    )}
                    <button className={styles.button} type="submit" disabled={loading}>
                        {loading ? 'Posting...' : 'Post Question'}
                    </button>
                    {error && <div className={styles.error}>{error}</div>}
                    {success && <div className={styles.success}>Question posted successfully!</div>}
                </form>
            </div>

            {toast && (
                <div className={styles.toast}>
                    <div className={styles[`toast${toast.type === 'success' ? 'Success' : toast.type === 'warning' ? 'Warning' : 'Error'}`]}>
                        {toast.message}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientPostProjectPage;