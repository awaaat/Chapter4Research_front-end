/**
 * PaystackCallback.tsx - COMPLETE FIXED VERSION
 * ONLY CHANGE: sessionStorage → localStorage (lines 338, 368)
 */
import { AlertCircle, ArrowLeft, CheckCircle, Loader, RefreshCw, XCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// ============================================================
// TYPES & INTERFACES
// ============================================================

type PaymentStatus = 'loading' | 'success' | 'duplicate' | 'error' | 'network_error';

const PaymentStatusValues = {
    LOADING: 'loading' as PaymentStatus,
    SUCCESS: 'success' as PaymentStatus,
    DUPLICATE: 'duplicate' as PaymentStatus,
    ERROR: 'error' as PaymentStatus,
    NETWORK_ERROR: 'network_error' as PaymentStatus,
};

type ErrorCode =
    | 'MISSING_REFERENCE'
    | 'NOT_AUTHENTICATED'
    | 'VERIFICATION_FAILED'
    | 'NETWORK_ERROR'
    | 'INTERNAL_ERROR'
    | 'TIMEOUT';

const ErrorCodeValues: Record<string, ErrorCode> = {
    MISSING_REFERENCE: 'MISSING_REFERENCE',
    NOT_AUTHENTICATED: 'NOT_AUTHENTICATED',
    VERIFICATION_FAILED: 'VERIFICATION_FAILED',
    NETWORK_ERROR: 'NETWORK_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    TIMEOUT: 'TIMEOUT',
};

interface PaymentDetails {
    amount?: number;
    newBalance?: number;
    currency?: string;
    transactionId?: string;
    processingTimeMs?: number;
}

interface VerificationResponse {
    success: boolean;
    message: string;
    status?: string;
    error_code?: string;
    amount?: number;
    new_balance?: number;
    currency?: string;
    transaction_id?: string;
    already_processed?: boolean;
    metadata?: {
        old_balance?: number;
        processing_time_ms?: number;
    };
}

// ============================================================
// CONSTANTS
// ============================================================

// ✅ FIXED: Proper validation with clear error
const getAPIBaseURL = (): string => {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) {
        throw new Error(
            '❌ CRITICAL: VITE_API_URL is not defined!\n\n' +
            'Add to your .env file:\n' +
            'VITE_API_URL=/api\n\n' +
            'Then rebuild: npm run build'
        );
    }
    return apiUrl;
};

const API_BASE_URL = getAPIBaseURL();
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;
const REDIRECT_DELAY_MS = 3000;
const REQUEST_TIMEOUT_MS = 30000;

// ============================================================
// UTILITIES
// ============================================================

class Logger {
    private static context = 'PaystackCallback';

    static info(message: string, data?: Record<string, any>) {
        console.log(`[${this.context}] ℹ️ ${message}`, data || '');
    }

    static error(message: string, error?: any, data?: Record<string, any>) {
        console.error(`[${this.context}] ❌ ${message}`, {
            error: error?.message || error,
            stack: error?.stack,
            ...data,
        });
    }

    static warn(message: string, data?: Record<string, any>) {
        console.warn(`[${this.context}] ⚠️ ${message}`, data || '');
    }

    static debug(message: string, data?: Record<string, any>) {
        if (import.meta.env.DEV) {
            console.debug(`[${this.context}] 🔍 ${message}`, data || '');
        }
    }
}

class PerformanceMonitor {
    private startTime: number;
    private eventName: string;

    constructor(eventName: string) {
        this.eventName = eventName;
        this.startTime = performance.now();
    }

    end(additionalData?: Record<string, any>) {
        const duration = performance.now() - this.startTime;

        Logger.info(`Performance: ${this.eventName}`, {
            duration_ms: duration.toFixed(2),
            ...additionalData,
        });

        return duration;
    }
}

