import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ArrowRight, Newspaper } from "lucide-react";
import { loginUser, fetchUserProfile } from "../api";
import { useAuth } from "../Context/AuthContext"; // <--- ADD THIS IMPORT
import toast from "react-hot-toast";

export default function Login() {
    const { login } = useAuth(); // Now this will work!
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await loginUser(formData);

            // 1. Tokens stay as individual strings (usually best for the API Interceptor)
            localStorage.setItem("access_token", res.data.access);
            localStorage.setItem("refresh_token", res.data.refresh);

            // 2. Fetch the full user object
            const userRes = await fetchUserProfile(res.data.access);

            // 3. IMPORTANT: Use the context function to save the user as a JSON object
            login(userRes.data);

            toast.success(`Welcome back, ${userRes.data.username}!`);
            navigate("/Home");
        } catch (err) {
            toast.error("Invalid credentials.");
        } finally {
            setLoading(false);
        }
    };
    // Redirect if already logged in
    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (token) {
            navigate("/Home");
        }
    }, [navigate]);

    return (
        <div className="min-h-screen bg-bg flex items-center justify-center px-4">
            <div className="max-w-md w-full">

                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-headline text-white rounded-full mb-4">
                        <Newspaper className="w-8 h-8" />
                    </div>

                    <h1 className="text-3xl font-serif font-black text-headline uppercase tracking-tighter">
                        The Sentinel
                    </h1>

                    <p className="text-gray-500 font-serif italic text-sm mt-2">
                        Enter your credentials to access the dispatch
                    </p>
                </div>

                <div className="bg-surface border border-border p-8 rounded-xl shadow-sm">

                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                                Username or Email
                            </label>

                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                                <input
                                    type="text"
                                    required
                                    placeholder="j.doe or email"
                                    className="w-full bg-bg border border-border rounded-lg py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            username: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                                Password
                            </label>

                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-bg border border-border rounded-lg py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            password: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-headline text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-accent transition-all group disabled:opacity-50"
                        >
                            {loading ? (
                                "Authenticating..."
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                    </form>

                </div>

                <p className="text-center mt-8 text-sm text-gray-500 font-serif">
                    Not a member of the press?{" "}
                    <Link to="/register" className="text-accent font-bold hover:underline">
                        Register for an account
                    </Link>
                </p>

            </div>
        </div>
    );
}