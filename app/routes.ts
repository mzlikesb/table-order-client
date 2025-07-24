import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("customer/pages/main.tsx"),
    route("/standby", "customer/pages/standby.tsx")    
] satisfies RouteConfig;
