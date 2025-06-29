import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";

interface AuthPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onAuthSuccess: (user: { email: string; name: string }) => void;
}

export default function AuthPanel({ isOpen, onClose, onAuthSuccess }: AuthPanelProps) {
    const [isSignIn, setIsSignIn] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: "",
        confirmPassword: ""
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Fake authentication logic
        if (isSignIn) {
            // Sign In
            if (formData.email && formData.password) {
                onAuthSuccess({
                    email: formData.email,
                    name: formData.email.split('@')[0] // Use email prefix as name
                });
                resetForm();
                onClose();
            }
        } else {
            // Sign Up
            if (formData.email && formData.password && formData.name && formData.password === formData.confirmPassword) {
                onAuthSuccess({
                    email: formData.email,
                    name: formData.name
                });
                resetForm();
                onClose();
            }
        }

        setIsLoading(false);
    };

    const resetForm = () => {
        setFormData({
            email: "",
            password: "",
            name: "",
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
                    {/* Name field - only for sign up */}
                    {!isSignIn && (
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    className="pl-10"
                                    required={!isSignIn}
                                />
                            </div>
                        </div>
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