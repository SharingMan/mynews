
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../lib/news-sources.ts');
const newDomain = process.argv[2];

if (!newDomain || !newDomain.startsWith('http')) {
    console.error('❌ Usage: node scripts/update-rsshub-domain.js https://your-rsshub-domain.com');
    process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');

// Replace standard RSSHub URL, keeping path
// Example: https://rsshub.app/xxx -> https://your-domain.com/xxx
const updatedContent = content.replace(/https:\/\/rsshub\.app/g, newDomain);

if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent);
    console.log(`✅ Refreshed news-sources.ts with domain: ${newDomain}`);
    console.log('   Run "npm run build" to deploy changes (if running locally).');
} else {
    console.log('⚠️ No RSSHub URLs found to update or domain is identical.');
}
