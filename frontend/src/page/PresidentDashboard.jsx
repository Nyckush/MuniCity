import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Bell,
    CheckCircle2,
    ClipboardPenLine,
    FileText,
    HandHeart,
    LoaderCircle,
    MapPinned,
    NotebookPen,
    Vote,
} from "lucide-react";

import api from "@/api/axios";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { clearStoredAuth, getValidStoredAuth, saveStoredAuth } from "@/lib/auth";
import { citizenNavigationItems } from "@/lib/citizenNavigation";

const noteCategoryLabels = {
    PETICION: "Petición",
    RECLAMO: "Reclamo",
    PROPUESTA: "Propuesta",
    COMUNICADO: "Comunicado",
};

const noteStatusLabels = {
    ENTREGADO: "Entregado",
    LEIDO: "Leída",
    APROBADA: "Aprobada",
    RECHAZADA: "Rechazada",
};

const notificationLabels = {
    NOTA_NUEVA: "Nueva nota",
    NOTA_APROBADA: "Nota aprobada",
    NOTA_RECHAZADA: "Nota rechazada",
    OBSERVACION_NUEVA: "Nueva observación",
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

function MetricCard({ icon: Icon, label, value, tone = "sky" }) {
    const toneClassName = {
        sky: "bg-sky-50 text-sky-700 ring-sky-100",
        emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
        amber: "bg-amber-50 text-amber-700 ring-amber-100",
        slate: "bg-slate-100 text-slate-700 ring-slate-200",
    }[tone];

    return (
        <Card className="border border-slate-200/80 bg-white/95 py-0 shadow-[0_12px_30px_rgba(15,62,106,0.07)] ring-1 ring-slate-200/75">
            <CardContent className="flex items-center gap-4 px-5 py-5">
                <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${toneClassName}`}>
                    <Icon size={20} />
                </span>
                <div className="min-w-0">
                    <p className="text-2xl font-semibold text-slate-950">{value}</p>
                    <p className="mt-1 truncate text-sm text-slate-500">{label}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function MainActionCard({
    icon: Icon,
    eyebrow,
    title,
    description,
    accentClassName,
    panelClassName,
    actionLabel,
    onAction,
}) {
    return (
        <Card className="group overflow-hidden border-0 bg-white py-0 shadow-[0_24px_60px_rgba(15,62,106,0.14)] ring-1 ring-slate-200/80 transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(15,62,106,0.18)]">
            <CardContent className="p-0">
                <div className={`relative min-h-[220px] overflow-hidden px-6 py-6 ${panelClassName}`}>
                    <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/20 blur-2xl" />
                    <div className="absolute -left-12 bottom-0 h-24 w-24 rounded-full bg-slate-950/10 blur-2xl" />
                    <div className="relative flex h-full flex-col justify-between gap-6">
                        <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-white/35 bg-white/20 text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)] backdrop-blur ${accentClassName}`}>
                            <Icon size={30} />
                        </div>
                        <div className="max-w-[16rem] rounded-[28px] border border-white/30 bg-white/14 px-5 py-4 text-white/92 shadow-[0_18px_40px_rgba(15,23,42,0.14)] backdrop-blur-sm">
                            <div className="mb-3 flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-white/90" />
                                <span className="h-2.5 w-2.5 rounded-full bg-white/55" />
                                <span className="h-2.5 w-10 rounded-full bg-white/35" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-3 w-20 rounded-full bg-white/70" />
                                <div className="h-3 w-full rounded-full bg-white/55" />
                                <div className="h-3 w-4/5 rounded-full bg-white/35" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="space-y-4 px-6 py-6">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{eyebrow}</p>
                        <h2 className="mt-2 text-2xl font-semibold text-slate-950">{title}</h2>
                        <p className="mt-3 text-sm leading-7 text-slate-500">{description}</p>
                    </div>
                    <Button
                        type="button"
                        onClick={onAction}
                        className="h-11 rounded-xl bg-slate-950 px-5 text-white hover:bg-slate-800"
                    >
                        {actionLabel}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function StatusBadge({ children, tone = "slate" }) {
    const className = {
        sky: "bg-sky-50 text-sky-700 ring-sky-100",
        emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
        amber: "bg-amber-50 text-amber-700 ring-amber-100",
        rose: "bg-rose-50 text-rose-700 ring-rose-100",
        slate: "bg-slate-100 text-slate-600 ring-slate-200",
    }[tone];

    return (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] ring-1 ${className}`}>
            {children}
        </span>
    );
}

function AttentionItem({ icon: Icon, title, description, meta, actionLabel, onAction, tone = "sky" }) {
    const iconClassName = {
        sky: "bg-sky-50 text-sky-700 ring-sky-100",
        emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
        amber: "bg-amber-50 text-amber-700 ring-amber-100",
        rose: "bg-rose-50 text-rose-700 ring-rose-100",
    }[tone];

    return (
        <article className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 gap-4">
                <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${iconClassName}`}>
                    <Icon size={19} />
                </span>
                <div className="min-w-0">
                    <h3 className="text-base font-semibold text-slate-950">{title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">{description}</p>
                    <p className="mt-2 text-xs font-medium uppercase tracking-[0.08em] text-slate-400">{meta}</p>
                </div>
            </div>
            <Button
                type="button"
                onClick={onAction}
                className="h-10 rounded-xl bg-slate-950 px-4 text-white hover:bg-slate-800 sm:shrink-0"
            >
                {actionLabel}
            </Button>
        </article>
    );
}

function NeighborhoodNoteItem({ note, onOpen }) {
    const statusTone = {
        ENTREGADO: "amber",
        LEIDO: "slate",
        APROBADA: "emerald",
        RECHAZADA: "rose",
    }[note.estado] ?? "slate";

    return (
        <article className="rounded-lg border border-slate-200 bg-white px-4 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="text-base font-semibold text-slate-950">{note.titulo}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                        {noteCategoryLabels[note.categoria] ?? note.categoria} · {note.centroVecinalNombre}
                    </p>
                </div>
                <StatusBadge tone={statusTone}>{noteStatusLabels[note.estado] ?? note.estado}</StatusBadge>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-500">
                    <HandHeart size={16} className="text-rose-500" />
                    {note.cantidadApoyos ?? 0} apoyos
                </span>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpen(note.id)}
                    className="h-9 rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                >
                    Ver
                </Button>
            </div>
        </article>
    );
}

