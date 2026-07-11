import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Link2, LoaderCircle, Send, X } from "lucide-react";

import api from "@/api/axios";
import Navbar from "@/components/Navbar";
import {
    formatDateTime,
    getObservationStatusConfig,
    initialObservationForm,
    toUploadUrl,
} from "@/components/observations/ObservationShared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { clearStoredAuth, getValidStoredAuth, saveStoredAuth } from "@/lib/auth";
import { citizenNavigationItems } from "@/lib/citizenNavigation";

export default function CitizenObservations() {
    const navigate = useNavigate();
    const [auth, setAuth] = useState(null);
    const [observationForm, setObservationForm] = useState(initialObservationForm);
    const [observations, setObservations] = useState([]);
    const [loadingObservations, setLoadingObservations] = useState(true);
    const [submittingObservation, setSubmittingObservation] = useState(false);
    const [formError, setFormError] = useState("");
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [isSuccessToastVisible, setIsSuccessToastVisible] = useState(false);
    const [activePanel, setActivePanel] = useState("create");
    const [selectedObservation, setSelectedObservation] = useState(null);
    const [loadingObservationDetail, setLoadingObservationDetail] = useState(false);

    useEffect(() => {
        const storedAuth = getValidStoredAuth();

        if (!storedAuth || storedAuth.role !== "ROLE_CIUDADANO") {
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

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setObservationForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleImagesChange = (event) => {
        const files = Array.from(event.target.files ?? []);

        if (files.length > 3) {
            setFormError("Solo podés seleccionar hasta 3 imágenes.");
            return;
        }

        setFormError("");
        setObservationForm((current) => ({
            ...current,
            imagenes: files,
        }));
    };

    const reloadObservations = async () => {
        const response = await api.get("/observaciones");
        const nextObservations = response.data ?? [];
        setObservations(nextObservations);
        return nextObservations;
    };

    const handleOpenObservationModal = async (observationId) => {
        setLoadingObservationDetail(true);
        setFormError("");

        try {
            const response = await api.get(`/observaciones/${observationId}`);
            setSelectedObservation(response.data);
        } catch (error) {
            setFormError(
                typeof error?.response?.data === "string"
                    ? error.response.data
                    : "No se pudo cargar la observación completa."
            );
        } finally {
            setLoadingObservationDetail(false);
        }
    };

    const handleCloseObservationModal = () => {
        setSelectedObservation(null);
        setLoadingObservationDetail(false);
    };

    const handleCreateObservation = async (event) => {
        event.preventDefault();
        setSubmittingObservation(true);
        setFormError("");

        if (observationForm.imagenes.length > 3) {
            setFormError("Solo podés adjuntar hasta 3 imágenes.");
            setSubmittingObservation(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append("titulo", observationForm.titulo);
            formData.append("descripcion", observationForm.descripcion);

            if (observationForm.ubicacionEnlace.trim()) {
                formData.append("ubicacionEnlace", observationForm.ubicacionEnlace.trim());
            }

            observationForm.imagenes.forEach((imageFile) => {
                formData.append("imagenes", imageFile);
            });

            await api.post("/observaciones", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            await reloadObservations();
            setObservationForm(initialObservationForm);
            setShowSuccessToast(true);
            setIsSuccessToastVisible(true);
            setActivePanel("list");
        } catch (error) {
            setFormError(
                typeof error?.response?.data === "string"
                    ? error.response.data
                    : "No se pudo enviar la observación."
            );
        } finally {
            setSubmittingObservation(false);
        }
    };

    useEffect(() => {
        if (!showSuccessToast) {
            return undefined;
        }

        const hideTimeoutId = window.setTimeout(() => {
            setIsSuccessToastVisible(false);
        }, 2800);

        const removeTimeoutId = window.setTimeout(() => {
            setShowSuccessToast(false);
        }, 3300);

        return () => {
            window.clearTimeout(hideTimeoutId);
            window.clearTimeout(removeTimeoutId);
        };
    }, [showSuccessToast]);

    const imagePreviews = useMemo(
        () => observationForm.imagenes.map((file) => ({ file, url: URL.createObjectURL(file) })),
        [observationForm.imagenes]
    );

    useEffect(() => {
        return () => {
            imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
        };
    }, [imagePreviews]);

    if (!auth) {
        return null;
    }

    return (
        <main className="min-h-screen bg-[#E6E9F3]">
            {(selectedObservation || loadingObservationDetail) ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
                    <div className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.28)]">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                    Observación
                                </p>
                                <h2 className="truncate text-xl font-semibold text-slate-900">
                                    {selectedObservation?.titulo || "Cargando observación"}
                                </h2>
                            </div>
                            <Button
                                type="button"
                                onClick={handleCloseObservationModal}
                                className="h-11 bg-transparent px-4 text-slate-600 hover:bg-slate-100"
                            >
                                <X size={18} />
                                Cerrar
                            </Button>
                        </div>

                        <div className="overflow-y-auto px-6 py-6">
                            {loadingObservationDetail ? (
                                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500 ring-1 ring-slate-200">
                                    <LoaderCircle className="animate-spin" size={18} />
                                    Cargando observación...
                                </div>
                            ) : selectedObservation ? (
                                <div className="space-y-5">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span
                                                className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                                                    getObservationStatusConfig(selectedObservation.estado).className
                                                }`}
                                            >
                                                {getObservationStatusConfig(selectedObservation.estado).label}
                                            </span>
                                            <span className="text-sm text-slate-500">
                                                Barrio {selectedObservation.barrioNombre}
                                            </span>
                                        </div>
                                        <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                                            {formatDateTime(selectedObservation.createdAt)}
                                        </span>
                                    </div>

                                    <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
                                        <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                                            {selectedObservation.descripcion}
                                        </p>
                                    </div>

                                    {selectedObservation.ubicacionEnlace ? (
                                        <a
                                            href={selectedObservation.ubicacionEnlace}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 ring-1 ring-sky-100 transition hover:bg-sky-100"
                                        >
                                            <Link2 size={16} />
                                            Abrir ubicación enviada
                                        </a>
                                    ) : null}

                                    {selectedObservation.imagenes?.length ? (
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            {selectedObservation.imagenes.map((imagePath, index) => (
                                                <a
                                                    key={`${imagePath}-${index}`}
                                                    href={toUploadUrl(imagePath)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="overflow-hidden rounded-2xl ring-1 ring-slate-200 transition hover:ring-sky-300"
                                                >
                                                    <img
                                                        src={toUploadUrl(imagePath)}
                                                        alt={`Observación ${selectedObservation.titulo} - imagen ${index + 1}`}
                                                        className="h-56 w-full object-cover"
                                                    />
                                                </a>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            ) : null}

            {showSuccessToast ? (
                <div className="pointer-events-none fixed right-4 top-20 z-50 w-full max-w-sm sm:right-6 lg:right-8">
                    <div
                        className={`pointer-events-auto rounded-3xl border border-emerald-200 bg-white/98 px-5 py-4 shadow-[0_24px_70px_rgba(15,62,106,0.22)] ring-1 ring-emerald-100 backdrop-blur transition-all duration-300 ease-out ${
                            isSuccessToastVisible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                                <Send size={18} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900">Observación enviada</p>
                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                    Gracias por aportar a tu barrio. El centro vecinal ya recibió tu observación.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

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
                {formError ? (
                    <div className="mx-auto w-full max-w-[40%] rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {formError}
                    </div>
                ) : null}

                <section className="mx-auto grid w-full max-w-[62rem] gap-6 lg:grid-cols-[88px_minmax(0,1fr)]">
                    <Card className="min-h-[100px] self-start border-0 bg-white/92 py-0 shadow-[0_18px_45px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                        <CardContent className="flex h-full px-[4px] py-4">
                            <div className="flex flex-1 flex-col items-center justify-center space-y-4">
                                <button
                                    type="button"
                                    onClick={() => setActivePanel("create")}
                                    title="Crear observación"
                                    className={`group relative inline-flex h-16 w-16 items-center justify-center rounded-2xl transition ${
                                        activePanel === "create"
                                            ? "bg-sky-50 text-sky-700 ring-1 ring-sky-100"
                                            : "bg-transparent text-slate-600 hover:bg-slate-50"
                                    }`}
                                >
                                    <Send size={20} />
                                    <span className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-[0_12px_30px_rgba(15,23,42,0.22)] transition group-hover:opacity-100">
                                        Crear observación
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActivePanel("list")}
                                    title="Mis observaciones"
                                    className={`group relative inline-flex h-16 w-16 items-center justify-center rounded-2xl transition ${
                                        activePanel === "list"
                                            ? "bg-sky-50 text-sky-700 ring-1 ring-sky-100"
                                            : "bg-transparent text-slate-600 hover:bg-slate-50"
                                    }`}
                                >
                                    <ClipboardList size={20} />
                                    <span className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-[0_12px_30px_rgba(15,23,42,0.22)] transition group-hover:opacity-100">
                                        Mis observaciones
                                    </span>
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    {activePanel === "create" ? (
                        <Card className="min-h-[760px] border-0 bg-white/92 py-0 shadow-[0_18px_45px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                        <CardHeader className="px-6 pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                                        <Send size={20} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-semibold text-slate-900">Nueva observación</CardTitle>
                                        <CardDescription className="mt-1 text-sm leading-6 text-slate-500">
                                            Contale al centro vecinal lo que está pasando en tu barrio.
                                        </CardDescription>
                                    </div>
                                </div>
                        </CardHeader>
                        <CardContent className="flex h-full flex-col px-6 pb-6">
                            <form className="flex min-h-[620px] flex-1 flex-col justify-between" onSubmit={handleCreateObservation}>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700" htmlFor="titulo">
                                            Título
                                        </label>
                                        <Input
                                            id="titulo"
                                            name="titulo"
                                            value={observationForm.titulo}
                                            onChange={handleInputChange}
                                            placeholder="Ej. Falta iluminación en la esquina"
                                            className="h-11 rounded-xl border-slate-200 bg-white"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700" htmlFor="descripcion">
                                            Descripción
                                        </label>
                                        <textarea
                                            id="descripcion"
                                            name="descripcion"
                                            value={observationForm.descripcion}
                                            onChange={handleInputChange}
                                            placeholder="Describí la situación con el mayor detalle posible..."
                                            className="min-h-48 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700" htmlFor="ubicacionEnlace">
                                            Enlace de ubicación
                                        </label>
                                        <Input
                                            id="ubicacionEnlace"
                                            name="ubicacionEnlace"
                                            value={observationForm.ubicacionEnlace}
                                            onChange={handleInputChange}
                                            placeholder="Pegá un enlace de Google Maps u otra ubicación"
                                            className="h-11 rounded-xl border-slate-200 bg-white"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-slate-700" htmlFor="imagenes">
                                            Fotos adjuntas
                                        </label>
                                        <Input
                                            id="imagenes"
                                            name="imagenes"
                                            type="file"
                                            multiple
                                            accept="image/png,image/jpeg,image/webp"
                                            onChange={handleImagesChange}
                                            className="rounded-xl border-slate-200 bg-white file:mr-3 file:rounded-full file:border-0 file:bg-sky-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-sky-700"
                                        />
                                        <p className="text-xs text-slate-500">
                                            Podés subir hasta 3 imágenes en formato JPG, PNG o WEBP.
                                        </p>

                                        {imagePreviews.length > 0 ? (
                                            <div className="grid gap-3 sm:grid-cols-3">
                                                {imagePreviews.map((preview) => (
                                                    <div
                                                        key={`${preview.file.name}-${preview.file.lastModified}`}
                                                        className="overflow-hidden rounded-2xl ring-1 ring-slate-200"
                                                    >
                                                        <img
                                                            src={preview.url}
                                                            alt={preview.file.name}
                                                            className="h-28 w-full object-cover"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                        disabled={submittingObservation}
                                        className="h-11 w-full rounded-xl bg-[linear-gradient(135deg,#2177d5,#2db6d5)] px-8 text-white shadow-[0_18px_35px_rgba(33,119,213,0.24)] hover:opacity-95"
                                    >
                                        {submittingObservation ? (
                                            <>
                                                <LoaderCircle className="animate-spin" size={18} />
                                                Enviando...
                                            </>
                                        ) : (
                                            "Enviar observación"
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-0 bg-white/92 py-0 shadow-[0_18px_45px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                            <CardHeader className="px-6 pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
                                        <ClipboardList size={20} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-semibold text-slate-900">Mis observaciones</CardTitle>
                                        <CardDescription className="mt-1 text-sm leading-6 text-slate-500">
                                            Listado de observaciones que ya enviaste a tu centro vecinal.
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
                                        Todavía no enviaste ninguna observación.
                                    </div>
                                ) : null}

                                {!loadingObservations &&
                                    observations.map((observation) => {
                                        const status = getObservationStatusConfig(observation.estado);

                                        return (
                                            <article
                                                key={observation.id}
                                                onClick={() => handleOpenObservationModal(observation.id)}
                                                className="cursor-pointer rounded-3xl border border-slate-200 bg-slate-50/80 p-5 transition hover:border-sky-200 hover:bg-white hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)]"
                                            >
                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                    <div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h3 className="text-lg font-semibold text-slate-900">
                                                                {observation.titulo}
                                                            </h3>
                                                            <span
                                                                className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${status.className}`}
                                                            >
                                                                {status.label}
                                                            </span>
                                                        </div>
                                                        <p className="mt-2 text-sm text-slate-500">
                                                            Barrio {observation.barrioNombre}
                                                        </p>
                                                    </div>
                                                    <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                                                        {formatDateTime(observation.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="mt-4 line-clamp-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                                                    {observation.descripcion}
                                                </p>
                                            </article>
                                        );
                                    })}
                            </CardContent>
                        </Card>
                    )}
                </section>
            </div>
        </main>
    );
}
