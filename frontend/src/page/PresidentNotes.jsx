import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, HandHeart, LoaderCircle, NotebookPen, Vote } from "lucide-react";

import api from "@/api/axios";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { clearStoredAuth, getValidStoredAuth, saveStoredAuth } from "@/lib/auth";
import { citizenNavigationItems } from "@/lib/citizenNavigation";

const initialNoteForm = {
    titulo: "",
    contenido: "",
    categoria: "COMUNICADO",
};

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

function NoteList({ notes, emptyMessage, loading, onSupport, supportingNoteId, topSupport }) {
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
            <article key={note.id} className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
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
                    <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                        {formatDateTime(note.createdAt)}
                    </span>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                    {note.centroVecinalNombre} · Barrio {note.barrioNombre}
                </p>
                <p className="mt-1 text-sm text-slate-500">Publicado por {note.autorNombre}</p>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                    {note.contenido}
                </p>
                {note.motivoEstado ? (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Motivo del municipio
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{note.motivoEstado}</p>
                    </div>
                ) : null}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
                    <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
                        <HandHeart
                            size={18}
                            className={note.apoyadaPorMi ? "text-rose-500" : "text-slate-400"}
                        />
                        <span>
                            {note.cantidadApoyos ?? 0} {(note.cantidadApoyos ?? 0) === 1 ? "apoyo" : "apoyos"}
                        </span>
                    </div>

                    <Button
                        type="button"
                        onClick={() => onSupport(note.id)}
                        disabled={note.apoyadaPorMi || supportingNoteId === note.id}
                        className={`rounded-full ${
                            note.apoyadaPorMi
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                : "bg-[linear-gradient(135deg,#2177d5,#2db6d5)] text-white hover:opacity-95"
                        }`}
                    >
                        {supportingNoteId === note.id ? (
                            <>
                                <LoaderCircle className="animate-spin" size={16} />
                                Apoyando...
                            </>
                        ) : note.apoyadaPorMi ? (
                            "Ya apoyaste"
                        ) : (
                            "Apoyar nota"
                        )}
                    </Button>
                </div>
            </article>
        );
    });
}

export default function PresidentNotes() {
    const navigate = useNavigate();
    const [auth, setAuth] = useState(null);
    const [noteForm, setNoteForm] = useState(initialNoteForm);
    const [notes, setNotes] = useState([]);
    const [loadingNotes, setLoadingNotes] = useState(true);
    const [submittingNote, setSubmittingNote] = useState(false);
    const [supportingNoteId, setSupportingNoteId] = useState(null);
    const [noteError, setNoteError] = useState("");
    const [noteSuccess, setNoteSuccess] = useState("");

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
        const { name, value } = event.target;
        setNoteForm((current) => ({
            ...current,
            [name]: value,
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
            setNoteSuccess("La nota se publicó correctamente.");
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

    const handleSupportNote = async (noteId) => {
        setSupportingNoteId(noteId);
        setNoteError("");
        setNoteSuccess("");

        try {
            await api.post(`/notas/${noteId}/apoyos`);
            await reloadNotes();
            setNoteSuccess("Tu apoyo fue registrado correctamente.");
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

    const ownNeighborhoodNotes = useMemo(
        () => notes.filter((note) => note.barrioId === auth?.barrioId),
        [auth?.barrioId, notes]
    );

    const otherNeighborhoodNotes = useMemo(
        () => notes.filter((note) => note.barrioId !== auth?.barrioId),
        [auth?.barrioId, notes]
    );
    const topSupport = notes[0]?.cantidadApoyos ?? 0;

    if (!auth) {
        return null;
    }

    return (
        <main className="min-h-screen bg-[linear-gradient(180deg,#eef8ff_0%,#f9fbff_60%,#ffffff_100%)]">
            <Navbar
                homeHref="/dashboard"
                userLabel={auth.nombreCompleto || auth.email}
                onLogout={handleLogout}
                navItems={citizenNavigationItems}
            />

            <div className="flex w-full flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium text-sky-700">Comunidad vecinal</p>
                        <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-slate-900">
                            Notas y propuestas
                        </h1>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                            Consultá publicaciones de tu barrio y también propuestas compartidas por
                            otros centros vecinales.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right shadow-sm">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Tu barrio</p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">{auth.barrioNombre}</p>
                    </div>
                </div>

                {noteError ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {noteError}
                    </div>
                ) : null}

                {noteSuccess ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {noteSuccess}
                    </div>
                ) : null}

                {auth.role === "ROLE_PRESIDENTE" ? (
                    <Card className="border-0 bg-white/92 py-0 shadow-[0_18px_45px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                        <CardHeader className="px-6 pt-6">
                            <div className="flex items-center gap-3">
                                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                                    <NotebookPen size={20} />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-semibold text-slate-900">
                                        Publicar nota
                                    </CardTitle>
                                    <CardDescription className="mt-1 text-sm leading-6 text-slate-500">
                                        Compartí novedades y propuestas oficiales de tu centro vecinal.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
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
                                    <textarea
                                        id="contenido"
                                        name="contenido"
                                        value={noteForm.contenido}
                                        onChange={handleNoteChange}
                                        placeholder="Escribí la nota o propuesta que querés compartir..."
                                        className="min-h-36 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={submittingNote}
                                    className="h-11 w-full rounded-xl bg-[linear-gradient(135deg,#2177d5,#2db6d5)] px-8 text-white shadow-[0_18px_35px_rgba(33,119,213,0.24)] hover:opacity-95"
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
                            </form>
                        </CardContent>
                    </Card>
                ) : null}

                <section className="grid gap-6 xl:grid-cols-2">
                    <Card className="border-0 bg-white/92 py-0 shadow-[0_18px_45px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                        <CardHeader className="px-6 pt-6">
                            <div className="flex items-center gap-3">
                                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-semibold text-slate-900">
                                        Notas de tu barrio
                                    </CardTitle>
                                    <CardDescription className="mt-1 text-sm leading-6 text-slate-500">
                                        Publicaciones vinculadas a {auth.barrioNombre}.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 px-6 pb-6">
                            <NoteList
                                notes={ownNeighborhoodNotes}
                                loading={loadingNotes}
                                emptyMessage="Todavía no hay notas publicadas en tu barrio."
                                onSupport={handleSupportNote}
                                supportingNoteId={supportingNoteId}
                                topSupport={topSupport}
                            />
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/92 py-0 shadow-[0_18px_45px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                        <CardHeader className="px-6 pt-6">
                            <div className="flex items-center gap-3">
                                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
                                    <NotebookPen size={20} />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-semibold text-slate-900">
                                        Notas de otros barrios
                                    </CardTitle>
                                    <CardDescription className="mt-1 text-sm leading-6 text-slate-500">
                                        Ideas, comunicados y propuestas compartidas por otros barrios.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 px-6 pb-6">
                            <NoteList
                                notes={otherNeighborhoodNotes}
                                loading={loadingNotes}
                                emptyMessage="Todavía no hay notas publicadas en otros barrios."
                                onSupport={handleSupportNote}
                                supportingNoteId={supportingNoteId}
                                topSupport={topSupport}
                            />
                        </CardContent>
                    </Card>
                </section>
            </div>
        </main>
    );
}
