import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    CheckCircle2,
    Eye,
    FileText,
    Globe2,
    HandHeart,
    LoaderCircle,
    MapPin,
    MessageCircle,
    NotebookPen,
    Search,
    SlidersHorizontal,
    XCircle,
} from "lucide-react";

import api from "@/api/axios";
import MunicipioNavbar from "@/components/MunicipioNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { clearStoredAuth, getValidStoredAuth, saveStoredAuth } from "@/lib/auth";

const formatDateTime = (value) => {
    if (!value) {
        return "-";
    }

    return new Intl.DateTimeFormat("es-AR", {
        dateStyle: "medium",
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
    estado: "",
    motivo: "",
};

const noteStatusOptions = [
    { value: "TODOS", label: "Todos los estados" },
    { value: "ENTREGADO", label: "Entregadas" },
    { value: "LEIDO", label: "Leídas" },
    { value: "APROBADA", label: "Aprobadas" },
    { value: "RECHAZADA", label: "Rechazadas" },
];

function FormattedNoteContent({ content }) {
    return (
        <div
            className="text-sm leading-7 text-slate-600 [&_blockquote]:border-l-4 [&_blockquote]:border-sky-200 [&_blockquote]:bg-sky-50/70 [&_blockquote]:px-4 [&_blockquote]:py-3 [&_blockquote]:italic [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:text-slate-900 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-900 [&_li]:ml-4 [&_ol]:list-decimal [&_p]:whitespace-pre-wrap [&_ul]:list-disc"
            dangerouslySetInnerHTML={{ __html: content || "<p></p>" }}
        />
    );
}

function NoteContactBlock({ note }) {
    const items = [];

    if (note.mostrarUbicacion && note.centroVecinalUbicacion) {
        items.push({
            key: "ubicacion",
            icon: MapPin,
            label: "Ubicación",
            value: note.centroVecinalUbicacion,
            href: null,
        });
    }

    if (note.mostrarWhatsApp && note.centroVecinalWhatsApp) {
        items.push({
            key: "whatsapp",
            icon: MessageCircle,
            label: "WhatsApp vecinal",
            value: note.centroVecinalWhatsApp,
            href: note.centroVecinalWhatsApp,
        });
    }

    if (note.mostrarFacebook && note.centroVecinalFacebook) {
        items.push({
            key: "facebook",
            icon: Globe2,
            label: "Facebook",
            value: note.centroVecinalFacebook,
            href: note.centroVecinalFacebook,
        });
    }

    if (items.length === 0) {
        return null;
    }

    return (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/85 px-4 py-4">
            <div className="flex items-center gap-3">
                {note.centroVecinalFotoPerfil ? (
                    <img
                        src={note.centroVecinalFotoPerfil}
                        alt={note.centroVecinalNombre}
                        className="h-12 w-12 rounded-2xl object-cover ring-1 ring-slate-200"
                    />
                ) : (
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 ring-1 ring-slate-200">
                        <NotebookPen size={18} />
                    </div>
                )}
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{note.centroVecinalNombre}</p>
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Contacto institucional</p>
                </div>
            </div>

            <div className="mt-4 space-y-3">
                {items.map((item) => {
                    const Icon = item.icon;

                    return (
                        <div key={item.key} className="flex items-start gap-3 text-sm text-slate-600">
                            <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 ring-1 ring-slate-200">
                                <Icon size={16} />
                            </span>
                            <div className="min-w-0">
                                <p className="font-medium text-slate-800">{item.label}</p>
                                {item.href ? (
                                    <a
                                        href={item.href}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="break-all text-sky-700 underline-offset-2 hover:underline"
                                    >
                                        {item.value}
                                    </a>
                                ) : (
                                    <p>{item.value}</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

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
    const [showFeedbackToast, setShowFeedbackToast] = useState(false);
    const [isFeedbackToastVisible, setIsFeedbackToastVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("TODOS");

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

    const showToastFeedback = (type, message) => {
        setFeedback({ type, message });
        setShowFeedbackToast(true);
        setIsFeedbackToastVisible(false);
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
        setShowFeedbackToast(false);
        setIsFeedbackToastVisible(false);

        try {
            const response = await api.get(`/notas/${noteId}`);
            setSelectedNote(response.data);
            setReviewForm({
                estado:
                    response.data.estado === "APROBADA" || response.data.estado === "RECHAZADA"
                        ? response.data.estado
                        : "",
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
            showToastFeedback(
                "error",
                typeof error?.response?.data === "string"
                    ? error.response.data
                    : "No se pudo abrir la nota seleccionada."
            );
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

    const handleOpenPdf = (noteId) => {
        window.open(`/notas/${noteId}/pdf`, "_blank", "noopener,noreferrer");
    };

    const handleSubmitState = async (event) => {
        event.preventDefault();

        if (!selectedNote) {
            return;
        }

        if (!reviewForm.estado) {
            showToastFeedback("error", "Seleccioná si querés aprobar o rechazar la nota.");
            return;
        }

        setSubmittingState(true);
        setFeedback({ type: "", message: "" });
        setShowFeedbackToast(false);
        setIsFeedbackToastVisible(false);

        try {
            const response = await api.put(`/notas/${selectedNote.id}/estado`, reviewForm);
            const updatedNote = response.data;
            setSelectedNote(updatedNote);
            setReviewForm({
                estado:
                    updatedNote.estado === "APROBADA" || updatedNote.estado === "RECHAZADA"
                        ? updatedNote.estado
                        : "",
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

            showToastFeedback("success", "El estado de la nota se actualizó correctamente.");
        } catch (error) {
            showToastFeedback(
                "error",
                typeof error?.response?.data === "string"
                    ? error.response.data
                    : "No se pudo actualizar el estado de la nota."
            );
        } finally {
            setSubmittingState(false);
        }
    };

    useEffect(() => {
        if (!showFeedbackToast) {
            return undefined;
        }

        const animationFrameId = window.requestAnimationFrame(() => {
            setIsFeedbackToastVisible(true);
        });

        const hideTimeoutId = window.setTimeout(() => {
            setIsFeedbackToastVisible(false);
        }, 2800);

        const removeTimeoutId = window.setTimeout(() => {
            setShowFeedbackToast(false);
            setFeedback({ type: "", message: "" });
        }, 3300);

        return () => {
            window.cancelAnimationFrame(animationFrameId);
            window.clearTimeout(hideTimeoutId);
            window.clearTimeout(removeTimeoutId);
        };
    }, [showFeedbackToast]);

    const filteredNotes = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return notes.filter((note) => {
            const matchesSearch =
                !normalizedSearch ||
                [note.titulo, note.barrioNombre, note.centroVecinalNombre, note.autorNombre]
                    .filter(Boolean)
                    .some((value) => value.toLowerCase().includes(normalizedSearch));
            const matchesStatus = selectedStatus === "TODOS" || note.estado === selectedStatus;

            return matchesSearch && matchesStatus;
        });
    }, [notes, searchTerm, selectedStatus]);

    const topSupport = useMemo(
        () => Math.max(0, ...filteredNotes.map((note) => note.cantidadApoyos ?? 0)),
        [filteredNotes]
    );

    const feedbackToastConfig =
        feedback.type === "error"
            ? {
                  title: "No se pudo completar",
                  icon: XCircle,
                  iconClassName: "bg-rose-50 text-rose-600 ring-1 ring-rose-100",
                  borderClassName: "border-rose-200 ring-rose-100",
              }
            : {
                  title: "Acción realizada",
                  icon: CheckCircle2,
                  iconClassName: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
                  borderClassName: "border-emerald-200 ring-emerald-100",
              };

    const noteNavbarSearch = {
        icon: Search,
        value: searchTerm,
        onChange: setSearchTerm,
        placeholder: "Buscar notas...",
    };

    const noteNavbarSelects = [
        {
            id: "municipioNotasEstado",
            icon: SlidersHorizontal,
            value: selectedStatus,
            onChange: setSelectedStatus,
            options: noteStatusOptions,
        },
    ];

    if (!auth || loadingPanel) {
        return null;
    }

    return (
        <main className="min-h-screen overflow-x-hidden bg-[#f4f6f8] pt-[73px]">
            {showFeedbackToast && feedback.message ? (
                <div className="pointer-events-none fixed right-4 top-20 z-50 w-full max-w-sm sm:right-6 lg:right-8">
                    <div
                        className={`pointer-events-auto rounded-3xl bg-white/98 px-5 py-4 shadow-[0_24px_70px_rgba(15,62,106,0.22)] ring-1 backdrop-blur transition-all duration-300 ease-out ${
                            feedbackToastConfig.borderClassName
                        } ${
                            isFeedbackToastVisible
                                ? "translate-y-0 opacity-100"
                                : "-translate-y-2 opacity-0"
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <div
                                className={`mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${feedbackToastConfig.iconClassName}`}
                            >
                                <feedbackToastConfig.icon size={18} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900">
                                    {feedbackToastConfig.title}
                                </p>
                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                    {feedback.message}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            <MunicipioNavbar
                homeHref="/municipio/dashboard"
                userLabel={auth.municipioNombre || auth.email}
                onLogout={handleLogout}
                fixed
                contextSearch={noteNavbarSearch}
                contextSelects={noteNavbarSelects}
                notificationsEnabled
            />

            <div className="min-h-[calc(100vh-73px)] w-full">
                <section className="min-w-0 overflow-x-auto px-4 pb-6 pt-12 sm:px-6 lg:px-8">
                

                    <section className="mt-6 grid gap-6 xl:grid-cols-[1.08fr_0.92fr] xl:items-start">
                        <Card className="border-0 bg-transparent py-0 shadow-none ring-0 xl:h-[calc(100vh-205px)] xl:overflow-hidden">
                            <CardContent className="space-y-4 px-4 pb-4 sm:px-8 sm:pb-8 xl:h-full xl:overflow-y-auto">
                                {filteredNotes.length > 0 ? (
                                    filteredNotes.map((note) => {
                                        const priority = getPriorityConfig(note.cantidadApoyos, topSupport);

                                        return (
                                            <article
                                                key={note.id}
                                                className={`flex min-h-[34rem] w-full flex-col rounded-[2rem] border px-6 py-6 shadow-[0_18px_36px_rgba(15,23,42,0.08)] sm:min-h-[38rem] sm:px-7 sm:py-7 ${
                                                    selectedNote?.id === note.id
                                                        ? "border-[#e9dcc2] bg-[#fffaf0] shadow-[0_18px_40px_rgba(212,177,118,0.12)]"
                                                        : "border-slate-200 bg-white"
                                                }`}
                                            >
                                                <div className="space-y-3">
                                                    <div className="text-center">
                                                        <h3 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                                                            {note.titulo}
                                                        </h3>
                                                    </div>
                                                    <div className="flex flex-wrap justify-center gap-2">
                                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${priority.className}`}>
                                                            {priority.label}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-4 space-y-4 px-4">
                                                    <div className="flex flex-wrap items-end justify-between gap-3">
                                                        <div>
                                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                                                Centro vecinal
                                                            </p>
                                                            <p className="mt-1 text-sm text-slate-600">{note.centroVecinalNombre}</p>
                                                        </div>
                                                        <div className="text-left sm:text-right">
                                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                                                Fecha
                                                            </p>
                                                            <p className="mt-1 text-sm text-slate-600">{formatDateTime(note.createdAt)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                                        <div>
                                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                                                Presidente
                                                            </p>
                                                            <p className="mt-1 text-sm text-slate-600">{note.autorNombre}</p>
                                                        </div>
                                                        <div className="text-left sm:text-right">
                                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                                                Categoría
                                                            </p>
                                                            <div className="mt-2">
                                                                <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${noteCategoryStyles[note.categoria] ?? "bg-slate-100 text-slate-700 ring-1 ring-slate-200"}`}>
                                                                    {noteCategoryLabels[note.categoria] ?? note.categoria}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                                                Barrio
                                                            </p>
                                                            <p className="mt-1 text-sm text-slate-600">{note.barrioNombre}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-5 px-4 py-2">
                                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                                        Contenido
                                                    </p>
                                                    <FormattedNoteContent content={note.contenido} />
                                                </div>

                                                <NoteContactBlock note={note} />

                                                <div className="mt-4 bg-transparent px-4 py-3">
                                                    {note.motivoEstado ? (
                                                        <>
                                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                                                Respuesta del municipio
                                                            </p>
                                                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                                                {note.motivoEstado}
                                                            </p>
                                                        </>
                                                    ) : null}

                                                    <div className={note.motivoEstado ? "mt-4 border-t border-slate-100 pt-3" : ""}>
                                                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                                            Estado de la nota
                                                        </p>
                                                        <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${noteStatusStyles[note.estado] ?? "bg-slate-100 text-slate-700 ring-1 ring-slate-200"}`}>
                                                            {noteStatusLabels[note.estado] ?? note.estado}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 pt-4">
                                                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200">
                                                        <HandHeart size={18} className="text-rose-500" />
                                                        {note.cantidadApoyos ?? 0} {(note.cantidadApoyos ?? 0) === 1 ? "apoyo" : "apoyos"}
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => handleOpenPdf(note.id)}
                                                            className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                                        >
                                                            Ver nota en PDF
                                                        </Button>
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
                                                                "Responder nota"
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    })
                                ) : (
                                    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-12 text-center text-sm text-slate-500">
                                        No hay notas que coincidan con la búsqueda o el filtro seleccionado.
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
                                            Respuesta municipal
                                        </CardTitle>
                                        <CardDescription className="text-sm leading-6 text-slate-500">
                                            Definí el estado final de la nota y registrá el motivo de la respuesta municipal.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-5 px-6 pb-6">
                                {selectedNote ? (
                                    <form className="space-y-4" onSubmit={handleSubmitState}>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                Estado
                                            </label>
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setReviewForm((current) => ({
                                                            ...current,
                                                            estado: "APROBADA",
                                                        }))
                                                    }
                                                    className={`flex items-center gap-4 rounded-2xl border px-4 py-4 text-left transition ${
                                                        reviewForm.estado === "APROBADA"
                                                            ? "border-emerald-300 bg-emerald-50 shadow-[0_12px_30px_rgba(5,150,105,0.10)]"
                                                            : "border-slate-200 bg-white hover:bg-slate-50"
                                                    }`}
                                                >
                                                    <img
                                                        src="/tilde.png"
                                                        alt="Aprobar"
                                                        className="h-12 w-12 rounded-xl object-contain"
                                                    />
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">Aprobar</p>
                                                        <p className="mt-1 text-xs text-slate-500">
                                                            La nota queda validada por el municipio.
                                                        </p>
                                                    </div>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setReviewForm((current) => ({
                                                            ...current,
                                                            estado: "RECHAZADA",
                                                        }))
                                                    }
                                                    className={`flex items-center gap-4 rounded-2xl border px-4 py-4 text-left transition ${
                                                        reviewForm.estado === "RECHAZADA"
                                                            ? "border-rose-300 bg-rose-50 shadow-[0_12px_30px_rgba(225,29,72,0.10)]"
                                                            : "border-slate-200 bg-white hover:bg-slate-50"
                                                    }`}
                                                >
                                                    <img
                                                        src="/rechazo.png"
                                                        alt="Rechazar"
                                                        className="h-12 w-12 rounded-xl object-contain"
                                                    />
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">Rechazar</p>
                                                        <p className="mt-1 text-xs text-slate-500">
                                                            La nota queda rechazada por el municipio.
                                                        </p>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700" htmlFor="motivo">
                                                Motivo
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
                                ) : (
                                    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-12 text-center text-sm text-slate-500">
                                        Seleccioná una nota del listado para responderla y definir su estado.
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
