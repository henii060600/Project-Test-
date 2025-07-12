// Header hide/show on scroll
let lastScrollTop = 0;
const header = document.querySelector(".header");

window.addEventListener("scroll", () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (scrollTop > lastScrollTop && scrollTop > 100) {
    // scroll down
    header.classList.remove("visible");
    header.classList.add("hidden");
  } else {
    // scroll up
    header.classList.remove("hidden");
    header.classList.add("visible");
  }
  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});

// Active menu based on URL
document.querySelectorAll(".nav-link").forEach((link) => {
  if (link.href === window.location.href) {
    link.classList.add("active");
  } else {
    link.classList.remove("active");
  }
});

// Banner parallax effect
const bannerImage = document.querySelector(".banner-image");
window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  bannerImage.style.transform = `translateY(${scrollY * 0.3}px)`;
});

// Post list and pagination

const postList = document.getElementById("post-list");
const showingStatus = document.getElementById("showing-status");
const pageSizeSelect = document.getElementById("page-size-select");
const sortSelect = document.getElementById("sort-select");
const pagination = document.getElementById("pagination");

let currentPage = parseInt(localStorage.getItem("currentPage")) || 1;
let pageSize = parseInt(localStorage.getItem("pageSize")) || 10;
let sortOrder = localStorage.getItem("sortOrder") || "-published_at";
let totalItems = 0;

pageSizeSelect.value = pageSize;
sortSelect.value = sortOrder;

async function fetchIdeas(page, size, sort) {
  const baseUrl = "https://suitmedia-backend.suitdev.com/api/ideas";
  const params = new URLSearchParams({
    "page[number]": page,
    "page[size]": size,
    append: ["small_image", "medium_image"],
    sort: sort,
  });

  const url = `${baseUrl}?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(
        `Network response was not ok (status: ${response.status})`
      );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}

function renderIdeas(ideas) {
  postList.innerHTML = "";
  if (!ideas || !ideas.data || ideas.data.length === 0) {
    postList.innerHTML = "<p>Tidak ada data ide.</p>";
    showingStatus.textContent = "Showing 0 - 0 of 0";
    pagination.innerHTML = "";
    return;
  }

  totalItems = ideas.meta?.pagination?.total || ideas.data.length;
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  showingStatus.textContent = `Showing ${startItem} - ${endItem} of ${totalItems}`;

  ideas.data.forEach((idea) => {
    const title = idea.title || "No Title";
    const date = new Date(idea.published_at).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const imageUrl =
      idea.small_image?.url ||
      idea.medium_image?.url ||
      "https://via.placeholder.com/400x300?text=No+Image";

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img class="card-img" src="${imageUrl}" alt="${title}" loading="lazy" />
      <div class="card-content">
        <div class="card-date">${date.toUpperCase()}</div>
        <div class="card-title">${title}</div>
      </div>
    `;
    postList.appendChild(card);
  });

  renderPagination(totalItems, pageSize, currentPage);
}

function renderPagination(total, size, current) {
  pagination.innerHTML = "";

  const totalPages = Math.ceil(total / size);

  // Previous button
  const prevBtn = document.createElement("button");
  prevBtn.className = "pagination-btn";
  prevBtn.textContent = "<";
  prevBtn.disabled = current === 1;
  prevBtn.addEventListener("click", () => {
    if (current > 1) {
      currentPage--;
      saveStateAndLoad();
    }
  });
  pagination.appendChild(prevBtn);

  // Page buttons (maksimal 5 halaman terlihat)
  const maxPagesToShow = 5;
  let startPage = Math.max(1, current - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    const btn = document.createElement("button");
    btn.className = "pagination-btn";
    if (i === current) btn.classList.add("active");
    btn.textContent = i;
    btn.addEventListener("click", () => {
      currentPage = i;
      saveStateAndLoad();
    });
    pagination.appendChild(btn);
  }

  // Next button
  const nextBtn = document.createElement("button");
  nextBtn.className = "pagination-btn";
  nextBtn.textContent = ">";
  nextBtn.disabled = current === totalPages;
  nextBtn.addEventListener("click", () => {
    if (current < totalPages) {
      currentPage++;
      saveStateAndLoad();
    }
  });
  pagination.appendChild(nextBtn);
}

function saveStateAndLoad() {
  localStorage.setItem("currentPage", currentPage);
  localStorage.setItem("pageSize", pageSize);
  localStorage.setItem("sortOrder", sortOrder);
  loadData();
}

async function loadData() {
  pageSize = parseInt(pageSizeSelect.value);
  sortOrder = sortSelect.value;
  localStorage.setItem("pageSize", pageSize);
  localStorage.setItem("sortOrder", sortOrder);

  const data = await fetchIdeas(currentPage, pageSize, sortOrder);
  renderIdeas(data);
}

// Event listeners untuk kontrol
pageSizeSelect.addEventListener("change", () => {
  currentPage = 1;
  pageSize = parseInt(pageSizeSelect.value);
  saveStateAndLoad();
});
sortSelect.addEventListener("change", () => {
  currentPage = 1;
  sortOrder = sortSelect.value;
  saveStateAndLoad();
});

// Load data awal saat halaman siap
document.addEventListener("DOMContentLoaded", () => {
  loadData();
});
