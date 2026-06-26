/**
 * Görsel URL'lerini ayırt eden yardımcı fonksiyon.
 *
 * Harici URL: http:// veya https:// ile başlar → doğrudan kullan
 * Yerel yükleme: /uploads/ ile başlar → güvenli uzantı kontrolü ile kullan
 * Eski base64: data:image/ ile başlar → doğrudan kullan (sadece image türleri)
 * Boş veya geçersiz → placeholder
 *
 * GÜVENLİK: javascript:, data:text/html, vbscript: gibi zararlı protokoller engellenir
 */

// Güvenli dosya uzantıları (sadece resim formatları)
const SAFE_IMAGE_EXTENSIONS = new Set([
    ".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg"
]);

// Zararlı protokoller
const DANGEROUS_PROTOCOLS = [
    "javascript:",
    "vbscript:",
    "data:text/html",
    "data:application/",
];

export function getImageSrc(url: string | null | undefined): string {
    if (!url) return "/placeholder.jpg";

    // Zararlı protokol kontrolü
    const lowerUrl = url.toLowerCase().trim();
    for (const protocol of DANGEROUS_PROTOCOLS) {
        if (lowerUrl.startsWith(protocol)) {
            return "/placeholder.jpg";
        }
    }

    // Harici URL (http/https)
    if (url.startsWith("https://") || url.startsWith("http://")) {
        return url;
    }

    // Yerel yükleme — güvenli uzantı kontrolü
    if (url.startsWith("/uploads/")) {
        const extension = url.substring(url.lastIndexOf(".")).toLowerCase();
        if (SAFE_IMAGE_EXTENSIONS.has(extension)) {
            return url;
        }
        // Güvenli olmayan uzantı (örn: .js, .php, .html)
        return "/placeholder.jpg";
    }

    // Eski base64 — sadece image/ MIME türlerini kabul et
    if (url.startsWith("data:image/")) {
        return url;
    }

    // data: ile başlayan diğer tüm türleri reddet (data:text/html vb.)
    if (url.startsWith("data:")) {
        return "/placeholder.jpg";
    }

    // Fallback — eğer bilinmeyen bir format ise placeholder döndür
    return "/placeholder.jpg";
}

/**
 * Verilen URL'nin yerel bir yükleme mi olduğunu kontrol eder.
 */
export function isLocalUpload(url: string): boolean {
    return url.startsWith("/uploads/");
}

/**
 * Verilen URL'nin harici bir URL mi olduğunu kontrol eder.
 */
export function isExternalUrl(url: string): boolean {
    return url.startsWith("http://") || url.startsWith("https://");
}

/**
 * Verilen URL'nin güvenli bir base64 image formatında mı olduğunu kontrol eder.
 */
export function isBase64Image(url: string): boolean {
    return url.startsWith("data:image/");
}

