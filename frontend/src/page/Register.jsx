import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, CalendarDays, CheckCircle2, ChevronLeft, Landmark, LoaderCircle, Mail, ShieldCheck, UserRound } from "lucide-react";

import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialForm = {
    email: "",
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
    const [form, setForm] = useState(initialForm);
    const [barrios, setBarrios] = useState([]);
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
            await api.post("/ciudadanos/registrar", {
                email: form.email.trim(),
                password: form.password,
                nombreCompleto: form.nombreCompleto.trim(),
                apellido: form.apellido.trim(),
                dni: form.dni.trim(),
                fechaNacimiento: form.fechaNacimiento,
                barrioId: Number(form.barrioId),
            });

            setSuccess("Tu cuenta fue registrada correctamente. Ya podés continuar con el ingreso.");
            setForm(initialForm);
        } catch (submitError) {
            setError(submitError.response?.data || "No se pudo completar el registro.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-[linear-gradient(180deg,#eef8ff_0%,#f7fbff_55%,#ffffff_100%)] px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 backdrop-blur"
                    >
                        <ChevronLeft size={16} />
                        Volver al inicio
                    </Link>

                    <img
                        src="/LogoMunicity.png"
                        alt="Logo de Municity"
                        className="h-12 w-auto object-contain"
                    />
                </div>

                <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
                    <Card className="overflow-hidden border-0 bg-[linear-gradient(160deg,#0f3f74_0%,#187fcf_58%,#27c7c5_100%)] py-0 text-white shadow-[0_24px_70px_rgba(20,79,129,0.24)]">
                        <CardContent className="relative flex h-full flex-col justify-between gap-8 px-8 py-8">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.14),transparent_24%)]" />

                            <div className="relative space-y-5">
                                <span className="inline-flex w-fit items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
                                    Registro ciudadano
                                </span>

                                <div className="space-y-3">
                                    <h1 className="max-w-md text-4xl font-semibold leading-tight tracking-[-0.05em] sm:text-5xl">
                                        Sumate a la comunidad digital de Municity.
                                    </h1>
                                    <p className="max-w-lg text-base leading-7 text-cyan-50/90">
                                        Creá tu cuenta para participar en propuestas barriales,
                                        comunicar observaciones y seguir de cerca lo que pasa en tu
                                        comunidad.
                                    </p>
                                </div>
                            </div>

                            <div className="relative grid gap-4">
                                {highlights.map((item) => (
                                    <div
                                        key={item}
                                        className="flex items-start gap-3 rounded-2xl border border-white/14 bg-white/10 px-4 py-4 backdrop-blur-sm"
                                    >
                                        <CheckCircle2 className="mt-0.5 shrink-0 text-cyan-100" size={20} />
                                        <p className="text-sm leading-6 text-white/92">{item}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="relative grid grid-cols-3 gap-3 text-center">
                                <div className="rounded-2xl border border-white/12 bg-white/10 px-3 py-4">
                                    <UserRound className="mx-auto mb-2 text-cyan-100" size={20} />
                                    <p className="text-xs font-medium text-white/90">Ciudadano</p>
                                </div>
                                <div className="rounded-2xl border border-white/12 bg-white/10 px-3 py-4">
                                    <Landmark className="mx-auto mb-2 text-cyan-100" size={20} />
                                    <p className="text-xs font-medium text-white/90">Barrio</p>
                                </div>
                                <div className="rounded-2xl border border-white/12 bg-white/10 px-3 py-4">
                                    <ShieldCheck className="mx-auto mb-2 text-cyan-100" size={20} />
                                    <p className="text-xs font-medium text-white/90">Cuenta segura</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/88 py-0 shadow-[0_24px_70px_rgba(15,62,106,0.12)] ring-1 ring-slate-200/70 backdrop-blur">
                        <CardHeader className="space-y-3 px-8 pt-8">
                            <div className="flex items-center gap-3">
                                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                                    <Building2 size={22} />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-semibold text-slate-900">
                                        Crear cuenta
                                    </CardTitle>
                                    <CardDescription className="mt-1 text-sm leading-6 text-slate-500">
                                        Completá tus datos para registrarte como ciudadano.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="px-8 pb-8">
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
                                        <select
                                            id="barrioId"
                                            name="barrioId"
                                            value={form.barrioId}
                                            onChange={handleChange}
                                            required
                                            disabled={loadingBarrios}
                                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                                        >
                                            <option value="">
                                                {loadingBarrios ? "Cargando barrios..." : "Seleccioná un barrio"}
                                            </option>
                                            {barrios.map((barrio) => (
                                                <option key={barrio.id} value={barrio.id}>
                                                    {barrio.nombre}
                                                </option>
                                            ))}
                                        </select>
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

                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-sm text-slate-500">
                                        ¿Ya tenés cuenta?{" "}
                                        <Link to="/login" className="font-medium text-sky-700 hover:text-sky-800">
                                            Ingresá acá
                                        </Link>
                                    </p>

                                    <Button
                                        type="submit"
                                        size="lg"
                                        disabled={submitting || loadingBarrios}
                                        className="h-11 rounded-xl bg-[linear-gradient(135deg,#2177d5,#2db6d5)] px-6 text-white shadow-[0_18px_35px_rgba(33,119,213,0.24)] hover:opacity-95"
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
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </main>
    );
}
