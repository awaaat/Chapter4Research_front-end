// src/components/PaymentConfirmModal.tsx
import { useState } from 'react';
import styles from './PaymentConfirmModal.module.css';

interface PaymentConfirmModalProps {
    projectTitle: string;
    bidAmount: number;
    tutorUsername: string;
    onConfirm: () => Promise<void>;
    onCancel: () => void;
}

const PaymentConfirmModal = ({
    projectTitle,
    bidAmount,
    tutorUsername,
    onConfirm,
    onCancel,
}: PaymentConfirmModalProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Calculate breakdown (35% platform fee)
    const platformFee = bidAmount * 0.35;
    const tutorReceives = bidAmount * 0.65;

    const handleConfirm = async () => {
        setLoading(true);
        setError(null);
        try {
            await onConfirm();
        } catch (err: any) {
            setError(err.message || 'Payment failed');
            setLoading(false);
        }
    };

    return (
        <>
            <div className={styles.overlay} onClick={onCancel} />
            <div className={styles.modal}>
                <div className={styles.modalHeader}>
                    <h2>💳 Confirm Payment</h2>
                    <button className={styles.closeBtn} onClick={onCancel}>
                        ×
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.infoSection}>
                        <h3>Project Details</h3>
                        <p><strong>Title:</strong> {projectTitle}</p>
                        <p><strong>Tutor:</strong> {tutorUsername}</p>
                    </div>

                    <div className={styles.breakdown}>
                        <h3>Payment Breakdown</h3>
                        <div className={styles.breakdownRow}>
                            <span>Total Amount:</span>
                            <strong>${bidAmount.toFixed(2)}</strong>
                        </div>
                        <div className={styles.breakdownRow}>
                            <span>Platform Fee (35%):</span>
                            <span className={styles.fee}>-${platformFee.toFixed(2)}</span>
                        </div>
                        <div className={styles.divider}></div>
                        <div className={styles.breakdownRow}>
                            <span>Tutor Receives (65%):</span>
                            <strong className={styles.tutorAmount}>
                                ${tutorReceives.toFixed(2)}
                            </strong>
                        </div>
                    </div>

                    <div className={styles.notice}>
                        <p>
                            <strong>⚠️ Payment is held in escrow</strong>
                        </p>
                        <p>
                            The tutor will receive ${tutorReceives.toFixed(2)} once you mark the
                            project as complete. Your total payment of ${bidAmount.toFixed(2)} will
                            be processed now (simulation).
                        </p>
                    </div>

                    {error && (
                        <div className={styles.error}>
                            ❌ {error}
                        </div>
                    )}
                </div>

                <div className={styles.modalFooter}>
                    <button
                        className={styles.cancelBtn}
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        className={styles.confirmBtn}
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : `Pay $${bidAmount.toFixed(2)}`}
                    </button>
                </div>
            </div>
        </>
    );
};

export default PaymentConfirmModal;