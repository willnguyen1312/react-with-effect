import React from "react";
import ReactDOM from "react-dom/client";
import {
  RouterProvider,
  createBrowserRouter,
  Outlet,
  Link,
} from "react-router-dom";

import "./index.css";

const Layout = () => (
  <main>
    <nav>
      <ul>
        <li>
          <Link to="/app-with-redux">App with redux</Link>
        </li>
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
      {
        index: true,
        loader: () => {
          return null;
        },
        lazy: async () => {
          const { default: Component } = await import("./AppWithRedux");
          return {
            Component,
          };
        },
      },
      {
        path: "app-with-redux",
        loader: () => {
          return null;
        },
        lazy: async () => {
          const { default: Component } = await import("./AppWithRedux");
          return {
            Component,
          };
        },
      },
      {
        path: "app-with-store",
        loader: () => {
          return null;
        },
        lazy: async () => {
          const { default: Component } = await import("./AppWithStore");
          return {
            Component,
          };
        },
      },
      {
        path: "app-without-store",
        loader: () => {
          return null;
        },
        lazy: async () => {
          const { default: Component } = await import("./AppWithoutStore");
          return {
            Component,
          };
        },
      },
    ],
  },
]);

if (import.meta.hot) {
  import.meta.hot.dispose(() => router.dispose());
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
