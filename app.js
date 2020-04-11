const pup = require('puppeteer');
const fs = require('fs-extra');

(async function main () {

    try {

        const browser = await pup.launch({headless: false});
        const page = await browser.newPage();
        page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36");

        await fs.writeFile('data.csv', 'name; price; weight; description\n');

        const sections = [
            'https://www.shop-raze-cat.com/skikanten-schleifen/?view_mode=default&listing_sort=&listing_count=300',
            'https://www.shop-raze-cat.com/ski-wachsen/?view_mode=default&listing_sort=&listing_count=300',
            'https://www.shop-raze-cat.com/ski-buersten/?view_mode=default&listing_sort=&listing_count=300',
            'https://www.shop-raze-cat.com/Skiservice/?view_mode=default&listing_sort=&listing_count=300',
            'https://www.shop-raze-cat.com/zubehoer/?view_mode=default&listing_sort=&filter_id=0&listing_count=300'
        ]

        for (let i = 0; i < sections.length; i++) {

            await page.goto(sections[i]);
            await page.waitForSelector('.productlist');

            const products = await page.$$('.productlist > div');

            console.log(products.length);

            for (const product of products) {

                let price = await product.$eval('.price span', (span) => {
                    return span.innerText.trim();
                });

                let name = await product.$eval('.title a', (a) => {
                    return a.innerText.trim();
                });

                let description = await product.$eval('.description', (span) => {
                    return span.innerText.trim();
                });

                let weight  = await product.$eval('.products-details-weight-container', (span) => {
                    return span.innerText.trim();
                });

                name = name.replace(/ö/g, 'oe');
                name = name.replace(/ä/g, 'ae');
                name = name.replace(/ü/g, 'ue');
                name = name.replace(/–/g, '-');
                name = name.trim();

                description = description.replace(/ö/g, 'oe');
                description = description.replace(/ä/g, 'ae');
                description = description.replace(/ü/g, 'ue');
                description = description.replace(/–/g, '-');
                description = description.replace(/ß/g, 'ss');
                description = description.replace(/\\n/g, '');
                description = description.replace(/\s/g, ' ');
                description = description.trim();

                price = price.replace('EUR', '');
                price = price.replace(',', '.');
                price = price.trim();

                weight = weight.replace('Versandgewicht:', '');
                weight = weight.replace(/ö/g, 'oe');
                weight = weight.replace(/ä/g, 'ae');
                weight = weight.replace(/ü/g, 'ue');
                weight = weight.replace(/–/g, '-');
                weight = weight.trim();

                console.log(name,price,weight,description);

                await fs.appendFile('data.csv', `${name};${price};${weight};${description}\n`);
            }
        }

        console.log('done');
        await browser.close();
    }
    catch (e) {
        console.log(e);
    }
})();