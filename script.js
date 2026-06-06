import {
  fetchEvents,
  fetchEventById,
  saveNewEvent,
  saveVolunteerSubmission,
  getMySubmissions, 
  getProfile,       
  saveProfile       
} from "./db.js";

const currentUser =
  JSON.parse(localStorage.getItem("currentUser"));

const currentPage =
  window.location.pathname.split("/").pop();

if (
  !currentUser &&
  currentPage !== "login.html" &&
  currentPage !== "signup.html"
) {
  window.location.href = "login.html";
}

const userInfo =
  document.getElementById("userInfo");

if (userInfo && currentUser) {

  userInfo.innerHTML = `
    <span>${currentUser.name} (${currentUser.role})</span>
    <button id="logoutBtn">Logout</button>
  `;

  document
    .getElementById("logoutBtn")
    .addEventListener("click", () => {

      localStorage.removeItem("currentUser");

      window.location.href =
        "login.html";
    });
}


const PHONE_PATTERN = /^\+628[1-9][0-9]{7,11}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function normalizePhone(value) {
  return value.trim().replace(/[\s().-]/g, "");
}

function isValidIndonesianMobile(value) {
  return PHONE_PATTERN.test(normalizePhone(value));
}

function getWhatsAppDigits(value) {
  const compact = normalizePhone(value);

  if (compact.startsWith("+62")) {
    return compact.slice(1).replace(/\D/g, "");
  }

  if (compact.startsWith("0")) {
    return `62${compact.slice(1).replace(/\D/g, "")}`;
  }

  return compact.replace(/\D/g, "");
}

function isValidEmail(value) {
  return EMAIL_PATTERN.test(value.trim());
}

function getDateInputValue(offsetDays = 0) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isFutureDate(value) {
  if (!value) return false;

  const selectedDate = new Date(`${value}T00:00:00`);
  const today = new Date(`${getDateInputValue()}T00:00:00`);
  return selectedDate > today;
}

function setStatus(id, message, type = "error") {
  const status = document.getElementById(id);
  if (!status) return;

  status.textContent = message;
  status.className = `form-status ${type}`;
}

function resetFieldValidity(...fields) {
  fields.forEach((field) => field?.setCustomValidity(""));
}

function getLines(elementId) {
  return document
    .getElementById(elementId)
    .value.split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function validateTimeRange(startTime, endTime) {
  if (!startTime || !endTime) return false;
  return startTime < endTime;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.readAsDataURL(file);
  });
}

function validateImageInput(input) {
  const file = input.files?.[0];

  if (!file) {
    return "Upload gambar kegiatan wajib diisi.";
  }

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "Format gambar harus JPG, PNG, atau WebP.";
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return "Ukuran gambar maksimal 2 MB.";
  }

  return "";
}

function createEventCard(ev) {
  const card = document.createElement("div");
  card.className = "card";

  const image = document.createElement("img");
  image.src = ev.image;
  image.alt = ev.title;

  const content = document.createElement("div");
  content.className = "card-content";

  const title = document.createElement("h3");
  title.textContent = ev.title;

  const location = document.createElement("p");
  location.textContent = `Lokasi: ${ev.location}`;

  const link = document.createElement("a");
  link.href = `event.html?id=${ev.id}`;
  link.className = "btn-primary";
  link.textContent = "Lihat Detail";

  content.append(title, location, link);
  card.append(image, content);

  return card;
}

// Restore Event Cards on Homepage
const eventGrid = document.getElementById("eventGrid");
if (eventGrid) {
  fetchEvents().then((events) => {
    eventGrid.innerHTML = "";
    events.forEach((ev) => {
      eventGrid.appendChild(createEventCard(ev));
    });
  });
}

