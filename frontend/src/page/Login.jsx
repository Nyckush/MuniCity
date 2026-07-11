import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AtSign, ChevronLeft, LoaderCircle } from "lucide-react";

import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDashboardRouteByRole, saveStoredAuth } from "@/lib/auth";

const initialForm = {
    identifier: "",
    password: "",
};

export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState(initialForm);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("");
        setError("");
        setSubmitting(true);

        try {
            const response = await api.post("/auth/login", {
                identifier: form.identifier.trim(),
                password: form.password,
            });

            saveStoredAuth(response.data);
            setMessage("Inicio de sesión exitoso. Redirigiendo...");
            navigate(getDashboardRouteByRole(response.data.role));
        } catch (submitError) {
            setError(submitError.response?.data || "No se pudo iniciar sesión.");
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
                <section className="flex w-full justify-center">
                    <Card className="w-full max-w-3xl border-0 bg-white/88 py-0 shadow-[0_24px_70px_rgba(15,62,106,0.12)] ring-1 ring-slate-200/70 backdrop-blur">
                        <CardHeader className="space-y-3 px-4 pt-6 sm:px-8 sm:pt-8">
                            <div className="flex flex-col items-center gap-3">
                                <img
                                    src="/LogoMunicity.png"
                                    alt="Logo de Municity"
                                    className="mb-15 h-12 w-auto object-contain"
                                />
                                <div className="flex w-full items-start justify-center gap-4 rounded-2xl">
                                    <CardTitle style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <i className="bi bi-box-arrow-in-right" style={{ fontSize: "24px", color: "darkgray" }} />
                                        <p className="m-0" style={{ color: "darkgray", letterSpacing: "3px" }}>Iniciar Sesion</p>
                                    </CardTitle>
                                </div>
                                <CardDescription className="text-center text-sm leading-6 text-slate-500">
                                    Ingresá con tu cuenta ciudadana o de municipio para acceder a la plataforma.
                                </CardDescription>
                            </div>
                        </CardHeader>

                        <CardContent className="px-4 pb-6 sm:px-8 sm:pb-8">
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div className="grid gap-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="identifier">Correo electrónico o username</Label>
                                        <div className="relative">
                                            <AtSign className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <Input
                                                id="identifier"
                                                name="identifier"
                                                type="text"
                                                value={form.identifier}
                                                onChange={handleChange}
                                                placeholder="Ej. presidente o nombre@correo.com"
                                                required
                                                className="h-11 rounded-xl border-slate-200 bg-white pl-10"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between gap-3">
                                            <Label htmlFor="password">Contraseña</Label>
                                            <span className="text-xs font-medium text-slate-400">
                                                Próximamente: recuperación
                                            </span>
                                        </div>
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            value={form.password}
                                            onChange={handleChange}
                                            placeholder="Ingresá tu contraseña"
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

                                {message ? (
                                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                        {message}
                                    </div>
                                ) : null}

                                <div className="flex flex-col justify-center gap-3 sm:items-center">
                                    <p className="text-sm text-slate-500">
                                        ¿Todavía no tenés cuenta?{" "}
                                        <Link to="/register" className="font-medium text-sky-700 hover:text-sky-800">
                                            Registrate acá
                                        </Link>
                                    </p>

                                    <Button
                                        type="submit"
                                        size="lg"
                                        disabled={submitting}
                                        className="h-11 w-full rounded-xl bg-[linear-gradient(135deg,#2177d5,#2db6d5)] px-8 text-white shadow-[0_18px_35px_rgba(33,119,213,0.24)] hover:opacity-95 sm:w-auto sm:min-w-[220px]"
                                        style={{ letterSpacing: "2px" }}
                                    >
                                        {submitting ? (
                                            <>
                                                <LoaderCircle className="animate-spin" size={18} />
                                                Validando...
                                            </>
                                        ) : (
                                            "Ingresar"
                                        )}
                                    </Button>

                                    <Link
                                        to="/"
                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700"
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
