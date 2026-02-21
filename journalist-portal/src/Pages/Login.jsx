import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const navigate = useNavigate();

    // Redirect if already logged in to prevent loop
    useEffect(() => {
        if (localStorage.getItem("access")) {
            navigate("/dashboard");
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setIsAuthenticating(true);

        try {
            const res = await axios.post(
                "http://127.0.0.1:8000/api/token/",
                { username, password }
            );

            localStorage.setItem("access", res.data.access);
            localStorage.setItem("refresh", res.data.refresh);

            // Navigate to dashboard. The dashboard useEffect will handle
            // verifying the token.
            navigate("/dashboard");
        } catch (err) {
            setError("The archives do not recognize these credentials.");
            setIsAuthenticating(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f4f1ea] px-4 relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
                style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')` }}></div>

            <div className="max-w-md w-full relative z-10">
                <Link to="/" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-black mb-8 inline-block transition-all transform hover:-translate-x-1">
                    ← TERMINAL_EXIT
                </Link>

                <div className="bg-white border-2 border-black p-8 md:p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                    <div className="text-center mb-10">
                        <div className="inline-block border border-black px-2 py-1 mb-4">
                            <p className="text-[9px] font-black tracking-[0.4em] uppercase">Security Level 4</p>
                        </div>
                        <h1 className="font-serif text-4xl font-black tracking-tighter uppercase leading-none">
                            The Sentinel
                        </h1>
                        <div className="h-1 bg-black w-12 mx-auto my-3"></div>
                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">
                            Press Correspondent Portal
                        </p>
                    </div>

                    {error && (
                        <div className="bg-black text-white p-4 mb-6 animate-pulse">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-center">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="group">
                            <label className="block text-[10px] font-black uppercase tracking-widest mb-2 group-focus-within:text-accent transition-colors">Credential_ID</label>
                            <input
                                type="text"
                                required
                                className="w-full border-2 border-black p-4 text-xs font-mono focus:bg-yellow-50 outline-none transition-all rounded-none placeholder:opacity-30"
                                placeholder="JRNL_USR_88"
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div className="group">
                            <label className="block text-[10px] font-black uppercase tracking-widest mb-2 group-focus-within:text-accent transition-colors">Access_Cipher</label>
                            <input
                                type="password"
                                required
                                className="w-full border-2 border-black p-4 text-xs font-mono focus:bg-yellow-50 outline-none transition-all rounded-none placeholder:opacity-30"
                                placeholder="••••••••••••"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isAuthenticating}
                            className={`w-full bg-black text-white py-5 text-[11px] font-black uppercase tracking-[0.4em] hover:bg-accent hover:text-black transition-all duration-300 rounded-none ${isAuthenticating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isAuthenticating ? 'Verifying...' : 'Authorize Access'}
                        </button>
                    </form>

                    <div className="mt-10 pt-6 border-t border-dotted border-gray-300">
                        <p className="text-[8px] text-gray-400 uppercase tracking-widest leading-relaxed text-center">
                            By entering this terminal, you agree to the <br />
                            <span className="text-black font-bold">Sentinel Non-Disclosure Agreement (2026)</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}