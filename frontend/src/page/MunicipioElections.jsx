import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FilePenLine, LoaderCircle, Plus } from "lucide-react";

import api from "@/api/axios";
import MunicipioSidebar from "@/components/MunicipioSidebar";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clearStoredAuth, getValidStoredAuth, saveStoredAuth } from "@/lib/auth";
import { municipioSidebarItems } from "@/lib/municipioNavigation";

const initialElectionForm = {
    centroVecinalId: "",
    fechaInicioPostulacion: "",
    fechaFinPostulacion: "",
    fechaInicioVotacion: "",
    fechaFinVotacion: "",
};

const electionStatusLabels = {
    CONVOCADA: "Convocada",
    POSTULACION: "Postulación",
    VOTACION: "Votación",
    FINALIZADA: "Finalizada",
};

function toDateTimeLocalValue(value) {
    if (!value) {
        return "";
    }

    return String(value).slice(0, 16);
}

export default function MunicipioElections() {
    const navigate = useNavigate();
    const [auth, setAuth] = useState(null);
    const [centrosVecinales, setCentrosVecinales] = useState([]);
    const [elecciones, setElecciones] = useState([]);
    const [form, setForm] = useState(initialElectionForm);
    const [loadingPanel, setLoadingPanel] = useState(true);
    const [submittingElection, setSubmittingElection] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [formMode, setFormMode] = useState("create");
    const [editingElectionId, setEditingElectionId] = useState(null);

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

                const [centrosResponse, eleccionesResponse] = await Promise.all([
                    api.get("/centros-vecinales"),
                    api.get("/elecciones"),
                ]);

                setCentrosVecinales(centrosResponse.data ?? []);
                setElecciones(eleccionesResponse.data ?? []);
            } catch (loadError) {
                clearStoredAuth();
                navigate("/login");
            } finally {
                setLoadingPanel(false);
            }
        };

        loadPanel();
    }, [navigate]);

    const electionStats = useMemo(() => ({
        total: elecciones.length,
        convocadas: elecciones.filter((eleccion) => eleccion.estado === "CONVOCADA").length,
        activas: elecciones.filter((eleccion) => eleccion.estado === "POSTULACION" || eleccion.estado === "VOTACION").length,
        finalizadas: elecciones.filter((eleccion) => eleccion.estado === "FINALIZADA").length,
    }), [elecciones]);

    const handleLogout = () => {
        clearStoredAuth();
        navigate("/login");
    };

    const resetElectionForm = () => {
        setForm(initialElectionForm);
        setFormMode("create");
        setEditingElectionId(null);
        setError("");
        setSuccess("");
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const formatDateTime = (value) => {
        if (!value) {
            return "-";
        }

        return new Date(value).toLocaleString("es-AR", {
            dateStyle: "short",
            timeStyle: "short",
        });
    };

    const loadElecciones = async () => {
        const response = await api.get("/elecciones");
        setElecciones(response.data ?? []);
    };

    const handleCreateOrUpdateElection = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");
        setSubmittingElection(true);

        const payload = {
            centroVecinalId: Number(form.centroVecinalId),
            fechaInicioPostulacion: form.fechaInicioPostulacion,
            fechaFinPostulacion: form.fechaFinPostulacion,
            fechaInicioVotacion: form.fechaInicioVotacion,
            fechaFinVotacion: form.fechaFinVotacion,
        };

        try {
            if (formMode === "edit" && editingElectionId) {
                await api.put(`/elecciones/${editingElectionId}`, payload);
                setSuccess("La elección fue actualizada correctamente.");
            } else {
                await api.post("/elecciones", payload);
                setSuccess("La elección fue convocada correctamente.");
            }

            await loadElecciones();
            setForm(initialElectionForm);
            setFormMode("create");
            setEditingElectionId(null);
        } catch (submitError) {
            setError(submitError.response?.data || "No se pudo guardar la elección.");
        } finally {
            setSubmittingElection(false);
        }
    };

    const handleEditElection = (eleccion) => {
        setFormMode("edit");
        setEditingElectionId(eleccion.id);
        setError("");
        setSuccess("");
        setForm({
            centroVecinalId: String(eleccion.centroVecinalId),
            fechaInicioPostulacion: toDateTimeLocalValue(eleccion.fechaInicioPostulacion),
            fechaFinPostulacion: toDateTimeLocalValue(eleccion.fechaFinPostulacion),
            fechaInicioVotacion: toDateTimeLocalValue(eleccion.fechaInicioVotacion),
            fechaFinVotacion: toDateTimeLocalValue(eleccion.fechaFinVotacion),
        });
    };

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
                                Elecciones
                            </h2>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                                Creá, visualizá y editá elecciones vecinales desde una sola pantalla.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right shadow-sm">
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Municipio</p>
                            <p className="mt-1 text-sm font-semibold text-slate-700">{auth.municipioNombre}</p>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_390px]">
                        <div className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <Card className="border-0 bg-white/92 py-0 shadow-[0_18px_45px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                                    <CardContent className="px-5 py-5">
                                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Total</p>
                                        <p className="mt-3 text-3xl font-semibold text-slate-900">{electionStats.total}</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-0 bg-white/92 py-0 shadow-[0_18px_45px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                                    <CardContent className="px-5 py-5">
                                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Convocadas</p>
                                        <p className="mt-3 text-3xl font-semibold text-slate-900">{electionStats.convocadas}</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-0 bg-white/92 py-0 shadow-[0_18px_45px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                                    <CardContent className="px-5 py-5">
                                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Activas</p>
                                        <p className="mt-3 text-3xl font-semibold text-slate-900">{electionStats.activas}</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-0 bg-white/92 py-0 shadow-[0_18px_45px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                                    <CardContent className="px-5 py-5">
                                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Finalizadas</p>
                                        <p className="mt-3 text-3xl font-semibold text-slate-900">{electionStats.finalizadas}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="border-0 bg-white/94 py-0 shadow-[0_24px_70px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                                <CardHeader className="flex flex-col gap-4 px-8 pt-8 lg:flex-row lg:items-center lg:justify-between">
                                    <div>
                                        <CardTitle className="text-2xl font-semibold text-slate-900">
                                            Listado de elecciones
                                        </CardTitle>
                                        <CardDescription className="text-sm leading-6 text-slate-500">
                                            Vista estilo gestión: centro vecinal, barrio, estado y acciones rápidas.
                                        </CardDescription>
                                    </div>

                                    <Button
                                        type="button"
                                        onClick={resetElectionForm}
                                        className="h-11 rounded-xl bg-[linear-gradient(135deg,#2177d5,#2db6d5)] px-5 text-white shadow-[0_18px_35px_rgba(33,119,213,0.24)] hover:opacity-95"
                                    >
                                        <Plus size={18} />
                                        Nueva elección
                                    </Button>
                                </CardHeader>

                                <CardContent className="px-4 pb-4 sm:px-8 sm:pb-8">
                                    {elecciones.length > 0 ? (
                                        <div className="overflow-hidden rounded-3xl border border-slate-200">
                                            <div className="hidden grid-cols-[1.1fr_1fr_0.9fr_0.75fr_120px] gap-4 bg-slate-50 px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 lg:grid">
                                                <span>Centro vecinal</span>
                                                <span>Postulación</span>
                                                <span>Votación</span>
                                                <span>Estado</span>
                                                <span>Acciones</span>
                                            </div>

                                            <div className="divide-y divide-slate-200 bg-white">
                                                {elecciones.map((eleccion) => (
                                                    <div
                                                        key={eleccion.id}
                                                        className="grid gap-4 px-5 py-5 lg:grid-cols-[1.1fr_1fr_0.9fr_0.75fr_120px] lg:items-center"
                                                    >
                                                        <div>
                                                            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                                                                {eleccion.barrioNombre}
                                                            </p>
                                                            <p className="mt-1 text-base font-semibold text-slate-900">
                                                                {eleccion.centroVecinalNombre}
                                                            </p>
                                                        </div>

                                                        <div className="text-sm text-slate-600">
                                                            <p className="font-medium text-slate-900 lg:hidden">Postulación</p>
                                                            <p>{formatDateTime(eleccion.fechaInicioPostulacion)}</p>
                                                            <p className="text-slate-500">{formatDateTime(eleccion.fechaFinPostulacion)}</p>
                                                        </div>

                                                        <div className="text-sm text-slate-600">
                                                            <p className="font-medium text-slate-900 lg:hidden">Votación</p>
                                                            <p>{formatDateTime(eleccion.fechaInicioVotacion)}</p>
                                                            <p className="text-slate-500">{formatDateTime(eleccion.fechaFinVotacion)}</p>
                                                        </div>

                                                        <div>
                                                            <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
                                                                {electionStatusLabels[eleccion.estado] ?? eleccion.estado}
                                                            </span>
                                                        </div>

                                                        <div>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={() => handleEditElection(eleccion)}
                                                                className="h-10 w-full rounded-xl"
                                                            >
                                                                <FilePenLine size={16} />
                                                                Editar
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-12 text-center text-sm text-slate-500">
                                            Todavía no hay elecciones creadas. Usá el formulario lateral para convocar la primera.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="xl:sticky xl:top-6 xl:self-start">
                            <Card className="border-0 bg-white/96 py-0 shadow-[0_24px_70px_rgba(15,62,106,0.12)] ring-1 ring-slate-200/70">
                                <CardHeader className="px-8 pt-8">
                                    <CardTitle className="text-2xl font-semibold text-slate-900">
                                        {formMode === "edit" ? "Editar elección" : "Crear elección"}
                                    </CardTitle>
                                    <CardDescription className="text-sm leading-6 text-slate-500">
                                        {formMode === "edit"
                                            ? "Actualizá las fechas o el centro vecinal de la elección seleccionada."
                                            : "Configurá una nueva convocatoria electoral desde este formulario."}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="px-8 pb-8">
                                    <form className="space-y-5" onSubmit={handleCreateOrUpdateElection}>
                                        <div className="space-y-2">
                                            <Label htmlFor="centroVecinalId">Centro vecinal</Label>
                                            <select
                                                id="centroVecinalId"
                                                name="centroVecinalId"
                                                value={form.centroVecinalId}
                                                onChange={handleChange}
                                                required
                                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                                            >
                                                <option value="">Seleccioná un centro vecinal</option>
                                                {centrosVecinales.map((centroVecinal) => (
                                                    <option key={centroVecinal.id} value={centroVecinal.id}>
                                                        {centroVecinal.nombre} - {centroVecinal.barrio?.nombre}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="fechaInicioPostulacion">Inicio de postulación</Label>
                                            <Input id="fechaInicioPostulacion" name="fechaInicioPostulacion" type="datetime-local" value={form.fechaInicioPostulacion} onChange={handleChange} required className="h-11 rounded-xl border-slate-200 bg-white" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="fechaFinPostulacion">Fin de postulación</Label>
                                            <Input id="fechaFinPostulacion" name="fechaFinPostulacion" type="datetime-local" value={form.fechaFinPostulacion} onChange={handleChange} required className="h-11 rounded-xl border-slate-200 bg-white" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="fechaInicioVotacion">Inicio de votación</Label>
                                            <Input id="fechaInicioVotacion" name="fechaInicioVotacion" type="datetime-local" value={form.fechaInicioVotacion} onChange={handleChange} required className="h-11 rounded-xl border-slate-200 bg-white" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="fechaFinVotacion">Fin de votación</Label>
                                            <Input id="fechaFinVotacion" name="fechaFinVotacion" type="datetime-local" value={form.fechaFinVotacion} onChange={handleChange} required className="h-11 rounded-xl border-slate-200 bg-white" />
                                        </div>

                                        {error ? (
                                            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                                {error}
                                            </div>
                                        ) : null}

                                        {success ? (
                                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                                {success}
                                            </div>
                                        ) : null}

                                        <div className="grid gap-3">
                                            <Button
                                                type="submit"
                                                disabled={submittingElection || centrosVecinales.length === 0}
                                                className="h-11 w-full rounded-xl bg-[linear-gradient(135deg,#2177d5,#2db6d5)] px-8 text-white shadow-[0_18px_35px_rgba(33,119,213,0.24)] hover:opacity-95"
                                            >
                                                {submittingElection ? (
                                                    <>
                                                        <LoaderCircle className="animate-spin" size={18} />
                                                        Guardando...
                                                    </>
                                                ) : formMode === "edit" ? (
                                                    "Guardar cambios"
                                                ) : (
                                                    "Crear elección"
                                                )}
                                            </Button>

                                            {formMode === "edit" ? (
                                                <Button type="button" variant="outline" onClick={resetElectionForm} className="h-11 rounded-xl">
                                                    Cancelar edición
                                                </Button>
                                            ) : null}
                                        </div>

                                        {centrosVecinales.length === 0 ? (
                                            <p className="text-sm text-slate-500">
                                                Necesitás tener centros vecinales creados para habilitar convocatorias.
                                            </p>
                                        ) : null}
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
