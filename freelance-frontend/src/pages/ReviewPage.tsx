import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

const ReviewPage = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [projectDetails, setProjectDetails] = useState<any>(null);
    const [hoveredStar, setHoveredStar] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProjectDetails();
    }, [projectId]);

    const fetchProjectDetails = async () => {
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/projects/${projectId}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setProjectDetails(data);
            } else {
                toast.error('Failed to load project details');
            }
        } catch (err) {
            console.error('Error fetching project:', err);
            toast.error('Error loading project details');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const token = localStorage.getItem('access_token');

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/projects/${projectId}/reviews/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    review_rating: rating,
                    comment: comment.trim()
                }),
            });

            if (!res.ok) {
                let errorMsg = 'Failed to submit review';
                try {
                    const text = await res.text();
                    try {
                        const errorData = JSON.parse(text);

                        // Handle different error formats
                        if (errorData.detail) {
                            if (typeof errorData.detail === 'string') {
                                errorMsg = errorData.detail;
                            } else if (typeof errorData.detail === 'object') {
                                errorMsg = errorData.detail.detail || JSON.stringify(errorData.detail);
                            }
                        } else if (Array.isArray(errorData)) {
                            errorMsg = errorData[0] || errorMsg;
                        } else if (errorData.review_rating) {
                            errorMsg = Array.isArray(errorData.review_rating)
                                ? errorData.review_rating[0]
                                : errorData.review_rating;
                        } else if (errorData.comment) {
                            errorMsg = Array.isArray(errorData.comment)
                                ? errorData.comment[0]
                                : errorData.comment;
                        }
                    } catch {
                        errorMsg = text || errorMsg;
                    }
                } catch {
                    // Ignore if text() fails
                }
                toast.error(errorMsg);
                throw new Error(errorMsg);
            }

            await res.json();
            toast.success('Review submitted successfully!');
            setTimeout(() => navigate('/client/projects'), 2000);

        } catch (err: any) {
            console.error('Error submitting review:', err);
        } finally {
            setLoading(false);
        }
    };

    const StarRating = () => {
        return (
            <div style={styles.starContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                        style={{
                            ...styles.starButton,
                            color: star <= (hoveredStar || rating) ? '#f59e0b' : '#d1d5db'
                        }}
                        aria-label={`Rate ${star} stars`}
                    >
                        ★
                    </button>
                ))}
                <span style={styles.ratingText}>
                    {rating} {rating === 1 ? 'star' : 'stars'}
                </span>
            </div>
        );
    };

    return (
        <div style={styles.pageWrapper}>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#fff',
                        color: '#1f2937',
                        padding: '16px',
                        borderRadius: '10px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        fontSize: '0.95rem',
                        fontWeight: 500,
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                        style: {
                            border: '1px solid #6ee7b7',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                        style: {
                            border: '1px solid #fecaca',
                        },
                    },
                }}
            />

            <div style={styles.container}>
                {/* Header */}
                <div style={styles.header}>
                    <button
                        onClick={() => navigate(-1)}
                        style={styles.backButton}
                        aria-label="Go back"
                    >
                        ← Back
                    </button>
                    <h1 style={styles.title}>Rate Your Experience</h1>
                    <p style={styles.subtitle}>Help us improve by sharing your feedback</p>
                </div>

                {/* Project Info Card */}
                {projectDetails && (
                    <div style={styles.projectCard}>
                        <div style={styles.projectHeader}>
                            <span style={styles.projectLabel}>Project</span>
                            <span style={styles.projectBadge}>Completed</span>
                        </div>
                        <h3 style={styles.projectTitle}>{projectDetails.title}</h3>
                        {projectDetails.assigned_tutor && (
                            <p style={styles.tutorName}>
                                Tutor: <strong>{projectDetails.assigned_tutor}</strong>
                            </p>
                        )}
                    </div>
                )}

                {/* Review Form */}
                <form onSubmit={handleSubmit} style={styles.form}>
                    {/* Rating Section */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>
                            Overall Rating
                            <span style={styles.required}>*</span>
                        </label>
                        <StarRating />
                        <p style={styles.helperText}>
                            {rating === 5 && "Excellent! Thank you for the great feedback."}
                            {rating === 4 && "Great! We're glad you had a positive experience."}
                            {rating === 3 && "Good. We appreciate your honest feedback."}
                            {rating === 2 && "We're sorry it wasn't better. Please tell us more."}
                            {rating === 1 && "We apologize for your experience. Your feedback helps us improve."}
                        </p>
                    </div>

                    {/* Comment Section */}
                    <div style={styles.formGroup}>
                        <label htmlFor="comment" style={styles.label}>
                            Your Feedback
                            <span style={styles.optional}>(optional)</span>
                        </label>
                        <textarea
                            id="comment"
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="Share your experience with this tutor. What went well? What could be improved?"
                            maxLength={250}
                            style={styles.textarea}
                            rows={5}
                        />
                        <div style={styles.charCount}>
                            {comment.length}/250 characters
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div style={styles.buttonGroup}>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            style={styles.cancelButton}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                ...styles.submitButton,
                                opacity: loading ? 0.6 : 1,
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? (
                                <>
                                    <span style={styles.spinner}></span>
                                    Submitting...
                                </>
                            ) : (
                                'Submit Review'
                            )}
                        </button>
                    </div>
                </form>

                {/* Footer Note */}
                <p style={styles.footerNote}>
                    Your review will help other clients make informed decisions and help tutors improve their services.
                </p>
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    pageWrapper: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
        padding: '2rem 1rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    container: {
        maxWidth: '680px',
        margin: '0 auto',
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        padding: '3rem 2.5rem',
        animation: 'slideUp 0.4s ease-out',
    },
    header: {
        textAlign: 'center',
        marginBottom: '2.5rem',
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        left: 0,
        top: 0,
        background: 'transparent',
        border: 'none',
        color: '#6b7280',
        fontSize: '0.95rem',
        cursor: 'pointer',
        padding: '0.5rem',
        transition: 'color 0.2s',
        fontWeight: 500,
    },
    title: {
        fontSize: '2rem',
        fontWeight: 700,
        color: '#1f2937',
        margin: '0 0 0.5rem 0',
        letterSpacing: '-0.02em',
    },
    subtitle: {
        fontSize: '1rem',
        color: '#6b7280',
        margin: 0,
        fontWeight: 400,
    },
    projectCard: {
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
    },
    projectHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem',
    },
    projectLabel: {
        fontSize: '0.75rem',
        fontWeight: 600,
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    },
    projectBadge: {
        fontSize: '0.75rem',
        fontWeight: 600,
        color: '#059669',
        background: '#d1fae5',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
    },
    projectTitle: {
        fontSize: '1.125rem',
        fontWeight: 600,
        color: '#1f2937',
        margin: '0 0 0.5rem 0',
    },
    tutorName: {
        fontSize: '0.95rem',
        color: '#6b7280',
        margin: 0,
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
    },
    label: {
        fontSize: '0.95rem',
        fontWeight: 600,
        color: '#374151',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    required: {
        color: '#dc2626',
        fontSize: '0.875rem',
    },
    optional: {
        fontSize: '0.875rem',
        fontWeight: 400,
        color: '#9ca3af',
    },
    starContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 0',
    },
    starButton: {
        background: 'none',
        border: 'none',
        fontSize: '2.5rem',
        cursor: 'pointer',
        padding: '0.25rem',
        transition: 'all 0.2s ease',
        lineHeight: 1,
        transform: 'scale(1)',
    },
    ratingText: {
        fontSize: '1rem',
        fontWeight: 500,
        color: '#6b7280',
        marginLeft: '0.75rem',
    },
    helperText: {
        fontSize: '0.875rem',
        color: '#6b7280',
        margin: 0,
        fontStyle: 'italic',
    },
    textarea: {
        width: '100%',
        padding: '1rem',
        fontSize: '0.95rem',
        color: '#1f2937',
        background: '#ffffff',
        border: '2px solid #e5e7eb',
        borderRadius: '10px',
        resize: 'vertical',
        fontFamily: 'inherit',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        outline: 'none',
        boxSizing: 'border-box',
    },
    charCount: {
        fontSize: '0.8rem',
        color: '#9ca3af',
        textAlign: 'right',
    },
    buttonGroup: {
        display: 'flex',
        gap: '1rem',
        marginTop: '1rem',
    },
    cancelButton: {
        flex: 1,
        padding: '0.875rem 1.5rem',
        fontSize: '1rem',
        fontWeight: 600,
        color: '#6b7280',
        background: '#ffffff',
        border: '2px solid #e5e7eb',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        fontFamily: 'inherit',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    },
    submitButton: {
        flex: 2,
        padding: '0.875rem 1.5rem',
        fontSize: '1rem',
        fontWeight: 600,
        color: '#ffffff',
        background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        fontFamily: 'inherit',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
    },
    spinner: {
        width: '1rem',
        height: '1rem',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderTop: '2px solid #ffffff',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
    footerNote: {
        fontSize: '0.875rem',
        color: '#9ca3af',
        textAlign: 'center',
        marginTop: '2rem',
        lineHeight: 1.6,
        fontStyle: 'italic',
    },
};

// Add CSS animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    textarea:focus {
        border-color: #6366f1 !important;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1) !important;
    }

    button:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
    }

    button:active:not(:disabled) {
        transform: translateY(0);
    }

    .star-button:hover {
        transform: scale(1.15);
    }

    @media (max-width: 640px) {
        .container {
            padding: 2rem 1.5rem !important;
        }
    }
`;
document.head.appendChild(styleSheet);

export default ReviewPage;