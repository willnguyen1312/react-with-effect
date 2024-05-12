import React from "react";
import ReactDOM from "react-dom/client";
import {
  RouterProvider,
  createBrowserRouter,
  Outlet,
  Link,
} from "react-router-dom";
import { AppWithStore } from "./AppWithStore";
import { AppWithoutStore } from "./AppWithoutStore";

const Layout = () => (
  <main>
    <nav>
      <ul>
        <li>
          <Link to="/app-with-store">App with store</Link>
        </li>
        <li>
          <Link to="/app-without-store">App without store</Link>
        </li>
      </ul>
    </nav>
    <Outlet />
  </main>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <AppWithStore /> },
      { path: "app-with-store", element: <AppWithStore /> },
      { path: "app-without-store", element: <AppWithoutStore /> },
    ],
  },
]);

if (import.meta.hot) {
  import.meta.hot.dispose(() => router.dispose());
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
