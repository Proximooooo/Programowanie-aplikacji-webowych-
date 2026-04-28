import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HistoryjkiPage from "./pages/HistoryjkiPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<HistoryjkiPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

