import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("tables/pages/main.tsx"),
    route("/standby", "tables/pages/standby.tsx")    
] satisfies RouteConfig;
