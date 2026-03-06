import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-bg flex items-center justify-center px-4 text-center">

            <div className="max-w-xl">

                <div className="flex justify-center mb-6">
                    <AlertTriangle className="w-14 h-14 text-accent" />
                </div>

                <h1 className="text-6xl font-serif font-black text-headline mb-4">
                    404
                </h1>

                <h2 className="text-2xl font-serif font-bold mb-4 text-headline">
                    Page Not Found
                </h2>

                <p className="text-gray-500 font-serif italic mb-8">
                    The page you’re looking for does not exist or may have been removed.
                </p>

                <Link
                    to="/"
                    className="inline-block bg-headline text-white px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-accent transition"
                >
                    Return to Front Page
                </Link>

            </div>
        </div>
    );
}