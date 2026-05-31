'use client';

import { useState, KeyboardEvent, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import API_BASE_URL from '@/app/lib/api';

const ForgotPassword: React.FC = () => {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [idNumber, setIdNumber] = useState<string>('');
    const [birthdate, setBirthdate] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleIdInputChange = (value: string): void => {
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
    };

    const validateIDNumber = (id: string): boolean => {
        const idRegex = /^TUPT-\d{2}-\d{4}$/;
        return idRegex.test(id);
    };

    const handleResetPassword = async (): Promise<void> => {
        if (!idNumber || !birthdate || !newPassword || !confirmPassword) {
            toast.error('Please fill in all fields');
            return;
        }

        if (!validateIDNumber(idNumber)) {
            toast.error('Please enter a valid ID number in format: TUPT-XX-XXXX');
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
            const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    idNumber,
                    birthdate,
                    newPassword
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || 'Password reset successful!');
                setTimeout(() => {
                    router.push('/auth/login');
                }, 2000);
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
        setNewPassword('');
        setConfirmPassword('');
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Enter') {
            handleResetPassword();
        }
    };

    const inputClasses = "w-full h-12 bg-surface border border-border-custom px-4 rounded-xl text-sm text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:bg-card transition-all font-bold";

    return (
        <div className="w-full max-w-lg bg-card rounded-xl shadow-2xl border border-border-custom overflow-hidden">
            <div className="p-4 md:p-8 pb-2">
                <h3 className="text-foreground text-sm font-bold mb-2 uppercase tracking-widest">Reset Password</h3>
                <div className="h-[1px] bg-border-custom w-full mb-6" />

                <div className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-[13px] font-bold text-text-dim">ID Number:</label>
                        <input
                            type="text"
                            className={inputClasses}
                            placeholder="TUPT-XX-XXXX"
                            value={idNumber}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleIdInputChange(e.target.value)}
                            onKeyPress={handleKeyPress}
                            maxLength={12}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[13px] font-bold text-text-dim">Birthdate:</label>
                        <input
                            type="date"
                            className={inputClasses}
                            value={birthdate}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setBirthdate(e.target.value)}
                            onKeyPress={handleKeyPress}
                            max={mounted ? new Date().toISOString().split('T')[0] : undefined}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[13px] font-bold text-text-dim">New Password:</label>
                        <input
                            type="password"
                            className={inputClasses}
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[13px] font-bold text-text-dim">Repeat Password:</label>
                        <input
                            type="password"
                            className={inputClasses}
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
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
                            {isLoading ? 'Wait...' : 'Reset'}
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
