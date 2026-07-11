import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, LoaderCircle, Mailbox } from "lucide-react";

import api from "@/api/axios";
import Navbar from "@/components/Navbar";
import {
    ObservationCard,
    ObservationDetail,
} from "@/components/observations/ObservationShared";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { clearStoredAuth, getValidStoredAuth, saveStoredAuth } from "@/lib/auth";
import { citizenNavigationItems } from "@/lib/citizenNavigation";

export default function PresidentObservations() {
    const navigate = useNavigate();
    const location = useLocation();
    const [auth, setAuth] = useState(null);
    const [observations, setObservations] = useState([]);
    const [selectedObservation, setSelectedObservation] = useState(null);
    const [loadingObservations, setLoadingObservations] = useState(true);
    const [detailLoadingId, setDetailLoadingId] = useState(null);
    const [formError, setFormError] = useState("");
    const highlightedObservationId = Number(new URLSearchParams(location.search).get("observacion")) || null;

    useEffect(() => {
        const storedAuth = getValidStoredAuth();

        if (!storedAuth || storedAuth.role !== "ROLE_PRESIDENTE") {
            navigate("/login");
            return;
        }

        const loadObservationsPage = async () => {
            try {
                const [profileResponse, observationsResponse] = await Promise.all([
                    api.get("/auth/me"),
                    api.get("/observaciones"),
                ]);

                const mergedAuth = {
                    ...storedAuth,
                    ...profileResponse.data,
                    token: storedAuth.token,
                    expiresAt: storedAuth.expiresAt,
                };

                saveStoredAuth(mergedAuth);
                setAuth(mergedAuth);
                setObservations(observationsResponse.data ?? []);
            } catch (error) {
                clearStoredAuth();
                navigate("/login");
            } finally {
                setLoadingObservations(false);
            }
        };

        loadObservationsPage();
    }, [navigate]);

    const handleLogout = () => {
        clearStoredAuth();
        navigate("/login");
    };

    const reloadObservations = async () => {
        const response = await api.get("/observaciones");
        const nextObservations = response.data ?? [];
        setObservations(nextObservations);
        return nextObservations;
    };

    const handleOpenDetail = async (observationId) => {
        setDetailLoadingId(observationId);
        setFormError("");

        try {
            const detailResponse = await api.get(`/observaciones/${observationId}`);
            setSelectedObservation(detailResponse.data);

            const refreshedObservations = await reloadObservations();
            const refreshedSelected = refreshedObservations.find((item) => item.id === observationId);

            if (refreshedSelected) {
                setSelectedObservation((current) => ({
                    ...current,
                    ...refreshedSelected,
                    ...detailResponse.data,
                }));
            }
        } catch (error) {
            setFormError(
                typeof error?.response?.data === "string"
                    ? error.response.data
                    : "No se pudo cargar el detalle de la observación."
            );
        } finally {
            setDetailLoadingId(null);
        }
    };

    useEffect(() => {
        if (!highlightedObservationId || loadingObservations || detailLoadingId) {
            return;
        }

        handleOpenDetail(highlightedObservationId);

        const frameId = window.requestAnimationFrame(() => {
            const target = document.getElementById(`observacion-${highlightedObservationId}`);
            target?.scrollIntoView({ behavior: "smooth", block: "center" });
        });

        return () => {
            window.cancelAnimationFrame(frameId);
        };
    }, [highlightedObservationId, loadingObservations]);

    const observationSummary = useMemo(() => {
        const total = observations.length;
        const delivered = observations.filter((item) => item.estado === "ENTREGADO").length;
        const read = observations.filter((item) => item.estado === "LEIDO").length;

        return { total, delivered, read };
    }, [observations]);

    if (!auth) {
        return null;
    }

    return (
        <main className="min-h-screen bg-[#E6E9F3]">
            <Navbar
                homeHref="/dashboard"
                userLabel={auth.nombreCompleto || auth.email}
                profileImageUrl={auth.fotoPerfil || ""}
                onLogout={handleLogout}
                navItems={citizenNavigationItems}
                notificationsEnabled
                profileEnabled
            />

            <div className="flex w-full flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium text-sky-700">Centro vecinal</p>
                        <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-slate-900">
                            Bandeja de observaciones
                        </h1>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                            Revisá los reportes enviados por los vecinos de tu barrio, consultá el detalle y seguí su estado de lectura.
                        </p>
                    </div>

                    <div className="grid min-w-[220px] gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center shadow-sm">
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Total</p>
                            <p className="mt-1 text-lg font-semibold text-slate-800">{observationSummary.total}</p>
                        </div>
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center shadow-sm">
                            <p className="text-xs uppercase tracking-[0.16em] text-amber-600">Entregado</p>
                            <p className="mt-1 text-lg font-semibold text-amber-700">{observationSummary.delivered}</p>
                        </div>
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center shadow-sm">
                            <p className="text-xs uppercase tracking-[0.16em] text-emerald-600">Leído</p>
                            <p className="mt-1 text-lg font-semibold text-emerald-700">{observationSummary.read}</p>
                        </div>
                    </div>
                </div>

                {formError ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {formError}
                    </div>
                ) : null}

                <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                    <Card className="border-0 bg-white/92 py-0 shadow-[0_18px_45px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                        <CardHeader className="px-6 pt-6">
                            <div className="flex items-center gap-3">
                                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
                                    <Mailbox size={20} />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-semibold text-slate-900">Observaciones recibidas</CardTitle>
                                    <CardDescription className="mt-1 text-sm leading-6 text-slate-500">
                                        Bandeja de mensajes enviados por los vecinos de tu barrio.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 px-6 pb-6">
                            {loadingObservations ? (
                                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500 ring-1 ring-slate-200">
                                    <LoaderCircle className="animate-spin" size={18} />
                                    Cargando observaciones...
                                </div>
                            ) : null}

                            {!loadingObservations && observations.length === 0 ? (
                                <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500 ring-1 ring-slate-200">
                                    Todavía no hay observaciones recibidas en tu bandeja.
                                </div>
                            ) : null}

                            {!loadingObservations &&
                                observations.map((observation) => (
                                    <ObservationCard
                                        key={observation.id}
                                        observation={observation}
                                        onOpenDetail={handleOpenDetail}
                                        detailLoadingId={detailLoadingId}
                                        ctaLabel="Ver detalle"
                                        highlightedObservationId={highlightedObservationId}
                                    />
                                ))}
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/92 py-0 shadow-[0_18px_45px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                        <CardHeader className="px-6 pt-6">
                            <div className="flex items-center gap-3">
                                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                                    <Eye size={20} />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-semibold text-slate-900">Detalle de observación</CardTitle>
                                    <CardDescription className="mt-1 text-sm leading-6 text-slate-500">
                                        Al abrir una observación entregada, el sistema la marca automáticamente como leída.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                            <ObservationDetail observation={selectedObservation} />
                        </CardContent>
                    </Card>
                </section>
            </div>
        </main>
    );
}
