// State Management
let currentSearch = "";
let currentGroup = "all";

// DOM Elements
const friendListContainer = document.getElementById("friend_list");
const searchInput = document.getElementById("search_input");
const filterButtonsContainer = document.getElementById("filter_buttons");

/**
 * Mendapatkan URL foto yang aman dengan fallback jika undefined/kosong
 * @param {string} url - URL foto selfie
 * @param {string} nama - Nama mahasiswa untuk UI Avatars
 */
function getSafeImageUrl(url, nama) {
  if (!url || url.trim() === "" || url === "undefined") {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nama)}&background=00b2f9&color=fff&size=150&bold=true`;
  }
  // Ganti http menjadi https untuk mencegah masalah Mixed Content
  return url.replace(/^http:\/\//i, "https://");
}

/**
 * Membuat tombol filter kelompok secara dinamis berdasarkan data yang ada
 */
function initializeGroupFilters() {
  if (!filterButtonsContainer) return;

  // Buat HTML untuk tombol-tombol filter kelompok 1 sampai 12
  let buttonsHtml = `<button class="filter-btn active" data-group="all">Semua</button>`;
  for (let i = 1; i <= 12; i++) {
    buttonsHtml += `<button class="filter-btn" data-group="${i}">Kel. ${i}</button>`;
  }

  filterButtonsContainer.innerHTML = buttonsHtml;

  // Pasang event listener ke tombol-tombol yang baru dibuat
  const buttons = filterButtonsContainer.querySelectorAll(".filter-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      // Ubah kelas active
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // Update state filter kelompok dan render ulang
      currentGroup = btn.getAttribute("data-group");
      renderFriends();
    });
  });
}

/**
 * Merender daftar teman ke dalam HTML
 */
function renderFriends() {
  if (!window.studentData) {
    friendListContainer.innerHTML = `<div class="error-msg">Data mahasiswa tidak ditemukan. Pastikan data.js sudah dimuat.</div>`;
    return;
  }

  // Filter data berdasarkan pencarian dan kelompok
  const filteredData = window.studentData.filter(student => {
    const matchesSearch = student.nama.toLowerCase().includes(currentSearch.toLowerCase()) || 
                          student.nim.includes(currentSearch);
    const matchesGroup = currentGroup === "all" || String(student.kelompok) === currentGroup;
    return matchesSearch && matchesGroup;
  });

  if (filteredData.length === 0) {
    friendListContainer.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
        <p>Tidak ada mahasiswa yang cocok dengan kriteria pencarian.</p>
      </div>
    `;
    return;
  }

  const cardsHtml = filteredData.map(student => {
    const safeSelfieUrl = getSafeImageUrl(student.fotoselfie, student.nama);
    const displayName = student.nama || "Tanpa Nama";
    const displayNim = student.nim || "-";
    const displayTtl = student.ttl || "-";
    const displayAlamat = student.alamat || "-";
    const displayNo = student.no || "-";
    const kelompokNum = student.kelompok || "?";

    return `
      <li>
        <figure class="card group-${kelompokNum}">
          <div class="card_header">
            <div class="card_image_wrapper">
              <img 
                src="${safeSelfieUrl}" 
                alt="${displayName}" 
                class="card_image selfie-img" 
                loading="lazy"
                onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=00b2f9&color=fff&size=150&bold=true';"
              />
              <span class="group-badge">Kelompok ${kelompokNum}</span>
            </div>
            <div class="card_description">
              <span class="student-name" title="${displayName}">${displayName}</span>
              <span class="student-nim">${displayNim}</span>
            </div>
          </div>
          <figcaption class="card_content">
            <div class="info-row">
              <span class="info-label">TTL</span>
              <span class="info-value">${displayTtl}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Alamat</span>
              <span class="info-value" title="${displayAlamat}">${displayAlamat}</span>
            </div>
            <div class="info-row">
              <span class="info-label">WhatsApp</span>
              <span class="info-value">
                <a href="https://wa.me/${displayNo.replace(/[^0-9]/g, '')}" target="_blank" class="wa-link">
                  ${displayNo}
                </a>
              </span>
            </div>
          </figcaption>
        </figure>
      </li>
    `;
  }).join("");

  friendListContainer.innerHTML = cardsHtml;
}

// Event Listeners
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    currentSearch = e.target.value;
    renderFriends();
  });
}

// Inisialisasi Render Awal
document.addEventListener("DOMContentLoaded", () => {
  initializeGroupFilters();
  renderFriends();
});