// Giao diện sáng/tối (nhớ lựa chọn)
const themeButton = document.getElementById("themeButton");
const syncTheme = () => {
  themeButton.textContent = document.body.classList.contains("dark") ? "☀" : "◐";
};
syncTheme();
themeButton.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  try { localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light"); } catch (e) {}
  syncTheme();
});

// Menu điện thoại
const navLinks = document.getElementById("navLinks");
document.getElementById("menuButton").addEventListener("click", () => navLinks.classList.toggle("open"));

// Ảnh lỗi thì ẩn đi, giữ lại nền màu
document.addEventListener("error", (e) => {
  if (e.target.tagName === "IMG") e.target.hidden = true;
}, true);

// Tìm kiếm (không phân biệt dấu)
const norm = (s) => s.toLocaleLowerCase("vi").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");
let index = null;
const load = () => index || (index = fetch("/search.json").then((r) => r.json()).catch(() => []));
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

document.querySelectorAll(".js-search").forEach((input) => {
  const box = input.parentElement.querySelector(".search-results");
  input.addEventListener("input", async () => {
    const q = norm(input.value.trim());
    document.querySelectorAll(".js-search").forEach((o) => { if (o !== input) o.value = input.value; });
    if (!q) { box.hidden = true; return; }
    const data = await load();
    const hits = data.filter((p) => norm([p.title, p.summary, p.category, p.tags.join(" "), p.text].join(" ")).includes(q)).slice(0, 8);
    box.innerHTML = hits.length
      ? hits.map((p) => `<a href="${p.url}">${esc(p.title)}<small>${esc(p.category)}</small></a>`).join("")
      : '<div class="none">Không tìm thấy bài viết phù hợp.</div>';
    box.hidden = false;
  });
});
document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-box")) document.querySelectorAll(".search-results").forEach((b) => (b.hidden = true));
});
