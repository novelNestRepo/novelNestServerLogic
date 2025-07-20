const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrap() {
    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/google-chrome',
        headless: false,
        defaultViewport: false,
        userDataDir: "./temp"
    });

    const page = await browser.newPage();
    const detailPage = await browser.newPage();

    let currentPage = 1;
    let lastPage = 1;
    const writeStream = fs.createWriteStream('Books.json');
    writeStream.write('[\n');
    let isFirstBook = true;
    let totalBooks = 0;

  
    await page.goto(`https://www.aseeralkotb.com/ar/books?page=1`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('a[title][href^="https://www.aseeralkotb.com/ar/books/"]');
    lastPage = await page.evaluate(() => {
        const pageSpans = Array.from(document.querySelectorAll('span[wire\\:key^="paginator-page-"]'));
        let maxPage = 1;
        pageSpans.forEach(span => {
            const btn = span.querySelector('button, span');
            if (btn) {
                const num = parseInt(btn.textContent.trim());
                if (!isNaN(num) && num > maxPage) maxPage = num;
            }
        });
        return maxPage;
    });
    console.log('Total pages:', lastPage);

    while (currentPage <= lastPage) {
        if (currentPage !== 1) {
            await page.goto(`https://www.aseeralkotb.com/ar/books?page=${currentPage}`, { waitUntil: 'domcontentloaded' });
            await page.waitForSelector('a[title][href^="https://www.aseeralkotb.com/ar/books/"]');
        }
        const books = await page.evaluate(() => {
            let items = [];
            document.querySelectorAll('a[title][href^="https://www.aseeralkotb.com/ar/books/"]').forEach(link => {
                const title = link.getAttribute('title') || 'No title found';
                let imageUrl = link.querySelector('img')?.src
                    || link.querySelector('source')?.srcset
                    || link.parentElement.querySelector('meta[itemprop="image"]')?.content
                    || 'URL NOT FOUND';
                let author = 'Not found';
                const authorLink = link.parentElement?.parentElement?.querySelector('a[href^="https://www.aseeralkotb.com/ar/authors/"]');
                if (authorLink) author = authorLink.title || authorLink.innerText;
                const bookUrl = link.href;
                items.push({ title, imageUrl, author, bookUrl });
            });
            return items;
        });
        const uniqueBooks = [];
        const seenUrls = new Set();
        for (const book of books) {
            if (!seenUrls.has(book.bookUrl)) {
                uniqueBooks.push(book);
                seenUrls.add(book.bookUrl);
            }
        }
        totalBooks += uniqueBooks.length;
        console.log('Total books scraped:', totalBooks);

        for (const book of uniqueBooks) {
            try {
                await detailPage.goto(book.bookUrl, { waitUntil: 'domcontentloaded' });
                await detailPage.waitForSelector('.ProseMirror, .description, meta[name="description"]', {timeout: 5000}).catch(() => {});
                let description = await detailPage.evaluate(() => {
                    let desc = document.querySelector('.ProseMirror')?.innerText ||
                               document.querySelector('.description')?.innerText ||
                               document.querySelector('meta[name="description"]')?.content ||
                               'No description found';
                    return desc;
                });
                book.description = description;
            } catch (err) {
                book.description = 'Failed to load description';
            }
            if (!isFirstBook) writeStream.write(',\n');
            writeStream.write(JSON.stringify(book, null, 2));
            isFirstBook = false;
        }
        currentPage++;
    }

    writeStream.write('\n]');
    writeStream.end();
    console.log('Scraping completed. Data saved to Books.json');
    console.log('Total books scraped:', totalBooks);
    await browser.close();
}

scrap();
