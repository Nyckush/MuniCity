import React from "react";
import { Navigate } from "react-router-dom";

import { getValidStoredAuth } from "@/lib/auth";

export default function ProtectedRoute({ children }) {
    const auth = getValidStoredAuth();

    if (!auth) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
