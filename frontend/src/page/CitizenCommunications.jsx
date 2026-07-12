import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Globe2, LoaderCircle, MapPin, Megaphone, Search, Share2, Star } from "lucide-react";

import api from "@/api/axios";
import CitizenNavbar from "@/components/CitizenNavbar";
import PresidentNavbar from "@/components/PresidentNavbar";
import { Button } from "@/components/ui/button";
import { clearStoredAuth, getValidStoredAuth, saveStoredAuth } from "@/lib/auth";

const statusLabels = {
    PUBLICADO: "Publicado",
    BORRADOR: "Borrador",
    ARCHIVADO: "Archivado",
};

const formatDateTime = (value) => {
    if (!value) {
        return "-";
    }

    return new Intl.DateTimeFormat("es-AR", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
};

const getCommunicationDate = (item) => item.fechaPublicacion || item.createdAt || null;

export default function CitizenCommunications() {
    const navigate = useNavigate();
    const [auth, setAuth] = useState(null);
    const [communications, setCommunications] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loadingPage, setLoadingPage] = useState(true);

    useEffect(() => {
        const storedAuth = getValidStoredAuth();

        if (!storedAuth || !["ROLE_CIUDADANO", "ROLE_PRESIDENTE"].includes(storedAuth.role)) {
            navigate("/login");
            return;
        }

        const loadPage = async () => {
            try {
                const [profileResponse, communicationsResponse] = await Promise.all([
                    api.get("/auth/me"),
                    api.get("/comunicados/visibles"),
                ]);

                const mergedAuth = {
                    ...storedAuth,
                    ...profileResponse.data,
                    token: storedAuth.token,
                    expiresAt: storedAuth.expiresAt,
                };

                saveStoredAuth(mergedAuth);
                setAuth(mergedAuth);
                setCommunications(communicationsResponse.data ?? []);
            } catch {
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

    const handleShareCommunication = async (item) => {
        const shareText = `${item.titulo}\n\n${item.contenido}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: item.titulo,
                    text: shareText,
                });
                return;
            } catch {
                // If the user cancels, we silently ignore and keep fallback options available.
            }
        }

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    };

    const handleShareFacebook = (item) => {
        const shareText = `${item.titulo}\n\n${item.contenido}`;
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(shareText)}`;
        window.open(facebookUrl, "_blank", "noopener,noreferrer");
    };

    const visibleCommunications = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return [...communications]
            .filter((item) => {
                if (!normalizedSearch) {
                    return true;
                }

                return [item.titulo, item.contenido, item.barrioNombre, item.municipioNombre]
                    .filter(Boolean)
                    .some((value) => value.toLowerCase().includes(normalizedSearch));
            })
            .sort((first, second) => {
                const firstDate = getCommunicationDate(first);
                const secondDate = getCommunicationDate(second);
                return new Date(secondDate || 0).getTime() - new Date(firstDate || 0).getTime();
            });
    }, [communications, searchTerm]);

    const roleLabel = auth?.role === "ROLE_PRESIDENTE" ? "Presidente" : "Ciudadano";
    const CommunicationsNavbar = auth?.role === "ROLE_PRESIDENTE" ? PresidentNavbar : CitizenNavbar;

    if (!auth || loadingPage) {
        return null;
    }

    return (
        <main className="min-h-screen bg-[#E6E9F3]">
            <CommunicationsNavbar
                homeHref="/dashboard"
                userLabel={auth?.nombreCompleto || auth?.email}
                profileImageUrl={auth?.fotoPerfil || ""}
                onLogout={handleLogout}
                notificationsEnabled
                profileEnabled
                contextSearch={{
                    icon: Search,
                    value: searchTerm,
                    onChange: setSearchTerm,
                    placeholder: "Buscar comunicados...",
                }}
            />

            <div className="flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
              

                <section className="space-y-5">
                 

                    {visibleCommunications.length > 0 ? (
                        <div className="mx-auto w-full space-y-5 xl:w-[40%]">
                            {visibleCommunications.map((item) => (
                                <article
                                    key={item.id}
                                    className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_42px_rgba(15,23,42,0.08)]"
                                >
                                        <div className="space-y-5 px-6 py-6">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-700 ring-1 ring-sky-200">
                                                    Municipalidad
                                                </span>
                                                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 ring-1 ring-slate-200">
                                                    {item.esGlobal ? <Globe2 size={14} /> : <MapPin size={14} />}
                                                    {item.esGlobal ? "Todos los barrios" : item.barrioNombre}
                                                </span>
                                                {item.destacado ? (
                                                    <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700 ring-1 ring-amber-200">
                                                        <Star size={14} />
                                                        Destacado
                                                    </span>
                                                ) : null}
                                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700 ring-1 ring-emerald-200">
                                                    {statusLabels[item.estado] ?? item.estado}
                                                </span>
                                            </div>

                                            <div>
                                                <h2 className="text-3xl font-semibold text-slate-900">
                                                    {item.titulo}
                                                </h2>
                                                <p className="mt-2 text-sm text-slate-500">
                                                    {item.municipioNombre} · {formatDateTime(getCommunicationDate(item))}
                                                </p>
                                            </div>

                                            <div className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
                                                {item.contenido}
                                            </div>

                                            {item.imagenPortada ? (
                                                <div className="overflow-hidden rounded-[24px] ">
                                                    <img
                                                        src={item.imagenPortada}
                                                        alt={item.titulo}
                                                        className="mx-auto max-h-[400px] w-auto max-w-full object-contain"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex h-56 items-center justify-center rounded-[24px] bg-[linear-gradient(135deg,#0f3b68,#27c6c7)] text-white">
                                                    <div className="text-center">
                                                        <Megaphone size={42} className="mx-auto" />
                                                        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em]">
                                                            Comunicado oficial
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                                                <Button
                                                    type="button"
                                                    onClick={() => handleShareCommunication(item)}
                                                    className="h-10 rounded-xl bg-[linear-gradient(135deg,#2177d5,#2db6d5)] text-white hover:opacity-95"
                                                >
                                                    <Share2 size={16} />
                                                    Compartir
                                                </Button>

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => handleShareFacebook(item)}
                                                    className="h-10 rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                                >
                                                    <Share2 size={16} />
                                                    Facebook
                                                </Button>
                                            </div>
                                        </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-12 text-center text-sm text-slate-500">
                            No hay comunicados que coincidan con tu búsqueda.
                        </div>
                    )}
                </section>

                {loadingPage ? (
                    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-4 text-sm text-slate-500">
                        <LoaderCircle className="animate-spin" size={18} />
                        Cargando comunicados...
                    </div>
                ) : null}
            </div>
        </main>
    );
}
