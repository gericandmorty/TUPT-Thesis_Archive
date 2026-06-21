'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FaShieldAlt, FaGavel, FaUserCheck, FaBook, FaArrowLeft, FaChevronDown } from 'react-icons/fa';

const smoothEase: any = [0.22, 1, 0.36, 1];

interface TermsSection {
    id: string;
    title: string;
    icon: React.ReactNode;
    content: React.ReactNode;
}

export default function TermsOfServicePage() {
    const router = useRouter();
    const [activeSection, setActiveSection] = useState<string | null>('agreement');

    const sections: TermsSection[] = [
        {
            id: 'agreement',
            title: 'Agreement to Terms',
            icon: <FaGavel className="text-primary text-lg" />,
            content: (
                <p className="text-sm text-white/70 leading-relaxed font-medium">
                    By accessing or using the TUPT Thesis Archive, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, you should not access or use the platform. These rules ensure a respectful, safe, and academically honest environment for all members of the TUP-Taguig community.
                </p>
            )
        },
        {
            id: 'accounts',
            title: 'User Accounts & Integrity',
            icon: <FaUserCheck className="text-primary text-lg" />,
            content: (
                <div className="space-y-4">
                    <p className="text-sm text-white/70 leading-relaxed font-medium">
                        To access full search analysis and thesis upload features, you must maintain active student or faculty credentials:
                    </p>
                    <ul className="list-disc pl-5 text-sm text-white/70 space-y-3 font-medium font-sans">
                        <li><strong className="text-white font-black">Account Security:</strong> You are responsible for keeping your login credentials confidential. Sharing accounts is strictly prohibited.</li>
                        <li><strong className="text-white font-black">Verification:</strong> Users must register using their valid Technological University of the Philippines ID numbers. Fake or misleading credentials will lead to immediate account suspension.</li>
                        <li><strong className="text-white font-black">Admin Approval:</strong> New student accounts are subject to administrative approval before accessing repository features.</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'submissions',
            title: 'Submissions & Academic Credit',
            icon: <FaBook className="text-primary text-lg" />,
            content: (
                <div className="space-y-4">
                    <p className="text-sm text-white/70 leading-relaxed font-medium">
                        When uploading research papers to the archive, you agree to maintain academic honesty and school regulations:
                    </p>
                    <ul className="list-disc pl-5 text-sm text-white/70 space-y-3 font-medium font-sans">
                        <li><strong className="text-white font-black">Originality:</strong> All uploaded thesis materials must represent original academic works by the listed student authors. Plagiarism or copyright violations are strictly banned.</li>
                        <li><strong className="text-white font-black">Usage Licenses:</strong> By submitting, you grant the Technological University of the Philippines Taguig Campus the right to host, index, and analyze the document abstract for research reference.</li>
                        <li><strong className="text-white font-black">Document Formats:</strong> Uploaded materials must comply with TUPT formatting standards and be submitted in the requested PDF format.</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'conduct',
            title: 'Acceptable Platform Conduct',
            icon: <FaShieldAlt className="text-primary text-lg" />,
            content: (
                <div className="space-y-4">
                    <p className="text-sm text-white/70 leading-relaxed font-medium">
                        Users agree to use the archive solely for genuine research and learning purposes:
                    </p>
                    <ul className="list-disc pl-5 text-sm text-white/70 space-y-3 font-medium font-sans">
                        <li>No automated data scraping, crawling, or downloading of database records is allowed without express administrative permission.</li>
                        <li>Do not engage in activities designed to disrupt the platform infrastructure, bypass authentication systems, or execute security scans.</li>
                        <li>Any violations of platform safety will result in access revocation and referral to university disciplinary authorities.</li>
                    </ul>
                </div>
            )
        }
    ];

    const toggleSection = (id: string) => {
        setActiveSection(activeSection === id ? null : id);
    };

    return (
        <div className="flex-1 relative py-16 min-h-screen">
            <div className="flex-grow flex flex-col items-center relative px-6 md:px-12 pt-12 pb-20">
                <div className="max-w-[1000px] w-full flex flex-col relative z-10">
                    
                    {/* Back Button */}
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: smoothEase }}
                        className="mb-8"
                    >
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-white/50 hover:text-primary text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer group"
                        >
                            <FaArrowLeft className="text-[10px] transition-transform group-hover:-translate-x-1" />
                            Go Back
                        </button>
                    </motion.div>

                    {/* Headline Section */}
                    <div className="text-center mb-16 space-y-4">
                        <motion.h1 
                            className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase leading-none"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1, ease: smoothEase }}
                        >
                            Terms of Service
                        </motion.h1>
                    </div>

                    {/* Collapsible Accordion Sections */}
                    <motion.div
                        className="w-full space-y-4"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: smoothEase }}
                    >
                        {sections.map((section) => {
                            const isOpen = activeSection === section.id;
                            return (
                                <div
                                    key={section.id}
                                    className="bg-card/30 backdrop-blur-xl border border-white/5 hover:border-primary/20 rounded-2xl shadow-xl overflow-hidden transition-all duration-300"
                                >
                                    {/* Accordion Header Toggle */}
                                    <button
                                        onClick={() => toggleSection(section.id)}
                                        className="w-full p-6 flex items-center justify-between cursor-pointer hover:bg-white/[0.01] transition-colors focus:outline-none"
                                        aria-expanded={isOpen}
                                    >
                                        <div className="flex items-center gap-4 text-base font-black text-white uppercase tracking-wider animate-none">
                                            {section.icon}
                                            <span>{section.title}</span>
                                        </div>
                                        <FaChevronDown 
                                            className={`text-white/40 text-xs transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`}
                                        />
                                    </button>

                                    {/* Accordion Content Panel */}
                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-6 pb-6 border-t border-white/5 pt-6 bg-white/[0.005]">
                                                    {section.content}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}

                        {/* Footer note */}
                        <p className="text-center text-[11px] text-white/40 font-bold uppercase tracking-widest pt-8">
                            Technological University of the Philippines Taguig Campus &bull; Thesis Archive Project
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
