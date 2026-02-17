
import axios from 'axios';

async function main() {
    const url = 'https://shopier.com/39825417';
    console.log(`Fetching ${url}...`);

    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0...' }
        });
        const html = response.data;

        // Find the JSON block starting with "variation_details"
        // It looks like it's part of a larger object, maybe passed to a JS function or variable.
        // Let's look for the string "variation_details" and grab a large chunk

        const key = '"variation_details":';
        const startIdx = html.indexOf(key);

        if (startIdx !== -1) {
            // grab enough context to see the structure
            const context = html.substring(startIdx - 50, startIdx + 5000);

            // Try to regex parse
            // Pattern: "variation_details":[{...}],"variations":{"...}"

            // print first bit to confirm
            console.log('--- JSON Context ---');
            console.log(context.substring(0, 1000));

            // Search for "variations" within this block
        } else {
            console.log('variation_details key not found');
        }

    } catch (e) { console.error(e); }
}

main();
