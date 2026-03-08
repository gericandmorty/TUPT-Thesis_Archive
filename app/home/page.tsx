'use client';

import { useState, useEffect, ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import {
    FaSearch,
    FaFileAlt,
    FaLightbulb,
    FaChartLine,
    FaArrowRight,
    FaFolder,
    FaCalendarAlt,
    FaChevronRight,
    FaBookOpen,
    FaUpload,
    FaClipboardList,
} from 'react-icons/fa';
import CustomHeader from '@/components/Navigation/CustomHeader';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';
import thesisData from '@/data/trained_model.json';

interface Thesis {
    id?: string;
    title?: string;
    abstract?: string;
    filename?: string;
    folder?: string;
    year_range?: string;
    [key: string]: unknown;
}

interface SearchResult extends Thesis {
    score: number;
    relevance: string;
}

interface ThesisData {
    theses?: Thesis[];
}

interface UserData {
    name?: string;
    idNumber?: string;
    [key: string]: unknown;
}

const HomePage: React.FC = () => {
    const router = useRouter();
    const [menuVisible, setMenuVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<UserData | null>(null);

    const theses: Thesis[] = (thesisData as ThesisData).theses || [];

    useEffect(() => {
        setMounted(true);
        const userData = localStorage.getItem('userData');
        if (userData) {
            setUser(JSON.parse(userData));
        } else {
            router.push('/login');
        }
    }, [router]);

    const getGreeting = (): string => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const performSearch = () => {
        if (!searchQuery.trim()) { setSearchResults([]); return; }
        const query = searchQuery.toLowerCase().trim();
        let results: SearchResult[] = [];

        theses.forEach(thesis => {
            let score = 0;
            if (thesis.title?.toLowerCase().includes(query)) score += 3;
            if (thesis.abstract?.toLowerCase().includes(query)) score += 2;
            if (thesis.filename?.toLowerCase().includes(query)) score += 1;
            if (score > 0) {
                results.push({
                    ...thesis,
                    score,
                    relevance: score >= 3 ? 'High' : score >= 2 ? 'Medium' : 'Low',
                });
            }
        });

        results.sort((a, b) => b.score - a.score);
        setSearchResults(results.slice(0, 10));
    };

    const highlightText = (text: string | undefined, query: string): ReactElement | string => {
        if (!text || !query) return text || '';
        const regex = new RegExp(`(${query})`, 'gi');
        const parts = text.split(regex);
        return (
            <>
                {parts.map((part, i) =>
                    regex.test(part) ? <mark key={i} className="bg-[#8b0000] text-white px-0.5 rounded">{part}</mark> : part
                )}
            </>
        );
    };

    const relevanceBadge: Record<string, string> = {
        High: 'bg-emerald-600 text-white',
        Medium: 'bg-amber-500 text-gray-900',
        Low: 'bg-[#8b0000] text-white',
    };

    const features = [
        {
            icon: FaUpload,
            title: 'Submit',
            description: 'Upload and verify your research.',
            path: '/documents',
        },
        {
            icon: FaSearch,
            title: 'Search',
            description: 'Browse the school archive.',
            path: '/home',
        },
        {
            icon: FaChartLine,
            title: 'Stats',
            description: 'Track your thesis progress.',
            path: '/home',
        },
    ];

    const activities = [
        {
            icon: FaFileAlt,
            title: 'Login Saved',
            description: 'You are now signed in',
            time: 'Just now',
            colorClass: 'text-[#fecaca] bg-white/10',
        },
        {
            icon: FaChartLine,
            title: 'Archive Ready',
            description: 'Folders updated',
            time: 'Active',
            colorClass: 'text-emerald-400 bg-white/10',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header */}
            <CustomHeader
                onMenuPress={() => setMenuVisible(true)}
                onSearch={performSearch}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            {/* Hamburger Menu */}
            <HamburgerMenu isVisible={menuVisible} onClose={() => setMenuVisible(false)} />

            {/* Main Content */}
            <main className="flex-grow">
                {/* Hero Section - Matching Landing Page Gradient */}
                <section className="bg-gradient-to-br from-[#8b0000] via-[#fecaca] to-white pt-32 pb-20 px-6 relative overflow-hidden">
                    <div className="absolute top-[-50%] right-[-20%] w-[400px] h-[400px] bg-[#8b0000]/5 rounded-full blur-3xl" />

                    <div className="max-w-5xl mx-auto relative z-10">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div>
                                <p className="text-[10px] text-[#8b0000] font-black uppercase tracking-[0.3em] mb-4">
                                    {mounted ? (
                                        <>
                                            {getGreeting()} &bull; {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                                        </>
                                    ) : (
                                        <>Welcome</>
                                    )}
                                </p>
                                <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">
                                    Archive Portal
                                </p>
                            </div>
                        </div>

                        {/* Stats - Using Institutional Dark Red Accents */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
                            {[
                                { value: theses.length.toLocaleString(), label: 'Thesis Count', icon: FaBookOpen },
                                { value: 'Active', label: 'Signal', icon: FaClipboardList },
                                { value: 'Stable', label: 'Server', icon: FaChartLine },
                            ].map(({ value, label, icon: Icon }, i) => (
                                <div key={i} className="bg-gradient-to-br from-[#8b0000] to-[#500000] p-8 rounded-[1.5rem] shadow-2xl shadow-black/40 border-4 border-[#8b0000]/20 hover:translate-y-[-4px] transition-all duration-300 group">
                                    <div className="flex items-center gap-5 mb-3">
                                        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 group-hover:bg-[#b91c1c]">
                                            <Icon className="text-white text-xl" />
                                        </div>
                                        <span className="text-2xl font-black text-white">{value}</span>
                                    </div>
                                    <span className="text-[10px] text-[#fecaca] font-black uppercase tracking-[0.2em]">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Content Area */}
                <div className="max-w-5xl mx-auto px-6 py-12">
                    {/* Search Results Section */}
                    {searchResults.length > 0 && (
                        <section className="mb-16 animate-fade-in">
                            <div className="flex items-center justify-between mb-10 pb-4 border-b-2 border-gray-100">
                                <h2 className="text-sm font-black text-gray-900 tracking-[0.2em] uppercase flex items-center gap-4">
                                    <span className="w-1.5 h-6 bg-[#8b0000] rounded-full" />
                                    Archive Matches ({searchResults.length})
                                </h2>
                                <button
                                    className="text-[10px] font-black text-gray-400 hover:text-[#8b0000] uppercase tracking-widest transition-colors"
                                    onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                                >
                                    Reset
                                </button>
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                {searchResults.map((result, index) => (
                                    <div key={`${result.id}-${index}`} className="bg-gradient-to-br from-[#8b0000] to-[#500000] rounded-[1.5rem] p-8 shadow-2xl shadow-black/30 border-4 border-[#8b0000]/20 hover:scale-[1.01] transition-all duration-300 group cursor-pointer relative overflow-hidden">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest self-start ${relevanceBadge[result.relevance]}`}>
                                                {result.relevance} Relevance
                                            </span>
                                            <div className="flex items-center gap-4">
                                                <span className="flex items-center gap-2 text-[10px] text-[#fecaca] font-black uppercase tracking-widest">
                                                    <FaFolder className="text-[#8b0000]" /> {result.folder}
                                                </span>
                                                {result.year_range && result.year_range !== 'unknown' && (
                                                    <span className="flex items-center gap-2 text-[10px] text-[#fecaca] font-black uppercase tracking-widest">
                                                        <FaCalendarAlt className="text-[#8b0000]" /> {result.year_range}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-black text-white mb-4 leading-tight group-hover:text-[#fecaca] transition-colors">
                                            {highlightText(result.title, searchQuery)}
                                        </h3>
                                        <p className="text-sm text-white/50 leading-relaxed mb-6 font-bold line-clamp-2">
                                            {highlightText(result.abstract, searchQuery)}
                                        </p>
                                        <div className="flex items-center gap-4 pt-6 border-t border-white/5 text-[9px] text-white/30 font-black uppercase tracking-[0.2em]">
                                            <FaFileAlt className="text-[#8b0000]" /> {result.filename}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Features Section */}
                    <section className="mb-20">
                        <div className="flex items-center mb-10">
                            <h2 className="text-sm font-black text-gray-900 tracking-[0.2em] uppercase flex items-center gap-4">
                                <span className="w-1.5 h-6 bg-[#8b0000] rounded-full" />
                                Portal Modules
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {features.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <div
                                        key={index}
                                        className="bg-gradient-to-br from-[#8b0000] to-[#500000] rounded-[2rem] p-10 shadow-2xl shadow-black/40 border-4 border-[#8b0000]/20 hover:translate-y-[-8px] transition-all duration-500 cursor-pointer group"
                                        onClick={() => router.push(feature.path)}
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-8 border-2 border-white/10 transition-all duration-500 group-hover:bg-[#b91c1c] group-hover:scale-110">
                                            <Icon className="text-2xl text-white" />
                                        </div>
                                        <h3 className="text-lg font-black text-white mb-2 uppercase tracking-wider">{feature.title}</h3>
                                        <p className="text-[11px] text-white/40 font-bold leading-relaxed mb-8">{feature.description}</p>
                                        <div className="flex items-center gap-2 text-[#fecaca] text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300">
                                            Open <FaArrowRight className="text-[8px]" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Activity Feed Section */}
                    <section className="mb-20">
                        <div className="flex items-center mb-10">
                            <h2 className="text-sm font-black text-gray-900 tracking-[0.2em] uppercase flex items-center gap-4">
                                <span className="w-1.5 h-6 bg-[#8b0000] rounded-full" />
                                Activity Feed
                            </h2>
                        </div>
                        <div className="space-y-4">
                            {activities.map((activity, index) => (
                                <div key={index} className="flex items-center bg-gradient-to-br from-[#8b0000] to-[#500000] p-6 rounded-2xl shadow-xl shadow-black/20 border-4 border-[#8b0000]/20 hover:translate-x-3 transition-all duration-300 cursor-pointer group">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 border border-white/10 ${activity.colorClass}`}>
                                        <activity.icon />
                                    </div>
                                    <div className="flex-1 ml-6">
                                        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-0.5">{activity.title}</h3>
                                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{activity.description}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[9px] text-[#fecaca]/50 font-black uppercase tracking-widest">{activity.time}</span>
                                        <FaChevronRight className="text-white/20 group-hover:text-white transition-all" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Tip Section */}
                    <section>
                        <div className="relative bg-gradient-to-br from-[#8b0000] to-[#500000] p-10 rounded-[2.5rem] shadow-2xl shadow-black/50 border-8 border-[#3f2b2b]/10 overflow-hidden group">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -mr-20 -mt-20 opacity-5 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                                <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border-2 border-white/10 shadow-inner">
                                    <FaLightbulb className="text-4xl text-[#fecaca] animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white mb-2 uppercase tracking-[0.2em]">Quick Tip</h3>
                                    <p className="text-sm text-white/50 leading-loose font-bold italic">
                                        Use the search to explore previous research.
                                        All files are verified by the TUP analysis engine.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-12 bg-white border-t border-gray-100 text-center">
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.4em]">
                    Technological University of the Philippines &bull; Taguig &copy; {new Date().getFullYear()}
                </p>
            </footer>
        </div>
    );
};

export default HomePage;
