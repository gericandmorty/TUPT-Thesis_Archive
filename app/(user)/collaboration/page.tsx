'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaHandshake, 
    FaCheck, 
    FaTimes, 
    FaClock, 
    FaUser, 
    FaBook, 
    FaEnvelopeOpenText,
    FaArrowRight,
    FaLink,
    FaPaperPlane,
    FaAddressCard,
    FaCheckCircle,
    FaEdit,
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function CollaborationPage() {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
    const [myRequests, setMyRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Follow-up state: tracks which card is open and input value
    const [followUpOpen, setFollowUpOpen] = useState<Record<string, boolean>>({});
    const [followUpText, setFollowUpText] = useState<Record<string, string>>({});
    const [followUpSubmitting, setFollowUpSubmitting] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const userData = localStorage.getItem('userData');
        if (userData) {
            const user = JSON.parse(userData);
            setCurrentUser(user);
            fetchData(user);
        }
    }, []);

    const fetchData = async (user: any) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            if (!user.isGraduate) {
                const res = await fetch(`${API_BASE_URL}/collaboration/my-requests`, { headers });
                const data = await res.json();
                if (res.ok) setMyRequests(data.data);
            } else {
                const [inRes, myRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/collaboration/incoming`, { headers }),
                    fetch(`${API_BASE_URL}/collaboration/my-requests`, { headers }),
                ]);
                const inData = await inRes.json();
                const myData = await myRes.json();
                if (inRes.ok) setIncomingRequests(inData.data);
                if (myRes.ok) setMyRequests(myData.data);
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch collaboration data');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (requestId: string, status: 'accepted' | 'declined') => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/collaboration/${requestId}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                toast.success(`Request ${status} successfully`);
                setIncomingRequests(prev => prev.map(req => 
                    req._id === requestId ? { ...req, status } : req
                ));
            } else {
                const data = await res.json();
                toast.error(data.message || 'Failed to update request');
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred');
        }
    };

    const handleFollowUpSubmit = async (requestId: string) => {
        const msg = followUpText[requestId]?.trim();
        if (!msg) {
            toast.error('Please enter your contact/social info');
            return;
        }

        setFollowUpSubmitting(prev => ({ ...prev, [requestId]: true }));
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/collaboration/${requestId}/followup`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ followUpMessage: msg }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Contact info shared! The student has been notified.');
                setMyRequests(prev => prev.map(req =>
                    req._id === requestId ? { ...req, followUpMessage: msg } : req
                ));
                setFollowUpOpen(prev => ({ ...prev, [requestId]: false }));
            } else {
                toast.error(data.message || 'Failed to send follow-up');
            }
        } catch (err) {
            toast.error('An error occurred');
        } finally {
            setFollowUpSubmitting(prev => ({ ...prev, [requestId]: false }));
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'accepted': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'declined': return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'accepted': return <FaCheck className="text-[10px]" />;
            case 'declined': return <FaTimes className="text-[10px]" />;
            default: return <FaClock className="text-[10px]" />;
        }
    };

    // Alumni has incoming (their thesis got requests) + outgoing (their own requests)
    const alumniIncoming = currentUser?.isGraduate ? incomingRequests : [];
    const alumniOutgoing = currentUser?.isGraduate ? myRequests : [];

    return (
        <div className="min-h-screen bg-background p-8 pt-28">
            <div className="max-w-6xl mx-auto">
                <header className="mb-12">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4 mb-4"
                    >
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                            <FaHandshake className="text-2xl text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white uppercase tracking-tight">Collaboration Portal</h1>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Research Collaboration</p>
                        </div>
                    </motion.div>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 opacity-20">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Loading requests...</p>
                    </div>
                ) : (
                    <div className="space-y-16">
                        {/* ── Alumni: Incoming requests to their thesis ── */}
                        {currentUser?.isGraduate && (
                            <section>
                                <div className="flex items-center gap-3 mb-8">
                                    <h2 className="text-sm font-black text-white uppercase tracking-widest">Incoming Requests</h2>
                                    <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded-lg border border-primary/20">
                                        {alumniIncoming.length}
                                    </span>
                                </div>

                                <AnimatePresence mode="popLayout">
                                    {alumniIncoming.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {alumniIncoming.map((req, index) => (
                                                <motion.div
                                                    key={req._id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="bg-card border border-border-custom rounded-3xl p-6 hover:shadow-2xl hover:border-primary/20 transition-all group"
                                                >
                                                    <div className="flex items-center gap-4 mb-6">
                                                        <div className="w-12 h-12 rounded-xl bg-surface border border-border-custom flex items-center justify-center overflow-hidden">
                                                            {req.alumni?.profilePhoto ? (
                                                                <img src={req.alumni.profilePhoto} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <FaUser className="text-gray-600" />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="text-sm font-bold text-white truncate">{req.alumni?.name}</h3>
                                                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                                                                {req.alumni?.isGraduate ? 'Alumni' : 'Student'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="bg-surface/50 rounded-2xl p-4 border border-border-custom/50 mb-6">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <FaBook className="text-[10px] text-gray-500" />
                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Thesis Title</span>
                                                        </div>
                                                        <p className="text-[11px] font-bold text-white line-clamp-2 leading-relaxed">
                                                            {req.thesis?.title}
                                                        </p>
                                                    </div>

                                                    <div className="mb-6">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <FaEnvelopeOpenText className="text-[10px] text-primary" />
                                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Message</span>
                                                        </div>
                                                        <p className="text-[12px] text-gray-400 font-medium leading-relaxed italic border-l-2 border-primary/20 pl-4 py-1">
                                                            "{req.message}"
                                                        </p>
                                                    </div>

                                                    {req.status === 'pending' ? (
                                                        <div className="flex flex-col gap-2">
                                                            <button 
                                                                onClick={() => handleUpdateStatus(req._id, 'accepted')}
                                                                className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20"
                                                            >
                                                                Accept Collaboration
                                                            </button>
                                                            <button 
                                                                onClick={() => handleUpdateStatus(req._id, 'declined')}
                                                                className="w-full py-2.5 rounded-xl border border-white/5 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 text-[10px] font-black uppercase tracking-widest transition-all text-white/30"
                                                            >
                                                                Decline
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <div className={`flex items-center justify-center gap-2 py-3 rounded-xl border ${getStatusStyle(req.status)} text-[10px] font-black uppercase tracking-widest mb-4`}>
                                                                {getStatusIcon(req.status)} {req.status}
                                                            </div>

                                                            {/* Follow-up contact section for alumni to share socials */}
                                                            {req.status === 'accepted' && (
                                                                <div className="mt-2">
                                                                    {req.followUpMessage ? (
                                                                        /* Already submitted */
                                                                        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
                                                                            <div className="flex items-center justify-between mb-2">
                                                                                <div className="flex items-center gap-2">
                                                                                    <FaCheckCircle className="text-primary text-[11px]" />
                                                                                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">Contact Info Shared</span>
                                                                                </div>
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setFollowUpText(prev => ({ ...prev, [req._id]: req.followUpMessage }));
                                                                                        setFollowUpOpen(prev => ({ ...prev, [req._id]: true }));
                                                                                    }}
                                                                                    className="text-[9px] font-black text-white/30 hover:text-primary uppercase tracking-widest flex items-center gap-1 transition-colors"
                                                                                >
                                                                                    <FaEdit className="text-[9px]" /> Edit
                                                                                </button>
                                                                            </div>
                                                                            <p className="text-[11px] text-white/60 leading-relaxed font-medium italic">
                                                                                {req.followUpMessage}
                                                                            </p>
                                                                        </div>
                                                                    ) : followUpOpen[req._id] ? (
                                                                        /* Input form open */
                                                                        <AnimatePresence>
                                                                            <motion.div
                                                                                initial={{ opacity: 0, y: 6 }}
                                                                                animate={{ opacity: 1, y: 0 }}
                                                                                exit={{ opacity: 0, y: 6 }}
                                                                                className="bg-surface/60 border border-primary/20 rounded-2xl p-4"
                                                                            >
                                                                                <div className="flex items-center gap-2 mb-3">
                                                                                    <FaAddressCard className="text-primary text-[11px]" />
                                                                                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">Share Your Contact / Socials</span>
                                                                                </div>
                                                                                <textarea
                                                                                    rows={3}
                                                                                    value={followUpText[req._id] || ''}
                                                                                    onChange={e => setFollowUpText(prev => ({ ...prev, [req._id]: e.target.value }))}
                                                                                    placeholder="e.g. Facebook: John Doe · Email: johndoe@gmail.com · LinkedIn: linkedin.com/in/johndoe"
                                                                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[11px] text-white placeholder-white/20 resize-none focus:outline-none focus:border-primary/50 transition-colors leading-relaxed font-medium mb-3"
                                                                                />
                                                                                <div className="flex gap-2">
                                                                                    <button
                                                                                        onClick={() => setFollowUpOpen(prev => ({ ...prev, [req._id]: false }))}
                                                                                        className="flex-1 py-2.5 rounded-xl border border-white/5 text-white/30 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
                                                                                    >
                                                                                        Cancel
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => handleFollowUpSubmit(req._id)}
                                                                                        disabled={followUpSubmitting[req._id]}
                                                                                        className="flex-1 bg-primary hover:bg-primary-hover text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                                                                                    >
                                                                                        <FaPaperPlane className="text-[10px]" />
                                                                                        {followUpSubmitting[req._id] ? 'Sending...' : 'Send'}
                                                                                    </button>
                                                                                </div>
                                                                            </motion.div>
                                                                        </AnimatePresence>
                                                                    ) : (
                                                                        /* Prompt to share */
                                                                        <button
                                                                            onClick={() => setFollowUpOpen(prev => ({ ...prev, [req._id]: true }))}
                                                                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/5 transition-all"
                                                                        >
                                                                            <FaLink className="text-[10px]" />
                                                                            Share Contact / Socials
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-32 bg-card/10 rounded-3xl border border-dashed border-white/5 opacity-40">
                                            <FaClock className="text-4xl text-gray-500 mb-4" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No active requests found</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </section>
                        )}

                        {/* ── Alumni: Their own sent requests (with follow-up) ── */}
                        {currentUser?.isGraduate && alumniOutgoing.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-8">
                                    <h2 className="text-sm font-black text-white uppercase tracking-widest">My Sent Requests</h2>
                                    <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded-lg border border-primary/20">
                                        {alumniOutgoing.length}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {alumniOutgoing.map((req, index) => (
                                        <motion.div
                                            key={req._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="bg-card border border-border-custom rounded-3xl p-6 hover:shadow-2xl hover:border-primary/20 transition-all"
                                        >
                                            <div className="flex items-center justify-between mb-6">
                                                <div className={`px-3 py-1.5 rounded-xl border ${getStatusStyle(req.status)} flex items-center gap-2 text-[9px] font-black uppercase tracking-widest shadow-sm`}>
                                                    {getStatusIcon(req.status)} {req.status}
                                                </div>
                                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">ID: {req._id.slice(-6)}</span>
                                            </div>

                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 rounded-xl bg-surface border border-border-custom flex items-center justify-center overflow-hidden">
                                                    {req.undergrad?.profilePhoto ? (
                                                        <img src={req.undergrad.profilePhoto} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <FaUser className="text-gray-600" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">To</span>
                                                        <FaArrowRight className="text-[8px] text-gray-600" />
                                                    </div>
                                                    <h3 className="text-sm font-bold text-white truncate">{req.undergrad?.name}</h3>
                                                </div>
                                            </div>

                                            <div className="bg-surface/50 rounded-2xl p-4 border border-border-custom/50 mb-6">
                                                <p className="text-[11px] font-bold text-primary line-clamp-2 leading-relaxed">
                                                    {req.thesis?.title}
                                                </p>
                                            </div>

                                            {/* Follow-up contact section — only on accepted */}
                                            {req.status === 'accepted' && (
                                                <div className="mt-2">
                                                    {req.followUpMessage ? (
                                                        /* Already submitted */
                                                        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <FaCheckCircle className="text-primary text-[11px]" />
                                                                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">Contact Info Shared</span>
                                                                </div>
                                                                <button
                                                                    onClick={() => {
                                                                        setFollowUpText(prev => ({ ...prev, [req._id]: req.followUpMessage }));
                                                                        setFollowUpOpen(prev => ({ ...prev, [req._id]: true }));
                                                                    }}
                                                                    className="text-[9px] font-black text-white/30 hover:text-primary uppercase tracking-widest flex items-center gap-1 transition-colors"
                                                                >
                                                                    <FaEdit className="text-[9px]" /> Edit
                                                                </button>
                                                            </div>
                                                            <p className="text-[11px] text-white/60 leading-relaxed font-medium italic">
                                                                {req.followUpMessage}
                                                            </p>
                                                        </div>
                                                    ) : followUpOpen[req._id] ? (
                                                        /* Input form open */
                                                        <AnimatePresence>
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 6 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: 6 }}
                                                                className="bg-surface/60 border border-primary/20 rounded-2xl p-4"
                                                            >
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <FaAddressCard className="text-primary text-[11px]" />
                                                                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">Share Your Contact / Socials</span>
                                                                </div>
                                                                <textarea
                                                                    rows={3}
                                                                    value={followUpText[req._id] || ''}
                                                                    onChange={e => setFollowUpText(prev => ({ ...prev, [req._id]: e.target.value }))}
                                                                    placeholder="e.g. Facebook: John Doe · Email: johndoe@gmail.com · LinkedIn: linkedin.com/in/johndoe"
                                                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[11px] text-white placeholder-white/20 resize-none focus:outline-none focus:border-primary/50 transition-colors leading-relaxed font-medium mb-3"
                                                                />
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => setFollowUpOpen(prev => ({ ...prev, [req._id]: false }))}
                                                                        className="flex-1 py-2.5 rounded-xl border border-white/5 text-white/30 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleFollowUpSubmit(req._id)}
                                                                        disabled={followUpSubmitting[req._id]}
                                                                        className="flex-1 bg-primary hover:bg-primary-hover text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                                                                    >
                                                                        <FaPaperPlane className="text-[10px]" />
                                                                        {followUpSubmitting[req._id] ? 'Sending...' : 'Send'}
                                                                    </button>
                                                                </div>
                                                            </motion.div>
                                                        </AnimatePresence>
                                                    ) : (
                                                        /* Prompt to share */
                                                        <button
                                                            onClick={() => setFollowUpOpen(prev => ({ ...prev, [req._id]: true }))}
                                                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/5 transition-all"
                                                        >
                                                            <FaLink className="text-[10px]" />
                                                            Share Contact / Socials
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* ── Undergrad: My requests view ── */}
                        {!currentUser?.isGraduate && (
                            <section>
                                <div className="flex items-center gap-3 mb-8">
                                    <h2 className="text-sm font-black text-white uppercase tracking-widest">My Requests</h2>
                                    <span className="px-2 py-0.5 bg-[#2DD4BF]/20 text-[#2DD4BF] text-[10px] font-bold rounded-lg border border-[#2DD4BF]/20">
                                        {myRequests.length}
                                    </span>
                                </div>

                                <AnimatePresence mode="popLayout">
                                    {myRequests.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {myRequests.map((req, index) => (
                                                <motion.div
                                                    key={req._id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="bg-card border border-border-custom rounded-3xl p-6 hover:shadow-2xl hover:border-[#2DD4BF]/20 transition-all group"
                                                >
                                                    <div className="flex items-center justify-between mb-6">
                                                        <div className={`px-3 py-1.5 rounded-xl border ${getStatusStyle(req.status)} flex items-center gap-2 text-[9px] font-black uppercase tracking-widest shadow-sm`}>
                                                            {getStatusIcon(req.status)} {req.status}
                                                        </div>
                                                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Proposal ID: {req._id.slice(-6)}</span>
                                                    </div>

                                                    <div className="flex items-center gap-3 mb-6">
                                                        <div className="w-10 h-10 rounded-xl bg-surface border border-border-custom flex items-center justify-center overflow-hidden">
                                                            {req.undergrad?.profilePhoto ? (
                                                                <img src={req.undergrad.profilePhoto} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <FaUser className="text-gray-600" />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Request To</span>
                                                                <FaArrowRight className="text-[8px] text-gray-600" />
                                                            </div>
                                                            <h3 className="text-sm font-bold text-white truncate">{req.undergrad?.name}</h3>
                                                            <span className="text-[9px] font-bold text-[#2DD4BF] uppercase tracking-widest">
                                                                {req.undergrad?.isGraduate ? 'Alumni' : 'Student'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="bg-surface/50 rounded-2xl p-4 border border-border-custom/50 mb-6">
                                                        <p className="text-[11px] font-bold text-[#2DD4BF] line-clamp-2 leading-relaxed">
                                                            {req.thesis?.title}
                                                        </p>
                                                    </div>

                                                    <div className="pt-4 border-t border-white/5">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sent Message</span>
                                                        </div>
                                                        <p className="text-[11px] text-gray-400 font-medium leading-relaxed italic line-clamp-3">
                                                            "{req.message}"
                                                        </p>

                                                        {/* Show alumni's contact info if they shared it */}
                                                        {req.status === 'accepted' && req.followUpMessage && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 8 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                className="mt-4 bg-primary/5 border border-primary/20 rounded-2xl p-4"
                                                            >
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <FaAddressCard className="text-primary text-[11px]" />
                                                                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">Alumni Contact Info</span>
                                                                </div>
                                                                <p className="text-[11px] text-white/70 leading-relaxed font-medium whitespace-pre-wrap">
                                                                    {req.followUpMessage}
                                                                </p>
                                                            </motion.div>
                                                        )}

                                                        {req.status === 'accepted' && !req.followUpMessage && (
                                                            <div className="mt-4 flex items-center gap-2 py-2.5 px-3 rounded-xl bg-white/[0.03] border border-white/5">
                                                                <FaClock className="text-[10px] text-white/20" />
                                                                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Waiting for alumni contact info…</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-32 bg-card/10 rounded-3xl border border-dashed border-white/5 opacity-40">
                                            <FaHandshake className="text-4xl text-gray-500 mb-4" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No active requests found</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
