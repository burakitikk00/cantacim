
import axios from 'axios';
import * as cheerio from 'cheerio';

async function main() {
    const url = 'https://shopier.com/39825417';
    console.log(`Fetching ${url}...`);

    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0...' }
        });

        const html = response.data;

        // Variant IDs found previously
        const variantIds = ['1863980', '1863981', '1863988', '1863994', '1927078', '2111558'];

        console.log('--- Searching for Variant IDs in HTML ---');
        variantIds.forEach(id => {
            const idx = html.indexOf(id);
            if (idx !== -1) {
                console.log(`Found ID ${id} at index ${idx}`);
                // Print context
                const start = Math.max(0, idx - 100);
                const end = Math.min(html.length, idx + 200);
                console.log(`Context: ...${html.substring(start, end).replace(/\n/g, ' ')}...`);
            } else {
                console.log(`ID ${id} NOT FOUND`);
            }
        });

    } catch (error) {
        console.error(error);
    }
}

main();
