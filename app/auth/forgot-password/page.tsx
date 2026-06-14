'use client';

import { useState, KeyboardEvent, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash, FaCalendarAlt, FaQuestionCircle } from 'react-icons/fa';
import API_BASE_URL from '@/app/lib/api';

type VerificationMethod = 'birthdate' | 'secretQuestion';

const ForgotPassword: React.FC = () => {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [idNumber, setIdNumber] = useState<string>('');
    const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>('birthdate');
    const [birthdate, setBirthdate] = useState<string>('');
    const [secretQuestion, setSecretQuestion] = useState<string>('');
    const [secretAnswer, setSecretAnswer] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showSecretAnswer, setShowSecretAnswer] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isStudent, setIsStudent] = useState(true);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const fetchSecretQuestion = async () => {
            if (!idNumber) {
                setSecretQuestion('');
                return;
            }
            if (isStudent && idNumber.length < 12) {
                setSecretQuestion('');
                return;
            }
            try {
                const response = await fetch(`${API_BASE_URL}/auth/secret-question/${idNumber}`);
                if (response.ok) {
                    const data = await response.json();
                    setSecretQuestion(data.secretQuestion);
                } else {
                    setSecretQuestion('');
                }
            } catch (error) {
                console.error("Error fetching secret question:", error);
                setSecretQuestion('');
            }
        };

        if (verificationMethod === 'secretQuestion') {
            fetchSecretQuestion();
        } else {
            setSecretQuestion('');
        }
    }, [idNumber, verificationMethod, isStudent]);

    const handleIdInputChange = (value: string): void => {
        if (isStudent) {
            let formattedValue = value.replace(/[^a-zA-Z0-9]/g, '');
            formattedValue = formattedValue.toUpperCase();

            if (!formattedValue.startsWith('TUPT') && formattedValue.length > 0) {
                formattedValue = 'TUPT' + formattedValue;
            }

            if (formattedValue.length > 4) {
                formattedValue = formattedValue.slice(0, 4) + '-' + formattedValue.slice(4);
            }
            if (formattedValue.length > 7) {
                formattedValue = formattedValue.slice(0, 7) + '-' + formattedValue.slice(7, 11);
            }
            formattedValue = formattedValue.slice(0, 12);
            setIdNumber(formattedValue);
        } else {
            setIdNumber(value);
        }
    };

    const handleResetPassword = async (): Promise<void> => {
        if (!idNumber || !newPassword || !confirmPassword) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (isStudent) {
            const idRegex = /^TUPT-\d{2}-\d{4}$/;
            if (!idRegex.test(idNumber)) {
                toast.error('Please enter a valid student ID in format: TUPT-XX-XXXX');
                return;
            }
        }

        if (verificationMethod === 'birthdate' && !birthdate) {
            toast.error('Please enter your birthdate');
            return;
        }

        if (verificationMethod === 'secretQuestion' && !secretAnswer) {
            toast.error('Please enter your secret answer');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        setIsLoading(true);

        try {
            const body: Record<string, string> = {
                idNumber,
                newPassword,
                verificationMethod
            };

            if (verificationMethod === 'birthdate') {
                body.birthdate = birthdate;
            } else {
                body.secretAnswer = secretAnswer;
            }

            const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || 'Password reset successful!');
                setTimeout(() => { router.push('/auth/login'); }, 2000);
            } else {
                toast.error(data.message || 'Reset failed. Please check your details.');
            }
        } catch (error) {
            console.error('Reset error:', error);
            toast.error('Cannot connect to server. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = (): void => {
        setIdNumber('');
        setBirthdate('');
        setSecretAnswer('');
        setNewPassword('');
        setConfirmPassword('');
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Enter') { handleResetPassword(); }
    };

    const inputClasses = "w-full h-12 bg-surface border border-border-custom px-4 rounded-xl text-sm text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:bg-card transition-all font-bold";

    return (
        <div className="w-full max-w-lg bg-card rounded-xl shadow-2xl border border-border-custom overflow-hidden">
            <div className="p-4 md:p-8 pb-2">
                <h3 className="text-foreground text-sm font-bold mb-2 uppercase tracking-widest">Reset Password</h3>
                <div className="h-[1px] bg-border-custom w-full mb-6" />

                <div className="space-y-5">
                    {/* ID Number */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <label className="text-[13px] font-bold text-text-dim">ID Number:</label>
                            <button
                                type="button"
                                onClick={() => { setIsStudent(!isStudent); setIdNumber(''); }}
                                className="text-[11px] font-semibold text-primary/70 hover:text-primary transition-colors"
                            >
                                {isStudent ? 'Not a student?' : 'Are you a student?'}
                            </button>
                        </div>
                        <input
                            type="text"
                            className={inputClasses}
                            placeholder={isStudent ? 'TUPT-XX-XXXX' : 'Enter your ID number'}
                            value={idNumber}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleIdInputChange(e.target.value)}
                            onKeyPress={handleKeyPress}
                            maxLength={isStudent ? 12 : 50}
                        />
                    </div>

                    {/* Verification Method Toggle */}
                    <div className="space-y-3">
                        <label className="text-[13px] font-bold text-text-dim">Verify Identity Using:</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setVerificationMethod('birthdate')}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-[11px] font-bold uppercase tracking-wider transition-all ${
                                    verificationMethod === 'birthdate'
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-border-custom text-text-dim hover:border-primary/40 hover:bg-surface'
                                }`}
                            >
                                <FaCalendarAlt size={13} />
                                Birthdate
                            </button>
                            <button
                                type="button"
                                onClick={() => setVerificationMethod('secretQuestion')}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-[11px] font-bold uppercase tracking-wider transition-all ${
                                    verificationMethod === 'secretQuestion'
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-border-custom text-text-dim hover:border-primary/40 hover:bg-surface'
                                }`}
                            >
                                <FaQuestionCircle size={13} />
                                Secret Question
                            </button>
                        </div>
                    </div>

                    {/* Birthdate Verification */}
                    {verificationMethod === 'birthdate' && (
                        <div className="space-y-1">
                            <label className="text-[13px] font-bold text-text-dim">Your Birthdate:</label>
                            <input
                                type="date"
                                className={inputClasses}
                                value={birthdate}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setBirthdate(e.target.value)}
                                onKeyPress={handleKeyPress}
                                max={mounted ? new Date().toISOString().split('T')[0] : undefined}
                            />
                        </div>
                    )}

                    {/* Secret Question Verification */}
                    {verificationMethod === 'secretQuestion' && (
                        <div className="space-y-3 p-4 bg-surface/40 border border-border-custom rounded-xl">
                            <p className="text-[11px] text-text-dim font-medium leading-relaxed">
                                Enter the answer to the secret question you set during registration.
                            </p>
                            {secretQuestion && (
                                <p className="text-[12px] font-bold text-foreground italic">&ldquo;{secretQuestion}&rdquo;</p>
                            )}
                            <div className="space-y-1">
                                <label className="text-[12px] font-bold text-text-dim">Your Answer:</label>
                                <div className="relative">
                                    <input
                                        type={showSecretAnswer ? 'text' : 'password'}
                                        className={`${inputClasses} pr-12`}
                                        placeholder="Enter your secret answer"
                                        value={secretAnswer}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setSecretAnswer(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowSecretAnswer(!showSecretAnswer)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors focus:outline-none"
                                    >
                                        {showSecretAnswer ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* New Password */}
                    <div className="space-y-1">
                        <label className="text-[13px] font-bold text-text-dim">New Password:</label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? 'text' : 'password'}
                                className={`${inputClasses} pr-12`}
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors focus:outline-none"
                            >
                                {showNewPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1">
                        <label className="text-[13px] font-bold text-text-dim">Repeat Password:</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                className={`${inputClasses} pr-12`}
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors focus:outline-none"
                            >
                                {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 pb-4">
                        <button
                            onClick={handleClear}
                            className="bg-card text-text-dim text-[11px] font-bold px-4 py-2 border-2 border-border-custom rounded-lg hover:bg-surface hover:text-foreground transition-colors"
                        >
                            Clear
                        </button>

                        <button
                            onClick={handleResetPassword}
                            disabled={isLoading}
                            className="bg-primary/5 border border-primary/30 text-primary font-black text-[11px] uppercase tracking-[0.2em] px-8 py-2.5 rounded-xl transition-all duration-300 shadow-lg hover:bg-primary/20 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(45,212,191,0.15)] active:scale-95 active:bg-primary/30"
                        >
                            {isLoading ? 'Please wait...' : 'Reset Password'}
                        </button>
                    </div>

                    <div className="pb-4 text-center border-t border-border-custom pt-6">
                        <p className="text-text-dim text-[13px] font-medium mb-3">
                            Remembered your password?{' '}
                            <Link href="/auth/login" className="text-teal-700 font-black hover:underline underline-offset-4 decoration-2">
                                Back to Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
