'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle, FaQuestionCircle, FaInfoCircle, FaCheckCircle, FaTimes } from 'react-icons/fa';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'primary' | 'warning' | 'success';
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'primary',
    onConfirm,
    onCancel,
}) => {
    // Determine icon and color mapping based on variant
    const getVariantConfig = () => {
        switch (variant) {
            case 'danger':
                return {
                    icon: <FaExclamationTriangle className="text-xl text-red-400" />,
                    iconBg: 'bg-red-500/10 border-red-500/20',
                    confirmBtn: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 focus:ring-red-500/50',
                };
            case 'warning':
                return {
                    icon: <FaExclamationTriangle className="text-xl text-amber-400" />,
                    iconBg: 'bg-amber-500/10 border-amber-500/20',
                    confirmBtn: 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 focus:ring-amber-500/50',
                };
            case 'success':
                return {
                    icon: <FaCheckCircle className="text-xl text-emerald-400" />,
                    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
                    confirmBtn: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 focus:ring-emerald-500/50',
                };
            case 'primary':
            default:
                return {
                    icon: <FaQuestionCircle className="text-xl text-primary" />,
                    iconBg: 'bg-primary/10 border-primary/20',
                    confirmBtn: 'bg-primary hover:opacity-90 text-white shadow-lg shadow-primary/20 focus:ring-primary/50',
                };
        }
    };

    const config = getVariantConfig();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCancel}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal Content Box */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                        className="relative bg-[#1A1A2E]/95 backdrop-blur-2xl w-full max-w-md rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-[111]"
                    >
                        {/* Header/Title block */}
                        <div className="p-6 border-b border-white/[0.05] flex items-center gap-4 bg-white/[0.02]">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${config.iconBg}`}>
                                {config.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
                            </div>
                            <button
                                onClick={onCancel}
                                className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all border border-white/5"
                            >
                                <FaTimes className="text-xs" />
                            </button>
                        </div>

                        {/* Message body */}
                        <div className="p-6">
                            <p className="text-sm text-white/60 leading-relaxed font-medium">
                                {message}
                            </p>
                        </div>

                        {/* Action buttons */}
                        <div className="p-6 border-t border-white/[0.05] flex gap-3 bg-white/[0.01]">
                            <button
                                onClick={onCancel}
                                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-white/10 active:scale-95"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                className={`flex-1 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all focus:outline-none focus:ring-2 active:scale-95 ${config.confirmBtn}`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmModal;
