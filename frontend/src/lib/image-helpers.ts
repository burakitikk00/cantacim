/**
 * Görsel URL'lerini ayırt eden yardımcı fonksiyon.
 *
 * Harici URL: http:// veya https:// ile başlar → doğrudan kullan
 * Yerel yükleme: /uploads/ ile başlar → doğrudan kullan
 * Eski base64: data: ile başlar → doğrudan kullan (geriye uyumluluk)
 * Boş veya geçersiz → placeholder
 */
export function getImageSrc(url: string | null | undefined): string {
    if (!url) return "/placeholder.jpg";
    if (
        url.startsWith("http://") ||
        url.startsWith("https://") ||
        url.startsWith("/uploads/") ||
        url.startsWith("data:")
    ) {
        return url;
    }
    // Fallback — eğer bilinmeyen bir format ise olduğu gibi döndür
    return url;
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
 * Verilen URL'nin eski base64 formatında mı olduğunu kontrol eder.
 */
export function isBase64Image(url: string): boolean {
    return url.startsWith("data:");
}
