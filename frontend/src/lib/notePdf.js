const categoryLabels = {
    PETICION: "Peticion",
    RECLAMO: "Reclamo",
    PROPUESTA: "Propuesta",
    COMUNICADO: "Comunicado",
};

const statusLabels = {
    ENTREGADO: "Entregado",
    LEIDO: "Leido",
    APROBADA: "Aprobada",
    RECHAZADA: "Rechazada",
};

const formatNoteDate = (value) => {
    if (!value) {
        return "Sin fecha";
    }

    return new Intl.DateTimeFormat("es-AR", {
        dateStyle: "long",
    }).format(new Date(value));
};

const normalizeText = (value) =>
    value
        ?.replace(/\u00a0/g, " ")
        .replace(/\s+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim() ?? "";

function extractTextBlocksFromHtml(html) {
    if (!html) {
        return [];
    }

    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");
    const blocks = [];

    const pushBlock = (value, prefix = "") => {
        const text = normalizeText(`${prefix}${value}`);
        if (text) {
            blocks.push(text);
        }
    };

    const readNodeText = (node) =>
        normalizeText(node?.textContent?.replace(/\s+/g, " ") ?? "");

    const walk = (node) => {
        if (!node) {
            return;
        }

        if (node.nodeType === Node.TEXT_NODE) {
            pushBlock(node.textContent);
            return;
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
            return;
        }

        const tag = node.tagName?.toLowerCase();

        if (["h1", "h2", "h3", "p", "blockquote"].includes(tag)) {
            pushBlock(readNodeText(node));
            return;
        }

        if (tag === "li") {
            pushBlock(readNodeText(node), "- ");
            return;
        }

        if (["ul", "ol"].includes(tag)) {
            Array.from(node.children).forEach(walk);
            return;
        }

        if (tag === "br") {
            pushBlock("");
            return;
        }

        Array.from(node.childNodes).forEach(walk);
    };

    Array.from(document.body.childNodes).forEach(walk);

    return blocks.filter(Boolean);
}

function renderWrappedText(pdf, lines, x, y, maxWidth, lineHeight = 6) {
    let currentY = y;
    const pageHeight = pdf.internal.pageSize.getHeight();
    const bottomMargin = 20;

    lines.forEach((line) => {
        const wrappedLines = pdf.splitTextToSize(line, maxWidth);
        const blockHeight = Math.max(wrappedLines.length, 1) * lineHeight;

        if (currentY + blockHeight > pageHeight - bottomMargin) {
            pdf.addPage();
            currentY = 20;
        }

        pdf.text(wrappedLines, x, currentY);
        currentY += blockHeight;
    });

    return currentY;
}

function ensureVerticalSpace(pdf, currentY, requiredHeight, resetY = 20) {
    const pageHeight = pdf.internal.pageSize.getHeight();
    const bottomMargin = 20;

    if (currentY + requiredHeight <= pageHeight - bottomMargin) {
        return currentY;
    }

    pdf.addPage();
    return resetY;
}

export function getNoteCategoryLabel(category) {
    return categoryLabels[category] ?? category ?? "-";
}

export function getNoteStatusLabel(status) {
    return statusLabels[status] ?? status ?? "-";
}

export async function generateNotePdfBlob(note) {
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let currentY = 18;

    pdf.setFontSize(11);
    pdf.setTextColor(31, 41, 55);
    pdf.text("CENTRO VECINAL", margin, currentY);
    pdf.setFont("helvetica", "bold");
    pdf.text(formatNoteDate(note.createdAt), pageWidth - margin, currentY, { align: "right" });
    pdf.setFont("helvetica", "normal");
    currentY += 7;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.text(`Barrio : ${note.barrioNombre || "-"}`, margin, currentY);
    currentY += 8;

    currentY += 4;



    currentY += 20;
    pdf.setFont("helvetica", "bold");
    pdf.text("ASUNTO:", margin, currentY);
    pdf.setFont("helvetica", "normal");
    const titleLines = pdf.splitTextToSize(note.titulo || "-", contentWidth - 26);
    pdf.text(titleLines, margin + 26, currentY);
    currentY += titleLines.length * 6 + 8;



    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    const contentBlocks = extractTextBlocksFromHtml(note.contenido);
    currentY = renderWrappedText(pdf, contentBlocks.length > 0 ? contentBlocks : ["Sin contenido."], margin, currentY, contentWidth, 6);

    const contactLines = [];

    if (note.mostrarUbicacion && note.centroVecinalUbicacion) {
        contactLines.push(`Ubicacion: ${note.centroVecinalUbicacion}`);
    }

    if (note.mostrarWhatsApp && note.centroVecinalWhatsApp) {
        contactLines.push(`WhatsApp vecinal: ${note.centroVecinalWhatsApp}`);
    }

    if (note.mostrarFacebook && note.centroVecinalFacebook) {
        contactLines.push(`Facebook: ${note.centroVecinalFacebook}`);
    }

    if (contactLines.length > 0) {
        currentY += 8;
        currentY = ensureVerticalSpace(pdf, currentY, 28);
        pdf.setFont("helvetica", "bold");
        pdf.text("CONTACTO DEL CENTRO VECINAL", margin, currentY);
        currentY += 8;
        pdf.setFont("helvetica", "normal");
        currentY = renderWrappedText(pdf, contactLines, margin, currentY, contentWidth, 6);
    }

    if (note.motivoEstado) {
        currentY += 6;
        currentY = ensureVerticalSpace(pdf, currentY, 24);
        pdf.setFont("helvetica", "bold");
        pdf.text("RESPUESTA DEL MUNICIPIO", margin, currentY);
        currentY += 8;
        pdf.setFont("helvetica", "normal");
        currentY = renderWrappedText(pdf, [note.motivoEstado], margin, currentY, contentWidth, 6);
    }

    currentY += 12;
    currentY = ensureVerticalSpace(pdf, currentY, 62);

    pdf.setDrawColor(212, 222, 236);
    pdf.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 10;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text("DATOS", margin, currentY);
    currentY += 8;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    const dataLines = [
        `Autor: ${note.autorNombre || "-"}`,
        `Estado: ${getNoteStatusLabel(note.estado)}`,
        `Apoyos ciudadanos: ${note.cantidadApoyos ?? 0}`,
        `Barrio: ${note.barrioNombre || "-"}`,
    ];
    currentY = renderWrappedText(pdf, dataLines, margin, currentY, contentWidth, 6);

    currentY += 14;
    currentY += 6;
    pdf.setFontSize(10);
    pdf.text(note.autorNombre || "Firma digital", pageWidth - 49, currentY, { align: "center" });
    currentY += 5;
    pdf.text("Representante / Autor de la nota", pageWidth - 49, currentY, { align: "center" });

    return pdf.output("blob");
}
