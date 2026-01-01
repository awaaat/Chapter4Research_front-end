import { useNavigate } from 'react-router-dom'
import styles from './RoleModal.module.css'

interface RoleModalProps {
    isOpen: boolean
    onClose: () => void
}

const RoleModal = ({ isOpen, onClose }: RoleModalProps) => {
    const navigate = useNavigate()

    if (!isOpen) return null

    const handleClientClick = () => {
        navigate('/client/register')
        onClose()
    }

    const handleTutorClick = () => {
        navigate('/tutor/register')
        onClose()
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Choose Your Role</h2>
                </div>

                <div className={styles.cards}>
                    {/* CLIENT CARD */}
                    <div className={`${styles.card} ${styles.clientCard}`} onClick={handleClientClick}>
                        <div className={styles.cardIcon}>👤</div>
                        <h3 className={styles.cardTitle}>I'm a Client</h3>
                        <p className={styles.cardDesc}>
                            Get instant homework help from expert tutors.
                            40M+ solutions, 24/7 support, A+ guaranteed!
                        </p>
                        <div className={styles.cardStats}>
                            <span>500K+ Clients</span>
                            <span>4.9⭐ Rating</span>
                        </div>
                        <div className={styles.cardBtn}>Get Help Now</div>
                    </div>

                    {/* TUTOR CARD */}
                    <div className={`${styles.card} ${styles.tutorCard}`} onClick={handleTutorClick}>
                        <div className={styles.cardIcon}>👨‍🏫</div>
                        <h3 className={styles.cardTitle}>I'm a Tutor</h3>
                        <p className={styles.cardDesc}>
                            Earn money helping clients while you work.
                            Set your own rates, flexible hours, instant payments.
                        </p>
                        <div className={styles.cardStats}>
                            <span>$25+/hour</span>
                            <span>10K+ Tutors</span>
                        </div>
                        <div className={styles.cardBtn}>Start Earning</div>
                    </div>
                </div>

                <button className={styles.closeBtn} onClick={onClose}>
                    ❌
                </button>
            </div>
        </div>
    )
}

export default RoleModal