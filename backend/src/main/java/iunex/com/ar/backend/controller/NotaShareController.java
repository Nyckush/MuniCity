package iunex.com.ar.backend.controller;

import iunex.com.ar.backend.dto.NotaDTO;
import iunex.com.ar.backend.service.NotaService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.HtmlUtils;

@RestController
public class NotaShareController {

    private final NotaService notaService;
    private final String frontendPublicUrl;
    private final String backendPublicUrl;
    private final String shareDefaultImageUrl;

    public NotaShareController(
            NotaService notaService,
            @Value("${app.frontend.public-url:http://localhost:5173}") String frontendPublicUrl,
            @Value("${app.backend.public-url:http://localhost:8080}") String backendPublicUrl,
            @Value("${app.share.default-image-url:}") String shareDefaultImageUrl
    ) {
        this.notaService = notaService;
        this.frontendPublicUrl = normalizeBaseUrl(frontendPublicUrl);
        this.backendPublicUrl = normalizeBaseUrl(backendPublicUrl);
        this.shareDefaultImageUrl = shareDefaultImageUrl == null ? "" : shareDefaultImageUrl.trim();
    }

    @GetMapping("/notas/compartir/{notaId}")
    public ResponseEntity<String> compartirNota(@PathVariable Long notaId) {
        try {
            NotaDTO nota = notaService.obtenerNotaPublica(notaId);
            String frontendNoteUrl = frontendPublicUrl + "/notas?nota=" + nota.getId();
            String shareImageUrl = resolveShareImageUrl();
            String html = buildShareHtml(nota, frontendNoteUrl, shareImageUrl);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, max-age=0, must-revalidate")
                    .contentType(MediaType.TEXT_HTML)
                    .body(html);
        } catch (RuntimeException exception) {
            return ResponseEntity.status(404)
                    .contentType(MediaType.TEXT_HTML)
                    .body(buildNotFoundHtml(exception.getMessage()));
        }
    }

    private String buildShareHtml(NotaDTO nota, String frontendNoteUrl, String shareImageUrl) {
        String title = HtmlUtils.htmlEscape(nota.getTitulo() + " | " + nota.getCentroVecinalNombre());
        String description = HtmlUtils.htmlEscape(buildShareDescription(nota));
        String escapedRedirectUrl = HtmlUtils.htmlEscape(frontendNoteUrl);
        String escapedImageUrl = HtmlUtils.htmlEscape(shareImageUrl);

        return """
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>%s</title>
                    <meta name="description" content="%s">
                    <meta property="og:type" content="article">
                    <meta property="og:title" content="%s">
                    <meta property="og:description" content="%s">
                    <meta property="og:image" content="%s">
                    <meta property="og:url" content="%s/notas/compartir/%s">
                    <meta property="og:site_name" content="Municity">
                    <meta name="twitter:card" content="summary_large_image">
                    <meta name="twitter:title" content="%s">
                    <meta name="twitter:description" content="%s">
                    <meta name="twitter:image" content="%s">
                    <meta http-equiv="refresh" content="0;url=%s">
                    <script>
                        window.location.replace(%s);
                    </script>
                    <style>
                        body {
                            margin: 0;
                            min-height: 100vh;
                            display: grid;
                            place-items: center;
                            background: linear-gradient(135deg, #eff6ff, #f8fafc);
                            font-family: Arial, sans-serif;
                            color: #0f172a;
                        }
                        .card {
                            width: min(92vw, 560px);
                            background: #ffffff;
                            border-radius: 24px;
                            padding: 32px;
                            box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
                            text-align: center;
                        }
                        .badge {
                            display: inline-block;
                            margin-bottom: 16px;
                            padding: 8px 12px;
                            border-radius: 999px;
                            background: #e0f2fe;
                            color: #0369a1;
                            font-size: 12px;
                            font-weight: 700;
                            letter-spacing: 0.08em;
                            text-transform: uppercase;
                        }
                        h1 {
                            margin: 0;
                            font-size: 28px;
                            line-height: 1.2;
                        }
                        p {
                            margin: 16px 0 0;
                            font-size: 16px;
                            line-height: 1.6;
                            color: #475569;
                        }
                        a {
                            display: inline-block;
                            margin-top: 24px;
                            padding: 14px 22px;
                            border-radius: 14px;
                            background: #0284c7;
                            color: #ffffff;
                            text-decoration: none;
                            font-weight: 700;
                        }
                    </style>
                </head>
                <body>
                    <main class="card">
                        <span class="badge">Nota vecinal</span>
                        <h1>%s</h1>
                        <p>%s</p>
                        <a href="%s">Abrir nota</a>
                    </main>
                </body>
                </html>
                """.formatted(
                title,
                description,
                title,
                description,
                escapedImageUrl,
                backendPublicUrl,
                nota.getId(),
                title,
                description,
                escapedImageUrl,
                escapedRedirectUrl,
                toJavaScriptString(frontendNoteUrl),
                title,
                description,
                escapedRedirectUrl
        );
    }

    private String buildNotFoundHtml(String message) {
        String safeMessage = HtmlUtils.htmlEscape(message == null || message.isBlank()
                ? "La nota no está disponible."
                : message);

        return """
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Nota no disponible</title>
                </head>
                <body style="font-family: Arial, sans-serif; background:#f8fafc; color:#0f172a; display:grid; place-items:center; min-height:100vh; margin:0;">
                    <main style="width:min(92vw,520px); background:#fff; border-radius:24px; padding:32px; box-shadow:0 24px 60px rgba(15,23,42,0.12); text-align:center;">
                        <h1 style="margin:0; font-size:28px;">Nota no disponible</h1>
                        <p style="margin:16px 0 0; color:#475569; line-height:1.6;">%s</p>
                    </main>
                </body>
                </html>
                """.formatted(safeMessage);
    }

    private String buildShareDescription(NotaDTO nota) {
        String contenidoPlano = nota.getContenido() == null
                ? ""
                : nota.getContenido().replaceAll("<[^>]+>", " ").replaceAll("\\s+", " ").trim();

        StringBuilder description = new StringBuilder();
        description.append("Nueva nota publicada por ")
                .append(nota.getCentroVecinalNombre())
                .append(" en ")
                .append(nota.getBarrioNombre())
                .append(".");

        if (!contenidoPlano.isBlank()) {
            description.append(" ").append(truncate(contenidoPlano, 180));
        }

        return description.toString();
    }

    private String resolveShareImageUrl() {
        if (!shareDefaultImageUrl.isBlank()) {
            return shareDefaultImageUrl;
        }

        return frontendPublicUrl + "/LogoMunicity.png";
    }

    private String truncate(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }

        return value.substring(0, Math.max(0, maxLength - 3)).trim() + "...";
    }

    private String normalizeBaseUrl(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }

        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }

    private String toJavaScriptString(String value) {
        return "\"" + value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"") + "\"";
    }
}
