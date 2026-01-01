import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './KnowledgeBasePage.css';


interface User {
    user_id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    role: 'tutor';
    tutor_level: 'new' | 'junior' | 'senior' | 'advanced';
    profile_picture: string | null;
    hourly_rate: number;
    skills: string[];
    experience_years: number;
    is_available: boolean;
    is_email_verified: boolean;
    is_active: boolean;
}


const KnowledgeBasePage = () => {
    const [user, setUser] = useState<User | null>(null);
    const [activeSection, setActiveSection] = useState<string>('');
    const [expandedItem, setExpandedItem] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');

        if (!token || !storedUser) {
            navigate('/login');
            return;
        }

        try {
            const userData = JSON.parse(storedUser) as User;
            if (userData.role !== 'tutor') {
                navigate('/');
                return;
            }
            setUser(userData);
        } catch (e) {
            localStorage.clear();
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const scrollToSection = (sectionId: string) => {
        setActiveSection(sectionId);
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const toggleItem = (itemId: string) => {
        setExpandedItem(expandedItem === itemId ? '' : itemId);
    };

    if (!user) return null;

    const navigationSections = [
        { id: 'getting-started', title: 'Getting Started' },
        { id: 'platform-overview', title: 'Platform Overview' },
        { id: 'tutor-levels', title: 'Tutor Levels & Progression' },
        { id: 'bidding-guide', title: 'Project Bidding Guide' },
        { id: 'payments', title: 'Payments & Earnings' },
        { id: 'user-agreement', title: 'User Agreement' },
        { id: 'community-standards', title: 'Community Standards' },
        { id: 'content-policy', title: 'Content & Quality Policy' },
        { id: 'disputes', title: 'Disputes & Resolution' },
        { id: 'privacy-security', title: 'Privacy & Security' },
        { id: 'best-practices', title: 'Best Practices' },
        { id: 'faq', title: 'FAQ' }
    ];

    return (
        <div className="kb-wrapper">
            {/* Top Navigation */}
            <nav className="kb-topbar">
                <div className="kb-topbar-content">
                    <Link to="/" className="kb-brand">
                        <img src="/images/helper-brand-logo.jpg" alt="chapter4research" />
                    </Link>
                    <div className="kb-nav-links">
                        <Link to="/income/boost">Income Boost</Link>
                        <Link to="/tutor/projects">Browse Projects</Link>
                        <Link to="/tutor/wallet">Balance</Link>
                    </div>
                    <div className="kb-user-section">
                        <span className="kb-username">{user.username}</span>
                        <Link to="/tutor/profile" className="kb-profile-btn">Profile</Link>
                        <button onClick={handleLogout} className="kb-logout-btn">Logout</button>
                    </div>
                </div>
            </nav>

            <div className="kb-container">
                {/* Sidebar Navigation */}
                <aside className="kb-sidebar">
                    <div className="kb-sidebar-header">
                        <h2>Knowledge Base</h2>
                        <p className="kb-subtitle">Your complete guide to success</p>
                    </div>
                    <nav className="kb-nav">
                        {navigationSections.map(section => (
                            <button
                                key={section.id}
                                className={`kb-nav-item ${activeSection === section.id ? 'active' : ''}`}
                                onClick={() => scrollToSection(section.id)}
                            >
                                <span className="kb-nav-text">{section.title}</span>
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="kb-content">
                    {/* Hero Section */}
                    <header className="kb-hero">
                        <div className="kb-hero-badge">Professional Services Platform</div>
                        <h1>Welcome to Chapter4research</h1>
                        <p className="kb-hero-subtitle">Your comprehensive guide to thriving as a professional service provider. From technical solutions to creative services, master everything you need to succeed on our platform.</p>
                        <div className="kb-quick-stats">
                            <div className="kb-stat">
                                <div className="kb-stat-value">2,500+</div>
                                <div className="kb-stat-label">Active Projects</div>
                            </div>
                            <div className="kb-stat">
                                <div className="kb-stat-value">98%</div>
                                <div className="kb-stat-label">Satisfaction Rate</div>
                            </div>
                            <div className="kb-stat">
                                <div className="kb-stat-value">24/7</div>
                                <div className="kb-stat-label">Support Available</div>
                            </div>
                        </div>
                    </header>

                    {/* Getting Started Section */}
                    <section id="getting-started" className="kb-section">
                        <div className="kb-section-header">
                            <h2>Getting Started</h2>
                            <p>Everything you need to launch your career on Chapter4</p>
                        </div>

                        <div className="kb-card">
                            <h3>Complete Your Professional Profile</h3>
                            <p>Your profile is your storefront - make it count. A complete, professional profile receives 5x more project invitations than incomplete ones.</p>

                            <div className="kb-checklist">
                                <div className="kb-checklist-item">
                                    <span className="kb-check">✓</span>
                                    <div>
                                        <strong>Professional Photo</strong>
                                        <p>Upload a clear headshot. Profiles with photos get 300% more views. Use good lighting, professional attire, and a neutral background.</p>
                                    </div>
                                </div>
                                <div className="kb-checklist-item">
                                    <span className="kb-check">✓</span>
                                    <div>
                                        <strong>Skills & Expertise</strong>
                                        <p>List all services you offer: web development, data analysis, content writing, graphic design, research writing, grant proposals, etc. Be specific - "React.js Development" performs better than "Web Development".</p>
                                    </div>
                                </div>
                                <div className="kb-checklist-item">
                                    <span className="kb-check">✓</span>
                                    <div>
                                        <strong>Competitive Hourly Rate</strong>
                                        <p>Research market rates in your category. New providers typically start at $15-30/hour for technical services, $10-20/hour for creative services. You can increase rates as you build reputation.</p>
                                    </div>
                                </div>
                                <div className="kb-checklist-item">
                                    <span className="kb-check">✓</span>
                                    <div>
                                        <strong>Compelling Bio</strong>
                                        <p>Write 3-4 sentences about your experience, approach, and what makes you unique. Example: "Full-stack developer with 5+ years building scalable web applications. Specialized in React, Node.js, and cloud deployment. I deliver clean code and clear documentation for every project."</p>
                                    </div>
                                </div>
                                <div className="kb-checklist-item">
                                    <span className="kb-check">✓</span>
                                    <div>
                                        <strong>Portfolio Samples</strong>
                                        <p>Upload 3-5 samples of your best work (with client permission or anonymized). Include variety to showcase your range.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="kb-card">
                            <h3>Your First Week Action Plan</h3>
                            <div className="kb-timeline">
                                <div className="kb-timeline-item">
                                    <div className="kb-timeline-marker">Day 1</div>
                                    <div className="kb-timeline-content">
                                        <strong>Profile Setup</strong>
                                        <p>Complete 100% of your profile. Profiles with completion scores below 80% are deprioritized in search results.</p>
                                    </div>
                                </div>
                                <div className="kb-timeline-item">
                                    <div className="kb-timeline-marker">Day 2-3</div>
                                    <div className="kb-timeline-content">
                                        <strong>Market Research</strong>
                                        <p>Browse 20-30 projects in your categories. Study successful proposals to understand what clients want and how to price your services.</p>
                                    </div>
                                </div>
                                <div className="kb-timeline-item">
                                    <div className="kb-timeline-marker">Day 4-5</div>
                                    <div className="kb-timeline-content">
                                        <strong>Submit First Proposals</strong>
                                        <p>Apply to 5-10 projects that match your skills. Start with smaller projects to build reviews quickly.</p>
                                    </div>
                                </div>
                                <div className="kb-timeline-item">
                                    <div className="kb-timeline-marker">Day 6-7</div>
                                    <div className="kb-timeline-content">
                                        <strong>Engage & Network</strong>
                                        <p>Respond to all messages within 2 hours. Join the community forum. Set up email/SMS notifications for new opportunities.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="kb-card">
                            <h3>Setting Yourself Up for Success</h3>
                            <ul className="kb-list">
                                <li>Enable all notification channels (email, SMS, push) so you never miss opportunities</li>
                                <li>Set your availability status accurately - clients prefer providers who are immediately available</li>
                                <li>Prepare proposal templates for common project types to respond faster</li>
                                <li>Join the weekly tutor webinar (Thursdays 2 PM EST) to learn from top performers</li>
                                <li>Bookmark the Knowledge Base and review it regularly as policies and features evolve</li>
                            </ul>
                        </div>
                    </section>

                    {/* Platform Overview */}
                    <section id="platform-overview" className="kb-section">
                        <div className="kb-section-header">
                            <h2>Platform Overview</h2>
                            <p>Understanding Chapter4research service marketplace</p>
                        </div>
                        <div className="kb-card">
                            <h3>What We Do</h3>
                            <p>Chapter4research is a professional services marketplace connecting clients with expert providers across multiple categories:</p>

                            <div className="kb-grid">
                                <div className="kb-category-card">
                                    <div className="kb-category-icon"></div>
                                    <h4>Technical Services</h4>
                                    <ul>
                                        <li>Web & Mobile Development</li>
                                        <li>Data Analysis & Machine Learning</li>
                                        <li>Database Design & Cloud Solutions</li>
                                        <li>Cybersecurity & Blockchain</li>
                                        <li>Technical Documentation</li>
                                    </ul>
                                </div>
                                <div className="kb-category-card">
                                    <div className="kb-category-icon"></div>
                                    <h4>Writing & Research</h4>
                                    <ul>
                                        <li>Research Papers & Dissertations</li>
                                        <li>Grant Proposal Writing</li>
                                        <li>Business Writing & Plans</li>
                                        <li>Content Creation & Copywriting</li>
                                        <li>Technical Writing</li>
                                    </ul>
                                </div>
                                <div className="kb-category-card">
                                    <div className="kb-category-icon"></div>
                                    <h4>Creative Services</h4>
                                    <ul>
                                        <li>Graphic Design & Branding</li>
                                        <li>Video Production & Editing</li>
                                        <li>Presentation Design</li>
                                        <li>Social Media Content</li>
                                        <li>UI/UX Design</li>
                                    </ul>
                                </div>
                                <div className="kb-category-card">
                                    <div className="kb-category-icon"></div>
                                    <h4>Business Services</h4>
                                    <ul>
                                        <li>Market Research & Analysis</li>
                                        <li>Business Strategy & Consulting</li>
                                        <li>Brand Strategy & Development</li>
                                        <li>Email Marketing & SEO</li>
                                        <li>Event Planning & Management</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="kb-card">
                            <h3>How the Platform Works</h3>
                            <div className="kb-process">
                                <div className="kb-process-step">
                                    <div className="kb-process-number">1</div>
                                    <div className="kb-process-content">
                                        <h4>Client Posts Project</h4>
                                        <p>Clients describe their needs, budget, and timeline. Projects are categorized and made visible to qualified providers.</p>
                                    </div>
                                </div>
                                <div className="kb-process-step">
                                    <div className="kb-process-number">2</div>
                                    <div className="kb-process-content">
                                        <h4>Providers Submit Proposals</h4>
                                        <p>You browse relevant projects and submit customized proposals explaining your approach, timeline, and pricing.</p>
                                    </div>
                                </div>
                                <div className="kb-process-step">
                                    <div className="kb-process-number">3</div>
                                    <div className="kb-process-content">
                                        <h4>Client Selects Provider</h4>
                                        <p>Client reviews proposals and selects the best match. Payment is held in secure escrow to protect both parties.</p>
                                    </div>
                                </div>
                                <div className="kb-process-step">
                                    <div className="kb-process-number">4</div>
                                    <div className="kb-process-content">
                                        <h4>Work & Delivery</h4>
                                        <p>You complete the work, communicate through our messaging system, and submit deliverables through the platform.</p>
                                    </div>
                                </div>
                                <div className="kb-process-step">
                                    <div className="kb-process-number">5</div>
                                    <div className="kb-process-content">
                                        <h4>Review & Payment</h4>
                                        <p>Client reviews work. Upon approval (or automatic release after 7 days), payment is transferred to your wallet minus platform fee.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="kb-card kb-highlight">
                            <h3>🛡️ Protection for Providers</h3>
                            <ul className="kb-list">
                                <li><strong>Escrow System:</strong> Client payment is held securely before work begins. You're guaranteed payment for approved work.</li>
                                <li><strong>Automatic Release:</strong> If client doesn't respond within 7 days of delivery, payment automatically releases to you.</li>
                                <li><strong>Dispute Resolution:</strong> Fair arbitration process with platform support team reviewing evidence from both sides.</li>
                                <li><strong>Milestone Payments:</strong> For large projects, set up milestone-based payments to reduce risk.</li>
                                <li><strong>Rating Protection:</strong> Clients can't leave ratings without written feedback. Unfair ratings can be contested.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Tutor Levels */}
                    <section id="tutor-levels" className="kb-section">
                        <div className="kb-section-header">
                            <h2>Tutor Levels & Progression</h2>
                            <p>Advance your career and unlock better opportunities</p>
                        </div>

                        <div className="kb-card">
                            <h3>How Levels Work</h3>
                            <p>Your level is automatically calculated based on your performance metrics and updated in real-time. Higher levels mean more visibility, lower fees, and access to premium features.</p>
                        </div>

                        <div className="kb-levels-container">
                            <div className="kb-level-card level-new">
                                <div className="kb-level-badge">NEW</div>
                                <h3>New Provider</h3>
                                <div className="kb-level-subtitle">Building your foundation</div>

                                <div className="kb-level-requirements">
                                    <h4>Requirements:</h4>
                                    <ul>
                                        <li>0-5 completed projects</li>
                                        <li>Profile completion: 80%+</li>
                                        <li>No minimum rating (building reputation)</li>
                                    </ul>
                                </div>

                                <div className="kb-level-benefits">
                                    <h4>Benefits:</h4>
                                    <ul>
                                        <li>Platform fee: 20%</li>
                                        <li>Standard project visibility</li>
                                        <li>Access to all project categories</li>
                                        <li>Basic profile customization</li>
                                        <li>Email support (24-48 hour response)</li>
                                    </ul>
                                </div>

                                <div className="kb-level-focus">
                                    <h4>Focus At This Level:</h4>
                                    <p>Take on smaller projects to build reviews quickly. Respond to every message within 4 hours. Deliver early to exceed expectations.</p>
                                </div>
                            </div>

                            <div className="kb-level-card level-junior">
                                <div className="kb-level-badge">JUNIOR</div>
                                <h3>Junior Provider</h3>
                                <div className="kb-level-subtitle">Proven track record emerging</div>

                                <div className="kb-level-requirements">
                                    <h4>Requirements:</h4>
                                    <ul>
                                        <li>5-20 completed projects</li>
                                        <li>4.0+ average rating</li>
                                        <li>85%+ response rate (under 24 hours)</li>
                                        <li>80%+ on-time delivery rate</li>
                                    </ul>
                                </div>

                                <div className="kb-level-benefits">
                                    <h4>Benefits:</h4>
                                    <ul>
                                        <li>Platform fee: 15%</li>
                                        <li>Enhanced project visibility</li>
                                        <li>Featured in category searches</li>
                                        <li>Unlock: Project outsourcing (delegate to other providers)</li>
                                        <li>Priority email support (12-24 hour response)</li>
                                        <li>Monthly performance analytics</li>
                                    </ul>
                                </div>

                                <div className="kb-level-focus">
                                    <h4>Focus At This Level:</h4>
                                    <p>Maintain consistent quality. Start specializing in 2-3 categories. Build long-term client relationships for repeat business.</p>
                                </div>
                            </div>

                            <div className="kb-level-card level-senior">
                                <div className="kb-level-badge">SENIOR</div>
                                <h3>Senior Provider</h3>
                                <div className="kb-level-subtitle">Established platform expert</div>

                                <div className="kb-level-requirements">
                                    <h4>Requirements:</h4>
                                    <ul>
                                        <li>20-50 completed projects</li>
                                        <li>4.5+ average rating</li>
                                        <li>90%+ response rate (under 12 hours)</li>
                                        <li>90%+ on-time delivery rate</li>
                                        <li>Less than 5% dispute rate</li>
                                    </ul>
                                </div>

                                <div className="kb-level-benefits">
                                    <h4>Benefits:</h4>
                                    <ul>
                                        <li>Platform fee: 12%</li>
                                        <li>Priority in all search results</li>
                                        <li>"Senior Provider" badge on profile</li>
                                        <li>Access to premium projects (higher budgets)</li>
                                        <li>Direct project invitations from repeat clients</li>
                                        <li>Chat & phone support (2-4 hour response)</li>
                                        <li>Quarterly performance reviews with account manager</li>
                                        <li>Early access to new platform features</li>
                                    </ul>
                                </div>

                                <div className="kb-level-focus">
                                    <h4>Focus At This Level:</h4>
                                    <p>Command premium rates. Develop signature processes. Mentor new providers through the community program.</p>
                                </div>
                            </div>

                            <div className="kb-level-card level-advanced">
                                <div className="kb-level-badge">ADVANCED</div>
                                <h3>Advanced Provider</h3>
                                <div className="kb-level-subtitle">Elite platform professional</div>

                                <div className="kb-level-requirements">
                                    <h4>Requirements:</h4>
                                    <ul>
                                        <li>50+ completed projects</li>
                                        <li>4.8+ average rating</li>
                                        <li>95%+ response rate (under 6 hours)</li>
                                        <li>95%+ on-time delivery rate</li>
                                        <li>Less than 2% dispute rate</li>
                                        <li>$10,000+ total earnings</li>
                                    </ul>
                                </div>

                                <div className="kb-level-benefits">
                                    <h4>Benefits:</h4>
                                    <ul>
                                        <li>Platform fee: 10%</li>
                                        <li>Featured on homepage & marketing materials</li>
                                        <li>"Advanced Provider" badge with verification</li>
                                        <li>Exclusive access to enterprise projects</li>
                                        <li>Monthly bonus opportunities ($500-2,000)</li>
                                        <li>Dedicated account manager</li>
                                        <li>Priority 24/7 phone/chat support</li>
                                        <li>Mentor program eligibility (earn extra income)</li>
                                        <li>Speaking opportunities at provider conferences</li>
                                        <li>Referral bonuses: 5% of referred provider earnings (first year)</li>
                                    </ul>
                                </div>

                                <div className="kb-level-focus">
                                    <h4>Focus At This Level:</h4>
                                    <p>Scale your business. Build a team through outsourcing. Establish yourself as a thought leader in your specialty.</p>
                                </div>
                            </div>
                        </div>

                        <div className="kb-card kb-highlight">
                            <h3>Tracking Your Progress</h3>
                            <p>View your real-time metrics in your dashboard:</p>
                            <ul className="kb-list">
                                <li><strong>Completion Rate:</strong> (Completed Projects ÷ Total Accepted Projects) × 100</li>
                                <li><strong>Average Rating:</strong> Mean of all client ratings (1-5 stars)</li>
                                <li><strong>Response Rate:</strong> Messages answered within 24 hours ÷ Total Messages</li>
                                <li><strong>On-Time Rate:</strong> Projects delivered by deadline ÷ Total Projects</li>
                                <li><strong>Dispute Rate:</strong> Disputed Projects ÷ Total Projects</li>
                            </ul>
                            <p className="kb-note"><strong>Note:</strong> Levels are recalculated daily at midnight EST. If metrics drop below level requirements, you may be demoted after a 30-day grace period.</p>
                        </div>
                    </section>

                    {/* Bidding Guide */}
                    <section id="bidding-guide" className="kb-section">
                        <div className="kb-section-header">
                            <h2>Project Bidding Guide</h2>
                            <p>Master the art of winning projects</p>
                        </div>

                        <div className="kb-card">
                            <h3>Understanding Project Types</h3>
                            <div className="kb-project-types">
                                <div className="kb-project-type">
                                    <h4>Fixed-Price Projects</h4>
                                    <p>Client sets a total budget for the entire project. You bid on completing the full scope for that amount.</p>
                                    <div className="kb-pros-cons">
                                        <div>
                                            <strong>Best For:</strong> Well-defined projects with clear deliverables (logo design, website mockup, research paper)
                                        </div>
                                        <div>
                                            <strong>Typical Range:</strong> $50 - $10,000+
                                        </div>
                                    </div>
                                </div>
                                <div className="kb-project-type">
                                    <h4>Hourly Projects</h4>
                                    <p>You charge your hourly rate and log time as you work. Client is billed based on hours worked.</p>
                                    <div className="kb-pros-cons">
                                        <div>
                                            <strong>Best For:</strong> Ongoing work, consulting, projects with unclear scope (troubleshooting, content creation)
                                        </div>
                                        <div>
                                            <strong>Typical Range:</strong> $15 - $150/hour
                                        </div>
                                    </div>
                                </div>
                                <div className="kb-project-type">
                                    <h4>Milestone Projects</h4>
                                    <p>Large projects broken into phases with separate payments for each milestone.</p>
                                    <div className="kb-pros-cons">
                                        <div>
                                            <strong>Best For:</strong> Complex projects with multiple deliverables (full website, research study, app development)
                                        </div>
                                        <div>
                                            <strong>Typical Range:</strong> $1,000 - $50,000+
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="kb-card">
                            <h3>Writing Winning Proposals</h3>
                            <p>Your proposal is your first impression. Here's the formula that top providers use:</p>

                            <div className="kb-proposal-template">
                                <div className="kb-proposal-section">
                                    <h4>1. Personalized Greeting (2 sentences)</h4>
                                    <p>Address the client by name if provided. Reference something specific from their project description to show you read it carefully.</p>
                                    <div className="kb-example">
                                        <strong>Example:</strong>
                                        <p>"Hi Sarah, I read your description of the e-commerce website project for your handmade jewelry business. The vintage aesthetic you're envisioning sounds like a perfect match for my design style."</p>
                                    </div>
                                </div>

                                <div className="kb-proposal-section">
                                    <h4>2. Demonstrate Understanding (2-3 sentences)</h4>
                                    <p>Summarize their needs to prove you understand the project. Ask clarifying questions if anything is unclear.</p>
                                    <div className="kb-example">
                                        <strong>Example:</strong>
                                        <p>"You need a mobile-responsive site with 50+ product listings, integrated payment processing, and inventory management. I noticed you mentioned wanting a blog section too - would you like that to be a priority for launch, or something we can add in phase 2?"</p>
                                    </div>
                                </div>

                                <div className="kb-proposal-section">
                                    <h4>3. Show Relevant Experience (2-3 sentences)</h4>
                                    <p>Highlight similar projects you've completed. Include specific results or metrics if available.</p>
                                    <div className="kb-example">
                                        <strong>Example:</strong>
                                        <p>"I've built 12 e-commerce sites in the past two years using Shopify and WooCommerce. My last client, a custom pottery business, saw a 40% increase in online sales within the first three months after I redesigned their site. I can share that portfolio sample if you'd like to see my work."</p>
                                    </div>
                                </div>

                                <div className="kb-proposal-section">
                                    <h4>4. Outline Your Approach (3-5 sentences)</h4>
                                    <p>Explain HOW you'll tackle this project. Be specific about your process and methodology.</p>
                                    <div className="kb-example">
                                        <strong>Example:</strong>
                                        <p>"Here's my proposed approach: (1) Discovery call to finalize requirements and gather brand assets, (2) Create 2-3 homepage mockups for your feedback, (3) Build out remaining pages once design is approved, (4) Set up payment processing and test thoroughly, (5) Train you on managing inventory and content. I'll keep you updated every 2-3 days with progress screenshots."</p>
                                    </div>
                                </div>

                                <div className="kb-proposal-section">
                                    <h4>5. Timeline & Pricing (2-3 sentences)</h4>
                                    <p>Be realistic about timeframes. Break down pricing if helpful. Explain what's included.</p>
                                    <div className="kb-example">
                                        <strong>Example:</strong>
                                        <p>"I estimate this will take 3 weeks from start to launch. My proposal is $2,800, which includes design, development, payment integration, 50 product listings, and 2 weeks of post-launch support for any tweaks. Rush delivery is available for an additional $500 if you need it sooner."</p>
                                    </div>
                                </div>

                                <div className="kb-proposal-section">
                                    <h4>6. Call to Action (1-2 sentences)</h4>
                                    <p>End with a friendly invitation to connect. Make it easy for them to say yes.</p>
                                    <div className="kb-example">
                                        <strong>Example:</strong>
                                        <p>"I'd love to discuss this further and answer any questions you have. I'm available for a quick call today or tomorrow if that works for you. Looking forward to potentially working together!"</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="kb-card">
                            <h3>Pricing Strategy</h3>

                            <button
                                className="kb-expandable-trigger"
                                onClick={() => toggleItem('pricing-factors')}
                            >
                                <span>Factors That Affect Your Rates</span>
                                <span className="kb-expand-icon">{expandedItem === 'pricing-factors' ? '−' : '+'}</span>
                            </button>
                            {expandedItem === 'pricing-factors' && (
                                <div className="kb-expandable-content">
                                    <ul className="kb-list">
                                        <li><strong>Your Experience Level:</strong> New providers: $15-30/hr. Junior: $25-50/hr. Senior: $50-100/hr. Advanced: $100-200+/hr</li>
                                        <li><strong>Project Complexity:</strong> Simple tasks command lower rates. Specialized skills (ML, blockchain, grant writing) command premium rates.</li>
                                        <li><strong>Project Timeline:</strong> Rush jobs (24-48 hour delivery) justify 25-50% premium pricing</li>
                                        <li><strong>Client Budget:</strong> Don't leave money on the table. If they post a $5,000 budget and you can do it for $3,000, bid $4,200-4,500</li>
                                        <li><strong>Market Rates:</strong> Research what others charge for similar services in your category</li>
                                        <li><strong>Your Availability:</strong> If you're booked solid, raise rates. If you need work, be competitive</li>
                                    </ul>
                                </div>
                            )}

                            <button
                                className="kb-expandable-trigger"
                                onClick={() => toggleItem('pricing-mistakes')}
                            >
                                <span>Common Pricing Mistakes to Avoid</span>
                                <span className="kb-expand-icon">{expandedItem === 'pricing-mistakes' ? '−' : '+'}</span>
                            </button>
                            {expandedItem === 'pricing-mistakes' && (
                                <div className="kb-expandable-content">
                                    <ul className="kb-list">
                                        <li><strong>Underpricing to Win:</strong> Charging $5/hr makes clients skeptical of quality. Cheap rates attract problematic clients.</li>
                                        <li><strong>Overpricing Without Justification:</strong> If you bid 3x market rate, explain why (special expertise, faster delivery, premium results)</li>
                                        <li><strong>Forgetting Platform Fees:</strong> Remember to account for the 10-20% platform fee in your pricing</li>
                                        <li><strong>Not Including Revisions:</strong> Specify how many rounds of revisions are included to avoid scope creep</li>
                                        <li><strong>Scope Creep:</strong> If client adds requirements after acceptance, negotiate additional payment</li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="kb-card">
                            <h3>Response Time Matters</h3>
                            <p>Speed is a competitive advantage. Here's what the data shows:</p>
                            <table className="kb-table">
                                <thead>
                                    <tr>
                                        <th>Response Time</th>
                                        <th>Chance of Winning</th>
                                        <th>What Clients Think</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Under 1 hour</td>
                                        <td className="kb-success">45%</td>
                                        <td>"Very eager and available"</td>
                                    </tr>
                                    <tr>
                                        <td>1-4 hours</td>
                                        <td className="kb-success">35%</td>
                                        <td>"Responsive and professional"</td>
                                    </tr>
                                    <tr>
                                        <td>4-12 hours</td>
                                        <td className="kb-warning">20%</td>
                                        <td>"Might be busy with other projects"</td>
                                    </tr>
                                    <tr>
                                        <td>12-24 hours</td>
                                        <td className="kb-warning">10%</td>
                                        <td>"Not very interested"</td>
                                    </tr>
                                    <tr>
                                        <td>Over 24 hours</td>
                                        <td className="kb-danger">5%</td>
                                        <td>"Probably found someone else"</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="kb-card kb-highlight">
                            <h3>Proposal Red Flags to Avoid</h3>
                            <ul className="kb-list">
                                <li>Generic copy-paste proposals that don't mention the client's specific needs</li>
                                <li>Poor grammar, spelling errors, or unprofessional language</li>
                                <li>Overpromising ("I can do this in 2 hours for $10!")</li>
                                <li>Being vague ("I'm experienced and will do a great job")</li>
                                <li>Asking the client to contact you off-platform (violation of terms)</li>
                                <li>Submitting proposals for projects outside your expertise</li>
                                <li>Bidding significantly higher or lower than project budget without explanation</li>
                            </ul>
                        </div>
                    </section>

                    {/* Payments Section */}
                    <section id="payments" className="kb-section">
                        <div className="kb-section-header">
                            <h2>Payments & Earnings</h2>
                            <p>Everything about getting paid</p>
                        </div>

                        <div className="kb-card">
                            <h3>How Our Escrow System Works</h3>
                            <p>We use a secure escrow system to protect both providers and clients:</p>

                            <div className="kb-payment-flow">
                                <div className="kb-payment-step">
                                    <div className="kb-payment-icon"></div>
                                    <h4>1. Client Pays Upfront</h4>
                                    <p>When a client accepts your proposal, they immediately pay the full amount. Money is held in secure escrow - not released to you yet, but guaranteed to be there.</p>
                                </div>
                                <div className="kb-payment-step">
                                    <div className="kb-payment-icon"></div>
                                    <h4>2. You Complete the Work</h4>
                                    <p>Work confidently knowing payment is secured. Communicate through platform messaging. Submit your deliverables through the project dashboard.</p>
                                </div>
                                <div className="kb-payment-step">
                                    <div className="kb-payment-icon"></div>
                                    <h4>3. Client Reviews (7 Days)</h4>
                                    <p>Client has 7 days to review your work and either approve it or request revisions. If they don't respond, payment auto-releases.</p>
                                </div>
                                <div className="kb-payment-step">
                                    <div className="kb-payment-icon"></div>
                                    <h4>4. Payment Released</h4>
                                    <p>Upon approval (or auto-release), money minus platform fee is transferred to your wallet. Available for withdrawal immediately.</p>
                                </div>
                            </div>
                        </div>

                        <div className="kb-card">
                            <h3>Platform Fees</h3>
                            <p>Your platform fee depends on your tutor level. The fee is automatically deducted when payment is released.</p>

                            <table className="kb-table">
                                <thead>
                                    <tr>
                                        <th>Your Level</th>
                                        <th>Platform Fee</th>
                                        <th>You Keep</th>
                                        <th>Example ($1,000 Project)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>New</td>
                                        <td>20%</td>
                                        <td>80%</td>
                                        <td>$200 fee → You receive $800</td>
                                    </tr>
                                    <tr>
                                        <td>Junior</td>
                                        <td>15%</td>
                                        <td>85%</td>
                                        <td>$150 fee → You receive $850</td>
                                    </tr>
                                    <tr>
                                        <td>Senior</td>
                                        <td>12%</td>
                                        <td>88%</td>
                                        <td>$120 fee → You receive $880</td>
                                    </tr>
                                    <tr>
                                        <td>Advanced</td>
                                        <td>10%</td>
                                        <td>90%</td>
                                        <td>$100 fee → You receive $900</td>
                                    </tr>
                                </tbody>
                            </table>

                            <p className="kb-note"><strong>What the fee covers:</strong> Platform maintenance, payment processing, customer support, dispute resolution, marketing to bring you clients, and escrow protection.</p>
                        </div>

                        <div className="kb-card">
                            <h3>Withdrawing Your Earnings</h3>

                            <button
                                className="kb-expandable-trigger"
                                onClick={() => toggleItem('withdrawal-methods')}
                            >
                                <span>Withdrawal Methods</span>
                                <span className="kb-expand-icon">{expandedItem === 'withdrawal-methods' ? '−' : '+'}</span>
                            </button>
                            {expandedItem === 'withdrawal-methods' && (
                                <div className="kb-expandable-content">
                                    <table className="kb-table">
                                        <thead>
                                            <tr>
                                                <th>Method</th>
                                                <th>Processing Time</th>
                                                <th>Fee</th>
                                                <th>Min Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>PayPal</td>
                                                <td>Instant</td>
                                                <td>2% ($1 min)</td>
                                                <td>$20</td>
                                            </tr>
                                            <tr>
                                                <td>Bank Transfer (ACH)</td>
                                                <td>2-5 business days</td>
                                                <td>Free</td>
                                                <td>$50</td>
                                            </tr>
                                            <tr>
                                                <td>Wire Transfer</td>
                                                <td>1-2 business days</td>
                                                <td>$25</td>
                                                <td>$500</td>
                                            </tr>
                                            <tr>
                                                <td>Cryptocurrency</td>
                                                <td>1-3 hours</td>
                                                <td>Network fees vary</td>
                                                <td>$100</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <button
                                className="kb-expandable-trigger"
                                onClick={() => toggleItem('withdrawal-process')}
                            >
                                <span>How to Withdraw Funds</span>
                                <span className="kb-expand-icon">{expandedItem === 'withdrawal-process' ? '−' : '+'}</span>
                            </button>
                            {expandedItem === 'withdrawal-process' && (
                                <div className="kb-expandable-content">
                                    <ol className="kb-list">
                                        <li>Go to your Wallet page in the dashboard</li>
                                        <li>Click "Withdraw Funds"</li>
                                        <li>Select your preferred withdrawal method</li>
                                        <li>Enter the amount (must meet minimum threshold)</li>
                                        <li>Confirm your payment details are correct</li>
                                        <li>Submit request - you'll receive email confirmation</li>
                                        <li>Track status in your Wallet &gt; Withdrawal History</li>
                                    </ol>
                                    <p className="kb-note"><strong>First-time withdrawals:</strong> May take 24-48 hours longer for verification purposes.</p>
                                </div>
                            )}
                        </div>

                        <div className="kb-card">
                            <h3>Milestone Payments (For Large Projects)</h3>
                            <p>For projects over $1,000, we recommend setting up milestone-based payments to reduce risk for both parties:</p>

                            <div className="kb-example-box">
                                <strong>Example: $5,000 Website Development Project</strong>
                                <ul className="kb-list">
                                    <li>Milestone 1 - Design Mockups ($1,500): Client pays upfront, released when mockups approved</li>
                                    <li>Milestone 2 - Frontend Development ($2,000): Paid when mockups approved, released when frontend complete</li>
                                    <li>Milestone 3 - Backend & Launch ($1,500): Paid when frontend approved, released at final launch</li>
                                </ul>
                                <p><strong>Benefits:</strong> You get paid progressively, reducing wait time. Client pays in chunks, reducing their risk.</p>
                            </div>

                            <p><strong>How to set up milestones:</strong> Discuss with client before accepting project. Use the "Proposal with Milestones" option when submitting your bid. Each milestone requires separate client approval for payment release.</p>
                        </div>

                        <div className="kb-card">
                            <h3>Understanding Your Earnings</h3>

                            <button
                                className="kb-expandable-trigger"
                                onClick={() => toggleItem('earnings-dashboard')}
                            >
                                <span>Your Wallet Dashboard</span>
                                <span className="kb-expand-icon">{expandedItem === 'earnings-dashboard' ? '−' : '+'}</span>
                            </button>
                            {expandedItem === 'earnings-dashboard' && (
                                <div className="kb-expandable-content">
                                    <ul className="kb-list">
                                        <li><strong>Available Balance:</strong> Money you can withdraw right now</li>
                                        <li><strong>Pending Balance:</strong> Money in escrow for active projects (releases upon completion)</li>
                                        <li><strong>In Review:</strong> Delivered projects awaiting client approval (auto-releases in 7 days)</li>
                                        <li><strong>Total Earnings:</strong> All-time earnings before platform fees</li>
                                        <li><strong>Monthly Earnings:</strong> Current month's earnings (resets on 1st of each month)</li>
                                        <li><strong>Projected Monthly:</strong> Estimated end-of-month earnings based on active projects</li>
                                    </ul>
                                </div>
                            )}

                            <button
                                className="kb-expandable-trigger"
                                onClick={() => toggleItem('payment-delays')}
                            >
                                <span>What If Payment is Delayed?</span>
                                <span className="kb-expand-icon">{expandedItem === 'payment-delays' ? '−' : '+'}</span>
                            </button>
                            {expandedItem === 'payment-delays' && (
                                <div className="kb-expandable-content">
                                    <p>Payments are automatically released after 7 days if client doesn't respond. If payment still isn't released:</p>
                                    <ol className="kb-list">
                                        <li>Check project status - ensure you properly submitted deliverables</li>
                                        <li>Check for any client messages you may have missed</li>
                                        <li>Verify the 7-day period has passed since submission</li>
                                        <li>If technical issue, contact support with project ID</li>
                                        <li>If client is withholding unfairly, file a dispute (see Disputes section)</li>
                                    </ol>
                                </div>
                            )}
                        </div>

                        <div className="kb-card kb-highlight">
                            <h3>Tax Information</h3>
                            <p>Important information about reporting your earnings:</p>
                            <ul className="kb-list">
                                <li><strong>US Providers:</strong> If you earn over $600/year, we'll send you a 1099-NEC form by January 31st. You must report this income on your tax return.</li>
                                <li><strong>International Providers:</strong> Tax requirements vary by country. Consult a local tax professional about reporting freelance income.</li>
                                <li><strong>You Are a Contractor:</strong> You're responsible for paying your own taxes. We recommend setting aside 25-30% of earnings for taxes.</li>
                                <li><strong>Business Deductions:</strong> You may be able to deduct expenses like internet, computer equipment, software subscriptions, and home office space.</li>
                                <li><strong>Tax Forms:</strong> Download your annual earnings statement from Wallet and Tax Documents</li>
                            </ul>
                            <p className="kb-note"><strong>Disclaimer:</strong> This is general information, not tax advice. Consult a qualified tax professional for your specific situation.</p>
                        </div>
                    </section>

                    {/* User Agreement */}
                    <section id="user-agreement" className="kb-section">
                        <div className="kb-section-header">
                            <h2>User Agreement</h2>
                            <p>Your legal obligations as a provider on Chapter4research.com</p>
                        </div>

                        <div className="kb-alert">
                            <strong>Important:</strong> By creating an account and accepting projects on Chapter4research, you agree to these terms. Violations may result in account suspension or termination.
                        </div>

                        <div className="kb-card">
                            <h3>1. Account Requirements</h3>
                            <p><strong>You agree that:</strong></p>
                            <ul className="kb-list">
                                <li>You are at least 18 years old or the age of majority in your jurisdiction</li>
                                <li>All information in your profile is accurate and truthful</li>
                                <li>You will maintain one account only (no duplicate accounts)</li>
                                <li>You will not share your account credentials with anyone</li>
                                <li>You will update your profile information if it changes</li>
                                <li>You possess the legal right to work and provide services in your location</li>
                                <li>You have the skills and qualifications you claim in your profile</li>
                            </ul>
                        </div>

                        <div className="kb-card">
                            <h3>2. Service Delivery Obligations</h3>
                            <p><strong>When you accept a project, you commit to:</strong></p>
                            <ul className="kb-list">
                                <li><strong>Original Work Only:</strong> All work must be your own creation. No plagiarism, no reselling others' work, no unauthorized use of copyrighted materials.</li>
                                <li><strong>Meet Deadlines:</strong> Deliver work by agreed-upon deadlines. If delays occur, communicate immediately with the client.</li>
                                <li><strong>Quality Standards:</strong> Deliver work that matches the quality level implied by your profile and proposal.</li>
                                <li><strong>Scope Adherence:</strong> Complete all deliverables specified in the project agreement.</li>
                                <li><strong>Revisions:</strong> Provide reasonable revisions as outlined in your proposal or our standard policy (typically 2-3 rounds).</li>
                                <li><strong>Professional Communication:</strong> Respond to client messages within 24 hours during project duration.</li>
                                <li><strong>Platform Communication:</strong> All project-related communication must occur through Chapter4research messaging (no moving clients off-platform).</li>
                            </ul>
                        </div>

                        <div className="kb-card">
                            <h3>3. Prohibited Activities</h3>
                            <p><strong>The following actions are strictly forbidden and will result in immediate account termination:</strong></p>

                            <button
                                className="kb-expandable-trigger"
                                onClick={() => toggleItem('prohibited-content')}
                            >
                                <span>Content Violations</span>
                                <span className="kb-expand-icon">{expandedItem === 'prohibited-content' ? '−' : '+'}</span>
                            </button>
                            {expandedItem === 'prohibited-content' && (
                                <div className="kb-expandable-content">
                                    <ul className="kb-list">
                                        <li>Plagiarizing content from any source</li>
                                        <li>Using AI-generated content without disclosure (when client expects human-created work)</li>
                                        <li>Submitting work created by someone else as your own</li>
                                        <li>Reselling pre-made templates or content as custom work</li>
                                        <li>Including malware, viruses, or malicious code in deliverables</li>
                                        <li>Creating content that violates copyright, trademark, or intellectual property rights</li>
                                    </ul>
                                </div>
                            )}

                            <button
                                className="kb-expandable-trigger"
                                onClick={() => toggleItem('prohibited-conduct')}
                            >
                                <span>Conduct Violations</span>
                                <span className="kb-expand-icon">{expandedItem === 'prohibited-conduct' ? '−' : '+'}</span>
                            </button>
                            {expandedItem === 'prohibited-conduct' && (
                                <div className="kb-expandable-content">
                                    <ul className="kb-list">
                                        <li>Harassing, threatening, or abusing clients or staff</li>
                                        <li>Discriminating based on race, religion, gender, sexual orientation, disability, or any protected characteristic</li>
                                        <li>Soliciting clients to work off-platform to avoid fees</li>
                                        <li>Sharing client contact information with third parties</li>
                                        <li>Accepting payment outside the platform</li>
                                        <li>Creating fake reviews or manipulating ratings</li>
                                        <li>Operating multiple accounts to circumvent restrictions</li>
                                        <li>Bid manipulation or collusion with other providers</li>
                                    </ul>
                                </div>
                            )}

                            <button
                                className="kb-expandable-trigger"
                                onClick={() => toggleItem('prohibited-services')}
                            >
                                <span>Prohibited Service Categories</span>
                                <span className="kb-expand-icon">{expandedItem === 'prohibited-services' ? '−' : '+'}</span>
                            </button>
                            {expandedItem === 'prohibited-services' && (
                                <div className="kb-expandable-content">
                                    <ul className="kb-list">
                                        <li>Completing exams or tests on behalf of students (academic dishonesty)</li>
                                        <li>Impersonating someone else in any capacity</li>
                                        <li>Creating fake documents, IDs, diplomas, or certifications</li>
                                        <li>Hacking, phishing, or any illegal computer activities</li>
                                        <li>Creating content for illegal purposes</li>
                                        <li>Gambling-related services</li>
                                        <li>Adult content or services</li>
                                        <li>Services that facilitate illegal activities</li>
                                    </ul>
                                    <p className="kb-note"><strong>Note:</strong> Legitimate tutoring, study guides, and practice materials are permitted. Directly completing academic assessments for submission is not.</p>
                                </div>
                            )}
                        </div>

                        <div className="kb-card">
                            <h3>4. Intellectual Property Rights</h3>
                            <ul className="kb-list">
                                <li><strong>Work Product:</strong> Unless otherwise agreed in writing, all work you create for a client becomes their property upon full payment.</li>
                                <li><strong>Portfolio Use:</strong> You may display anonymized samples of your work in your portfolio unless client specifically requests confidentiality.</li>
                                <li><strong>Platform Content:</strong> chapter4research retains rights to platform features, branding, and infrastructure. You cannot copy or replicate our platform.</li>
                                <li><strong>Your Content:</strong> You retain rights to your profile content, proposals, and messages, but grant chapter4research license to display them as needed for platform operation.</li>
                            </ul>
                        </div>

                        <div className="kb-card">
                            <h3>5. Payment Terms</h3>
                            <ul className="kb-list">
                                <li>Platform fees are non-negotiable and automatically deducted from each payment</li>
                                <li>You must withdraw earnings through approved methods only</li>
                                <li>Chargebacks, payment reversals, or disputed charges will be investigated. Fraudulent activity results in immediate termination.</li>
                                <li>We reserve the right to hold funds if we suspect fraud, policy violations, or legal issues</li>
                                <li>Unclaimed funds in your wallet for 12+ months may be subject to dormancy fees after notice</li>
                            </ul>
                        </div>

                        <div className="kb-card">
                            <h3>6. Account Termination</h3>
                            <p><strong>We may suspend or terminate your account if:</strong></p>
                            <ul className="kb-list">
                                <li>You violate any terms of this agreement</li>
                                <li>You receive multiple valid complaints from clients</li>
                                <li>Your dispute rate exceeds 15%</li>
                                <li>You engage in fraudulent activity</li>
                                <li>You abandon projects repeatedly</li>
                                <li>Law enforcement requests account closure</li>
                                <li>You attempt to circumvent platform policies</li>
                            </ul>

                            <p><strong>If your account is terminated:</strong></p>
                            <ul className="kb-list">
                                <li>You will be notified via email with reason for termination</li>
                                <li>Any pending earnings for completed work will be released after 30-day hold period</li>
                                <li>You may appeal the decision within 14 days</li>
                                <li>You agree not to create new accounts</li>
                                <li>We reserve the right to report illegal activity to authorities</li>
                            </ul>
                        </div>

                        <div className="kb-card">
                            <h3>7. Liability and Indemnification</h3>
                            <ul className="kb-list">
                                <li><strong>Independent Contractor:</strong> You are an independent contractor, not an employee. You're responsible for your own taxes, insurance, and business expenses.</li>
                                <li><strong>Platform Liability:</strong> chapter4research is a marketplace platform. We facilitate connections but are not responsible for the actual services provided.</li>
                                <li><strong>Your Liability:</strong> You are solely responsible for the quality and legality of your work. You indemnify chapter4research against claims arising from your services.</li>
                                <li><strong>Dispute Mediation:</strong> We offer dispute resolution as a service, but our decisions are final and binding.</li>
                                <li><strong>No Warranties:</strong> Platform is provided "as is". We don't guarantee uninterrupted service, specific earnings, or project volume.</li>
                            </ul>
                        </div>

                        <div className="kb-card">
                            <h3>8. Privacy and Data Protection</h3>
                            <ul className="kb-list">
                                <li>We collect and use your data as described in our Privacy Policy</li>
                                <li>You consent to our use of cookies and tracking technologies</li>
                                <li>Client data must be kept confidential and used only for project completion</li>
                                <li>You may request your data or account deletion per GDPR/CCPA rights</li>
                                <li>We may share your information if required by law or to prevent fraud</li>
                            </ul>
                        </div>

                        <div className="kb-card">
                            <h3>9. Changes to Terms</h3>
                            <ul className="kb-list">
                                <li>  chapter4research reserves the right to modify these terms at any time</li>
                                <li>Material changes will be announced 30 days in advance via email and platform notification</li>
                                <li>Continued use of the platform after changes constitutes acceptance</li>
                                <li>If you disagree with changes, you may close your account</li>
                            </ul>
                        </div>

                        <div className="kb-alert kb-alert-info">
                            <strong>Complete Legal Agreement:</strong> This is a summary of key points. The complete, legally binding User Agreement is available in your Account Settings & Legal Documents. Please read it carefully.
                        </div>
                    </section>

                    {/* Community Standards */}
                    <section id="community-standards" className="kb-section">
                        <div className="kb-section-header">
                            <h2>Community Standards</h2>
                            <p>Building a respectful, professional community</p>
                        </div>

                        <div className="kb-card">
                            <h3>Our Core Values</h3>
                            <p> Chapter4research thrives on mutual respect, professionalism, and integrity. Every provider is expected to uphold these values in all interactions.</p>
                        </div>

                        <div className="kb-card">
                            <h3>Professional Communication Standards</h3>
                            <ul className="kb-list">
                                <li><strong>Respectful Language:</strong> Address all clients, staff, and fellow providers with courtesy and professionalism, even in disagreements</li>
                                <li><strong>Timely Responses:</strong> Respond to messages within 24 hours during active projects. Set auto-responders if unavailable for extended periods</li>
                                <li><strong>Clear Communication:</strong> Be direct and transparent about capabilities, timelines, and potential challenges</li>
                                <li><strong>Constructive Feedback:</strong> If you disagree with a client's direction, offer alternatives rather than just criticism</li>
                                <li><strong>No Harassment:</strong> Zero tolerance for threatening, abusive, discriminatory, or sexually inappropriate language</li>
                            </ul>
                        </div>

                        <div className="kb-card">
                            <h3>Ethical Service Delivery</h3>
                            <ul className="kb-list">
                                <li><strong>Honesty About Capabilities:</strong> Only accept projects you can complete competently. Declining is better than failing</li>
                                <li><strong>Transparency:</strong> Disclose any limitations, potential delays, or concerns upfront</li>
                                <li><strong>Original Work:</strong> Never plagiarize or present others' work as your own</li>
                                <li><strong>Confidentiality:</strong> Protect client information and project details. Never share without permission</li>
                                <li><strong>No Academic Dishonesty:</strong> Don't complete exams, tests, or assignments students will submit as their own work</li>
                            </ul>
                        </div>

                        <div className="kb-card">
                            <h3>Conflict Resolution</h3>
                            <p>Disagreements happen. Here's how to handle them professionally:</p>
                            <ol className="kb-list">
                                <li><strong>Address Issues Early:</strong> Don't let small problems become big ones. Communicate concerns immediately</li>
                                <li><strong>Stay Calm:</strong> Take a break before responding if you're frustrated. Never send angry messages</li>
                                <li><strong>Focus on Solutions:</strong> Instead of blaming, propose ways to resolve the issue</li>
                                <li><strong>Document Everything:</strong> Keep all communication on platform. Save important agreements in writing</li>
                                <li><strong>Seek Mediation:</strong> If you can't resolve directly, involve platform support for neutral arbitration</li>
                            </ol>
                        </div>

                        <div className="kb-card">
                            <h3>Building Long-Term Relationships</h3>
                            <ul className="kb-list">
                                <li>Exceed expectations whenever possible - go the extra mile</li>
                                <li>Follow up after project completion to ensure satisfaction</li>
                                <li>Offer to answer questions even after payment is complete</li>
                                <li>Request feedback and reviews politely</li>
                                <li>Stay in touch with great clients for repeat business</li>
                            </ul>
                        </div>

                        <div className="kb-card kb-highlight">
                            <h3>Community Recognition</h3>
                            <p>Top community members receive:</p>
                            <ul className="kb-list">
                                <li>Featured provider status with special badges</li>
                                <li>Invitations to provider spotlight interviews</li>
                                <li>Opportunities to mentor new providers</li>
                                <li>Priority access to high-value projects</li>
                                <li>Quarterly appreciation bonuses</li>
                            </ul>
                        </div>
                    </section>

                    {/* Content & Quality Policy */}
                    <section id="content-policy" className="kb-section">
                        <div className="kb-section-header">
                            <h2>Content & Quality Policy</h2>
                            <p>Delivering excellence in every project</p>
                        </div>

                        <div className="kb-card">
                            <h3>Quality Standards</h3>
                            <p>All work delivered through chapter4research must meet these minimum standards:</p>

                            <button
                                className="kb-expandable-trigger"
                                onClick={() => toggleItem('writing-standards')}
                            >
                                <span>Writing & Content Standards</span>
                                <span className="kb-expand-icon">{expandedItem === 'writing-standards' ? '−' : '+'}</span>
                            </button>
                            {expandedItem === 'writing-standards' && (
                                <div className="kb-expandable-content">
                                    <ul className="kb-list">
                                        <li>100% original content - no plagiarism of any kind</li>
                                        <li>Proper grammar, spelling, and punctuation</li>
                                        <li>Appropriate formatting and structure for the content type</li>
                                        <li>Accurate citations in requested format (APA, MLA, Chicago, etc.)</li>
                                        <li>Fact-checked information from credible sources</li>
                                        <li>Cohesive flow and logical organization</li>
                                        <li>Meets specified word count or page requirements</li>
                                    </ul>
                                </div>
                            )}

                            <button
                                className="kb-expandable-trigger"
                                onClick={() => toggleItem('technical-standards')}
                            >
                                <span>Technical Work Standards</span>
                                <span className="kb-expand-icon">{expandedItem === 'technical-standards' ? '−' : '+'}</span>
                            </button>
                            {expandedItem === 'technical-standards' && (
                                <div className="kb-expandable-content">
                                    <ul className="kb-list">
                                        <li>Clean, well-commented code following best practices</li>
                                        <li>Functional deliverables that meet all specified requirements</li>
                                        <li>Thoroughly tested before submission (no obvious bugs)</li>
                                        <li>Documentation explaining how to use/implement the solution</li>
                                        <li>Secure coding practices (no vulnerabilities)</li>
                                        <li>Optimized for performance where applicable</li>
                                        <li>Responsive design for web/mobile projects</li>
                                    </ul>
                                </div>
                            )}

                            <button
                                className="kb-expandable-trigger"
                                onClick={() => toggleItem('creative-standards')}
                            >
                                <span>Creative Work Standards</span>
                                <span className="kb-expand-icon">{expandedItem === 'creative-standards' ? '−' : '+'}</span>
                            </button>
                            {expandedItem === 'creative-standards' && (
                                <div className="kb-expandable-content">
                                    <ul className="kb-list">
                                        <li>Original designs - no stolen or unauthorized use of others' work</li>
                                        <li>High-resolution files in requested formats</li>
                                        <li>Consistent branding if style guide provided</li>
                                        <li>Print-ready quality for physical materials</li>
                                        <li>Source files included (PSD, AI, etc.) unless otherwise agreed</li>
                                        <li>Multiple format exports (PNG, JPG, PDF, etc.)</li>
                                        <li>Editable files for future modifications</li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="kb-card">
                            <h3>Plagiarism & Originality</h3>
                            <p><strong>Zero Tolerance Policy:</strong> Plagiarism is the fastest way to get permanently banned from the platform.</p>

                            <div className="kb-warning-box">
                                <h4>What Counts as Plagiarism:</h4>
                                <ul className="kb-list">
                                    <li>Copying text from websites, books, or articles without proper citation</li>
                                    <li>Paraphrasing others' work too closely without attribution</li>
                                    <li>Using someone else's code without permission or attribution</li>
                                    <li>Submitting work you purchased or found elsewhere as your own</li>
                                    <li>Reusing your own work from other clients without disclosure (self-plagiarism)</li>
                                    <li>Using AI-generated content without disclosure when client expects human work</li>
                                </ul>
                            </div>

                            <p><strong>How to Avoid Plagiarism:</strong></p>
                            <ul className="kb-list">
                                <li>Always cite sources properly using the requested citation style</li>
                                <li>Put direct quotes in quotation marks with page numbers</li>
                                <li>Paraphrase in your own words, not just rearranging the original</li>
                                <li>Use plagiarism detection tools before submitting (Turnitin, Copyscape, Grammarly)</li>
                                <li>When in doubt, cite it - over-citation is better than under-citation</li>
                            </ul>
                        </div>

                        <div className="kb-card">
                            <h3>AI & Automation Tools</h3>
                            <p>Using AI tools is permitted under these conditions:</p>
                            <ul className="kb-list">
                                <li><strong>Disclosure Required:</strong> If client specifically requests human-written work, you must disclose any AI usage</li>
                                <li><strong>Not a Substitute:</strong> AI should assist your work, not replace it entirely. You must review, edit, and enhance AI outputs</li>
                                <li><strong>Acceptable Uses:</strong> Research, brainstorming, outlining, grammar checking, code debugging, image enhancement</li>
                                <li><strong>Unacceptable Uses:</strong> Submitting raw AI output as final work, using AI to write entire essays/articles without significant human input</li>
                                <li><strong>Client Preference:</strong> Always honor client requests about AI usage, even if more restrictive than platform policy</li>
                            </ul>
                        </div>

                        <div className="kb-card">
                            <h3>Revisions Policy</h3>
                            <p>Standard revision policy unless otherwise specified in your proposal:</p>
                            <ul className="kb-list">
                                <li><strong>Included Revisions:</strong> 2-3 rounds of reasonable revisions at no extra charge</li>
                                <li><strong>What Counts as Reasonable:</strong> Minor edits, clarifications, adjustments to existing work within original scope</li>
                                <li><strong>What's Not Reasonable:</strong> Complete rewrites, major scope changes, entirely new deliverables</li>
                                <li><strong>Timeline:</strong> Client must request revisions within 7 days of initial delivery</li>
                                <li><strong>Additional Revisions:</strong> Beyond included rounds, you may charge additional fees</li>
                            </ul>
                        </div>

                        <div className="kb-card kb-highlight">
                            <h3>Quality Checklist Before Submission</h3>
                            <ul className="kb-list">
                                <li>✓ All deliverables match project description</li>
                                <li>✓ Work is original and properly cited if applicable</li>
                                <li>✓ Spell-checked and proofread thoroughly</li>
                                <li>✓ Tested/reviewed for functionality (technical work)</li>
                                <li>✓ Files are in correct format and properly named</li>
                                <li>✓ Documentation/instructions included if needed</li>
                                <li>✓ Meets or exceeds quality standards described in proposal</li>
                            </ul>
                        </div>
                    </section>

                    {/* Disputes & Resolution */}
                    <section id="disputes" className="kb-section">
                        <div className="kb-section-header">
                            <h2>⚖️ Disputes & Resolution</h2>
                            <p>Fair process for resolving conflicts</p>
                        </div>

                        <div className="kb-card">
                            <h3>When Disputes Happen</h3>
                            <p>Disputes can arise when clients and providers disagree about work quality, scope, deadlines, or payment. Our goal is fair, evidence-based resolution.</p>
                        </div>

                        <div className="kb-card">
                            <h3>Common Dispute Scenarios</h3>

                            <button
                                className="kb-expandable-trigger"
                                onClick={() => toggleItem('dispute-scenarios')}
                            >
                                <span>View Common Dispute Types</span>
                                <span className="kb-expand-icon">{expandedItem === 'dispute-scenarios' ? '−' : '+'}</span>
                            </button>
                            {expandedItem === 'dispute-scenarios' && (
                                <div className="kb-expandable-content">
                                    <ul className="kb-list">
                                        <li><strong>Quality Disagreement:</strong> Client claims work doesn't meet standards; provider believes it does</li>
                                        <li><strong>Scope Creep:</strong> Client requests additional work beyond original agreement</li>
                                        <li><strong>Communication Breakdown:</strong> Requirements were misunderstood or unclear</li>
                                        <li><strong>Late Delivery:</strong> Provider missed deadline; client wants refund or compensation</li>
                                        <li><strong>Incomplete Work:</strong> Client claims deliverables are missing; provider claims all were provided</li>
                                        <li><strong>Technical Issues:</strong> Deliverable doesn't work as expected; unclear if it's user error or provider error</li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="kb-card">
                            <h3>Dispute Resolution Process</h3>

                            <div className="kb-process">
                                <div className="kb-process-step">
                                    <div className="kb-process-number">1</div>
                                    <div className="kb-process-content">
                                        <h4>Direct Resolution (48 Hours)</h4>
                                        <p>First, try to resolve directly with the client through platform messaging. Often, clear communication solves the issue. Propose compromises like additional revisions, partial refunds, or deadline extensions.</p>
                                    </div>
                                </div>
                                <div className="kb-process-step">
                                    <div className="kb-process-number">2</div>
                                    <div className="kb-process-content">
                                        <h4>File Official Dispute</h4>
                                        <p>If direct resolution fails, either party can file a dispute through the project dashboard. Payment is frozen until resolution. Both parties submit evidence and arguments.</p>
                                    </div>
                                </div>
                                <div className="kb-process-step">
                                    <div className="kb-process-number">3</div>
                                    <div className="kb-process-content">
                                        <h4>Support Review (3-5 Days)</h4>
                                        <p>Our dispute resolution team reviews all evidence: project description, proposals, messages, deliverables, and any additional documentation. We may request clarification from either party.</p>
                                    </div>
                                </div>
                                <div className="kb-process-step">
                                    <div className="kb-process-number">4</div>
                                    <div className="kb-process-content">
                                        <h4>Decision & Resolution</h4>
                                        <p>We make a final decision based on evidence and platform policies. Possible outcomes: full payment to provider, full refund to client, partial refund/payment, or requirement for additional work.</p>
                                    </div>
                                </div>
                                <div className="kb-process-step">
                                    <div className="kb-process-number">5</div>
                                    <div className="kb-process-content">
                                        <h4>Appeal (Optional, 7 Days)</h4>
                                        <p>If you disagree with the decision, you can appeal once with new evidence. A senior team member reviews. Appeal decisions are final.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="kb-card">
                            <h3>Building a Strong Case</h3>
                            <p>If you need to file a dispute, here's how to present your case effectively:</p>

                            <ul className="kb-list">
                                <li><strong>Documentation:</strong> Provide screenshots of conversations, original project brief, your proposal, and all deliverables</li>
                                <li><strong>Timeline:</strong> Show you met deadlines or communicated delays proactively</li>
                                <li><strong>Scope Evidence:</strong> Reference specific requirements from the project description and show how you met them</li>
                                <li><strong>Communication:</strong> Demonstrate you were responsive and professional throughout</li>
                                <li><strong>Industry Standards:</strong> Reference industry norms for what constitutes acceptable quality in your field</li>
                                <li><strong>Good Faith:</strong> Show you tried to resolve the issue directly before filing dispute</li>
                            </ul>
                        </div>

                        <div className="kb-card">
                            <h3>Preventing Disputes</h3>
                            <p>Best practices to avoid disputes altogether:</p>
                            <ul className="kb-list">
                                <li>Get everything in writing - scope, deliverables, timeline, revision policy</li>
                                <li>Ask clarifying questions before starting work</li>
                                <li>Send progress updates regularly (every 2-3 days for large projects)</li>
                                <li>Request feedback on drafts before final submission</li>
                                <li>Under-promise and over-deliver on quality and timeline</li>
                                <li>Respond to all client messages within 12 hours during active projects</li>
                                <li>If scope changes, negotiate new terms in writing before proceeding</li>
                            </ul>
                        </div>

                        <div className="kb-card kb-highlight">
                            <h3>Dispute Rate Impact</h3>
                            <p>Your dispute rate affects your account standing:</p>
                            <ul className="kb-list">
                                <li><strong>Under 5%:</strong> Normal standing, no impact</li>
                                <li><strong>5-10%:</strong> Warning issued, profile visibility may be reduced</li>
                                <li><strong>10-15%:</strong> Temporary restrictions on accepting new projects</li>
                                <li><strong>Over 15%:</strong> Account review and possible termination</li>
                            </ul>
                            <p className="kb-note"><strong>Note:</strong> We distinguish between disputes you win vs. lose. Winning disputes doesn't hurt your rate as much. Repeatedly losing disputes indicates quality or communication issues.</p>
                        </div>
                    </section>

                    {/* Privacy & Security */}
                    <section id="privacy-security" className="kb-section">
                        <div className="kb-section-header">
                            <h2>Privacy & Security</h2>
                            <p>Protecting your data and client information</p>
                        </div>

                        <div className="kb-card">
                            <h3>Your Data Privacy</h3>
                            <p>We take your privacy seriously. Here's what we collect and why:</p>

                            <button
                                className="kb-expandable-trigger"
                                onClick={() => toggleItem('data-collection')}
                            >
                                <span>What We Collect</span>
                                <span className="kb-expand-icon">{expandedItem === 'data-collection' ? '−' : '+'}</span>
                            </button>
                            {expandedItem === 'data-collection' && (
                                <div className="kb-expandable-content">
                                    <ul className="kb-list">
                                        <li><strong>Account Information:</strong> Name, email, phone, payment details, profile photo</li>
                                        <li><strong>Professional Information:</strong> Skills, experience, certifications, portfolio samples</li>
                                        <li><strong>Activity Data:</strong> Projects, proposals, messages, earnings, ratings</li>
                                        <li><strong>Technical Data:</strong> IP address, device type, browser, login times (for security)</li>
                                        <li><strong>Usage Data:</strong> Pages viewed, features used, time spent (to improve platform)</li>
                                    </ul>
                                </div>
                            )}

                            <button
                                className="kb-expandable-trigger"
                                onClick={() => toggleItem('data-usage')}
                            >
                                <span>How We Use Your Data</span>
                                <span className="kb-expand-icon">{expandedItem === 'data-usage' ? '−' : '+'}</span>
                            </button>
                            {expandedItem === 'data-usage' && (
                                <div className="kb-expandable-content">
                                    <ul className="kb-list">
                                        <li>Operate the platform and facilitate transactions</li>
                                        <li>Match you with relevant projects</li>
                                        <li>Process payments and send tax forms</li>
                                        <li>Communicate important updates and opportunities</li>
                                        <li>Prevent fraud and maintain security</li>
                                        <li>Improve platform features based on usage patterns</li>
                                        <li>Comply with legal obligations</li>
                                    </ul>
                                </div>
                            )}

                            <button
                                className="kb-expandable-trigger"
                                onClick={() => toggleItem('data-sharing')}
                            >
                                <span>Who We Share With</span>
                                <span className="kb-expand-icon">{expandedItem === 'data-sharing' ? '−' : '+'}</span>
                            </button>
                            {expandedItem === 'data-sharing' && (
                                <div className="kb-expandable-content">
                                    <ul className="kb-list">
                                        <li><strong>Clients:</strong> Your public profile information when you bid on projects</li>
                                        <li><strong>Payment Processors:</strong> Necessary information to process transactions (Stripe, PayPal)</li>
                                        <li><strong>Service Providers:</strong> Email service (for notifications), analytics tools, cloud hosting</li>
                                        <li><strong>Legal Authorities:</strong> If required by law or to prevent illegal activity</li>
                                        <li><strong>We NEVER sell</strong> your personal information to third parties for marketing</li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="kb-card">
                            <h3>Client Data Protection</h3>
                            <p><strong>Your Obligations:</strong> When working with clients, you have access to their information and project details. You must:</p>
                            <ul className="kb-list">
                                <li>Keep all client information confidential</li>
                                <li>Use client data only for completing the specific project</li>
                                <li>Delete client data after project completion (unless portfolio use is agreed)</li>
                                <li>Never share client contact information with third parties</li>
                                <li>Report any data breaches to us immediately</li>
                                <li>Comply with applicable data protection laws (GDPR, CCPA, etc.)</li>
                            </ul>
                        </div>

                        <div className="kb-card">
                            <h3>Account Security Best Practices</h3>
                            <ul className="kb-list">
                                <li><strong>Strong Password:</strong> Use 12+ characters with mix of letters, numbers, symbols. Change every 6 months</li>
                                <li><strong>Two-Factor Authentication:</strong> Enable 2FA in Account Settings for extra security</li>
                                <li><strong>Secure Devices:</strong> Keep your computer/phone updated with latest security patches</li>
                                <li><strong>Public WiFi:</strong> Avoid accessing your account on public networks without VPN</li>
                                <li><strong>Suspicious Activity:</strong> Report unauthorized access immediately</li>
                                <li><strong>Phishing Awareness:</strong> We'll never ask for your password via email. Don't click suspicious links</li>
                            </ul>
                        </div>

                        <div className="kb-card">
                            <h3>Your Privacy Rights</h3>
                            <p>You have the right to:</p>
                            <ul className="kb-list">
                                <li><strong>Access:</strong> Request a copy of all data we have about you</li>
                                <li><strong>Correction:</strong> Update inaccurate information in your profile</li>
                                <li><strong>Deletion:</strong> Request account deletion (after completing active projects)</li>
                                <li><strong>Portability:</strong> Export your data in machine-readable format</li>
                                <li><strong>Opt-Out:</strong> Unsubscribe from marketing emails (transactional emails still sent)</li>
                                <li><strong>Restrict Processing:</strong> Limit how we use your data in certain situations</li>
                            </ul>
                            <p>To exercise these rights, contact privacy@chapter4research with your request.</p>
                        </div>

                        <div className="kb-card kb-highlight">
                            <h3>Security Measures We Use</h3>
                            <ul className="kb-list">
                                <li>SSL/TLS encryption for all data transmission</li>
                                <li>Encrypted database storage for sensitive information</li>
                                <li>Regular security audits and penetration testing</li>
                                <li>PCI-DSS compliance for payment processing</li>
                                <li>24/7 monitoring for suspicious activity</li>
                                <li>Automatic session timeout after inactivity</li>
                                <li>Staff background checks and confidentiality agreements</li>
                            </ul>
                        </div>
                    </section>

                    {/* Best Practices */}
                    <section id="best-practices" className="kb-section">
                        <div className="kb-section-header">
                            <h2>Best Practices</h2>
                            <p>Insider tips from top-performing providers</p>
                        </div>

                        <div className="kb-card">
                            <h3>Time Management</h3>
                            <ul className="kb-list">
                                <li>Track time spent on projects to understand your true hourly rate</li>
                                <li>Block calendar time for deep work - disable notifications during focused sessions</li>
                                <li>Build buffer time into deadlines (finish 1 day early to allow for revisions)</li>
                                <li>Use project management tools (Trello, Asana) for multi-project juggling</li>
                                <li>Set clear boundaries - define your working hours and stick to them</li>
                            </ul>
                        </div>

                        <div className="kb-card">
                            <h3>Building Your Reputation</h3>
                            <ul className="kb-list">
                                <li>
                                    Start with smaller projects to build reviews quickly
                                    (5 x $100 projects &gt; 1 x $500 project for reputation)
                                </li>

                                <li>Request reviews immediately after delivery while client is happy</li>
                                <li>Showcase your best work in portfolio - quality over quantity (3-5 stellar samples)</li>
                                <li>Specialize in 2-3 niches rather than being a generalist</li>
                                <li>Keep skills updated - take courses, earn certifications, learn new tools</li>
                            </ul>
                        </div>

                        <div className="kb-card">
                            <h3>Maximizing Earnings</h3>
                            <ul className="kb-list">
                                <li>Raise rates by 10-20% every 10-15 completed projects</li>
                                <li>Create package deals (Bronze/Silver/Gold tiers with different deliverables)</li>
                                <li>Upsell complementary services ("Would you like social media graphics too?")</li>
                                <li>Build retainer relationships with great clients for steady income</li>
                                <li>Track which project types are most profitable - focus on those</li>
                            </ul>
                        </div>

                        <div className="kb-card">
                            <h3>Client Relationship Management</h3>
                            <ul className="kb-list">
                                <li>Send personalized thank-you messages after project completion</li>
                                <li>Follow up 2-4 weeks later to check if they need anything else</li>
                                <li>Remember client preferences and reference them in future proposals</li>
                                <li>Offer "repeat client" discounts to encourage loyalty</li>
                                <li>Be responsive even to non-project messages - it builds goodwill</li>
                            </ul>
                        </div>

                        <div className="kb-card">
                            <h3>Avoiding Burnout</h3>
                            <ul className="kb-list">
                                <li>Don't accept more projects than you can handle well</li>
                                <li>Build in rest days - schedule at least 1-2 days per week with no client work</li>
                                <li>Automate repetitive tasks (proposal templates, invoice generation, etc.)</li>
                                <li>Set "away" status when you need a break - clients will understand</li>
                                <li>Join provider community forums for support and commiseration</li>
                            </ul>
                        </div>

                        <div className="kb-card kb-highlight">
                            <h3>Advanced Strategies</h3>
                            <ul className="kb-list">
                                <li><strong>Outsourcing:</strong> Once Junior level, delegate portions of projects to build a team</li>
                                <li><strong>Value-Based Pricing:</strong> Charge based on value delivered, not hours worked</li>
                                <li><strong>Productization:</strong> Create standardized service packages you can deliver repeatedly</li>
                                <li><strong>Content Marketing:</strong> Share expertise via blog posts/videos to attract clients</li>
                                <li><strong>Niche Domination:</strong> Become THE go-to expert in a specific area</li>
                            </ul>
                        </div>
                    </section>

                    {/* FAQ */}
                    <section id="faq" className="kb-section">
                        <div className="kb-section-header">
                            <h2>Frequently Asked Questions</h2>
                            <p>Quick answers to common questions</p>
                        </div>

                        <div className="kb-faq-container">
                            <button className="kb-faq-item" onClick={() => toggleItem('faq-1')}>
                                <div className="kb-faq-question">
                                    <span>How do I get my first project?</span>
                                    <span className="kb-expand-icon">{expandedItem === 'faq-1' ? '−' : '+'}</span>
                                </div>
                            </button>
                            {expandedItem === 'faq-1' && (
                                <div className="kb-faq-answer">
                                    Complete your profile 100%, set competitive rates, and submit 10-15 proposals in your first week. Focus on smaller projects ($50-200) to build initial reviews. Respond within 1 hour of posting for best results.
                                </div>
                            )}

                            <button className="kb-faq-item" onClick={() => toggleItem('faq-2')}>
                                <div className="kb-faq-question">
                                    <span>How long does it take to get paid?</span>
                                    <span className="kb-expand-icon">{expandedItem === 'faq-2' ? '−' : '+'}</span>
                                </div>
                            </button>
                            {expandedItem === 'faq-2' && (
                                <div className="kb-faq-answer">
                                    Payment releases immediately upon client approval or automatically after 7 days. Once in your wallet, you can withdraw anytime. PayPal is instant, bank transfers take 2-5 days.
                                </div>
                            )}

                            <button className="kb-faq-item" onClick={() => toggleItem('faq-3')}>
                                <div className="kb-faq-question">
                                    <span>Can I work if I'm not in the US?</span>
                                    <span className="kb-expand-icon">{expandedItem === 'faq-3' ? '−' : '+'}</span>
                                </div>
                            </button>
                            {expandedItem === 'faq-3' && (
                                <div className="kb-faq-answer">
                                    Yes! chapter4research is available globally. Payment methods may vary by country. International providers need PayPal or cryptocurrency withdrawal options.
                                </div>
                            )}

                            <button className="kb-faq-item" onClick={() => toggleItem('faq-4')}>
                                <div className="kb-faq-question">
                                    <span>What happens if a client doesn't approve my work?</span>
                                    <span className="kb-expand-icon">{expandedItem === 'faq-4' ? '−' : '+'}</span>
                                </div>
                            </button>
                            {expandedItem === 'faq-4' && (
                                <div className="kb-faq-answer">
                                    First, ask for specific feedback and offer to revise. If they're being unreasonable, you can file a dispute. Our team reviews evidence from both sides and makes a fair decision. Even if client doesn't approve, payment auto-releases after 7 days if they don't respond.
                                </div>
                            )}

                            <button className="kb-faq-item" onClick={() => toggleItem('faq-5')}>
                                <div className="kb-faq-question">
                                    <span>How much can I realistically earn?</span>
                                    <span className="kb-expand-icon">{expandedItem === 'faq-5' ? '−' : '+'}</span>
                                </div>
                            </button>
                            {expandedItem === 'faq-5' && (
                                <div className="kb-faq-answer">
                                    Varies widely by skills and effort. New providers average $500-1,500/month part-time. Established providers earn $2,000-5,000/month. Top Advanced providers make $8,000-15,000/month. Your earnings depend on hours invested, skills, and rates.
                                </div>
                            )}

                            <button className="kb-faq-item" onClick={() => toggleItem('faq-6')}>
                                <div className="kb-faq-question">
                                    <span>Can I use this as my full-time job?</span>
                                    <span className="kb-expand-icon">{expandedItem === 'faq-6' ? '−' : '+'}</span>
                                </div>
                            </button>
                            {expandedItem === 'faq-6' && (
                                <div className="kb-faq-answer">
                                    Absolutely! Many providers work full-time on the platform. Build up to 20+ hours/week gradually. Diversify across multiple clients for stability. Save 3-6 months expenses before going full-time.
                                </div>
                            )}

                            <button className="kb-faq-item" onClick={() => toggleItem('faq-7')}>
                                <div className="kb-faq-question">
                                    <span>What if I need to cancel a project?</span>
                                    <span className="kb-expand-icon">{expandedItem === 'faq-7' ? '−' : '+'}</span>
                                </div>
                            </button>
                            {expandedItem === 'faq-7' && (
                                <div className="kb-faq-answer">
                                    Contact the client immediately and explain the situation honestly. If they agree, use the "Cancel Project" button (payment fully refunded to client). Frequent cancellations hurt your completion rate and can lead to account restrictions.
                                </div>
                            )}

                            <button className="kb-faq-item" onClick={() => toggleItem('faq-8')}>
                                <div className="kb-faq-question">
                                    <span>How do I increase my provider level?</span>
                                    <span className="kb-expand-icon">{expandedItem === 'faq-8' ? '−' : '+'}</span>
                                </div>
                            </button>
                            {expandedItem === 'faq-8' && (
                                <div className="kb-faq-answer">
                                    Focus on four metrics: (1) Complete more projects, (2) Maintain 4.5+ rating by exceeding expectations, (3) Respond to messages within 12 hours, (4) Deliver on time. Levels update automatically when you meet requirements.
                                </div>
                            )}

                            <button className="kb-faq-item" onClick={() => toggleItem('faq-9')}>
                                <div className="kb-faq-question">
                                    <span>Are there any hidden fees?</span>
                                    <span className="kb-expand-icon">{expandedItem === 'faq-9' ? '−' : '+'}</span>
                                </div>
                            </button>
                            {expandedItem === 'faq-9' && (
                                <div className="kb-faq-answer">
                                    No hidden fees. Platform fee (10-20% based on level) is clearly stated and automatically deducted. Withdrawal fees vary by method (PayPal 2%, bank transfer free, wire $25). That's it.
                                </div>
                            )}

                            <button className="kb-faq-item" onClick={() => toggleItem('faq-10')}>
                                <div className="kb-faq-question">
                                    <span>Can I message clients outside the platform?</span>
                                    <span className="kb-expand-icon">{expandedItem === 'faq-10' ? '−' : '+'}</span>
                                </div>
                            </button>
                            {expandedItem === 'faq-10' && (
                                <div className="kb-faq-answer">
                                    No, all communication must stay on platform during active projects. This protects both parties and helps us resolve disputes. After project completion and good relationship established, you can exchange contact info for future work.
                                </div>
                            )}
                        </div>

                        <div className="kb-card kb-highlight">
                            <h3>Still Have Questions?</h3>
                            <p>Can't find what you're looking for? We're here to help!</p>
                            <ul className="kb-list">
                                <li><strong>Email Support:</strong> support@chapter4research response within 24 hours </li>
                                <li><strong>Live Chat:</strong> Available in dashboard 9 AM - 6 PM EST weekdays</li>
                                <li><strong>Community Forum:</strong> Ask fellow providers and share experiences</li>
                                <li><strong>Weekly Webinar:</strong> Live Q&A every Thursday at 2 PM EST</li>
                            </ul>
                        </div>
                    </section>

                </main>
            </div>

            {/* Footer */}
            <footer className="kb-footer">
                <div className="kb-footer-content">
                    <div className="kb-footer-section">
                        <h4>Quick Links</h4>
                        <Link to="/tutor/dashboard">Dashboard</Link>
                        <Link to="/tutor/projects">Browse Projects</Link>
                        <Link to="/tutor/wallet">Wallet</Link>
                        <Link to="/tutor/profile">My Profile</Link>
                    </div>
                    <div className="kb-footer-section">
                        <h4>Resources</h4>
                        <a href="#getting-started">Getting Started</a>
                        <a href="#best-practices">Best Practices</a>
                        <a href="#faq">FAQ</a>
                        <a href="mailto:support@chapter4research.com">Contact Support</a>
                    </div>
                    <div className="kb-footer-section">
                        <h4>Legal</h4>
                        <a href="#user-agreement">User Agreement</a>
                        <a href="#privacy-security">Privacy Policy</a>
                        <a href="#content-policy">Content Policy</a>
                        <a href="#community-standards">Community Standards</a>
                    </div>
                    <div className="kb-footer-section">
                        <h4>chapter4research</h4>
                        <p>Professional services marketplace connecting clients with expert providers</p>
                        <p className="kb-footer-copyright">© 2025 chapter4research All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default KnowledgeBasePage;