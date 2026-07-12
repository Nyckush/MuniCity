import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Eye, HandHeart, Handshake, LoaderCircle, MapPin, MessageCircle, NotebookPen, Search, Share2, SlidersHorizontal, X } from "lucide-react";

import api from "@/api/axios";
import CitizenNavbar from "@/components/CitizenNavbar";
import PresidentNavbar from "@/components/PresidentNavbar";
import TiptapEditor from "@/components/TiptapEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { clearStoredAuth, getValidStoredAuth, saveStoredAuth } from "@/lib/auth";
import { generateNotePdfBlob } from "@/lib/notePdf";

const runtimeConfig =
    typeof window !== "undefined" && window.__APP_CONFIG__
        ? window.__APP_CONFIG__
        : {};

const initialNoteForm = {
    titulo: "",
    contenido: "",
    categoria: "COMUNICADO",
    mostrarUbicacion: false,
    mostrarWhatsApp: true,
    mostrarFacebook: true,
};

const noteScopeOptions = [
    { value: "MIO", label: "Mi Barrio" },
    { value: "OTROS", label: "Otros Barrios" },
    { value: "TODOS", label: "Todos" },
];

const noteCategoryOptions = [
    { value: "PETICION", label: "Petición" },
    { value: "RECLAMO", label: "Reclamo" },
    { value: "PROPUESTA", label: "Propuesta" },
    { value: "COMUNICADO", label: "Comunicado" },
];

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

