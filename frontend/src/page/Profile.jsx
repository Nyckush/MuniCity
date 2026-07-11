import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoaderCircle, Save, UserRound } from "lucide-react";

import api from "@/api/axios";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { clearStoredAuth, getValidStoredAuth, saveStoredAuth } from "@/lib/auth";
import { citizenNavigationItems } from "@/lib/citizenNavigation";

const initialForm = {
    nombreCompleto: "",
    apellido: "",
    dni: "",
    fechaNacimiento: "",
    barrioId: "",
    fotoPerfil: "",
};

export default function Profile() {
    const navigate = useNavigate();
    const [auth, setAuth] = useState(null);
    const [form, setForm] = useState(initialForm);
    const [barrios, setBarrios] = useState([]);
    const [barrioQuery, setBarrioQuery] = useState("");
    const [isBarrioOpen, setIsBarrioOpen] = useState(false);
    const [loadingPage, setLoadingPage] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const storedAuth = getValidStoredAuth();

        if (!storedAuth || !["ROLE_CIUDADANO", "ROLE_PRESIDENTE"].includes(storedAuth.role)) {
            navigate("/login");
            return;
        }

        const loadProfilePage = async () => {
            try {
                const [profileResponse, barriosResponse] = await Promise.all([
                    api.get("/auth/me"),
                    api.get("/barrios"),
                ]);

                const mergedAuth = {
                    ...storedAuth,
                    ...profileResponse.data,
                    token: storedAuth.token,
                    expiresAt: storedAuth.expiresAt,
                };

                saveStoredAuth(mergedAuth);
                setAuth(mergedAuth);
                setBarrios(barriosResponse.data ?? []);
                setForm({
                    nombreCompleto: mergedAuth.nombreCompleto ?? "",
                    apellido: mergedAuth.apellido ?? "",
                    dni: mergedAuth.dni ?? "",
                    fechaNacimiento: mergedAuth.fechaNacimiento ?? "",
                    barrioId: mergedAuth.barrioId ? String(mergedAuth.barrioId) : "",
                    fotoPerfil: mergedAuth.fotoPerfil ?? "",
                });
                setBarrioQuery(mergedAuth.barrioNombre ?? "");
            } catch {
                clearStoredAuth();
                navigate("/login");
            } finally {
                setLoadingPage(false);
            }
        };

        loadProfilePage();
    }, [navigate]);

    const handleLogout = () => {
        clearStoredAuth();
        navigate("/login");
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const filteredBarrios = useMemo(() => {
        const normalized = barrioQuery.trim().toLowerCase();
        return barrios.filter((barrio) => barrio.nombre.toLowerCase().includes(normalized));
    }, [barrios, barrioQuery]);

    const handleBarrioInputChange = (event) => {
        const value = event.target.value;
        setBarrioQuery(value);
        setIsBarrioOpen(true);

        const exactMatch = barrios.find(
            (barrio) => barrio.nombre.trim().toLowerCase() === value.trim().toLowerCase()
        );

        setForm((current) => ({
            ...current,
            barrioId: exactMatch ? String(exactMatch.id) : "",
        }));
    };

    const handleBarrioSelect = (barrio) => {
        setBarrioQuery(barrio.nombre);
        setForm((current) => ({
            ...current,
            barrioId: String(barrio.id),
        }));
        setIsBarrioOpen(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (!form.barrioId) {
            setError("Debés seleccionar un barrio.");
            return;
        }

        setSubmitting(true);

        try {
            await api.put("/ciudadanos/perfil", {
                nombreCompleto: form.nombreCompleto.trim(),
                apellido: form.apellido.trim(),
                dni: form.dni.trim(),
                fechaNacimiento: form.fechaNacimiento,
                barrioId: Number(form.barrioId),
                fotoPerfil: form.fotoPerfil.trim() || null,
            });

            const profileResponse = await api.get("/auth/me");
            const nextAuth = {
                ...auth,
                ...profileResponse.data,
                token: auth.token,
                expiresAt: auth.expiresAt,
            };

            saveStoredAuth(nextAuth);
            setAuth(nextAuth);
            setBarrioQuery(nextAuth.barrioNombre ?? barrioQuery);
            setSuccess("Tus datos personales se actualizaron correctamente.");
        } catch (submitError) {
            setError(submitError.response?.data || "No se pudo actualizar el perfil.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!auth || loadingPage) {
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

            <div className="flex w-full flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
                <section className="mx-auto w-full max-w-3xl">
                    <Card className="border-0 bg-white/92 py-0 shadow-[0_18px_45px_rgba(15,62,106,0.10)] ring-1 ring-slate-200/70">
                        <CardHeader className="px-6 pt-6">
                            <div className="flex items-center gap-3">
                                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                                    <UserRound size={20} />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-semibold text-slate-900">Perfil</CardTitle>
                                    <CardDescription className="mt-1 text-sm leading-6 text-slate-500">
                                        Editá solo tus datos personales. Los datos de la cuenta no se modifican desde acá.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div className="space-y-3 md:col-span-2">
                                        <label className="text-sm font-medium text-slate-700">Vista previa</label>
                                        <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
                                            {form.fotoPerfil ? (
                                                <img
                                                    src={form.fotoPerfil}
                                                    alt="Foto de perfil"
                                                    className="h-20 w-20 rounded-3xl object-cover ring-1 ring-slate-200"
                                                    onError={(event) => {
                                                        event.currentTarget.style.display = "none";
                                                    }}
                                                />
                                            ) : (
                                                <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-slate-400 ring-1 ring-slate-200">
                                                    <UserRound size={30} />
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">
                                                    {form.nombreCompleto || "Tu perfil"}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    {form.fotoPerfil
                                                        ? "Así se verá tu foto de perfil."
                                                        : "Agregá una URL para mostrar tu foto de perfil."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium text-slate-700" htmlFor="nombreCompleto">
                                            Nombre completo
                                        </label>
                                        <Input
                                            id="nombreCompleto"
                                            name="nombreCompleto"
                                            value={form.nombreCompleto}
                                            onChange={handleChange}
                                            className="h-11 rounded-xl border-slate-200 bg-white"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700" htmlFor="apellido">
                                            Apellido
                                        </label>
                                        <Input
                                            id="apellido"
                                            name="apellido"
                                            value={form.apellido}
                                            onChange={handleChange}
                                            className="h-11 rounded-xl border-slate-200 bg-white"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700" htmlFor="dni">
                                            DNI
                                        </label>
                                        <Input
                                            id="dni"
                                            name="dni"
                                            value={form.dni}
                                            onChange={handleChange}
                                            className="h-11 rounded-xl border-slate-200 bg-white"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700" htmlFor="fechaNacimiento">
                                            Fecha de nacimiento
                                        </label>
                                        <Input
                                            id="fechaNacimiento"
                                            name="fechaNacimiento"
                                            type="date"
                                            value={form.fechaNacimiento}
                                            onChange={handleChange}
                                            className="h-11 rounded-xl border-slate-200 bg-white"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700" htmlFor="barrioId">
                                            Barrio
                                        </label>
                                        <div className="relative">
                                            <Input
                                                id="barrioId"
                                                name="barrioId"
                                                value={barrioQuery}
                                                onChange={handleBarrioInputChange}
                                                onFocus={() => setIsBarrioOpen(true)}
                                                onBlur={() => window.setTimeout(() => setIsBarrioOpen(false), 150)}
                                                className="h-11 rounded-xl border-slate-200 bg-white"
                                                autoComplete="off"
                                                required
                                            />
                                            {isBarrioOpen ? (
                                                <div className="absolute z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_35px_rgba(15,62,106,0.12)]">
                                                    {filteredBarrios.length > 0 ? (
                                                        filteredBarrios.map((barrio) => (
                                                            <button
                                                                key={barrio.id}
                                                                type="button"
                                                                onClick={() => handleBarrioSelect(barrio)}
                                                                className="w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-sky-50 hover:text-sky-700"
                                                            >
                                                                {barrio.nombre}
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <p className="px-3 py-2 text-sm text-slate-500">No se encontraron barrios.</p>
                                                    )}
                                                </div>
                                            ) : null}
                                        </div>
                                        <input type="hidden" name="barrioId" value={form.barrioId} readOnly />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium text-slate-700" htmlFor="fotoPerfil">
                                            Foto de perfil
                                        </label>
                                        <Input
                                            id="fotoPerfil"
                                            name="fotoPerfil"
                                            type="url"
                                            value={form.fotoPerfil}
                                            onChange={handleChange}
                                            placeholder="https://ejemplo.com/mi-foto.jpg"
                                            className="h-11 rounded-xl border-slate-200 bg-white"
                                        />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium text-slate-700" htmlFor="emailBloqueado">
                                            Correo electrónico
                                        </label>
                                        <Input
                                            id="emailBloqueado"
                                            value={auth.email ?? ""}
                                            className="h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-500"
                                            disabled
                                        />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium text-slate-700" htmlFor="usernameBloqueado">
                                            Username
                                        </label>
                                        <Input
                                            id="usernameBloqueado"
                                            value={auth.username ?? ""}
                                            className="h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-500"
                                            disabled
                                        />
                                    </div>
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

                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="h-11 w-full rounded-xl bg-[linear-gradient(135deg,#2177d5,#2db6d5)] px-8 text-white shadow-[0_18px_35px_rgba(33,119,213,0.24)] hover:opacity-95"
                                >
                                    {submitting ? (
                                        <>
                                            <LoaderCircle className="animate-spin" size={18} />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Guardar cambios
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </main>
    );
}
