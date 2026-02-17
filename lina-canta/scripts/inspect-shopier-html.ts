
import axios from 'axios';
import * as cheerio from 'cheerio';

async function main() {
    const url = 'https://shopier.com/28395497';
    console.log(`Fetching ${url}...`);

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const html = response.data;
        const $ = cheerio.load(html);

        console.log('\n--- First 20 Images Detailed Properties ---');
        let count = 0;
        $('img').each((i, el) => {
            if (count >= 20) return;
            const src = $(el).attr('src');
            // Skip tracking pixels
            if (!src || src.includes('facebook') || src.includes('google') || src.includes('pixel')) return;

            console.log(`\nImage #${i}`);
            console.log(`Src: ${src}`);
            console.log(`Alt: ${$(el).attr('alt')}`);
            console.log(`ID: ${$(el).attr('id')}`);
            console.log(`Class: ${$(el).attr('class')}`);
            // Explicitly verify data attributes if Cheerio supports it properly, otherwise use attr
            // Cheerio .data() might be empty if attributes are data-xxx
            const dataAttrs: any = {};
            if (el.attribs) {
                Object.keys(el.attribs).forEach(key => {
                    if (key.startsWith('data-')) {
                        dataAttrs[key] = el.attribs[key];
                    }
                });
            }
            console.log(`Data Attributes: ${JSON.stringify(dataAttrs)}`);
            console.log(`Parent Class: ${$(el).parent().attr('class')}`);
            count++;
        });

        console.log('\n--- Form Inputs (Variations?) ---');
        $('input, select').each((i, el) => {
            const name = $(el).attr('name');
            const type = $(el).attr('type');
            const id = $(el).attr('id');
            const val = $(el).val();
            let label = $(el).next('label').text() || $(el).prev('label').text();
            // Try to find label by 'for' attribute
            if (!label && id) {
                label = $(`label[for="${id}"]`).text();
            }

            if (type !== 'hidden') {
                console.log(`Input #${i}: Type=${type}, Name=${name}, ID=${id}, Value=${val}, Label=${label?.trim()}`);
            }
        });

        console.log('\n--- Script Data Scan ---');
        $('script').each((i, el) => {
            const content = $(el).html();
            if (!content) return;

            // Check for large JSON objects often assigned to window
            if (content.includes('var product =') || content.includes('window.product =') || content.includes('__INITIAL_STATE__') || content.includes('variants')) {
                console.log(`\n[FOUND POTENTIAL DATA] Script #${i}`);
                // print first 500 chars to identify
                console.log(content.substring(0, 500));
            }
        });

    } catch (error) {
        console.error('Error fetching page:', error);
    }
}

main();
