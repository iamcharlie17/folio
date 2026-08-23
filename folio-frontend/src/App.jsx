import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import LibraryPage from "./pages/LibraryPage";
import BookPage from "./pages/BookPage";

// This checks if the user is logged in.
// If not, it sends them to the login page instead of showing the page.
function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/library"
          element={
            <RequireAuth>
              <LibraryPage />
            </RequireAuth>
          }
        />

        <Route
          path="/books/:bookId"
          element={
            <RequireAuth>
              <BookPage />
            </RequireAuth>
          }
        />

        <Route path="/" element={<Navigate to="/library" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
