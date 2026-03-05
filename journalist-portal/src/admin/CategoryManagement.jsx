import React, { useState, useEffect } from "react";
import { Plus, Tag, Trash2 } from "lucide-react";
import API from "../api/axios";

export default function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [newName, setNewName] = useState("");

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = () => {
        API.get("categories/").then(res => setCategories(res.data));
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newName) return;
        await API.post("categories/", { name: newName });
        setNewName("");
        fetchCategories();
    };

    return (
        <div className="p-10 bg-slate-50 min-h-screen">
            <h1 className="text-3xl font-black mb-8">Categories</h1>

            <form onSubmit={handleAdd} className="mb-10 flex gap-4">
                <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="New category name..."
                    className="flex-1 px-6 py-3 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors">
                    <Plus className="w-5 h-5" /> Add
                </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(cat => (
                    <div key={cat.id} className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <Tag className="text-indigo-500 w-5 h-5" />
                            <span className="font-bold">{cat.name}</span>
                        </div>
                        <button className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}