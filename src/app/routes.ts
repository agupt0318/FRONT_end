import { createBrowserRouter } from "react-router";
import { Root } from "./pages/Root";
import { Dashboard } from "./pages/Dashboard";
import { Tracker } from "./pages/Tracker";
import { Leaderboard } from "./pages/Leaderboard";
import { Login } from "./pages/Login";
import { Settings } from "./pages/Settings";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Dashboard },
      { path: "tracker", Component: Tracker },
      { path: "leaderboard", Component: Leaderboard },
      { path: "settings", Component: Settings },
    ],
  },
]);