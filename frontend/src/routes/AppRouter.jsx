import { Routes, Route } from "react-router-dom";

import Login from "@/page/Login";
import Home from "@/page/Home";
import Register from "@/page/Register";
import Dashboard from "@/page/Dashboard";
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
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}
