import React, { useEffect, useState } from "react";
import { FileText, Eye, Trash2 } from "lucide-react";
import API from "../api/axios";

export default function AdminArticles() {
    const [articles, setArticles] = useState([]);

    useEffect(() => {
        API.get("articles/") // Admin gets all articles
            .then(res => setArticles(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="p-10 bg-slate-50 min-h-screen">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black">Global Content</h1>
                    <p className="text-slate-500">Monitor all articles published on the platform</p>
                </div>
            </header>

            <div className="grid gap-4">
                {articles.map(article => (
                    <div key={article.id} className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-100 rounded-xl">
                                <FileText className="text-slate-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{article.title}</h3>
                                <p className="text-sm text-slate-400">Author: {article.author_name} • {new Date(article.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${article.status === 'published' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                                }`}>
                                {article.status}
                            </span>
                            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600">
                                <Eye className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}