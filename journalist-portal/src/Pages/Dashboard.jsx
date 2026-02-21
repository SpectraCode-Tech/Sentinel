import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
    const [articles, setArticles] = useState([]);
    const [statusFilter, setStatusFilter] = useState("");
    const token = localStorage.getItem("access");

    const fetchArticles = async (status = "") => {
        if (!token) return; // Not logged in

        try {
            const url = `http://127.0.0.1:8000/articles/?dashboard=1${status ? `&status=${status}` : ""
                }`;

            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setArticles(res.data.results || res.data);
        } catch (err) {
            console.error("Error fetching articles:", err);
            alert("Failed to load articles. Is the backend running?");
        }
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    const handleStatusChange = (e) => {
        const status = e.target.value;
        setStatusFilter(status);
        fetchArticles(status);
    };

    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold mb-6">My Articles</h1>

            <select
                value={statusFilter}
                onChange={handleStatusChange}
                className="border p-2 mb-6"
            >
                <option value="">All</option>
                <option value="draft">Draft</option>
                <option value="review">In Review</option>
                <option value="published">Published</option>
                <option value="rejected">Rejected</option>
            </select>

            {articles.length === 0 ? (
                <p>No articles found.</p>
            ) : (
                articles.map((article) => (
                    <div key={article.id} className="p-4 border mb-4">
                        <h2 className="font-bold">{article.title}</h2>
                        <p>Status: {article.status}</p>
                    </div>
                ))
            )}
        </div>
    );
}