import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Download, FileText, LoaderCircle } from "lucide-react";

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
        <main className="min-h-screen w-full bg-[#E6E9F3] p-0">
            <section className="h-screen w-full overflow-hidden border-0 bg-white shadow-[0_24px_70px_rgba(15,62,106,0.10)]">
                {pdfUrl ? (
                    <iframe
                        src={pdfUrl}
                        title={`Nota ${note?.id}`}
                        className="h-full w-full bg-white"
                    />
                ) : null}
            </section>
        </main>
    );
}
