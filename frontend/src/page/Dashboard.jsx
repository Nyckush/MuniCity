import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardPenLine, HandHeart, LoaderCircle, Vote } from "lucide-react";

import api from "@/api/axios";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { clearStoredAuth, getValidStoredAuth, saveStoredAuth } from "@/lib/auth";
import { citizenNavigationItems } from "@/lib/citizenNavigation";

function MainActionCard({
    icon: Icon,
    eyebrow,
    title,
    description,
    accentClassName,
    panelClassName,
    imageSrc,
    imageAlt,
    onAction,
}) {
    return (
        <Card
            role="button"
            tabIndex={0}
            onClick={onAction}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onAction();
                }
            }}
            className="group cursor-pointer overflow-hidden border-0 bg-white py-0 shadow-[0_24px_60px_rgba(15,62,106,0.14)] ring-1 ring-slate-200/80 transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(15,62,106,0.18)] focus:outline-none focus:ring-2 focus:ring-sky-300"
        >
            <CardContent className="p-0">
                {imageSrc ? (
                    <div className="relative min-h-[220px] overflow-hidden bg-slate-100">
                        <img
                            src={imageSrc}
                            alt={imageAlt ?? title}
                            className="h-[220px] w-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/18 via-transparent to-transparent" />
                    </div>
                ) : (
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
                )}
                <div className="space-y-4 px-6 py-6">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{eyebrow}</p>
                        <h2 className="mt-2 text-2xl font-semibold text-slate-950">{title}</h2>
                        <p className="mt-3 text-sm leading-7 text-slate-500">{description}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function StatusBadge({ children }) {
    return (
        <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-sky-700 ring-1 ring-sky-100">
            {children}
        </span>
    );
}

export default function Dashboard() {
    const navigate = useNavigate();
    const [auth, setAuth] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedAuth = getValidStoredAuth();

        if (!storedAuth || storedAuth.role !== "ROLE_CIUDADANO") {
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

    const mainActions = [
        {
            title: "Apoyar Notas Barriales",
            eyebrow: "Participacion vecinal",
            description: "Descubrí propuestas y comunicados de tu barrio para sumar tu apoyo a las notas que impulsan mejoras concretas.",
            icon: HandHeart,
            imageSrc: "/ApoyoNotas.png",
            imageAlt: "Vecinos apoyando notas barriales",
            panelClassName: "bg-[linear-gradient(135deg,#0f3e6a_0%,#167ac6_48%,#27c2c8_100%)]",
            accentClassName: "text-rose-50",
            onAction: () => navigate("/notas"),
        },
        {
            title: "Enviar una Observacion",
            eyebrow: "Centro vecinal",
            description: "Envia una observacion o problemas del barrio a tu centro vecinal para que puedan revisarlos y darles seguimiento.",
            icon: ClipboardPenLine,
            imageSrc: "/observacion.png",
            imageAlt: "Vecino enviando una observacion barrial",
            panelClassName: "bg-[linear-gradient(135deg,#804c17_0%,#d58924_45%,#f0bb3c_100%)]",
            accentClassName: "text-amber-50",
            onAction: () => navigate("/observaciones"),
        },
        {
            title: "Elecciones",
            eyebrow: "Vida democratica",
            description: "Vota por un nuevo presidente o postulate como uno para representar a tu barrio en la proxima etapa vecinal.",
            icon: Vote,
            imageSrc: "/elecciones.png",
            imageAlt: "Vecinos participando en elecciones barriales",
            panelClassName: "bg-[linear-gradient(135deg,#1f3b27_0%,#23834f_44%,#64c27b_100%)]",
            accentClassName: "text-emerald-50",
            onAction: () => navigate("/elecciones"),
        },
    ];

    if (!auth && !loading) {
        return null;
    }

    return (
        <main className="min-h-screen bg-[#E6E9F3]">
            <Navbar
                homeHref="/dashboard"
                userLabel={auth?.nombreCompleto || auth?.email}
                profileImageUrl={auth?.fotoPerfil || ""}
                onLogout={handleLogout}
                navItems={citizenNavigationItems}
                notificationsEnabled
                profileEnabled
            />

            <div className="flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
                <header className="flex flex-col gap-4">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-3xl font-semibold text-slate-950 sm:text-4xl">
                                Hola, {auth?.nombreCompleto}
                            </h1>
                            <StatusBadge>Ciudadano</StatusBadge>
                        </div>
                        <p className="mt-2 max-w-3xl text-base leading-7 text-slate-500">
                            Accedé rápido a las acciones principales para participar en el barrio {auth?.barrioNombre}.
                        </p>
                    </div>
                </header>

                {loading ? (
                    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-4 text-sm text-slate-500">
                        <LoaderCircle className="animate-spin" size={18} />
                        Cargando tu resumen...
                    </div>
                ) : null}

                <section className="space-y-4">
                  
                    <div className="grid gap-5 xl:grid-cols-3">
                        {mainActions.map((action) => (
                            <MainActionCard key={action.title} {...action} />
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
