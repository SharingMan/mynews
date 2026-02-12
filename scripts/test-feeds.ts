
import Parser from 'rss-parser';

const parser = new Parser();

const urls = [
    'https://nitter.poast.org/elonmusk/rss',
    'https://nitter.privacydev.net/elonmusk/rss',
    'https://nitter.lucabased.xyz/elonmusk/rss',
    // Fallback to original
    'https://diygodrsshubchromium-bundled-production-997a.up.railway.app/twitter/user/elonmusk',
];

(async () => {
    console.log('🔍 Verifying new RSS feeds connectivity...\n');

    for (const url of urls) {
        try {
            // Set a short timeout to fail fast
            const feed = await parser.parseURL(url);
            console.log(`✅ [OK] ${url}`);
            console.log(`   └─ Title: ${feed.title?.trim()}`);
            console.log(`   └─ Latest: ${feed.items[0]?.title?.trim() || 'No items'}\n`);
        } catch (e: any) {
            console.log(`❌ [FAIL] ${url}`);
            console.log(`   └─ Error: ${e.message}\n`);
        }
    }
})();
