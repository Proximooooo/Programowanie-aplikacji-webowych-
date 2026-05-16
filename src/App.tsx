import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HistoryjkiPage from "./pages/HistoryjkiPage";
import NotificationsPage from "./pages/NotificationsPage";
import NotificationDetailsPage from "./pages/NotificationDetailsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<HistoryjkiPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/notifications/:id" element={<NotificationDetailsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