async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxAttempts: number = MAX_RETRY_ATTEMPTS,
    baseDelay: number = RETRY_DELAY_MS
): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            if (attempt < maxAttempts) {
                const delay = baseDelay * Math.pow(2, attempt - 1);
                Logger.warn(`Retry attempt ${attempt}/${maxAttempts} failed`, {
                    error: lastError.message,
                    nextRetryIn: `${delay}ms`,
                });
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError!;
}

class ApiClient {
    private static async fetchWithTimeout(
        url: string,
        options: RequestInit,
        timeout: number = REQUEST_TIMEOUT_MS
    ): Promise<Response> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if ((error as Error).name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    }

    static async post<T>(
        endpoint: string,
        body: any,
        token: string
    ): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;

        Logger.debug(`API Request: POST ${endpoint}`, { body });

        const response = await this.fetchWithTimeout(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            Logger.error(`API Error: ${response.status}`, null, errorData);
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        Logger.debug(`API Response: POST ${endpoint}`, { data });

        return data;
    }
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function PaystackCallback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [status, setStatus] = useState<PaymentStatus>(PaymentStatusValues.LOADING);
    const [message, setMessage] = useState('Processing your payment...');
    const [details, setDetails] = useState<PaymentDetails>({});
    const [errorCode, setErrorCode] = useState<ErrorCode | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    const hasVerified = useRef(false);
    const redirectTimeoutRef = useRef<number | null>(null);
    const performanceMonitor = useRef<PerformanceMonitor | null>(null);

    // ========================================
    // VERIFICATION LOGIC
    // ========================================

    const verifyPayment = useCallback(async (reference: string, token: string): Promise<void> => {
        performanceMonitor.current = new PerformanceMonitor('payment_verification');

        try {
            Logger.info('Starting payment verification', { reference });

            const data = await retryWithBackoff<VerificationResponse>(
                () => ApiClient.post('/api/paystack/verify/', { reference }, token)
            );

            const duration = performanceMonitor.current.end({
                reference,
                success: data.success,
                already_processed: data.already_processed,
            });

            if (data.success) {
                const paymentDetails: PaymentDetails = {
                    amount: data.amount,
                    newBalance: data.new_balance,
                    currency: data.currency || 'USD',
                    transactionId: data.transaction_id,
                    processingTimeMs: data.metadata?.processing_time_ms || duration,
                };

                setDetails(paymentDetails);

                if (data.already_processed) {
                    setStatus(PaymentStatusValues.DUPLICATE);
                    setMessage('This payment was already processed successfully.');

                    Logger.warn('Duplicate payment detected', {
                        reference,
                        amount: data.amount,
                    });
                } else {
                    setStatus(PaymentStatusValues.SUCCESS);
                    setMessage(data.message || 'Payment successful!');

                    Logger.info('Payment verified successfully', {
                        reference,
                        amount: data.amount,
                        newBalance: data.new_balance,
                    });
                }

                redirectTimeoutRef.current = window.setTimeout(() => {
                    navigate('/client/wallet', { replace: true });
                }, REDIRECT_DELAY_MS);
            } else {
                setStatus(PaymentStatusValues.ERROR);
                setMessage(data.message || 'Payment verification failed');
                setErrorCode(data.error_code as ErrorCode || ErrorCodeValues.VERIFICATION_FAILED);

                Logger.error('Payment verification failed', null, {
                    reference,
                    errorCode: data.error_code,
                    message: data.message,
                });
            }
        } catch (error) {
            const duration = performanceMonitor.current?.end({ error: true });

            setStatus(PaymentStatusValues.NETWORK_ERROR);
            setMessage('Network error. Please check your connection and try again.');
            setErrorCode(ErrorCodeValues.NETWORK_ERROR);

            Logger.error('Network error during verification', error, {
                reference,
                retryCount,
                duration,
            });
        }
    }, [navigate, retryCount]);

    // ========================================
    // INITIALIZATION
    // ========================================

