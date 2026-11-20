// Dựng website từ các file trong thư mục posts/ và pages/.
// Chạy tự động trên GitHub mỗi khi bạn lưu thay đổi. Không cần chạy tay.
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const { marked } = require("marked");

const ROOT = __dirname;
const OUT = path.join(ROOT, "dist");
// Gắn mã phiên bản vào CSS/JS để trình duyệt luôn tải bản mới sau mỗi lần cập nhật
const crypto = require("crypto");
const ver = (f) => crypto.createHash("md5").update(fs.readFileSync(path.join(ROOT, "assets", f))).digest("hex").slice(0, 8);
const CSS_V = ver("style.css");
const JS_V = ver("site.js");
const site = JSON.parse(fs.readFileSync(path.join(ROOT, "site.json"), "utf8"));
const glossary = JSON.parse(fs.readFileSync(path.join(ROOT, "data/thuat-ngu.json"), "utf8"));

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

fs.rmSync(OUT, { recursive: true, force: true });

function write(rel, content) {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

const fmtDate = (d) => {
  const x = new Date(d);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(x.getUTCDate())}/${p(x.getUTCMonth() + 1)}/${x.getUTCFullYear()}`;
};

// ---------- Đọc dữ liệu ----------
const catByName = new Map(site.categories.map((c) => [c.name, c]));

const posts = fs
  .readdirSync(path.join(ROOT, "posts"))
  .filter((f) => f.endsWith(".md"))
  .map((f) => {
    const slug = f.replace(/\.md$/, "");
    const { data, content } = matter(fs.readFileSync(path.join(ROOT, "posts", f), "utf8"));
    if (data.draft) return null;
    if (!data.title) throw new Error(`posts/${f}: thiếu "title"`);
    if (!data.date) throw new Error(`posts/${f}: thiếu "date" (dạng 2026-11-20)`);
    const cat = catByName.get(data.category);
    if (!cat) {
      throw new Error(
        `posts/${f}: chuyên mục "${data.category}" không có trong site.json. ` +
          `Các chuyên mục hợp lệ: ${site.categories.map((c) => c.name).join(" | ")}`
      );
    }
    const words = content.split(/\s+/).filter(Boolean).length;
    return {
      ...data,
      slug,
      cat,
      tags: data.tags || [],
      summary: data.summary || "",
      minutes: Math.max(1, Math.ceil(words / 200)),
      html: marked.parse(content),
      text: content.replace(/[#>*_`\[\]()]/g, " "),
      url: `/bai-viet/${slug}/`,
    };
  })
  .filter(Boolean)
  .sort((a, b) => new Date(b.date) - new Date(a.date));

// ---------- Khung trang ----------
const nav = [
  ["/", "Trang chủ"],
  ["/bai-viet/", "Bài viết"],
  ["/chuyen-muc/", "Chuyên mục"],
  ["/thuat-ngu/", "Thuật ngữ"],
  ["/gioi-thieu/", "Giới thiệu"],
];

function searchBox(id) {
  return `<label class="search-box">
          <input id="${id}" class="js-search" type="search" placeholder="Tìm kiếm..." aria-label="Tìm kiếm" autocomplete="off">
          <span aria-hidden="true">⌕</span>
          <div class="search-results" hidden></div>
        </label>`;
}

function verseBlock() {
  return `<figure class="verse"><blockquote>${esc(site.quote)}</blockquote>${site.quoteRef ? `<figcaption>${esc(site.quoteRef)}</figcaption>` : ""}</figure>`;
}

