export type ISOString = string;
export type UserID = string;
export type NotificationPriority = "low" | "medium" | "high";

export type Notification = {
  id: string;
  title: string;
  message: string;
  date: ISOString;
  priority: NotificationPriority;
  isRead: boolean;
  recipientId: UserID;
};

export type NotificationCreateInput = Omit<Notification, "id" | "date" | "isRead"> & {
  date?: ISOString;
  isRead?: boolean;
};