    useEffect(() => {
        if (hasVerified.current) {
            Logger.debug('Verification already in progress, skipping');
            return;
        }

        const initVerification = async () => {
            hasVerified.current = true;

            const reference = searchParams.get('reference');
            // ✅ ONLY CHANGE: localStorage instead of sessionStorage
            const token = localStorage.getItem('access_token');

            if (!reference) {
                setStatus(PaymentStatusValues.ERROR);
                setMessage('No payment reference found. Payment may have been cancelled.');
                setErrorCode(ErrorCodeValues.MISSING_REFERENCE);
                Logger.error('Missing payment reference in URL');
                return;
            }

            if (!token) {
                setStatus(PaymentStatusValues.ERROR);
                setMessage('You must be logged in to complete this action.');
                setErrorCode(ErrorCodeValues.NOT_AUTHENTICATED);
                Logger.error('User not authenticated');
                return;
            }

            await verifyPayment(reference, token);
        };

        initVerification();

        return () => {
            if (redirectTimeoutRef.current) {
                clearTimeout(redirectTimeoutRef.current);
            }
        };
    }, [searchParams, verifyPayment]);

    // ========================================
    // RETRY HANDLER
    // ========================================

    const handleRetry = useCallback(() => {
        const reference = searchParams.get('reference');
        // ✅ ONLY CHANGE: localStorage instead of sessionStorage
        const token = localStorage.getItem('access_token');

        if (!reference || !token) {
            Logger.error('Cannot retry: missing reference or token');
            return;
        }

        setStatus(PaymentStatusValues.LOADING);
        setMessage('Retrying payment verification...');
        setRetryCount(prev => prev + 1);
        hasVerified.current = false;

        verifyPayment(reference, token);
    }, [searchParams, verifyPayment]);

    // ========================================
    // UI CONFIGURATION
    // ========================================

    const getStatusConfig = () => {
        switch (status) {
            case PaymentStatusValues.SUCCESS:
                return {
                    icon: CheckCircle,
                    color: '#4caf50',
                    title: 'Payment Successful',
                    showRedirect: true,
                };
            case PaymentStatusValues.DUPLICATE:
                return {
                    icon: AlertCircle,
                    color: '#ff9800',
                    title: 'Already Processed',
                    showRedirect: true,
                };
            case PaymentStatusValues.ERROR:
            case PaymentStatusValues.NETWORK_ERROR:
                return {
                    icon: XCircle,
                    color: '#f44336',
                    title: 'Payment Failed',
                    showRedirect: false,
                };
            default:
                return {
                    icon: Loader,
                    color: '#2c5f8d',
                    title: 'Processing Payment',
                    showRedirect: false,
                };
        }
    };

    const config = getStatusConfig();
    const Icon = config.icon;
    const isLoading = status === PaymentStatusValues.LOADING;

