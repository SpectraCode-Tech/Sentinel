import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, ArrowRight, Newspaper } from "lucide-react";
import toast from "react-hot-toast";
import { registerUser } from "../api";

export default function Register() {

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

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

            navigate("/login");

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

                {/* Form */}
                <div className="bg-surface border border-border p-8 rounded-xl">

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Username */}
                        <div>

                            <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">
                                Username
                            </label>

                            <div className="relative">

                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                                <input
                                    type="text"
                                    required
                                    className="w-full bg-bg border border-border rounded-lg py-3 pl-10 pr-4"
                                    placeholder="j.doe"
                                    onChange={(e) =>
                                        setFormData({ ...formData, username: e.target.value })
                                    }
                                />

                            </div>

                        </div>

                        {/* Email */}
                        <div>

                            <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">
                                Email
                            </label>

                            <div className="relative">

                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                                <input
                                    type="email"
                                    required
                                    className="w-full bg-bg border border-border rounded-lg py-3 pl-10 pr-4"
                                    placeholder="john@email.com"
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                />

                            </div>

                        </div>

                        {/* First Name */}
                        <input
                            type="text"
                            placeholder="First Name"
                            className="w-full bg-bg border border-border rounded-lg py-3 px-4"
                            onChange={(e) =>
                                setFormData({ ...formData, first_name: e.target.value })
                            }
                        />

                        {/* Last Name */}
                        <input
                            type="text"
                            placeholder="Last Name"
                            className="w-full bg-bg border border-border rounded-lg py-3 px-4"
                            onChange={(e) =>
                                setFormData({ ...formData, last_name: e.target.value })
                            }
                        />

                        {/* Password */}
                        <div>

                            <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">
                                Password
                            </label>

                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                                <input
                                    type="password"
                                    required
                                    className="w-full bg-bg border border-border rounded-lg py-3 pl-10 pr-4"
                                    placeholder="••••••••"
                                    onChange={(e) =>
                                        setFormData({ ...formData, password: e.target.value })
                                    }
                                />

                            </div>

                        </div>

                        {/* Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-headline text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-accent transition"
                        >

                            {loading ? "Creating Account..." : (
                                <>
                                    Register
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}

                        </button>

                    </form>

                </div>

                {/* Login Link */}
                <p className="text-center mt-8 text-sm text-gray-500 font-serif">
                    Already have an account?{" "}
                    <Link to="/login" className="text-accent font-bold hover:underline">
                        Sign In
                    </Link>
                </p>

            </div>

        </div>
    );
}