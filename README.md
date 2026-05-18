# mitmit - Live Chat Web

This document lists the main libraries, frameworks, and tools utilized in this project for both the backend and frontend environments.

## ⚙️ Backend (Java / Spring Boot)

**Core Stack:**
* **Java**: 21
* **Spring Boot**: 4.0.6

**Dependencies:**
```md
# Project Libraries & Dependencies

This document outlines the primary libraries, frameworks, and tools used in this project for both the Backend and Frontend.

## Backend (Java / Spring Boot)
Built with **Java 21** and **Spring Boot v4.0.6**.

**Core Spring Boot Dependencies:**
*   **Spring WebMVC:** For building RESTful APIs.
*   **Spring Data JPA:** For ORM and SQL database interactions.
*   **Spring Data Redis:** For caching and interacting with Redis.
*   **Spring Security:** For handling authentication and authorization.
*   **Spring Security OAuth2 Client:** For OAuth2/social login integrations.
*   **Spring WebSocket:** For real-time, two-way communication.
*   **Spring Boot Actuator:** For monitoring and managing the application health.
*   **Spring Boot Validation:** For data validation.

**Database & AI:**
*   **MySQL Connector/J:** JDBC driver for connecting to the MySQL database.
*   **Spring AI Starter Vector Store MongoDB Atlas (v2.0.0-M5):** For AI integrations and vector data storage using MongoDB Atlas.

**Utilities:**
*   **Lombok:** For reducing boilerplate Java code (getters, setters, builders, etc.).

*(Note: Standard Spring Boot testing modules are also included for unit and integration testing).*

---

## Frontend (React / Vite)
Built using **Vite v8.0** and **React v19.2**.

**Core Framework & State Management:**
*   **React & React DOM:** Core UI library.
*   **React Router DOM (v7.15):** For application routing and navigation.
*   **Zustand (v5.0):** For lightweight, fast global state management.

**Styling & UI Tools:**
*   **Tailwind CSS (v4.2):** Utility-first CSS framework for styling.
*   **clsx & tailwind-merge:** Utilities for constructing and merging conditional Tailwind CSS class names.
*   **Lucide React:** For beautiful, consistent SVG icons.
*   **Emoji Picker React:** For an integrated emoji selection UI.
*   **Canvas Confetti:** For triggering confetti visual effects.

**Build Tools & Dev Dependencies:**
