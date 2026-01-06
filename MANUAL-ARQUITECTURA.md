# Manual de Arquitectura del Backend - Bye Deuda IA

Este documento describe las carpetas y archivos clave que constituyen el backend (lógica del servidor) de la aplicación.

---

## Arquitectura General

El proyecto utiliza una arquitectura de Next.js con el App Router, donde la lógica del backend está distribuida en varias áreas clave, aprovechando las **Server Actions** y las **API Routes**.

---

## 1. `src/app/api/` - Endpoints de API Tradicionales

-   **Responsabilidad:** Contiene los endpoints de API RESTful que se ejecutan exclusivamente en el servidor. Se utilizan para tareas muy específicas que se ajustan bien al modelo de solicitud-respuesta.
-   **Archivos Clave:**
    -   `auth/session/route.ts`: Gestiona la creación y eliminación de las cookies de sesión seguras (`httpOnly`), que son el puente entre la autenticación del cliente (Firebase Auth) y la sesión del servidor.
    -   `checkout/route.ts`: Se comunica de forma segura con la API de Stripe para crear sesiones de pago, sin exponer claves secretas al cliente.

## 2. `src/ai/` - El Cerebro de Inteligencia Artificial (Backend de IA)

-   **Responsabilidad:** Contiene toda la configuración y la lógica para las funcionalidades de Inteligencia Artificial. Todo el código en esta carpeta se ejecuta en el servidor.
-   **Archivos Clave:**
    -   `genkit.ts`: Configura la instancia principal de Genkit, define los plugins a utilizar (como `googleAI`) y el modelo de lenguaje por defecto (Gemini).
    -   `dev.ts`: Es el punto de entrada para el servidor de desarrollo de Genkit. Su función más crítica es **cargar y reparar la clave privada (PEM)** desde las variables de entorno antes de que cualquier servicio la utilice, resolviendo los problemas de formato.
    -   `flows/`: Cada archivo en esta carpeta (`analyzeDebtFlow.ts`, `legalAssistantChat.ts`, etc.) define un "flujo" de IA. Un flujo es una capacidad específica que encapsula la lógica del prompt, la definición de los esquemas de entrada y salida (`zod`), y la llamada al modelo de lenguaje.

## 3. `src/app/actions.ts` - Acciones del Servidor para Clientes

-   **Responsabilidad:** Este es uno de los archivos de backend más importantes. Contiene todas las **Server Actions** que pueden ser llamadas por los componentes del cliente (páginas del `dashboard/`, etc.). Permiten una comunicación fluida y segura sin necesidad de crear endpoints de API manualmente.
-   **Funcionalidad:** Actúa como un puente seguro entre el frontend y los flujos de IA. Una página de cliente llama a una función en `actions.ts`, y esta a su vez ejecuta el flujo de Genkit correspondiente en el servidor y devuelve el resultado.

## 4. `src/lib/` - Lógica de Servidor y Admin

-   **Responsabilidad:** Aunque esta carpeta contiene utilidades tanto para el cliente como para el servidor, varios de sus archivos son exclusivamente de backend y de alta importancia.
-   **Archivos Clave del Backend:**
    -   `admin-firebase.ts`: Inicializa el **SDK de Firebase Admin**. Este SDK utiliza credenciales de servicio (la clave PEM) y tiene acceso completo y privilegiado a toda la base de datos de Firestore y los servicios de autenticación, saltándose las reglas de seguridad. **Es el corazón del acceso a datos del backend**.
    -   `admin-actions.ts`: Similar a `actions.ts`, pero contiene Server Actions que solo pueden ser ejecutadas por un superadministrador. Cada función aquí está protegida por una verificación de rol (`verifySuperAdmin`) para tareas sensibles como crear usuarios, cambiar roles o gestionar contenido global.
    -   `debt.ts`, `user.ts`, `resources.ts`: Contienen la lógica del servidor para las operaciones de base de datos (Crear, Leer, Actualizar, Borrar - CRUD) utilizando el SDK de Firebase Admin. Por ejemplo, `createDebt` guarda una nueva deuda en Firestore.

---

En resumen, cualquier código que se ejecute bajo el `async function()` con la directiva `'use server'` al inicio, o que resida dentro de las carpetas `src/app/api/` y `src/ai/`, o que utilice el `adminDb` desde `src/lib/admin-firebase.ts`, se considera parte del **backend** de la aplicación.