// Volunteer Registration Logic
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  const fullNameInput = document.getElementById("fullname");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    resetFieldValidity(fullNameInput, emailInput, phoneInput);

    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = normalizePhone(phoneInput.value);

    if (fullName.length < 3) {
      fullNameInput.setCustomValidity("Nama lengkap minimal 3 karakter.");
      fullNameInput.reportValidity();
      setStatus("submitStatus", "Periksa kembali nama lengkap.");
      return;
    }

    if (!isValidEmail(email)) {
      emailInput.setCustomValidity("Masukkan email yang valid.");
      emailInput.reportValidity();
      setStatus("submitStatus", "Periksa kembali alamat email.");
      return;
    }

    if (!isValidIndonesianMobile(phone)) {
      phoneInput.setCustomValidity("Nomor telepon harus diawali +62 dan bisa dipakai WhatsApp.");
      phoneInput.reportValidity();
      setStatus("submitStatus", "Gunakan format nomor seperti +6281234567890.");
      return;
    }

    if (!registerForm.reportValidity()) return;

    const eventId = new URLSearchParams(window.location.search).get("id");
    const event = eventId ? await fetchEventById(eventId) : null;

    saveVolunteerSubmission({
      eventId,
      eventTitle: event?.title || "",
      fullName,
      email,
      phone,
    });

    registerForm.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <h2 style="color: #2ecc71;">Pendaftaran Berhasil!</h2>
        <p>Terima kasih telah bergabung. Panitia akan segera menghubungi Anda.</p>
        <br>
        <a href="index.html" class="btn-primary">Kembali ke Daftar Kegiatan</a>
      </div>
    `;
  });
}

// Detail Page Logic
if (window.location.pathname.includes("event.html")) {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  if (id) {
    fetchEventById(id).then((ev) => {
      if (!ev) return;
      document.getElementById("eventImage").src = ev.image;
      document.getElementById("eventImage").alt = ev.title;
      document.getElementById("eventTitle").textContent = ev.title;
      document.getElementById("eventLocation").textContent = ev.location;
      document.getElementById("eventDate").textContent = ev.date;
      document.getElementById("eventTime").textContent = ev.time;
      document.getElementById("eventOrganizer").textContent = ev.organizer;
      document.getElementById("eventContact").textContent = ev.contact;
      document.getElementById("eventDescription").textContent = ev.description;

      const renderList = (data, elementId) => {
        const el = document.getElementById(elementId);
        el.innerHTML = "";
        data.forEach((item) => {
          const li = document.createElement("li");
          li.textContent = item;
          el.appendChild(li);
        });
      };

      renderList(ev.requirements, "eventRequirements");
      renderList(ev.benefits, "eventBenefits");

      document.getElementById("registerBtn").href = `register.html?id=${ev.id}`;
      document.getElementById("contactBtn").href = `https://wa.me/${getWhatsAppDigits(ev.contact)}`;
    });
  }
}