function layout({ title, desc, body, url = "/", ogImage }) {
  const fullTitle = title === site.name ? title : `${title} · ${site.short}`;
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${esc(desc || site.description)}">
  <meta name="theme-color" content="#263a35">
  <meta property="og:title" content="${esc(fullTitle)}">
  <meta property="og:description" content="${esc(desc || site.description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${site.url}${url}">
  <meta property="og:image" content="${esc(ogImage || site.url + "/assets/og-default.jpg")}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="canonical" href="${site.url}${url}">
  <link rel="icon" href="/assets/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" href="/assets/favicon.png">
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
  <link rel="alternate" type="application/rss+xml" title="${esc(site.short)}" href="/feed.xml">
  <link rel="preload" href="/assets/fonts/baskerville-medium.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/assets/style.css?v=${CSS_V}">
  <title>${esc(fullTitle)}</title>
</head>
<body>
  <script>try{if(localStorage.getItem("theme")==="dark")document.body.classList.add("dark")}catch(e){}</script>

  <header class="top-header">
    <div class="container header-inner">
      <a class="brand" href="/">
        <img class="brand-mark" src="/assets/logo.png" alt="Biểu trưng Thư viện tri thức và tư liệu Kitô giáo Đông phương" width="58" height="58">
        <div>
          <p class="brand-name"><span class="brand-pre">Thư viện tri thức và tư liệu</span><span class="brand-main">Kitô giáo Đông phương</span></p>
        </div>
      </a>
      <div class="header-tools">
        ${searchBox("searchInput")}
        <button class="theme-button" id="themeButton" type="button" aria-label="Đổi giao diện sáng/tối">◐</button>
        <button class="menu-button" id="menuButton" type="button" aria-label="Mở menu">☰</button>
      </div>
    </div>
  </header>

  <div class="mobile-search">
    <div class="container">
      ${searchBox("mobileSearchInput")}
    </div>
  </div>

  <nav class="navigation" aria-label="Điều hướng chính">
    <div class="container nav-inner">
      <div class="nav-links" id="navLinks">
        ${nav.map(([h, t]) => `<a href="${h}"${h === url ? ' aria-current="page"' : ""}>${t}</a>`).join("\n        ")}
      </div>
    </div>
  </nav>

${body}

  <footer>
    <div class="container footer-inner">
      <p>${esc(site.footer)}</p>
      <div class="footer-links">
        <a href="/gioi-thieu/">Giới thiệu</a>
        <a href="mailto:kitogiaodongphuong@gmail.com">Liên hệ</a>
      </div>
    </div>
  </footer>

  <script src="/assets/site.js?v=${JS_V}"></script>
</body>
</html>
`;
}

// ---------- Thành phần ----------
function card(p) {
  return `<article class="article-card">
            <div class="article-art">${
              p.image ? `<img src="${esc(p.image)}" alt="${esc(p.image_alt || p.title)}" loading="lazy">` : "✝"
            }</div>
            <div class="article-copy">
              <div class="article-tags">${p.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
              <h3><a href="${p.url}">${esc(p.title)}</a></h3>
              <p>${esc(p.summary)}</p>
              <div class="article-meta">${fmtDate(p.date)} · ${p.minutes} phút đọc</div>
              ${p.image_credit ? `<small class="image-credit">${p.image_credit}</small>` : ""}
            </div>
          </article>`;
}

function categoryList() {
  return `<ul class="category-list">
            ${site.categories
              .map((c, i) => {
                const n = posts.filter((p) => p.cat.slug === c.slug).length;
                return `<li><a href="/chuyen-muc/${c.slug}/"><span class="category-number">${String(i + 1).padStart(2, "0")}</span>${esc(c.name)}<span class="category-count">${n}</span></a></li>`;
              })
              .join("\n            ")}
          </ul>`;
}

function sidebar() {
  return `<aside>
        <section>
          <div class="section-heading"><h2>Chuyên mục</h2></div>
          ${categoryList()}
        </section>
        ${verseBlock()}
      </aside>`;
}

function listPage({ heading, intro, list, url, title, desc }) {
  return layout({
    title,
    desc,
    url,
    body: `  <main id="top">
    <div class="container content-layout">
      <section>
        <div class="section-heading"><h2>${esc(heading)}</h2></div>
        ${intro ? `<p class="page-intro">${intro}</p>` : ""}
        <div class="article-list">
          ${list.length ? list.map(card).join("\n          ") : '<p class="no-results" style="display:block">Chưa có bài viết nào.</p>'}
        </div>
      </section>
      ${sidebar()}
    </div>
  </main>`,
  });
}

// ---------- Trang chủ ----------
const featured = posts.find((p) => p.featured) || posts[0];
const latest = posts.slice(0, 6);
const g0 = glossary[0];

write(
  "index.html",
  layout({
    title: site.name,
    url: "/",
    ogImage: featured && featured.image,
    body: `  <main id="top">
${
  featured
    ? `    <section class="hero">
      <div class="container hero-inner">
        <div class="hero-copy">
          <span class="eyebrow">Bài viết nổi bật</span>
          <h2><a href="${featured.url}">${esc(featured.title)}</a></h2>
          <p>${esc(featured.summary)}</p>
          <a class="primary-link" href="${featured.url}">Khám phá bài viết →</a>
        </div>
        <div class="hero-art">
          ${featured.image ? `<img class="hero-photo" src="${esc(featured.image)}" alt="${esc(featured.image_alt || featured.title)}" fetchpriority="high">` : ""}
          ${featured.image_caption ? `<span class="hero-art-note">${esc(featured.image_caption)}</span>` : ""}
        </div>
      </div>
    </section>`
    : ""
}
    <div class="container content-layout">
      <section>
        <div class="section-heading">
          <h2>Bài viết mới nhất</h2>
          <a class="more-link" href="/bai-viet/">Xem tất cả →</a>
        </div>
        <div class="article-list">
          ${latest.map(card).join("\n          ")}
        </div>
        ${
          g0
            ? `<section class="glossary-panel">
          <div class="section-heading">
            <h2>Thuật ngữ đáng chú ý</h2>
            <a class="more-link" href="/thuat-ngu/">Xem tất cả →</a>
          </div>
          <p class="glossary-term">${esc(g0.term)}</p>
          <p class="glossary-original">${esc(g0.original)} · ${esc(g0.short)}</p>
          <p>${esc(g0.meaning)}</p>
        </section>`
            : ""
        }
      </section>
      ${sidebar()}
    </div>
  </main>`,
  })
);

// ---------- Danh sách bài, chuyên mục ----------
write(
  "bai-viet/index.html",
  listPage({ heading: "Tất cả bài viết", list: posts, url: "/bai-viet/", title: "Bài viết", desc: "Tất cả bài viết." })
);

write(
  "chuyen-muc/index.html",
  layout({
    title: "Chuyên mục",
    url: "/chuyen-muc/",
    body: `  <main id="top">
    <div class="container content-layout">
      <section>
        <div class="section-heading"><h2>Chuyên mục</h2></div>
        ${categoryList()}
      </section>
      <aside>${verseBlock()}</aside>
    </div>
  </main>`,
  })
);

for (const c of site.categories) {
  write(
    `chuyen-muc/${c.slug}/index.html`,
    listPage({
      heading: c.name,
      list: posts.filter((p) => p.cat.slug === c.slug),
      url: `/chuyen-muc/${c.slug}/`,
      title: c.name,
      desc: `Các bài viết thuộc chuyên mục ${c.name}.`,
    })
  );
}

// ---------- Trang bài viết ----------
for (const p of posts) {
  write(
    `bai-viet/${p.slug}/index.html`,
    layout({
      title: p.title,
      desc: p.summary,
      url: p.url,
      ogImage: p.image,
      body: `  <main id="top" class="post">
    <a class="back" href="/bai-viet/">← Tất cả bài viết</a>
    <div class="post-category"><a href="/chuyen-muc/${p.cat.slug}/">${esc(p.cat.name)}</a></div>
    <h1>${esc(p.title)}</h1>
    ${p.summary ? `<p class="subtitle">${esc(p.summary)}</p>` : ""}
    <div class="meta">${fmtDate(p.date)} · ${p.minutes} phút đọc${p.author ? ` · ${esc(p.author)}` : " · Ban biên tập"}</div>
    ${
      p.image
        ? `<figure class="post-figure"><img src="${esc(p.image)}" alt="${esc(p.image_alt || p.title)}">${
            p.image_credit ? `<figcaption class="image-credit">${p.image_credit}</figcaption>` : ""
          }</figure>`
        : ""
    }
    <article class="post-body">
${p.html}
    </article>
    <div class="article-tags post-tags">${p.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
    <p class="back-bottom"><a href="/bai-viet/">← Trở về danh sách bài viết</a></p>
  </main>`,
    })
  );
}

// ---------- Thuật ngữ ----------
const gSlug = (t) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const glossarySorted = [...glossary].sort((a, b) => a.term.localeCompare(b.term, "en"));
const glossaryLetters = [...new Set(glossarySorted.map((g) => g.term[0].toUpperCase()))];
write(
  "thuat-ngu/index.html",
  layout({
    title: "Thuật ngữ",
    url: "/thuat-ngu/",
    body: `  <main id="top" class="post">
    <h1>Thuật ngữ</h1>
    <p class="glossary-intro">Bảng đối chiếu các thuật ngữ được dùng thống nhất trong thư viện, kèm tên gốc Hy Lạp và lời giải thích ngắn gọn.</p>
    <nav class="glossary-letters" aria-label="Mục lục theo chữ cái">${glossaryLetters
      .map((l) => `<a href="#chu-${l}">${l}</a>`)
      .join("")}</nav>
    <div class="glossary-full">
      ${glossarySorted
        .map(
          (g, i) => `<section class="glossary-panel" id="${gSlug(g.term)}"${
            i === 0 || g.term[0].toUpperCase() !== glossarySorted[i - 1].term[0].toUpperCase()
              ? ` data-letter="${g.term[0].toUpperCase()}"`
              : ""
          }>${
            i === 0 || g.term[0].toUpperCase() !== glossarySorted[i - 1].term[0].toUpperCase()
              ? `<span class="letter-anchor" id="chu-${g.term[0].toUpperCase()}"></span>`
              : ""
          }
        <p class="glossary-term">${esc(g.term)}</p>
        <p class="glossary-original">${esc(g.original)} · ${esc(g.short)}</p>
        <p>${esc(g.meaning)}</p>
      </section>`
        )
        .join("\n      ")}
    </div>
  </main>`,
  })
);

// ---------- Trang tĩnh trong pages/ ----------
for (const f of fs.readdirSync(path.join(ROOT, "pages")).filter((x) => x.endsWith(".md"))) {
  const slug = f.replace(/\.md$/, "");
  const { data, content } = matter(fs.readFileSync(path.join(ROOT, "pages", f), "utf8"));
  write(
    `${slug}/index.html`,
    layout({
      title: data.title,
      url: `/${slug}/`,
      body: `  <main id="top" class="post">
    <h1>${esc(data.title)}</h1>
    <article class="post-body">
${marked.parse(content)}
    </article>
  </main>`,
    })
  );
}

// ---------- Tìm kiếm, RSS, 404, chuyển hướng cũ ----------
write(
  "search.json",
  JSON.stringify(
    posts.map((p) => ({
      title: p.title,
      url: p.url,
      summary: p.summary,
      category: p.cat.name,
      tags: p.tags,
      text: p.text.slice(0, 4000),
    })).concat(
      glossary.map((g) => ({
        title: `${g.term} — ${g.short}`,
        url: `/thuat-ngu/#${gSlug(g.term)}`,
        summary: g.meaning,
        category: "Thuật ngữ",
        tags: [g.original],
        text: "",
      }))
    )
  )
);

