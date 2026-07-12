import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Eye,
    Globe2,
    LoaderCircle,
    MapPin,
    Megaphone,
    PencilLine,
    Send,
    Star,
    Archive,
} from "lucide-react";

import api from "@/api/axios";
import MunicipioSidebar from "@/components/MunicipioSidebar";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clearStoredAuth, getValidStoredAuth, saveStoredAuth } from "@/lib/auth";
import { municipioSidebarItems } from "@/lib/municipioNavigation";

const initialForm = {
    titulo: "",
    contenido: "",
    imagenPortada: "",
    barrioId: "",
    esGlobal: true,
    destacado: false,
};

const statusLabels = {
    BORRADOR: "Borrador",
    PUBLICADO: "Publicado",
    ARCHIVADO: "Archivado",
};

const statusStyles = {
    BORRADOR: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    PUBLICADO: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    ARCHIVADO: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
};

const formatDateTime = (value) => {
    if (!value) {
        return "Aún no publicado";
    }

    return new Intl.DateTimeFormat("es-AR", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
};

function PreviewContent({ content }) {
    return (
        <div className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
            {content?.trim() || "La previsualización del contenido aparecerá aquí en tiempo real."}
        </div>
    );
}

export default function MunicipioCommunications() {
    const navigate = useNavigate();
    const [auth, setAuth] = useState(null);
    const [barrios, setBarrios] = useState([]);
    const [comunicados, setComunicados] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [feedback, setFeedback] = useState({ type: "", message: "" });
    const [loadingPage, setLoadingPage] = useState(true);
    const [submittingForm, setSubmittingForm] = useState(false);
    const [publishingId, setPublishingId] = useState(null);
    const [archivingId, setArchivingId] = useState(null);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        const storedAuth = getValidStoredAuth();

        if (!storedAuth || storedAuth.role !== "ROLE_MUNICIPIO") {
            navigate("/login");
            return;
        }

        const loadPage = async () => {
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

                const [barriosResponse, comunicadosResponse] = await Promise.all([
                    api.get("/barrios"),
                    api.get("/comunicados"),
                ]);

                setBarrios(barriosResponse.data ?? []);
                setComunicados(comunicadosResponse.data ?? []);
            } catch (error) {
                clearStoredAuth();
                navigate("/login");
            } finally {
                setLoadingPage(false);
            }
        };

        loadPage();
    }, [navigate]);

    const handleLogout = () => {
        clearStoredAuth();
        navigate("/login");
    };

    const reloadComunicados = async () => {
        const response = await api.get("/comunicados");
        setComunicados(response.data ?? []);
    };

    const resetForm = () => {
        setForm(initialForm);
        setEditingId(null);
    };

    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;

        setForm((current) => {
            if (name === "esGlobal") {
                return {
                    ...current,
                    esGlobal: checked,
                    barrioId: checked ? "" : current.barrioId,
                };
            }

            return {
                ...current,
                [name]: type === "checkbox" ? checked : value,
            };
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmittingForm(true);
        setFeedback({ type: "", message: "" });

        const payload = {
            titulo: form.titulo,
            contenido: form.contenido,
            imagenPortada: form.imagenPortada,
            barrioId: form.esGlobal ? null : Number(form.barrioId),
            esGlobal: form.esGlobal,
            destacado: form.destacado,
        };

        try {
            if (editingId) {
                await api.put(`/comunicados/${editingId}`, payload);
                setFeedback({ type: "success", message: "El comunicado fue actualizado correctamente." });
            } else {
                await api.post("/comunicados", payload);
                setFeedback({ type: "success", message: "El comunicado fue guardado como borrador." });
            }

            await reloadComunicados();
            resetForm();
        } catch (error) {
            setFeedback({
                type: "error",
                message: typeof error?.response?.data === "string"
                    ? error.response.data
                    : "No se pudo guardar el comunicado.",
            });
        } finally {
            setSubmittingForm(false);
        }
    };

    const handleEdit = (comunicado) => {
        setEditingId(comunicado.id);
        setFeedback({ type: "", message: "" });
        setForm({
            titulo: comunicado.titulo ?? "",
            contenido: comunicado.contenido ?? "",
            imagenPortada: comunicado.imagenPortada ?? "",
            barrioId: comunicado.barrioId ? String(comunicado.barrioId) : "",
            esGlobal: Boolean(comunicado.esGlobal),
            destacado: Boolean(comunicado.destacado),
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handlePublish = async (comunicadoId) => {
        setPublishingId(comunicadoId);
        setFeedback({ type: "", message: "" });

        try {
            await api.patch(`/comunicados/${comunicadoId}/publicar`);
            await reloadComunicados();
            setFeedback({ type: "success", message: "El comunicado fue publicado correctamente." });
        } catch (error) {
            setFeedback({
                type: "error",
                message: typeof error?.response?.data === "string"
                    ? error.response.data
                    : "No se pudo publicar el comunicado.",
            });
        } finally {
            setPublishingId(null);
        }
    };

    const handleArchive = async (comunicadoId) => {
        setArchivingId(comunicadoId);
        setFeedback({ type: "", message: "" });

        try {
            await api.patch(`/comunicados/${comunicadoId}/archivar`);
            await reloadComunicados();
            setFeedback({ type: "success", message: "El comunicado fue archivado correctamente." });
        } catch (error) {
            setFeedback({
                type: "error",
                message: typeof error?.response?.data === "string"
                    ? error.response.data
                    : "No se pudo archivar el comunicado.",
            });
        } finally {
            setArchivingId(null);
        }
    };

    const counters = useMemo(() => ({
        total: comunicados.length,
        borradores: comunicados.filter((item) => item.estado === "BORRADOR").length,
        publicados: comunicados.filter((item) => item.estado === "PUBLICADO").length,
        destacados: comunicados.filter((item) => item.destacado).length,
    }), [comunicados]);

    const previewBarrio = form.esGlobal
        ? "Todos los barrios"
        : barrios.find((barrio) => String(barrio.id) === form.barrioId)?.nombre || "Barrio específico";

    if (!auth || loadingPage) {
        return null;
    }

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
                                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Total</p>
                                <p className="mt-3 text-3xl font-semibold text-slate-900">{counters.total}</p>
                            </CardContent>
                        </Card>
                        <Card className="border-0 bg-white/92 py-0 shadow-[0_18px_45px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                            <CardContent className="px-6 py-6">
                                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Borradores</p>
                                <p className="mt-3 text-3xl font-semibold text-slate-900">{counters.borradores}</p>
                            </CardContent>
                        </Card>
                        <Card className="border-0 bg-white/92 py-0 shadow-[0_18px_45px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                            <CardContent className="px-6 py-6">
                                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Publicados</p>
                                <p className="mt-3 text-3xl font-semibold text-slate-900">{counters.publicados}</p>
                            </CardContent>
                        </Card>
                        <Card className="border-0 bg-white/92 py-0 shadow-[0_18px_45px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                            <CardContent className="px-6 py-6">
                                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Destacados</p>
                                <p className="mt-3 text-3xl font-semibold text-slate-900">{counters.destacados}</p>
                            </CardContent>
                        </Card>
                    </div>

                    <section className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                        <Card className="border-0 bg-white/94 py-0 shadow-[0_24px_70px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                            <CardHeader className="px-8 pt-8">
                                <div className="flex items-center gap-3">
                                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                                        <Megaphone size={20} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-semibold text-slate-900">
                                            {editingId ? "Editar comunicado" : "Crear comunicado municipal"}
                                        </CardTitle>
                                        <CardDescription className="text-sm leading-6 text-slate-500">
                                            Publicá resultados electorales, eventos o anuncios oficiales para un barrio puntual o para toda la ciudad.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="px-6 pb-6">
                                <form className="space-y-5" onSubmit={handleSubmit}>
                                    <div className="space-y-2">
                                        <Label htmlFor="titulo">Título</Label>
                                        <Input
                                            id="titulo"
                                            name="titulo"
                                            value={form.titulo}
                                            onChange={handleInputChange}
                                            placeholder="Ej. Resultado oficial de las elecciones barriales"
                                            required
                                            className="h-11 rounded-xl border-slate-200 bg-white"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="imagenPortada">Imagen de portada</Label>
                                        <Input
                                            id="imagenPortada"
                                            name="imagenPortada"
                                            value={form.imagenPortada}
                                            onChange={handleInputChange}
                                            placeholder="https://... o /uploads/imagen.jpg"
                                            className="h-11 rounded-xl border-slate-200 bg-white"
                                        />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4">
                                            <input
                                                type="checkbox"
                                                name="esGlobal"
                                                checked={form.esGlobal}
                                                onChange={handleInputChange}
                                                className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600"
                                            />
                                            <span>
                                                <span className="block text-sm font-medium text-slate-800">
                                                    Comunicado global
                                                </span>
                                                <span className="mt-1 block text-xs leading-5 text-slate-500">
                                                    Si está activo, lo verán todos los barrios.
                                                </span>
                                            </span>
                                        </label>

                                        <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4">
                                            <input
                                                type="checkbox"
                                                name="destacado"
                                                checked={form.destacado}
                                                onChange={handleInputChange}
                                                className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600"
                                            />
                                            <span>
                                                <span className="block text-sm font-medium text-slate-800">
                                                    Marcar como destacado
                                                </span>
                                                <span className="mt-1 block text-xs leading-5 text-slate-500">
                                                    Ayuda a que aparezca primero en listados futuros.
                                                </span>
                                            </span>
                                        </label>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="barrioId">Barrio destinatario</Label>
                                        <select
                                            id="barrioId"
                                            name="barrioId"
                                            value={form.barrioId}
                                            onChange={handleInputChange}
                                            disabled={form.esGlobal}
                                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 disabled:bg-slate-100 disabled:text-slate-400"
                                        >
                                            <option value="">Seleccioná un barrio</option>
                                            {barrios.map((barrio) => (
                                                <option key={barrio.id} value={barrio.id}>
                                                    {barrio.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="contenido">Contenido</Label>
                                        <textarea
                                            id="contenido"
                                            name="contenido"
                                            value={form.contenido}
                                            onChange={handleInputChange}
                                            placeholder="Escribí el comunicado oficial que verá la comunidad..."
                                            required
                                            className="min-h-56 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                                        />
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <Button
                                            type="submit"
                                            disabled={submittingForm}
                                            className="h-11 rounded-xl bg-[linear-gradient(135deg,#2177d5,#2db6d5)] px-5 text-white shadow-[0_18px_35px_rgba(33,119,213,0.24)] hover:opacity-95"
                                        >
                                            {submittingForm ? (
                                                <>
                                                    <LoaderCircle className="animate-spin" size={18} />
                                                    Guardando...
                                                </>
                                            ) : editingId ? (
                                                "Guardar cambios"
                                            ) : (
                                                "Guardar borrador"
                                            )}
                                        </Button>

                                        {editingId ? (
                                            <Button type="button" variant="outline" onClick={resetForm} className="h-11 rounded-xl">
                                                Cancelar edición
                                            </Button>
                                        ) : null}
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="border-0 bg-white/94 py-0 shadow-[0_24px_70px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                            <CardHeader className="px-8 pt-8">
                                <div className="flex items-center gap-3">
                                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
                                        <Eye size={20} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-semibold text-slate-900">
                                            Previsualización en tiempo real
                                        </CardTitle>
                                        <CardDescription className="text-sm leading-6 text-slate-500">
                                            Así se verá el comunicado mientras lo vas armando.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="px-6 pb-6">
                                <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_42px_rgba(15,23,42,0.08)]">
                                    {form.imagenPortada?.trim() ? (
                                        <div className="h-56 w-full overflow-hidden bg-slate-100">
                                            <img
                                                src={form.imagenPortada}
                                                alt={form.titulo || "Portada del comunicado"}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex h-56 items-center justify-center bg-[linear-gradient(135deg,#0f3b68,#27c6c7)] text-white">
                                            <div className="text-center">
                                                <Megaphone size={36} className="mx-auto" />
                                                <p className="mt-3 text-sm font-medium uppercase tracking-[0.18em]">
                                                    Vista previa del comunicado
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-5 px-6 py-6">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-700 ring-1 ring-sky-200">
                                                Municipalidad
                                            </span>
                                            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 ring-1 ring-slate-200">
                                                {form.esGlobal ? <Globe2 size={14} /> : <MapPin size={14} />}
                                                {previewBarrio}
                                            </span>
                                            {form.destacado ? (
                                                <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700 ring-1 ring-amber-200">
                                                    <Star size={14} />
                                                    Destacado
                                                </span>
                                            ) : null}
                                        </div>

                                        <div>
                                            <h3 className="text-2xl font-semibold text-slate-900">
                                                {form.titulo?.trim() || "Título del comunicado"}
                                            </h3>
                                            <p className="mt-2 text-sm text-slate-500">
                                                {auth.municipioNombre || "Municipalidad"} · {formatDateTime(new Date().toISOString())}
                                            </p>
                                        </div>

                                        <PreviewContent content={form.contenido} />
                                    </div>
                                </article>
                            </CardContent>
                        </Card>
                    </section>

                    <Card className="mt-6 border-0 bg-white/94 py-0 shadow-[0_24px_70px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                        <CardHeader className="px-8 pt-8">
                            <CardTitle className="text-2xl font-semibold text-slate-900">
                                Comunicados creados
                            </CardTitle>
                            <CardDescription className="text-sm leading-6 text-slate-500">
                                Gestioná tus borradores, publicaciones activas y comunicados archivados.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4 px-4 pb-4 sm:px-8 sm:pb-8">
                            {comunicados.length > 0 ? (
                                comunicados.map((comunicado) => (
                                    <article
                                        key={comunicado.id}
                                        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_32px_rgba(15,23,42,0.06)]"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-xl font-semibold text-slate-900">
                                                        {comunicado.titulo}
                                                    </h3>
                                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${statusStyles[comunicado.estado] ?? "bg-slate-100 text-slate-700 ring-1 ring-slate-200"}`}>
                                                        {statusLabels[comunicado.estado] ?? comunicado.estado}
                                                    </span>
                                                    {comunicado.destacado ? (
                                                        <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700 ring-1 ring-amber-200">
                                                            <Star size={14} />
                                                            Destacado
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <p className="mt-2 text-sm text-slate-500">
                                                    {comunicado.esGlobal ? "Todos los barrios" : comunicado.barrioNombre} · {formatDateTime(comunicado.fechaPublicacion || comunicado.createdAt)}
                                                </p>
                                                <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                                    {comunicado.contenido}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => handleEdit(comunicado)}
                                                    className="h-10 rounded-xl"
                                                >
                                                    <PencilLine size={16} />
                                                    Editar
                                                </Button>

                                                {comunicado.estado !== "PUBLICADO" ? (
                                                    <Button
                                                        type="button"
                                                        onClick={() => handlePublish(comunicado.id)}
                                                        disabled={publishingId === comunicado.id}
                                                        className="h-10 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                                                    >
                                                        {publishingId === comunicado.id ? (
                                                            <>
                                                                <LoaderCircle className="animate-spin" size={16} />
                                                                Publicando...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Send size={16} />
                                                                Publicar
                                                            </>
                                                        )}
                                                    </Button>
                                                ) : null}

                                                {comunicado.estado !== "ARCHIVADO" ? (
                                                    <Button
                                                        type="button"
                                                        onClick={() => handleArchive(comunicado.id)}
                                                        disabled={archivingId === comunicado.id}
                                                        className="h-10 rounded-xl bg-slate-700 text-white hover:bg-slate-800"
                                                    >
                                                        {archivingId === comunicado.id ? (
                                                            <>
                                                                <LoaderCircle className="animate-spin" size={16} />
                                                                Archivando...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Archive size={16} />
                                                                Archivar
                                                            </>
                                                        )}
                                                    </Button>
                                                ) : null}
                                            </div>
                                        </div>
                                    </article>
                                ))
                            ) : (
                                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-12 text-center text-sm text-slate-500">
                                    Todavía no hay comunicados creados. Podés comenzar armando el primero desde el formulario.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </section>
            </div>
        </main>
    );
}