// Create Event Form
const eventRegisterForm = document.getElementById("eventRegisterForm");
if (eventRegisterForm) {
  const dateInput = document.getElementById("evDate");
  const startTimeInput = document.getElementById("evStartTime");
  const endTimeInput = document.getElementById("evEndTime");
  const contactInput = document.getElementById("evContact");
  const imageInput = document.getElementById("evImage");
  const imagePreview = document.getElementById("evImagePreview");

  dateInput.min = getDateInputValue(1);

  imageInput.addEventListener("change", async () => {
    resetFieldValidity(imageInput);
    const imageError = validateImageInput(imageInput);

    if (imageError) {
      imageInput.setCustomValidity(imageError);
      imageInput.reportValidity();
      imagePreview.hidden = true;
      imagePreview.removeAttribute("src");
      return;
    }

    imagePreview.src = await fileToDataUrl(imageInput.files[0]);
    imagePreview.hidden = false;
  });

  eventRegisterForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    resetFieldValidity(dateInput, startTimeInput, endTimeInput, contactInput, imageInput);

    if (!isFutureDate(dateInput.value)) {
      dateInput.setCustomValidity("Tanggal kegiatan harus setelah hari ini.");
      dateInput.reportValidity();
      setStatus("eventSubmitStatus", "Tanggal kegiatan wajib lebih dari hari ini.");
      return;
    }

    if (!validateTimeRange(startTimeInput.value, endTimeInput.value)) {
      endTimeInput.setCustomValidity("Waktu selesai harus setelah waktu mulai.");
      endTimeInput.reportValidity();
      setStatus("eventSubmitStatus", "Periksa kembali waktu kegiatan.");
      return;
    }

    if (!isValidIndonesianMobile(contactInput.value)) {
      contactInput.setCustomValidity("Nomor kontak harus diawali +62 dan bisa dipakai WhatsApp.");
      contactInput.reportValidity();
      setStatus("eventSubmitStatus", "Gunakan nomor WhatsApp dengan format +6281234567890.");
      return;
    }

    const imageError = validateImageInput(imageInput);
    if (imageError) {
      imageInput.setCustomValidity(imageError);
      imageInput.reportValidity();
      setStatus("eventSubmitStatus", imageError);
      return;
    }

    if (!eventRegisterForm.reportValidity()) return;

    const requirements = getLines("evRequirements");
    const benefits = getLines("evBenefits");

    if (!requirements.length || !benefits.length) {
      setStatus("eventSubmitStatus", "Persyaratan dan benefit minimal berisi satu baris.");
      return;
    }

    const eventData = {
      title: document.getElementById("evTitle").value.trim(),
      location: document.getElementById("evLocation").value.trim(),
      date: dateInput.value,
      time: `${startTimeInput.value} - ${endTimeInput.value}`,
      organizer: document.getElementById("evOrganizer").value.trim(),
      contact: normalizePhone(contactInput.value),
      image: await fileToDataUrl(imageInput.files[0]),
      description: document.getElementById("evDescription").value.trim(),
      requirements,
      benefits,
    };

    try {
      saveNewEvent(eventData);
    } catch (error) {
      console.error("Gagal menyimpan kegiatan:", error);
      setStatus("eventSubmitStatus", "Gagal menyimpan kegiatan. Coba gunakan gambar yang lebih kecil.");
      return;
    }

    setStatus("eventSubmitStatus", "Kegiatan berhasil didaftarkan!", "success");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);
  });
}


// ==========================================
// User Profile Logic
// ==========================================
const profileForm = document.getElementById("profileForm");
if (profileForm) {
  const profName = document.getElementById("profName");
  const profEmail = document.getElementById("profEmail");
  const profPhone = document.getElementById("profPhone");

  // Load existing profile kalau udah pernah disimpen
  const profile = getProfile();
  profName.value = profile.name || "";
  profEmail.value = profile.email || "";
  profPhone.value = profile.phone || "";

  profileForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    // Validasi dikit biar data rapi
    if (!isValidEmail(profEmail.value)) {
      setStatus("profileStatus", "Masukkan email yang valid.", "error");
      return;
    }
    if (!isValidIndonesianMobile(profPhone.value)) {
      setStatus("profileStatus", "Gunakan nomor +62...", "error");
      return;
    }

    saveProfile({
      name: profName.value.trim(),
      email: profEmail.value.trim(),
      phone: normalizePhone(profPhone.value)
    });

    setStatus("profileStatus", "Profil berhasil disimpan!", "success");
  });
}

// ==========================================
// My Events Logic
// ==========================================
const myEventGrid = document.getElementById("myEventGrid");
if (myEventGrid) {
  const submissions = getMySubmissions();
  
  fetchEvents().then((events) => {
    myEventGrid.innerHTML = "";
    
    if (submissions.length === 0) {
      myEventGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
          <p>Kamu belum mendaftar kegiatan apapun. Yuk cari event di beranda!</p>
        </div>`;
      return;
    }

    // Hindari event yang sama dirender dobel kalau user daftar 2x
    const uniqueEventIds = [...new Set(submissions.map(sub => sub.eventId))];

    uniqueEventIds.forEach((eventId) => {
      // Cocokin ID event dari submission dengan database event
      const ev = events.find((e) => String(e.id) === String(eventId));
      if (ev) {
        // Pake fungsi createEventCard yang udah lu bikin sebelumnya
        const card = createEventCard(ev);
        
        // Modif sedikit tombolnya khusus di halaman My Event
        const link = card.querySelector('a');
        link.textContent = "Lihat Detail Pendaftaran";
        link.style.backgroundColor = "#27ae60"; // Ganti ijo biar beda
        
        myEventGrid.appendChild(card);
      }
    });
  });
}