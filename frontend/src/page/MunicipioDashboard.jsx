import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, FileText, Landmark, LayoutDashboard, UsersRound, Vote } from "lucide-react";

import api from "@/api/axios";
import MunicipioSidebar from "@/components/MunicipioSidebar";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { clearStoredAuth, getValidStoredAuth, saveStoredAuth } from "@/lib/auth";
import { municipioSidebarItems } from "@/lib/municipioNavigation";

const noteCategoryLabels = {
    PETICION: "Petición",
    RECLAMO: "Reclamo",
    PROPUESTA: "Propuesta",
    COMUNICADO: "Comunicado",
};

const categoryColors = {
    PETICION: "from-violet-500 to-fuchsia-500",
    RECLAMO: "from-rose-500 to-orange-500",
    PROPUESTA: "from-emerald-500 to-teal-500",
    COMUNICADO: "from-sky-500 to-cyan-500",
};

const pieChartColors = [
    "#1f78d5",
    "#27c6c7",
    "#0f3b68",
    "#14b8a6",
    "#f97316",
    "#e11d48",
    "#8b5cf6",
    "#84cc16",
];

const getBarWidth = (value, maxValue) => {
    if (!maxValue || maxValue <= 0) {
        return "0%";
    }

    return `${Math.max(8, Math.round((value / maxValue) * 100))}%`;
};

