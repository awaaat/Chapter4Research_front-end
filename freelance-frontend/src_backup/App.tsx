// App.tsx - Complete routing configuration with password reset & Paystack
import { useEffect } from "react";
import {
    Route,
    Routes,
    useLocation,
    useNavigate,
} from "react-router-dom";

// Import ALL your pages

import BrowseProjectsPage from "./pages/BrowseProjectsPage";
import CalendarPage from "./pages/CalendarPage";
import ClientDashboardPage from "./pages/ClientDashboardPage";
import ClientPostProjectPage from "./pages/ClientPostProjectPage";
import ClientProfilePage from "./pages/ClientProfilePage";
import ClientProjectsPage from "./pages/ClientProjectsPage";
import ClientRegisterPage from "./pages/ClientRegisterPage";
import EvaluationReportsPage from "./pages/EvaluationReportsPage";
import KnowledgeBasePage from "./pages/KnowledgeBasePage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import MessagingPage from "./pages/MessagingPage";
import MyProjectsPage from "./pages/MyProjectsPage";
import NotificationsPage from "./pages/NotificationsPage";
import PerformanceMetricsPage from "./pages/PerformanceMetricsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import ReviewPage from "./pages/ReviewPage";
import TutorDashboardPage from "./pages/TutorDashboardPage";
import TutorProfilePage from "./pages/TutorProfilePage";
import TutorProjectDetailPage from "./pages/TutorProjectDetailPage";
import TutorRegisterPage from "./pages/TutorRegisterPage";
import TutorSubmitWorkPage from "./pages/TutorSubmitWorkPage";
import TutorWithdrawalPage from "./pages/TutorWithdrawalPage";
import WalletDisplay from "./pages/WalletFinanceSystem";

// Password Reset Pages
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

import PaystackCallback from "./pages/PaystackCallback";

// ————————————————————————
// Protected Routes
// ————————————————————————
const ProtectedTutorRoute = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => {
        const user = localStorage.getItem("user");
        const token = localStorage.getItem("access_token");
        if (!user || !token) {
            navigate("/login", { state: { from: location.pathname } });
            return;
        }
        try {
            const parsed = JSON.parse(user);
            if (parsed.role !== "tutor") {
                navigate("/");
            }
        } catch (e) {
            localStorage.clear();
            navigate("/login");
        }
    }, [navigate, location]);
    return <>{children}</>;
};

const ProtectedClientRoute = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => {
        const user = localStorage.getItem("user");
        const token = localStorage.getItem("access_token");
        if (!user || !token) {
            navigate("/login", { state: { from: location.pathname } });
            return;
        }
        try {
            const parsed = JSON.parse(user);
            if (parsed.role !== "client") {
                navigate("/");
            }
        } catch (e) {
            localStorage.clear();
            navigate("/login");
        }
    }, [navigate, location]);
    return <>{children}</>;
};

// Protected for BOTH roles
const ProtectedAnyUserRoute = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => {
        const user = localStorage.getItem("user");
        const token = localStorage.getItem("access_token");
        if (!user || !token) {
            navigate("/login", { state: { from: location.pathname } });
        }
    }, [navigate, location]);
    return <>{children}</>;
};

