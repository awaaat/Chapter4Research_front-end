import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './TutorSubmitWorkPage.module.css';

const TutorSubmitWorkPage = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const [files, setFiles] = useState<File[]>([]);
    const [comment, setComment] = useState('');
    const [submissionType, setSubmissionType] = useState<'draft' | 'final' | 'revision' | 'additional'>('draft');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('access_token');
        const formData = new FormData();
        formData.append('message', comment);
        files.forEach(file => formData.append('attachment', file));
        formData.append('submission_type', submissionType);

        try {
            const res = await fetch(`/api/projects/${projectId}/submissions/`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            if (!res.ok) throw new Error('Failed to submit project');
            setSuccess(true);
            setTimeout(() => navigate(`/tutor/project/${projectId}`), 2000);
        } catch (err) {
            setError('Error submitting work');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Submit Work for Project #{projectId}</h1>
            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Submission Type</label>
                    <select
                        className={styles.select}
                        value={submissionType}
                        onChange={(e) => setSubmissionType(e.target.value as 'draft' | 'final' | 'revision' | 'additional')}
                    >
                        <option value="draft">Draft</option>
                        <option value="final">Final</option>
                        <option value="revision">Revision</option>
                        <option value="additional">Additional</option>
                    </select>
                </div>
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Upload Files</label>
                    <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className={styles.fileInput}
                    />
                </div>
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Comment</label>
                    <textarea
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        className={styles.textarea}
                        placeholder="Add any comments about your submission..."
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading || files.length === 0}
                    className={styles.submitButton}
                >
                    {loading ? 'Submitting...' : 'Submit Project'}
                </button>
                {error && <p className={styles.errorMessage}>{error}</p>}
                {success && <p className={styles.successMessage}>Project submitted successfully!</p>}
            </form>
        </div>
    );
};

export default TutorSubmitWorkPage;