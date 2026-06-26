// State Management
let currentSearch = "";
let currentSearchField = "nama"; // 'nama', 'nim', 'ttl', 'no'
let currentGroup = "all";
let currentDateDay = "all";
let currentDateMonth = "all";
let currentDateYear = "all";

// DOM Elements
const friendListContainer = document.getElementById("friend_list");
const searchInput = document.getElementById("search_input");
const filterButtonsContainer = document.getElementById("filter_buttons");
const searchFieldSelect = document.getElementById("search_field_select");
const textSearchContainer = document.getElementById("text_search_container");
const dateSearchContainer = document.getElementById("date_search_container");
const dateDaySelect = document.getElementById("date_day");
const dateMonthSelect = document.getElementById("date_month");
const dateYearSelect = document.getElementById("date_year");

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
 * Memecah string TTL mahasiswa menjadi data hari, bulan, dan tahun lahir
 * @param {string} ttl - String TTL mahasiswa (e.g. "Bangkalan, 23 Juni 2006")
 * @returns {object} - Objek { day: number|null, month: number|null, year: number|null }
 */
function parseStudentTTL(ttl) {
  if (!ttl || typeof ttl !== "string") {
    return { day: null, month: null, year: null };
  }

  const clean = ttl.trim().toLowerCase();

  // Mapping bulan dalam bahasa Indonesia / kemungkinan salah tik
  const monthMap = {
    'januari': 1, 'jan': 1, '01': 1, '1': 1,
    'februari': 2, 'feb': 2, '02': 2, '2': 2,
    'maret': 3, 'mar': 3, '03': 3, '3': 3,
    'april': 4, 'apr': 4, '04': 4, '4': 4,
    'mei': 5, 'may': 5, '05': 5, '5': 5,
    'juni': 6, 'jun': 6, '06': 6, '6': 6,
    'juli': 7, 'jul': 7, '07': 7, '7': 7,
    'agustus': 8, 'agust': 8, 'agt': 8, '08': 8, '8': 8,
    'september': 9, 'sept': 9, 'sep': 9, '09': 9, '9': 9,
    'oktober': 10, 'okt': 10, 'oktiber': 10, '10': 10,
    'november': 11, 'nov': 11, '11': 11,
    'desember': 12, 'des': 12, '12': 12
  };

  // Mencari tahun 4 digit di dalam string
  const yearMatch = clean.match(/\b(19\d{2}|20\d{2})\b/);
  if (!yearMatch) {
    return { day: null, month: null, year: null };
  }
  const year = parseInt(yearMatch[0], 10);

  // Menghilangkan bagian tahun agar tidak mengganggu parsing hari/bulan
  const withoutYear = clean.replace(yearMatch[0], '').trim();

  // Split sisa string dengan pemisah umum (, / _ - spasi)
  const parts = withoutYear.replace(/[,\/_\-\s]+/g, ' ').trim().split(/\s+/);

  let day = null;
  let month = null;

  // Cari bulan menggunakan nama bulan dari kanan ke kiri
  let foundMonthIdx = -1;
  for (let i = parts.length - 1; i >= 0; i--) {
    const token = parts[i];
    if (monthMap[token] !== undefined) {
      month = monthMap[token];
      foundMonthIdx = i;
      break;
    }
  }

  if (month !== null) {
    // Jika bulan ditemukan berupa teks nama bulan, token tepat di kirinya biasanya adalah hari
    if (foundMonthIdx > 0) {
      const dayToken = parts[foundMonthIdx - 1];
      if (/^\d{1,2}$/.test(dayToken)) {
        day = parseInt(dayToken, 10);
      }
    }
  } else {
    // Jika tidak ditemukan nama bulan, kemungkinan berupa angka semua, contoh: "07/12/2005"
    // Ambil semua angka 1 atau 2 digit yang tersisa
    const numbers = parts.filter(p => /^\d{1,2}$/.test(p)).map(p => parseInt(p, 10));
    if (numbers.length >= 2) {
      // Di Indonesia umumnya urutan adalah Hari baru Bulan
      day = numbers[numbers.length - 2];
      month = numbers[numbers.length - 1];
    } else if (numbers.length === 1) {
      day = numbers[0];
    }
  }

  // Validasi nilai hari dan bulan agar masuk akal
  if (day !== null && (day < 1 || day > 31)) day = null;
  if (month !== null && (month < 1 || month > 12)) month = null;

  return { day, month, year };
}

/**
 * Inisialisasi dropdown untuk Tanggal dan Tahun secara dinamis
 */
