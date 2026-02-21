import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import Editor from "./Pages/Editor";

function App() {
  const token = localStorage.getItem("access");

  return (
    <BrowserRouter>
      <Routes>
        {!token ? (
          <>
            <Route path="*" element={<Login />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" />} />
            <Route path="/editor" element={<Editor />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;