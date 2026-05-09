// script.js
import { fetchEvents, fetchEventById, saveNewEvent } from "./db.js";

// Restore Event Cards on Homepage
const eventGrid = document.getElementById("eventGrid");
if (eventGrid) {
  fetchEvents().then(events => {
    eventGrid.innerHTML = "";
    events.forEach(ev => {
      const card = document.createElement("div");
      card.className = "card"; // Matches restored CSS
      card.innerHTML = `
        <img src="${ev.image}">
        <div class="card-content">
          <h3>${ev.title}</h3>
          <p>📍 ${ev.location}</p>
          <a href="event.html?id=${ev.id}" class="btn-primary">Lihat Detail</a>
        </div>
      `;
      eventGrid.appendChild(card);
    });
  });
}

// Volunteer Registration Success Logic
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", e => {
    e.preventDefault();
    
    // Hide form and show success message
    registerForm.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <h2 style="color: #2ecc71;">✔️ Pendaftaran Berhasil!</h2>
        <p>Terima kasih telah bergabung. Panitia akan segera menghubungi Anda.</p>
        <br>
        <a href="index.html" class="btn-primary">Kembali ke Daftar Kegiatan</a>
      </div>
    `;
  });
}

// --- DETAIL PAGE LOGIC ---
if (window.location.pathname.includes("event.html")) {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  if (id) {
    fetchEventById(id).then(ev => {
      if (!ev) return;
      document.getElementById("eventImage").src = ev.image;
      document.getElementById("eventTitle").textContent = ev.title;
      document.getElementById("eventLocation").textContent = ev.location;
      document.getElementById("eventDate").textContent = ev.date;
      document.getElementById("eventTime").textContent = ev.time;
      document.getElementById("eventOrganizer").textContent = ev.organizer;
      document.getElementById("eventContact").textContent = ev.contact;
      document.getElementById("eventDescription").textContent = ev.description;

      // Render Lists
      const renderList = (data, elementId) => {
        const el = document.getElementById(elementId);
        el.innerHTML = "";
        data.forEach(item => {
          const li = document.createElement("li");
          li.textContent = item;
          el.appendChild(li);
        });
      };

      renderList(ev.requirements, "eventRequirements");
      renderList(ev.benefits, "eventBenefits");

      document.getElementById("registerBtn").href = `register.html?id=${ev.id}`;
      document.getElementById("contactBtn").href = `https://wa.me/${ev.contact.replace(/\D/g,'')}`;
    });
  }
}

// --- CREATE EVENT FORM ---
const eventRegisterForm = document.getElementById("eventRegisterForm");
if (eventRegisterForm) {
  eventRegisterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const eventData = {
      title: document.getElementById("evTitle").value,
      location: document.getElementById("evLocation").value,
      date: document.getElementById("evDate").value,
      time: document.getElementById("evTime").value,
      organizer: document.getElementById("evOrganizer").value,
      contact: document.getElementById("evContact").value,
      description: document.getElementById("evDescription").value,
      requirements: document.getElementById("evRequirements").value.split("\n").filter(r => r.trim()),
      benefits: document.getElementById("evBenefits").value.split("\n").filter(b => b.trim()),
    };

    saveNewEvent(eventData);
    document.getElementById("eventSubmitStatus").textContent = "Kegiatan berhasil didaftarkan!";
    setTimeout(() => window.location.href = "index.html", 1200);
  });
}