function initializeDateDropdowns() {
  if (!window.studentData) return;

  // 1. Populasi Tanggal (01 - 31)
  if (dateDaySelect) {
    let dayOptionsHtml = '<option value="all">Tanggal (Semua)</option>';
    for (let i = 1; i <= 31; i++) {
      const valStr = String(i).padStart(2, '0');
      dayOptionsHtml += `<option value="${i}">${valStr}</option>`;
    }
    dateDaySelect.innerHTML = dayOptionsHtml;
  }

  // 2. Populasi Tahun Lahir secara dinamis berdasarkan data siswa
  if (dateYearSelect) {
    const years = new Set();
    window.studentData.forEach(student => {
      const parsed = parseStudentTTL(student.ttl);
      if (parsed.year) {
        years.add(parsed.year);
      }
    });

    const sortedYears = Array.from(years).sort((a, b) => a - b);
    
    let yearOptionsHtml = '<option value="all">Tahun (Semua)</option>';
    sortedYears.forEach(y => {
      yearOptionsHtml += `<option value="${y}">${y}</option>`;
    });
    dateYearSelect.innerHTML = yearOptionsHtml;
  }
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
    // 1. Filter Kelompok
    const matchesGroup = currentGroup === "all" || String(student.kelompok) === currentGroup;
    if (!matchesGroup) return false;

    // 2. Filter Kriteria Pencarian
    if (currentSearchField === "ttl") {
      const parsed = parseStudentTTL(student.ttl);
      
      const matchesDay = currentDateDay === "all" || (parsed.day !== null && String(parsed.day) === currentDateDay);
      const matchesMonth = currentDateMonth === "all" || (parsed.month !== null && String(parsed.month) === currentDateMonth);
      const matchesYear = currentDateYear === "all" || (parsed.year !== null && String(parsed.year) === currentDateYear);

      return matchesDay && matchesMonth && matchesYear;
    } else {
      if (!currentSearch || currentSearch.trim() === "") return true;

      const cleanSearch = currentSearch.toLowerCase().trim();
      if (currentSearchField === "nama") {
        return (student.nama || "").toLowerCase().includes(cleanSearch);
      } else if (currentSearchField === "nim") {
        return (student.nim || "").includes(cleanSearch);
      } else if (currentSearchField === "no") {
        const cleanStudentNo = (student.no || "").replace(/[^0-9]/g, "");
        const cleanInputNo = cleanSearch.replace(/[^0-9]/g, "");
        return cleanStudentNo.includes(cleanInputNo);
      }
      return false;
    }
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

if (searchFieldSelect) {
  searchFieldSelect.addEventListener("change", (e) => {
    currentSearchField = e.target.value;
    
    // Tampilkan/sembunyikan input yang sesuai
    if (currentSearchField === "ttl") {
      textSearchContainer.classList.add("hidden");
      dateSearchContainer.classList.remove("hidden");
    } else {
      textSearchContainer.classList.remove("hidden");
      dateSearchContainer.classList.add("hidden");
      
      // Update placeholder agar lebih deskriptif
      if (currentSearchField === "nama") {
        searchInput.placeholder = "Cari nama teman...";
      } else if (currentSearchField === "nim") {
        searchInput.placeholder = "Cari NIM teman...";
      } else if (currentSearchField === "no") {
        searchInput.placeholder = "Cari no. WhatsApp teman...";
      }
    }
    
    // Reset parameter pencarian agar hasil pencarian bersih
    currentSearch = "";
    if (searchInput) searchInput.value = "";
    
    currentDateDay = "all";
    if (dateDaySelect) dateDaySelect.value = "all";
    
    currentDateMonth = "all";
    if (dateMonthSelect) dateMonthSelect.value = "all";
    
    currentDateYear = "all";
    if (dateYearSelect) dateYearSelect.value = "all";

    renderFriends();
  });
}

if (dateDaySelect) {
  dateDaySelect.addEventListener("change", (e) => {
    currentDateDay = e.target.value;
    renderFriends();
  });
}

if (dateMonthSelect) {
  dateMonthSelect.addEventListener("change", (e) => {
    currentDateMonth = e.target.value;
    renderFriends();
  });
}

if (dateYearSelect) {
  dateYearSelect.addEventListener("change", (e) => {
    currentDateYear = e.target.value;
    renderFriends();
  });
}

// Inisialisasi Render Awal
document.addEventListener("DOMContentLoaded", () => {
  initializeGroupFilters();
  initializeDateDropdowns();
  renderFriends();
});