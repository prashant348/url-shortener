

export function isValidUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        
        // allow http and https only
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            return false;
        }

        return true;

    } catch {
        return false;
    }
}