function ParticipationItem({ icon: Icon, label, title, detail }) {
    return (
        <div className="flex gap-3 rounded-lg border border-slate-200 bg-white px-4 py-4">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-slate-200">
                <Icon size={18} />
            </span>
            <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">{label}</p>
                <p className="mt-1 truncate text-sm font-semibold text-slate-950">{title}</p>
                <p className="mt-1 text-xs text-slate-500">{detail}</p>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const navigate = useNavigate();
    const [auth, setAuth] = useState(null);
    const [dashboardData, setDashboardData] = useState({
        notifications: [],
        notificationSummary: { totalNoLeidas: 0 },
        notes: [],
        observations: [],
        votingElections: [],
        availableElections: [],
        myVotes: [],
        myApplications: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedAuth = getValidStoredAuth();

        if (!storedAuth || !["ROLE_CIUDADANO", "ROLE_PRESIDENTE"].includes(storedAuth.role)) {
            navigate("/login");
            return;
        }

        if (storedAuth.role !== "ROLE_PRESIDENTE") {
            navigate("/login");
            return;
        }

        const loadCitizenDashboard = async () => {
            try {
                const [
                    profileResponse,
                    notificationsResponse,
                    notificationSummaryResponse,
                    notesResponse,
                    observationsResponse,
                    votingResponse,
                    availableResponse,
                    votesResponse,
                    applicationsResponse,
                ] = await Promise.all([
                    api.get("/auth/me"),
                    api.get("/notificaciones"),
                    api.get("/notificaciones/resumen"),
                    api.get("/notas"),
                    api.get("/observaciones"),
                    api.get("/votos/disponibles"),
                    api.get("/candidaturas/disponibles"),
                    api.get("/votos/mis-votos"),
                    api.get("/candidaturas/mis-postulaciones"),
                ]);

                const mergedAuth = {
                    ...storedAuth,
                    ...profileResponse.data,
                    token: storedAuth.token,
                    expiresAt: storedAuth.expiresAt,
                };

                saveStoredAuth(mergedAuth);
                setAuth(mergedAuth);
                setDashboardData({
                    notifications: notificationsResponse.data ?? [],
                    notificationSummary: notificationSummaryResponse.data ?? { totalNoLeidas: 0 },
                    notes: notesResponse.data ?? [],
                    observations: observationsResponse.data ?? [],
                    votingElections: votingResponse.data ?? [],
                    availableElections: availableResponse.data ?? [],
                    myVotes: votesResponse.data ?? [],
                    myApplications: applicationsResponse.data ?? [],
                });
            } catch {
                clearStoredAuth();
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        loadCitizenDashboard();
    }, [navigate]);

    const handleLogout = () => {
        clearStoredAuth();
        navigate("/login");
    };

    const metrics = useMemo(() => {
        const unreadNotifications = dashboardData.notificationSummary.totalNoLeidas ?? 0;
        const supportedNotes = dashboardData.notes.filter((note) => note.apoyadaPorMi).length;
        const activeVotingElections = dashboardData.votingElections.filter((election) => !election.yaVoto).length;

        return {
            unreadNotifications,
            supportedNotes,
            observations: dashboardData.observations.length,
            activeVotingElections,
        };
    }, [dashboardData]);

    const ownNeighborhoodNotes = useMemo(
        () =>
            dashboardData.notes
                .filter((note) => note.barrioId === auth?.barrioId)
                .slice(0, 4),
        [auth?.barrioId, dashboardData.notes]
    );

    const attentionItems = useMemo(() => {
        const items = [];

        dashboardData.notifications
            .filter((notification) => !notification.leida)
            .slice(0, 2)
            .forEach((notification) => {
                items.push({
                    key: `notification-${notification.id}`,
                    icon: Bell,
                    title: notification.titulo,
                    description: notification.mensaje,
                    meta: notificationLabels[notification.tipo] ?? "Notificación",
                    actionLabel: "Ver",
                    tone: notification.tipo === "OBSERVACION_NUEVA" ? "amber" : "sky",
                    onAction: () => navigate("/notificaciones"),
                });
            });

        dashboardData.votingElections
            .filter((election) => !election.yaVoto)
            .slice(0, 1)
            .forEach((election) => {
                items.push({
                    key: `vote-${election.eleccionId}`,
                    icon: Vote,
                    title: `Votación abierta: ${election.centroVecinalNombre}`,
                    description: `Podés votar representantes del barrio ${election.barrioNombre}.`,
                    meta: `Cierra ${formatDateTime(election.fechaFinVotacion)}`,
                    actionLabel: "Votar",
                    tone: "emerald",
                    onAction: () => navigate("/elecciones"),
                });
            });

        ownNeighborhoodNotes
            .filter((note) => !note.apoyadaPorMi && note.autorCiudadanoId !== auth?.ciudadanoId)
            .slice(0, 2)
            .forEach((note) => {
                items.push({
                    key: `note-${note.id}`,
                    icon: FileText,
                    title: `Nota para apoyar: ${note.titulo}`,
                    description: `${note.autorNombre} publicó una nota para tu barrio.`,
                    meta: `${note.cantidadApoyos ?? 0} apoyos · ${formatDateTime(note.createdAt)}`,
                    actionLabel: "Apoyar",
                    tone: "sky",
                    onAction: () => navigate(`/notas?nota=${note.id}`),
                });
            });

        if (auth?.role === "ROLE_PRESIDENTE") {
            dashboardData.observations
                .filter((observation) => observation.estado === "ENTREGADO")
                .slice(0, 1)
                .forEach((observation) => {
                    items.push({
                        key: `observation-${observation.id}`,
                        icon: ClipboardPenLine,
                        title: `Nueva observación: ${observation.titulo}`,
                        description: `${observation.ciudadanoNombre} envió una observación para revisar.`,
                        meta: formatDateTime(observation.createdAt),
                        actionLabel: "Revisar",
                        tone: "amber",
                        onAction: () => navigate(`/observaciones?observacion=${observation.id}`),
                    });
                });
        }

        return items.slice(0, 5);
    }, [auth?.ciudadanoId, auth?.role, dashboardData, navigate, ownNeighborhoodNotes]);

    const latestObservation = dashboardData.observations[0];
    const latestVote = dashboardData.myVotes[0];
    const latestApplication = dashboardData.myApplications[0];
    const mainActions = [
        {
            title: "Publicar Notas Barriales",
            eyebrow: "Comunicacion barrial",
            description: "Publicá notas, propuestas y comunicados para mantener informado al barrio y movilizar la participacion vecinal.",
            icon: NotebookPen,
            panelClassName: "bg-[linear-gradient(135deg,#0f3e6a_0%,#167ac6_48%,#27c2c8_100%)]",
            accentClassName: "text-cyan-50",
            actionLabel: "Publicar nota",
            onAction: () => navigate("/notas"),
        },
        {
            title: "Revisar Observaciones",
            eyebrow: "Seguimiento ciudadano",
            description: "Revisá las observaciones que envian los vecinos de tu barrio y dales respuesta desde el centro vecinal.",
            icon: ClipboardPenLine,
            panelClassName: "bg-[linear-gradient(135deg,#804c17_0%,#d58924_45%,#f0bb3c_100%)]",
            accentClassName: "text-amber-50",
            actionLabel: "Ver observaciones",
            onAction: () => navigate("/observaciones"),
        },
        {
            title: "Elecciones",
            eyebrow: "Representacion barrial",
            description: "Seguí las elecciones del centro vecinal, revisá postulaciones y participa del proceso democratico del barrio.",
            icon: Vote,
            panelClassName: "bg-[linear-gradient(135deg,#1f3b27_0%,#23834f_44%,#64c27b_100%)]",
            accentClassName: "text-emerald-50",
            actionLabel: "Ir a elecciones",
            onAction: () => navigate("/elecciones"),
        },
    ];

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

            <div className="flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
                <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-3xl font-semibold text-slate-950 sm:text-4xl">
                                Hola, {auth.nombreCompleto}
                            </h1>
                            <StatusBadge tone="emerald">
                                Presidente
                            </StatusBadge>
                        </div>
                        <p className="mt-2 max-w-3xl text-base leading-7 text-slate-500">
                            Panel de gestion del centro vecinal para el barrio {auth.barrioNombre}.
                        </p>
                    </div>

                    <Button
                        type="button"
                        onClick={() => navigate("/notas")}
                        className="h-11 rounded-xl bg-slate-950 px-5 text-white hover:bg-slate-800"
                    >
                        <NotebookPen size={17} />
                        Publicar nota
                    </Button>
                </header>

                {loading ? (
                    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-4 text-sm text-slate-500">
                        <LoaderCircle className="animate-spin" size={18} />
                        Cargando tu resumen...
                    </div>
                ) : null}

                <section className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Acciones principales</p>
                        <h2 className="text-2xl font-semibold text-slate-950">Tu acceso rapido a la participacion del barrio</h2>
                    </div>
                    <div className="grid gap-5 xl:grid-cols-3">
                        {mainActions.map((action) => (
                            <MainActionCard key={action.title} {...action} />
                        ))}
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard icon={Bell} label="Notificaciones sin leer" value={metrics.unreadNotifications} tone="sky" />
                    <MetricCard icon={HandHeart} label="Notas apoyadas" value={metrics.supportedNotes} tone="emerald" />
                    <MetricCard icon={MapPinned} label="Observaciones recibidas" value={metrics.observations} tone="amber" />
                    <MetricCard icon={Vote} label="Elecciones para votar" value={metrics.activeVotingElections} tone="slate" />
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
                    <Card className="border border-slate-200/80 bg-white py-0 shadow-[0_12px_30px_rgba(15,62,106,0.07)] ring-1 ring-slate-200/75">
                        <CardHeader className="border-b border-slate-200 px-6 py-5">
                            <CardTitle className="text-2xl font-semibold text-slate-950">Requiere tu atención</CardTitle>
                            <CardDescription className="text-sm text-slate-500">
                                Acciones y novedades recientes para seguir participando.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-0 py-0">
                            {attentionItems.length > 0 ? (
                                attentionItems.map((item) => <AttentionItem key={item.key} {...item} />)
                            ) : (
                                <div className="px-6 py-10 text-sm text-slate-500">
                                    No tenés acciones pendientes por ahora.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card className="border border-slate-200/80 bg-white py-0 shadow-[0_12px_30px_rgba(15,62,106,0.07)] ring-1 ring-slate-200/75">
                            <CardHeader className="px-6 pt-6">
                                <CardTitle className="text-2xl font-semibold text-slate-950">Actividad de mi barrio</CardTitle>
                                <CardDescription className="text-sm text-slate-500">
                                    Últimas notas y propuestas compartidas en tu barrio.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 px-6 pb-6">
                                {ownNeighborhoodNotes.length > 0 ? (
                                    ownNeighborhoodNotes.map((note) => (
                                        <NeighborhoodNoteItem
                                            key={note.id}
                                            note={note}
                                            onOpen={(noteId) => navigate(`/notas?nota=${noteId}`)}
                                        />
                                    ))
                                ) : (
                                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                                        Todavía no hay notas publicadas para tu barrio.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border border-slate-200/80 bg-white py-0 shadow-[0_12px_30px_rgba(15,62,106,0.07)] ring-1 ring-slate-200/75">
                            <CardHeader className="px-6 pt-6">
                                <CardTitle className="text-2xl font-semibold text-slate-950">Mi participación</CardTitle>
                                <CardDescription className="text-sm text-slate-500">
                                    Últimos movimientos registrados en tu cuenta.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 px-6 pb-6">
                                <ParticipationItem
                                    icon={MapPinned}
                                    label="Última observación recibida"
                                    title={latestObservation?.titulo ?? "Sin observaciones"}
                                    detail={latestObservation ? formatDateTime(latestObservation.createdAt) : "No hay registros todavía"}
                                />
                                <ParticipationItem
                                    icon={Vote}
                                    label="Último voto"
                                    title={latestVote?.candidatoNombre ?? "Sin votos emitidos"}
                                    detail={latestVote ? formatDateTime(latestVote.fechaVoto) : "No hay votos registrados"}
                                />
                                <ParticipationItem
                                    icon={CheckCircle2}
                                    label="Última postulación"
                                    title={latestApplication?.centroVecinalNombre ?? "Sin postulaciones"}
                                    detail={
                                        latestApplication
                                            ? `${latestApplication.estadoValidacion} · ${formatDateTime(latestApplication.fechaPostulacion)}`
                                            : "No hay postulaciones registradas"
                                    }
                                />
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </div>
        </main>
    );
}
