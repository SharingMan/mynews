export const countryCoords: Record<string, { lat: number; lon: number }> = {
    'China': { lat: 35.8617, lon: 104.1954 },
    'US': { lat: 37.0902, lon: -95.7129 },
    'UK': { lat: 55.3781, lon: -3.4360 },
    'Japan': { lat: 36.2048, lon: 138.2529 },
    'Germany': { lat: 51.1657, lon: 10.4515 },
    'France': { lat: 46.2276, lon: 2.2137 },
    'India': { lat: 20.5937, lon: 78.9629 },
    'Brazil': { lat: -14.2350, lon: -51.9253 },
    'Australia': { lat: -25.2744, lon: 133.7751 },
    'Russia': { lat: 61.5240, lon: 105.3188 },
    'South Korea': { lat: 35.9078, lon: 127.7669 },
    'Singapore': { lat: 1.3521, lon: 103.8198 },
    'Canada': { lat: 56.1304, lon: -106.3468 },
    'Italy': { lat: 41.8719, lon: 12.5674 },
    'Spain': { lat: 40.4637, lon: -3.7492 },
    'Netherlands': { lat: 52.1326, lon: 5.2913 },
    'Switzerland': { lat: 46.8182, lon: 8.2275 },
    'Sweden': { lat: 60.1282, lon: 18.6435 },
};

// 简单的 Source -> Country 映射 helper
export function getCountryFromSource(source: string): string | null {
    const s = source.toLowerCase();
    if (s.includes('bbc') || s.includes('reuters') || s.includes('guardian')) return 'UK';
    if (s.includes('cnn') || s.includes('new york times') || s.includes('bloomberg') || s.includes('techcrunch') || s.includes('verge')) return 'US';
    if (s.includes('nhk') || s.includes('asahi') || s.includes('nikkei')) return 'Japan';
    if (s.includes('xinhua') || s.includes('scmp') || s.includes('china')) return 'China';
    if (s.includes('spiegel') || s.includes('dw')) return 'Germany';
    if (s.includes('lemonde') || s.includes('france')) return 'France';
    if (s.includes('times of india')) return 'India';
    // Default fallback for demo
    return 'US';
}
