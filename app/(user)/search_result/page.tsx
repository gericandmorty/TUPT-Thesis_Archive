'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaCalendarAlt,
    FaFileAlt,
    FaUserGraduate,
    FaArrowLeft,
    FaBookOpen,
    FaTimes,
    FaMagic,
    FaSave,
    FaRobot,
    FaSearch,
    FaChevronDown,
    FaChevronUp,
    FaChevronRight,
    FaHandshake,
    FaThLarge,
    FaList,
    FaPaperclip,
    FaExternalLinkAlt,
    FaFilePdf,
    FaFileWord,
    FaLock,
    FaUnlock,
    FaFilter
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import LottieLoader from '@/app/components/UI/LottieLoader';
import AiReportSidebar from '@/app/components/AI-Sidebar/AiReportSidebar';
import SearchResultSkeleton from '@/app/components/UI/skeleton_loaders/users/SearchResultSkeleton';
import ThesisDetailSkeleton from '@/app/components/UI/skeleton_loaders/users/ThesisDetailSkeleton';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Thesis {
    id: string;
    title: string;
    abstract: string;
    filename: string;
    course?: string;
    year_range?: string;
    author?: string;
    _id?: string;
    isUploadedByUndergrad?: boolean;
    createdBy?: string;
    hasRequestedCollaboration?: boolean;
    attachments?: string[];
    downloads?: number;
}

const SearchResultContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const query = searchParams.get('query');
    const year = searchParams.get('year');
    const type = searchParams.get('type');
    const course = searchParams.get('course');
    const id = searchParams.get('id');

    const [results, setResults] = useState<Thesis[]>([]);
    const [singleThesis, setSingleThesis] = useState<Thesis | null>(null);
    const [loading, setLoading] = useState(true);
    const [showSkeleton, setShowSkeleton] = useState(false);

    // AI Modal states
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [isLoadingAi, setIsLoadingAi] = useState(false);
    const [isLoadingLocal, setIsLoadingLocal] = useState(false);
    const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
    const [localComparison, setLocalComparison] = useState<any>(null);
    const [savedPromptSuccess, setSavedPromptSuccess] = useState(false);
    const [statusModal, setStatusModal] = useState<{ show: boolean, message: string } | null>(null);

    // Collaboration states
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isCollaborationModalOpen, setIsCollaborationModalOpen] = useState(false);
    const [collaborationThesis, setCollaborationThesis] = useState<Thesis | null>(null);
    const [collaborationMessage, setCollaborationMessage] = useState('');
    const [isSubmittingCollaboration, setIsSubmittingCollaboration] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

    // IEEE & ACM Filter states
    const [keywordFilter, setKeywordFilter] = useState('');
    const [isOpenAccessOnly, setIsOpenAccessOnly] = useState(false);
    const [yearFilterMode, setYearFilterMode] = useState<'range' | 'single'>('range');
    const [minYearInput, setMinYearInput] = useState('');
    const [maxYearInput, setMaxYearInput] = useState('');
    const [appliedMinYear, setAppliedMinYear] = useState('');
    const [appliedMaxYear, setAppliedMaxYear] = useState('');
    const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
    const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
    const [expandedAccordions, setExpandedAccordions] = useState<Record<string, boolean>>({
        show: true,
        year: true,
        author: true,
        course: true,
        keyword: true
    });
    const [expandedAbstracts, setExpandedAbstracts] = useState<Record<string, boolean>>({});
    const [selectedResults, setSelectedResults] = useState<Record<string, boolean>>({});
    const [sortBy, setSortBy] = useState('relevance');
    const [selectAll, setSelectAll] = useState(false);

    const toggleAccordion = (name: string) => {
        setExpandedAccordions(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const toggleCourse = (courseName: string) => {
        setSelectedCourses(prev =>
            prev.includes(courseName) ? prev.filter(c => c !== courseName) : [...prev, courseName]
        );
    };

    const toggleAuthor = (authorName: string) => {
        setSelectedAuthors(prev =>
            prev.includes(authorName) ? prev.filter(a => a !== authorName) : [...prev, authorName]
        );
    };

    // Auto-reset filters when query/results change
    useEffect(() => {
        setIsOpenAccessOnly(false);
        setMinYearInput('');
        setMaxYearInput('');
        setAppliedMinYear('');
        setAppliedMaxYear('');
        setSelectedCourses([]);
        setSelectedAuthors([]);
        setExpandedAbstracts({});
        setSelectedResults({});
        setKeywordFilter('');
    }, [query]);

    useEffect(() => {
        const userData = localStorage.getItem('userData');
        if (userData) {
            setCurrentUser(JSON.parse(userData));
        }
    }, []);

    useEffect(() => {
        if (isLoadingAi || isLoadingLocal || loading) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isLoadingAi, isLoadingLocal, loading]);

    const isUndergrad = currentUser && !currentUser.isGraduate && !currentUser.isProfessor && !currentUser.isAdmin;
    const isApprover = currentUser?.isProfessor || currentUser?.isAdmin;

    const isBackNavRef = useRef(false);

    useEffect(() => {
        const fetchData = async () => {
            const startTime = Date.now();
            const token = localStorage.getItem('token');
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };

            const isBackNav = !id && results.length > 0;
            isBackNavRef.current = isBackNav;

            const existingThesis = id ? results.find(t => t.id === id) : null;

            if (!id) {
                setSingleThesis(null);
                if (isBackNav) {
                    setLoading(false);
                    setShowSkeleton(false);
                } else {
                    setLoading(true);
                }
            } else if (singleThesis && singleThesis.id !== id) {
                if (!existingThesis) {
                    setSingleThesis(null);
                    setLoading(true);
                } else {
                    setSingleThesis(existingThesis);
                    setLoading(false);
                    setShowSkeleton(false);
                }
            } else if (!singleThesis) {
                if (existingThesis) {
                    setSingleThesis(existingThesis);
                    setLoading(false);
                    setShowSkeleton(false);
                } else {
                    setLoading(true);
                }
            }

            const skeletonTimer = setTimeout(() => {
                if (!existingThesis && !(!id && isBackNavRef.current)) {
                    setShowSkeleton(true);
                }
            }, 500);

            let didFetch = false;
            try {
                if (id) {
                    const res = await fetch(`${API_BASE_URL}/thesis/find-one/${id}`, { headers });
                    didFetch = true;
                    if (res.ok) {
                        const data = await res.json();
                        setSingleThesis(data);

                        // Save to session history on backend
                        if (token) {
                            fetch(`${API_BASE_URL}/user/session-history`, {
                                method: 'POST',
                                headers,
                                body: JSON.stringify({
                                    id: data._id || data.id,
                                    title: data.title,
                                    year: data.year_range || data.year || 'Unknown'
                                })
                            }).catch(err => console.log('Failed to save session history to DB', err));
                        }
                    } else if (!existingThesis) {
                        throw new Error('Thesis not found');
                    }
                } else if (query || year || course) {
                    const params = new URLSearchParams();
                    if (query) params.append('query', query);
                    if (year && year !== 'all') params.append('year', year);
                    if (course && course !== 'all') params.append('course', course);
                    if (type && type !== 'all') params.append('type', type);

                    const res = await fetch(`${API_BASE_URL}/thesis/search?${params.toString()}`, { headers });
                    didFetch = true;
                    if (res.ok) {
                        const data = await res.json();
                        setResults(data);
                    } else {
                        setResults([]);
                    }
                    setSingleThesis(null);
                } else {
                    setResults([]);
                    setSingleThesis(null);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                if (!id) setResults([]);
            } finally {
                const elapsed = Date.now() - startTime;
                const minDelay = (!id && didFetch) ? 2000 : 0;
                if (elapsed < minDelay) await new Promise(r => setTimeout(r, minDelay - elapsed));
                clearTimeout(skeletonTimer);
                setLoading(false);
                setShowSkeleton(false);
            }
        };
        fetchData();
    }, [id, query, year, course, type]);

    const handleRecommendByAi = async () => {
        if (!query || query.split(' ').filter(w => w.length > 0).length < 3) {
            setStatusModal({
                show: true,
                message: 'Your search query must be at least 3 words to use AI features.'
            });
            return;
        }
        setLocalComparison(null); // Clear previous similarity check
        setIsLoadingAi(true);
        setIsAiModalOpen(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/thesis/recommendations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ prompt: query, query })
            });
            if (res.ok) {
                const data = await res.json();
                setAiRecommendation(data.recommendation);
            }
        } catch (err) { console.error(err); }
        finally { setIsLoadingAi(false); }
    };

    const handleCompareLocal = async (thesisTitle?: string) => {
        const targetQuery = thesisTitle || query;
        if (!targetQuery || targetQuery.split(' ').filter(w => w.length > 0).length < 3) {
            setStatusModal({
                show: true,
                message: 'The title/content must be at least 3 words to check similarity.'
            });
            return;
        }
        setAiRecommendation(null); // Clear previous AI recommendation
        setIsLoadingLocal(true);
        setIsAiModalOpen(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/thesis/compare-local`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ title: targetQuery })
            });
            if (res.ok) {
                const data = await res.json();
                setLocalComparison(data);
            }
        } catch (err) { console.error(err); }
        finally { setIsLoadingLocal(false); }
    };

    const handleSavePrompt = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/user/ai-history`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ prompt: query, recommendation: aiRecommendation || localComparison?.recommendation })
            });
            if (res.ok) {
                setSavedPromptSuccess(true);
                setTimeout(() => setSavedPromptSuccess(false), 3000);
            }
        } catch (err) { console.error(err); }
    };

    const incrementLocalDownloadCount = (thesisId: string) => {
        setResults(prev => prev.map(t => 
            (t._id === thesisId || t.id === thesisId) ? { ...t, downloads: (t.downloads || 0) + 1 } : t
        ));
        if (singleThesis && (singleThesis._id === thesisId || singleThesis.id === thesisId)) {
            setSingleThesis(prev => prev ? { ...prev, downloads: (prev.downloads || 0) + 1 } : null);
        }
    };

    const handleDownloadClick = async (thesis: Thesis) => {
        try {
            const token = localStorage.getItem('token');
            const targetId = thesis._id || thesis.id;
            incrementLocalDownloadCount(targetId);
            
            await fetch(`${API_BASE_URL}/thesis/${targetId}/download`, {
                method: 'POST',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });
        } catch (err) {
            console.error('Failed to increment download count:', err);
        }
    };

    const handleRequestCollaboration = async () => {
        if (!collaborationMessage.trim()) {
            toast.error('Please enter a message for your collaboration request.');
            return;
        }
        setIsSubmittingCollaboration(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/collaboration`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    thesisId: collaborationThesis?._id,
                    message: collaborationMessage
                })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Collaboration request sent successfully!');
                setIsCollaborationModalOpen(false);
                setCollaborationMessage('');

                // Update local state to reflect the sent request
                if (singleThesis && singleThesis._id === collaborationThesis?._id) {
                    setSingleThesis({ ...singleThesis, hasRequestedCollaboration: true });
                }
                setResults(prev => prev.map(t =>
                    t._id === collaborationThesis?._id ? { ...t, hasRequestedCollaboration: true } : t
                ));
                setCollaborationThesis(null);
            } else {
                toast.error(data.message || 'Failed to send collaboration request');
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred. Please try again.');
        } finally {
            setIsSubmittingCollaboration(false);
        }
    };

    const extractAuthors = (thesis: Thesis) => thesis.author || 'Institutional Submission';

    // Highlight function
    const sanitizeText = (text: string | undefined) => {
        if (!text) return '';
        return text
            .replace(/Â€™/g, "'")
            .replace(/Â€“/g, "—")
            .replace(/Â/g, "")
            .replace(/&lsquo;/g, "'")
            .replace(/&rsquo;/g, "'")
            .replace(/&ldquo;/g, '"')
            .replace(/&rdquo;/g, '"')
            .replace(/&ndash;/g, "—")
            .replace(/&mdash;/g, "—");
    };

    const highlightText = (text: string | undefined, searchWord: string | null, secondWord?: string | null) => {
        const sanitized = sanitizeText(text);
        if (!sanitized) return '';
        
        const wordsToHighlight: string[] = [];
        if (searchWord && searchWord.trim()) wordsToHighlight.push(searchWord.trim());
        if (secondWord && secondWord.trim()) wordsToHighlight.push(secondWord.trim());
        
        if (wordsToHighlight.length === 0) return sanitized;
        
        const escapedWords = wordsToHighlight.map(w => w.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
        escapedWords.sort((a, b) => b.length - a.length);
        
        const pattern = `(${escapedWords.join('|')})`;
        const regex = new RegExp(pattern, 'gi');
        const parts = sanitized.split(regex);
        return (
            <>
                {parts.map((part, index) =>
                    regex.test(part) ? <span key={index} className="bg-teal-500/15 text-primary font-black px-0.5 rounded border border-primary/10 shadow-sm">{part}</span> : part
                )}
            </>
        );
    };

    // Calculate distributions and facets
    const availableCourses = (() => {
        const counts: Record<string, number> = {};
        results.forEach(t => {
            if (t.course) {
                counts[t.course] = (counts[t.course] || 0) + 1;
            }
        });
        return Object.entries(counts).map(([name, count]) => ({ name, count }));
    })();

    const availableAuthors = (() => {
        const counts: Record<string, number> = {};
        results.forEach(t => {
            if (t.author) {
                const parts = t.author.split(/;\s*/).map(p => p.trim());
                parts.forEach(p => {
                    if (p && p.toLowerCase() !== 'institutional submission') {
                        counts[p] = (counts[p] || 0) + 1;
                    }
                });
            }
        });
        return Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8); // top 8
    })();

    const yearsDistribution = (() => {
        const counts: Record<string, number> = {};
        results.forEach(t => {
            const yrStr = t.year_range || '';
            const match = yrStr.match(/\d{4}/);
            if (match) {
                const yr = match[0];
                counts[yr] = (counts[yr] || 0) + 1;
            }
        });
        return Object.entries(counts)
            .map(([year, count]) => ({ year: parseInt(year), count }))
            .sort((a, b) => a.year - b.year);
    })();

    const maxTimelineCount = Math.max(...yearsDistribution.map(d => d.count), 1);

    // Apply filters
    const sortedFilteredResults = (() => {
        let items = [...results];
        
        // 1. Show / Open Access Filter
        if (isOpenAccessOnly) {
            items = items.filter(t => t.attachments && t.attachments.length > 0);
        }

        // 2. Year filter
        if (appliedMinYear) {
            const minVal = parseInt(appliedMinYear);
            items = items.filter(t => {
                const match = (t.year_range || '').match(/\d{4}/);
                if (!match) return false;
                const yr = parseInt(match[0]);
                if (yearFilterMode === 'single') return yr === minVal;
                return yr >= minVal;
            });
        }
        if (appliedMaxYear && yearFilterMode === 'range') {
            const maxVal = parseInt(appliedMaxYear);
            items = items.filter(t => {
                const match = (t.year_range || '').match(/\d{4}/);
                if (!match) return false;
                const yr = parseInt(match[0]);
                return yr <= maxVal;
            });
        }

        // 3. Course filter
        if (selectedCourses.length > 0) {
            items = items.filter(t => t.course && selectedCourses.includes(t.course));
        }

        // 4. Author filter
        if (selectedAuthors.length > 0) {
            items = items.filter(t => {
                if (!t.author) return false;
                const authorsList = t.author.split(/;\s*/).map(a => a.trim().toLowerCase());
                return selectedAuthors.some(sel => authorsList.some(ta => ta.includes(sel.toLowerCase())));
            });
        }

        // 5. Keyword Filter (full phrase match)
        if (keywordFilter.trim()) {
            const lowerFilter = keywordFilter.trim().toLowerCase();
            items = items.filter(t => 
                (t.title && t.title.toLowerCase().includes(lowerFilter)) ||
                (t.abstract && t.abstract.toLowerCase().includes(lowerFilter))
            );
        }

        // 6. Sorting
        if (sortBy === 'newest') {
            items.sort((a, b) => {
                const aYr = parseInt((a.year_range || '').match(/\d{4}/)?.[0] || '0');
                const bYr = parseInt((b.year_range || '').match(/\d{4}/)?.[0] || '0');
                return bYr - aYr;
            });
        } else if (sortBy === 'oldest') {
            items.sort((a, b) => {
                const aYr = parseInt((a.year_range || '').match(/\d{4}/)?.[0] || '0');
                const bYr = parseInt((b.year_range || '').match(/\d{4}/)?.[0] || '0');
                return aYr - bYr;
            });
        }

        return items;
    })();

    const recommendedProjects = (() => {
        const isFiltering = isOpenAccessOnly || appliedMinYear !== '' || appliedMaxYear !== '' || selectedCourses.length > 0 || selectedAuthors.length > 0 || keywordFilter.trim() !== '';
        if (!isFiltering) return [];
        
        const filteredIds = new Set(sortedFilteredResults.map(r => r.id));
        let candidates = results.filter(r => !filteredIds.has(r.id));
        
        if (candidates.length === 0) {
            candidates = results.filter(r => filteredIds.has(r.id));
        }
        
        return candidates
            .sort((a: any, b: any) => (b.downloads || 0) - (a.downloads || 0))
            .slice(0, 3);
    })();

    const handleCheckboxChange = (thesisId: string) => {
        setSelectedResults(prev => ({
            ...prev,
            [thesisId]: !prev[thesisId]
        }));
    };

    const handleSelectAllChange = () => {
        if (selectAll) {
            setSelectedResults({});
        } else {
            const nextSelected: Record<string, boolean> = {};
            sortedFilteredResults.forEach(r => {
                nextSelected[r.id] = true;
            });
            setSelectedResults(nextSelected);
        }
        setSelectAll(!selectAll);
    };

    const clearYearFilters = () => {
        setMinYearInput('');
        setMaxYearInput('');
        setAppliedMinYear('');
        setAppliedMaxYear('');
    };

    const applyYearFilters = () => {
        setAppliedMinYear(minYearInput);
        setAppliedMaxYear(maxYearInput);
    };

    return (
        <div className="min-h-screen bg-transparent flex flex-col font-sans selection:bg-primary/30">
            {/* Header Navigation Area */}
            <div className="z-40 w-full pt-28 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <AnimatePresence mode="wait">
                        {singleThesis ? (
                            <motion.button
                                key="back-results"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                onClick={() => router.back()}
                                className="flex items-center gap-2 text-primary hover:text-primary-hover font-black uppercase tracking-widest transition-all group"
                            >
                                <FaArrowLeft className="text-xs group-hover:-translate-x-1 transition-transform" /> Back to Results
                            </motion.button>
                        ) : (
                            <motion.div
                                key="back-portal"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                            >
                                <Link
                                    href="/home"
                                    className="flex items-center gap-2 text-secondary hover:text-teal-200 font-black uppercase tracking-widest hover:underline transition-all group"
                                >
                                    <FaArrowLeft className="text-xs group-hover:-translate-x-1 transition-transform" /> Back to Portal
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {(!singleThesis && (results.length > 0 || query)) && (
                        <div className="flex items-center gap-4 animate-fade-in flex-wrap">
                            {results.length > 0 && (
                                <div className="flex items-center gap-2 bg-card p-1 rounded-xl border border-border-custom shadow-sm">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-gray-300'}`}
                                        title="Grid View"
                                    >
                                        <FaThLarge className="text-sm" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-gray-300'}`}
                                        title="List View"
                                    >
                                        <FaList className="text-sm" />
                                    </button>
                                    <div className="w-[1px] h-4 bg-border-custom mx-1" />
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 whitespace-nowrap">
                                        {results.length} Documents
                                    </span>
                                </div>
                            )}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleCompareLocal()}
                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 border border-primary/20 px-4 py-2 rounded-xl hover:bg-primary/10 transition-all shadow-lg"
                                >
                                    <FaSearch className="text-[8px]" /> Check Similarity
                                </button>
                                <button
                                    onClick={handleRecommendByAi}
                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#2DD4BF] bg-[#2DD4BF]/5 border border-[#2DD4BF]/20 px-4 py-2 rounded-xl hover:bg-[#2DD4BF]/10 transition-all shadow-lg shadow-[#2DD4BF]/5"
                                >
                                    <FaRobot /> AI Suggest
                                </button>
                            </div>
                        </div>
                    )}
                    {singleThesis && isUndergrad && singleThesis.createdBy && !singleThesis.isUploadedByUndergrad && String(singleThesis.createdBy) !== String(currentUser?._id) && (
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    if (singleThesis.hasRequestedCollaboration) return;
                                    setCollaborationThesis(singleThesis);
                                    setIsCollaborationModalOpen(true);
                                }}
                                disabled={singleThesis.hasRequestedCollaboration}
                                className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all active:scale-95 group z-20 shadow-lg ${singleThesis.hasRequestedCollaboration
                                        ? 'bg-gray-500/10 border border-gray-500/20 text-gray-500 cursor-not-allowed'
                                        : 'bg-primary/5 border border-primary/20 text-primary hover:bg-primary/20 hover:border-primary/40'
                                    }`}
                            >
                                <FaHandshake className={singleThesis.hasRequestedCollaboration ? "" : "group-hover:rotate-12 transition-transform"} />
                                <span>{singleThesis.hasRequestedCollaboration ? 'Request Sent' : 'Request Collaboration'}</span>
                            </button>
                        </div>
                    )}

                </div>

                {/* AI / Local Loading Overlays (Full Screen Modal) */}
                {(isLoadingAi || isLoadingLocal) && (
                    <LottieLoader
                        isModal={true}
                        type="ai"
                        text={isLoadingLocal ? 'Comparing to Local Sources please wait' : 'AI is thinking'}
                        subtext={isLoadingLocal ? 'Analyzing repository context and patterns' : 'Generating intelligent recommendations'}
                    />
                )}
            </div>

            <main className="flex-grow flex flex-col pt-6 pb-32 px-4 md:px-8 max-w-7xl mx-auto w-full relative">
                <AnimatePresence mode="wait">
                    {loading && id && showSkeleton && !singleThesis ? (
                        <motion.div
                            key="skeleton-detail"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ThesisDetailSkeleton />
                        </motion.div>
                    ) : singleThesis ? (
                        <motion.div
                            key={`thesis-${singleThesis.id}`}
                            initial={{ opacity: 0, y: 30, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -30, scale: 0.98 }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            className="max-w-4xl mx-auto pb-16 w-full"
                        >
                            <div className="relative group/paper">
                                <div className="absolute inset-0 bg-stone-200/40 rounded-3xl translate-y-6 translate-x-3 -rotate-2 transition-transform group-hover/paper:translate-y-8 group-hover/paper:rotate-[-3deg] duration-700" />
                                <div className="absolute inset-0 bg-stone-200/60 rounded-3xl translate-y-3 translate-x-1.5 rotate-1 transition-transform group-hover/paper:translate-y-4 group-hover/paper:rotate-[2deg] duration-700" />

                                <div className="relative bg-[#FCFCFA] text-[#1A1A1A] rounded-sm shadow-[0_40px_100px_rgba(0,0,0,0.5)] min-h-screen flex flex-col p-6 sm:p-12 md:p-20 overflow-hidden border border-stone-200">
                                    {/* Watermark from AiReportSidebar */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                                        <img src="/assets/tup-logo.png" alt="" className="w-[500px] grayscale" />
                                    </div>

                                    {/* Paper Header from AiReportSidebar */}
                                    <div className="relative z-10 flex flex-col items-center text-center gap-6 border-b-[3px] border-[#1A1A1A] pb-10 mb-12">
                                        {/* Archived Stamp */}
                                        <div className="absolute -top-4 -right-4 md:top-0 md:right-0 transform rotate-[15deg] border-4 border-red-800/20 text-red-800/20 px-4 py-1 font-black text-2xl uppercase tracking-[0.2em] pointer-events-none select-none italic">
                                            ARCHIVED
                                        </div>

                                        <img src="/assets/tup-logo.png" alt="TUP Logo" className="w-20 h-20 object-contain" />

                                        <div className="space-y-1">
                                            <h4 className="text-[15px] font-black uppercase tracking-[0.2em]">Technological University of the Philippines</h4>
                                            <p className="text-[11px] font-bold text-[#666] uppercase tracking-[0.3em]">Taguig City Campus</p>
                                        </div>
                                    </div>

                                    {/* Content Area */}
                                    <div className="relative z-10 flex-grow flex flex-col gap-12">
                                        {/* Meta Row */}
                                        <div className="flex justify-between items-end border-b border-[#1A1A1A]/10 pb-6 text-[10px]">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-black text-[#999] uppercase tracking-widest">Accession Number</span>
                                                <span className="font-bold uppercase">{singleThesis.id}</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1 text-center">
                                                <span className="font-black text-[#999] uppercase tracking-widest">Downloads</span>
                                                <span className="font-bold uppercase">{singleThesis.downloads || 0}</span>
                                            </div>
                                            <div className="flex flex-col items-end gap-1 text-right">
                                                <span className="font-black text-[#999] uppercase tracking-widest">Course</span>
                                                <span className="font-bold uppercase">{singleThesis.course}</span>
                                            </div>
                                        </div>

                                        {/* Title Section */}
                                        <div className="text-center">
                                            <h2 className="text-2xl md:text-3xl font-black text-[#1A1A1A] leading-tight font-serif tracking-tight">
                                                {singleThesis.title}
                                            </h2>
                                            <div className="mt-8 flex flex-col items-center gap-2">
                                                <span className="text-[10px] font-black text-[#999] uppercase tracking-[0.5em]">Author/s</span>
                                                <p className="text-sm font-bold italic font-serif text-[#444] uppercase tracking-widest">{singleThesis.author || 'Institutional Member'}</p>
                                            </div>
                                        </div>

                                        {/* Abstract Body */}
                                        <div className="space-y-8">
                                            <h4 className="text-[13px] font-black text-[#1A1A1A] uppercase tracking-[0.2em] flex items-center gap-4">
                                                <span className="w-10 h-[2px] bg-[#1A1A1A]" />
                                                Abstract Record
                                                <span className="flex-1 h-[1px] bg-[#1A1A1A]/10" />
                                            </h4>
                                            <div className="text-[#222] leading-[1.8] text-[15.5px] font-serif text-justify">
                                                <p className="first-letter:text-6xl first-letter:font-black first-letter:float-left first-letter:mr-4 first-letter:mt-2 first-letter:leading-[0.8] first-letter:text-[#1A1A1A]">
                                                    {singleThesis.abstract}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Attachments Section (Visible to Admins/Faculty/Librarian) */}
                                        {isApprover && singleThesis.attachments && singleThesis.attachments.length > 0 && (
                                            <div className="space-y-8 mt-12 pt-12 border-t border-[#1A1A1A]/10">
                                                <h4 className="text-[13px] font-black text-[#1A1A1A] uppercase tracking-[0.2em] flex items-center gap-4">
                                                    <span className="w-10 h-[2px] bg-[#1A1A1A]" />
                                                    Supporting Documents
                                                    <span className="flex-1 h-[1px] bg-[#1A1A1A]/10" />
                                                </h4>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                                    {singleThesis.attachments.map((url, i) => (
                                                        <motion.div
                                                            key={i}
                                                            whileHover={{ y: -5 }}
                                                            className="group/attach relative aspect-[3/4] bg-white border border-stone-200 rounded-sm shadow-md overflow-hidden cursor-pointer"
                                                            onClick={async () => {
                                                                await handleDownloadClick(singleThesis);
                                                                const lowerUrl = url.toLowerCase();
                                                                const isDoc = lowerUrl.endsWith('.pdf') || lowerUrl.endsWith('.docx') || lowerUrl.endsWith('.doc') || lowerUrl.includes('/raw/upload/');
                                                                const targetUrl = isDoc
                                                                    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/download?url=${encodeURIComponent(url)}`
                                                                    : url;
                                                                window.open(targetUrl, '_blank');
                                                            }}
                                                        >
                                                            {(() => {
                                                                const lowerUrl = url.toLowerCase();
                                                                const isPdf = lowerUrl.endsWith('.pdf');
                                                                const isWord = lowerUrl.endsWith('.docx') || lowerUrl.endsWith('.doc');
                                                                const isDoc = isPdf || isWord || lowerUrl.includes('/raw/upload/');
                                                                
                                                                if (isDoc) {
                                                                    return (
                                                                        <div className="w-full h-full flex flex-col items-center justify-center bg-stone-50 gap-3 p-4">
                                                                            {isPdf ? (
                                                                                <FaFilePdf className="text-4xl text-rose-500/80" />
                                                                            ) : (
                                                                                <FaFileWord className="text-4xl text-blue-500/80" />
                                                                            )}
                                                                            <span className="text-[9px] font-black uppercase tracking-widest text-[#999] text-center line-clamp-1">
                                                                                {isPdf ? 'PDF Document' : 'Word Document'}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                }
                                                                return (
                                                                    <img src={url} alt={`Attachment ${i + 1}`} className="w-full h-full object-cover grayscale group-hover/attach:grayscale-0 transition-all duration-500" />
                                                                );
                                                            })()}
                                                            <div className="absolute inset-0 bg-black/0 group-hover/attach:bg-black/5 transition-colors" />
                                                            <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center opacity-0 group-hover/attach:opacity-100 transition-opacity translate-y-2 group-hover/attach:translate-y-0 duration-300">
                                                                <FaExternalLinkAlt className="text-[10px] text-primary" />
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>



                                    <div className="mt-16 py-4 bg-teal-50 border-t border-teal-100 text-center -mx-6 sm:-mx-12 md:-mx-20 -mb-6 sm:-mb-12 md:-mb-20">
                                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-teal-800">© {new Date().getFullYear()} TUPT Digital Archives • Institutional Property</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : results.length > 0 ? (
                        <div className="flex flex-col lg:flex-row gap-8 relative z-10 w-full">
                            {/* LEFT SIDEBAR: FILTERS */}
                            <aside className="w-full lg:w-[280px] flex-shrink-0 flex flex-col gap-4">
                                
                                {/* Accordion: Keyword Filter */}
                                <div className="bg-card border border-border-custom rounded-xl overflow-hidden shadow-sm">
                                    <button
                                        onClick={() => toggleAccordion('keyword')}
                                        className="w-full px-5 py-4 flex items-center justify-between font-bold text-sm text-foreground hover:bg-white/[0.02] cursor-pointer"
                                    >
                                        <span>Keyword Filter</span>
                                        {expandedAccordions.keyword ? <FaChevronUp className="text-xs text-gray-400" /> : <FaChevronDown className="text-xs text-gray-400" />}
                                    </button>
                                    
                                    <AnimatePresence initial={false}>
                                        {expandedAccordions.keyword && (
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: 'auto' }}
                                                exit={{ height: 0 }}
                                                className="overflow-hidden border-t border-border-custom"
                                            >
                                                <div className="p-5 flex flex-col gap-3">
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            placeholder="Enter full phrase..."
                                                            value={keywordFilter}
                                                            onChange={(e) => setKeywordFilter(e.target.value)}
                                                            className="w-full pl-8 pr-3 py-2 bg-surface border border-border-custom rounded-xl text-xs font-semibold text-foreground placeholder:text-gray-600 outline-none focus:border-primary"
                                                        />
                                                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-500" />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Accordion: Show */}
                                <div className="bg-card border border-border-custom rounded-xl overflow-hidden shadow-sm">
                                    <button
                                        onClick={() => toggleAccordion('show')}
                                        className="w-full px-5 py-4 flex items-center justify-between font-bold text-sm text-foreground hover:bg-white/[0.02] cursor-pointer"
                                    >
                                        <span>Show</span>
                                        {expandedAccordions.show ? <FaChevronUp className="text-xs text-gray-400" /> : <FaChevronDown className="text-xs text-gray-400" />}
                                    </button>
                                    
                                    <AnimatePresence initial={false}>
                                        {expandedAccordions.show && (
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: 'auto' }}
                                                exit={{ height: 0 }}
                                                className="overflow-hidden border-t border-border-custom"
                                            >
                                                <div className="p-5 flex flex-col gap-3">
                                                    <label className="flex items-center gap-2.5 text-xs font-semibold text-text-dim cursor-pointer hover:text-white transition-colors">
                                                        <input
                                                            type="radio"
                                                            name="showFilter"
                                                            checked={!isOpenAccessOnly}
                                                            onChange={() => setIsOpenAccessOnly(false)}
                                                            className="text-primary focus:ring-primary bg-surface border-gray-600 cursor-pointer"
                                                        />
                                                        <span>All Results</span>
                                                    </label>
                                                    <label className="flex items-center gap-2.5 text-xs font-semibold text-text-dim cursor-pointer hover:text-white transition-colors">
                                                        <input
                                                            type="radio"
                                                            name="showFilter"
                                                            checked={isOpenAccessOnly}
                                                            onChange={() => setIsOpenAccessOnly(true)}
                                                            className="text-primary focus:ring-primary bg-surface border-gray-600 cursor-pointer"
                                                        />
                                                        <span>Open Access Only</span>
                                                    </label>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Accordion: Year (ACM Timeline & Slider) */}
                                <div className="bg-card border border-border-custom rounded-xl overflow-hidden shadow-sm">
                                    <button
                                        onClick={() => toggleAccordion('year')}
                                        className="w-full px-5 py-4 flex items-center justify-between font-bold text-sm text-foreground hover:bg-white/[0.02] cursor-pointer"
                                    >
                                        <span>Year</span>
                                        {expandedAccordions.year ? <FaChevronUp className="text-xs text-gray-400" /> : <FaChevronDown className="text-xs text-gray-400" />}
                                    </button>
                                    
                                    <AnimatePresence initial={false}>
                                        {expandedAccordions.year && (
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: 'auto' }}
                                                exit={{ height: 0 }}
                                                className="overflow-hidden border-t border-border-custom"
                                            >
                                                <div className="p-5 flex flex-col">
                                                    
                                                    {/* ACM Timeline Histogram */}
                                                    {yearsDistribution.length > 0 ? (
                                                        <div className="h-14 flex items-end gap-1 border-b border-white/5 pb-1.5 mb-4">
                                                            {yearsDistribution.map((d) => {
                                                                const yrStr = d.year.toString();
                                                                const isSel = (!minYearInput || d.year >= parseInt(minYearInput)) && 
                                                                              (!maxYearInput || yearFilterMode === 'single' || d.year <= parseInt(maxYearInput));
                                                                return (
                                                                    <div
                                                                        key={d.year}
                                                                        className="flex-1 flex flex-col items-center group relative cursor-pointer"
                                                                        onClick={() => {
                                                                            if (yearFilterMode === 'single') {
                                                                                setMinYearInput(yrStr);
                                                                            } else {
                                                                                if (!minYearInput || (minYearInput && maxYearInput)) {
                                                                                    setMinYearInput(yrStr);
                                                                                    setMaxYearInput('');
                                                                                } else {
                                                                                    const minVal = parseInt(minYearInput);
                                                                                    if (d.year < minVal) {
                                                                                        setMinYearInput(yrStr);
                                                                                        setMaxYearInput(minYearInput);
                                                                                    } else {
                                                                                        setMaxYearInput(yrStr);
                                                                                    }
                                                                                }
                                                                            }
                                                                        }}
                                                                    >
                                                                        <div className="absolute bottom-full mb-1 hidden group-hover:block bg-black/85 border border-white/10 text-[9px] text-white px-2 py-0.5 rounded shadow-xl whitespace-nowrap z-50">
                                                                            {d.year}: {d.count} theses
                                                                        </div>
                                                                        <div
                                                                            className={`w-full rounded-t-sm transition-all duration-300 ${isSel ? 'bg-primary' : 'bg-gray-700/60 hover:bg-gray-600'}`}
                                                                            style={{ height: `${Math.max((d.count / maxTimelineCount) * 100, 8)}%` }}
                                                                        />
                                                                        <span className="text-[7.5px] text-gray-500 mt-1 select-none font-bold">
                                                                            {yrStr.slice(-2)}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <div className="text-[10px] text-gray-500 italic py-2 text-center">No years available</div>
                                                    )}

                                                    {/* Radio mode toggles */}
                                                    <div className="flex gap-4 mb-4">
                                                        <label className="flex items-center gap-1.5 text-xs font-semibold text-text-dim cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="yearMode"
                                                                checked={yearFilterMode === 'range'}
                                                                onChange={() => {
                                                                    setYearFilterMode('range');
                                                                    clearYearFilters();
                                                                }}
                                                                className="text-primary focus:ring-primary bg-surface border-gray-600 cursor-pointer animate-none"
                                                            />
                                                            <span>Range</span>
                                                        </label>
                                                        <label className="flex items-center gap-1.5 text-xs font-semibold text-text-dim cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="yearMode"
                                                                checked={yearFilterMode === 'single'}
                                                                onChange={() => {
                                                                    setYearFilterMode('single');
                                                                    clearYearFilters();
                                                                }}
                                                                className="text-primary focus:ring-primary bg-surface border-gray-600 cursor-pointer animate-none"
                                                            />
                                                            <span>Single Year</span>
                                                        </label>
                                                    </div>

                                                    {/* Min/Max Inputs */}
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <input
                                                            type="number"
                                                            placeholder="YYYY"
                                                            value={minYearInput}
                                                            onChange={(e) => setMinYearInput(e.target.value)}
                                                            className="w-full text-center py-1.5 bg-surface border border-border-custom rounded text-xs font-semibold text-foreground placeholder:text-gray-600 outline-none focus:border-primary"
                                                        />
                                                        {yearFilterMode === 'range' && (
                                                            <>
                                                                <span className="text-gray-500 text-xs">-</span>
                                                                <input
                                                                    type="number"
                                                                    placeholder="YYYY"
                                                                    value={maxYearInput}
                                                                    onChange={(e) => setMaxYearInput(e.target.value)}
                                                                    className="w-full text-center py-1.5 bg-surface border border-border-custom rounded text-xs font-semibold text-foreground placeholder:text-gray-600 outline-none focus:border-primary"
                                                                />
                                                            </>
                                                        )}
                                                    </div>

                                                    {/* Clear & Apply buttons */}
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={clearYearFilters}
                                                            className="flex-1 py-2 rounded bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 transition-colors cursor-pointer border-none"
                                                        >
                                                            Clear
                                                        </button>
                                                        <button
                                                            onClick={applyYearFilters}
                                                            className="flex-1 py-2 rounded bg-primary/10 border border-primary/30 hover:bg-primary/20 text-xs font-bold text-primary transition-all cursor-pointer"
                                                        >
                                                            Apply
                                                        </button>
                                                    </div>

                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Accordion: Course */}
                                <div className="bg-card border border-border-custom rounded-xl overflow-hidden shadow-sm">
                                    <button
                                        onClick={() => toggleAccordion('course')}
                                        className="w-full px-5 py-4 flex items-center justify-between font-bold text-sm text-foreground hover:bg-white/[0.02] cursor-pointer"
                                    >
                                        <span>Course</span>
                                        {expandedAccordions.course ? <FaChevronUp className="text-xs text-gray-400" /> : <FaChevronDown className="text-xs text-gray-400" />}
                                    </button>
                                    
                                    <AnimatePresence initial={false}>
                                        {expandedAccordions.course && (
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: 'auto' }}
                                                exit={{ height: 0 }}
                                                className="overflow-hidden border-t border-border-custom"
                                            >
                                                <div className="p-5 flex flex-col gap-2.5 max-h-60 overflow-y-auto custom-scrollbar">
                                                    {availableCourses.length > 0 ? (
                                                        availableCourses.map((c) => (
                                                            <label key={c.name} className="flex items-center gap-2.5 text-xs font-semibold text-text-dim cursor-pointer hover:text-white transition-colors">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedCourses.includes(c.name)}
                                                                    onChange={() => toggleCourse(c.name)}
                                                                    className="text-primary focus:ring-primary bg-surface border-gray-600 rounded cursor-pointer"
                                                                />
                                                                <span className="flex-1 truncate">{c.name}</span>
                                                                <span className="text-[10px] text-gray-500 font-bold bg-white/5 px-1.5 py-0.5 rounded">{c.count}</span>
                                                            </label>
                                                        ))
                                                    ) : (
                                                        <div className="text-[10px] text-gray-500 italic py-1 text-center">No courses found</div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Accordion: Author */}
                                <div className="bg-card border border-border-custom rounded-xl overflow-hidden shadow-sm">
                                    <button
                                        onClick={() => toggleAccordion('author')}
                                        className="w-full px-5 py-4 flex items-center justify-between font-bold text-sm text-foreground hover:bg-white/[0.02] cursor-pointer"
                                    >
                                        <span>Author</span>
                                        {expandedAccordions.author ? <FaChevronUp className="text-xs text-gray-400" /> : <FaChevronDown className="text-xs text-gray-400" />}
                                    </button>
                                    
                                    <AnimatePresence initial={false}>
                                        {expandedAccordions.author && (
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: 'auto' }}
                                                exit={{ height: 0 }}
                                                className="overflow-hidden border-t border-border-custom"
                                            >
                                                <div className="p-5 flex flex-col gap-2.5 max-h-60 overflow-y-auto custom-scrollbar">
                                                    {availableAuthors.length > 0 ? (
                                                        availableAuthors.map((a) => (
                                                            <label key={a.name} className="flex items-center gap-2.5 text-xs font-semibold text-text-dim cursor-pointer hover:text-white transition-colors">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedAuthors.includes(a.name)}
                                                                    onChange={() => toggleAuthor(a.name)}
                                                                    className="text-primary focus:ring-primary bg-surface border-gray-600 rounded cursor-pointer"
                                                                />
                                                                <span className="flex-1 truncate">{a.name}</span>
                                                                <span className="text-[10px] text-gray-500 font-bold bg-white/5 px-1.5 py-0.5 rounded">{a.count}</span>
                                                            </label>
                                                        ))
                                                    ) : (
                                                        <div className="text-[10px] text-gray-500 italic py-1 text-center">No authors found</div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                            </aside>

                            {/* RIGHT PANEL: MAIN RESULTS LISTING */}
                            <div className="flex-1 flex flex-col gap-5 min-w-0">
                                
                                {/* IEEE Metadata Bar */}
                                <div className="bg-card border border-border-custom rounded-xl p-5 flex flex-col gap-4 shadow-sm">
                                    <div className="flex items-center justify-between gap-4 flex-wrap">
                                        <div className="text-xs sm:text-sm font-semibold text-foreground flex flex-wrap items-center gap-1.5">
                                            Showing 1-{sortedFilteredResults.length} of {sortedFilteredResults.length} results
                                            {query && (
                                                <>
                                                    {" "}for{" "}
                                                    <span className="inline-flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded font-black text-xs">
                                                        {query}
                                                        <button
                                                            onClick={() => router.push('/search_result')}
                                                            className="text-red-400 hover:text-red-300 font-bold cursor-pointer bg-transparent border-none p-0 flex items-center justify-center text-[10px]"
                                                            title="Clear search query"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Select All & Sort By Row */}
                                    <div className="flex items-center justify-between border-t border-white/[0.04] pt-4 flex-wrap gap-3">
                                        <label className="flex items-center gap-2 text-xs font-bold text-text-dim cursor-pointer hover:text-white transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={selectAll}
                                                onChange={handleSelectAllChange}
                                                className="text-primary focus:ring-primary bg-surface border-gray-600 rounded cursor-pointer"
                                            />
                                            <span>Select All on Page</span>
                                        </label>

                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-text-dim uppercase tracking-wider">Sort By:</span>
                                            <select
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value)}
                                                className="py-1.5 px-3 rounded-lg border border-border-custom text-xs font-bold text-foreground bg-surface outline-none focus:border-primary cursor-pointer"
                                            >
                                                <option value="relevance">Relevance</option>
                                                <option value="newest">Newest Year</option>
                                                <option value="oldest">Oldest Year</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Results listing items */}
                                {sortedFilteredResults.length > 0 ? (
                                    <div className="flex flex-col gap-4">
                                        {sortedFilteredResults.map((thesis) => (
                                            <div
                                                key={thesis.id}
                                                className="bg-card rounded-xl border border-border-custom hover:border-primary/20 shadow-md p-5 flex flex-col sm:flex-row items-start gap-4 transition-all duration-300"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={!!selectedResults[thesis.id]}
                                                    onChange={() => handleCheckboxChange(thesis.id)}
                                                    className="mt-1.5 cursor-pointer rounded border-gray-600 bg-surface text-primary focus:ring-primary flex-shrink-0"
                                                />
                                                
                                                <div className="flex-1 min-w-0 flex flex-col">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <h3 className="font-bold text-lg text-sky-400 hover:text-sky-300 leading-snug">
                                                            <Link href={`/search_result?id=${thesis.id}`} className="hover:underline transition-colors">
                                                                {highlightText(thesis.title, query, keywordFilter)}
                                                            </Link>
                                                        </h3>
                                                        
                                                        {/* Open Access status tag */}
                                                        <div className="flex-shrink-0">
                                                            {thesis.attachments && thesis.attachments.length > 0 ? (
                                                                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                                                                    <FaUnlock className="text-[8px]" /> Open Access
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                                                    <FaLock className="text-[8px]" /> Restricted
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Authors */}
                                                    <div className="text-xs text-[#2DD4BF] font-semibold mt-1">
                                                        {thesis.author ? thesis.author.split(/;\s*/).join('; ') : 'Institutional Submission'}
                                                    </div>

                                                    {/* Metadata line */}
                                                    <div className="text-xs text-gray-400 mt-2 font-medium">
                                                        Year: {thesis.year_range || 'Archive'} | Course: {thesis.course || 'General'} | Downloads: {thesis.downloads || 0} | Publisher: TUPT Digital Archives
                                                    </div>

                                                    {/* Action Buttons Row */}
                                                    <div className="flex items-center gap-5 mt-4 pt-3 border-t border-white/[0.03]">
                                                        {/* Accordion trigger */}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setExpandedAbstracts(prev => ({
                                                                    ...prev,
                                                                    [thesis.id]: !prev[thesis.id]
                                                                }));
                                                            }}
                                                            className="flex items-center gap-1 text-xs font-black uppercase tracking-widest text-[#2DD4BF] hover:text-[#2DD4BF]/85 cursor-pointer bg-transparent border-none p-0"
                                                        >
                                                            {expandedAbstracts[thesis.id] ? (
                                                                <>Hide Abstract <FaChevronUp className="text-[9px]" /></>
                                                            ) : (
                                                                <>Abstract <FaChevronDown className="text-[9px]" /></>
                                                            )}
                                                        </button>

                                                        {/* PDF Download Button */}
                                                        {thesis.attachments && thesis.attachments.length > 0 && (
                                                            <button
                                                                onClick={async (e) => {
                                                                    e.stopPropagation();
                                                                    await handleDownloadClick(thesis);
                                                                    const url = thesis.attachments![0];
                                                                    const lowerUrl = url.toLowerCase();
                                                                    const isDoc = lowerUrl.endsWith('.pdf') || lowerUrl.endsWith('.docx') || lowerUrl.endsWith('.doc') || lowerUrl.includes('/raw/upload/');
                                                                    const targetUrl = isDoc
                                                                        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/download?url=${encodeURIComponent(url)}`
                                                                        : url;
                                                                    window.open(targetUrl, '_blank');
                                                                }}
                                                                className="flex items-center gap-1 text-xs font-bold text-[#F38BA8] hover:text-rose-350 cursor-pointer bg-transparent border-none p-0 flex items-center gap-1"
                                                                title="Download PDF"
                                                            >
                                                                <FaFilePdf className="text-xs" /> <span>PDF</span>
                                                            </button>
                                                        )}

                                                        {/* HTML / Quick View Button */}
                                                        <Link
                                                            href={`/search_result?id=${thesis.id}`}
                                                            className="flex items-center gap-1 text-xs font-bold text-sky-400 hover:text-sky-300 cursor-pointer ml-auto hover:underline"
                                                        >
                                                            <span>Quick View</span> <FaExternalLinkAlt className="text-[9px]" />
                                                        </Link>
                                                        
                                                        {/* Collaboration request button */}
                                                        {isUndergrad && thesis.createdBy && !thesis.isUploadedByUndergrad && String(thesis.createdBy) !== String(currentUser?._id) && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    if (thesis.hasRequestedCollaboration) return;
                                                                    setCollaborationThesis(thesis);
                                                                    setIsCollaborationModalOpen(true);
                                                                }}
                                                                disabled={thesis.hasRequestedCollaboration}
                                                                className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded transition-all active:scale-95 group z-20 ${thesis.hasRequestedCollaboration
                                                                    ? 'bg-gray-500/10 border border-gray-500/20 text-gray-500 cursor-not-allowed'
                                                                    : 'bg-[#2DD4BF]/5 border border-[#2DD4BF]/20 text-[#2DD4BF] hover:bg-[#2DD4BF]/10 hover:border-[#2DD4BF]/30'
                                                                }`}
                                                            >
                                                                <FaHandshake className={thesis.hasRequestedCollaboration ? "" : "group-hover:rotate-12 transition-transform"} />
                                                                <span>{thesis.hasRequestedCollaboration ? 'Proposal Sent' : 'Collaborate'}</span>
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Abstract content panel */}
                                                    <AnimatePresence>
                                                        {expandedAbstracts[thesis.id] && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.25 }}
                                                                className="overflow-hidden mt-3"
                                                            >
                                                                <div className="text-xs leading-relaxed text-gray-300 text-justify bg-white/[0.01] p-4 rounded-xl border border-white/5 whitespace-pre-line">
                                                                    {highlightText(thesis.abstract, query, keywordFilter)}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        <div className="mt-8 mb-4 text-center">
                                            <p className="text-xs text-gray-500 font-medium">
                                                Not finding what you need?{" "}
                                                <button
                                                    onClick={handleRecommendByAi}
                                                    className="text-primary hover:text-primary-hover font-bold hover:underline transition-all cursor-pointer inline-flex items-center gap-1.5 bg-transparent border-none p-0"
                                                >
                                                    <FaRobot className="text-[10px]" /> Let AI suggest titles and directions
                                                </button>
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        <div className="bg-card border border-border-custom rounded-xl p-12 text-center text-gray-400 font-medium text-xs">
                                            No items match the active filter criteria. Try clearing some filters.
                                        </div>
                                        <div className="mt-4 mb-2 text-center">
                                            <p className="text-xs text-gray-500 font-medium">
                                                Not finding the right research?{" "}
                                                <button
                                                    onClick={handleRecommendByAi}
                                                    className="text-primary hover:text-primary-hover font-bold hover:underline transition-all cursor-pointer inline-flex items-center gap-1.5 bg-transparent border-none p-0"
                                                >
                                                    <FaRobot className="text-[10px]" /> Let AI recommend titles and directions based on your search query
                                                </button>
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Recommended Projects Section */}
                                {recommendedProjects.length > 0 && (
                                    <div className="mt-12 pt-8 border-t border-border-custom/30 animate-fade-in">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                                <FaMagic className="text-primary text-sm animate-pulse" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-base text-white">Recommended Projects</h3>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Related research papers from search & filters</p>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {recommendedProjects.map((thesis) => (
                                                <div
                                                    key={`rec-${thesis.id}`}
                                                    className="bg-card rounded-xl border border-border-custom/50 hover:border-primary/20 p-5 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-md relative overflow-hidden group"
                                                >
                                                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    
                                                    <div className="flex flex-col">
                                                        <div className="flex items-start justify-between gap-2 mb-3">
                                                            <span className="text-[9px] font-black uppercase tracking-wider text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                                                                {thesis.course || 'General'}
                                                            </span>
                                                            <span className="text-[9px] font-bold text-gray-500">
                                                                {thesis.year_range || 'Archive'}
                                                            </span>
                                                        </div>
                                                        
                                                        <h4 className="font-bold text-xs text-sky-400 hover:text-sky-300 transition-colors line-clamp-2 mb-2">
                                                            <Link href={`/search_result?id=${thesis.id}`}>
                                                                {thesis.title}
                                                            </Link>
                                                        </h4>
                                                        
                                                        <p className="text-[10px] leading-relaxed text-gray-400 line-clamp-3 mb-4 text-justify">
                                                            {thesis.abstract}
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between border-t border-white/[0.03] pt-3 text-[9px] font-bold text-gray-500">
                                                        <span className="truncate max-w-[100px] italic">
                                                            By {thesis.author ? thesis.author.split(/;\s*/)[0] : 'Academic Group'}
                                                        </span>
                                                        <span className="text-[#2DD4BF] flex items-center gap-1">
                                                            {thesis.downloads || 0} downloads
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center p-20 text-center opacity-40 bg-card/50 rounded-3xl border border-border-custom"
                        >
                            <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mb-6 border border-primary/10">
                                <FaSearch className="text-3xl text-primary" />
                            </div>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/50 mb-2">Research Recommendation Report</h2>
                            <p className="mt-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest max-w-xs mx-auto">Execute search parameters to view the thesis repository inventory</p>
                            <Link href="/home" className="mt-10 px-8 py-3 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                Return to Portal
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <AiReportSidebar
                isOpen={isAiModalOpen && (!!aiRecommendation || !!localComparison)}
                onClose={() => setIsAiModalOpen(false)}
                query={query || ""}
                similarity={localComparison?.similarity}
                matchTitle={localComparison?.match?.title}
                recommendation={aiRecommendation || localComparison?.recommendation || ""}
                onSave={handleSavePrompt}
                isSaved={savedPromptSuccess}
                headerTitle="Archive Analysis Portal"
                headerSubtitle="Institutional Intelligence System"
            />

            {/* Status/Error Modal */}
            <AnimatePresence>
                {statusModal?.show && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] flex items-center justify-center backdrop-blur-md bg-black/40 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-card border border-white/10 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary" />

                            <div className="mb-6 flex justify-center">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                    <FaRobot className="text-primary text-2xl" />
                                </div>
                            </div>

                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Notification</h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-8">
                                {statusModal.message}
                            </p>

                            <button
                                onClick={() => setStatusModal(null)}
                                className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-primary/20"
                            >
                                Acknowledged
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Collaboration Request Modal */}
            <AnimatePresence>
                {isCollaborationModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-card border border-border-custom w-full max-w-lg rounded-3xl p-8 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Collaboration Request</h3>
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">Alumni to Student Proposal</p>
                                </div>
                                <button
                                    onClick={() => setIsCollaborationModalOpen(false)}
                                    className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-all"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="mb-6">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Your Message</label>
                                <textarea
                                    value={collaborationMessage}
                                    onChange={(e) => setCollaborationMessage(e.target.value)}
                                    placeholder="Explain why you want to collaborate on this thesis and how you can enhance it..."
                                    className="w-full h-40 bg-surface border border-border-custom rounded-2xl p-4 text-sm text-white outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all resize-none font-medium placeholder:text-gray-600"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setIsCollaborationModalOpen(false)}
                                    className="py-4 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:bg-white/5 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRequestCollaboration}
                                    disabled={isSubmittingCollaboration || !collaborationMessage.trim()}
                                    className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg flex items-center justify-center gap-2"
                                >
                                    {isSubmittingCollaboration ? (
                                        <>Intelligence Sending...</>
                                    ) : (
                                        <><FaHandshake /> Send Proposal</>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const SearchResultPage = () => {
    return (
        <Suspense fallback={
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-28 relative">
                <SearchResultSkeleton />
            </div>
        }>
            <SearchResultContent />
        </Suspense>
    );
};

export default SearchResultPage;