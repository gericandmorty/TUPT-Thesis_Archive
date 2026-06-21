'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaEnvelope,
    FaGithub,
    FaGlobe,
    FaChevronDown
} from 'react-icons/fa';

/* ───── Shared animation variants ───── */
const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15
        }
    }
};

const cardVariants: any = {
    hidden: { opacity: 0, y: 30 },
    show: { 
        opacity: 1, 
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 15
        }
    }
};

const smoothEase: any = [0.22, 1, 0.36, 1];

interface TeamMember {
    name: string;
    role: string;
    initials: string;
    gradient: string;
    skills: string[];
    bio: string;
    image: string;
    email: string;
    github?: string;
    portfolio?: string;
}

const teamMembers: TeamMember[] = [
    {
        name: 'Geric Morit',
        role: 'Web & Mobile App Developer',
        initials: 'GM',
        gradient: 'from-purple-500 via-[#8B5CF6] to-[#2DD4BF]',
        skills: ['Building Websites', 'Making Mobile Apps', 'Database Setup', 'Connecting Systems', 'Server Logic'],
        bio: 'Builds secure, fast, and easy-to-use websites and mobile apps, handling both what you see on screen and the database behind it.',
        image: '/assets/dev_pic/Morit.jpeg',
        email: 'gericmorit.dev@gmail.com',
        github: 'https://github.com/gericandmorty',
        portfolio: 'https://www.gericandmorty.codes/'
    },
    {
        name: 'Mico Gianan',
        role: 'QA Tester & Documentation',
        initials: 'MG',
        gradient: 'from-[#3B82F6] via-indigo-500 to-primary',
        skills: ['System Testing', 'Finding Bugs', 'User Testing', 'Writing Guides & Documents'],
        bio: 'Tests the application to find bugs, helps write guides, and checks that the system is easy and smooth for everyone to use.',
        image: '/assets/dev_pic/Gianan.png',
        email: 'micogianan28@gmail.com',
        github: 'https://github.com/manokkk'
    },
    {
        name: 'Krizel Anne Gone',
        role: 'Frontend Developer & Documentation',
        initials: 'KG',
        gradient: 'from-pink-500 via-rose-500 to-[#F97316]',
        skills: ['Designing Websites', 'UI/UX Design', 'Writing Guides & Documents', 'Page Layouts', 'Web Styling'],
        bio: 'Creates the visual look and feel of the website while writing guides and reports to explain how it works.',
        image: '/assets/dev_pic/Goñe.webp',
        email: 'krizelannegone08@gmail.com'
    },
    {
        name: 'Nicole Bacala',
        role: 'Frontend Developer & Documentation',
        initials: 'NB',
        gradient: 'from-[#F97316] via-amber-500 to-primary',
        skills: ['Website Layouts', 'Colors & Themes', 'Writing Guides & Documents', 'Web Design', 'Styling Pages'],
        bio: 'Designs and styles pages with beautiful layouts and colors, while helping write the project guides and documentation.',
        image: '/assets/dev_pic/Bacala.JPG',
        email: 'nicolebacala17@gmail.com'
    }
];

