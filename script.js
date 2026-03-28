/* =============================================
   WEATHER APP — script.js
   Uses: OpenWeather API · async/await · fetch
   ============================================= */


/* =============================================
   1. CONFIGURATION
   ============================================= */

// ⚠️  PASTE YOUR OPENWEATHER API KEY BELOW
// Get a free key at: https://openweathermap.org/api

// Base URL for current weather endpoint (metric = Celsius)
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// OpenWeather icon CDN (size: 2x for crisp display)
const ICON_BASE_URL = "https://openweathermap.org/img/wn/";


/* =============================================
   2. DOM ELEMENT REFERENCES
   Grab all the elements we'll need to update
   ============================================= */
const cityInput      = document.getElementById("cityInput");
const searchBtn      = document.getElementById("searchBtn");
const errorMsg       = document.getElementById("errorMsg");
const loadingSection = document.getElementById("loadingSection");
const resultSection  = document.getElementById("resultSection");
const bgLayer        = document.getElementById("bgLayer");

// Result display elements
const cityNameEl     = document.getElementById("cityName");
const countryCodeEl  = document.getElementById("countryCode");
const weatherIconEl  = document.getElementById("weatherIcon");
const tempValueEl    = document.getElementById("tempValue");
const conditionEl    = document.getElementById("conditionLabel");
const feelsLikeEl    = document.getElementById("feelsLike");
const humidityEl     = document.getElementById("humidity");
const windSpeedEl    = document.getElementById("windSpeed");
const visibilityEl   = document.getElementById("visibility");


/* =============================================
   3. EVENT LISTENERS
   ============================================= */

// Trigger search on button click
searchBtn.addEventListener("click", handleSearch);

// Also trigger on Enter key press inside the input
cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") handleSearch();
});


/* =============================================
   4. MAIN HANDLER — handleSearch()
   Called when user clicks the button or presses Enter
   ============================================= */
function handleSearch() {
  // Get city name and remove extra whitespace
  const cityName = cityInput.value.trim();

  // --- Edge case: empty input ---
  if (!cityName) {
    showError("Please enter a city name.");
    return;
  }

  // Clear any previous error and fetch weather
  clearError();
  fetchWeather(cityName);
}


/* =============================================
   5. API CALL — fetchWeather()
   Calls OpenWeather API using async/await + fetch
   ============================================= */
async function fetchWeather(cityName) {
  // Show loading spinner, hide previous results
  showLoading(true);

  try {
    // Build the request URL with query parameters
    const requestURL = `${BASE_URL}?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric`;

    // Make the API request (async/await pattern)
    const response = await fetch(requestURL);

    // --- Edge case: city not found (404) or unauthorized (401) ---
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Invalid API key. Please check your API key.");
      } else if (response.status === 404) {
        throw new Error(`City "${cityName}" not found. Please try again.`);
      } else {
        throw new Error(`Something went wrong (Error ${response.status}).`);
      }
    }

    // Parse the JSON response body
    const weatherData = await response.json();

    // Display the weather data on the page
    displayWeather(weatherData);

  } catch (error) {
    // Handle both network errors and thrown errors above
    showError(error.message || "Unable to fetch weather. Check your connection.");
    hideResults();

  } finally {
    // Always hide loader (runs whether success or error)
    showLoading(false);
  }
}


/* =============================================
   6. DISPLAY — displayWeather()
   Fills all result fields with data from the API
   ============================================= */
function displayWeather(data) {
  // --- Destructure needed fields from the API response ---
  const {
    name: city,
    sys: { country },
    main: { temp, feels_like, humidity },
    weather: [{ main: condition, description, icon }],
    wind: { speed: windSpeed },
    visibility,
  } = data;

  // --- Fill in city and country ---
  cityNameEl.textContent    = city;
  countryCodeEl.textContent = country;

  // --- Set weather icon from OpenWeather CDN ---
  weatherIconEl.src = `${ICON_BASE_URL}${icon}@2x.png`;
  weatherIconEl.alt = description;

  // --- Temperature (rounded to nearest integer) ---
  tempValueEl.textContent = Math.round(temp);

  // --- Condition (capitalize) and description ---
  conditionEl.textContent  = description;  // e.g. "light rain"
  feelsLikeEl.textContent  = `Feels like ${Math.round(feels_like)}°C`;

  // --- Extra stats ---
  humidityEl.textContent  = `${humidity}%`;
  windSpeedEl.textContent = `${Math.round(windSpeed)} m/s`;
  visibilityEl.textContent = visibility
    ? `${(visibility / 1000).toFixed(1)} km`
    : "N/A";

  // --- Show result section ---
  resultSection.removeAttribute("hidden");

  // --- Update dynamic background ---
  updateBackground(condition);
}


/* =============================================
   7. DYNAMIC BACKGROUND — updateBackground()
   Changes the gradient based on weather condition
   Condition strings from OpenWeather:
     Clear, Clouds, Rain, Drizzle, Snow,
     Thunderstorm, Mist, Fog, Haze, Smoke, etc.
   ============================================= */
function updateBackground(condition) {
  // List of all possible weather-condition classes
  const weatherClasses = [
    "weather-clear", "weather-clouds", "weather-rain",
    "weather-drizzle", "weather-snow", "weather-thunderstorm",
    "weather-mist", "weather-fog", "weather-haze",
  ];

  // Remove any previously set weather class
  bgLayer.classList.remove(...weatherClasses);

  // Build the new class name from condition (lowercase, prefixed)
  const newClass = `weather-${condition.toLowerCase()}`;

  // Apply it (CSS handles the gradient via the class — see style.css)
  bgLayer.classList.add(newClass);
}


/* =============================================
   8. UI STATE HELPERS
   Small utility functions to keep code clean
   ============================================= */

/** Show or hide the loading spinner section */
function showLoading(isLoading) {
  if (isLoading) {
    loadingSection.removeAttribute("hidden");
    resultSection.setAttribute("hidden", "");  // hide old results while loading
  } else {
    loadingSection.setAttribute("hidden", "");
  }
}

/** Display an error message below the input */
function showError(message) {
  errorMsg.textContent = message;

  // Re-trigger shake animation by cloning and replacing the element
  // (removes and re-adds the animation each time)
  errorMsg.style.animation = "none";
  errorMsg.offsetHeight;                 // force reflow (DOM trick)
  errorMsg.style.animation = "";
}

/** Clear the error message */
function clearError() {
  errorMsg.textContent = "";
}

/** Hide the result section (e.g. on error) */
function hideResults() {
  resultSection.setAttribute("hidden", "");
}
