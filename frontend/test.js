const axios = require('axios');
const cheerio = require('cheerio');
axios.get('https://shopier.com/36804689', { headers: { 'User-Agent': 'Mozilla/5.0' } })
  .then(r => {
    const $ = cheerio.load(r.data);
    const images = $('img[src*="pictures"]').map((i, el) => $(el).attr('src')).get();
    console.log('DOM Images:', images);

    const jsonKey = '"variation_details":';
    const jsonIdx = r.data.indexOf(jsonKey);
    if (jsonIdx !== -1) {
      const start = r.data.indexOf('[', jsonIdx);
      let depth = 0; let end = -1;
      for (let i = start; i < r.data.length; i++) {
        if (r.data[i] === '[') depth++;
        if (r.data[i] === ']') depth--;
        if (depth === 0) { end = i + 1; break; }
      }
      if (end !== -1) {
        console.log('Variations JSON:', r.data.substring(start, end));
      }
    }
  });
