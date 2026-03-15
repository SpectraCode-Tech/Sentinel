import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./Pages/Home";
import ArticleDetail from "./Pages/ArticleDetail";
import SearchResults from "./Pages/SearchResults";
import CategoryPage from "./Pages/CategoryPage";
import Login from "./Pages/Login";
import NotFound from "./Pages/NotFound";
import ProtectedRoute from "./Components/ProtectedRoute";
import Footer from "./Components/Footer";
import Register from "./Pages/Register";
import Profile from "./Pages/Profile";
import { Toaster } from "react-hot-toast";

export default function App() {

  return (
    <BrowserRouter>

      <Toaster
        position="top-center"
        toastOptions={{
          // Default duration for all toasts
          duration: 3000,
          style: {
            background: '#fff',
            color: '#000',
          },
        }}
      />
      <Routes>

        {/* Public */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        {/* Protected */}
        <Route
          path="/Home"
          element={
              <Home />
          }
        />

        <Route
          path="/articles/:slug"
          element={
              <ArticleDetail />
          }
        />

        <Route
          path="/search"
          element={
              <SearchResults />
          }
        />

        <Route
          path="/category/:slug"
          element={
              <CategoryPage />
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>

      <Footer />

    </BrowserRouter>
  );
}