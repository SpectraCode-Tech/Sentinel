import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// 1. Added Eye and EyeOff icons
import { Newspaper, Lock, User, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// ... (imports remain the same)

export default function Login() {
    // 1. Rename state to 'identifier' for clarity (optional but recommended)
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // 2. Pass 'identifier' as the username key (common for most backends)
        const loginPromise = axios.post("https://sentinel-ou6m.onrender.com/api/token/", {
            username: identifier,
            password
        });

        try {
            const res = await loginPromise;
            localStorage.setItem("access", res.data.access);
            localStorage.setItem("refresh", res.data.refresh);
            const payload = JSON.parse(atob(res.data.access.split(".")[1]));
            localStorage.setItem("role", payload.role);
            localStorage.setItem("username", identifier); // Store the login name
            localStorage.setItem("is_staff", payload.role === "ADMIN" || payload.role === "EDITOR");

            toast.success(`Welcome back, ${identifier}!`);

            setTimeout(() => {
                if (payload.role === "JOURNALIST") navigate("/journalist");
                else if (payload.role === "EDITOR") navigate("/editor");
                else if (payload.role === "ADMIN") navigate("/admin");
            }, 1000);
        } catch (err) {
            const errorMsg = err.response?.data?.detail || "Invalid credentials. Please try again.";
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen w-full bg-[#F8FAFC] flex items-center justify-center p-4 font-sans overflow-hidden">
            <Toaster position="top-center" reverseOrder={false} />

            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
            </div>

            <div className="w-full max-w-110 max-h-full flex flex-col justify-center">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 mb-3">
                        <Newspaper className="text-white w-7 h-7" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h1>
                    <p className="text-slate-500 mt-1 font-medium">Newsroom Management System</p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            {/* 3. Updated Label */}
                            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Username or Email</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all text-slate-900"
                                    /* 4. Updated Placeholder */
                                    placeholder="e.g. alex or alex@news.com"
                                    onChange={(e) => setIdentifier(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all text-slate-900"
                                    placeholder="••••••••••••"
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5 cursor-pointer" /> : <Eye className="w-5 h-5 cursor-pointer" />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={isLoading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-70 mt-2" >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Sign in to Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-5 border-t border-slate-50 text-center">
                        <p className="text-slate-400 text-[10px] font-medium uppercase tracking-widest">
                            Secure Newsroom Access Only
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
