'use client';

import { useState, useEffect, ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    FaSearch,
    FaArrowRight,
    FaHistory,
    FaFolderOpen,
    FaGraduationCap,
    FaChevronDown,
    FaChevronUp,
    FaTrash,
    FaRobot,
    FaBrain,
    FaTimes
} from 'react-icons/fa';
import CustomHeader from '@/components/Navigation/CustomHeader';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';
import Footer from '@/components/Navigation/Footer';
import API_BASE_URL from '@/lib/api';

interface Thesis {
    id: string;
    title: string;
    abstract: string;
    filename: string;
    category?: string;
    year_range?: string;
    author?: string;
}

interface SearchResult extends Thesis {
    score: number;
    relevance: string;
}

interface UserData {
    name?: string;
    idNumber?: string;
    [key: string]: unknown;
}

interface AiHistoryItem {
    _id: string;
    prompt: string;
    recommendation: string;
    createdAt: string;
}

const HomePage: React.FC = () => {
    const router = useRouter();
    const [menuVisible, setMenuVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<UserData | null>(null);
    const [thesisCount, setThesisCount] = useState<number>(0);
    const [recentTheses, setRecentTheses] = useState<any[]>([]);
    const [deptCounts, setDeptCounts] = useState<{ category: string, count: number }[]>([]);
    const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);

    // AI History
    const [aiHistory, setAiHistory] = useState<AiHistoryItem[]>([]);
    const [loadingAi, setLoadingAi] = useState(false);
    const [expandedAiItems, setExpandedAiItems] = useState<Record<string, boolean>>({});
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
        const userData = localStorage.getItem('userData');
        const token = localStorage.getItem('token');
        const recent = JSON.parse(localStorage.getItem('recent_theses') || '[]');
        setRecentTheses(recent);

        if (userData && token) {
            setUser(JSON.parse(userData));

            // Fetch real thesis count from backend
            const fetchCount = async () => {
                try {
                    const res = await fetch(`${API_BASE_URL}/thesis/count`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setThesisCount(data.count);
                    }

                    // Fetch Department Counts
                    const deptRes = await fetch(`${API_BASE_URL}/thesis/department-counts`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (deptRes.ok) {
                        const deptData = await deptRes.json();
                        setDeptCounts(deptData);
                    }
                } catch (err) {
                    console.error('Error fetching data:', err);
                }
            };
            fetchCount();

            // Fetch AI History
            const fetchAiHistory = async () => {
                setLoadingAi(true);
                try {
                    const res = await fetch(`${API_BASE_URL}/user/ai-history`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setAiHistory(data.data || []);
                    }
                } catch (err) {
                    console.error('Error fetching AI history:', err);
                } finally {
                    setLoadingAi(false);
                }
            };
            fetchAiHistory();

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

    // Note: Search is now handled by the CustomHeader component which redirects to /search_result
    const onSearch = () => {
        if (searchQuery.trim()) {
            router.push(`/search_result?query=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const clearHistory = () => {
        localStorage.removeItem('recent_theses');
        setRecentTheses([]);
    };

    const handleDeleteAiHistory = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setItemToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDeleteAiHistory = async () => {
        if (!itemToDelete) return;

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/user/ai-history/${itemToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                setAiHistory(prev => prev.filter(item => item._id !== itemToDelete));
            } else {
                alert('Failed to delete history item');
            }
        } catch (err) {
            console.error('Error deleting AI history:', err);
            alert('An error occurred while deleting.');
        } finally {
            setDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    const toggleAiItem = (id: string) => {
        setExpandedAiItems(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };



    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
            {/* Header */}
            <CustomHeader
                onMenuPress={() => setMenuVisible(true)}
                onSearch={onSearch}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            {/* Hamburger Menu */}
            <HamburgerMenu isVisible={menuVisible} onClose={() => setMenuVisible(false)} />

            {/* Main Content */}
            <main className="flex-grow flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-[#8b0000]/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-[#8b0000]/5 rounded-full blur-[150px]" />

                <div className="max-w-6xl w-full flex flex-col gap-12 relative z-10 pt-20">
                    {/* Dashboard Cards Side-by-Side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Summary Card */}
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-black/5 border border-gray-100 flex items-center justify-between group hover:border-[#8b0000]/30 transition-all duration-500 h-full relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#8b0000]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10">
                                <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em] mb-2">Archive Size</p>
                                <p className="text-5xl font-black text-gray-900 leading-none tracking-tighter">{thesisCount.toLocaleString()}</p>
                                <p className="text-[11px] text-[#8b0000] font-black uppercase tracking-[0.1em] mt-3">Theses Indexed</p>
                            </div>
                            <div className="relative z-10 w-20 h-20 rounded-2xl bg-[#8b0000]/5 flex items-center justify-center border border-[#8b0000]/10 group-hover:bg-[#8b0000] group-hover:border-[#8b0000] transition-all duration-500">
                                <FaSearch className="text-3xl text-[#8b0000] group-hover:text-white transition-all duration-500" />
                            </div>
                        </div>

                        {/* Recently Viewed */}
                        <div className="bg-gradient-to-br from-[#8b0000] to-[#500000] rounded-[2.5rem] p-10 shadow-2xl border border-white/10 text-white space-y-8 h-full relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors" />
                            <div className="relative z-10 flex items-center justify-between">
                                <h2 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3">
                                    <FaHistory className="text-[#fecaca] text-lg" /> Recently Viewed
                                </h2>
                                {recentTheses.length > 0 && (
                                    <button
                                        onClick={clearHistory}
                                        className="text-[10px] font-black bg-white/20 px-3 py-1 rounded-full uppercase tracking-widest border border-white/20 hover:bg-white/40 hover:border-white/40 transition-all flex items-center gap-2 group/clear"
                                    >
                                        <FaTrash className="text-[8px] opacity-60 group-hover/clear:opacity-100 transition-opacity" />
                                        Clear History
                                    </button>
                                )}
                            </div>

                            {recentTheses.length > 0 ? (
                                <div className="space-y-4">
                                    {recentTheses.map((thesis) => (
                                        <div
                                            key={thesis.id}
                                            className="group cursor-pointer"
                                            onClick={() => router.push(`/search_result?id=${thesis.id}`)}
                                        >
                                            <p className="text-[10px] text-[#fecaca] font-black uppercase tracking-widest mb-1">{thesis.year}</p>
                                            <h3 className="text-sm font-bold leading-tight line-clamp-1 group-hover:text-[#fecaca] transition-colors">{thesis.title}</h3>
                                            <div className="w-8 h-0.5 bg-white/10 mt-3 group-hover:w-full transition-all duration-500" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center bg-white/5 rounded-2xl border border-white/10">
                                    <p className="text-xs font-bold text-white/40">No recent views yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* AI History section */}
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-sm font-black text-gray-900 tracking-[0.2em] uppercase flex items-center gap-4">
                                <span className="w-2 h-7 bg-[#8b0000] rounded-full" />
                                My AI Title Ideas
                            </h2>
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100 flex items-center gap-2">
                                <FaBrain /> AI Powered
                            </span>
                        </div>

                        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-black/5 overflow-hidden transition-all duration-500">
                            {loadingAi ? (
                                <div className="p-12 text-center text-gray-400 text-sm font-medium">Loading AI history...</div>
                            ) : aiHistory.length > 0 ? (
                                <div className="divide-y divide-gray-50">
                                    {aiHistory.map((item) => {
                                        const isExpanded = !!expandedAiItems[item._id];
                                        return (
                                            <div key={item._id} className="p-8 hover:bg-gray-50 transition-colors group relative">
                                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                                    <div className="flex-1 w-full">
                                                        {/* Header/Toggle Area */}
                                                        <div
                                                            className="flex items-center gap-3 mb-2 cursor-pointer group/title"
                                                            onClick={() => toggleAiItem(item._id)}
                                                        >
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isExpanded ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 group-hover/title:bg-blue-50 group-hover/title:text-blue-500'}`}>
                                                                <FaRobot />
                                                            </div>
                                                            <div className="flex-1">
                                                                <h3 className="text-sm font-black text-gray-800 tracking-tight group-hover/title:text-blue-600 transition-colors flex items-center gap-2">
                                                                    AI_Recommendations_({item.prompt.length > 30 ? item.prompt.substring(0, 30) + '...' : item.prompt})
                                                                    <span className="text-gray-400 text-[10px] bg-white border border-gray-100 px-2 py-0.5 rounded shadow-sm">
                                                                        {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                                                    </span>
                                                                </h3>
                                                                <span className="text-[10px] text-gray-400 font-bold">
                                                                    {new Date(item.createdAt).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Collapsible Content */}
                                                        <div className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-[2000px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                                                            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-inner whitespace-pre-wrap text-sm text-gray-700 font-medium leading-relaxed ml-11">
                                                                {item.recommendation}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Action Area */}
                                                    <div className="flex-shrink-0 flex items-start pt-1">
                                                        <button
                                                            onClick={(e) => handleDeleteAiHistory(item._id, e)}
                                                            className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-3 rounded-xl transition-all"
                                                            title="Delete History"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-12 text-center flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                                        <FaRobot className="text-blue-200 text-2xl" />
                                    </div>
                                    <p className="text-gray-400 font-medium text-sm">No AI title recommendations found.</p>
                                    <p className="text-gray-300 text-xs mt-2">Try searching for a topic using the AI Recommendation feature!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Department Distributions */}
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-sm font-black text-gray-900 tracking-[0.2em] uppercase flex items-center gap-4">
                                <span className="w-2 h-7 bg-[#8b0000] rounded-full" />
                                Thesis Repository Breakdown
                            </h2>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#8b0000] bg-[#8b0000]/5 px-4 py-1.5 rounded-full border border-[#8b0000]/10">
                                Department Level
                            </span>
                        </div>

                        {deptCounts.length > 0 ? (
                            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-black/5 overflow-hidden transition-all duration-500">
                                {/* The 'One Container' Header/Trigger */}
                                <button
                                    onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
                                    className="w-full p-8 flex items-center justify-between hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-[#8b0000]/5 flex items-center justify-center border border-[#8b0000]/10 group-hover:bg-[#8b0000] transition-all duration-500">
                                            <FaFolderOpen className="text-2xl text-[#8b0000] group-hover:text-white transition-all duration-500" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Explore Departments</h3>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">
                                                {deptCounts.filter(d => d.category.toUpperCase() !== 'UNCATEGORIZED').length} Academic Disciplines
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center transition-all duration-500 ${isDeptDropdownOpen ? 'bg-[#8b0000] border-[#8b0000] text-white rotate-180' : 'bg-white text-gray-400'}`}>
                                        <FaChevronDown />
                                    </div>
                                </button>

                                {/* Dropdown Content */}
                                <div className={`transition-all duration-700 ease-in-out ${isDeptDropdownOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                                    <div className="p-8 pt-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-gray-50">
                                        {deptCounts
                                            .filter(dept => dept.category.toUpperCase() !== 'UNCATEGORIZED')
                                            .map((dept, index) => (
                                                <div
                                                    key={dept.category + index}
                                                    className="flex items-center justify-between p-5 rounded-2xl bg-gray-50 border border-transparent hover:border-[#8b0000]/20 hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all duration-300 cursor-pointer group/item"
                                                    onClick={() => router.push(`/search_result?category=${encodeURIComponent(dept.category)}`)}
                                                >
                                                    <div>
                                                        <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest group-hover/item:text-[#8b0000] transition-colors mb-1">{dept.category}</h4>
                                                        <div className="w-4 h-0.5 bg-[#8b0000]/20 rounded-full group-hover/item:w-full transition-all duration-500" />
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-xl font-black text-gray-900 leading-none">{dept.count}</span>
                                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Files</p>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-12 text-center bg-white rounded-[2.5rem] border border-gray-100 italic text-gray-400 text-sm shadow-xl shadow-black/5">
                                Loading archive statistics...
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <Footer />

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl transform transition-all scale-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full pointer-events-none -z-0" />

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <FaTrash className="text-red-500 text-2xl" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">Delete Recommendation?</h3>
                            <p className="text-sm text-gray-500 font-medium mb-8">
                                Are you sure you want to permanently delete this AI title recommendation? This action cannot be undone.
                            </p>

                            <div className="flex w-full gap-3">
                                <button
                                    onClick={() => {
                                        setDeleteModalOpen(false);
                                        setItemToDelete(null);
                                    }}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDeleteAiHistory}
                                    className="flex-1 bg-[#8b0000] hover:bg-red-800 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;
