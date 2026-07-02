import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Eye, FileText, HandHeart, LoaderCircle, XCircle } from "lucide-react";

import api from "@/api/axios";
import MunicipioSidebar from "@/components/MunicipioSidebar";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { clearStoredAuth, getValidStoredAuth, saveStoredAuth } from "@/lib/auth";
import { municipioSidebarItems } from "@/lib/municipioNavigation";

const formatDateTime = (value) => {
    if (!value) {
        return "-";
    }

    return new Intl.DateTimeFormat("es-AR", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
};

const getPriorityConfig = (supportCount, topSupport) => {
    if ((supportCount ?? 0) > 0 && supportCount === topSupport) {
        return {
            label: "Prioridad alta",
            className: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
        };
    }

    if ((supportCount ?? 0) >= Math.max(1, Math.ceil((topSupport ?? 0) / 2))) {
        return {
            label: "Prioridad media",
            className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
        };
    }

    return {
        label: "Prioridad normal",
        className: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
    };
};

const noteCategoryLabels = {
    PETICION: "Petición",
    RECLAMO: "Reclamo",
    PROPUESTA: "Propuesta",
    COMUNICADO: "Comunicado",
};

const noteCategoryStyles = {
    PETICION: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
    RECLAMO: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    PROPUESTA: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    COMUNICADO: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
};

const noteStatusLabels = {
    ENTREGADO: "Entregado",
    LEIDO: "Leído",
    APROBADA: "Aprobada",
    RECHAZADA: "Rechazada",
};

const noteStatusStyles = {
    ENTREGADO: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    LEIDO: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
    APROBADA: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    RECHAZADA: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
};

const initialReviewForm = {
    estado: "APROBADA",
    motivo: "",
};

export default function MunicipioNotes() {
    const navigate = useNavigate();
    const [auth, setAuth] = useState(null);
    const [notes, setNotes] = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);
    const [reviewForm, setReviewForm] = useState(initialReviewForm);
    const [loadingPanel, setLoadingPanel] = useState(true);
    const [loadingNoteId, setLoadingNoteId] = useState(null);
    const [submittingState, setSubmittingState] = useState(false);
    const [feedback, setFeedback] = useState({ type: "", message: "" });

    useEffect(() => {
        const storedAuth = getValidStoredAuth();

        if (!storedAuth || storedAuth.role !== "ROLE_MUNICIPIO") {
            navigate("/login");
            return;
        }

        const loadPanel = async () => {
            try {
                const response = await api.get("/auth/me");
                const mergedAuth = {
                    ...storedAuth,
                    ...response.data,
                    token: storedAuth.token,
                    expiresAt: storedAuth.expiresAt,
                };

                if (mergedAuth.role !== "ROLE_MUNICIPIO") {
                    clearStoredAuth();
                    navigate("/login");
                    return;
                }

                saveStoredAuth(mergedAuth);
                setAuth(mergedAuth);

                const notesResponse = await api.get("/notas");
                setNotes(notesResponse.data ?? []);
            } catch (loadError) {
                clearStoredAuth();
                navigate("/login");
            } finally {
                setLoadingPanel(false);
            }
        };

        loadPanel();
    }, [navigate]);

    const handleLogout = () => {
        clearStoredAuth();
        navigate("/login");
    };

    const reloadNotes = async () => {
        const notesResponse = await api.get("/notas");
        const nextNotes = notesResponse.data ?? [];
        setNotes(nextNotes);
        return nextNotes;
    };

    const handleOpenNote = async (noteId) => {
        setLoadingNoteId(noteId);
        setFeedback({ type: "", message: "" });

        try {
            const response = await api.get(`/notas/${noteId}`);
            setSelectedNote(response.data);
            setReviewForm({
                estado: response.data.estado === "RECHAZADA" ? "RECHAZADA" : "APROBADA",
                motivo: response.data.motivoEstado ?? "",
            });

            const nextNotes = await reloadNotes();
            const refreshed = nextNotes.find((note) => note.id === noteId);

            if (refreshed) {
                setSelectedNote((current) => ({
                    ...current,
                    ...refreshed,
                    ...response.data,
                }));
            }
        } catch (error) {
            setFeedback({
                type: "error",
                message:
                    typeof error?.response?.data === "string"
                        ? error.response.data
                        : "No se pudo abrir la nota seleccionada.",
            });
        } finally {
            setLoadingNoteId(null);
        }
    };

    const handleReviewChange = (event) => {
        const { name, value } = event.target;
        setReviewForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleSubmitState = async (event) => {
        event.preventDefault();

        if (!selectedNote) {
            return;
        }

        setSubmittingState(true);
        setFeedback({ type: "", message: "" });

        try {
            const response = await api.put(`/notas/${selectedNote.id}/estado`, reviewForm);
            const updatedNote = response.data;
            setSelectedNote(updatedNote);
            setReviewForm({
                estado: updatedNote.estado === "RECHAZADA" ? "RECHAZADA" : "APROBADA",
                motivo: updatedNote.motivoEstado ?? "",
            });

            const nextNotes = await reloadNotes();
            const refreshed = nextNotes.find((note) => note.id === updatedNote.id);

            if (refreshed) {
                setSelectedNote((current) => ({
                    ...current,
                    ...refreshed,
                    ...updatedNote,
                }));
            }

            setFeedback({
                type: "success",
                message: "El estado de la nota se actualizó correctamente.",
            });
        } catch (error) {
            setFeedback({
                type: "error",
                message:
                    typeof error?.response?.data === "string"
                        ? error.response.data
                        : "No se pudo actualizar el estado de la nota.",
            });
        } finally {
            setSubmittingState(false);
        }
    };

    const noteCounters = useMemo(
        () => ({
            entregadas: notes.filter((note) => note.estado === "ENTREGADO").length,
            leidas: notes.filter((note) => note.estado === "LEIDO").length,
            aprobadas: notes.filter((note) => note.estado === "APROBADA").length,
            rechazadas: notes.filter((note) => note.estado === "RECHAZADA").length,
        }),
        [notes]
    );

    const topSupport = notes[0]?.cantidadApoyos ?? 0;

    if (!auth || loadingPanel) {
        return null;
    }

    return (
        <main className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#edf6ff_0%,#f5fbff_38%,#fbfdff_100%)] pt-[73px]">
            <Navbar
                homeHref="/municipio/dashboard"
                userLabel={auth.municipioNombre || auth.email}
                onLogout={handleLogout}
                fixed
            />

            <div className="min-h-[calc(100vh-73px)] w-full">
                <MunicipioSidebar sidebarItems={municipioSidebarItems} />

                <section className="min-w-0 overflow-x-auto px-4 py-5 sm:px-6 lg:ml-[290px] lg:px-10">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-sky-700">Administración</p>
                            <h2 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-slate-900">
                                Notas
                            </h2>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                                Revisá notas entregadas por los centros vecinales y definí su estado administrativo.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right shadow-sm">
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Municipio</p>
                            <p className="mt-1 text-sm font-semibold text-slate-700">{auth.municipioNombre}</p>
                        </div>
                    </div>

                    {feedback.message ? (
                        <div
                            className={`mt-6 rounded-2xl px-4 py-3 text-sm ${
                                feedback.type === "error"
                                    ? "border border-rose-200 bg-rose-50 text-rose-700"
                                    : "border border-emerald-200 bg-emerald-50 text-emerald-700"
                            }`}
                        >
                            {feedback.message}
                        </div>
                    ) : null}

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <Card className="border-0 bg-white/92 py-0 shadow-[0_18px_45px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                            <CardContent className="px-6 py-6">
                                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Entregadas</p>
                                <p className="mt-3 text-3xl font-semibold text-slate-900">{noteCounters.entregadas}</p>
                            </CardContent>
                        </Card>
                        <Card className="border-0 bg-white/92 py-0 shadow-[0_18px_45px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                            <CardContent className="px-6 py-6">
                                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Leídas</p>
                                <p className="mt-3 text-3xl font-semibold text-slate-900">{noteCounters.leidas}</p>
                            </CardContent>
                        </Card>
                        <Card className="border-0 bg-white/92 py-0 shadow-[0_18px_45px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                            <CardContent className="px-6 py-6">
                                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Aprobadas</p>
                                <p className="mt-3 text-3xl font-semibold text-slate-900">{noteCounters.aprobadas}</p>
                            </CardContent>
                        </Card>
                        <Card className="border-0 bg-white/92 py-0 shadow-[0_18px_45px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                            <CardContent className="px-6 py-6">
                                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Rechazadas</p>
                                <p className="mt-3 text-3xl font-semibold text-slate-900">{noteCounters.rechazadas}</p>
                            </CardContent>
                        </Card>
                    </div>

                    <section className="mt-6 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
                        <Card className="border-0 bg-white/94 py-0 shadow-[0_24px_70px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                            <CardHeader className="px-8 pt-8">
                                <CardTitle className="text-2xl font-semibold text-slate-900">
                                    Listado de notas de todos los barrios
                                </CardTitle>
                                <CardDescription className="text-sm leading-6 text-slate-500">
                                    Ordenadas por mayor apoyo ciudadano y luego por fecha de publicación.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4 px-4 pb-4 sm:px-8 sm:pb-8">
                                {notes.length > 0 ? (
                                    notes.map((note) => {
                                        const priority = getPriorityConfig(note.cantidadApoyos, topSupport);

                                        return (
                                            <article
                                                key={note.id}
                                                className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5"
                                            >
                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                                                            {note.barrioNombre}
                                                        </p>
                                                        <div className="mt-2 flex flex-wrap items-center gap-2">
                                                            <h3 className="text-xl font-semibold text-slate-900">
                                                                {note.titulo}
                                                            </h3>
                                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${noteCategoryStyles[note.categoria] ?? "bg-slate-100 text-slate-700 ring-1 ring-slate-200"}`}>
                                                                {noteCategoryLabels[note.categoria] ?? note.categoria}
                                                            </span>
                                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${noteStatusStyles[note.estado] ?? "bg-slate-100 text-slate-700 ring-1 ring-slate-200"}`}>
                                                                {noteStatusLabels[note.estado] ?? note.estado}
                                                            </span>
                                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${priority.className}`}>
                                                                {priority.label}
                                                            </span>
                                                        </div>
                                                        <p className="mt-2 text-sm text-slate-500">
                                                            {note.centroVecinalNombre} · Publicado por {note.autorNombre}
                                                        </p>
                                                    </div>

                                                    <div className="text-right">
                                                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                                                            Publicación
                                                        </p>
                                                        <p className="mt-1 text-sm font-semibold text-slate-700">
                                                            {formatDateTime(note.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <p className="mt-4 line-clamp-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                                                    {note.contenido}
                                                </p>

                                                {note.motivoEstado ? (
                                                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                                            Motivo registrado
                                                        </p>
                                                        <p className="mt-2 text-sm leading-6 text-slate-600">
                                                            {note.motivoEstado}
                                                        </p>
                                                    </div>
                                                ) : null}

                                                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                                                    <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200">
                                                        <HandHeart size={18} className="text-rose-500" />
                                                        {note.cantidadApoyos ?? 0} {(note.cantidadApoyos ?? 0) === 1 ? "apoyo" : "apoyos"}
                                                    </div>

                                                    <Button
                                                        type="button"
                                                        onClick={() => handleOpenNote(note.id)}
                                                        disabled={loadingNoteId === note.id}
                                                        className="rounded-full bg-[linear-gradient(135deg,#2177d5,#2db6d5)] text-white hover:opacity-95"
                                                    >
                                                        {loadingNoteId === note.id ? (
                                                            <>
                                                                <LoaderCircle className="animate-spin" size={16} />
                                                                Abriendo...
                                                            </>
                                                        ) : (
                                                            "Revisar nota"
                                                        )}
                                                    </Button>
                                                </div>
                                            </article>
                                        );
                                    })
                                ) : (
                                    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-12 text-center text-sm text-slate-500">
                                        Todavía no hay notas publicadas para mostrar.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-0 bg-white/94 py-0 shadow-[0_24px_70px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                            <CardHeader className="px-8 pt-8">
                                <div className="flex items-center gap-3">
                                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                                        <Eye size={20} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-semibold text-slate-900">
                                            Revisión municipal
                                        </CardTitle>
                                        <CardDescription className="text-sm leading-6 text-slate-500">
                                            Al abrir una nota entregada, el sistema la marca automáticamente como leída.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-5 px-6 pb-6">
                                {selectedNote ? (
                                    <>
                                        <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${noteCategoryStyles[selectedNote.categoria] ?? "bg-slate-100 text-slate-700 ring-1 ring-slate-200"}`}>
                                                    {noteCategoryLabels[selectedNote.categoria] ?? selectedNote.categoria}
                                                </span>
                                                <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${noteStatusStyles[selectedNote.estado] ?? "bg-slate-100 text-slate-700 ring-1 ring-slate-200"}`}>
                                                    {noteStatusLabels[selectedNote.estado] ?? selectedNote.estado}
                                                </span>
                                            </div>

                                            <div>
                                                <h3 className="text-2xl font-semibold text-slate-900">{selectedNote.titulo}</h3>
                                                <p className="mt-2 text-sm text-slate-500">
                                                    {selectedNote.centroVecinalNombre} · {selectedNote.barrioNombre} · {selectedNote.autorNombre}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    Publicada el {formatDateTime(selectedNote.createdAt)}
                                                </p>
                                            </div>

                                            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
                                                {selectedNote.contenido}
                                            </p>

                                            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200">
                                                <HandHeart size={18} className="text-rose-500" />
                                                {selectedNote.cantidadApoyos ?? 0} {(selectedNote.cantidadApoyos ?? 0) === 1 ? "apoyo" : "apoyos"}
                                            </div>
                                        </div>

                                        <form className="space-y-4" onSubmit={handleSubmitState}>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700" htmlFor="estado">
                                                    Estado final
                                                </label>
                                                <select
                                                    id="estado"
                                                    name="estado"
                                                    value={reviewForm.estado}
                                                    onChange={handleReviewChange}
                                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                                                >
                                                    <option value="APROBADA">Aprobada</option>
                                                    <option value="RECHAZADA">Rechazada</option>
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700" htmlFor="motivo">
                                                    Motivo del municipio
                                                </label>
                                                <textarea
                                                    id="motivo"
                                                    name="motivo"
                                                    value={reviewForm.motivo}
                                                    onChange={handleReviewChange}
                                                    placeholder="Podés registrar una devolución o fundamento de forma opcional..."
                                                    className="min-h-32 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                                                />
                                            </div>

                                            <div className="flex flex-wrap gap-3">
                                                <Button
                                                    type="submit"
                                                    disabled={submittingState}
                                                    className={`rounded-full text-white hover:opacity-95 ${
                                                        reviewForm.estado === "APROBADA"
                                                            ? "bg-emerald-600"
                                                            : "bg-rose-600"
                                                    }`}
                                                >
                                                    {submittingState ? (
                                                        <>
                                                            <LoaderCircle className="animate-spin" size={16} />
                                                            Guardando...
                                                        </>
                                                    ) : reviewForm.estado === "APROBADA" ? (
                                                        <>
                                                            <CheckCircle2 size={16} />
                                                            Aprobar nota
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle size={16} />
                                                            Rechazar nota
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </form>
                                    </>
                                ) : (
                                    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-12 text-center text-sm text-slate-500">
                                        Seleccioná una nota del listado para revisarla y definir su estado.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </section>
                </section>
            </div>
        </main>
    );
}
