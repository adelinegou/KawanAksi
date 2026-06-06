// db.js
export async function fetchEvents() {
  try {
    const localEvents = JSON.parse(localStorage.getItem("custom_events")) || [];
    const res = await fetch("./events.json");
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
  event.image = event.image || "https://images.unsplash.com/photo-1559027615-cd26735550b4";
  localEvents.push(event);
  localStorage.setItem("custom_events", JSON.stringify(localEvents));
}

export function saveVolunteerSubmission(data) {
    const volunteers = JSON.parse(localStorage.getItem('kawanaksi_volunteers')) || [];
    volunteers.push({
      id: data.id || Date.now(),
      ...data,
      userId: data.userId || null,
      timestamp: new Date(),
    });
    localStorage.setItem('kawanaksi_volunteers', JSON.stringify(volunteers));
}

export function updateVolunteerSubmission(id, updates) {
  const volunteers = JSON.parse(localStorage.getItem('kawanaksi_volunteers')) || [];
  const index = volunteers.findIndex((submission) => String(submission.id) === String(id));
  if (index === -1) return null;
  volunteers[index] = {
    ...volunteers[index],
    ...updates,
    timestamp: new Date(),
  };
  localStorage.setItem('kawanaksi_volunteers', JSON.stringify(volunteers));
  return volunteers[index];
}

export function getSubmissionByEventAndUser(eventId, userId, email) {
  const volunteers = JSON.parse(localStorage.getItem('kawanaksi_volunteers')) || [];
  return volunteers.find((submission) => {
    const sameEvent = String(submission.eventId) === String(eventId);
    if (!sameEvent) return false;
    if (userId != null && submission.userId === userId) return true;
    return email && submission.email === email;
  });
}

export function getMySubmissions() {
  return JSON.parse(localStorage.getItem("kawanaksi_volunteers")) || [];
}

export function getProfile() {
  const currentUser = getCurrentUser();
  if (currentUser) {
    return {
      name: currentUser.name || "",
      email: currentUser.email || "",
      phone: currentUser.phone || "",
    };
  }

  return {
    name: "",
    email: "",
    phone: "",
  };
}

export function saveProfile(data) {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const updatedUser = updateUser(currentUser.id, data);
  if (updatedUser) {
    setCurrentUser(updatedUser);
  }
}

export function getUsers() {
  return JSON.parse(
    localStorage.getItem("kawanaksi_users")
  ) || [];
}

export function saveUser(user) {
  const users = getUsers();

  user.id = Date.now();

  users.push(user);

  localStorage.setItem(
    "kawanaksi_users",
    JSON.stringify(users)
  );
}

export function findUser(email, password) {
  const users = getUsers();

  return users.find(
    user =>
      user.email === email &&
      user.password === password
  );
}

export function getCurrentUser() {
  return JSON.parse(
    localStorage.getItem("currentUser")
  );
}

export function setCurrentUser(user) {
  localStorage.setItem(
    "currentUser",
    JSON.stringify(user)
  );
}

export function updateUser(id, updates) {
  const users = getUsers();
  const index = users.findIndex(
    (user) => user.id === id
  );

  if (index === -1) return null;

  users[index] = {
    ...users[index],
    ...updates,
  };

  localStorage.setItem(
    "kawanaksi_users",
    JSON.stringify(users)
  );

  return users[index];
}

export function logoutUser() {
  localStorage.removeItem("currentUser");
}