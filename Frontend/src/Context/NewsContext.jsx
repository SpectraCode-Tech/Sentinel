import { createContext, useState, useContext } from 'react';

const NewsContext = createContext();

export const NewsProvider = ({ children }) => {
    const [articles, setArticles] = useState([]);

    // Function to update a single article (e.g., adding a comment)
    const addCommentToArticle = (articleSlug, newComment) => {
        setArticles((prevArticles) =>
            prevArticles.map((article) =>
                article.slug === articleSlug
                    ? { ...article, comments: [newComment, ...article.comments] }
                    : article
            )
        );
    };

    return (
        <NewsContext.Provider value={{ articles, setArticles, addCommentToArticle }}>
            {children}
        </NewsContext.Provider>
    );
};

export const useNews = () => useContext(NewsContext);