export default function MunicipioDashboard() {
    const navigate = useNavigate();
    const [auth, setAuth] = useState(null);
    const [centrosVecinales, setCentrosVecinales] = useState([]);
    const [elecciones, setElecciones] = useState([]);
    const [barrios, setBarrios] = useState([]);
    const [notes, setNotes] = useState([]);
    const [loadingPanel, setLoadingPanel] = useState(true);

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

                const [centrosResponse, eleccionesResponse, barriosResponse, notesResponse] = await Promise.all([
                    api.get("/centros-vecinales"),
                    api.get("/elecciones"),
                    api.get("/barrios"),
                    api.get("/notas"),
                ]);

                setCentrosVecinales(centrosResponse.data ?? []);
                setElecciones(eleccionesResponse.data ?? []);
                setBarrios(barriosResponse.data ?? []);
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

    const electionStats = useMemo(
        () => ({
            total: elecciones.length,
            convocadas: elecciones.filter((eleccion) => eleccion.estado === "CONVOCADA").length,
            activas: elecciones.filter(
                (eleccion) => eleccion.estado === "POSTULACION" || eleccion.estado === "VOTACION"
            ).length,
            finalizadas: elecciones.filter((eleccion) => eleccion.estado === "FINALIZADA").length,
        }),
        [elecciones]
    );

    const neighborhoodsByPopulation = useMemo(() => {
        return [...barrios]
            .sort((first, second) => (second.habitantesEstimados ?? 0) - (first.habitantesEstimados ?? 0))
            .map((barrio) => ({
                id: barrio.id,
                nombre: barrio.nombre,
                habitantesEstimados: barrio.habitantesEstimados ?? 0,
            }));
    }, [barrios]);

    const maxPopulation = neighborhoodsByPopulation[0]?.habitantesEstimados ?? 0;

    const notesByNeighborhood = useMemo(() => {
        const counts = notes.reduce((accumulator, note) => {
            const currentValue = accumulator.get(note.barrioNombre) ?? 0;
            accumulator.set(note.barrioNombre, currentValue + 1);
            return accumulator;
        }, new Map());

        return Array.from(counts.entries())
            .map(([barrioNombre, cantidad]) => ({ barrioNombre, cantidad }))
            .sort((first, second) => second.cantidad - first.cantidad);
    }, [notes]);

    const mostSupportedCategories = useMemo(() => {
        const supportByCategory = notes.reduce((accumulator, note) => {
            const key = note.categoria ?? "SIN_CATEGORIA";
            const current = accumulator.get(key) ?? { categoria: key, apoyos: 0, notas: 0 };
            current.apoyos += note.cantidadApoyos ?? 0;
            current.notas += 1;
            accumulator.set(key, current);
            return accumulator;
        }, new Map());

        return Array.from(supportByCategory.values()).sort((first, second) => second.apoyos - first.apoyos);
    }, [notes]);

    const maxCategorySupport = mostSupportedCategories[0]?.apoyos ?? 0;

    const totalHabitants = neighborhoodsByPopulation.reduce(
        (accumulator, barrio) => accumulator + (barrio.habitantesEstimados ?? 0),
        0
    );

    const totalNeighborhoodNotes = notesByNeighborhood.reduce(
        (accumulator, item) => accumulator + item.cantidad,
        0
    );

    const notesPieChart = useMemo(() => {
        if (totalNeighborhoodNotes <= 0) {
            return [];
        }

        let currentAngle = 0;

        return notesByNeighborhood.map((item, index) => {
            const percentage = item.cantidad / totalNeighborhoodNotes;
            const startAngle = currentAngle;
            const endAngle = currentAngle + percentage * 360;
            currentAngle = endAngle;

            return {
                ...item,
                color: pieChartColors[index % pieChartColors.length],
                percentage,
                startAngle,
                endAngle,
            };
        });
    }, [notesByNeighborhood, totalNeighborhoodNotes]);

    const pieChartBackground = useMemo(() => {
        if (notesPieChart.length === 0) {
            return "conic-gradient(#e2e8f0 0deg 360deg)";
        }

        const segments = notesPieChart.map(
            (item) => `${item.color} ${item.startAngle}deg ${item.endAngle}deg`
        );

        return `conic-gradient(${segments.join(", ")})`;
    }, [notesPieChart]);

    const handleLogout = () => {
        clearStoredAuth();
        navigate("/login");
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
               

                    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <Card className="border-0 bg-white/92 py-0 shadow-[0_18px_50px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                            <CardContent className="px-6 py-6">
                                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                                    <UsersRound size={22} />
                                </div>
                                <p className="mt-4 text-xs uppercase tracking-[0.16em] text-slate-500">Habitantes estimados</p>
                                <p className="mt-3 text-3xl font-semibold text-slate-900">{totalHabitants}</p>
                            </CardContent>
                        </Card>
                        <Card className="border-0 bg-white/92 py-0 shadow-[0_18px_50px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                            <CardContent className="px-6 py-6">
                                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
                                    <FileText size={22} />
                                </div>
                                <p className="mt-4 text-xs uppercase tracking-[0.16em] text-slate-500">Total notas</p>
                                <p className="mt-3 text-3xl font-semibold text-slate-900">{notes.length}</p>
                            </CardContent>
                        </Card>
                        <Card className="border-0 bg-white/92 py-0 shadow-[0_18px_50px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                            <CardContent className="px-6 py-6">
                                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
                                    <Vote size={22} />
                                </div>
                                <p className="mt-4 text-xs uppercase tracking-[0.16em] text-slate-500">Elecciones activas</p>
                                <p className="mt-3 text-3xl font-semibold text-slate-900">{electionStats.activas}</p>
                            </CardContent>
                        </Card>
                        <Card className="border-0 bg-white/92 py-0 shadow-[0_18px_50px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                            <CardContent className="px-6 py-6">
                                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                                    <Landmark size={22} />
                                </div>
                                <p className="mt-4 text-xs uppercase tracking-[0.16em] text-slate-500">Centros vecinales</p>
                                <p className="mt-3 text-3xl font-semibold text-slate-900">{centrosVecinales.length}</p>
                            </CardContent>
                        </Card>
                    </div>

                    <section className="mt-6 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
                        <Card className="border-0 bg-white/94 py-0 shadow-[0_24px_70px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                            <CardHeader className="px-8 pt-8">
                                <div className="flex items-center gap-3">
                                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                                        <UsersRound size={20} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-semibold text-slate-900">
                                            Habitantes por barrio
                                        </CardTitle>
                                        <CardDescription className="text-sm leading-6 text-slate-500">
                                            Comparativa de habitantes estimados para cada barrio cargado en el sistema.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 px-6 pb-6">
                                <div className="overflow-x-auto">
                                    <div className="min-w-[560px] rounded-3xl bg-slate-50/80 p-5 ring-1 ring-slate-200">
                                        <div className="flex h-[320px] items-end gap-4">
                                            {neighborhoodsByPopulation.map((barrio) => (
                                                <div key={barrio.id} className="flex min-w-0 flex-1 flex-col items-center gap-3">
                                                    <p className="text-xs font-semibold text-slate-600">
                                                        {barrio.habitantesEstimados}
                                                    </p>
                                                    <div className="flex h-60 w-full items-end justify-center rounded-2xl bg-white/80 px-2 py-2 ring-1 ring-slate-200">
                                                        <div
                                                            className="w-full max-w-[56px] rounded-t-2xl bg-[linear-gradient(180deg,#27c6c7_0%,#1f78d5_68%,#0f3b68_100%)] shadow-[0_18px_30px_rgba(31,120,213,0.24)]"
                                                            style={{
                                                                height: getBarWidth(
                                                                    barrio.habitantesEstimados,
                                                                    maxPopulation
                                                                ),
                                                            }}
                                                        />
                                                    </div>
                                                    <p className="line-clamp-2 text-center text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                                                        {barrio.nombre}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 bg-white/94 py-0 shadow-[0_24px_70px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                            <CardHeader className="px-8 pt-8">
                                <div className="flex items-center gap-3">
                                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
                                        <BarChart3 size={20} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-semibold text-slate-900">
                                            Tipos de nota más apoyados
                                        </CardTitle>
                                        <CardDescription className="text-sm leading-6 text-slate-500">
                                            Suma total de apoyos agrupada por categoría de nota.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 px-6 pb-6">
                                {mostSupportedCategories.map((item) => (
                                    <div key={item.categoria} className="space-y-2 rounded-2xl bg-slate-50/80 p-4 ring-1 ring-slate-200">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white ${
                                                        categoryColors[item.categoria] ?? "from-slate-500 to-slate-400"
                                                    }`}
                                                >
                                                    {noteCategoryLabels[item.categoria] ?? item.categoria}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-slate-600">{item.apoyos} apoyos</p>
                                        </div>
                                        <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                                            <div
                                                className={`h-full rounded-full bg-gradient-to-r ${
                                                    categoryColors[item.categoria] ?? "from-slate-500 to-slate-400"
                                                }`}
                                                style={{ width: getBarWidth(item.apoyos, maxCategorySupport) }}
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500">{item.notas} notas publicadas en esta categoría</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </section>

                    <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
                        <Card className="border-0 bg-white/94 py-0 shadow-[0_24px_70px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                            <CardHeader className="px-8 pt-8">
                                <CardTitle className="text-2xl font-semibold text-slate-900">
                                    Cantidad de notas por barrio
                                </CardTitle>
                                <CardDescription className="text-sm leading-6 text-slate-500">
                                    Distribución de publicaciones por barrio en formato pastel.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-6 pb-6">
                                {notesPieChart.length > 0 ? (
                                    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
                                        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl bg-slate-50/80 p-6 ring-1 ring-slate-200">
                                            <div
                                                className="relative h-52 w-52 rounded-full shadow-[0_24px_50px_rgba(15,62,106,0.12)]"
                                                style={{ background: pieChartBackground }}
                                            >
                                                <div className="absolute inset-[22%] rounded-full bg-white shadow-inner" />
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                        Total
                                                    </span>
                                                    <span className="mt-2 text-3xl font-semibold text-slate-900">
                                                        {totalNeighborhoodNotes}
                                                    </span>
                                                    <span className="mt-1 text-sm text-slate-500">notas</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {notesPieChart.map((item) => (
                                                <div
                                                    key={item.barrioNombre}
                                                    className="rounded-2xl bg-slate-50/80 p-4 ring-1 ring-slate-200"
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="flex items-center gap-3">
                                                            <span
                                                                className="h-3.5 w-3.5 rounded-full"
                                                                style={{ backgroundColor: item.color }}
                                                            />
                                                            <p className="text-sm font-semibold text-slate-900">
                                                                {item.barrioNombre}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-semibold text-slate-700">
                                                                {item.cantidad} notas
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                {Math.round(item.percentage * 100)}%
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-12 text-center text-sm text-slate-500">
                                        Todavía no hay notas publicadas para construir el gráfico.
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
