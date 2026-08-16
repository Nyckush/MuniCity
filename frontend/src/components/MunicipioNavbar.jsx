import Navbar from "@/components/Navbar";
import { municipioSidebarItems } from "@/lib/municipioNavigation";

export default function MunicipioNavbar(props) {
    return <Navbar {...props} navItems={municipioSidebarItems} />;
}
