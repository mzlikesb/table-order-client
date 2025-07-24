import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("customer/pages/main.tsx"),
    route("/standby", "customer/pages/standby.tsx"),
    route("/admin", "admin/pages/dashboard.tsx"),
    route("/admin/menus", "admin/pages/menus.tsx"),
    route("/admin/orders", "admin/pages/orders.tsx"),
    route("/admin/calls", "admin/pages/calls.tsx"),
    route("/admin/tables", "admin/pages/tables.tsx")
] satisfies RouteConfig;
