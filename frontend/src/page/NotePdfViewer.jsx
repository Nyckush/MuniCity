import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Download, ExternalLink, FileText, LoaderCircle } from "lucide-react";

import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { clearStoredAuth, getValidStoredAuth } from "@/lib/auth";
import { generateNotePdfBlob, getNoteCategoryLabel } from "@/lib/notePdf";

export default function NotePdfViewer() {
    const navigate = useNavigate();
    const { noteId } = useParams();
    const [note, setNote] = useState(null);
    const [pdfUrl, setPdfUrl] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const storedAuth = getValidStoredAuth();

        if (!storedAuth || !["ROLE_CIUDADANO", "ROLE_PRESIDENTE", "ROLE_MUNICIPIO"].includes(storedAuth.role)) {
            navigate("/login", { replace: true });
            return;
        }

        let nextPdfUrl = "";

        const loadNoteDocument = async () => {
            try {
                const response = await api.get(`/notas/${noteId}`);
                const noteData = response.data;
                const pdfBlob = await generateNotePdfBlob(noteData);
                nextPdfUrl = URL.createObjectURL(pdfBlob);

                setNote(noteData);
                setPdfUrl(nextPdfUrl);
                document.title = `${noteData.titulo} - Nota PDF`;
            } catch (loadError) {
                if (loadError?.response?.status === 401) {
                    clearStoredAuth();
                    navigate("/login", { replace: true });
                    return;
                }

                setError(
                    typeof loadError?.response?.data === "string"
                        ? loadError.response.data
                        : "No se pudo generar el documento de la nota."
                );
            } finally {
                setLoading(false);
            }
        };

        loadNoteDocument();

        return () => {
            if (nextPdfUrl) {
                URL.revokeObjectURL(nextPdfUrl);
            }
        };
    }, [navigate, noteId]);

    const handleDownload = () => {
        if (!pdfUrl || !note) {
            return;
        }

        const anchor = document.createElement("a");
        const fileName = `${note.titulo || "nota"}`
            .toLowerCase()
            .replace(/[^a-z0-9]+/gi, "-")
            .replace(/^-+|-+$/g, "");

        anchor.href = pdfUrl;
        anchor.download = `${fileName || "nota"}-${note.id}.pdf`;
        anchor.click();
    };

    const handleOpenPdf = () => {
        if (!pdfUrl) {
            return;
        }

        window.open(pdfUrl, "_blank", "noopener,noreferrer");
    };

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#E6E9F3] px-6">
                <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-6 py-5 text-sm text-slate-600 shadow-[0_24px_70px_rgba(15,62,106,0.10)]">
                    <LoaderCircle className="animate-spin" size={20} />
                    Generando la nota en PDF...
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#E6E9F3] px-6">
                <div className="max-w-xl rounded-3xl border border-rose-200 bg-white px-6 py-6 shadow-[0_24px_70px_rgba(15,62,106,0.10)]">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-500">Documento no disponible</p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{error}</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen w-full bg-[#E6E9F3] px-0 py-0 sm:px-4 sm:py-4">
            <section className="min-h-screen w-full border-0 bg-white shadow-[0_24px_70px_rgba(15,62,106,0.10)]">
                <header className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-600">
                            Nota en PDF
                        </p>
                        <h1 className="mt-1 flex items-center gap-2 text-base font-semibold text-slate-800 sm:text-lg">
                            <FileText size={18} />
                            <span className="truncate">{note?.titulo || `Nota ${note?.id ?? ""}`}</span>
                        </h1>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleOpenPdf}
                            className="h-11 rounded-xl border-slate-200 px-4"
                        >
                            <ExternalLink size={16} />
                            Abrir PDF
                        </Button>
                        <Button
                            type="button"
                            onClick={handleDownload}
                            className="h-11 rounded-xl bg-[linear-gradient(135deg,#2177d5,#2db6d5)] px-4 text-white hover:opacity-95"
                        >
                            <Download size={16} />
                            Descargar PDF
                        </Button>
                    </div>
                </header>

                <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600 sm:px-6">
                    Si en tu celular no se visualiza dentro de la página, usá "Abrir PDF" o "Descargar PDF".
                </div>

                <div className="h-[calc(100dvh-10.5rem)] min-h-[560px] w-full bg-slate-100">
                    {pdfUrl ? (
                        <object
                            data={pdfUrl}
                            type="application/pdf"
                            className="h-full w-full bg-white"
                            aria-label={`Nota ${note?.id}`}
                        >
                            <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
                                <FileText className="text-slate-400" size={38} />
                                <div className="max-w-md">
                                    <p className="text-base font-semibold text-slate-700">
                                        No se pudo mostrar el PDF dentro del navegador.
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        En algunos celulares el visor interno no es compatible.
                                    </p>
                                </div>
                                <div className="flex w-full max-w-sm flex-col gap-3 sm:flex-row">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleOpenPdf}
                                        className="h-11 flex-1 rounded-xl border-slate-200 px-4"
                                    >
                                        <ExternalLink size={16} />
                                        Abrir PDF
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleDownload}
                                        className="h-11 flex-1 rounded-xl bg-[linear-gradient(135deg,#2177d5,#2db6d5)] px-4 text-white hover:opacity-95"
                                    >
                                        <Download size={16} />
                                        Descargar PDF
                                    </Button>
                                </div>
                            </div>
                        </object>
                    ) : null}
                </div>
            </section>
        </main>
    );
}
