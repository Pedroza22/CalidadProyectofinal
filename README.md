# Clase UCC - Aplicativo React con Vite

## Descripción

Este proyecto es un aplicativo desarrollado en **React con Vite** para aprender y aplicar **pruebas unitarias** con Jest más la integración continua con GitHub Actions.

El aplicativo incluye:

* **Sidebar con acordeón** para navegación.
* **Componentes de ejemplo** para verificar dependencias.
* **Ejercicios con pruebas unitarias**:

  * Tablas de Multiplicar (`TablasMul.tsx`)
  * Conversor de Unidades (`UnitConverter.tsx`)
  * Validador de Contraseñas (`PasswordValidator.tsx`)
  * Contador de Clics (`ClickCounter.tsx`)
  * Lista de Tareas (`TodoList.tsx`)

---

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/guswill24/ucc_ing_web.git
cd clase-ucc
```

Instalar dependencias:

```bash
npm install
```

---

## Scripts disponibles

* **Iniciar servidor de desarrollo**

```bash
npm run dev
```

* **Compilar para producción**

```bash
npm run build
```

* **Previsualizar build de producción**

```bash
npm run preview
```

* **Ejecutar pruebas unitarias**

```bash
npm test
```

* **Revisar tipos TypeScript**

```bash
npm run type-check
```

* **Linting y formateo**

```bash
npm run lint
npm run format
```

---

## Estructura de Carpetas

```
src/
├─ components/       # Componentes reutilizables (Sidebar, UnitConverter, etc.)
├─ views/            # Vistas de cada ejercicio y ejemplo
├─ AppRoutes.tsx     # Rutas principales
└─ main.tsx          # Entrada principal de React
```

---

## Componentes y funcionalidades

1. **Sidebar.tsx**: Menú lateral con acordeón, permite agrupar ejercicios y ejemplos.
2. **UnitConverter.tsx**: Conversor de unidades (Celsius ↔ Fahrenheit) con input controlado.
3. **PasswordValidator.tsx**: Validador de contraseñas dinámico, muestra requisitos cumplidos.
4. **ClickCounter.tsx**: Contador de clics persistente usando `localStorage`.
5. **TodoList.tsx**: Lista de tareas con agregar y eliminar elementos.
6. **TablasMul.tsx**: Tabla de multiplicar interactiva.
7. **MapaColombia.tsx**: Vista offline para Ciencias Sociales con departamentos, regiones y actividades.
8. **Social3DMap.tsx**: Mapa 3D educativo con rotación, zoom, selección y arrastrar/soltar de macro-regiones.

---

## Pruebas unitarias

Las pruebas unitarias están desarrolladas con **Jest** y **React Testing Library**.

* Validan la correcta interacción de los componentes.
* Comprobar que `localStorage` persista valores en `ClickCounter`.
* Verificar la lógica de validación en `PasswordValidator`.
* Confirmar el funcionamiento de agregar y eliminar tareas en `TodoList`.
* Aseguran que los componentes principales rendericen correctamente.

Ejecutar todas las pruebas:

```bash
npm test
```

---

## Consideraciones

* Se recomienda **investigar, analizar e interpretar cada ejercicio** antes de ejecutar pruebas unitarias.
* Las pruebas serán evaluadas de manera **individual en clase**, considerando la explicación del proceso y la solución aplicada.

### Mapa de Colombia (Offline)

La vista de Mapa de Colombia funciona completamente sin internet:

* Si agregas un archivo `public/colombia.svg`, se mostrará el mapa vectorial.
* Si no existe el SVG, se usa un listado interactivo de departamentos, con filtro por región y búsqueda.
* La última selección se guarda en `localStorage`.

Sugerido: coloca un SVG simple del mapa de Colombia en `public/colombia.svg` para una experiencia más visual. También puedes ampliar los datos en `src/data/colombiaDepartamentos.ts`.

### Mapa 3D de Regiones (Ciencias Sociales)

Cumple los criterios del requerimiento EDU-RF-SOC-001:

- Rotación y zoom con `OrbitControls`.
- Selección y arrastrar/soltar de macro-regiones hacia un área de enfoque.
- Visualización de 6 atributos por región: nombre, capital referente, población, idioma, superficie y economía clave.
- Funcionamiento 100% offline usando datos locales (`src/data/socialRegions.ts`).

Ruta: `/social-3d-map` y acceso desde el menú lateral.

---

## Dependencias principales

* `react`, `react-dom`, `react-router-dom`
* `three`
* `tailwindcss`
* `framer-motion`
* `jest`, `@testing-library/react`, `@testing-library/jest-dom`, `@types/jest`

---

## Autor

**Gustavo Sánchez Rodríguez**
Asignatura: Ingeniería Web
Clase UCC

