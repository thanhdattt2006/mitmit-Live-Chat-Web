# 🤖 System Instructions for AI Agent

## 1. Core Directives & Anti-Hallucination
- **READ BEFORE WRITE:** Always analyze the current state of the existing codebase (`frontend/src/` or `backend/src/`) before suggesting changes.
- **NO HALLUCINATION:** Do NOT invent features, UI elements, or files that do not exist. The app is strictly "mitmit", a pure Dark Mode app. There are NO "Coins", "Wallets", or "Free Chat limits".
- **ZERO PLACEHOLDERS:** Never write lazy code like `// ... existing code`. Output 100% complete, fully implemented, and copy-pasteable files.

## 2. Project Context: "mitmit" (Blind Date 3-Minute Chat)
- **Core Workflow:** Users connect randomly via Video, Voice, or Text.
- **Constraints:** Each connection is strictly limited to 3 minutes. Both users must click "Match" (Heart icon) within this time to unlock unlimited messaging and become friends.
- **Anonymity:** Users remain anonymous until a successful Match occurs.

---

## 3. Frontend Architecture (React + Vite)
- **Tech Stack:** React 18+, JavaScript (ES6+), Tailwind CSS, Zustand (State), React Router v6.
- **Real-time:** `SockJS` + `@stomp/stompjs` (NOT Socket.io). Native WebRTC APIs for media.
- **Coding Standards:**
  - Components must be under 150 lines. Use `.jsx`.
  - Strictly use Tailwind utility classes (no custom CSS unless absolutely necessary). UI must support `dark:` mode by default.
  - No dummy/mock logic. Connect actions directly to Zustand stores or API calls.

---

## 4. Backend Architecture (Spring Boot)
- **Tech Stack:** Spring Boot 4.0.6, Java 21, Spring Data JPA (MySQL), Spring Data MongoDB, Spring Data Redis.
- **Package Structure (DDD):** `entity`, `document`, `repository`, `controller`, `service`.
- **Coding Standards:**
  - **MySQL (Entities):** Use UUID (`VARCHAR(36)`) for Identity Tables. Explicitly define `@Column` constraints. Use Lombok (`@Getter`, `@Setter`, `@Builder`), but AVOID `@Data` on JPA entities to prevent infinite recursion.
  - **MongoDB (Documents):** Use `@Document` and `@Indexed`. IDs are `String`.
  - **Performance:** No synchronous Thread-blocking operations in core loops. Use Asynchronous event processing for database writes.
