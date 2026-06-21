'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FaShieldAlt, FaFileContract, FaUserLock, FaDatabase, FaArrowLeft, FaChevronDown } from 'react-icons/fa';

const smoothEase: any = [0.22, 1, 0.36, 1];

interface PolicySection {
    id: string;
    title: string;
    icon: React.ReactNode;
    content: React.ReactNode;
}

export default function PrivacyPolicyPage() {
    const router = useRouter();
    const [activeSection, setActiveSection] = useState<string | null>('intro');

    const sections: PolicySection[] = [
        {
            id: 'intro',
            title: 'Introduction',
            icon: <FaFileContract className="text-primary text-lg" />,
            content: (
                <p className="text-sm text-white/70 leading-relaxed font-medium">
                    Welcome to the TUPT Thesis Archive. We respect your privacy and are committed to protecting the academic documents and personal information you share with us. This Privacy Policy explains how we collect, store, secure, and manage data when you submit, search, or access theses on our platform.
                </p>
            )
        },
        {
            id: 'collect',
            title: 'Information We Collect & Store',
            icon: <FaDatabase className="text-primary text-lg" />,
            content: (
                <div className="space-y-4">
                    <p className="text-sm text-white/70 leading-relaxed font-medium">
                        Because this platform is designed to archive and analyze academic theses, we collect the following types of information:
                    </p>
                    <ul className="list-disc pl-5 text-sm text-white/70 space-y-3 font-medium font-sans">
                        <li><strong className="text-white font-black">Account Information:</strong> When you register, we collect your full name, student ID number, birthdate, and account password.</li>
                        <li><strong className="text-white font-black">Thesis Documents:</strong> When you submit a thesis, we upload and store the thesis PDF file, title, abstract, authors, advisor names, courses, and submission years.</li>
                        <li><strong className="text-white font-black">System Data:</strong> Analytical models index abstract and text content to enable semantic searches and research insights.</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'security',
            title: 'Data Protection & Safety',
            icon: <FaUserLock className="text-primary text-lg" />,
            content: (
                <div className="space-y-4">
                    <p className="text-sm text-white/70 leading-relaxed font-medium">
                        We implement premium industry-standard measures to keep your data secure:
                    </p>
                    <ul className="list-disc pl-5 text-sm text-white/70 space-y-3 font-medium font-sans">
                        <li>Passwords and security answers are encrypted using cryptographically strong hashing algorithms (bcrypt) before storing.</li>
                        <li>Thesis PDF documents are stored in secure repositories with access permissions.</li>
                        <li>Access to account credentials and thesis edits is restricted to authorized university administrators and verified users.</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'rights',
            title: 'Academic Usage & Rights',
            icon: <FaShieldAlt className="text-primary text-lg" />,
            content: (
                <div className="space-y-4">
                    <p className="text-sm text-white/70 leading-relaxed font-medium">
                        All submitted theses are preserved for academic research, reference, and search indexes within the Technological University of the Philippines - Taguig campus.
                    </p>
                    <ul className="list-disc pl-5 text-sm text-white/70 space-y-3 font-medium font-sans">
                        <li>Students retain authorship credits for all submissions.</li>
                        <li>If you need to edit or withdraw a submitted thesis record, you may submit a request to the library/system administrators.</li>
                        <li>Abstracts and search query vectors are used solely for index search matching.</li>
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
                            Privacy Policy
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
