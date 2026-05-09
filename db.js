// db.js
export async function fetchEvents() {
  try {
    const localEvents = JSON.parse(localStorage.getItem("custom_events")) || [];
    const res = await fetch("./data/events.json");
    const baseEvents = await res.json();
    // Combine both sources
    return [...localEvents, ...baseEvents]; 
  } catch (error) {
    console.error("Error loading events:", error);
    return JSON.parse(localStorage.getItem("custom_events")) || [];
  }
}

export async function fetchEventById(id) {
  const data = await fetchEvents();
  // Ensure ID matches regardless of type (string/number)
  return data.find(e => String(e.id) === String(id));
}

export function saveNewEvent(event) {
  const localEvents = JSON.parse(localStorage.getItem("custom_events")) || [];
  event.id = Date.now();
  event.image = "https://images.unsplash.com/photo-1559027615-cd26735550b4";
  localEvents.push(event);
  localStorage.setItem("custom_events", JSON.stringify(localEvents));
}

export function saveVolunteerSubmission(data) {
    const volunteers = JSON.parse(localStorage.getItem('kawanaksi_volunteers')) || [];
    volunteers.push({ ...data, timestamp: new Date() });
    localStorage.setItem('kawanaksi_volunteers', JSON.stringify(volunteers));
}