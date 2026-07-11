import React from "react";
import {
    Camera,
    Image as ImageIcon,
    Link2,
    LoaderCircle,
    MapPinned,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export const initialObservationForm = {
    titulo: "",
    descripcion: "",
    ubicacionEnlace: "",
    imagenes: [],
};

const observationStateConfig = {
    ENTREGADO: {
        label: "Entregado",
        className: "border-amber-200 bg-amber-50 text-amber-700",
    },
    LEIDO: {
        label: "Leído",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
};

export const formatDateTime = (value) => {
    if (!value) {
        return "Sin fecha";
    }

    return new Intl.DateTimeFormat("es-AR", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
};

export const getObservationStatusConfig = (status) =>
    observationStateConfig[status] ?? {
        label: status ?? "Sin estado",
        className: "border-slate-200 bg-slate-100 text-slate-700",
    };

export const toUploadUrl = (path) => {
    if (!path) {
        return "";
    }

    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }

    return `http://localhost:8080${path}`;
};

export function ObservationCard({
    observation,
    onOpenDetail,
    detailLoadingId,
    ctaLabel,
    highlightedObservationId,
}) {
    const status = getObservationStatusConfig(observation.estado);

    return (
        <article
            id={`observacion-${observation.id}`}
            className={`rounded-3xl border p-5 transition ${
                highlightedObservationId === observation.id
                    ? "border-amber-300 bg-amber-50/80 shadow-[0_18px_40px_rgba(217,119,6,0.12)]"
                    : "border-slate-200 bg-slate-50/80"
            }`}
        >
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-slate-900">{observation.titulo}</h2>
                        <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${status.className}`}
                        >
                            {status.label}
                        </span>
                    </div>
                    <p className="text-sm text-slate-500">
                        {observation.centroVecinalNombre ? `${observation.centroVecinalNombre} · ` : ""}
                        Barrio {observation.barrioNombre}
                    </p>
                </div>

                <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                    {formatDateTime(observation.createdAt)}
                </span>
            </div>

            <p className="mt-4 line-clamp-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                {observation.descripcion}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 ring-1 ring-slate-200">
                    <ImageIcon size={15} className="text-slate-400" />
                    {(observation.imagenes?.length ?? 0)} fotos
                </span>
                {observation.ubicacionEnlace ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 ring-1 ring-slate-200">
                        <MapPinned size={15} className="text-slate-400" />
                        Con ubicación
                    </span>
                ) : null}
            </div>

            <div className="mt-5 flex justify-end">
                <Button
                    type="button"
                    onClick={() => onOpenDetail(observation.id)}
                    disabled={detailLoadingId === observation.id}
                    className="rounded-full bg-[linear-gradient(135deg,#2177d5,#2db6d5)] text-white hover:opacity-95"
                >
                    {detailLoadingId === observation.id ? (
                        <>
                            <LoaderCircle className="animate-spin" size={16} />
                            Abriendo...
                        </>
                    ) : (
                        ctaLabel
                    )}
                </Button>
            </div>
        </article>
    );
}

export function ObservationDetail({ observation }) {
    if (!observation) {
        return (
            <div className="rounded-2xl bg-slate-50 px-4 py-8 text-sm text-slate-500 ring-1 ring-slate-200">
                Seleccioná una observación para ver el detalle completo.
            </div>
        );
    }

    const status = getObservationStatusConfig(observation.estado);

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
                <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${status.className}`}
                >
                    {status.label}
                </span>
                <span className="text-xs uppercase tracking-[0.14em] text-slate-400">
                    {formatDateTime(observation.createdAt)}
                </span>
            </div>

            <div>
                <h2 className="text-2xl font-semibold text-slate-900">{observation.titulo}</h2>
                <p className="mt-2 text-sm text-slate-500">
                    {observation.ciudadanoNombre ? `${observation.ciudadanoNombre} · ` : ""}
                    {observation.centroVecinalNombre ? `${observation.centroVecinalNombre} · ` : ""}
                    Barrio {observation.barrioNombre}
                </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {observation.descripcion}
                </p>
            </div>

            {observation.ubicacionEnlace ? (
                <a
                    href={observation.ubicacionEnlace}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 ring-1 ring-sky-100 transition hover:bg-sky-100"
                >
                    <Link2 size={16} />
                    Abrir ubicación enviada
                </a>
            ) : null}

            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Camera size={18} className="text-slate-500" />
                    <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Fotos adjuntas
                    </h3>
                </div>

                {observation.imagenes?.length ? (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {observation.imagenes.map((imagePath, index) => (
                            <a
                                key={`${imagePath}-${index}`}
                                href={toUploadUrl(imagePath)}
                                target="_blank"
                                rel="noreferrer"
                                className="overflow-hidden rounded-2xl ring-1 ring-slate-200 transition hover:ring-sky-300"
                            >
                                <img
                                    src={toUploadUrl(imagePath)}
                                    alt={`Observación ${observation.titulo} - imagen ${index + 1}`}
                                    className="h-40 w-full object-cover"
                                />
                            </a>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500 ring-1 ring-slate-200">
                        Esta observación no tiene fotos adjuntas.
                    </div>
                )}
            </div>
        </div>
    );
}
