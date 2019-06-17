const puppeteer = require('puppeteer-core');
const InsertSql = require("./mysql/config")
if (process.argv.length < 3) {
    throw Error("参数错误");
}

const albumId = process.argv[2];

main = async () => {
    const browser = await puppeteer.launch({
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        headless: true,
        slowMo: 200,
        devtools: false,
        defaultViewport: {
            width: 1200,
            height: 900,
        },
    });

    console.log(await browser.userAgent());

    songLook = async (link) => {
        const page = await browser.newPage();
        await page.goto(`https://music.163.com/#${link}`);
        page.on('console', msg => console.log("PAGE LOG:", msg.text()));
        const song = await page.evaluate(() => {
            let song = {
                title: '',
                lrc: '',
                commented: 0,
            };
            console.log(`song: ${location.href}`);
            const em = window.frames['g_iframe'].contentDocument.querySelector("div.g-bd4.f-cb > div.g-mn4 > div > div > div.m-lycifo > div.f-cb > div.cnt > div.hd > div > em");
            if (em) {
                song.title = em.innerText.trim();
                console.log(song.title);
            }
            const lrc = window.frames['g_iframe'].contentDocument.querySelector("#lyric-content");
            if (lrc) {
                let html = lrc.innerHTML;
                song.lrc = html.replace(new RegExp("<br>", "g"), "\n")
                    .replace('<div id="flag_more" class="f-hide">', "")
                    .replace('</div><div class="crl"><a id="flag_ctrl" href="javascript:void(0)" class="s-fc7">展开<i class="u-icn u-icn-69"></i></a></div>', "")
                    .trim();
                console.log(song.lrc);
            }
            const commented = window.frames['g_iframe'].contentDocument.querySelector("#cnt_comment_count");
            if (commented) {
                song.commented = parseInt(commented.innerText.trim());
            }
            return song;
        });
        await page.close();
        return song;
    }

    albumLook = async (id) => {
        const page = await browser.newPage();
        await page.goto(`https://music.163.com/#/album?id=${id}`);

        page.on('console', msg => console.log("PAGE LOG:", msg.text()));

        await page.exposeFunction('songLook', songLook);

        let album = await page.evaluate(async (id) => {
            let album = {
                id: +id,
                title: '',
                author: '',
                rel: '',
                desc: '',
                commented: 0
            };
            console.log(`url is ${location.href}`);
            const title = window.frames['g_iframe'].contentDocument.querySelector("div.g-bd4.f-cb.p-share > div.g-mn4 > div > div > div.m-info.f-cb > div.cnt > div > div.topblk > div > div > h2");
            if (title) {
                album.title = title.innerText.trim();
                console.log(album.title);
            }
            const author = window.frames['g_iframe'].contentDocument.querySelector("div.g-bd4.f-cb.p-share > div.g-mn4 > div > div > div.m-info.f-cb > div.cnt > div > div.topblk > p:nth-child(2) > span > a");
            if (author) {
                album.author = author.innerText.trim();
                console.log(album.author);
            }
            const rel = window.frames['g_iframe'].contentDocument.querySelector("div.g-bd4.f-cb.p-share > div.g-mn4 > div > div > div.m-info.f-cb > div.cnt > div > div.topblk > p:nth-child(3)");
            if (rel) {
                album.rel = rel.innerText.replace("发行时间：", "").trim();
                console.log(album.rel);
            }
            const desc = window.frames['g_iframe'].contentDocument.getElementById('album-desc-more');
            if (desc) {
                album.desc = desc.innerText.trim();
                console.log(album.desc);
            }
            const commented = window.frames['g_iframe'].contentDocument.querySelector("#cnt_comment_count");
            if (commented) {
                album.commented = parseInt(commented.innerText.trim());
            }

            /*const songs = window.frames['g_iframe'].contentDocument.querySelectorAll("table.m-table.m-table-album > tbody > tr");
            if (songs) {
                for (let i=0; i<songs.length; i++) {
                    let e = songs[i];
                    const a = e.querySelector("td:nth-child(2) > div > div > div > span > a");
                    if (!a) return ;
                    const href = a.getAttribute("href");
                    console.log(href);
                    album.songs.push(href);
                    // await songLook(href);
                }
            }*/
            return album;
        }, id);
        // await page.screenshot({path: 's.png'});
        await page.close();
        return album;
    };

    // 专辑
    let album = await albumLook(albumId);
    InsertSql.InsertSql(album)
    // 专辑下的歌曲
    /*for (let i=0; i<album.songs.length; i++) {
        const song = await songLook(album.songs[i]);
        console.log(song);
    }*/

    // await pg.end();
    await browser.close();
}

main();