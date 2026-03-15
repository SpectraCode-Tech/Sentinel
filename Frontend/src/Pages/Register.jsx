import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, ArrowRight, Newspaper, UserCircle, Eye, EyeOff } from "lucide-react"; // Added UserCircle
import toast from "react-hot-toast";
import { registerUser } from "../api";

export default function Register() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        password: ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await registerUser(formData);
            toast.success("Account created successfully!");
            navigate("/");
        } catch (err) {
            toast.error("Registration failed");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-headline text-white rounded-full mb-4">
                        <Newspaper className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-serif font-black text-headline uppercase">
                        Join The Sentinel
                    </h1>
                    <p className="text-gray-500 font-serif italic text-sm mt-2">
                        Create your press account
                    </p>
                </div>

                {/* Form Container */}
                <div className="bg-surface border border-border p-8 rounded-xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Input fields... (Username, Email, Names, Password) */}
                        <div>
                            <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-bg border border-border rounded-lg py-3 pl-10 pr-4"
                                    placeholder="j.doe"
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-bg border border-border rounded-lg py-3 pl-10 pr-4"
                                    placeholder="john@email.com"
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="First Name"
                                className="w-full bg-bg border border-border rounded-lg py-3 px-4"
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Last Name"
                                className="w-full bg-bg border border-border rounded-lg py-3 px-4"
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                                <input
                                    type={showPassword ? "text" : "password"} // Dynamic type
                                    required
                                    className="w-full bg-bg border border-border rounded-lg py-3 pl-10 pr-12 outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                                    placeholder="••••••••"
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />

                                {/* Toggle Button */}
                                <button
                                    type="button" // Important: prevents form submission
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-headline transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-4 pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-headline text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-accent transition group disabled:opacity-50"
                            >
                                {loading ? "Creating Account..." : (
                                    <>
                                        Register
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>

                            {/* --- GUEST OPTION START --- */}
                            <div className="relative flex items-center py-2">
                                <div className="grow border-t border-border"></div>
                                <span className="shrink mx-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Or</span>
                                <div className="grow border-t border-border"></div>
                            </div>

                            <button
                                type="button"
                                onClick={() => navigate("/Home")}
                                className="w-full bg-transparent border border-border text-headline font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-all text-sm"
                            >
                                <UserCircle className="w-4 h-4" />
                                Continue as Guest
                            </button>
                            {/* --- GUEST OPTION END --- */}
                        </div>
                    </form>
                </div>

                {/* Login Link */}
                <p className="text-center mt-8 text-sm text-gray-500 font-serif">
                    Already have an account?{" "}
                    <Link to="/" className="text-accent font-bold hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}