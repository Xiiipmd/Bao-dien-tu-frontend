import { createBrowserRouter } from "react-router";

// Public Imports
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ArticleDetail } from "./pages/ArticleDetail";
import { VIPSubscription } from "./pages/VIPSubscription";
import { Search } from "./pages/Search";
import { AuthorProfile } from "./pages/AuthorProfile";

// Admin Imports
import { AdminLayout } from "./components/AdminLayout";
import { Dashboard } from "./pages/admin/Dashboard";
import { CreatePost } from "./pages/admin/CreatePost";
import { ApprovePost } from "./pages/admin/ApprovePost";
import { ManageVIP } from "./pages/admin/ManageVIP";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      { path: "article/:id", Component: ArticleDetail },
      { path: "author/:id", Component: AuthorProfile },
      { path: "vip", Component: VIPSubscription },
      { path: "search", Component: Search },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "posts/create", Component: CreatePost },
      { path: "posts/approval", Component: ApprovePost },
      { path: "vip", Component: ManageVIP },
    ],
  }
]);
