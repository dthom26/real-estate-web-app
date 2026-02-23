const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
  throw new Error(
    "VITE_API_URL is not defined. Check your .env.development.local file.",
  );
}

async function request(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      body.error || `Request failed with status ${response.status}`,
    );
  }
  return response.json();
}

export function getAbout(signal) {
  return request("/about", { signal });
}
export function getServices(signal) {
  return request("/services", { signal });
}
export function getReviews(signal) {
  return request("/reviews", { signal });
}
export function getContact(signal) {
  return request("/contact", { signal });
}
export function getHero(signal) {
  return request("/hero", { signal });
}
export function getProperties(signal) {
  return request("/properties", { signal });
}
export function getCarousel(signal, limit = 5) {
  const q = limit ? `?limit=${limit}` : "";
  return request(`/properties/carousel${q}`, { signal });
}
export function submitInquiry(data) {
  return request("/contact/submit", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
