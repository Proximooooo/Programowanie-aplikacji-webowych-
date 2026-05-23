# ManageMe – dokumentacja programu

## 1. Co to jest ten program?

**ManageMe** to webowa aplikacja do prostego zarządzania pracą zespołu w stylu tablicy Kanban.  
Pozwala użytkownikowi:

- zalogować się do systemu,
- wybrać aktywny projekt,
- **dodać nowy projekt** z poziomu interfejsu,
- przeglądać i zarządzać „historyjkami” (zadaniami) w kolumnach:
  - **todo** (do zrobienia),
  - **doing** (w trakcie),
  - **done** (zrobione),
- otrzymywać i przeglądać powiadomienia związane ze zmianami.

Aplikacja działa po stronie przeglądarki i używa **localStorage** jako lokalnej bazy danych (bez prawdziwego backendu).

---

## 2. Technologie i architektura

### Stack technologiczny

- **React** + **TypeScript**
- **Vite** (uruchamianie i budowanie projektu)
- **React Router** (routing stron)
- **localStorage** (przechowywanie danych)

### Ogólna architektura

Projekt jest podzielony na warstwy:

- `src/pages` – strony aplikacji (widoki),
- `src/components` – komponenty UI wielokrotnego użytku,
- `src/api` – „warstwa API” operująca na localStorage (CRUD, sesja),
- `src/services` – logika domenowa ponad API (np. obsługa powiadomień, aktywny projekt),
- `src/models` – typy danych TypeScript.

Dzięki temu logika biznesowa jest odseparowana od widoków.

---

## 3. Routing i ekrany aplikacji

Główny router znajduje się w `src/App.tsx`.

### Dostępne ścieżki

- `/login` – ekran logowania (`LoginPage`)
- `/` – główny ekran historyjek (`HistoryjkiPage`)
- `/notifications` – lista powiadomień (`NotificationsPage`)
- `/notifications/:id` – szczegóły pojedynczego powiadomienia (`NotificationDetailsPage`)
- `*` – przekierowanie na `/`

---

## 4. Jak działa logowanie i sesja?

### Kluczowe pliki

- `src/api/authApi.ts`
- `src/auth/useAuth.ts`
- `src/pages/LoginPage.tsx`

### Mechanizm

1. Przy logowaniu wywoływane jest `authApi.login(login, password)`.
2. Użytkownicy są trzymani w localStorage pod kluczem:
   - `manageme.users.v1`
3. Aktywna sesja użytkownika zapisywana jest pod kluczem:
   - `manageme.session.v1`
4. Hook `useAuth()`:
   - trzyma stan `user` i `loading`,
   - udostępnia `login`, `logout`, `refresh`,
   - przy starcie pobiera aktualnego użytkownika (`authApi.me()`).

### Konta demo (seed)

Jeżeli localStorage nie ma użytkowników, system tworzy domyślne konta:

- `admin / Admin123!` (ADMIN)
- `pracownik / Pracownik123!` (WORKER)
- `janek / Janek123!` (WORKER)

---

## 5. Jak działa główny ekran historyjek?

### Kluczowy plik

- `src/pages/HistoryjkiPage.tsx`

### Co robi ekran?

1. Sprawdza, czy użytkownik jest zalogowany:
   - jeśli nie, przekierowuje na `/login`.
2. Ładuje:
   - dane bieżącego użytkownika (`uzytkownikApi.get()`),
   - listę projektów (`projektApi.list()`),
   - historyjki dla aktywnego projektu (`historyjkiApi.listByProjekt()`).
3. Pamięta wybrany projekt w localStorage przez:
   - `aktywnyProjektService` i klucz `manageme.aktywnyProjektId.v1`.
4. Umożliwia utworzenie nowego projektu:
   - przycisk **„➕ Dodaj projekt”** w nagłówku,
   - podanie nazwy (wymagane) i opisu (opcjonalne),
   - zapis przez `projektApi.create`,
   - ustawienie nowego projektu jako aktywnego.
5. Wyświetla historyjki w 3 kolumnach Kanban:
   - `todo`, `doing`, `done`.
6. Umożliwia operacje:
   - dodanie historyjki,
   - edycję historyjki,
   - usunięcie historyjki,
   - zmianę statusu historyjki.
7. Aktualizuje licznik powiadomień i pokazuje modal powiadomienia dla ważniejszych alertów.

---

## 6. Modele danych (TypeScript)

### `Historyjka` (`src/models/Historyjka.ts`)

- `id`
- `nazwa`
- `opis`
- `priorytet`: `niski | sredni | wysoki`
- `projektId`
- `dataUtworzenia` (ISO)
- `stan`: `todo | doing | done`
- `wlascicielId`

### `Projekt` (`src/models/Projekt.ts`)

- `id`
- `nazwa`
- `opis`

### `Uzytkownik` (`src/models/Uzytkownik.ts`)

- `id`
- `imie`
- `nazwisko`
- `rola`: `admin | user`