const formatDateTime = (value) => {
    if (!value) {
        return "Sin fecha";
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

const getCategoryLabel = (category) =>
    noteCategoryOptions.find((option) => option.value === category)?.label ?? category;

const getCategoryClassName = (category) =>
    noteCategoryStyles[category] ?? "bg-slate-100 text-slate-700 ring-1 ring-slate-200";

const getStatusLabel = (status) => noteStatusLabels[status] ?? status;

const getStatusClassName = (status) =>
    noteStatusStyles[status] ?? "bg-slate-100 text-slate-700 ring-1 ring-slate-200";

function FormattedNoteContent({ content }) {
    return (
        <div
            className="tiptap-content text-sm leading-7 text-slate-600 [&_blockquote]:border-l-4 [&_blockquote]:border-sky-200 [&_blockquote]:bg-sky-50/70 [&_blockquote]:px-4 [&_blockquote]:py-3 [&_blockquote]:italic [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:text-slate-900 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-900 [&_li]:ml-4 [&_ol]:list-decimal [&_p]:whitespace-pre-wrap [&_ul]:list-disc"
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

function NoteList({
    notes,
    emptyMessage,
    loading,
    onSupport,
    onPreview,
    onShareWhatsApp,
    onShareFacebook,
    supportingNoteId,
    topSupport,
    highlightedNoteId,
    canShareNote,
}) {
    const [openShareMenuId, setOpenShareMenuId] = useState(null);

    if (loading) {
        return (
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500 ring-1 ring-slate-200">
                <LoaderCircle className="animate-spin" size={18} />
                Cargando notas...
            </div>
        );
    }

    if (notes.length === 0) {
        return (
            <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500 ring-1 ring-slate-200">
                {emptyMessage}
            </div>
        );
    }

    return notes.map((note) => {
        const priority = getPriorityConfig(note.cantidadApoyos, topSupport);

        return (
            <article
                key={note.id}
                id={`note-${note.id}`}
                className={`w-full rounded-3xl border bg-[#ffffff] p-4 transition shadow-[0_14px_32px_rgba(15,23,42,0.08)] sm:p-5 ${
                    highlightedNoteId === note.id
                        ? "border-sky-300 shadow-[0_18px_40px_rgba(33,119,213,0.14)]"
                        : "border-slate-200"
                }`}
            >
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-slate-900">{note.titulo}</h2>
                        <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getCategoryClassName(note.categoria)}`}
                        >
                            {getCategoryLabel(note.categoria)}
                        </span>
                        <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getStatusClassName(note.estado)}`}
                        >
                            {getStatusLabel(note.estado)}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${priority.className}`}>
                            {priority.label}
                        </span>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-600 ring-1 ring-slate-200">
                            <HandHeart
                                size={16}
                                className={note.apoyadaPorMi ? "text-rose-500" : "text-slate-400"}
                            />
                            <span>
                                {note.cantidadApoyos ?? 0} {(note.cantidadApoyos ?? 0) === 1 ? "apoyo" : "apoyos"}
                            </span>
                        </div>
                        <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                            {formatDateTime(note.createdAt)}
                        </span>
                    </div>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                    {note.centroVecinalNombre} · Barrio {note.barrioNombre}
                </p>
                <p className="mt-1 text-sm text-slate-500">Publicado por {note.autorNombre}</p>
                <div className="mt-4">
                    <FormattedNoteContent content={note.contenido} />
                </div>
                <NoteContactBlock note={note} />
                {note.motivoEstado ? (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Motivo del municipio
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{note.motivoEstado}</p>
                    </div>
                ) : null}
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3">
                    <Button
                        type="button"
                        onClick={() => onSupport(note.id)}
                        disabled={note.apoyadaPorMi || supportingNoteId === note.id}
                        className={`h-10 px-4 text-sm font-medium ${
                            note.apoyadaPorMi
                                ? "bg-transparent text-emerald-700 hover:bg-emerald-50"
                                : "bg-transparent text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                        {supportingNoteId === note.id ? (
                            <>
                                <LoaderCircle className="animate-spin" size={16} />
                                Apoyando...
                            </>
                        ) : note.apoyadaPorMi ? (
                            <>
                                <Handshake size={16} />
                                Ya apoyaste
                            </>
                        ) : (
                            <>
                                <Handshake size={16} />
                                Apoyar nota
                            </>
                        )}
                    </Button>
                    <div>
                        <Button
                            type="button"
                            onClick={() => onPreview(note.id)}
                            className="h-10 bg-transparent px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            <Eye size={16} />
                            Ver nota
                        </Button>
                    </div>
                    {canShareNote?.(note) ? (
                        <div className="relative">
                            <Button
                                type="button"
                                onClick={() =>
                                    setOpenShareMenuId((current) =>
                                        current === note.id ? null : note.id
                                    )
                                }
                                className="h-10 bg-transparent px-4 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                            >
                                <Share2 size={16} />
                                Compartir
                                <ChevronDown size={16} />
                            </Button>
                            {openShareMenuId === note.id ? (
                                <div className="absolute left-3 top-[calc(100%+0.5rem)] z-20 min-w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_60px_rgba(15,62,106,0.16)]">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setOpenShareMenuId(null);
                                            onShareWhatsApp(note);
                                        }}
                                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
                                    >
                                        <i className="bi bi-whatsapp text-base" aria-hidden="true" />
                                        Compartir por WhatsApp
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setOpenShareMenuId(null);
                                            onShareFacebook(note);
                                        }}
                                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-sky-50 hover:text-sky-700"
                                    >
                                        <i className="bi bi-facebook text-base" aria-hidden="true" />
                                        Compartir por Facebook
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    ) : null}
                </div>
            </article>
        );
    });
}

