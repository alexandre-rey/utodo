import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { sanitizeInput, sanitizeEmail, validatePassword } from "@/utils/sanitize";
import { useTranslation } from 'react-i18next';
import { useAnalytics, useComponentAnalytics } from '@/hooks/useAnalytics';

interface AuthPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthPanel({ isOpen, onClose }: AuthPanelProps) {
    useComponentAnalytics('AuthPanel', { isOpen });
    const analytics = useAnalytics();
    const { t } = useTranslation();
    const [isSignIn, setIsSignIn] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        confirmPassword: ""
    });
    const { login, register, isLoading } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Sanitize and validate inputs
            const sanitizedEmail = sanitizeEmail(formData.email);
            const validatedPassword = validatePassword(formData.password);
            const sanitizedFirstName = sanitizeInput(formData.firstName);
            const sanitizedLastName = sanitizeInput(formData.lastName);

            if (isSignIn) {
                // Sign In
                await login({
                    email: sanitizedEmail,
                    password: validatedPassword
                });
                toast.success(t('auth.signinSuccess'));
                analytics.trackAuthAction('sign_in_success', { method: 'email' });
            } else {
                // Sign Up - validate passwords match
                if (formData.password !== formData.confirmPassword) {
                    toast.error(t('auth.passwordMismatch'));
                    return;
                }
                
                await register({
                    email: sanitizedEmail,
                    password: validatedPassword,
                    firstName: sanitizedFirstName,
                    lastName: sanitizedLastName
                });
                toast.success(t('auth.accountCreated'));
                analytics.trackAuthAction('sign_up_success', { method: 'email' });
            }
            
            resetForm();
            onClose();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : t('auth.authFailed');
            toast.error(message);
            analytics.trackAuthAction('auth_failed', { 
                method: 'email', 
                type: isSignIn ? 'sign_in' : 'sign_up',
                error: message 
            });
        }
    };

    const resetForm = () => {
        setFormData({
            email: "",
            password: "",
            firstName: "",
            lastName: "",
            confirmPassword: ""
        });
        setShowPassword(false);
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const switchMode = () => {
        const newMode = !isSignIn;
        setIsSignIn(newMode);
        resetForm();
        
        // Track mode switch
        analytics.trackUsageAction('auth_mode_switch', {
          mode: newMode ? 'sign_in' : 'sign_up'
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                onClose();
                resetForm();
            }
        }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {isSignIn ? t('auth.signIn') : t('auth.createAccount')}
                    </DialogTitle>
                    <DialogDescription>
                        {isSignIn 
                            ? t('auth.signInDesc') 
                            : t('auth.signUpDesc')
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name fields - only for sign up */}
                    {!isSignIn && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="firstName">{t('auth.firstName')}</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                                    <Input
                                        id="firstName"
                                        type="text"
                                        placeholder={t('auth.enterFirstName')}
                                        value={formData.firstName}
                                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">{t('auth.lastName')}</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                                    <Input
                                        id="lastName"
                                        type="text"
                                        placeholder={t('auth.enterLastName')}
                                        value={formData.lastName}
                                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Email field */}
                    <div className="space-y-2">
                        <Label htmlFor="email">{t('auth.email')}</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <Input
                                id="email"
                                type="email"
                                placeholder={t('auth.enterEmail')}
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>

                    {/* Password field */}
                    <div className="space-y-2">
                        <Label htmlFor="password">{t('auth.password')}</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder={t('auth.enterPassword')}
                                value={formData.password}
                                onChange={(e) => handleInputChange("password", e.target.value)}
                                className="pl-10 pr-10"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password field - only for sign up */}
                    {!isSignIn && (
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                                <Input
                                    id="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    placeholder={t('auth.confirmYourPassword')}
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                    className="pl-10"
                                    required={!isSignIn}
                                />
                            </div>
                            {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                <p className="text-sm text-red-600">{t('auth.passwordMismatch')}</p>
                            )}
                        </div>
                    )}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                        disabled={isLoading}
                    >
                        {isLoading ? t('auth.pleaseWait') : (isSignIn ? t('auth.signIn') : t('auth.createAccount'))}
                    </Button>

                    {/* Switch Mode */}
                    <div className="text-center pt-4 border-t">
                        <p className="text-sm text-slate-600">
                            {isSignIn ? t('auth.noAccount') : t('auth.hasAccount')}
                        </p>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={switchMode}
                            className="text-blue-600 hover:text-blue-700 p-0 h-auto"
                        >
                            {isSignIn ? t('auth.signUpHere') : t('auth.signInHere')}
                        </Button>
                    </div>

                    {/* Local Mode Note */}
                    <div className="text-center pt-2">
                        <p className="text-xs text-slate-500">
                            {t('auth.localModeNote')}
                        </p>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}