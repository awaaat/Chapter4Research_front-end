import { useState } from 'react';

interface AvatarUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (url: string) => void;
}

const AvatarUploadModal = ({ isOpen, onClose, onSuccess }: AvatarUploadModalProps) => {
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Preset avatars from public folder
    const presetAvatars = [
        '/avatars/avatar-1.jpg',
        '/avatars/avatar-2.jpg',
        '/avatars/avatar-3.jpg',
        '/avatars/avatar-4.jpg',
        '/avatars/avatar-5.jpg'
    ];

    if (!isOpen) return null;

    // ============================================================
    // HANDLE FILE UPLOAD
    // ============================================================
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        setError(null);
        setAvatarFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setAvatarPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    // ============================================================
    // SAVE AVATAR
    // ============================================================
    const handleSaveAvatar = async () => {
        if (!avatarFile && !avatarPreview) {
            setError('Please select an avatar');
            return;
        }

        const token = localStorage.getItem('access_token');
        if (!token) {
            setError('Authentication required');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();

            if (avatarFile) {
                // Upload custom file
                formData.append('avatar', avatarFile);
            } else if (avatarPreview && avatarPreview.startsWith('/')) {
                // Use preset avatar URL
                formData.append('avatar_url', avatarPreview);
            }

            const res = await fetch('http://localhost:8001/api/users/update-avatar/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to update avatar');
            }

            console.log('✅ Avatar updated:', data.avatar_url);
            onSuccess?.(data.avatar_url);

            setAvatarFile(null);
            setAvatarPreview(null);
            onClose();

        } catch (err: any) {
            console.error('❌ Avatar upload error:', err);
            setError(err.message || 'Failed to upload avatar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* OVERLAY */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 200,
                    backdropFilter: 'blur(4px)',
                }}
                onClick={onClose}
            />

            {/* MODAL */}
            <div style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: '#ffffff',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                zIndex: 201,
                width: '90%',
                maxWidth: '500px',
                maxHeight: '90vh',
                overflowY: 'auto',
            }}>
                <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#2d3748',
                    margin: '0 0 1.5rem 0',
                    textAlign: 'center',
                }}>
                    Update Avatar
                </h2>

                {/* PREVIEW */}
                {avatarPreview && (
                    <div style={{
                        textAlign: 'center',
                        marginBottom: '1.5rem',
                        padding: '1rem',
                        background: '#f5f7f9',
                        borderRadius: '8px',
                    }}>
                        <img
                            src={avatarPreview}
                            alt="Preview"
                            style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '3px solid #dde2e8',
                            }}
                        />
                    </div>
                )}

                {/* ERROR MESSAGE */}
                {error && (
                    <div style={{
                        background: '#fee2e2',
                        color: '#991b1b',
                        padding: '0.75rem 1rem',
                        borderRadius: '6px',
                        marginBottom: '1rem',
                        fontSize: '0.9rem',
                        border: '1px solid #fca5a5',
                    }}>
                        {error}
                    </div>
                )}

                {/* PRESET AVATARS */}
                <h3 style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: '#2d3748',
                    margin: '0 0 1rem 0',
                }}>
                    Choose Preset Avatar
                </h3>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                    gap: '0.75rem',
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    background: '#f5f7f9',
                    borderRadius: '8px',
                }}>
                    {presetAvatars.map((avatar, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setAvatarFile(null);
                                setAvatarPreview(avatar);
                                setError(null);
                            }}
                            style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                border: avatarPreview === avatar ? '3px solid #5b6b7a' : '3px solid #dde2e8',
                                background: 'none',
                                cursor: 'pointer',
                                padding: 0,
                                overflow: 'hidden',
                                transition: 'all 0.2s',
                                boxShadow: avatarPreview === avatar ? '0 4px 12px rgba(91, 107, 122, 0.3)' : 'none',
                                transform: avatarPreview === avatar ? 'scale(1.05)' : 'scale(1)',
                            }}
                            title={`Avatar ${index + 1}`}
                        >
                            <img
                                src={avatar}
                                alt={`Avatar ${index + 1}`}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                }}
                                onError={(e) => {
                                    console.warn(`Avatar ${index + 1} failed to load`);
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        </button>
                    ))}
                </div>

                {/* FILE UPLOAD */}
                <div style={{
                    marginBottom: '1.5rem',
                    padding: '1.5rem',
                    background: '#f5f7f9',
                    borderRadius: '8px',
                    border: '2px dashed #dde2e8',
                    textAlign: 'center',
                }}>
                    <label style={{
                        display: 'inline-block',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: '#5b6b7a',
                        background: '#ffffff',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 2px 4px rgba(91, 107, 122, 0.1)',
                    }}>
                        📤 Upload Custom Avatar
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                        />
                    </label>
                    <p style={{
                        fontSize: '0.75rem',
                        color: '#6b7785',
                        margin: '0.75rem 0 0 0',
                    }}>
                        Max 5MB • JPG, PNG, GIF
                    </p>
                </div>

                {/* ACTIONS */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'center',
                }}>
                    <button
                        onClick={handleSaveAvatar}
                        disabled={!avatarPreview || loading}
                        style={{
                            background: '#5b6b7a',
                            color: '#ffffff',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            cursor: loading || !avatarPreview ? 'not-allowed' : 'pointer',
                            opacity: loading || !avatarPreview ? 0.5 : 1,
                        }}
                    >
                        {loading ? 'Saving...' : 'Save Avatar'}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        style={{
                            background: '#ffffff',
                            color: '#2d3748',
                            border: '1px solid #dde2e8',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.5 : 1,
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </>
    );
};

export default AvatarUploadModal;