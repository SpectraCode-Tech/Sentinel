import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./auth/Login";
import ProtectedRoute from "./auth/ProtectedRoute";
import JournalistDashboard from "./journalist/JournalistDashboard";
import Editor from "./journalist/Editor";
import MyArticles from "./journalist/MyArticles";
import EditorDashboard from "./editor/EditorDashboard";
import ReviewQueue from "./editor/ReviewQueue";
import EditorArticleWorkspace from "./editor/EditorArticleWorkspace";
import StaffDirectory from "./editor/StaffDirectory";
import AdminDashboard from "./admin/AdminDashboard";
import UserManagement from "./admin/UserManagement";
import AdminCategories from "./admin/CategoryManagement";
import AdminArticles from "./admin/ArticleManagement";
import AdsManagement from "./admin/AdsManagement";
import ArticleReader from "./admin/Article";
import NotFound from "./NotFound";
import SidebarBlocksManagement from "./admin/SideBarBlocks";
import EditorArticleReader from "./editor/EditorArticle";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default route */}
        {/* <Route path="/" element={<Navigate to="/login" />} /> */}

        <Route path="/" element={<Login />} />

        {/* Journalist Routes */}
        <Route
          path="/journalist"
          element={
            <ProtectedRoute role="JOURNALIST">
              <JournalistDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/journalist/new"
          element={
            <ProtectedRoute role="JOURNALIST">
              <Editor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/journalist/articles"
          element={
            <ProtectedRoute role="JOURNALIST">
              <MyArticles />
            </ProtectedRoute>
          }
        />

        <Route
          path="/journalist/articles/edit/:slug"
          element={
            <ProtectedRoute role="JOURNALIST">
              <Editor />
            </ProtectedRoute>
          }
        />

        {/* Editor Routes */}
        <Route
          path="/editor"
          element={
            <ProtectedRoute role="EDITOR">
              <EditorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/editor/articles/:slug/view"
          element={
            <ProtectedRoute role="EDITOR">
              <EditorArticleReader />
            </ProtectedRoute>
          }
        />

        <Route
          path="/editor/staff"
          element={
            <ProtectedRoute role="EDITOR">
              <StaffDirectory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/editor/reviews"
          element={
            <ProtectedRoute role="EDITOR">
              <ReviewQueue />
            </ProtectedRoute>
          }
        />

        <Route
          path="/editor/articles/:slug"
          element={
            <ProtectedRoute role="EDITOR">
              <EditorArticleWorkspace />
            </ProtectedRoute>
          }
        />

        {/*Admin Routes*/}
        
        <Route path="/admin" element={<ProtectedRoute role="ADMIN">
          <AdminDashboard />
        </ProtectedRoute>} />

        <Route path="/admin/sidebar-blocks" element={<ProtectedRoute role="ADMIN">
          <SidebarBlocksManagement />
        </ProtectedRoute>} />

        <Route path="/admin/articles/:slug" element={<ProtectedRoute role="ADMIN">
          <ArticleReader />
        </ProtectedRoute>} />

        <Route path="/admin/articles" element={<ProtectedRoute role="ADMIN">
          <AdminArticles />
        </ProtectedRoute>} />

        <Route path="/admin/users" element={<ProtectedRoute role="ADMIN">
          <UserManagement />
        </ProtectedRoute>} />

          <Route path="/admin/categories" element={<ProtectedRoute role="ADMIN">
            <AdminCategories />
          </ProtectedRoute>} />
          
          <Route path="/admin/advertisements" element={<ProtectedRoute role="ADMIN">
            <AdsManagement />
          </ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;