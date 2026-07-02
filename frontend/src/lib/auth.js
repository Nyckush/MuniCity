const AUTH_STORAGE_KEY = "municityAuth";

export function getStoredAuth() {
    const rawAuth = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!rawAuth) {
        return null;
    }

    try {
        return JSON.parse(rawAuth);
    } catch (error) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
    }
}

export function saveStoredAuth(auth) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
}

export function clearStoredAuth() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function isAuthExpired(auth) {
    if (!auth?.token) {
        return true;
    }

    if (!auth?.expiresAt) {
        return false;
    }

    return Number(auth.expiresAt) <= Date.now();
}

export function getValidStoredAuth() {
    const auth = getStoredAuth();

    if (!auth) {
        return null;
    }

    if (isAuthExpired(auth)) {
        clearStoredAuth();
        return null;
    }

    return auth;
}

export function getDashboardRouteByRole(role) {
    if (role === "ROLE_MUNICIPIO") {
        return "/municipio/dashboard";
    }

    return "/dashboard";
}
