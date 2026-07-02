import { Routes, Route } from "react-router-dom";

import Login from "@/page/Login";
import Home from "@/page/Home";
import Register from "@/page/Register";
import Dashboard from "@/page/Dashboard";
import CitizenElections from "@/page/CitizenElections";
import PresidentNotes from "@/page/PresidentNotes";
import Observations from "@/page/Observations";
import MunicipioDashboard from "@/page/MunicipioDashboard";
import MunicipioElections from "@/page/MunicipioElections";
import MunicipioNotes from "@/page/MunicipioNotes";
import ProtectedRoute from "@/components/ProtectedRoute";




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
                        <Dashboard />
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
                path="/observaciones"
                element={
                    <ProtectedRoute allowedRoles={["ROLE_CIUDADANO", "ROLE_PRESIDENTE"]}>
                        <Observations />
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
        </Routes>
    );
}
