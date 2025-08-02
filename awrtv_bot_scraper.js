const { chromium } = require('playwright');
const fs = require('fs');
const outputFile = 'data/awrtv_content.json';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // تحميل البيانات القديمة
    let allData = [];
    if (fs.existsSync(outputFile)) {
        try {
            allData = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
        } catch {
            allData = [];
        }
    }

    let newData = [];

    // ===== 1️⃣ AsiaTV =====
    console.log('🔹 جارٍ جمع بيانات AsiaTV...');
    await page.goto('https://asia2tv.co/category/korean-series/page/1/', { waitUntil: 'domcontentloaded' });

    // اضغط على زر AdBlocker إذا كان موجود
    const adblockButton = page.locator('button:has-text("لقد قمت بتعطيل AdBlocker")');
    if (await adblockButton.count() > 0) {
        console.log('⚠️ تم رصد زر AdBlocker... الضغط للدخول');
        await adblockButton.click();
        await page.waitForTimeout(3000);
    }

    await page.waitForTimeout(3000);
    const asiatv = await page.$$eval('a.BlockItem', links =>
        links.map(a => ({
            title: a.textContent.trim(),
            poster: a.querySelector('img') ? a.querySelector('img').src : '',
            site: 'AsiaTV',
            episodes: [{
                name: 'مشاهدة',
                stream_url: a.href,
                qualities: {},
                download_url: a.href
            }]
        }))
    );
    console.log(`✅ AsiaTV: ${asiatv.length} عنصر`);
    newData = newData.concat(asiatv);

    // ===== 2️⃣ Anime4Up =====
    console.log('🔹 جارٍ جمع بيانات Anime4Up...');
    await page.goto('https://anime4up.tv/anime/page/1/', { waitUntil: 'domcontentloaded' });

    // انتظر واجهة التحميل المؤقتة 3 ثواني
    await page.waitForTimeout(3000);

    const anime4up = await page.$$eval('.anime-card-title a', links =>
        links.map(a => ({
            title: a.textContent.trim(),
            poster: a.closest('.anime-card')?.querySelector('img')?.src || '',
            site: 'Anime4Up',
            episodes: [{
                name: 'مشاهدة',
                stream_url: a.href,
                qualities: {},
                download_url: a.href
            }]
        }))
    );
    console.log(`✅ Anime4Up: ${anime4up.length} عنصر`);
    newData = newData.concat(anime4up);

    // ===== 3️⃣ EgyBest =====
    console.log('🔹 جارٍ جمع بيانات EgyBest...');
    await page.goto('https://egibest.watch/movies?page=1', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const egybest = await page.$$eval('.movie a', links =>
        links.map(a => ({
            title: a.getAttribute('title') || a.textContent.trim(),
            poster: a.querySelector('img') ? a.querySelector('img').src : '',
            site: 'EgyBest',
            episodes: [{
                name: 'الفيلم كامل',
                stream_url: a.href,
                qualities: {},
                download_url: a.href
            }]
        }))
    );
    console.log(`✅ EgyBest: ${egybest.length} عنصر`);
    newData = newData.concat(egybest);

    // دمج البيانات الجديدة مع القديمة
    allData = newData.concat(allData);

    fs.writeFileSync(outputFile, JSON.stringify(allData, null, 2), 'utf-8');
    console.log(`🎉 تم حفظ ${newData.length} عنصر جديد في ${outputFile}`);

    await browser.close();
})();
