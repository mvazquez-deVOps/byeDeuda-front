# Manual de Botones y Funcionalidades - Bye Deuda IA

Este documento sirve como un inventario exhaustivo de todos los componentes `<Button>` utilizados en la aplicación. El objetivo es proporcionar una referencia rápida sobre la funcionalidad, ubicación y posibles puntos de fallo de cada acción que el usuario puede realizar.

---

## 1. `/src/app/admin/agents/page.tsx`

### Botón: "Crear Usuario"
-   **Texto/Icono:** `<UserPlus /> Crear Usuario` / `<Loader2 /> Creando Usuario...`
-   **Ubicación:** `src/app/admin/agents/page.tsx`
-   **Funcionalidad:** Envía el formulario para crear un nuevo usuario (cliente, agente o superadmin) en Firebase Authentication y Firestore. Llama a la Server Action `createUser`.
-   **Posibles Errores:**
    -   Falla si el email ya está en uso.
    -   Falla si la contraseña es menor a 6 caracteres.
    -   Falla si el nombre tiene menos de 3 caracteres.
    -   La acción del servidor (`createUser`) fallará si el usuario que la ejecuta no tiene rol de `superadmin` (verificado en `admin-actions.ts`).

---

## 2. `/src/app/admin/content/edit/[slug]/page.tsx`

### Botón: "Volver al Gestor"
-   **Texto/Icono:** `<ChevronLeft /> Volver al Gestor`
-   **Ubicación:** `src/app/admin/content/edit/[slug]/page.tsx`
-   **Funcionalidad:** Es un link (`<Link>`) que navega al usuario de vuelta a la página principal del gestor de contenido (`/admin/content`).
-   **Posibles Errores:** Ninguno, es una navegación simple.

### Botón: "Guardar Cambios"
-   **Texto/Icono:** `<Save /> Guardar Cambios` / `<Loader2 />`
-   **Ubicación:** `src/app/admin/content/edit/[slug]/page.tsx`
-   **Funcionalidad:** Envía el formulario para crear o actualizar un recurso educativo. Llama a la Server Action `upsertResource`.
-   **Posibles Errores:**
    -   Falla si los campos no cumplen las validaciones de `zod` (títulos/contenidos muy cortos, URLs inválidas).
    -   La acción `upsertResource` puede fallar si hay un problema al escribir en Firestore.
    -   La acción fallará si el usuario no tiene permisos de `superadmin` (verificado en `admin-actions.ts`).

---

## 3. `/src/app/admin/content/page.tsx`

### Botón: "Crear Nuevo Contenido"
-   **Texto/Icono:** `<PlusCircle /> Crear Nuevo Contenido`
-   **Ubicación:** `src/app/admin/content/page.tsx`
-   **Funcionalidad:** Es un link (`<Link>`) que navega a la página de creación de un nuevo recurso (`/admin/content/new`).
-   **Posibles Errores:** Ninguno.

### Botón: Ver Recurso (en Tabla)
-   **Texto/Icono:** `<ExternalLink />`
-   **Ubicación:** `src/app/admin/content/page.tsx` (Dentro de `ContentTable`)
-   **Funcionalidad:** Abre la vista pública del recurso en una nueva pestaña.
-   **Posibles Errores:** Ninguno, es un link estándar.

### Botón: Editar Recurso (en Tabla)
-   **Texto/Icono:** `<Pencil />`
-   **Ubicación:** `src/app/admin/content/page.tsx` (Dentro de `ContentTable`)
-   **Funcionalidad:** Navega a la página de edición para ese recurso específico.
-   **Posibles Errores:** Ninguno.

### Botón: Eliminar Recurso (Trigger de Diálogo)
-   **Texto/Icono:** `<Trash />`
-   **Ubicación:** `src/app/admin/content/page.tsx` (Dentro de `ContentTable`)
-   **Funcionalidad:** Abre un diálogo de confirmación (`AlertDialog`) para eliminar un recurso.
-   **Posibles Errores:** Ninguno, solo abre el diálogo.

### Botón: "Sí, eliminar" (en Diálogo)
-   **Texto/Icono:** `Sí, eliminar`
-   **Ubicación:** `src/app/admin/content/page.tsx` (Dentro de `AlertDialog`)
-   **Funcionalidad:** Ejecuta la función `handleDelete`, que a su vez llama a la Server Action `deleteResource` para eliminar el documento de Firestore.
-   **Posibles Errores:**
    -   La acción fallará si el ID del recurso no es válido.
    -   Falla si el usuario no tiene permisos de `superadmin`.

---

## 4. `/src/app/admin/fix/page.tsx`

### Botón: "Convertir en Superadmin"
-   **Texto/Icono:** `Convertir en Superadmin` / `<Loader2 /> Asignando Rol...`
-   **Ubicación:** `src/app/admin/fix/page.tsx`
-   **Funcionalidad:** Llama a la Server Action `forceSuperAdminRole`, que busca un usuario por su email y le asigna el rol de `superadmin` en Firebase Auth (claims) y Firestore.
-   **Posibles Errores:**
    -   Falla si el email no se encuentra en la base de datos.
    -   La acción `forceSuperAdminRole` está protegida y solo puede ser ejecutada por un `superadmin` ya existente. Si la cookie de sesión no es válida o no tiene el rol, la acción fallará.

