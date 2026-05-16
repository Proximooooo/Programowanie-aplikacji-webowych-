import type { Notification } from "../models/Notification";
import "./NotificationDialog.css";

interface NotificationDialogProps {
  notification: Notification | null;
  onClose: () => void;
}

export default function NotificationDialog({ notification, onClose }: NotificationDialogProps) {
  if (!notification) return null;

  return (
    <div className="notification-dialog-overlay" onClick={onClose}>
      <div className={`notification-dialog ${notification.priority}`} onClick={(e) => e.stopPropagation()}>
        <div className="notification-dialog-header">
          <strong>🔔 {notification.title}</strong>
          <button className="notification-dialog-close" onClick={onClose}>✕</button>
        </div>
        <p className="notification-dialog-message">{notification.message}</p>
        <div className="notification-dialog-footer">
          <span>Priorytet: {notification.priority}</span>
          <span>{new Date(notification.date).toLocaleString("pl-PL")}</span>
        </div>
      </div>
    </div>
  );
}