export default function PresidentNotes() {
    const navigate = useNavigate();
    const location = useLocation();
    const [auth, setAuth] = useState(null);
    const [noteForm, setNoteForm] = useState(initialNoteForm);
    const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false);
    const [notes, setNotes] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedScope, setSelectedScope] = useState("TODOS");
    const [loadingNotes, setLoadingNotes] = useState(true);
    const [submittingNote, setSubmittingNote] = useState(false);
    const [supportingNoteId, setSupportingNoteId] = useState(null);
    const [noteError, setNoteError] = useState("");
    const [noteSuccess, setNoteSuccess] = useState("");
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [isSuccessToastVisible, setIsSuccessToastVisible] = useState(false);
    const [successToastType, setSuccessToastType] = useState("publish");
    const [previewNote, setPreviewNote] = useState(null);
    const [previewPdfUrl, setPreviewPdfUrl] = useState("");
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState("");
    const highlightedNoteId = Number(new URLSearchParams(location.search).get("nota")) || null;

    useEffect(() => {
        const storedAuth = getValidStoredAuth();

        if (!storedAuth || !["ROLE_CIUDADANO", "ROLE_PRESIDENTE"].includes(storedAuth.role)) {
            navigate("/login");
            return;
        }

        const loadNotesPage = async () => {
            try {
                const [profileResponse, notesResponse] = await Promise.all([
                    api.get("/auth/me"),
                    api.get("/notas"),
                ]);

                const mergedAuth = {
                    ...storedAuth,
                    ...profileResponse.data,
                    token: storedAuth.token,
                    expiresAt: storedAuth.expiresAt,
                };

                saveStoredAuth(mergedAuth);
                setAuth(mergedAuth);
                setNotes(notesResponse.data ?? []);
            } catch (error) {
                clearStoredAuth();
                navigate("/login");
            } finally {
                setLoadingNotes(false);
            }
        };

        loadNotesPage();
    }, [navigate]);

    const handleLogout = () => {
        clearStoredAuth();
        navigate("/login");
    };

    const handleNoteChange = (event) => {
        const { name, value, type, checked } = event.target;
        setNoteForm((current) => ({
            ...current,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const reloadNotes = async () => {
        const notesResponse = await api.get("/notas");
        setNotes(notesResponse.data ?? []);
    };

    const handleCreateNote = async (event) => {
        event.preventDefault();
        setSubmittingNote(true);
        setNoteError("");
        setNoteSuccess("");

        try {
            await api.post("/notas", noteForm);
            await reloadNotes();
            setNoteForm(initialNoteForm);
            setIsCreatePanelOpen(false);
            setNoteSuccess("La nota se publicó correctamente.");
            setSuccessToastType("publish");
            setShowSuccessToast(true);
            setIsSuccessToastVisible(true);
        } catch (error) {
            setNoteError(
                typeof error?.response?.data === "string"
                    ? error.response.data
                    : "No se pudo publicar la nota."
            );
        } finally {
            setSubmittingNote(false);
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

    useEffect(() => {
        if (!highlightedNoteId || loadingNotes) {
            return;
        }

        const frameId = window.requestAnimationFrame(() => {
            const target = document.getElementById(`note-${highlightedNoteId}`);
            target?.scrollIntoView({ behavior: "smooth", block: "center" });
        });

        return () => {
            window.cancelAnimationFrame(frameId);
        };
    }, [highlightedNoteId, loadingNotes, notes]);

    useEffect(() => {
        return () => {
            if (previewPdfUrl) {
                URL.revokeObjectURL(previewPdfUrl);
            }
        };
    }, [previewPdfUrl]);

    const handleSupportNote = async (noteId) => {
        setSupportingNoteId(noteId);
        setNoteError("");
        setNoteSuccess("");

        try {
            await api.post(`/notas/${noteId}/apoyos`);
            await reloadNotes();
            setNoteSuccess("Tu apoyo fue registrado correctamente.");
            setSuccessToastType("support");
            setShowSuccessToast(true);
            setIsSuccessToastVisible(true);
        } catch (error) {
            setNoteError(
                typeof error?.response?.data === "string"
                    ? error.response.data
                    : "No se pudo registrar tu apoyo."
            );
        } finally {
            setSupportingNoteId(null);
        }
    };

    const handleOpenNotePreview = async (noteId) => {
        setPreviewLoading(true);
        setPreviewError("");

        try {
            const response = await api.get(`/notas/${noteId}`);
            const noteData = response.data;
            const pdfBlob = await generateNotePdfBlob(noteData);
            const nextPdfUrl = URL.createObjectURL(pdfBlob);

            if (previewPdfUrl) {
                URL.revokeObjectURL(previewPdfUrl);
            }

            setPreviewNote(noteData);
            setPreviewPdfUrl(nextPdfUrl);
        } catch (error) {
            setPreviewError(
                typeof error?.response?.data === "string"
                    ? error.response.data
                    : "No se pudo abrir la vista previa de la nota."
            );
        } finally {
            setPreviewLoading(false);
        }
    };

    const buildPublicShareUrl = (noteId) => {
        const apiBaseUrl = runtimeConfig.VITE_API_URL?.trim() || import.meta.env.VITE_API_URL?.trim() || "/api";

        if (apiBaseUrl.startsWith("http://") || apiBaseUrl.startsWith("https://")) {
            return `${apiBaseUrl.replace(/\/api\/?$/, "")}/notas/compartir/${noteId}`;
        }

        return `${window.location.origin}/notas/compartir/${noteId}`;
    };

    const canShareNote = (note) => Boolean(note?.id);

    const buildShareMessage = (note) => {
        const noteUrl = buildPublicShareUrl(note.id);
        return [
            `Nueva nota publicada por ${note.centroVecinalNombre}.`,
            `Leela y apoyala desde este enlace:`,
            noteUrl,
        ].join("\n");
    };

    const handleShareNoteWhatsApp = (note) => {
        const message = buildShareMessage(note);

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    };

    const handleShareNoteFacebook = (note) => {
        const noteUrl = buildPublicShareUrl(note.id);
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(noteUrl)}`;
        window.open(facebookUrl, "_blank", "noopener,noreferrer");
    };

    const handleClosePreview = () => {
        if (previewPdfUrl) {
            URL.revokeObjectURL(previewPdfUrl);
        }

        setPreviewNote(null);
        setPreviewPdfUrl("");
        setPreviewError("");
        setPreviewLoading(false);
    };

    const ownNeighborhoodNotes = useMemo(
        () => notes.filter((note) => note.barrioId === auth?.barrioId),
        [auth?.barrioId, notes]
    );

    const otherNeighborhoodNotes = useMemo(
        () => notes.filter((note) => note.barrioId !== auth?.barrioId),
        [auth?.barrioId, notes]
    );

    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    const filteredOwnNeighborhoodNotes = useMemo(
        () =>
            ownNeighborhoodNotes.filter((note) => {
                if (!normalizedSearchTerm) {
                    return true;
                }

                const searchableText = [
                    note.titulo,
                    note.contenido,
                    note.autorNombre,
                    note.centroVecinalNombre,
                    note.barrioNombre,
                    getCategoryLabel(note.categoria),
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                return searchableText.includes(normalizedSearchTerm);
            }),
        [normalizedSearchTerm, ownNeighborhoodNotes]
    );

    const filteredOtherNeighborhoodNotes = useMemo(
        () =>
            otherNeighborhoodNotes.filter((note) => {
                if (!normalizedSearchTerm) {
                    return true;
                }

                const searchableText = [
                    note.titulo,
                    note.contenido,
                    note.autorNombre,
                    note.centroVecinalNombre,
                    note.barrioNombre,
                    getCategoryLabel(note.categoria),
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                return searchableText.includes(normalizedSearchTerm);
            }),
        [normalizedSearchTerm, otherNeighborhoodNotes]
    );

    const topSupport = notes[0]?.cantidadApoyos ?? 0;
    const successToastConfig =
        successToastType === "support"
            ? {
                  title: "Apoyo registrado",
                  description: "Tu apoyo se sumó correctamente a esta nota.",
                  icon: Handshake,
              }
            : {
                  title: "Nota publicada",
                  description: "La nota se registró correctamente y ya está disponible para la comunidad.",
                  icon: NotebookPen,
              };

    const presidentNoteNavbarActions = [
        {
            label: isCreatePanelOpen ? "Ocultar crear" : "Crear nota",
            icon: NotebookPen,
            active: isCreatePanelOpen,
            onClick: () => setIsCreatePanelOpen((current) => !current),
        },
    ];

    const presidentNoteNavbarSearch = {
        icon: Search,
        value: searchTerm,
        onChange: setSearchTerm,
        placeholder: "Buscá por título, contenido, categoría o autor...",
    };

    const presidentNoteNavbarSelects = [
        {
            id: "navbarFiltroScopeNotas",
            icon: SlidersHorizontal,
            value: selectedScope,
            onChange: setSelectedScope,
            options: noteScopeOptions,
        },
    ];

    const noteNavbarSearch = {
        icon: Search,
        value: searchTerm,
        onChange: setSearchTerm,
        placeholder: "Buscá por título, contenido, categoría o autor...",
    };

    const noteNavbarSelects = [
        {
            id: "navbarFiltroScopeNotas",
            icon: SlidersHorizontal,
            value: selectedScope,
            onChange: setSelectedScope,
            options: noteScopeOptions,
        },
    ];

    if (!auth) {
        return null;
    }

    return (
        <main className="min-h-screen bg-[#E6E9F3]">
            {(previewLoading || previewNote || previewError) ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
                    <div className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.28)]">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                    Vista de nota
                                </p>
                                <h2 className="truncate text-lg font-semibold text-slate-900">
                                    {previewNote?.titulo || "Cargando nota"}
                                </h2>
                            </div>
                            <Button
                                type="button"
                                onClick={handleClosePreview}
                                className="h-11 bg-transparent px-4 text-slate-600 hover:bg-slate-100"
                            >
                                <X size={18} />
                                Cerrar
                            </Button>
                        </div>

                        <div className="flex-1 bg-slate-100">
                            {previewLoading ? (
                                <div className="flex h-full items-center justify-center">
                                    <div className="flex items-center gap-3 rounded-3xl bg-white px-6 py-5 text-sm text-slate-600 shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
                                        <LoaderCircle className="animate-spin" size={20} />
                                        Generando la nota...
                                    </div>
                                </div>
                            ) : previewError ? (
                                <div className="flex h-full items-center justify-center p-6">
                                    <div className="max-w-xl rounded-3xl border border-rose-200 bg-white px-6 py-6">
                                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-500">
                                            Vista no disponible
                                        </p>
                                        <p className="mt-3 text-sm leading-6 text-slate-600">{previewError}</p>
                                    </div>
                                </div>
                            ) : previewPdfUrl ? (
                                <iframe
                                    src={previewPdfUrl}
                                    title={`Nota ${previewNote?.id}`}
                                    className="h-full w-full bg-white"
                                />
                            ) : null}
                        </div>
                    </div>
                </div>
            ) : null}

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
                                <successToastConfig.icon size={18} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900">
                                    {successToastConfig.title}
                                </p>
                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                    {successToastConfig.description}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            {auth.role === "ROLE_PRESIDENTE" ? (
                <PresidentNavbar
                    homeHref="/dashboard"
                    userLabel={auth.nombreCompleto || auth.email}
                    profileImageUrl={auth.fotoPerfil || ""}
                    onLogout={handleLogout}
                    contextActions={presidentNoteNavbarActions}
                    contextSearch={presidentNoteNavbarSearch}
                    contextSelects={presidentNoteNavbarSelects}
                    notificationsEnabled
                    profileEnabled
                />
            ) : (
                <CitizenNavbar
                    homeHref="/dashboard"
                    userLabel={auth.nombreCompleto || auth.email}
                    profileImageUrl={auth.fotoPerfil || ""}
                    onLogout={handleLogout}
                    contextSearch={noteNavbarSearch}
                    contextSelects={noteNavbarSelects}
                    notificationsEnabled
                    profileEnabled
                />
            )}

            <div className="flex w-full flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
           

                {noteError ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {noteError}
                    </div>
                ) : null}

                <Card className="mx-auto w-full border-0 bg-transparent py-0 shadow-none ring-0 xl:w-[80%]">
                   
                    <CardContent className="space-y-8 px-0 pb-6 sm:px-3 lg:px-6">
                        {auth.role === "ROLE_PRESIDENTE" && isCreatePanelOpen ? (
                            <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-[0_18px_38px_rgba(15,62,106,0.08)]">
                                        <div className="mb-4">
                                            <h3 className="text-lg font-semibold text-slate-900">Crear nueva nota</h3>
                                            <p className="mt-1 text-sm leading-6 text-slate-500">
                                                Compartí novedades y propuestas oficiales de tu centro vecinal sin salir de este panel.
                                            </p>
                                        </div>

                                        <form className="space-y-4" onSubmit={handleCreateNote}>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700" htmlFor="titulo">
                                                    Título
                                                </label>
                                                <Input
                                                    id="titulo"
                                                    name="titulo"
                                                    value={noteForm.titulo}
                                                    onChange={handleNoteChange}
                                                    placeholder="Ej. Reunión vecinal de esta semana"
                                                    className="h-11 rounded-xl border-slate-200 bg-white"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700" htmlFor="categoria">
                                                    Categoría
                                                </label>
                                                <select
                                                    id="categoria"
                                                    name="categoria"
                                                    value={noteForm.categoria}
                                                    onChange={handleNoteChange}
                                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                                                    required
                                                >
                                                    {noteCategoryOptions.map((option) => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700" htmlFor="contenido">
                                                    Contenido
                                                </label>
                                                <TiptapEditor
                                                    value={noteForm.contenido}
                                                    onChange={(html) =>
                                                        setNoteForm((current) => ({
                                                            ...current,
                                                            contenido: html,
                                                        }))
                                                    }
                                                    placeholder="Escribí la nota o propuesta que querés compartir..."
                                                />
                                            </div>

                                            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4">
                                                <p className="text-sm font-semibold text-slate-900">
                                                    Difusión automática habilitada
                                                </p>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    Esta nota incluirá siempre los accesos de WhatsApp y Facebook del centro vecinal para facilitar su difusión y apoyo.
                                                </p>
                                            </div>

                                            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                                                <Button
                                                    type="button"
                                                    onClick={() => setIsCreatePanelOpen(false)}
                                                    className="h-11 rounded-xl bg-white px-6 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                                                >
                                                    Cancelar
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={submittingNote}
                                                    className="h-11 rounded-xl bg-[linear-gradient(135deg,#2177d5,#2db6d5)] px-8 text-white shadow-[0_18px_35px_rgba(33,119,213,0.24)] hover:opacity-95"
                                                >
                                                    {submittingNote ? (
                                                        <>
                                                            <LoaderCircle className="animate-spin" size={18} />
                                                            Publicando...
                                                        </>
                                                    ) : (
                                                        "Publicar nota"
                                                    )}
                                                </Button>
                                            </div>
                                        </form>
                            </div>
                        ) : null}

                        {selectedScope !== "OTROS" ? (
                            <section className="space-y-4">
                              

                                <NoteList
                                    notes={filteredOwnNeighborhoodNotes}
                                    loading={loadingNotes}
                                    emptyMessage="No se encontraron notas de tu barrio con ese criterio."
                                    onSupport={handleSupportNote}
                                    onShareWhatsApp={handleShareNoteWhatsApp}
                                    onShareFacebook={handleShareNoteFacebook}
                                    supportingNoteId={supportingNoteId}
                                    topSupport={topSupport}
                                    highlightedNoteId={highlightedNoteId}
                                    onPreview={handleOpenNotePreview}
                                    canShareNote={canShareNote}
                                />
                            </section>
                        ) : null}

                        {selectedScope === "TODOS" ? <div className="h-px bg-slate-200" /> : null}

                        {selectedScope !== "MIO" ? (
                            <section className="space-y-4">
                             

                                <NoteList
                                    notes={filteredOtherNeighborhoodNotes}
                                    loading={loadingNotes}
                                    emptyMessage="No se encontraron notas de otros barrios con ese criterio."
                                    onSupport={handleSupportNote}
                                    onShareWhatsApp={handleShareNoteWhatsApp}
                                    onShareFacebook={handleShareNoteFacebook}
                                    supportingNoteId={supportingNoteId}
                                    topSupport={topSupport}
                                    highlightedNoteId={highlightedNoteId}
                                    onPreview={handleOpenNotePreview}
                                    canShareNote={canShareNote}
                                />
                            </section>
                        ) : null}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
