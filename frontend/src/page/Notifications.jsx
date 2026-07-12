import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, ExternalLink, LoaderCircle } from "lucide-react";

import api from "@/api/axios";
import CitizenNavbar from "@/components/CitizenNavbar";
import MunicipioSidebar from "@/components/MunicipioSidebar";
import PresidentNavbar from "@/components/PresidentNavbar";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { clearStoredAuth, getValidStoredAuth, saveStoredAuth } from "@/lib/auth";
import { municipioSidebarItems } from "@/lib/municipioNavigation";

const notificationTypeConfig = {
    NOTA_NUEVA: {
        label: "Nueva nota",
        badgeClassName: "bg-sky-100 text-sky-700",
        cardClassName: "border-sky-200 bg-sky-50/70 shadow-[0_16px_40px_rgba(33,119,213,0.08)]",
        ctaLabel: "Ir a apoyar nota",
    },
    NOTA_APROBADA: {
        label: "Aprobada",
        badgeClassName: "bg-emerald-100 text-emerald-700",
        cardClassName: "border-emerald-200 bg-emerald-50/70 shadow-[0_16px_40px_rgba(5,150,105,0.08)]",
        ctaLabel: "Ir a ver nota",
    },
    NOTA_RECHAZADA: {
        label: "Rechazada",
        badgeClassName: "bg-rose-100 text-rose-700",
        cardClassName: "border-rose-200 bg-rose-50/70 shadow-[0_16px_40px_rgba(225,29,72,0.08)]",
        ctaLabel: "Ir a ver nota",
    },
    OBSERVACION_NUEVA: {
        label: "Observación",
        badgeClassName: "bg-amber-100 text-amber-700",
        cardClassName: "border-amber-200 bg-amber-50/70 shadow-[0_16px_40px_rgba(217,119,6,0.08)]",
        ctaLabel: "Ver observación",
    },
    COMUNICADO_NUEVO: {
        label: "Comunicado",
        badgeClassName: "bg-cyan-100 text-cyan-700",
        cardClassName: "border-cyan-200 bg-cyan-50/70 shadow-[0_16px_40px_rgba(8,145,178,0.08)]",
        ctaLabel: "Ver comunicado",
    },
};

