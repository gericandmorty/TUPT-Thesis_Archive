'use client';

import React from 'react';
import Lottie from 'lottie-react';
import { motion, AnimatePresence } from 'framer-motion';
import sandyLoading from '../../../public/assets/Sandy Loading.json';
import loadingFiles from '../../../public/assets/Loading Files.json';
import aiThinking from '../../../public/assets/Ai Loading Thinking.json';
import mappingML from '../../../public/assets/Mapping for machine learning.json';
import workspaceRobot from '../../../public/assets/Man and robot with computers sitting together in workplace.json';
import warningTekkis from '../../../public/assets/Warning - tekkis.json';

interface LottieLoaderProps {
    type?: 'general' | 'search' | 'ai' | 'login' | 'workspace' | 'warning';
    isModal?: boolean;
    text?: string;
    subtext?: string;
    className?: string;
    width?: number | string;
    height?: number | string;
    showCard?: boolean;
}

const LottieLoader: React.FC<LottieLoaderProps> = ({
    type = 'general',
    isModal = false,
    text,
    subtext,
    className = '',
    width = 'auto',
    height = 'auto',
    showCard = false
}) => {
    const animationData = 
        type === 'search' ? loadingFiles : 
        type === 'ai' ? aiThinking : 
        type === 'login' ? mappingML : 
        type === 'workspace' ? workspaceRobot : 
        type === 'warning' ? warningTekkis :
        sandyLoading;

    const content = (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <div style={{ width: isModal ? 300 : width, height: isModal ? 300 : height }}>
                <Lottie
                    animationData={animationData}
                    loop={true}
                    className="w-full h-full"
                />
            </div>
            {text && (
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${isModal ? 'text-white' : 'text-foreground'} font-black text-sm uppercase tracking-[0.3em] ${isModal ? '' : 'animate-pulse'} text-center px-6 mt-4`}
                >
                    {text}
                </motion.p>
            )}
            {subtext && (
                <div className="flex flex-col items-center w-full mt-3">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={subtext}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.3 }}
                            className={`${isModal ? 'text-primary' : 'text-primary'} font-black text-[9px] uppercase tracking-[0.2em] text-center px-6`}
                        >
                            {subtext}
                        </motion.p>
                    </AnimatePresence>
                    
                    <div className="w-48 bg-white/5 h-1 rounded-full overflow-hidden mt-3.5 border border-white/5">
                        <div 
                            className="bg-primary h-full rounded-full transition-all duration-750 ease-out" 
                            style={{ 
                                width: subtext.includes("segment") || subtext.includes("Extracting") ? "15%" :
                                       subtext.includes("structural") || subtext.includes("metadata") ? "35%" :
                                       subtext.includes("readability") || subtext.includes("word") ? "55%" :
                                       subtext.includes("grammar") || subtext.includes("style") ? "75%" :
                                       subtext.includes("similarity") || subtext.includes("vector") ? "92%" : "99%"
                            }} 
                        />
                    </div>
                </div>
            )}
        </div>
    );

    if (isModal) {
        const useCardStyle = showCard || type === 'search';

        if (useCardStyle) {
            return (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto backdrop-blur-xl bg-black/75"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 250 }}
                        className="bg-zinc-950/80 border border-white/10 backdrop-blur-2xl rounded-2xl p-10 shadow-2xl flex flex-col items-center justify-center max-w-[90vw] w-[400px] border-t-white/20"
                    >
                        {content}
                    </motion.div>
                </motion.div>
            );
        }

        // Default transparent/cardless modal style for general loading states (login, register, workspace, warning)
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none backdrop-blur-md bg-black/10"
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="pointer-events-auto flex flex-col items-center justify-center max-w-[90vw] mb-20"
                >
                    {content}
                </motion.div>
            </motion.div>
        );
    }

    return content;
};

export default LottieLoader;