write(
  "feed.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>${esc(site.name)}</title>
<link>${site.url}/</link>
<description>${esc(site.description)}</description>
<language>vi</language>
${posts
  .map(
    (p) => `<item><title>${esc(p.title)}</title><link>${site.url}${p.url}</link><guid>${site.url}${p.url}</guid><pubDate>${new Date(p.date).toUTCString()}</pubDate><description>${esc(p.summary)}</description></item>`
  )
  .join("\n")}
</channel></rss>
`
);

write(
  "404.html",
  layout({
    title: "Không tìm thấy trang",
    url: "/404.html",
    body: `  <main id="top" class="post">
    <h1>Không tìm thấy trang</h1>
    <p class="subtitle">Đường dẫn này không tồn tại hoặc đã được đổi.</p>
    <p><a href="/">← Về trang chủ</a></p>
  </main>`,
  })
);

// Địa chỉ cũ của bài Palamás
write(
  "bai-viet.html",
  `<!DOCTYPE html><html lang="vi"><meta charset="UTF-8"><meta http-equiv="refresh" content="0; url=/bai-viet/"><link rel="canonical" href="${site.url}/bai-viet/"><title>Đang chuyển trang…</title><a href="/bai-viet/">Bấm vào đây nếu trang không tự chuyển.</a></html>`
);

// Chép thư mục assets
fs.cpSync(path.join(ROOT, "assets"), path.join(OUT, "assets"), { recursive: true });
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");

// Sơ đồ trang và robots.txt
const sitemapUrls = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else if (e.name === "index.html") {
      const rel = path.relative(OUT, dir).split(path.sep).join("/");
      sitemapUrls.push(rel ? `/${rel}/` : "/");
    }
  }
})(OUT);
sitemapUrls.sort();
write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map((u) => `<url><loc>${site.url}${u}</loc></url>`).join("\n")}
</urlset>
`
);
write("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);

console.log(`Đã dựng ${posts.length} bài viết, ${site.categories.length} chuyên mục.`);
