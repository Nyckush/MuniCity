import { Routes, Route } from "react-router-dom";

import Login from "@/page/Login";
import Home from "@/page/Home";
import Register from "@/page/Register";
import Dashboard from "@/page/Dashboard";
import PresidentDashboard from "@/page/PresidentDashboard";
import CitizenElections from "@/page/CitizenElections";
import CitizenObservations from "@/page/CitizenObservations";
import PresidentNotes from "@/page/PresidentNotes";
import PresidentObservations from "@/page/PresidentObservations";
import Profile from "@/page/Profile";
import Notifications from "@/page/Notifications";
import CitizenCommunications from "@/page/CitizenCommunications";
import MunicipioDashboard from "@/page/MunicipioDashboard";
import MunicipioElections from "@/page/MunicipioElections";
import MunicipioNotes from "@/page/MunicipioNotes";
import MunicipioCommunications from "@/page/MunicipioCommunications";
import NotePdfViewer from "@/page/NotePdfViewer";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getValidStoredAuth } from "@/lib/auth";

function DashboardEntry() {
    const auth = getValidStoredAuth();

    if (auth?.role === "ROLE_PRESIDENTE") {
        return <PresidentDashboard />;
    }

    return <Dashboard />;
}

function ObservationsEntry() {
    const auth = getValidStoredAuth();

    if (auth?.role === "ROLE_PRESIDENTE") {
        return <PresidentObservations />;
    }

    return <CitizenObservations />;
}

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute allowedRoles={["ROLE_CIUDADANO", "ROLE_PRESIDENTE"]}>
                        <DashboardEntry />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/elecciones"
                element={
                    <ProtectedRoute allowedRoles={["ROLE_CIUDADANO", "ROLE_PRESIDENTE"]}>
                        <CitizenElections />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/notas"
                element={
                    <ProtectedRoute allowedRoles={["ROLE_CIUDADANO", "ROLE_PRESIDENTE"]}>
                        <PresidentNotes />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/notificaciones"
                element={
                    <ProtectedRoute allowedRoles={["ROLE_CIUDADANO", "ROLE_PRESIDENTE", "ROLE_MUNICIPIO"]}>
                        <Notifications />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/notas/:noteId/pdf"
                element={
                    <ProtectedRoute allowedRoles={["ROLE_CIUDADANO", "ROLE_PRESIDENTE", "ROLE_MUNICIPIO"]}>
                        <NotePdfViewer />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/observaciones"
                element={
                    <ProtectedRoute allowedRoles={["ROLE_CIUDADANO", "ROLE_PRESIDENTE"]}>
                        <ObservationsEntry />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/comunicados"
                element={
                    <ProtectedRoute allowedRoles={["ROLE_CIUDADANO", "ROLE_PRESIDENTE"]}>
                        <CitizenCommunications />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/perfil"
                element={
                    <ProtectedRoute allowedRoles={["ROLE_CIUDADANO", "ROLE_PRESIDENTE"]}>
                        <Profile />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/municipio/dashboard"
                element={
                    <ProtectedRoute allowedRoles={["ROLE_MUNICIPIO"]}>
                        <MunicipioDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/municipio/elecciones"
                element={
                    <ProtectedRoute allowedRoles={["ROLE_MUNICIPIO"]}>
                        <MunicipioElections />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/municipio/notas"
                element={
                    <ProtectedRoute allowedRoles={["ROLE_MUNICIPIO"]}>
                        <MunicipioNotes />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/municipio/comunicados"
                element={
                    <ProtectedRoute allowedRoles={["ROLE_MUNICIPIO"]}>
                        <MunicipioCommunications />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}
