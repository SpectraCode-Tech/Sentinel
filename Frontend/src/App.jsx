import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import ArticleDetail from "./Pages/ArticleDetail";
import SearchResults from "./Pages/SearchResults";
import CategoryPage from "./Pages/CategoryPage";
import Footer from "./Components/Footer";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/articles/:id" element={<ArticleDetail />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/category/:slug" element={<CategoryPage />} />

      </Routes>
      <Footer />
    </BrowserRouter>

  );
}
