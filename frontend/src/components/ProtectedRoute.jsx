import React from "react";
import { Navigate } from "react-router-dom";

import { getValidStoredAuth } from "@/lib/auth";

export default function ProtectedRoute({ children, allowedRoles }) {
    const auth = getValidStoredAuth();

    if (!auth) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles?.length && !allowedRoles.includes(auth.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
}