const formatDateTime = (value) => {
    if (!value) {
        return "Sin fecha";
    }

    return new Intl.DateTimeFormat("es-AR", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
};

export default function Notifications() {
    const navigate = useNavigate();
    const [auth, setAuth] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [markingId, setMarkingId] = useState(null);
    const [markingAll, setMarkingAll] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const storedAuth = getValidStoredAuth();

        if (!storedAuth || !["ROLE_CIUDADANO", "ROLE_PRESIDENTE", "ROLE_MUNICIPIO"].includes(storedAuth.role)) {
            navigate("/login");
            return;
        }

        const loadNotificationsPage = async () => {
            try {
                const [profileResponse, notificationsResponse] = await Promise.all([
                    api.get("/auth/me"),
                    api.get("/notificaciones"),
                ]);

                const mergedAuth = {
                    ...storedAuth,
                    ...profileResponse.data,
                    token: storedAuth.token,
                    expiresAt: storedAuth.expiresAt,
                };

                saveStoredAuth(mergedAuth);
                setAuth(mergedAuth);
                setNotifications(notificationsResponse.data ?? []);
            } catch {
                clearStoredAuth();
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        loadNotificationsPage();
    }, [navigate]);

    const handleLogout = () => {
        clearStoredAuth();
        navigate("/login");
    };

    const reloadNotifications = async () => {
        const response = await api.get("/notificaciones");
        setNotifications(response.data ?? []);
    };

    const handleMarkAsRead = async (notificationId) => {
        setMarkingId(notificationId);
        setError("");

        try {
            await api.put(`/notificaciones/${notificationId}/leer`);
            await reloadNotifications();
        } catch (loadError) {
            setError(
                typeof loadError?.response?.data === "string"
                    ? loadError.response.data
                    : "No se pudo marcar la notificación como leída."
            );
        } finally {
            setMarkingId(null);
        }
    };

    const handleMarkAllAsRead = async () => {
        setMarkingAll(true);
        setError("");

        try {
            await api.put("/notificaciones/leer-todas");
            await reloadNotifications();
        } catch (loadError) {
            setError(
                typeof loadError?.response?.data === "string"
                    ? loadError.response.data
                    : "No se pudieron marcar todas las notificaciones."
            );
        } finally {
            setMarkingAll(false);
        }
    };

    const handleOpenNotificationTarget = async (notification) => {
        if (!notification?.id) {
            return;
        }

        if (!notification.leida) {
            try {
                await api.put(`/notificaciones/${notification.id}/leer`);
            } catch {
                // Si falla el marcado igual permitimos navegar a la nota.
            }
        }

        if (notification.tipo === "OBSERVACION_NUEVA" && notification.observacionId) {
            navigate(`/observaciones?observacion=${notification.observacionId}`);
            return;
        }

        if (notification.tipo === "COMUNICADO_NUEVO" && notification.comunicadoMunicipalId) {
            navigate(`/comunicados?comunicado=${notification.comunicadoMunicipalId}`);
            return;
        }

        if (notification.notaId) {
            if (auth?.role === "ROLE_MUNICIPIO") {
                navigate("/municipio/notas");
                return;
            }

            navigate(`/notas?nota=${notification.notaId}`);
        }
    };

    if (!auth) {
        return null;
    }

    const unreadCount = notifications.filter((item) => !item.leida).length;

    if (auth.role === "ROLE_MUNICIPIO") {
        return (
            <main className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#edf6ff_0%,#f5fbff_38%,#fbfdff_100%)] pt-[73px]">
                <Navbar
                    homeHref="/municipio/dashboard"
                    userLabel={auth.municipioNombre || auth.email}
                    onLogout={handleLogout}
                    fixed
                    notificationsEnabled
                />

                <div className="min-h-[calc(100vh-73px)] w-full">
                    <MunicipioSidebar sidebarItems={municipioSidebarItems} />

                    <section className="min-w-0 overflow-x-auto px-4 py-5 sm:px-6 lg:ml-[290px] lg:px-10">
                        <div className="flex w-full flex-col gap-6">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-sky-700">Administración</p>
                                    <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-slate-900">
                                        Notificaciones
                                    </h1>
                                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                                        Recibí avisos cuando un presidente de cualquier barrio publique una nueva nota.
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right shadow-sm">
                                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Sin leer</p>
                                    <p className="mt-1 text-2xl font-semibold text-slate-900">{unreadCount}</p>
                                </div>
                            </div>

                            {error ? (
                                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                    {error}
                                </div>
                            ) : null}

                            <Card className="border-0 bg-white/92 py-0 shadow-[0_18px_45px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                                <CardHeader className="px-6 pt-6">
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                                                <Bell size={20} />
                                            </div>
                                            <div>
                                                <CardTitle className="text-2xl font-semibold text-slate-900">
                                                    Bandeja de notificaciones
                                                </CardTitle>
                                                <CardDescription className="mt-1 text-sm leading-6 text-slate-500">
                                                    Avisos generados por nuevas notas enviadas desde los centros vecinales.
                                                </CardDescription>
                                            </div>
                                        </div>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleMarkAllAsRead}
                                            disabled={markingAll || unreadCount === 0}
                                            className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                        >
                                            {markingAll ? (
                                                <>
                                                    <LoaderCircle className="animate-spin" size={16} />
                                                    Marcando...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCheck size={16} />
                                                    Marcar todas como leídas
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 px-6 pb-6">
                                    {loading ? (
                                        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500 ring-1 ring-slate-200">
                                            <LoaderCircle className="animate-spin" size={18} />
                                            Cargando notificaciones...
                                        </div>
                                    ) : null}

                                    {!loading && notifications.length === 0 ? (
                                        <div className="rounded-2xl bg-slate-50 px-4 py-8 text-sm text-slate-500 ring-1 ring-slate-200">
                                            Todavía no tenés notificaciones.
                                        </div>
                                    ) : null}

                                    {!loading &&
                                        notifications.map((notification) => {
                                            const typeConfig =
                                                notificationTypeConfig[notification.tipo] ?? notificationTypeConfig.NOTA_NUEVA;

                                            return (
                                                <article
                                                    key={notification.id}
                                                    className={`rounded-3xl border p-5 transition ${
                                                        notification.leida
                                                            ? "border-slate-200 bg-slate-50/80"
                                                            : typeConfig.cardClassName
                                                    }`}
                                                >
                                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                                        <div className="space-y-2">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <h2 className="text-lg font-semibold text-slate-900">
                                                                    {notification.titulo}
                                                                </h2>
                                                                <span
                                                                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                                                                        notification.leida
                                                                            ? "bg-slate-200 text-slate-600"
                                                                            : typeConfig.badgeClassName
                                                                    }`}
                                                                >
                                                                    {notification.leida ? "Leída" : typeConfig.label}
                                                                </span>
                                                            </div>
                                                            <p className="max-w-3xl text-sm leading-6 text-slate-600">
                                                                {notification.mensaje}
                                                            </p>
                                                        </div>

                                                        <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                                                            {formatDateTime(notification.createdAt)}
                                                        </span>
                                                    </div>

                                                    <div className="mt-5 flex flex-wrap items-center gap-2">
                                                        <Button
                                                            type="button"
                                                            onClick={() => handleOpenNotificationTarget(notification)}
                                                            className="rounded-full bg-[linear-gradient(135deg,#2177d5,#2db6d5)] text-white hover:opacity-95"
                                                        >
                                                            <ExternalLink size={16} />
                                                            Revisar nota
                                                        </Button>

                                                        {!notification.leida ? (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={() => handleMarkAsRead(notification.id)}
                                                                disabled={markingId === notification.id}
                                                                className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                                            >
                                                                {markingId === notification.id ? (
                                                                    <>
                                                                        <LoaderCircle className="animate-spin" size={16} />
                                                                        Guardando...
                                                                    </>
                                                                ) : (
                                                                    "Marcar como leída"
                                                                )}
                                                            </Button>
                                                        ) : null}
                                                    </div>
                                                </article>
                                            );
                                        })}
                                </CardContent>
                            </Card>
                        </div>
                    </section>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#E6E9F3]">
            {auth.role === "ROLE_PRESIDENTE" ? (
                <PresidentNavbar
                    homeHref="/dashboard"
                    userLabel={auth.nombreCompleto || auth.email}
                    profileImageUrl={auth.fotoPerfil || ""}
                    onLogout={handleLogout}
                    notificationsEnabled
                    profileEnabled
                />
            ) : (
                <CitizenNavbar
                    homeHref="/dashboard"
                    userLabel={auth.nombreCompleto || auth.email}
                    profileImageUrl={auth.fotoPerfil || ""}
                    onLogout={handleLogout}
                    notificationsEnabled
                    profileEnabled
                />
            )}

            <div className="flex w-full flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium text-sky-700">Actividad del barrio</p>
                        <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-slate-900">
                            Notificaciones
                        </h1>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                            Acá vas a ver las novedades de tu representante y los avisos que requieren tu participación.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right shadow-sm">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Sin leer</p>
                        <p className="mt-1 text-2xl font-semibold text-slate-900">{unreadCount}</p>
                    </div>
                </div>

                {error ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {error}
                    </div>
                ) : null}

                <Card className="border-0 bg-white/92 py-0 shadow-[0_18px_45px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                    <CardHeader className="px-6 pt-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                                    <Bell size={20} />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-semibold text-slate-900">
                                        Bandeja de notificaciones
                                    </CardTitle>
                                    <CardDescription className="mt-1 text-sm leading-6 text-slate-500">
                                        Avisos sobre notas nuevas de tu barrio y acciones pendientes.
                                    </CardDescription>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleMarkAllAsRead}
                                disabled={markingAll || unreadCount === 0}
                                className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            >
                                {markingAll ? (
                                    <>
                                        <LoaderCircle className="animate-spin" size={16} />
                                        Marcando...
                                    </>
                                ) : (
                                    <>
                                        <CheckCheck size={16} />
                                        Marcar todas como leídas
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 px-6 pb-6">
                        {loading ? (
                            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500 ring-1 ring-slate-200">
                                <LoaderCircle className="animate-spin" size={18} />
                                Cargando notificaciones...
                            </div>
                        ) : null}

                        {!loading && notifications.length === 0 ? (
                            <div className="rounded-2xl bg-slate-50 px-4 py-8 text-sm text-slate-500 ring-1 ring-slate-200">
                                Todavía no tenés notificaciones.
                            </div>
                        ) : null}

                        {!loading &&
                            notifications.map((notification) => (
                                (() => {
                                    const typeConfig = notificationTypeConfig[notification.tipo] ?? notificationTypeConfig.NOTA_NUEVA;

                                    return (
                                        <article
                                            key={notification.id}
                                            className={`rounded-3xl border p-5 transition ${
                                                notification.leida
                                                    ? "border-slate-200 bg-slate-50/80"
                                                    : typeConfig.cardClassName
                                            }`}
                                        >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="text-lg font-semibold text-slate-900">
                                                    {notification.titulo}
                                                </h2>
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                                                        notification.leida
                                                            ? "bg-slate-200 text-slate-600"
                                                            : typeConfig.badgeClassName
                                                    }`}
                                                >
                                                    {notification.leida ? "Leída" : typeConfig.label}
                                                </span>
                                            </div>
                                            <p className="max-w-3xl text-sm leading-6 text-slate-600">
                                                {notification.mensaje}
                                            </p>
                                        </div>

                                        <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                                            {formatDateTime(notification.createdAt)}
                                        </span>
                                    </div>

                                    <div className="mt-5 flex flex-wrap items-center gap-2">
                                        <Button
                                            type="button"
                                            onClick={() => handleOpenNotificationTarget(notification)}
                                            className="rounded-full bg-[linear-gradient(135deg,#2177d5,#2db6d5)] text-white hover:opacity-95"
                                        >
                                            <ExternalLink size={16} />
                                            {typeConfig.ctaLabel}
                                        </Button>

                                        {!notification.leida ? (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => handleMarkAsRead(notification.id)}
                                                disabled={markingId === notification.id}
                                                className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                            >
                                                {markingId === notification.id ? (
                                                    <>
                                                        <LoaderCircle className="animate-spin" size={16} />
                                                        Guardando...
                                                    </>
                                                ) : (
                                                    "Marcar como leída"
                                                )}
                                            </Button>
                                        ) : null}
                                    </div>
                                        </article>
                                    );
                                })()
                            ))}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
