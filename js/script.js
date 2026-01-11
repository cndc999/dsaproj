let STORIES = {};

async function loadStories() {
  try {
    const res = await fetch("./data/stories.json");
    STORIES = await res.json();
    renderHot();
    renderUpdates();
    bindModal();
    initSearch();
  } catch (e) {
    console.error("Lỗi load stories.json:", e);
  }
}

function renderHot() {
  const grid = document.getElementById("hotGrid");
  if (!grid) return;
  grid.innerHTML = "";

  Object.values(STORIES).forEach(story => {
    grid.innerHTML += `
      <div class="card"
           data-id="${story.id}"
           data-title="${story.title || ""}"
           data-category="${story.category || ""}">
        <div class="cover">
          <img src="${story.cover || ""}" alt="${story.title || ""}">
        </div>
        <div class="caption">${story.title || ""}</div>
      </div>
    `;
  });

  grid.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", () => openModal(card.dataset.id));
  });
}

function renderUpdates() {
  const box = document.getElementById("updatesList");
  if (!box) return;
  box.innerHTML = "";

  const arr = Object.values(STORIES);
  arr.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

  arr.forEach(story => {
    const chapters = Object.keys(story.chapters || {});
    const lastChap = chapters.length ? chapters[chapters.length - 1] : "";

    box.innerHTML += `
      <div class="row">
        <a href="#" data-id="${story.id}" class="upd-link">${story.title}</a>
        <div class="muted">${story.category || ""}</div>
        <div class="chap">${lastChap}</div>
        <div class="time">${story.updated || ""}</div>
      </div>
    `;
  });

  box.querySelectorAll(".upd-link").forEach(a => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      openModal(a.dataset.id);
    });
  });
}

function bindModal() {
  const closeBtn = document.getElementById("modalClose");
  const modal = document.getElementById("modal");

  if (closeBtn) closeBtn.addEventListener("click", () => modal.classList.remove("open"));

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("open");
    });
  }
}

function openModal(storyId) {
  const story = Object.values(STORIES).find(s => s.id === storyId);
  if (!story) return;

  const modal = document.getElementById("modal");
  if (modal) modal.classList.add("open");

  const modalTitle = document.getElementById("modalTitle");
  if (modalTitle) modalTitle.innerText = story.title || "";

  const readerName = document.getElementById("readerName");
  if (readerName) readerName.innerText = story.title || "";

  const readerCategory = document.getElementById("readerCategory");
  if (readerCategory) readerCategory.innerText = story.category || "";

  const readerDesc = document.getElementById("readerDesc");
  if (readerDesc) readerDesc.innerText = story.description || "";

  const readerCover = document.getElementById("readerCover");
  if (readerCover) readerCover.src = story.cover || "";

  const select = document.getElementById("chapterSelect");
  if (select) {
    select.innerHTML = Object.keys(story.chapters || {})
      .map(ch => `<option value="${ch}">${ch}</option>`)
      .join("");
  }

  const btn = document.getElementById("loadChapterBtn");
  if (btn && select) {
    btn.onclick = () => {
      const chap = (select.value || "").trim();
      if (chap) window.location.href = `reader.html?story=${story.id}&chap=${chap}`;
    };
  }
}

function normalize(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function initSearch() {
  const searchInput = document.getElementById("searchInput");
  const categorySelect = document.getElementById("categorySelect");
  const grid = document.getElementById("hotGrid");
  const navCategoryMenu = document.getElementById("navCategoryMenu");

  if (!searchInput || !categorySelect || !grid) return;

  const cards = () => Array.from(grid.querySelectorAll(".card"));

  const cats = [...new Set(
    Object.values(STORIES)
      .map(s => (s.category || "").trim())
      .filter(Boolean)
  )];

  categorySelect.innerHTML = `<option value="__all__">TẤT CẢ</option>` + cats.map(c => `<option value="${c}">${c}</option>`).join("");

  if (navCategoryMenu) {
    navCategoryMenu.innerHTML = `<a href="#" data-cat="__all__">Tất cả</a>` + cats.map(c => `<a href="#" data-cat="${c}">${c}</a>`).join("");
    navCategoryMenu.querySelectorAll("a[data-cat]").forEach(a => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        categorySelect.value = a.dataset.cat || "__all__";
        applyFilter();
      });
    });
  }

  function applyFilter() {
    const q = normalize(searchInput.value);
    const cat = categorySelect.value;

    cards().forEach(card => {
      const title = normalize(card.dataset.title);
      const c = (card.dataset.category || "").trim();
      const cNorm = normalize(c);

      const okText = !q || title.includes(q) || cNorm.includes(q);
      const okCat = cat === "__all__" || c === cat;

      card.style.display = (okText && okCat) ? "" : "none";
    });
  }

  searchInput.addEventListener("input", applyFilter);
  searchInput.addEventListener("keyup", applyFilter);
  searchInput.addEventListener("search", applyFilter);
  categorySelect.addEventListener("change", applyFilter);
}

loadStories();