// ————————————————————————
// Main App Component
// ————————————————————————
function App() {
    return (
        <Routes>
            {/* ========== PUBLIC ROUTES ========== */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/client/register" element={<ClientRegisterPage />} />
            <Route path="/tutor/register" element={<TutorRegisterPage />} />

            {/* ========== PASSWORD RESET ROUTES ========== */}
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />

            {/* ========== PAYSTACK ROUTES ========== */}
            {/* ✅ NEW: Paystack callback (NO protection needed - public) */}
            <Route path="/paystack-callback" element={<PaystackCallback />} />

            {/* ========== TUTOR ROUTES ========== */}
            <Route
                path="/tutor/dashboard"
                element={
                    <ProtectedTutorRoute>
                        <TutorDashboardPage />
                    </ProtectedTutorRoute>
                }
            />
            <Route
                path="/tutor/projects"
                element={
                    <ProtectedTutorRoute>
                        <BrowseProjectsPage />
                    </ProtectedTutorRoute>
                }
            />
            <Route
                path="/tutor/projects/:projectId"
                element={
                    <ProtectedTutorRoute>
                        <ProjectDetailPage />
                    </ProtectedTutorRoute>
                }
            />
            <Route
                path="/tutor/project/:projectId"
                element={
                    <ProtectedTutorRoute>
                        <TutorProjectDetailPage />
                    </ProtectedTutorRoute>
                }
            />
            <Route
                path="/knowledge-base"
                element={
                    <ProtectedAnyUserRoute>
                        <KnowledgeBasePage />
                    </ProtectedAnyUserRoute>
                }
            />

            <Route
                path="/tutor/my-projects"
                element={
                    <ProtectedTutorRoute>
                        <MyProjectsPage />
                    </ProtectedTutorRoute>
                }
            />
            <Route
                path="/tutor/submit-work/:projectId"
                element={
                    <ProtectedTutorRoute>
                        <TutorSubmitWorkPage />
                    </ProtectedTutorRoute>
                }
            />
            <Route
                path="/tutor/profile"
                element={
                    <ProtectedTutorRoute>
                        <TutorProfilePage />
                    </ProtectedTutorRoute>
                }
            />
            <Route
                path="/tutor/performance/metrics"
                element={
                    <ProtectedTutorRoute>
                        <PerformanceMetricsPage />
                    </ProtectedTutorRoute>
                }
            />
            <Route
                path="/tutor/calendar"
                element={
                    <ProtectedTutorRoute>
                        <CalendarPage />
                    </ProtectedTutorRoute>
                }
            />
            <Route
                path="/tutor/evaluation/reports"
                element={
                    <ProtectedTutorRoute>
                        <EvaluationReportsPage />
                    </ProtectedTutorRoute>
                }
            />
            <Route
                path="/tutor/wallet"
                element={
                    <ProtectedTutorRoute>
                        <WalletDisplay userRole="tutor" />
                    </ProtectedTutorRoute>
                }
            />
            <Route
                path="/tutor/wallet/withdraw"
                element={
                    <ProtectedTutorRoute>
                        <TutorWithdrawalPage />
                    </ProtectedTutorRoute>
                }
            />

            {/* ========== CLIENT ROUTES ========== */}
            <Route
                path="/client/dashboard"
                element={
                    <ProtectedClientRoute>
                        <ClientDashboardPage />
                    </ProtectedClientRoute>
                }
            />
            <Route
                path="client/post-project"
                element={
                    <ProtectedClientRoute>
                        <ClientPostProjectPage />
                    </ProtectedClientRoute>
                }
            />
            <Route
                path="/client/projects"
                element={
                    <ProtectedClientRoute>
                        <ClientProjectsPage />
                    </ProtectedClientRoute>
                }
            />
            <Route
                path="/client/projects/:projectId"
                element={
                    <ProtectedClientRoute>
                        <ClientProjectsPage />
                    </ProtectedClientRoute>
                }
            />
            <Route
                path="/client/profile"
                element={
                    <ProtectedClientRoute>
                        <ClientProfilePage />
                    </ProtectedClientRoute>
                }
            />
            <Route
                path="/client/wallet"
                element={
                    <ProtectedClientRoute>
                        <WalletDisplay userRole="client" />
                    </ProtectedClientRoute>
                }
            />
            <Route
                path="/review/:projectId"
                element={
                    <ProtectedClientRoute>
                        <ReviewPage />
                    </ProtectedClientRoute>
                }
            />

            {/* ========== SHARED ROUTES (Both Roles) ========== */}
            <Route
                path="/notifications"
                element={
                    <ProtectedAnyUserRoute>
                        <NotificationsPage />
                    </ProtectedAnyUserRoute>
                }
            />
            <Route
                path="/messaging"
                element={
                    <ProtectedAnyUserRoute>
                        <MessagingPage />
                    </ProtectedAnyUserRoute>
                }
            />
            <Route
                path="/messaging/:conversationId"
                element={
                    <ProtectedAnyUserRoute>
                        <MessagingPage />
                    </ProtectedAnyUserRoute>
                }
            />
            <Route
                path="/client/messages"
                element={
                    <ProtectedAnyUserRoute>
                        <MessagingPage />
                    </ProtectedAnyUserRoute>
                }
            />
            <Route
                path="/client/messages/:conversationId"
                element={
                    <ProtectedAnyUserRoute>
                        <MessagingPage />
                    </ProtectedAnyUserRoute>
                }
            />
            <Route
                path="/wallet"
                element={
                    <ProtectedAnyUserRoute>
                        <WalletDisplay
                            userRole={
                                (() => {
                                    try {
                                        const user = localStorage.getItem("user");
                                        if (user) {
                                            const parsed = JSON.parse(user);
                                            return parsed.role as "tutor" | "client";
                                        }
                                    } catch (e) {
                                        console.error("Error parsing user role:", e);
                                    }
                                    return "tutor";
                                })()
                            }
                        />
                    </ProtectedAnyUserRoute>
                }
            />

            {/* ========== 404 FALLBACK ========== */}
            <Route
                path="*"
                element={
                    <div
                        style={{
                            height: "100vh",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "2rem",
                            fontWeight: "bold",
                            color: "#dc2626",
                        }}
                    >
                        404 – Page Not Found
                    </div>
                }
            />
        </Routes>
    );
}

export default App;