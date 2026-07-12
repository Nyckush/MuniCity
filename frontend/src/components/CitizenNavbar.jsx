import Navbar from "@/components/Navbar";
import { citizenNavigationItems } from "@/lib/citizenNavigation";

export default function CitizenNavbar(props) {
    return <Navbar {...props} navItems={citizenNavigationItems} />;
}