---

## 5. `/src/app/admin/inbox/page.tsx`

### Botón: Selección de Hilo de Chat
-   **Texto/Icono:** (Contenido dinámico del hilo de chat)
-   **Ubicación:** `src/app/admin/inbox/page.tsx` (Componente `ChatThreadList`)
-   **Funcionalidad:** Al hacer clic, actualiza el estado `activeThreadId` para mostrar los mensajes de esa conversación en el componente `ChatConsole`. También marca el hilo como leído para el admin.
-   **Posibles Errores:** Mínimos. Podría fallar al marcar como leído si la función `markThreadAsReadForRole` tiene problemas, pero la UI se actualizará igualmente.

### Botón: Enviar Mensaje
-   **Texto/Icono:** `<Send />` / `<Loader2 />`
-   **Ubicación:** `src/app/admin/inbox/page.tsx` (Componente `ChatConsole`)
-   **Funcionalidad:** Llama a la Server Action `sendChatMessage` para guardar el mensaje del agente en la subcolección `messages` del hilo de chat activo en Firestore.
-   **Posibles Errores:**
    -   Falla si `threadId` o `userId` son nulos.
    -   Falla si hay un problema de permisos de escritura en Firestore (improbable si el admin tiene sesión).
    -   Falla si el servidor está caído.

---

## 6. `/src/app/dashboard/add-debt/page.tsx`

### Botón: "Volver al Dashboard"
-   **Texto/Icono:** `<ChevronLeft /> Volver al Dashboard`
-   **Ubicación:** `src/app/dashboard/add-debt/page.tsx`
-   **Funcionalidad:** Navega al usuario de vuelta al dashboard principal (`/dashboard`).
-   **Posibles Errores:** Ninguno.

### Botón: "Obtener Diagnóstico y Registrar"
-   **Texto/Icono:** `<Bot /> Obtener Diagnóstico y Registrar` / `Analizando Deuda...`
-   **Ubicación:** `src/app/dashboard/add-debt/page.tsx`
-   **Funcionalidad:**
    1.  Llama a la Server Action `analyzeDebt` para obtener un análisis de riesgo básico de la IA.
    2.  Con el resultado, llama a la función `createDebt` para guardar la deuda y el análisis en Firestore.
    3.  Redirige al usuario a la página de detalle de la nueva deuda.
-   **Posibles Errores:**
    -   La acción `analyzeDebt` puede fallar si el modelo de IA no responde o los datos son incorrectos.
    -   La función `createDebt` puede fallar si el usuario no está autenticado o hay un error de escritura en Firestore.
    -   Se mostrará una notificación (`toast`) al usuario en caso de error.

---

## 7. `/src/app/dashboard/debt/[id]/kit/page.tsx`

### Botón: "Volver al Dashboard"
-   **Texto/Icono:** `<ChevronLeft /> Volver al Dashboard`
-   **Ubicación:** `src/app/dashboard/debt/[id]/kit/page.tsx`
-   **Funcionalidad:** Navega de vuelta a la página principal del dashboard.
-   **Posibles Errores:** Ninguno.

### Botón: "Descargar Kit (PDF)"
-   **Texto/Icono:** `<Download /> Descargar Kit (PDF)`
-   **Ubicación:** `src/app/dashboard/debt/[id]/kit/page.tsx`
-   **Funcionalidad:** Dispara la función `window.print()`, que utiliza estilos de CSS (`@media print`) para generar una vista de impresión/PDF del kit de defensa.
-   **Posibles Errores:** El formateo del PDF puede variar entre navegadores.

---

## 8. `/src/app/page.tsx` (Landing Page)

### Botón: "Comenzar Gratis" (Header)
-   **Ubicación:** `src/app/page.tsx`
-   **Funcionalidad:** Navega a la página de registro (`/register`).
-   **Posibles Errores:** Ninguno.

### Botón: "Crear mi Plan" (Formulario Hero)
-   **Ubicación:** `src/app/page.tsx`
-   **Funcionalidad:** Envía el formulario (aunque el input es solo decorativo) y redirige al usuario a la página de registro (`/register`).
-   **Posibles Errores:** Ninguno.

### Botón: "Crear cuenta gratis" (Plan Básico)
-   **Ubicación:** `src/app/page.tsx`
-   **Funcionalidad:** Navega a la página de registro.
-   **Posibles Errores:** Ninguno.

### Botón: "Comenzar Autogestión" (Plan Libertad Total)
-   **Ubicación:** `src/app/page.tsx`
-   **Funcionalidad:** Navega a la página de registro (`/register`) con un parámetro en la URL (`?plan=...`) para pre-seleccionar el plan.
-   **Posibles Errores:** Ninguno.

### Botón: "Solicitar Asesoría" (Plan VIP)
-   **Ubicación:** `src/app/page.tsx`
-   **Funcionalidad:** Navega a la página de registro (`/register`) con el parámetro del plan VIP en la URL.
-   **Posibles Errores:** Ninguno.

---

*Nota: La lista anterior es una selección representativa de los botones más importantes y se irá actualizando conforme el proyecto crezca.*
