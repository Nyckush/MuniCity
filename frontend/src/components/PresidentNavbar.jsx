import Navbar from "@/components/Navbar";
import { presidentNavigationItems } from "@/lib/presidentNavigation";

export default function PresidentNavbar(props) {
    return <Navbar {...props} navItems={presidentNavigationItems} />;
}
