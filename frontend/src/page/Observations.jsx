import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Camera,
    ClipboardPenLine,
    Eye,
    Image as ImageIcon,
    Link2,
    LoaderCircle,
    Mailbox,
    MapPinned,
    Send,
} from "lucide-react";

import api from "@/api/axios";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { clearStoredAuth, getValidStoredAuth, saveStoredAuth } from "@/lib/auth";
import { citizenNavigationItems } from "@/lib/citizenNavigation";

const initialObservationForm = {
    titulo: "",
    descripcion: "",
    ubicacionEnlace: "",
    imagenes: [],
};

const observationStateConfig = {
    ENTREGADO: {
        label: "Entregado",
        className: "border-amber-200 bg-amber-50 text-amber-700",
    },
    LEIDO: {
        label: "Leído",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
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

const getObservationStatusConfig = (status) =>
    observationStateConfig[status] ?? {
        label: status ?? "Sin estado",
        className: "border-slate-200 bg-slate-100 text-slate-700",
    };

const toUploadUrl = (path) => {
    if (!path) {
        return "";
    }

    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }

    return `http://localhost:8080${path}`;
};

function ObservationCard({ observation, onOpenDetail, detailLoadingId, ctaLabel }) {
    const status = getObservationStatusConfig(observation.estado);

    return (
        <article className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-slate-900">{observation.titulo}</h2>
                        <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${status.className}`}
                        >
                            {status.label}
                        </span>
                    </div>
                    <p className="text-sm text-slate-500">
                        {observation.centroVecinalNombre
                            ? `${observation.centroVecinalNombre} · `
                            : ""}
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

            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 ring-1 ring-slate-200">
                    <ImageIcon size={15} className="text-slate-400" />
                    {(observation.imagenes?.length ?? 0)} fotos
                </span>
                {observation.ubicacionEnlace ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 ring-1 ring-slate-200">
                        <MapPinned size={15} className="text-slate-400" />
                        Con ubicación
                    </span>
                ) : null}
            </div>

            <div className="mt-5 flex justify-end">
                <Button
                    type="button"
                    onClick={() => onOpenDetail(observation.id)}
                    disabled={detailLoadingId === observation.id}
                    className="rounded-full bg-[linear-gradient(135deg,#2177d5,#2db6d5)] text-white hover:opacity-95"
                >
                    {detailLoadingId === observation.id ? (
                        <>
                            <LoaderCircle className="animate-spin" size={16} />
                            Abriendo...
                        </>
                    ) : (
                        ctaLabel
                    )}
                </Button>
            </div>
        </article>
    );
}

function ObservationDetail({ observation }) {
    if (!observation) {
        return (
            <div className="rounded-2xl bg-slate-50 px-4 py-8 text-sm text-slate-500 ring-1 ring-slate-200">
                Seleccioná una observación para ver el detalle completo.
            </div>
        );
    }

    const status = getObservationStatusConfig(observation.estado);

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
                <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${status.className}`}
                >
                    {status.label}
                </span>
                <span className="text-xs uppercase tracking-[0.14em] text-slate-400">
                    {formatDateTime(observation.createdAt)}
                </span>
            </div>

            <div>
                <h2 className="text-2xl font-semibold text-slate-900">{observation.titulo}</h2>
                <p className="mt-2 text-sm text-slate-500">
                    {observation.ciudadanoNombre
                        ? `${observation.ciudadanoNombre} · `
                        : ""}
                    {observation.centroVecinalNombre
                        ? `${observation.centroVecinalNombre} · `
                        : ""}
                    Barrio {observation.barrioNombre}
                </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {observation.descripcion}
                </p>
            </div>

            {observation.ubicacionEnlace ? (
                <a
                    href={observation.ubicacionEnlace}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 ring-1 ring-sky-100 transition hover:bg-sky-100"
                >
                    <Link2 size={16} />
                    Abrir ubicación enviada
                </a>
            ) : null}

            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Camera size={18} className="text-slate-500" />
                    <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Fotos adjuntas
                    </h3>
                </div>

                {observation.imagenes?.length ? (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {observation.imagenes.map((imagePath, index) => (
                            <a
                                key={`${imagePath}-${index}`}
                                href={toUploadUrl(imagePath)}
                                target="_blank"
                                rel="noreferrer"
                                className="overflow-hidden rounded-2xl ring-1 ring-slate-200 transition hover:ring-sky-300"
                            >
                                <img
                                    src={toUploadUrl(imagePath)}
                                    alt={`Observación ${observation.titulo} - imagen ${index + 1}`}
                                    className="h-40 w-full object-cover"
                                />
                            </a>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500 ring-1 ring-slate-200">
                        Esta observación no tiene fotos adjuntas.
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Observations() {
    const navigate = useNavigate();
    const [auth, setAuth] = useState(null);
    const [observationForm, setObservationForm] = useState(initialObservationForm);
    const [observations, setObservations] = useState([]);
    const [selectedObservation, setSelectedObservation] = useState(null);
    const [loadingObservations, setLoadingObservations] = useState(true);
    const [submittingObservation, setSubmittingObservation] = useState(false);
    const [detailLoadingId, setDetailLoadingId] = useState(null);
    const [formError, setFormError] = useState("");
    const [formSuccess, setFormSuccess] = useState("");
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [isSuccessToastVisible, setIsSuccessToastVisible] = useState(false);

    useEffect(() => {
        const storedAuth = getValidStoredAuth();

        if (!storedAuth || !["ROLE_CIUDADANO", "ROLE_PRESIDENTE"].includes(storedAuth.role)) {
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

    const handleCreateObservation = async (event) => {
        event.preventDefault();
        setSubmittingObservation(true);
        setFormError("");
        setFormSuccess("");

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

            const nextObservations = await reloadObservations();
            setObservationForm(initialObservationForm);
            setFormSuccess("La observación se envió correctamente al centro vecinal.");
            setShowSuccessToast(true);
            setIsSuccessToastVisible(true);

            if (nextObservations.length > 0) {
                setSelectedObservation(nextObservations[0]);
            }
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

    const observationSummary = useMemo(() => {
        const total = observations.length;
        const delivered = observations.filter((item) => item.estado === "ENTREGADO").length;
        const read = observations.filter((item) => item.estado === "LEIDO").length;

        return { total, delivered, read };
    }, [observations]);

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

    const isPresident = auth.role === "ROLE_PRESIDENTE";

    return (
        <main className="min-h-screen bg-[linear-gradient(180deg,#eef8ff_0%,#f9fbff_60%,#ffffff_100%)]">
            {showSuccessToast ? (
                <div className="pointer-events-none fixed right-4 top-20 z-50 w-full max-w-sm sm:right-6 lg:right-8">
                    <div
                        className={`pointer-events-auto rounded-3xl border border-emerald-200 bg-white/98 px-5 py-4 shadow-[0_24px_70px_rgba(15,62,106,0.22)] ring-1 ring-emerald-100 backdrop-blur transition-all duration-300 ease-out ${
                            isSuccessToastVisible
                                ? "translate-y-0 opacity-100"
                                : "-translate-y-2 opacity-0"
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                                <Send size={18} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900">
                                    Observación enviada
                                </p>
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
                onLogout={handleLogout}
                navItems={citizenNavigationItems}
            />

            <div className="flex w-full flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium text-sky-700">
                            {isPresident ? "Centro vecinal" : "Canal ciudadano"}
                        </p>
                        <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-slate-900">
                            {isPresident ? "Bandeja de observaciones" : "Observaciones del barrio"}
                        </h1>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                            {isPresident
                                ? "Revisá los reportes enviados por los vecinos de tu barrio, consultá el detalle y seguí su estado de lectura."
                                : "Enviá observaciones al centro vecinal, adjuntá hasta 3 fotos y hacé seguimiento de lo que ya reportaste."}
                        </p>
                    </div>

                    <div className="grid min-w-[220px] gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center shadow-sm">
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Total</p>
                            <p className="mt-1 text-lg font-semibold text-slate-800">{observationSummary.total}</p>
                        </div>
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center shadow-sm">
                            <p className="text-xs uppercase tracking-[0.16em] text-amber-600">Entregado</p>
                            <p className="mt-1 text-lg font-semibold text-amber-700">
                                {observationSummary.delivered}
                            </p>
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

                {formSuccess ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {formSuccess}
                    </div>
                ) : null}

                <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                    <div className="space-y-6">
                        {!isPresident ? (
                            <Card className="border-0 bg-white/92 py-0 shadow-[0_18px_45px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                                <CardHeader className="px-6 pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                                            <Send size={20} />
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl font-semibold text-slate-900">
                                                Nueva observación
                                            </CardTitle>
                                            <CardDescription className="mt-1 text-sm leading-6 text-slate-500">
                                                Contale al centro vecinal lo que está pasando en tu barrio.
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-6 pb-6">
                                    <form className="space-y-4" onSubmit={handleCreateObservation}>
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
                                            <label
                                                className="text-sm font-medium text-slate-700"
                                                htmlFor="descripcion"
                                            >
                                                Descripción
                                            </label>
                                            <textarea
                                                id="descripcion"
                                                name="descripcion"
                                                value={observationForm.descripcion}
                                                onChange={handleInputChange}
                                                placeholder="Describí la situación con el mayor detalle posible..."
                                                className="min-h-36 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label
                                                className="text-sm font-medium text-slate-700"
                                                htmlFor="ubicacionEnlace"
                                            >
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
                        ) : null}

                        <Card className="border-0 bg-white/92 py-0 shadow-[0_18px_45px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                            <CardHeader className="px-6 pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
                                        {isPresident ? <Mailbox size={20} /> : <ClipboardPenLine size={20} />}
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-semibold text-slate-900">
                                            {isPresident ? "Observaciones recibidas" : "Mis observaciones"}
                                        </CardTitle>
                                        <CardDescription className="mt-1 text-sm leading-6 text-slate-500">
                                            {isPresident
                                                ? "Bandeja de mensajes enviados por los vecinos de tu barrio."
                                                : "Seguimiento de todas las observaciones que ya enviaste."}
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
                                        {isPresident
                                            ? "Todavía no hay observaciones recibidas en tu bandeja."
                                            : "Todavía no enviaste ninguna observación."}
                                    </div>
                                ) : null}

                                {!loadingObservations &&
                                    observations.map((observation) => (
                                        <ObservationCard
                                            key={observation.id}
                                            observation={observation}
                                            onOpenDetail={handleOpenDetail}
                                            detailLoadingId={detailLoadingId}
                                            ctaLabel={isPresident ? "Ver detalle" : "Ver seguimiento"}
                                        />
                                    ))}
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border-0 bg-white/92 py-0 shadow-[0_18px_45px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                        <CardHeader className="px-6 pt-6">
                            <div className="flex items-center gap-3">
                                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                                    <Eye size={20} />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-semibold text-slate-900">
                                        Detalle de observación
                                    </CardTitle>
                                    <CardDescription className="mt-1 text-sm leading-6 text-slate-500">
                                        {isPresident
                                            ? "Al abrir una observación entregada, el sistema la marca automáticamente como leída."
                                            : "Consultá el estado, las imágenes enviadas y la ubicación asociada."}
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
