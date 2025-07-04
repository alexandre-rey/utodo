import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { sanitizeInput, sanitizeEmail, validatePassword } from "@/utils/sanitize";

interface AuthPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthPanel({ isOpen, onClose }: AuthPanelProps) {
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
                toast.success("Welcome back!");
            } else {
                // Sign Up - validate passwords match
                if (formData.password !== formData.confirmPassword) {
                    toast.error("Passwords do not match");
                    return;
                }
                
                await register({
                    email: sanitizedEmail,
                    password: validatedPassword,
                    firstName: sanitizedFirstName,
                    lastName: sanitizedLastName
                });
                toast.success("Account created successfully!");
            }
            
            resetForm();
            onClose();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Authentication failed";
            toast.error(message);
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
        setIsSignIn(!isSignIn);
        resetForm();
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
                        {isSignIn ? "Sign In" : "Create Account"}
                    </DialogTitle>
                    <DialogDescription>
                        {isSignIn 
                            ? "Sign in to sync your todos across devices" 
                            : "Create an account to save your todos in the cloud"
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name fields - only for sign up */}
                    {!isSignIn && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                                    <Input
                                        id="firstName"
                                        type="text"
                                        placeholder="Enter your first name"
                                        value={formData.firstName}
                                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                                    <Input
                                        id="lastName"
                                        type="text"
                                        placeholder="Enter your last name"
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
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>

                    {/* Password field */}
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
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
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                                <Input
                                    id="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                    className="pl-10"
                                    required={!isSignIn}
                                />
                            </div>
                            {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                <p className="text-sm text-red-600">Passwords do not match</p>
                            )}
                        </div>
                    )}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                        disabled={isLoading}
                    >
                        {isLoading ? "Please wait..." : (isSignIn ? "Sign In" : "Create Account")}
                    </Button>

                    {/* Switch Mode */}
                    <div className="text-center pt-4 border-t">
                        <p className="text-sm text-slate-600">
                            {isSignIn ? "Don't have an account?" : "Already have an account?"}
                        </p>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={switchMode}
                            className="text-blue-600 hover:text-blue-700 p-0 h-auto"
                        >
                            {isSignIn ? "Sign up here" : "Sign in here"}
                        </Button>
                    </div>

                    {/* Local Mode Note */}
                    <div className="text-center pt-2">
                        <p className="text-xs text-slate-500">
                            You can also continue using the app locally without an account
                        </p>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}