    // ========================================
    // RENDER
    // ========================================

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
                padding: '20px',
            }}
            role="main"
            aria-live="polite"
        >
            <div
                style={{
                    backgroundColor: '#fff',
                    padding: '40px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    textAlign: 'center',
                    maxWidth: '500px',
                    width: '100%',
                }}
                role="alert"
                aria-atomic="true"
            >
                <div style={{ marginBottom: '20px' }}>
                    <Icon
                        size={56}
                        style={{
                            display: 'inline-block',
                            color: config.color,
                            ...(isLoading && {
                                animation: 'spin 1s linear infinite',
                            }),
                        }}
                        aria-hidden="true"
                    />
                </div>

                <h1
                    style={{
                        fontSize: '28px',
                        fontWeight: 'bold',
                        marginBottom: '12px',
                        color: config.color,
                    }}
                >
                    {config.title}
                </h1>

                <p
                    style={{
                        fontSize: '16px',
                        color: '#666',
                        marginBottom: '24px',
                        lineHeight: '1.6',
                    }}
                >
                    {message}
                </p>

                {details.amount !== undefined && (
                    <div
                        style={{
                            backgroundColor: '#f8f9fa',
                            padding: '20px',
                            borderRadius: '8px',
                            marginBottom: '24px',
                            textAlign: 'left',
                            borderLeft: `4px solid ${config.color}`,
                        }}
                    >
                        <div style={{ marginBottom: '12px' }}>
                            <span style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>
                                Amount Processed
                            </span>
                            <span style={{ fontSize: '20px', fontWeight: '600', color: '#333' }}>
                                ${details.amount.toFixed(2)} {details.currency}
                            </span>
                        </div>

                        {details.newBalance !== undefined && (
                            <div style={{ marginBottom: '12px' }}>
                                <span style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>
                                    Current Wallet Balance
                                </span>
                                <span style={{ fontSize: '20px', fontWeight: '600', color: config.color }}>
                                    ${details.newBalance.toFixed(2)} {details.currency}
                                </span>
                            </div>
                        )}

                        {details.processingTimeMs && (
                            <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                                Processed in {details.processingTimeMs.toFixed(0)}ms
                            </div>
                        )}
                    </div>
                )}

                {errorCode && (status === PaymentStatusValues.ERROR || status === PaymentStatusValues.NETWORK_ERROR) && (
                    <div
                        style={{
                            backgroundColor: '#fee',
                            border: '1px solid #fcc',
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            fontSize: '13px',
                            color: '#c33',
                        }}
                        role="alert"
                    >
                        <strong>Error Code:</strong> {errorCode}
                        {retryCount > 0 && <div style={{ marginTop: '4px' }}>Retry attempt: {retryCount}</div>}
                    </div>
                )}

                {isLoading && (
                    <p style={{ fontSize: '13px', color: '#999', marginBottom: '20px' }}>
                        Verifying your payment with the server...
                    </p>
                )}

                {config.showRedirect && (
                    <p style={{ fontSize: '13px', color: '#999', marginBottom: '20px' }}>
                        Redirecting to wallet in {(REDIRECT_DELAY_MS / 1000).toFixed(0)} seconds...
                    </p>
                )}

                <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                    {config.showRedirect && (
                        <button
                            onClick={() => navigate('/client/wallet', { replace: true })}
                            style={{
                                padding: '14px 28px',
                                backgroundColor: config.color,
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '15px',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                            aria-label="Go to wallet"
                        >
                            Go to Wallet
                        </button>
                    )}

                    {(status === PaymentStatusValues.ERROR || status === PaymentStatusValues.NETWORK_ERROR) && (
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => navigate('/client/wallet', { replace: true })}
                                style={{
                                    flex: 1,
                                    padding: '12px 20px',
                                    backgroundColor: '#f5f5f5',
                                    color: '#333',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                }}
                                aria-label="Go back to wallet"
                            >
                                <ArrowLeft size={18} />
                                Back to Wallet
                            </button>

                            <button
                                onClick={handleRetry}
                                disabled={retryCount >= MAX_RETRY_ATTEMPTS}
                                style={{
                                    flex: 1,
                                    padding: '12px 20px',
                                    backgroundColor: retryCount >= MAX_RETRY_ATTEMPTS ? '#ccc' : '#2c5f8d',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: retryCount >= MAX_RETRY_ATTEMPTS ? 'not-allowed' : 'pointer',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    opacity: retryCount >= MAX_RETRY_ATTEMPTS ? 0.6 : 1,
                                }}
                                aria-label="Retry verification"
                            >
                                <RefreshCw size={18} />
                                {retryCount >= MAX_RETRY_ATTEMPTS ? 'Max Retries Reached' : 'Retry'}
                            </button>
                        </div>
                    )}

                    {isLoading && (
                        <button
                            onClick={() => navigate('/client/wallet', { replace: true })}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: 'transparent',
                                color: '#666',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '13px',
                                textDecoration: 'underline',
                            }}
                            aria-label="Cancel and go back"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}