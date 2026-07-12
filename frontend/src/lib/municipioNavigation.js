import { FileText, LayoutDashboard, Megaphone, Vote } from "lucide-react";

export const municipioSidebarItems = [
    {
        id: "inicio",
        label: "Inicio",
        icon: LayoutDashboard,
        to: "/municipio/dashboard",
    },
    {
        id: "elecciones",
        label: "Elecciones",
        icon: Vote,
        to: "/municipio/elecciones",
    },
    {
        id: "notas",
        label: "Notas",
        icon: FileText,
        to: "/municipio/notas",
    },
    {
        id: "comunicados",
        label: "Comunicados",
        icon: Megaphone,
        to: "/municipio/comunicados",
    },
];
