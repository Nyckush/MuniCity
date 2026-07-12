import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, LoaderCircle, ShieldCheck, UserRound, Vote } from "lucide-react";

import api from "@/api/axios";
import CitizenNavbar from "@/components/CitizenNavbar";
import PresidentNavbar from "@/components/PresidentNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { clearStoredAuth, getValidStoredAuth, saveStoredAuth } from "@/lib/auth";

const runtimeConfig =
    typeof window !== "undefined" && window.__APP_CONFIG__
        ? window.__APP_CONFIG__
        : {};

const uploadsBaseUrl =
    runtimeConfig.VITE_UPLOADS_BASE_URL?.trim() || import.meta.env.VITE_UPLOADS_BASE_URL?.trim() || "";

const electionStateLabels = {
    CONVOCADA: "Convocada",
    POSTULACION: "Postulación abierta",
    VOTACION: "En votación",
    FINALIZADA: "Finalizada",
};

const applicationStateLabels = {
    PENDIENTE: "Pendiente",
    APROBADO: "Aprobada",
    RECHAZADO: "Rechazada",
};

const statusStyles = {
    CONVOCADA: "border-slate-200 bg-slate-100 text-slate-700",
    POSTULACION: "border-emerald-200 bg-emerald-50 text-emerald-700",
    VOTACION: "border-sky-200 bg-sky-50 text-sky-700",
    FINALIZADA: "border-slate-200 bg-slate-100 text-slate-600",
    PENDIENTE: "border-amber-200 bg-amber-50 text-amber-700",
    APROBADO: "border-emerald-200 bg-emerald-50 text-emerald-700",
    RECHAZADO: "border-rose-200 bg-rose-50 text-rose-700",
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

const getElectionStatusLabel = (status) => electionStateLabels[status] ?? status;

const getApplicationStatusLabel = (status) => applicationStateLabels[status] ?? status;

const getStatusClasses = (status) =>
    statusStyles[status] ?? "border-slate-200 bg-slate-100 text-slate-700";

const getCandidateDisplayName = (candidate) => {
    const baseName = candidate?.nombreCompleto?.trim() ?? "";
    const lastName = candidate?.apellido?.trim() ?? "";

    if (!lastName) {
        return baseName;
    }

    if (baseName.toLowerCase().includes(lastName.toLowerCase())) {
        return baseName;
    }

    return `${baseName} ${lastName}`.trim();
};

const resolveProfileImageUrl = (path) => {
    if (!path) {
        return "";
    }

    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
        return path;
    }

    if (!uploadsBaseUrl) {
        return path;
    }

    const normalizedBaseUrl = uploadsBaseUrl.endsWith("/")
        ? uploadsBaseUrl.slice(0, -1)
        : uploadsBaseUrl;

    return `${normalizedBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

const formatDate = (value) => {
    if (!value) {
        return "sin fecha";
    }

    return new Intl.DateTimeFormat("es-AR", {
        dateStyle: "long",
    }).format(new Date(value));
};

const getApplicationAvailabilityCopy = (election) => {
    if (election.yaPostulado) {
        return {
            buttonLabel: "Ya estás postulado",
            helperText: "Tu postulación ya fue registrada para esta elección.",
            buttonClassName: "h-12 w-full rounded-full",
        };
    }

    if (election.estadoEleccion === "POSTULACION") {
        return {
            buttonLabel: "Postularme",
            helperText: `Los vecinos podrán postularse a partir del día ${formatDate(election.fechaInicioPostulacion)} y finaliza el día ${formatDate(election.fechaFinPostulacion)}.`,
            buttonClassName:
                "h-12 w-full rounded-full bg-emerald-600 text-white hover:bg-emerald-700",
        };
    }

    if (election.estadoEleccion === "VOTACION" || election.estadoEleccion === "FINALIZADA") {
        return {
            buttonLabel: "Período finalizado",
            helperText: "El período de postulación ya finalizó.",
            buttonClassName: "h-12 w-full rounded-full",
        };
    }

    return {
        buttonLabel: "Próximamente",
        helperText: `Los vecinos podrán postularse a partir del día ${formatDate(election.fechaInicioPostulacion)} y finaliza el día ${formatDate(election.fechaFinPostulacion)}.`,
        buttonClassName: "h-12 w-full rounded-full",
    };
};

export default function CitizenElections() {
    const navigate = useNavigate();
    const [auth, setAuth] = useState(null);
    const [activePanel, setActivePanel] = useState("postularme");
    const [availableElections, setAvailableElections] = useState([]);
    const [registeredApplicants, setRegisteredApplicants] = useState([]);
    const [votingElections, setVotingElections] = useState([]);
    const [myVotes, setMyVotes] = useState([]);
    const [loadingApplications, setLoadingApplications] = useState(true);
    const [loadingVotes, setLoadingVotes] = useState(true);
    const [submittingElectionId, setSubmittingElectionId] = useState(null);
    const [submittingVoteKey, setSubmittingVoteKey] = useState("");
    const [applicationError, setApplicationError] = useState("");
    const [applicationSuccess, setApplicationSuccess] = useState("");
    const [voteError, setVoteError] = useState("");
    const [voteSuccess, setVoteSuccess] = useState("");

    useEffect(() => {
        const storedAuth = getValidStoredAuth();

        if (!storedAuth || !["ROLE_CIUDADANO", "ROLE_PRESIDENTE"].includes(storedAuth.role)) {
            navigate("/login");
            return;
        }

        const loadCitizenPage = async () => {
            try {
                const [
                    profileResponse,
                    availableResponse,
                    registeredApplicantsResponse,
                    votingResponse,
                    myVotesResponse,
                ] = await Promise.all([
                    api.get("/auth/me"),
                    api.get("/candidaturas/disponibles"),
                    api.get("/candidaturas/postulantes-registrados"),
                    api.get("/votos/disponibles"),
                    api.get("/votos/mis-votos"),
                ]);

                const mergedAuth = {
                    ...storedAuth,
                    ...profileResponse.data,
                    token: storedAuth.token,
                    expiresAt: storedAuth.expiresAt,
                };

                saveStoredAuth(mergedAuth);
                setAuth(mergedAuth);
                setAvailableElections(availableResponse.data ?? []);
                setRegisteredApplicants(registeredApplicantsResponse.data ?? []);
                setVotingElections(votingResponse.data ?? []);
                setMyVotes(myVotesResponse.data ?? []);
            } catch (error) {
                clearStoredAuth();
                navigate("/login");
            } finally {
                setLoadingApplications(false);
                setLoadingVotes(false);
            }
        };

        loadCitizenPage();
    }, [navigate]);

    const handleLogout = () => {
        clearStoredAuth();
        navigate("/login");
    };

    const reloadApplications = async () => {
        const [availableResponse, registeredApplicantsResponse] = await Promise.all([
            api.get("/candidaturas/disponibles"),
            api.get("/candidaturas/postulantes-registrados"),
        ]);

        setAvailableElections(availableResponse.data ?? []);
        setRegisteredApplicants(registeredApplicantsResponse.data ?? []);
    };

    const reloadVotes = async () => {
        const [votingResponse, myVotesResponse] = await Promise.all([
            api.get("/votos/disponibles"),
            api.get("/votos/mis-votos"),
        ]);

        setVotingElections(votingResponse.data ?? []);
        setMyVotes(myVotesResponse.data ?? []);
    };

    const handleApply = async (eleccionId) => {
        setSubmittingElectionId(eleccionId);
        setApplicationError("");
        setApplicationSuccess("");

        try {
            await api.post("/candidaturas", { eleccionId });
            await reloadApplications();
            setApplicationSuccess("Tu postulación fue enviada correctamente.");
        } catch (error) {
            setApplicationError(
                typeof error?.response?.data === "string"
                    ? error.response.data
                    : "No se pudo enviar la postulación."
            );
        } finally {
            setSubmittingElectionId(null);
        }
    };

    const handleVote = async (eleccionId, candidaturaId) => {
        setSubmittingVoteKey(`${eleccionId}-${candidaturaId}`);
        setVoteError("");
        setVoteSuccess("");

        try {
            await api.post("/votos", { eleccionId, candidaturaId });
            await reloadVotes();
            setVoteSuccess("Tu voto fue registrado correctamente.");
        } catch (error) {
            setVoteError(
                typeof error?.response?.data === "string"
                    ? error.response.data
                    : "No se pudo registrar tu voto."
            );
        } finally {
            setSubmittingVoteKey("");
        }
    };

    useEffect(() => {
        if (loadingApplications || loadingVotes) {
            return;
        }

        if (activePanel === "postularme" && availableElections.length === 0 && votingElections.length > 0) {
            setActivePanel("votar");
        }

        if (activePanel === "votar" && votingElections.length === 0 && availableElections.length > 0) {
            setActivePanel("postularme");
        }
    }, [activePanel, availableElections.length, loadingApplications, loadingVotes, votingElections.length]);

    if (!auth) {
        return null;
    }

    const electionNavbarActions = [
        {
            label: "Postularme",
            icon: ShieldCheck,
            active: activePanel === "postularme",
            onClick: () => setActivePanel("postularme"),
        },
        {
            label: "Votar",
            icon: Vote,
            active: activePanel === "votar",
            onClick: () => setActivePanel("votar"),
        },
    ];

    const ElectionsNavbar = auth.role === "ROLE_PRESIDENTE" ? PresidentNavbar : CitizenNavbar;

    return (
        <main className="min-h-screen bg-[#E6E9F3]">
            <ElectionsNavbar
                homeHref="/dashboard"
                userLabel={auth.nombreCompleto || auth.email}
                profileImageUrl={auth.fotoPerfil || ""}
                onLogout={handleLogout}
                contextActions={electionNavbarActions}
                notificationsEnabled
                profileEnabled
            />

            <div className="flex w-full flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
                {activePanel === "votar" ? (
                <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <Card className="border-0 bg-white/92 py-0 shadow-[0_18px_45px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                        <CardHeader className="px-6 pt-6">
                            <div className="flex items-center gap-3">
                                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-semibold text-slate-900">
                                        Urna virtual
                                    </CardTitle>
                                    <CardDescription className="mt-1 text-sm leading-6 text-slate-500">
                                        Durante la etapa de votación podés emitir un único voto por cada
                                        elección de tu barrio.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 px-6 pb-6">
                            {voteSuccess ? (
                                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                    {voteSuccess}
                                </div>
                            ) : null}

                            {voteError ? (
                                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                    {voteError}
                                </div>
                            ) : null}

                            {loadingVotes ? (
                                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500 ring-1 ring-slate-200">
                                    <LoaderCircle className="animate-spin" size={18} />
                                    Cargando elecciones en votación...
                                </div>
                            ) : null}

                            {!loadingVotes && votingElections.length === 0 ? (
                                <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500 ring-1 ring-slate-200">
                                    En este momento no hay elecciones abiertas para votar en tu barrio.
                                </div>
                            ) : null}

                            {!loadingVotes &&
                                votingElections.map((election) => (
                                    <article
                                        key={election.eleccionId}
                                        className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5"
                                    >
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="text-lg font-semibold text-slate-900">
                                                {election.centroVecinalNombre}
                                            </h2>
                                            <span
                                                className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(election.estadoEleccion)}`}
                                            >
                                                {getElectionStatusLabel(election.estadoEleccion)}
                                            </span>
                                            {election.yaVoto ? (
                                                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                                    Voto emitido
                                                </span>
                                            ) : null}
                                        </div>

                                        <p className="mt-2 text-sm text-slate-500">
                                            Barrio {election.barrioNombre}
                                        </p>

                                        <p className="mt-3 text-sm text-slate-600">
                                            Cierre de votación: {formatDateTime(election.fechaFinVotacion)}
                                        </p>

                                        {election.yaVoto ? (
                                            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                                Votaste a <strong>{election.candidatoSeleccionadoNombre}</strong>.
                                            </div>
                                        ) : null}

                                        <div className="mt-5 grid gap-4 lg:grid-cols-2">
                                            {election.candidatos?.length > 0 ? (
                                                election.candidatos.map((candidate) => {
                                                    const voteKey = `${election.eleccionId}-${candidate.candidaturaId}`;

                                                    return (
                                                        <div
                                                            key={candidate.candidaturaId}
                                                            className="rounded-3xl bg-white p-4 ring-1 ring-slate-200"
                                                        >
                                                            <div className="flex items-start gap-4">
                                                                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-100">
                                                                    {candidate.fotoPerfil ? (
                                                                        <img
                                                                            src={resolveProfileImageUrl(candidate.fotoPerfil)}
                                                                            alt={getCandidateDisplayName(candidate)}
                                                                            className="h-full w-full object-cover"
                                                                            onError={(event) => {
                                                                                event.currentTarget.style.display = "none";
                                                                                const fallback = event.currentTarget.nextElementSibling;
                                                                                if (fallback) {
                                                                                    fallback.classList.remove("hidden");
                                                                                }
                                                                            }}
                                                                        />
                                                                    ) : null}
                                                                    <UserRound
                                                                        size={30}
                                                                        className={candidate.fotoPerfil ? "hidden" : ""}
                                                                    />
                                                                </div>

                                                                <div className="min-w-0 flex-1">
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        <h3 className="text-lg font-semibold text-slate-900">
                                                                            {getCandidateDisplayName(candidate)}
                                                                        </h3>
                                                                        <span
                                                                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(candidate.estadoValidacion)}`}
                                                                        >
                                                                            {getApplicationStatusLabel(candidate.estadoValidacion)}
                                                                        </span>
                                                                    </div>
                                                                    <p className="mt-2 text-sm text-slate-500">
                                                                        Candidato del barrio
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <Button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleVote(
                                                                        election.eleccionId,
                                                                        candidate.candidaturaId
                                                                    )
                                                                }
                                                                disabled={
                                                                    election.yaVoto ||
                                                                    submittingVoteKey === voteKey
                                                                }
                                                                className="mt-4 h-12 w-full rounded-full"
                                                            >
                                                                {submittingVoteKey === voteKey ? (
                                                                    <>
                                                                        <LoaderCircle className="animate-spin" size={16} />
                                                                        Registrando voto...
                                                                    </>
                                                                ) : (
                                                                    "Votar candidato"
                                                                )}
                                                            </Button>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="rounded-2xl bg-white px-4 py-5 text-sm text-slate-500 ring-1 ring-slate-200">
                                                    Esta elección todavía no tiene candidatos disponibles para votar.
                                                </div>
                                            )}
                                        </div>
                                    </article>
                                ))}
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/92 py-0 shadow-[0_18px_45px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                        <CardHeader className="px-6 pt-6">
                            <CardTitle className="text-2xl font-semibold text-slate-900">
                                Mis votos emitidos
                            </CardTitle>
                            <CardDescription className="text-sm leading-6 text-slate-500">
                                Historial de participación en elecciones vecinales.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 px-6 pb-6">
                            {loadingVotes ? (
                                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500 ring-1 ring-slate-200">
                                    <LoaderCircle className="animate-spin" size={18} />
                                    Cargando tus votos...
                                </div>
                            ) : null}

                            {!loadingVotes && myVotes.length === 0 ? (
                                <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500 ring-1 ring-slate-200">
                                    Aún no emitiste votos en elecciones vecinales.
                                </div>
                            ) : null}

                            {!loadingVotes &&
                                myVotes.map((vote) => (
                                    <article
                                        key={vote.votoId}
                                        className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4"
                                    >
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="text-emerald-600" size={18} />
                                            <h3 className="text-base font-semibold text-slate-900">
                                                {vote.centroVecinalNombre}
                                            </h3>
                                        </div>
                                        <p className="mt-2 text-sm text-slate-500">Barrio {vote.barrioNombre}</p>
                                        <div className="mt-4 grid gap-3 text-sm text-slate-600">
                                            <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                                                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                                                    Candidato elegido
                                                </p>
                                                <p className="mt-2 font-medium">{vote.candidatoNombre}</p>
                                            </div>
                                            <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                                                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                                                    Fecha del voto
                                                </p>
                                                <p className="mt-2 font-medium">{formatDateTime(vote.fechaVoto)}</p>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                        </CardContent>
                    </Card>
                </section>
                ) : null}

                {activePanel === "postularme" ? (
                <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr] xl:items-start">
                    <Card className="border-0 bg-white/92 py-0 shadow-[0_18px_45px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                        <CardHeader className="px-6 pt-6">
                            <CardTitle className="text-2xl font-semibold text-slate-900">
                                Postularme
                            </CardTitle>
                            <CardDescription className="text-sm leading-6 text-slate-500">
                                Consultá el estado del período de postulación y enviá tu candidatura cuando esté habilitado.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 px-6 pb-6">
                            {applicationSuccess ? (
                                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                    {applicationSuccess}
                                </div>
                            ) : null}

                            {applicationError ? (
                                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                    {applicationError}
                                </div>
                            ) : null}

                            {loadingApplications ? (
                                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500 ring-1 ring-slate-200">
                                    <LoaderCircle className="animate-spin" size={18} />
                                    Cargando períodos de postulación...
                                </div>
                            ) : null}

                            {!loadingApplications && availableElections.length === 0 ? (
                                <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500 ring-1 ring-slate-200">
                                    Por ahora no hay elecciones activas o convocadas en tu barrio.
                                </div>
                            ) : null}

                            {!loadingApplications ? (
                                <div className="grid gap-4">
                                    {availableElections.map((election) => {
                                        const canApply =
                                            election.estadoEleccion === "POSTULACION" && !election.yaPostulado;
                                        const applicationAvailabilityCopy =
                                            getApplicationAvailabilityCopy(election);

                                        return (
                                            <article
                                                key={election.eleccionId}
                                                className="w-full rounded-3xl border border-slate-200 bg-slate-50/80 p-5"
                                            >
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-lg font-semibold text-slate-900">
                                                        {election.centroVecinalNombre}
                                                    </h3>
                                                    <span
                                                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(election.estadoEleccion)}`}
                                                    >
                                                        {getElectionStatusLabel(election.estadoEleccion)}
                                                    </span>
                                                    {election.yaPostulado ? (
                                                        <span
                                                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(election.estadoPostulacion)}`}
                                                        >
                                                            {getApplicationStatusLabel(election.estadoPostulacion)}
                                                        </span>
                                                    ) : null}
                                                </div>

                                                <p className="mt-2 text-sm text-slate-500">
                                                    Barrio {election.barrioNombre}
                                                </p>

                                                <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                                                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                                                        Período de postulación
                                                    </p>
                                                    <p className="mt-2 text-sm text-slate-700">
                                                        Desde {formatDate(election.fechaInicioPostulacion)}
                                                    </p>
                                                    <p className="mt-1 text-sm text-slate-700">
                                                        Hasta {formatDate(election.fechaFinPostulacion)}
                                                    </p>
                                                </div>

                                                <div className="mt-4">
                                                    <Button
                                                        type="button"
                                                        onClick={() => handleApply(election.eleccionId)}
                                                        disabled={!canApply || submittingElectionId === election.eleccionId}
                                                        className={applicationAvailabilityCopy.buttonClassName}
                                                    >
                                                        {submittingElectionId === election.eleccionId ? (
                                                            <>
                                                                <LoaderCircle className="animate-spin" size={16} />
                                                                Enviando...
                                                            </>
                                                        ) : (
                                                            applicationAvailabilityCopy.buttonLabel
                                                        )}
                                                    </Button>
                                                    <p className="mt-2 text-xs leading-5 text-slate-500">
                                                        {applicationAvailabilityCopy.helperText}
                                                    </p>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            ) : null}
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/92 py-0 shadow-[0_18px_45px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                        <CardHeader className="px-6 pt-6">
                            <CardTitle className="text-2xl font-semibold text-slate-900">
                                Postulantes registrados
                            </CardTitle>
                            <CardDescription className="text-sm leading-6 text-slate-500">
                                Vecinos que ya se registraron para participar en las elecciones del barrio.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                            {loadingApplications ? (
                                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500 ring-1 ring-slate-200">
                                    <LoaderCircle className="animate-spin" size={18} />
                                    Cargando postulantes registrados...
                                </div>
                            ) : null}

                            {!loadingApplications && registeredApplicants.length === 0 ? (
                                <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500 ring-1 ring-slate-200">
                                    Todavía no hay vecinos registrados en esta etapa electoral.
                                </div>
                            ) : null}

                            {!loadingApplications &&
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {registeredApplicants.map((application) => (
                                        <article
                                            key={application.candidaturaId}
                                            className="w-full rounded-3xl border border-slate-200 bg-slate-50/80 p-4"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-100">
                                                    {application.fotoPerfil ? (
                                                        <img
                                                            src={resolveProfileImageUrl(application.fotoPerfil)}
                                                            alt={application.ciudadanoNombre}
                                                            className="h-full w-full object-cover"
                                                            onError={(event) => {
                                                                event.currentTarget.style.display = "none";
                                                                const fallback = event.currentTarget.nextElementSibling;
                                                                if (fallback) {
                                                                    fallback.classList.remove("hidden");
                                                                }
                                                            }}
                                                        />
                                                    ) : null}
                                                    <UserRound
                                                        size={30}
                                                        className={application.fotoPerfil ? "hidden" : ""}
                                                    />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="text-base font-semibold text-slate-900">
                                                            {application.ciudadanoNombre}
                                                        </h3>
                                                        <span
                                                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(application.estadoValidacion)}`}
                                                        >
                                                            {getApplicationStatusLabel(application.estadoValidacion)}
                                                        </span>
                                                    </div>

                                                    <p className="mt-2 text-sm text-slate-500">
                                                        Barrio {application.barrioNombre}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-4 grid gap-3 text-sm text-slate-600">
                                                <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                                                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                                                        Centro vecinal
                                                    </p>
                                                    <p className="mt-2 font-medium">
                                                        {application.centroVecinalNombre}
                                                    </p>
                                                </div>
                                                <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                                                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                                                        Estado y fecha
                                                    </p>
                                                    <p className="mt-2 font-medium">
                                                        {getElectionStatusLabel(application.estadoEleccion)}
                                                    </p>
                                                    <p className="mt-1 text-slate-500">
                                                        {formatDateTime(application.fechaPostulacion)}
                                                    </p>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>}
                        </CardContent>
                    </Card>
                </section>
                ) : null}
            </div>
        </main>
    );
}
