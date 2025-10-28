import { hikes } from "./hikes.js";

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const yearGalleryEl = document.getElementById("yearGallery");
if (yearGalleryEl) yearGalleryEl.textContent = new Date().getFullYear();

const BOOKMARK_KEY = "tt_bookmarks";
const getBookmarks = () =>
    JSON.parse(localStorage.getItem(BOOKMARK_KEY) || "[]");
const saveBookmarks = (arr) =>
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(arr));

//  show featured Hike of the Day
const featuredCard = document.getElementById("featuredCard");
if (featuredCard) {
    const random = hikes[Math.floor(Math.random() * hikes.length)];
    featuredCard.innerHTML = `
    <img src="${random.image}" alt="${random.title}">
    <div>
      <h3>${random.title}</h3>
      <p class="meta">${random.location} • ${random.distance} • ${random.difficulty}</p>
      <p>${random.description}</p>
      <div style="margin-top:.6rem">
        <button data-id="${random.id}" class="btn view-btn">View in Gallery</button>
        <button data-id="${random.id}" class="btn" id="bookmarkFeatured">Bookmark</button>
      </div>
    </div>
  `;

    // bookmark featured handler
    document
        .getElementById("bookmarkFeatured")
        .addEventListener("click", (e) => {
            const id = e.currentTarget.dataset.id;
            const list = getBookmarks();
            if (!list.includes(id)) {
                list.push(id);
                saveBookmarks(list);
                alert("Bookmarked!");
            } else {
                alert("Already bookmarked");
            }
        });

    // view in gallery - redirect to gallery
    const viewBtn = featuredCard.querySelector(".view-btn");
    if (viewBtn) {
        viewBtn.addEventListener("click", () => {
            location.href = "gallery.html";
        });
    }
}

