import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("customer/pages/standby.tsx"),
    route("/table-setup", "customer/pages/tableSetup.tsx"),
    route("/menu", "customer/pages/main.tsx"),
    route("/admin/login", "admin/pages/login.tsx"),
    route("/admin/select-mode", "admin/pages/selectMode.tsx"),
    route("/admin", "admin/pages/dashboard.tsx"),
    route("/admin/menus", "admin/pages/menus.tsx"),
    route("/admin/orders", "admin/pages/orders.tsx"),
    route("/admin/calls", "admin/pages/calls.tsx"),
    route("/admin/tables", "admin/pages/tables.tsx"),
    route("/admin/stores", "admin/pages/stores.tsx"),
    route("/kitchen", "kitchen/pages/orders.tsx")
] satisfies RouteConfig;
