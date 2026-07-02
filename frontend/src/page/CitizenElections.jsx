import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, LoaderCircle, ShieldCheck, Vote } from "lucide-react";

import api from "@/api/axios";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { clearStoredAuth, getValidStoredAuth, saveStoredAuth } from "@/lib/auth";
import { citizenNavigationItems } from "@/lib/citizenNavigation";

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

export default function CitizenElections() {
    const navigate = useNavigate();
    const [auth, setAuth] = useState(null);
    const [availableElections, setAvailableElections] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
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
                    applicationsResponse,
                    votingResponse,
                    myVotesResponse,
                ] = await Promise.all([
                    api.get("/auth/me"),
                    api.get("/candidaturas/disponibles"),
                    api.get("/candidaturas/mis-postulaciones"),
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
                setMyApplications(applicationsResponse.data ?? []);
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
        const [availableResponse, applicationsResponse] = await Promise.all([
            api.get("/candidaturas/disponibles"),
            api.get("/candidaturas/mis-postulaciones"),
        ]);

        setAvailableElections(availableResponse.data ?? []);
        setMyApplications(applicationsResponse.data ?? []);
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
                        <p className="text-sm font-medium text-sky-700">Participación ciudadana</p>
                        <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-slate-900">
                            Elecciones del centro vecinal
                        </h1>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                            Consultá convocatorias de tu barrio, postulate como representante y votá
                            a la persona que querés que presida tu centro vecinal.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right shadow-sm">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Barrio</p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">{auth.barrioNombre}</p>
                    </div>
                </div>

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
                                                            className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"
                                                        >
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div>
                                                                    <h3 className="text-base font-semibold text-slate-900">
                                                                        {candidate.nombreCompleto}
                                                                    </h3>
                                                                    <p className="mt-1 text-sm text-slate-500">
                                                                        Candidato del barrio
                                                                    </p>
                                                                </div>
                                                                <span
                                                                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(candidate.estadoValidacion)}`}
                                                                >
                                                                    {getApplicationStatusLabel(candidate.estadoValidacion)}
                                                                </span>
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
                                                                className="mt-4 w-full rounded-full"
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

                <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                    <Card className="border-0 bg-white/92 py-0 shadow-[0_18px_45px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                        <CardHeader className="px-6 pt-6">
                            <div className="flex items-center gap-3">
                                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                                    <Vote size={20} />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-semibold text-slate-900">
                                        Elecciones de tu barrio
                                    </CardTitle>
                                    <CardDescription className="mt-1 text-sm leading-6 text-slate-500">
                                        Postulate como presidente o representante cuando la convocatoria
                                        esté abierta.
                                    </CardDescription>
                                </div>
                            </div>
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
                                    Cargando elecciones disponibles...
                                </div>
                            ) : null}

                            {!loadingApplications && availableElections.length === 0 ? (
                                <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500 ring-1 ring-slate-200">
                                    Por ahora no hay elecciones activas o convocadas en tu barrio.
                                </div>
                            ) : null}

                            {!loadingApplications &&
                                availableElections.map((election) => {
                                    const canApply =
                                        election.estadoEleccion === "POSTULACION" && !election.yaPostulado;

                                    return (
                                        <article
                                            key={election.eleccionId}
                                            className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5"
                                        >
                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                <div className="space-y-3">
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
                                                                {getApplicationStatusLabel(
                                                                    election.estadoPostulacion
                                                                )}
                                                            </span>
                                                        ) : null}
                                                    </div>

                                                    <p className="text-sm text-slate-500">
                                                        Barrio {election.barrioNombre}
                                                    </p>

                                                    <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                                                        <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                                                            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                                                                Postulación
                                                            </p>
                                                            <p className="mt-2">
                                                                {formatDateTime(election.fechaInicioPostulacion)}
                                                            </p>
                                                            <p className="mt-1">
                                                                {formatDateTime(election.fechaFinPostulacion)}
                                                            </p>
                                                        </div>
                                                        <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                                                            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                                                                Votación
                                                            </p>
                                                            <p className="mt-2">
                                                                {formatDateTime(election.fechaInicioVotacion)}
                                                            </p>
                                                            <p className="mt-1">
                                                                {formatDateTime(election.fechaFinVotacion)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex min-w-[220px] flex-col gap-2">
                                                    <Button
                                                        type="button"
                                                        onClick={() => handleApply(election.eleccionId)}
                                                        disabled={!canApply || submittingElectionId === election.eleccionId}
                                                        className="w-full rounded-full"
                                                    >
                                                        {submittingElectionId === election.eleccionId ? (
                                                            <>
                                                                <LoaderCircle className="animate-spin" size={16} />
                                                                Enviando...
                                                            </>
                                                        ) : election.yaPostulado ? (
                                                            "Ya estás postulado"
                                                        ) : canApply ? (
                                                            "Postularme"
                                                        ) : (
                                                            "No disponible"
                                                        )}
                                                    </Button>
                                                    <p className="text-xs leading-5 text-slate-500">
                                                        Solo podés postularte en elecciones de tu propio barrio.
                                                    </p>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/92 py-0 shadow-[0_18px_45px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                        <CardHeader className="px-6 pt-6">
                            <CardTitle className="text-2xl font-semibold text-slate-900">
                                Mis postulaciones
                            </CardTitle>
                            <CardDescription className="text-sm leading-6 text-slate-500">
                                Seguimiento del estado de validación de tus presentaciones.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 px-6 pb-6">
                            {loadingApplications ? (
                                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500 ring-1 ring-slate-200">
                                    <LoaderCircle className="animate-spin" size={18} />
                                    Cargando tus postulaciones...
                                </div>
                            ) : null}

                            {!loadingApplications && myApplications.length === 0 ? (
                                <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500 ring-1 ring-slate-200">
                                    Aún no realizaste ninguna postulación.
                                </div>
                            ) : null}

                            {!loadingApplications &&
                                myApplications.map((application) => (
                                    <article
                                        key={application.candidaturaId}
                                        className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4"
                                    >
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-base font-semibold text-slate-900">
                                                {application.centroVecinalNombre}
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

                                        <div className="mt-4 grid gap-3 text-sm text-slate-600">
                                            <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                                                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                                                    Estado de la elección
                                                </p>
                                                <p className="mt-2 font-medium">
                                                    {getElectionStatusLabel(application.estadoEleccion)}
                                                </p>
                                            </div>
                                            <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                                                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                                                    Fecha de postulación
                                                </p>
                                                <p className="mt-2 font-medium">
                                                    {formatDateTime(application.fechaPostulacion)}
                                                </p>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                        </CardContent>
                    </Card>
                </section>
            </div>
        </main>
    );
}
