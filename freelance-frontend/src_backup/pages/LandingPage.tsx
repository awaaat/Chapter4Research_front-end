import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
    const [activeService, setActiveService] = useState<number | null>(null);
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);
    const [scrollY, setScrollY] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState('all');

    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const technicalServices = [
        {
            id: 1,
            title: "Grant Proposal Writing",
            category: "technical",
            description: "Expert assistance in crafting compelling grant proposals that secure funding for your research and projects",
            features: ["Research-backed proposals", "Success-proven templates", "Full editing support", "Budget planning"],
            deliverables: ["Proposal draft", "Budget breakdown", "Supporting documents"],
            color: "bg-slate-600 hover:bg-slate-700",
            bgColor: "bg-gray-50",
            borderColor: "border-gray-200",
            hoverBorder: "hover:border-muted-green",
            duration: "5-7 days"
        },
        {
            id: 2,
            title: "Research Writing",
            category: "technical",
            description: "Professional research papers, theses, dissertations and academic writing services",
            features: ["Publication-ready quality", "Peer-reviewed standards", "Citation management", "Plagiarism-free"],
            deliverables: ["Complete manuscript", "References", "Abstract"],
            color: "bg-slate-600 hover:bg-slate-700",
            bgColor: "bg-gray-50",
            borderColor: "border-gray-200",
            hoverBorder: "hover:border-muted-green",
            duration: "7-10 days"
        },
        {
            id: 3,
            title: "Data Analysis",
            category: "technical",
            description: "Advanced statistical analysis and data visualization for research and business projects",
            features: ["Python/R/SPSS expertise", "Custom visualizations", "Statistical testing", "Detailed reports"],
            deliverables: ["Analysis report", "Charts and graphs", "Raw data files"],
            color: "bg-slate-600 hover:bg-slate-700",
            bgColor: "bg-gray-50",
            borderColor: "border-gray-200",
            hoverBorder: "hover:border-muted-green",
            duration: "3-5 days"
        },
        {
            id: 4,
            title: "Technical Documentation",
            category: "technical",
            description: "Clear, comprehensive documentation for software, systems and technical projects",
            features: ["API documentation", "User manuals", "System architecture", "Process documentation"],
            deliverables: ["Complete documentation", "Diagrams", "Quick start guides"],
            color: "bg-slate-600 hover:bg-slate-700",
            bgColor: "bg-gray-50",
            borderColor: "border-gray-200",
            hoverBorder: "hover:border-muted-green",
        },
        {
            id: 5,
            title: "Web Development",
            category: "technical",
            description: "Custom web applications and responsive websites built with modern technologies",
            features: ["React/Next.js", "Full-stack solutions", "Mobile responsive", "SEO optimized"],
            deliverables: ["Live website", "Source code", "Documentation"],
            color: "bg-slate-600 hover:bg-slate-700",
            bgColor: "bg-gray-50",
            borderColor: "border-gray-200",
            hoverBorder: "hover:border-muted-green",
            duration: "2-4 weeks"
        },
        {
            id: 6,
            title: "Machine Learning Solutions",
            category: "technical",
            description: "AI and ML model development and integration for business applications",
            features: ["Custom ML models", "Model deployment", "Performance optimization", "Training and testing"],
            deliverables: ["Trained model", "API integration", "Performance report"],
            color: "bg-slate-600 hover:bg-slate-700",
            bgColor: "bg-gray-50",
            borderColor: "border-gray-200",
            hoverBorder: "hover:border-muted-green",
            duration: "3-6 weeks"
        },
        {
            id: 7,
            title: "Mobile App Development",
            category: "technical",
            description: "Native and cross-platform mobile applications for iOS and Android",
            features: ["React Native", "Flutter", "Native development", "App store deployment"],
            deliverables: ["Published app", "Source code", "Admin panel"],
            color: "bg-slate-600 hover:bg-slate-700",
            bgColor: "bg-gray-50",
            borderColor: "border-gray-200",
            hoverBorder: "hover:border-muted-green",
            duration: "4-8 weeks"
        },
        {
            id: 8,
            title: "Database Design",
            category: "technical",
            description: "Efficient database architecture and optimization for scalable applications",
            features: ["SQL/NoSQL", "Schema design", "Query optimization", "Migration support"],
            deliverables: ["Database schema", "Migration scripts", "Documentation"],
            color: "bg-slate-600 hover:bg-slate-700",
            bgColor: "bg-gray-50",
            borderColor: "border-gray-200",
            hoverBorder: "hover:border-muted-green",
            duration: "1-2 weeks"
        },
        {
            id: 9,
            title: "Cloud Solutions",
            category: "technical",
            description: "Cloud infrastructure setup and management for modern applications",
            features: ["AWS/Azure/GCP", "DevOps automation", "Security setup", "Cost optimization"],
            deliverables: ["Cloud infrastructure", "CI/CD pipeline", "Monitoring setup"],
            color: "bg-slate-600 hover:bg-slate-700",
            bgColor: "bg-gray-50",
            borderColor: "border-gray-200",
            hoverBorder: "hover:border-muted-green",
            duration: "1-3 weeks"
        },
        {
            id: 10,
            title: "Cybersecurity Audit",
            category: "technical",
            description: "Comprehensive security assessment and vulnerability testing",
            features: ["Penetration testing", "Security audit", "Compliance check", "Risk assessment"],
            deliverables: ["Audit report", "Vulnerability list", "Recommendations"],
            color: "bg-slate-600 hover:bg-slate-700",
            bgColor: "bg-gray-50",
            borderColor: "border-gray-200",
            hoverBorder: "hover:border-muted-green",
            duration: "1-2 weeks"
        },
        {
            id: 11,
            title: "Blockchain Development",
            category: "technical",
            description: "Smart contracts and decentralized applications development",
            features: ["Solidity/Rust", "Smart contracts", "DApp development", "NFT platforms"],
            deliverables: ["Smart contracts", "DApp frontend", "Deployment"],
            color: "bg-slate-600 hover:bg-slate-700",
            bgColor: "bg-gray-50",
            borderColor: "border-gray-200",
            hoverBorder: "hover:border-muted-green",
            duration: "4-8 weeks"
        },
        {
            id: 12,
            title: "Technical SEO",
            category: "technical",
            description: "Advanced SEO optimization for websites and web applications",
            features: ["Site audit", "Performance optimization", "Schema markup", "Link building"],
            deliverables: ["SEO report", "Implementation", "Monthly tracking"],
            color: "bg-slate-600 hover:bg-slate-700",
            bgColor: "bg-gray-50",
            borderColor: "border-gray-200",
            hoverBorder: "hover:border-muted-green",
            duration: "2-4 weeks"
        }
    ];

    const nonTechnicalServices = [
        {
            id: 13,
            title: "Business Writing",
            category: "business",
            description: "Professional business plans, reports, proposals and corporate communications",
            features: ["Strategic planning", "Market analysis", "Executive summaries", "Financial projections"],
            deliverables: ["Business plan", "Financial model", "Pitch deck"],
            color: "bg-slate-600 hover:bg-slate-700",
            bgColor: "bg-gray-50",
            borderColor: "border-gray-200",
            hoverBorder: "hover:border-muted-green",
            duration: "1-2 weeks"
        },
        {
            id: 14,
            title: "Content Creation",
            category: "creative",
            description: "Engaging content for blogs, websites, social media and marketing materials",
            features: ["SEO optimized", "Brand voice alignment", "Multi-platform content", "Content calendar"],
            deliverables: ["Written content", "Editorial calendar", "Style guide"],
            color: "bg-slate-600 hover:bg-slate-700",
            bgColor: "bg-gray-50",
            borderColor: "border-gray-200",
            hoverBorder: "hover:border-muted-green",
            duration: "3-7 days"
        },
        {
            id: 15,
            title: "Consulting Services",
            category: "business",
            description: "Expert guidance on business strategy, project management and implementation",
            features: ["1-on-1 sessions", "Action plans", "Follow-up support", "Industry insights"],
            deliverables: ["Strategy document", "Action plan", "Progress reports"],
            color: "bg-slate-600 hover:bg-slate-700",
            bgColor: "bg-gray-50",
            borderColor: "border-gray-200",
            hoverBorder: "hover:border-muted-green",
            duration: "Flexible"
        },
        {
            id: 16,
            title: "Presentation Design",
            category: "creative",
            description: "Stunning presentations, pitch decks and infographics that captivate audiences",
            features: ["Custom templates", "Infographics", "Pitch decks", "Brand consistency"],
            deliverables: ["PowerPoint/Keynote", "PDF version", "Editable templates"],
            color: "bg-slate-600 hover:bg-slate-700",
            bgColor: "bg-gray-50",
            borderColor: "border-gray-200",
            hoverBorder: "hover:border-muted-green",
            duration: "2-4 days"
        },
        {
            id: 17,
            title: "Market Research",
            category: "business",
            description: "Comprehensive market analysis and competitive intelligence",
            features: ["Industry analysis", "Competitor research", "Customer surveys", "Trend forecasting"],
            deliverables: ["Research report", "Data analysis", "Recommendations"],
            color: "bg-slate-600 hover:bg-slate-700",
            bgColor: "bg-gray-50",
            borderColor: "border-gray-200",
            hoverBorder: "hover:border-muted-green",
            duration: "1-2 weeks"
        },
        {
            id: 18,
            title: "Brand Strategy",
            category: "creative",
            description: "Complete brand development and positioning strategy",
            features: ["Brand identity", "Positioning strategy", "Messaging framework", "Visual guidelines"],
            deliverables: ["Brand book", "Style guide", "Marketing materials"],
            color: "bg-slate-600 hover:bg-slate-700",
            bgColor: "bg-gray-50",
            borderColor: "border-gray-200",
            hoverBorder: "hover:border-muted-green",
            duration: "2-3 weeks"
        },
        {
            id: 19,
            title: "Social Media Management",
            category: "creative",
            description: "Full-service social media strategy and content management",
            features: ["Content planning", "Community management", "Analytics tracking", "Paid campaigns"],
            deliverables: ["Content calendar", "Posts and graphics", "Monthly reports"],
            color: "bg-slate-600 hover:bg-slate-700",
            bgColor: "bg-gray-50",
            borderColor: "border-gray-200",
            hoverBorder: "hover:border-muted-green",
            duration: "Ongoing"
        },
        {
            id: 20,
            title: "Video Production",
            category: "creative",
            description: "Professional video production for marketing, training and events",
            features: ["Scripting", "Filming/editing", "Motion graphics", "Sound design"],
            deliverables: ["Final video", "Raw footage", "Multiple formats"],
            color: "bg-slate-600 hover:bg-slate-700",
            bgColor: "bg-gray-50",
            borderColor: "border-gray-200",
            hoverBorder: "hover:border-muted-green",
            duration: "2-4 weeks"
        },
        {
            id: 21,
            title: "Email Marketing",
            category: "business",
            description: "Strategic email campaigns that convert and build customer relationships",
            features: ["Campaign strategy", "Email design", "Automation setup", "A/B testing"],
            deliverables: ["Email templates", "Campaign setup", "Analytics dashboard"],
            color: "bg-slate-600 hover:bg-slate-700",
            bgColor: "bg-gray-50",
            borderColor: "border-gray-200",
            hoverBorder: "hover:border-muted-green",
            duration: "1-2 weeks"
        },
        {
            id: 22,
            title: "Graphic Design",
            category: "creative",
            description: "Creative graphic design for logos, branding and marketing materials",
            features: ["Logo design", "Brand identity", "Marketing collateral", "Digital assets"],
            deliverables: ["Design files", "Multiple formats", "Brand guidelines"],
            color: "bg-slate-600 hover:bg-slate-700",
            bgColor: "bg-gray-50",
            borderColor: "border-gray-200",
            hoverBorder: "hover:border-muted-green",
            duration: "3-7 days"
        },
        {
            id: 23,
            title: "Copywriting",
            category: "creative",
            description: "Persuasive copy for websites, ads and marketing campaigns",
            features: ["Sales copy", "Ad copy", "Website content", "Product descriptions"],
            deliverables: ["Written copy", "Revisions included", "SEO optimization"],
            color: "bg-slate-600 hover:bg-slate-700",
            bgColor: "bg-gray-50",
            borderColor: "border-gray-200",
            hoverBorder: "hover:border-muted-green",
            duration: "1-3 days"
        },
        {
            id: 24,
            title: "Event Planning",
            category: "business",
            description: "Complete event planning and coordination services",
            features: ["Venue selection", "Vendor management", "Timeline planning", "On-site coordination"],
            deliverables: ["Event plan", "Budget tracking", "Vendor contracts"],
            color: "bg-slate-600 hover:bg-slate-700",
            bgColor: "bg-gray-50",
            borderColor: "border-gray-200",
            hoverBorder: "hover:border-muted-green",
            duration: "4-8 weeks"
        }
    ];

    const allServices = [...technicalServices, ...nonTechnicalServices];

    const stats = [
        { value: "2500", label: "Projects Completed" },
        { value: "98", label: "Client Satisfaction Rate" },
        { value: "24/7", label: "Support Available" },
        { value: "150", label: "Expert Team Members" }
    ];

    const testimonials = [
        {
            name: "Sarah Johnson",
            role: "Research Director",
            company: "BioTech Labs",
            text: "Their grant proposal writing service helped us secure over $2M in funding. The attention to detail and understanding of our research was exceptional.",
            rating: 5
        },
        {
            name: "Michael Chen",
            role: "CTO",
            company: "StartupX",
            text: "The web development team delivered beyond our expectations. The application is fast, scalable, and exactly what we needed to launch our business.",
            rating: 5
        },
        {
            name: "Emily Rodriguez",
            role: "Marketing Manager",
            company: "Global Brands Inc",
            text: "Outstanding content creation and brand strategy work. Our engagement rates have tripled since we started working with them.",
            rating: 5
        },
        {
            name: "David Kim",
            role: "PhD Candidate",
            company: "Stanford University",
            text: "The research writing and data analysis support was invaluable for my dissertation. Professional, timely, and high quality work.",
            rating: 5
        }
    ];

    const faqs = [
        {
            question: "How do I get started with a project?",
            answer: "Simply browse our services, select the one that fits your needs, and click 'Get Started'. You'll fill out a brief form with your project details, and we'll match you with an expert within 24 hours. You can also contact us directly for a consultation."
        },
        {
            question: "What is your typical turnaround time?",
            answer: "Turnaround times vary by service and project complexity. Most projects are completed within 1-4 weeks. Rush services are available for urgent needs at an additional cost. We provide clear timelines before starting any project."
        },
        {
            question: "Do you offer revisions?",
            answer: "Yes, all our services include revisions. Technical services typically include 2-3 rounds of revisions, while creative services may include more. We work with you until you're completely satisfied with the final deliverable."
        },
        {
            question: "What are your payment terms?",
            answer: "We require a 50% deposit to begin work, with the remaining 50% due upon completion. For larger projects, we can arrange milestone-based payments. We accept all major credit cards, PayPal, and bank transfers."
        },
        {
            question: "Are your services confidential?",
            answer: "Absolutely. We sign NDAs for all projects and maintain strict confidentiality. Your intellectual property and project details are fully protected. We never share or reuse any client work."
        },
        {
            question: "Do you provide ongoing support?",
            answer: "Yes, we offer ongoing support packages for many of our services. This includes maintenance for web development, content updates, consulting retainers, and more. Contact us to discuss a custom support plan."
        }
    ];

    const handleScrollTo = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const toggleFAQ = (index: number) => {
        setActiveFAQ(activeFAQ === index ? null : index);
    };

    const toggleService = (id: number) => {
        setActiveService(activeService === id ? null : id);
    };

    const filteredServices = selectedCategory === 'all'
        ? allServices
        : allServices.filter(s => s.category === selectedCategory);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-white/95 backdrop-blur-lg shadow-lg' : 'bg-white/80 backdrop-blur-md'
                }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <span className="text-2xl md:text-3xl font-bold bg-slate-600 hover:bg-slate-700 bg-clip-text text-transparent">
                                Chapter4Research
                            </span>
                        </div>
                        <nav className="hidden md:flex items-center space-x-8">
                            <span onClick={() => handleScrollTo('how-it-works')} className="cursor-pointer text-gray-700 hover:text-muted-green font-medium">
                                How It Works
                            </span>
                            <span onClick={() => handleScrollTo('services')} className="cursor-pointer text-gray-700 hover:text-muted-green font-medium">
                                Services
                            </span>
                            <span onClick={() => handleScrollTo('testimonials')} className="cursor-pointer text-gray-700 hover:text-muted-green font-medium transition-colors">
                                Testimonials
                            </span>
                            <button onClick={() => handleScrollTo('faq')} className="text-gray-700 hover:text-muted-green font-medium transition-colors">
                                FAQ
                            </button>
                        </nav>

                        <div className="flex items-center space-x-4">
                            <button onClick={() => navigate('/login')} className="sm:block px-4 py-2 text-gray-700 hover:text-muted-green font-medium transition-colors">
                                Sign In
                            </button>
                            <button onClick={() => navigate('/client/register')} className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all hover:scale-105">
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-block mb-6">
                            <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                                Professional Services Platform
                            </span>
                        </div>
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
                            <span className="text-gray-900">Transform Your Ideas</span>
                            <br />
                            <span className="bg-slate-600 hover:bg-slate-700 bg-clip-text text-transparent">
                                Into Success Stories
                            </span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
                            From technical solutions to creative services, we connect you with expert professionals who deliver excellence on every project
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto mb-10">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search for services: web development, content writing, data analysis..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-6 py-4 rounded-full border-2 border-gray-300 focus:border-muted-gray focus:outline-none text-lg"
                                />
                                <button className="absolute right-2 top-2 bg-slate-600 hover:bg-slate-700 text-white px-8 py-2 rounded-full font-semibold hover:shadow-lg transition-all">
                                    Search
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                            <button
                                onClick={() => handleScrollTo('services')}
                                className="bg-slate-600 hover:bg-slate-700 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl transition-all hover:scale-105"
                            >
                                Explore All Services
                            </button>
                            <button className="bg-white text-gray-800 px-8 py-4 rounded-full font-bold text-lg border-2 border-gray-300 hover:border-muted-green hover:text-muted-green transition-all">
                                Schedule Consultation
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                            {stats.map((stat, index) => (
                                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                                    <div className="text-4xl font-bold bg-slate-600 hover:bg-slate-700 bg-clip-text text-transparent mb-2">
                                        {stat.value}{stat.value === "98" ? "%" : stat.value === "2500" || stat.value === "150" ? "+" : ""}
                                    </div>
                                    <div className="text-gray-600 font-medium text-sm">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
                        <p className="text-xl text-gray-600">Three simple steps to get your project done</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                step: "01",
                                title: "Choose Your Service",
                                description: "Browse our comprehensive range of technical and creative services. Select the one that matches your project needs."
                            },
                            {
                                step: "02",
                                title: "Get Matched with an Expert",
                                description: "We connect you with a qualified professional who has the expertise and experience for your specific requirements."
                            },
                            {
                                step: "03",
                                title: "Receive Quality Results",
                                description: "Work closely with your expert, provide feedback, and receive polished deliverables that exceed your expectations."
                            }
                        ].map((item, index) => (
                            <div key={index} className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 hover:shadow-xl transition-all">
                                <div style={{ fontSize: '6rem', fontWeight: 'bold', color: '#dfe286ff', marginBottom: '1rem' }}>{item.step}</div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
                        <p className="text-xl text-gray-600 mb-8">Professional solutions for every business need</p>

                        {/* Category Filter */}
                        <div className="flex flex-wrap justify-center gap-4 mb-12">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`px-6 py-3 rounded-full font-semibold transition-all ${selectedCategory === 'all'
                                    ? 'bg-slate-600 hover:bg-slate-700 text-white shadow-lg'
                                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-muted-green'
                                    }`}
                            >
                                All Services
                            </button>
                            <button
                                onClick={() => setSelectedCategory('technical')}
                                className={`px-6 py-3 rounded-full font-semibold transition-all ${selectedCategory === 'technical'
                                    ? 'bg-slate-600 hover:bg-slate-700 text-white shadow-lg'
                                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-muted-green'
                                    }`}
                            >
                                Technical
                            </button>
                            <button
                                onClick={() => setSelectedCategory('business')}
                                className={`px-6 py-3 rounded-full font-semibold transition-all ${selectedCategory === 'business'
                                    ? 'bg-slate-600 hover:bg-slate-700 text-white shadow-lg'
                                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-muted-green'
                                    }`}
                            >
                                Business
                            </button>
                            <button
                                onClick={() => setSelectedCategory('creative')}
                                className={`px-6 py-3 rounded-full font-semibold transition-all ${selectedCategory === 'creative'
                                    ? 'bg-slate-600 hover:bg-slate-700 text-white shadow-lg'
                                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-muted-green'
                                    }`}
                            >
                                Creative
                            </button>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredServices.map((service) => (
                            <div
                                key={service.id}
                                className={`group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 ${service.borderColor} ${service.hoverBorder} ${hoveredCard === service.id ? 'scale-105' : ''
                                    } ${activeService === service.id ? 'ring-4 ring-gray-200' : ''}`}
                                onMouseEnter={() => setHoveredCard(service.id)}
                                onMouseLeave={() => setHoveredCard(null)}
                                onClick={() => toggleService(service.id)}
                            >
                                <div className={`absolute top-0 left-0 w-full h-2 rounded-t-2xl ${service.color}`}></div>

                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h3>
                                    <p className="text-gray-600 mb-4 leading-relaxed">{service.description}</p>

                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">{service.duration}</span>
                                    </div>
                                </div>

                                <div className={`overflow-hidden transition-all duration-300 ${activeService === service.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    }`}>
                                    <div className="border-t-2 border-gray-100 pt-6 space-y-6">
                                        <div>
                                            <h4 className="font-bold text-gray-800 mb-3">Key Features</h4>
                                            <ul className="space-y-2">
                                                {service.features.map((feature, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                                                        <span className="text-muted-gray font-bold mt-1">•</span>
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <h4 className="font-bold text-gray-800 mb-3">Deliverables</h4>
                                            <ul className="space-y-2">
                                                {service.deliverables.map((item, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                                                        <span className="text-muted-green font-bold mt-1">✓</span>
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <button className={`w-full ${service.color} text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105`}>
                                            Get Started
                                        </button>
                                    </div>
                                </div>

                                {activeService !== service.id && (
                                    <button className="mt-4 text-muted-gray font-semibold hover:text-muted-green transition-colors flex items-center gap-2 group">
                                        View Details
                                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
                        <p className="text-xl text-gray-600">Excellence in every project we deliver</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                title: "Expert Professionals",
                                description: "Work with certified experts who have years of industry experience and proven track records"
                            },
                            {
                                title: "Quality Guaranteed",
                                description: "Every project goes through rigorous quality checks to ensure it meets the highest standards"
                            },
                            {
                                title: "On-Time Delivery",
                                description: "We respect deadlines and deliver projects on time, every time, without compromising quality"
                            },
                            {
                                title: "Affordable Pricing",
                                description: "Competitive rates with transparent pricing and no hidden fees. Get premium quality within budget"
                            }
                        ].map((item, index) => (
                            <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
                        <p className="text-xl text-gray-600">Real feedback from satisfied customers</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                                <div className="mb-4">
                                    <div className="testimonial-stars">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <span key={i} style={{ color: '#f4b400' }}>★</span>
                                        ))}
                                    </div>
                                    <p className="text-gray-700 italic leading-relaxed mb-4">"{testimonial.text}"</p>
                                </div>
                                <div className="border-t border-gray-200 pt-4">
                                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                                    <p className="text-sm text-muted-gray">{testimonial.company}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                        <p className="text-xl text-gray-600">Everything you need to know</p>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl"
                            >
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                                >
                                    <h3 className="text-lg font-bold text-gray-900 pr-8">{faq.question}</h3>
                                    <span className={`text-2xl text-muted-gray transition-transform ${activeFAQ === index ? 'rotate-180' : ''}`}>
                                        ↓
                                    </span>
                                </button>
                                <div className={`overflow-hidden transition-all duration-300 ${activeFAQ === index ? 'max-h-96' : 'max-h-0'
                                    }`}>
                                    <div className="px-6 pb-5">
                                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-12 md:p-20 text-center text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-black opacity-10"></div>
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Start Your Project?</h2>
                            <p className="text-xl mb-10 opacity-95 max-w-2xl mx-auto">
                                Join thousands of satisfied clients who have transformed their ideas into reality with our expert services
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button onClick={() => navigate('/client/register')} className="cta-primary">
                                    Get Started Today
                                </button>
                                <button className="cta-secondary">
                                    Talk to an Expert
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* Footer */}
            <footer className="bg-gray-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                        <div>
                            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent">
                                Chapter4Research
                            </h3>
                            <p className="text-gray-400 leading-relaxed">
                                Professional services platform connecting you with expert professionals for technical and creative solutions
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold text-lg mb-4">Services</h4>
                            <ul className="space-y-3">
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Technical Services</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Business Services</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Creative Services</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">All Services</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-lg mb-4">Company</h4>
                            <ul className="space-y-3">
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Our Team</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-lg mb-4">Support</h4>
                            <ul className="space-y-3">
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <p className="text-gray-400 text-sm mb-4 md:mb-0">
                                © 2025 Chapter4Research. All rights reserved.
                            </p>
                            <div className="flex space-x-6">
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    Facebook
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    Twitter
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    LinkedIn
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    Instagram
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;