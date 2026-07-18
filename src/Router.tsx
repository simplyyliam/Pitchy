import { createBrowserRouter, type RouteObject } from "react-router-dom";
import type { ComponentType } from "react";
import { Dashboard, Encoder, Tuner } from "./pages";

type PageModule = {
  default: ComponentType;
};

const pages = import.meta.glob("./pages/**/page.tsx", {
  eager: true,
});

console.log("Pages", Object.keys(pages));

const appRoutes: RouteObject[] = [];
const standaloneRoutes: RouteObject[] = [];

for (const [path, module] of Object.entries(pages)) {
  const page = module as PageModule;
  const Component = page.default;

  // 1. Convert file path → route
  let routePath = path
    .replace("./pages", "")
    .replace("/page.tsx", "");

  const isStandalone = routePath.includes("/standalone/");

  routePath = routePath
    .replace("/standalone", "")
    .replace("/app", "")
    .replace(/^\/(project|global)(?=\/|$)/, ""); // strip group segment (project/global)

  const normalizePath = routePath.length === 0 ? "/" : routePath;

  // 2. dashboard becomes the index route inside AppLayout
  const isIndexRoute = !isStandalone && normalizePath === "/dashboard";

  const route: RouteObject = isIndexRoute
    ? { index: true, element: <Component /> }
    : { path: normalizePath, element: <Component /> };

  // 3. Classification
  if (isStandalone) {
    standaloneRoutes.push(route);
  } else {
    appRoutes.push(route);
  }
}

export const Router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />
  },
  {
    path: "tuner",
    element: <Tuner/>
  },
  {
    path: "encoder",
    element: <Encoder/>
  }
]);
