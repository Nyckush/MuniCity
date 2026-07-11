import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, CalendarDays, CheckCircle2, ChevronLeft, Landmark, LoaderCircle, Mail, ShieldCheck, UserRound } from "lucide-react";

import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDashboardRouteByRole, saveStoredAuth } from "@/lib/auth";



const initialForm = {
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    nombreCompleto: "",
    apellido: "",
    dni: "",
    fechaNacimiento: "",
    barrioId: "",
};

const highlights = [
    "Registro ciudadano vinculado a tu barrio.",
    "Acceso futuro a propuestas, observaciones y participación vecinal.",
    "Proceso simple, directo y pensado para vecinos.",
];

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState(initialForm);
    const [barrios, setBarrios] = useState([]);
    const [barrioQuery, setBarrioQuery] = useState("");
    const [isBarrioOpen, setIsBarrioOpen] = useState(false);
    const [loadingBarrios, setLoadingBarrios] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const loadBarrios = async () => {
            try {
                const response = await api.get("/barrios");
                setBarrios(response.data ?? []);
            } catch (loadError) {
                setError("No se pudieron cargar los barrios. Verificá que el backend esté en ejecución.");
            } finally {
                setLoadingBarrios(false);
            }
        };

        loadBarrios();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const normalizedBarrioQuery = barrioQuery.trim().toLowerCase();
    const filteredBarrios = barrios.filter((barrio) =>
        barrio.nombre.toLowerCase().includes(normalizedBarrioQuery)
    );

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

        if (form.password !== form.confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        if (!form.barrioId) {
            setError("Debés seleccionar un barrio.");
            return;
        }

        setSubmitting(true);

        try {
            const trimmedEmail = form.email.trim();
            const trimmedUsername = form.username.trim();
            const trimmedNombreCompleto = form.nombreCompleto.trim();
            const trimmedApellido = form.apellido.trim();
            const trimmedDni = form.dni.trim();

            await api.post("/ciudadanos/registrar", {
                email: trimmedEmail,
                username: trimmedUsername,
                password: form.password,
                nombreCompleto: trimmedNombreCompleto,
                apellido: trimmedApellido,
                dni: trimmedDni,
                fechaNacimiento: form.fechaNacimiento,
                barrioId: Number(form.barrioId),
            });

            const loginResponse = await api.post("/auth/login", {
                email: trimmedEmail,
                password: form.password,
            });

            saveStoredAuth(loginResponse.data);
            setSuccess("Tu cuenta fue registrada correctamente. Redirigiendo...");
            setForm(initialForm);
            setBarrioQuery("");
            navigate(getDashboardRouteByRole(loginResponse.data.role));
        } catch (submitError) {
            setError(submitError.response?.data || "No se pudo completar el registro.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_left_center,rgba(119,181,246,0.18),transparent_20%),radial-gradient(circle_at_right_top,rgba(42,197,201,0.18),transparent_24%),linear-gradient(180deg,#f2fbff_0%,#edf8ff_45%,#f8fcff_100%)] px-2 py-8 sm:px-6 lg:px-8">
            <div
                aria-hidden="true"
                className="absolute left-[-4rem] top-[-2.5rem] h-44 w-72 rotate-[-8deg] rounded-b-[10rem] rounded-t-none bg-[linear-gradient(135deg,rgba(41,116,214,0.9),rgba(35,209,195,0.84))] opacity-95"
            />
            <div
                aria-hidden="true"
                className="absolute right-[-4rem] top-[-2.5rem] h-44 w-72 rotate-[8deg] rounded-b-[10rem] rounded-t-none bg-[linear-gradient(135deg,rgba(34,122,219,0.86),rgba(25,203,198,0.82))] opacity-95"
            />

            <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  

                   
                </div>

                <section className="flex w-full justify-center">
                    <Card className="w-full max-w-3xl border-0 bg-white/88 py-0 shadow-[0_24px_70px_rgba(15,62,106,0.12)] ring-1 ring-slate-200/70 backdrop-blur">
                    
                        <CardHeader className="space-y-3 px-4 pt-6 sm:px-8 sm:pt-8">
                            <div className="flex items-center gap-3 flex-col">
                        
                                    <img
                        src="/LogoMunicity.png"
                        alt="Logo de Municity"
                        className="h-12 w-auto object-contain mb-10"
                    />
                         <div className="flex items-start gap-4   rounded-2xl w-full justify-center ">
                              
                              
                                    <CardTitle  style={{ display: "flex", alignItems: "center", gap: "8px" }}> 
                                          <i class="bi bi-person-fill-add" style={{ fontSize: "24px", color: "darkgray" }}></i>  
                                          <p className="m-0" style={{ color: "darkgray", letterSpacing: "3px" }}>Crear Cuenta</p> 
                                    </CardTitle>
                                   
                               
                            </div>
                        </div>
                        </CardHeader>

                        <CardContent className="px-4 pb-6 sm:px-8 sm:pb-8">
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="nombreCompleto">Nombre completo</Label>
                                        <Input
                                            id="nombreCompleto"
                                            name="nombreCompleto"
                                            value={form.nombreCompleto}
                                            onChange={handleChange}
                                            placeholder="Ej. Juan Carlos"
                                            required
                                            className="h-11 rounded-xl border-slate-200 bg-white"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="apellido">Apellido</Label>
                                        <Input
                                            id="apellido"
                                            name="apellido"
                                            value={form.apellido}
                                            onChange={handleChange}
                                            placeholder="Ej. Pérez"
                                            required
                                            className="h-11 rounded-xl border-slate-200 bg-white"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="dni">DNI</Label>
                                        <Input
                                            id="dni"
                                            name="dni"
                                            value={form.dni}
                                            onChange={handleChange}
                                            placeholder="Ej. 32123456"
                                            required
                                            className="h-11 rounded-xl border-slate-200 bg-white"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="fechaNacimiento">Fecha de nacimiento</Label>
                                        <div className="relative">
                                            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <Input
                                                id="fechaNacimiento"
                                                name="fechaNacimiento"
                                                type="date"
                                                value={form.fechaNacimiento}
                                                onChange={handleChange}
                                                required
                                                className="h-11 rounded-xl border-slate-200 bg-white pl-10"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="barrioId">Barrio</Label>
                                        <div className="relative">
                                            <Input
                                                id="barrioId"
                                                name="barrioId"
                                                value={barrioQuery}
                                                onChange={handleBarrioInputChange}
                                                onFocus={() => setIsBarrioOpen(true)}
                                                onBlur={() => {
                                                    window.setTimeout(() => setIsBarrioOpen(false), 150);
                                                }}
                                                placeholder={loadingBarrios ? "Cargando barrios..." : "Escribí para buscar tu barrio"}
                                                required
                                                disabled={loadingBarrios}
                                                className="h-11 rounded-xl border-slate-200 bg-white"
                                                autoComplete="off"
                                            />
                                            {isBarrioOpen && !loadingBarrios ? (
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
                                                        <p className="px-3 py-2 text-sm text-slate-500">
                                                            No se encontraron barrios.
                                                        </p>
                                                    )}
                                                </div>
                                            ) : null}
                                        </div>
                                        <input
                                            type="hidden"
                                            id="barrioId"
                                            name="barrioId"
                                            value={form.barrioId}
                                            readOnly
                                        />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="username">Username</Label>
                                        <Input
                                            id="username"
                                            name="username"
                                            value={form.username}
                                            onChange={handleChange}
                                            placeholder="Ej. juanperez"
                                            required
                                            className="h-11 rounded-xl border-slate-200 bg-white"
                                        />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="email">Correo electrónico</Label>
                                        <div className="relative">
                                            <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={form.email}
                                                onChange={handleChange}
                                                placeholder="nombre@correo.com"
                                                required
                                                className="h-11 rounded-xl border-slate-200 bg-white pl-10"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">Contraseña</Label>
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            value={form.password}
                                            onChange={handleChange}
                                            placeholder="Mínimo una contraseña segura"
                                            required
                                            className="h-11 rounded-xl border-slate-200 bg-white"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            value={form.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Repetí tu contraseña"
                                            required
                                            className="h-11 rounded-xl border-slate-200 bg-white"
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

                                <div className="flex flex-col gap-3  sm:items-center justify-center">
                                 

                                    <Button
                                        type="submit"
                                        size="lg"
                                        disabled={submitting || loadingBarrios}
                                        className="h-11 w-full rounded-xl bg-[linear-gradient(135deg,#2177d5,#2db6d5)] px-8 text-white shadow-[0_18px_35px_rgba(33,119,213,0.24)] hover:opacity-95 sm:w-auto sm:min-w-[220px]"
                                      style={{letterSpacing: "2px"}}
                                    >
                                        {submitting ? (
                                            <>
                                                <LoaderCircle className="animate-spin" size={18} />
                                                Registrando...
                                            </>
                                        ) : (
                                            "Crear cuenta"
                                        )}
                                    </Button>

                                         <Link
                        to="/"
                        className="inline-flex items-center gap-2   px-4 py-2 text-sm font-medium text-slate-700   "
                    >
                        <ChevronLeft size={16} />
                        Volver al inicio
                    </Link>
                                </div>
                            </form>
                        </CardContent>

                     
                    </Card>
                </section>
            </div>
        </main>
    );
}