function DeveloperCard({
    member,
    isOpen,
    onToggle
}: {
    member: TeamMember;
    isOpen: boolean;
    onToggle: () => void;
}) {
    return (
        <motion.div
            variants={cardVariants}
            className="bg-card/30 backdrop-blur-xl border border-white/5 hover:border-primary/30 rounded-[2.5rem] shadow-2xl flex flex-col group transition-all duration-300 relative hover:shadow-[0_20px_50px_rgba(45,212,191,0.05)] hover:bg-card/40 hover:-translate-y-1.5 overflow-hidden h-fit"
        >
            {/* Large Highlighted Developer Image Card Header */}
            <div className="w-full h-[260px] md:h-[300px] relative overflow-hidden bg-[#1e1e2e]/60">
                {member.image ? (
                    <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${member.gradient} flex items-center justify-center`}>
                        <span className="text-white font-extrabold text-4xl tracking-tighter">
                            {member.initials}
                        </span>
                    </div>
                )}
                
                {/* Seamless dark gradient overlay on the image */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1b1b2f] via-transparent to-transparent opacity-90" />

                {/* Floating Contact/Social overlay links */}
                <div className="absolute bottom-6 left-6 flex items-center gap-3 z-20">
                    <a
                        href={`mailto:${member.email}`}
                        className="w-9 h-9 rounded-xl bg-white/10 hover:bg-primary hover:text-background text-white flex items-center justify-center border border-white/5 shadow-md backdrop-blur-sm transition-all duration-300 active:scale-90 cursor-pointer"
                        title={`Email ${member.name}`}
                    >
                        <FaEnvelope className="text-xs" />
                    </a>
                    {member.github && (
                        <a
                            href={member.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#2DD4BF] hover:text-background text-white flex items-center justify-center border border-white/5 shadow-md backdrop-blur-sm transition-all duration-300 active:scale-90 cursor-pointer"
                            title="GitHub Profile"
                        >
                            <FaGithub className="text-sm" />
                        </a>
                    )}
                    {member.portfolio && (
                        <a
                            href={member.portfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#2DD4BF] hover:text-background text-white flex items-center justify-center border border-white/5 shadow-md backdrop-blur-sm transition-all duration-300 active:scale-90 cursor-pointer"
                            title="Portfolio Website"
                        >
                            <FaGlobe className="text-xs" />
                        </a>
                    )}
                </div>
            </div>

            {/* Developer Details Body */}
            <div className="p-8 md:p-9 flex-grow flex flex-col justify-between min-h-[300px] sm:min-h-[320px] md:min-h-[340px] lg:min-h-[410px] xl:min-h-[360px]">
                <div className="space-y-4">
                    <div>
                        <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-1">
                            {member.name}
                        </h3>
                        <span className="inline-block text-[11px] md:text-xs text-primary font-bold uppercase tracking-[0.15em]">
                            {member.role}
                        </span>
                    </div>

                    <p className="text-xs md:text-sm text-white/70 leading-relaxed font-medium">
                        {member.bio}
                    </p>
                </div>

                {/* Collapsible Action and Section */}
                <div className="mt-8">
                    <button
                        onClick={onToggle}
                        className={`w-full py-3 rounded-xl bg-white/[0.03] hover:bg-primary/10 hover:text-primary text-white/50 text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/5 hover:border-primary/20 ${isOpen ? 'text-primary bg-primary/5 border-primary/20' : ''}`}
                    >
                        {isOpen ? 'Hide Tech Skills' : 'View Tech Skills'}
                        <FaChevronDown className={`text-[8px] transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
                    </button>

                    <AnimatePresence initial={false}>
                        {isOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }}
                                className="overflow-hidden"
                            >
                                <div className="pt-6">
                                    <div className="flex flex-wrap gap-2">
                                        {member.skills.map((skill) => (
                                            <span
                                                key={skill}
                                                className="px-3 py-1 rounded-lg border border-white/5 bg-white/[0.02] text-white/50 text-[9px] md:text-[10px] font-bold uppercase tracking-wider hover:border-primary/10 hover:bg-primary/[0.01] hover:text-[#2DD4BF] transition-all"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}

export default function AboutPage() {
    const [expandedMember, setExpandedMember] = useState<string | null>(null);

    return (
        <div className="flex-1 relative py-16 min-h-screen">
            <div className="flex-grow flex flex-col items-center relative px-6 md:px-12 pt-12 pb-20">
                <div className="max-w-[1440px] w-full flex flex-col relative z-10">
                    {/* Headline Section */}
                    <div className="text-center mb-16 space-y-4">
                        
                        <motion.h1 
                            className="text-4xl md:text-6xl font-black text-white tracking-tight uppercase leading-none"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1, ease: smoothEase }}
                        >
                            Meet Our Dev Team
                        </motion.h1>
                        
                        <motion.p 
                            className="text-sm md:text-base text-white/50 font-medium max-w-xl mx-auto leading-relaxed"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2, ease: smoothEase }}
                        >
                            The creators behind the TUPT Thesis Archive — bringing AI-powered research analysis and systematic search engines to TUP-Taguig.
                        </motion.p>
                    </div>

                    {/* Team Members Grid */}
                    <motion.div 
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start w-full"
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                    >
                        {teamMembers.map((member) => (
                            <DeveloperCard 
                                key={member.name} 
                                member={member} 
                                isOpen={expandedMember === member.name}
                                onToggle={() => setExpandedMember(expandedMember === member.name ? null : member.name)}
                            />
                        ))}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
