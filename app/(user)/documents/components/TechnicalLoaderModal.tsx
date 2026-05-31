"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { FaSpinner, FaCheckCircle, FaDatabase, FaGlobe, FaBrain, FaFileAlt, FaTerminal } from 'react-icons/fa';

interface TechnicalLoaderModalProps {
    isUploading: boolean;
    uploadStep: number;
}

export const TechnicalLoaderModal: React.FC<TechnicalLoaderModalProps> = ({ isUploading, uploadStep }) => {
    const consoleRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent body scrolling when loader is active
    useEffect(() => {
        if (isUploading) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isUploading]);

    const stages = [
        {
            title: "Reading File",
            status: "running",
            icon: <FaFileAlt />,
            desc: "Extracting text content from the file"
        },
        {
            title: "Local Plagiarism Scan",
            status: "pending",
            icon: <FaDatabase />,
            desc: "Checking word patterns against local files"
        },
        {
            title: "AI Rephrasing Scan",
            status: "pending",
            icon: <FaBrain />,
            desc: "Finding rephrased sentences and AI rewritten text"
        },
        {
            title: "Web Database Scan",
            status: "pending",
            icon: <FaGlobe />,
            desc: "Checking sentences against public web search results"
        }
    ];

    // Map the 6 uploadSteps (0 to 5) to the 4 main dashboard stages
    let activeStageIndex = 0;
    if (uploadStep === 0) activeStageIndex = 0;
    else if (uploadStep === 1 || uploadStep === 2) activeStageIndex = 1;
    else if (uploadStep === 3 || uploadStep === 4) activeStageIndex = 2;
    else if (uploadStep === 5) activeStageIndex = 3;

    const stagesWithStatus = stages.map((stage, idx) => {
        if (idx < activeStageIndex) {
            return { ...stage, status: "completed" };
        } else if (idx === activeStageIndex) {
            return { ...stage, status: "running" };
        } else {
            return { ...stage, status: "pending" };
        }
    });

    const logs = [
        // Stage 0 logs
        [
            "Reading document file...",
            "Extracting text content...",
            "Text successfully extracted."
        ],
        // Stage 1 logs
        [
            "Loading local database records...",
            "Counting word frequencies...",
            "Comparing word scores...",
            "Searching local files for matching paragraphs..."
        ],
        // Stage 2 logs
        [
            "Loading AI matching system...",
            "Analyzing sentence meaning patterns...",
            "Finding rephrased text segments...",
            "Running deep semantic comparison..."
        ],
        // Stage 3 logs
        [
            "Searching public web databases...",
            "Retrieving matching web page links...",
            "Calculating similarity percentage with online sources...",
            "Filtering out common phrases...",
            "Plagiarism analysis completed successfully."
        ]
    ];

    // Aggregate logs up to current step
    const visibleLogs: string[] = [];
    for (let i = 0; i <= activeStageIndex; i++) {
        const stageLogs = logs[i];
        visibleLogs.push(...stageLogs);
    }

    useEffect(() => {
        if (consoleRef.current) {
            consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
        }
    }, [visibleLogs.length]);

    // Active Mathematical Formula display
    const formulas = [
        {
            title: "Document Splitter",
            equation: "Document = List of Sentences",
            explanation: "Splits the text into separate sentences to check each one."
        },
        {
            title: "Word Score Calculator",
            equation: "Similarity Score = Shared Words / Unique Words",
            explanation: "Measures exact matches of unique words against other documents."
        },
        {
            title: "AI Meaning Comparison",
            equation: "Match Rate = AI Context Score",
            explanation: "Analyzes the overall meaning of sentences, not just matching words."
        },
        {
            title: "Web Match Rate",
            equation: "Match % = Web Matches / Total Sentences",
            explanation: "Calculates the percentage of text copied from web pages."
        }
    ];

    const currentFormula = formulas[activeStageIndex] || formulas[0];

    const progressPercentage = Math.round((uploadStep / 5) * 100);

    if (!mounted || !isUploading) return null;

    return createPortal(
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6 backdrop-blur-xl bg-black/75 pointer-events-auto"
        >
            <motion.div
                initial={{ scale: 0.97, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.97, opacity: 0, y: 15 }}
                transition={{ type: "spring", damping: 28, stiffness: 240 }}
                className="bg-zinc-950 border border-white/10 rounded-[2rem] w-full max-w-5xl h-[80vh] min-h-[500px] flex flex-col overflow-hidden shadow-2xl relative border-t-white/20"
            >
                {/* Modal Header */}
                <div className="px-8 py-5 border-b border-white/10 flex items-center justify-between bg-zinc-950">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#2dd4bf]" />
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] leading-tight">Checking Document Plagiarism</h3>
                            <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-white/40 mt-1">Plagiarism Check & Similarity Search</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xl">
                        <span className="font-mono text-[9px] text-white/60 tracking-widest">SCANNING</span>
                    </div>
                </div>

                {/* Modal Body - 2 Columns */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden bg-black/20">
                    {/* Left Column: Progress Checklist and Active Equation */}
                    <div className="px-8 py-6 flex flex-col gap-5 border-b lg:border-b-0 lg:border-r border-white/10 overflow-y-auto custom-scrollbar">
                        
                        {/* Interactive Steps Checklist */}
                        <div className="space-y-2.5">
                            <h4 className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Scanning Status</h4>
                            {stagesWithStatus.map((stage, idx) => (
                                <div 
                                    key={idx} 
                                    className={`flex items-center gap-3.5 p-3 rounded-xl border transition-all duration-300 ${
                                        stage.status === 'running' 
                                        ? 'bg-primary/5 border-primary/20 shadow-lg shadow-primary/5' 
                                        : stage.status === 'completed'
                                        ? 'bg-emerald-500/5 border-emerald-500/10 opacity-90'
                                        : 'bg-white/[0.01] border-white/5 opacity-40'
                                    }`}
                                >
                                    <div className={`p-2 rounded-xl text-xs flex items-center justify-center ${
                                        stage.status === 'running'
                                        ? 'bg-primary/10 text-primary animate-pulse'
                                        : stage.status === 'completed'
                                        ? 'bg-emerald-500/10 text-emerald-400'
                                        : 'bg-white/5 text-white/30'
                                    }`}>
                                        {stage.status === 'running' ? <FaSpinner className="animate-spin text-sm" /> : stage.status === 'completed' ? <FaCheckCircle className="text-sm" /> : stage.icon}
                                    </div>
                                    <div className="space-y-0.5">
                                        <h5 className={`text-[10px] font-black uppercase tracking-wider ${stage.status === 'running' ? 'text-primary' : 'text-white'}`}>
                                            {stage.title}
                                        </h5>
                                        <p className="text-[9px] text-white/40 font-medium leading-tight">
                                            {stage.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Formula Display Panel */}
                        <div className="bg-zinc-900/30 rounded-2xl p-4 border border-white/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl rounded-full" />
                            <span className="text-[7px] font-black text-white/30 uppercase tracking-widest block mb-1.5">Calculation: {currentFormula.title}</span>
                            <div className="bg-black/50 rounded-xl py-2.5 px-3.5 border border-white/5 font-mono text-[9px] text-white/90 overflow-x-auto select-none leading-relaxed flex items-center justify-center min-h-[55px] text-center">
                                <code>{currentFormula.equation}</code>
                            </div>
                            <p className="text-[8px] text-white/40 leading-relaxed font-sans mt-2.5">
                                {currentFormula.explanation}
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Technical Terminal Logs */}
                    <div className="flex flex-col h-full bg-black/40 overflow-hidden">
                        {/* Terminal Header */}
                        <div className="px-6 py-3.5 border-b border-white/5 bg-zinc-950/60 flex items-center gap-2">
                            <FaTerminal className="text-white/40 text-[9px]" />
                            <span className="text-[8px] font-black text-white/40 uppercase tracking-widest font-mono">Calculations Terminal</span>
                        </div>
                        {/* Logs Console Container */}
                        <div 
                            ref={consoleRef}
                            className="flex-1 p-6 overflow-y-auto font-mono text-[9px] text-emerald-400 space-y-2 select-text custom-scrollbar leading-relaxed scroll-smooth"
                        >
                            {visibleLogs.map((log, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="text-emerald-400"
                                >
                                    {log}
                                </motion.div>
                            ))}
                            {/* Blinking cursor simulating active calculation */}
                            <span className="inline-block w-1.5 h-3 bg-primary animate-pulse mt-1" />
                        </div>
                    </div>
                </div>

                {/* Modal Footer - Wide Progress Indicator */}
                <div className="p-6 border-t border-white/10 bg-black/40 backdrop-blur-3xl flex items-center justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[8px] font-black uppercase tracking-widest text-white/40">SCAN PROGRESS</span>
                            <span className="text-[10px] font-mono font-black text-primary">{progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5 p-0.5">
                            <div 
                                className="bg-primary h-full rounded-full transition-all duration-750 ease-out shadow-[0_0_10px_rgba(45,212,191,0.5)]" 
                                style={{ width: `${progressPercentage}%` }} 
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                    background-color: rgba(255, 255, 255, 0.25);
                }
            `}</style>
        </motion.div>,
        document.body
    );
};

export default TechnicalLoaderModal;