const galleryEl = document.getElementById("gallery");
if (galleryEl) {
    const regionSelect = document.getElementById("regionFilter");
    const difficultySelect = document.getElementById("difficultyFilter");
    const searchInput = document.getElementById("searchInput");
    const clearBtn = document.getElementById("clearFilters");

    const regions = Array.from(new Set(hikes.map((h) => h.region))).sort();
    regions.forEach((r) => {
        const opt = document.createElement("option");
        opt.value = r;
        opt.textContent = r;
        regionSelect.append(opt);
    });

    const renderGallery = (list) => {
        galleryEl.innerHTML = "";
        if (!list.length) {
            galleryEl.innerHTML = '<p class="muted">No hikes found.</p>';
            return;
        }
        list.forEach((h) => {
            const card = document.createElement("article");
            card.className = "card-hike";
            card.innerHTML = `
        <img loading="lazy" src="${h.image}" alt="${h.title}">
        <div class="card-body">
          <h3>${h.title}</h3>
          <div class="meta">${h.location} • ${h.distance} • ${h.difficulty}</div>
          <p class="muted">${h.description}</p>
          <div class="card-actions">
            <div>
              <button class="icon-btn view-detail" data-id="${h.id}" aria-label="View details of ${h.title}">🔍</button>
              <button class="icon-btn open-image" data-id="${h.id}" aria-label="Open image of ${h.title}">🖼️</button>
            </div>
            <div>
              <button class="icon-btn bookmark" data-id="${h.id}" aria-label="Bookmark ${h.title}">🔖</button>
            </div>
          </div>
        </div>
      `;
            galleryEl.appendChild(card);
        });
        attachGalleryHandlers();
        refreshBookmarksList();
    };

    const attachGalleryHandlers = () => {
        galleryEl.querySelectorAll(".view-detail").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const id = e.currentTarget.dataset.id;
                openModalFor(id);
            });
        });

        galleryEl.querySelectorAll(".open-image").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const id = e.currentTarget.dataset.id;
                openImageModalFor(id);
            });
        });

        galleryEl.querySelectorAll(".bookmark").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const id = e.currentTarget.dataset.id;
                const list = getBookmarks();
                if (!list.includes(id)) list.push(id);
                else {
                    const idx = list.indexOf(id);
                    if (idx > -1) list.splice(idx, 1);
                }
                saveBookmarks(list);
                refreshBookmarksList();

                btn.textContent = list.includes(id) ? "🔖" : "🔖";
            });
        });
    };

    const modal = document.getElementById("modal");
    const modalBody = document.getElementById("modalBody");
    const modalClose = document.getElementById("modalClose");
    const openModal = (html) => {
        modalBody.innerHTML = html;
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    };
    const closeModal = () => {
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        modalBody.innerHTML = "";
    };
    modalClose.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.getAttribute("aria-hidden") === "false")
            closeModal();
    });

    const openModalFor = (id) => {
        const h = hikes.find((x) => x.id === id);
        if (!h) return;
        const html = `
      <h2>${h.title}</h2>
      <p class="meta">${h.location} • ${h.distance} • ${h.difficulty}</p>
      <img src="${h.image}" alt="${h.title}" style="width:100%;max-height:60vh;object-fit:cover;border-radius:8px;margin-top:.5rem">
      <p style="margin-top:.7rem">${h.description}</p>
      <p style="margin-top:.5rem"><strong>Duration:</strong> ${h.duration}</p>
    `;
        openModal(html);
    };

    const openImageModalFor = (id) => {
        const h = hikes.find((x) => x.id === id);
        if (!h) return;
        const html = `<img src="${h.image}" alt="${h.title}" style="width:100%;height:auto;display:block;border-radius:6px">`;
        openModal(html);
    };

    const filterAndRender = () => {
        const region = regionSelect.value;
        const difficulty = difficultySelect.value;
        const q = searchInput.value.trim().toLowerCase();
        const filtered = hikes.filter((h) => {
            if (region !== "all" && h.region !== region) return false;
            if (difficulty !== "all" && h.difficulty !== difficulty)
                return false;
            if (q) {
                const hay =
                    `${h.title} ${h.description} ${h.location}`.toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });
        renderGallery(filtered);
    };

    regionSelect.addEventListener("change", filterAndRender);
    difficultySelect.addEventListener("change", filterAndRender);
    searchInput.addEventListener("input", filterAndRender);
    clearBtn.addEventListener("click", () => {
        regionSelect.value = "all";
        difficultySelect.value = "all";
        searchInput.value = "";
        filterAndRender();
    });

    const bookmarksList = document.getElementById("bookmarksList");
    const refreshBookmarksList = () => {
        const list = getBookmarks();
        if (!list.length) {
            bookmarksList.innerHTML =
                '<p class="muted">No bookmarks yet. Click the bookmark icon on a hike to save it.</p>';
            return;
        }
        const nodes = list
            .map((id) => {
                const h = hikes.find((x) => x.id === id);
                if (!h) return "";
                return `
        <div class="bookmark-item">
          <h4 style="margin:.2rem 0">${h.title}</h4>
          <div class="meta">${h.location} • ${h.difficulty}</div>
          <div style="margin-top:.5rem">
            <button class="btn open-bookmark" data-id="${h.id}">View</button>
            <button class="btn remove-bookmark" data-id="${h.id}">Remove</button>
          </div>
        </div>
      `;
            })
            .join("");
        bookmarksList.innerHTML = nodes;

        bookmarksList.querySelectorAll(".open-bookmark").forEach((b) => {
            b.addEventListener("click", (e) =>
                openModalFor(e.currentTarget.dataset.id)
            );
        });
        bookmarksList.querySelectorAll(".remove-bookmark").forEach((b) => {
            b.addEventListener("click", (e) => {
                const id = e.currentTarget.dataset.id;
                const arr = getBookmarks();
                const idx = arr.indexOf(id);
                if (idx > -1) {
                    arr.splice(idx, 1);
                    saveBookmarks(arr);
                    refreshBookmarksList();
                    filterAndRender();
                }
            });
        });
    };

    renderGallery(hikes);
    refreshBookmarksList();
}

const url = new URL(location.href);
if (url.searchParams.has("open")) {
    const id = url.searchParams.get("open");

    setTimeout(() => {
        if (document.getElementById("gallery")) {
            const ev = new Event("open");
            openModalFor?.(id);
        }
    }, 300);
}
