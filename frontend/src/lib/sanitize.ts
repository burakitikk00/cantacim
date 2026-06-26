/**
 * Sunucu tarafı girdi sanitization yardımcı fonksiyonları.
 * XSS (Cross-Site Scripting) koruması için zararlı HTML etiketlerini temizler.
 */

/**
 * Zararlı HTML etiketlerini ve event handler'ları temizler.
 * Veritabanına yazılmadan önce serbest metin alanlarına uygulanır.
 */
export function sanitizeString(input: string): string {
    if (!input) return input;

    return input
        // Script etiketleri ve içeriğini kaldır
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        // Iframe etiketlerini kaldır
        .replace(/<iframe\b[^>]*>.*?<\/iframe>/gi, "")
        .replace(/<iframe\b[^>]*\/?>/gi, "")
        // Object, embed, applet etiketlerini kaldır
        .replace(/<(object|embed|applet)\b[^>]*>.*?<\/\1>/gi, "")
        .replace(/<(object|embed|applet)\b[^>]*\/?>/gi, "")
        // Form etiketlerini kaldır
        .replace(/<form\b[^>]*>.*?<\/form>/gi, "")
        // Event handler attribute'larını kaldır (on*)
        .replace(/\s*on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "")
        // javascript: ve vbscript: protokollerini kaldır
        .replace(/javascript\s*:/gi, "")
        .replace(/vbscript\s*:/gi, "")
        // data:text/html türü zararlı data URI'lerini kaldır
        .replace(/data\s*:\s*text\/html/gi, "")
        // Style etiketlerini kaldır (CSS injection)
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
        // Kalan HTML etiketlerini kaldır (img, a, div, span vb.)
        .replace(/<\/?[^>]+(>|$)/g, "")
        // Kontrol karakterlerini temizle (log injection koruması)
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
        .trim();
}

/**
 * Birden fazla alanı aynı anda sanitize eder.
 * FormData'dan gelen verilere toplu olarak uygulanır.
 */
export function sanitizeFields<T extends Record<string, unknown>>(
    data: T,
    fields: (keyof T)[]
): T {
    const sanitized = { ...data };
    for (const field of fields) {
        if (typeof sanitized[field] === "string") {
            (sanitized[field] as unknown) = sanitizeString(sanitized[field] as string);
        }
    }
    return sanitized;
}
