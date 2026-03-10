import React, { useState, useEffect } from "react";
import { Plus, Tag, Hash, Trash2 } from "lucide-react";
import API from "../api/axios";
import AdminSidebar from "./Sidebar";
import toast, { Toaster } from "react-hot-toast"; // 1. Import Toast

export default function AdminTaxonomy() {
    const [items, setItems] = useState([]);
    const [newName, setNewName] = useState("");
    const [mode, setMode] = useState("categories");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);


    useEffect(() => {
        fetchData();
    }, [mode]);

    const fetchData = () => {
        API.get(`${mode}/`)
            .then((res) => setItems(res.data))
            .catch(() => toast.error(`Failed to load ${mode}`));
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newName) return toast.error("Please enter a name");

        const loadingToast = toast.loading(`Adding ${mode.slice(0, -1)}...`);
        try {
            await API.post(`${mode}/`, { name: newName });
            setNewName("");
            fetchData();
            toast.success(`${mode.slice(0, -1)} added!`, { id: loadingToast });
        } catch (err) {
            toast.error("Error adding item", { id: loadingToast });
        }
    };

    const handleDelete = (id) => {
        // 1. Create a unique toast ID so we can dismiss it manually
        toast((t) => (
            <div className="flex flex-col gap-3 p-1">
                <p className="font-medium text-slate-800">
                    Delete this {mode.slice(0, -1)}?
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id); // Close the confirm toast
                            const loading = toast.loading("Deleting...");
                            try {
                                await API.delete(`${mode}/${id}/`);
                                toast.success("Deleted successfully", { id: loading });
                                fetchData();
                            } catch (err) {
                                toast.error("Error: Item might be in use", { id: loading });
                            }
                        }}
                        className="bg-rose-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-rose-600 transition-colors"
                    >
                        Confirm
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-300 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), {
            duration: 5000, // Give them 5 seconds to decide
            position: 'top-center',
            style: {
                padding: '12px',
                borderRadius: '16px',
                border: '1px solid #e2e8f0'
            }
        });
    };
    return (
        <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900">
            {/* 2. Place Toaster here */}
            <Toaster position="top-right" reverseOrder={false} />

            <AdminSidebar
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
            />

            <main className="flex-1 flex flex-col min-w-0">
                <div className="h-16 lg:hidden" />

                <div className="p-6 md:p-10 lg:p-12 overflow-y-auto">
                    <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl capitalize">
                                Manage {mode}
                            </h1>
                            <p className="text-slate-500 mt-1 font-medium">Organize your content structure</p>
                        </div>

                        <div className="flex bg-slate-200 p-1 rounded-xl w-fit">
                            <button
                                onClick={() => setMode("categories")}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${mode === "categories" ? "bg-white shadow-sm text-indigo-600" : "text-slate-600"
                                    }`}
                            >
                                Categories
                            </button>
                            <button
                                onClick={() => setMode("tags")}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${mode === "tags" ? "bg-white shadow-sm text-indigo-600" : "text-slate-600"
                                    }`}
                            >
                                Tags
                            </button>
                        </div>
                    </header>

                    <form onSubmit={handleAdd} className="mb-10 flex gap-4 max-w-2xl">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder={`New ${mode.slice(0, -1)} name...`}
                                className="w-full pl-12 pr-6 py-4 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            {mode === "categories" ? (
                                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            ) : (
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            )}
                        </div>
                        <button
                            type="submit"
                            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                        >
                            <Plus className="w-5 h-5" /> Add
                        </button>
                    </form>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {items.length > 0 ? (
                            items.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-indigo-100 hover:shadow-md transition-all"
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className={`p-2 rounded-lg ${mode === 'categories' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                            {mode === "categories" ? <Tag className="w-4 h-4" /> : <Hash className="w-4 h-4" />}
                                        </div>
                                        <span className="font-bold truncate text-slate-700">{item.name}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="text-slate-300 hover:text-rose-500 p-2 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-400 italic">No {mode} found.</p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}