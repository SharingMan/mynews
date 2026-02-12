export const countryCoords: Record<string, { lat: number; lon: number }> = {
    'China': { lat: 35.8617, lon: 104.1954 },
    'Beijing': { lat: 39.9042, lon: 116.4074 },
    'Shanghai': { lat: 31.2304, lon: 121.4737 },
    'Shenzhen': { lat: 22.5431, lon: 114.0579 },
    'Hangzhou': { lat: 30.2741, lon: 120.1551 },
    'US': { lat: 37.0902, lon: -95.7129 },
    'San Francisco': { lat: 37.7749, lon: -122.4194 },
    'New York': { lat: 40.7128, lon: -74.0060 },
    'UK': { lat: 55.3781, lon: -3.4360 },
    'London': { lat: 51.5074, lon: -0.1278 },
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

// 简单的 Source -> Country/City 映射 helper
export function getCountryFromSource(source: string): string | null {
    const s = source.toLowerCase();

    // UK
    if (s.includes('bbc') || s.includes('reuters') || s.includes('guardian') || s.includes('financial times') || s.includes('sky')) return 'London';

    // US - East Coast
    if (s.includes('nytimes') || s.includes('new york') || s.includes('wsj') || s.includes('bloomberg') || s.includes('cnbc') || s.includes('marketwatch')) return 'New York';

    // US - West Coast (Tech)
    if (s.includes('techcrunch') || s.includes('verge') || s.includes('wired') || s.includes('elon') || s.includes('trump') || s.includes('twitter') || s.includes('product hunt') || s.includes('y combinator') || s.includes('apple') || s.includes('google')) return 'San Francisco';

    // US - General
    if (s.includes('cnn') || s.includes('usa') || s.includes('hollywood') || s.includes('variety') || s.includes('espn')) return 'US';

    // Japan
    if (s.includes('nhk') || s.includes('asahi') || s.includes('nikkei')) return 'Japan';

    // China - Media Hubs
    // Beijing: 政治、大型互联网站
    if (s.includes('xinhua') || s.includes('china') || s.includes('36氪') || s.includes('虎嗅') || s.includes('晚点') || s.includes('latepost') || s.includes('机器之心') || s.includes('量子位') || s.includes('微博') || s.includes('头条') || s.includes('知乎') || s.includes('beijing')) return 'Beijing';

    // Shanghai: 金融、商业
    if (s.includes('scmp') || s.includes('界面') || s.includes('澎湃') || s.includes('金十') || s.includes('每日经济') || s.includes('shanghai') || s.includes('wallstreet')) return 'Shanghai';

    // Shenzhen/South: 硬件、新消费
    if (s.includes('少数派') || s.includes('爱范儿') || s.includes('ifanr') || s.includes('sspai') || s.includes('qq') || s.includes('tencent') || s.includes('shenzhen')) return 'Shenzhen';

    // Hangzhou
    if (s.includes('alibaba') || s.includes('taobao') || s.includes('hangzhou')) return 'Hangzhou';

    // Others
    if (s.includes('阮一峰') || s.includes('rsshub')) return 'Shanghai'; // 假设

    // Singapore
    if (s.includes('zaobao') || s.includes('singapore')) return 'Singapore';

    // Other Countries
    if (s.includes('spiegel') || s.includes('dw')) return 'Germany';
    if (s.includes('lemonde') || s.includes('france')) return 'France';

    // Default fallback
    return 'US';
}
