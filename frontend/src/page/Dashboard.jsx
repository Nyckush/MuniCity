import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, MapPinned, UserRound } from "lucide-react";

import api from "@/api/axios";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { clearStoredAuth, getValidStoredAuth, saveStoredAuth } from "@/lib/auth";
import { citizenNavigationItems } from "@/lib/citizenNavigation";

const dashboardItems = [
    {
        title: "Propuestas barriales",
        description: "Apoyá ideas de tu comunidad y seguí su evolución.",
        icon: ClipboardList,
    },
    {
        title: "Observaciones",
        description: "Reportá situaciones del barrio y mantené trazabilidad.",
        icon: MapPinned,
    },
    {
        title: "Perfil ciudadano",
        description: "Tus datos de acceso y vínculo con el barrio.",
        icon: UserRound,
    },
];

export default function Dashboard() {
    const navigate = useNavigate();
    const [auth, setAuth] = useState(null);

    useEffect(() => {
        const storedAuth = getValidStoredAuth();

        if (!storedAuth || !["ROLE_CIUDADANO", "ROLE_PRESIDENTE"].includes(storedAuth.role)) {
            navigate("/login");
            return;
        }

        const loadCitizenDashboard = async () => {
            try {
                const profileResponse = await api.get("/auth/me");

                const mergedAuth = {
                    ...storedAuth,
                    ...profileResponse.data,
                    token: storedAuth.token,
                    expiresAt: storedAuth.expiresAt,
                };

                saveStoredAuth(mergedAuth);
                setAuth(mergedAuth);
            } catch (error) {
                clearStoredAuth();
                navigate("/login");
            }
        };

        loadCitizenDashboard();
    }, [navigate]);

    const handleLogout = () => {
        clearStoredAuth();
        navigate("/login");
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
                <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                    <Card className="border-0 bg-[linear-gradient(145deg,#0f3b68_0%,#1f78d5_56%,#27c6c7_100%)] py-0 text-white shadow-[0_24px_70px_rgba(20,79,129,0.24)]">
                        <CardContent className="space-y-6 px-8 py-8">
                            <span className="inline-flex w-fit items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
                                {auth.role === "ROLE_PRESIDENTE" ? "Panel presidente" : "Panel ciudadano"}
                            </span>

                            <div className="space-y-3">
                                <h1 className="text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
                                    Bienvenido, {auth.nombreCompleto}.
                                </h1>
                                <p className="max-w-2xl text-base leading-7 text-cyan-50/90">
                                    {auth.role === "ROLE_PRESIDENTE"
                                        ? "Desde este espacio podés participar como vecino y además administrar la comunicación oficial de tu centro vecinal."
                                        : "Ya ingresaste correctamente a Municity. Desde este espacio vas a poder participar en tu comunidad, ver actividad del barrio, gestionar tus observaciones y postularte para representar a tu centro vecinal."}
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="rounded-2xl border border-white/12 bg-white/10 p-4">
                                    <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/90">Barrio</p>
                                    <p className="mt-2 text-lg font-semibold">{auth.barrioNombre}</p>
                                </div>
                                <div className="rounded-2xl border border-white/12 bg-white/10 p-4">
                                    <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/90">Rol</p>
                                    <p className="mt-2 text-lg font-semibold">{auth.role}</p>
                                </div>
                                <div className="rounded-2xl border border-white/12 bg-white/10 p-4">
                                    <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/90">Correo</p>
                                    <p className="mt-2 break-all text-sm font-semibold">{auth.email}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/92 py-0 shadow-[0_24px_70px_rgba(15,62,106,0.12)] ring-1 ring-slate-200/70 backdrop-blur">
                        <CardHeader className="px-8 pt-8">
                            <CardTitle className="text-2xl font-semibold text-slate-900">
                                Tu resumen
                            </CardTitle>
                            <CardDescription className="text-sm leading-6 text-slate-500">
                                Datos del ciudadano autenticado y acceso rápido al siguiente paso.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 px-8 pb-8">
                            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Ciudadano ID</p>
                                <p className="mt-2 text-lg font-semibold text-slate-900">{auth.ciudadanoId}</p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Apellido</p>
                                <p className="mt-2 text-lg font-semibold text-slate-900">{auth.apellido}</p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Barrio ID</p>
                                <p className="mt-2 text-lg font-semibold text-slate-900">{auth.barrioId}</p>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section className="grid gap-4 md:grid-cols-3">
                    {dashboardItems.map(({ title, description, icon: Icon }) => (
                        <Card
                            key={title}
                            className="border-0 bg-white/92 py-0 shadow-[0_18px_45px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70"
                        >
                            <CardContent className="space-y-4 px-6 py-6">
                                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                                    <Icon size={22} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </section>
            </div>
        </main>
    );
}
