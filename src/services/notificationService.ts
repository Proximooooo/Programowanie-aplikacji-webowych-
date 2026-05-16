import { notificationApi } from "../api/notificationApi";
import type { Notification, NotificationPriority } from "../models/Notification";

type NotificationListener = (notification: Notification) => void;

const listeners = new Set<NotificationListener>();

async function emit(notification: Notification) {
  if (notification.priority === "medium" || notification.priority === "high") {
    listeners.forEach((listener) => listener(notification));
  }
}

async function createAndEmit(input: {
  title: string;
  message: string;
  priority: NotificationPriority;
  recipientId: string;
}) {
  const created = await notificationApi.create(input);
  await emit(created);
  return created;
}

export const notificationService = {
  subscribe(listener: NotificationListener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async notifyNewProjectToAdmins(adminIds: string[], projectName: string) {
    await Promise.all(
      adminIds.map((adminId) =>
        createAndEmit({
          title: "Utworzono nowy projekt",
          message: `W systemie utworzono projekt: "${projectName}".`,
          priority: "high",
          recipientId: adminId,
        })
      )
    );
  },

  async notifyAssignmentToStoryOrTask(recipientId: string, itemName: string) {
    await createAndEmit({
      title: "Przypisanie do historyjki/zadania",
      message: `Zostales przypisany do: "${itemName}".`,
      priority: "high",
      recipientId,
    });
  },

  async notifyTaskAddedToStoryOwner(recipientId: string, storyName: string, taskName: string) {
    await createAndEmit({
      title: "Nowe zadanie w historyjce",
      message: `Do historyjki "${storyName}" dodano zadanie: "${taskName}".`,
      priority: "medium",
      recipientId,
    });
  },

  async notifyTaskRemovedFromStoryOwner(recipientId: string, storyName: string, taskName: string) {
    await createAndEmit({
      title: "Usunieto zadanie z historyjki",
      message: `Z historyjki "${storyName}" usunieto zadanie: "${taskName}".`,
      priority: "medium",
      recipientId,
    });
  },

  async notifyTaskStatusChangedToStoryOwner(
    recipientId: string,
    storyName: string,
    taskName: string,
    taskStatus: "doing" | "done"
  ) {
    const priority: NotificationPriority = taskStatus === "done" ? "medium" : "low";
    await createAndEmit({
      title: "Zmiana statusu zadania w historyjce",
      message: `W historyjce "${storyName}" zadanie "${taskName}" ma status "${taskStatus}".`,
      priority,
      recipientId,
    });
  },

  async seedExampleNotifications(recipientId: string) {
    const current = await notificationApi.listByRecipient(recipientId);
    if (current.length > 0) return;

    await createAndEmit({
      title: "Utworzono nowy projekt",
      message: "Projekt „Aplikacja Webowa” zostal utworzony.",
      priority: "high",
      recipientId,
    });

    await createAndEmit({
      title: "Nowe zadanie w historyjce",
      message: "Dodano zadanie „Przygotowac makiety UI” do historyjki „Panel uzytkownika”.",
      priority: "medium",
      recipientId,
    });

    await notificationApi.create({
      title: "Zmiana statusu zadania w historyjce",
      message: "Zadanie „Konfiguracja routingu” zmienilo status na doing.",
      priority: "low",
      recipientId,
    });
  },
};