### `User` (auth) (`src/models/User.ts`)

- `id`
- `login`
- `password` (wersja demo, plain text)
- `role`: `ADMIN | WORKER`
- `displayName`

### `Notification` (`src/models/Notification.ts`)

- `id`
- `title`
- `message`
- `date`
- `priority`: `low | medium | high`
- `isRead`
- `recipientId`

---

## 7. Warstwa API (localStorage)

W folderze `src/api` znajdują się moduły imitujące backend.

### `historyjkiApi.ts`

- `list`, `listByProjekt`, `get`
- `create`, `update`, `remove`
- `changeStan`
- `ensureHistoryjkiSeed` (dane startowe)

Dane historyjek: `manageme.historyjki.v1`

### `projektApi.ts`

- `list`, `get`, `create`, `update`, `remove`
- `ensureProjektySeed` (projekty startowe)

Dane projektów: `manageme.projekty.v1`

### `notificationApi.ts`

- `listByRecipient`, `getById`
- `create`
- `markAsRead`, `markAllAsRead`
- `unreadCount`

Dane powiadomień: `manageme.notifications.v1`

### `authApi.ts`

- `login`, `logout`, `me`, `listUsers`
- `ensureAuthSeed` (konta demo)

---

## 8. Usługi (logika dodatkowa)

### `notificationService.ts`

Dostarcza wyższy poziom logiki powiadomień:

- tworzenie i emitowanie powiadomień,
- subskrypcja (`subscribe`) do reakcji UI na nowe ważniejsze powiadomienia,
- gotowe metody domenowe, np.:
  - powiadomienie o nowym projekcie,
  - przypisaniu,
  - zmianie statusu,
  - usunięciu zadania/historyjki.

W `HistoryjkiPage` jest też logika informująca adminów o zdarzeniach wykonywanych przez pracownika.

### `aktywnyProjektService.ts`

Prosty serwis do zapisu/odczytu aktywnego projektu (wyboru z nagłówka) w localStorage.

---

## 9. Komponenty UI

### `Header.tsx`

- nazwa aplikacji,
- wybór projektu,
- przycisk **„➕ Dodaj projekt”**,
- przycisk powiadomień z licznikiem,
- informacje o użytkowniku,
- wylogowanie.

### `HistoryjkaKarta.tsx`

- karta pojedynczej historyjki,
- akcje: edycja, usunięcie, zmiana statusu.

### `HistoryjkaForm.tsx`

- modal formularza dodawania/edycji:
  - nazwa,
  - opis,
  - priorytet,
  - stan.

### `NotificationDialog.tsx`

- modal wyskakujący dla nowych powiadomień (szczególnie medium/high).

---

## 10. Przepływ działania programu (krok po kroku)

1. Użytkownik otwiera aplikację.
2. Jeśli nie jest zalogowany, trafia na `/login`.
3. Po poprawnym logowaniu:
   - zapisywana jest sesja,
   - użytkownik przechodzi na `/`.
4. Strona główna:
   - ładuje użytkownika i projekty,
   - wybiera aktywny projekt (z pamięci lub pierwszy dostępny),
   - pozwala utworzyć nowy projekt przyciskiem „Dodaj projekt”,
   - ładuje historyjki aktywnego projektu.
5. Użytkownik zarządza historyjkami (dodaje, edytuje, usuwa, zmienia status).
6. System tworzy odpowiednie powiadomienia (dla użytkownika/adminów).
7. Powiadomienia można:
   - przeglądać na liście `/notifications`,
   - otwierać szczegóły `/notifications/:id`,
   - oznaczać jako przeczytane pojedynczo lub zbiorczo.
8. Wylogowanie usuwa sesję i kończy dostęp do chronionych ekranów.

---

## 11. Jak uruchomić projekt?

### Wymagania

- Node.js (zalecana aktualna wersja LTS)
- npm

### Kroki

```bash
npm install
npm run dev
```

Aplikacja uruchomi się lokalnie (zwykle pod adresem podanym przez Vite, np. `http://localhost:5173`).

---

## 12. Ograniczenia i uwagi

- To jest wersja **demo** – brak prawdziwego backendu i bazy danych.
- Dane są trzymane lokalnie w przeglądarce (`localStorage`), więc:
  - działają per przeglądarka/profil,
  - można je usunąć czyszcząc dane przeglądarki.
- Hasła użytkowników są przechowywane jawnie (plain text) – tylko do celów edukacyjnych.
- Formularz dodawania projektu jest obecnie oparty o okna `prompt` (lekka implementacja UI).

---

## 13. Podsumowanie

Program realizuje workflow:
**logowanie → wybór/dodanie projektu → zarządzanie historyjkami → powiadomienia**.

Kod jest podzielony na czytelne moduły (pages/components/api/services/models), co ułatwia dalszy rozwój, np. podmianę localStorage na prawdziwe REST API i rozbudowę formularza tworzenia projektu do pełnego modala.
