
import { fetchFlights } from "./api.js";

import {
    filterFlights,
    sortFlights
} from "./filters.js";

import {
    getWishlist,
    toggleWishlist,
    isWishlisted
} from "./wishlist.js";


// =========================================
// 1. GET HTML ELEMENTS
// =========================================

const flightList = document.getElementById("flight-list");
const loading = document.getElementById("loading");
const errorMessage = document.getElementById("error");
const emptyState = document.getElementById("empty-state");

const searchForm = document.getElementById("search-form");
const retryButton = document.getElementById("retry-button");

const priceFilter = document.getElementById("price-filter");
const priceValue = document.getElementById("price-value");

const nonstopFilter = document.getElementById("nonstop-filter");
const sortFilter = document.getElementById("sort-filter");

const wishlistList = document.getElementById("wishlist-list");
const resetFilters = document.getElementById("reset-filters");


// =========================================
// 2. STORE FLIGHT DATA
// =========================================

let allFlights = [];
let searchResults = [];
let currentDisplayedFlights = [];


// =========================================
// 3. CREATE FLIGHT CARD
// =========================================

function createFlightCard(flight) {

    const card = document.createElement("article");
    card.className = "flight-card";


    // Airline details
    const airlineBox = document.createElement("div");
    airlineBox.className = "flight-airline";

    const airline = document.createElement("h3");
    airline.textContent = flight.airline;

    const flightNumber = document.createElement("p");
    flightNumber.textContent =
        flight.flightNumber || "SKYPIA Flight";

    airlineBox.append(airline, flightNumber);


    // Departure details
    const departureBox = document.createElement("div");
    departureBox.className = "flight-time";

    const departure = document.createElement("strong");
    departure.textContent = flight.departure;

    const from = document.createElement("span");
    from.textContent = flight.from;

    departureBox.append(departure, from);


    // Route details
    const routeBox = document.createElement("div");
    routeBox.className = "flight-route";

    const duration = document.createElement("span");
    duration.textContent = flight.duration || "Flight route";

    const routeLine = document.createElement("div");
    routeLine.className = "route-line";

    const stops = document.createElement("span");

    stops.textContent = flight.stops === 0
        ? "Non-stop"
        : `${flight.stops} stop(s)`;

    routeBox.append(duration, routeLine, stops);


    // Arrival details
    const arrivalBox = document.createElement("div");
    arrivalBox.className = "flight-time";

    const arrival = document.createElement("strong");
    arrival.textContent = flight.arrival;

    const to = document.createElement("span");
    to.textContent = flight.to;

    arrivalBox.append(arrival, to);


    // Price details
    const priceBox = document.createElement("div");
    priceBox.className = "flight-price";

    const price = document.createElement("strong");

    price.textContent = Number.isFinite(flight.price)
        ? `₹${flight.price.toLocaleString("en-IN")}`
        : "Price unavailable";

    const priceNote = document.createElement("p");

    priceNote.textContent = Number.isFinite(flight.price)
        ? "Per passenger"
        : "Fare not available";

    priceBox.append(price, priceNote);


    // =====================================
    // BOOK NOW BUTTON
    // =====================================

    const actions = document.createElement("div");
    actions.className = "flight-actions";

    const bookButton = document.createElement("button");

    bookButton.type = "button";
    bookButton.className = "book-button";
    bookButton.textContent = "BOOK NOW";

    // Disable booking when price is unavailable
    bookButton.disabled = !Number.isFinite(flight.price);

    bookButton.addEventListener("click", () => {

        alert(
            `Booking Details\n\n` +
            `Airline: ${flight.airline}\n` +
            `Route: ${flight.from} to ${flight.to}\n` +
            `Departure: ${flight.departure}\n` +
            `Arrival: ${flight.arrival}\n` +
            `Price: ${price.textContent}`
        );

    });


    // =====================================
    // WISHLIST BUTTON
    // =====================================

    const heartButton = document.createElement("button");

    heartButton.type = "button";
    heartButton.className = "wishlist-button";


    // Update wishlist button appearance
    function updateHeart() {

        const saved = isWishlisted(flight.id);

        heartButton.textContent = saved
            ? "♥ Saved"
            : "♡ Save";

        heartButton.classList.toggle("saved", saved);

        heartButton.setAttribute(
            "aria-pressed",
            String(saved)
        );

        heartButton.setAttribute(
            "aria-label",
            saved
                ? `Remove ${flight.airline} flight from wishlist`
                : `Save ${flight.airline} flight to wishlist`
        );

    }


    updateHeart();


    // Wishlist click event
    heartButton.addEventListener("click", () => {

        toggleWishlist(flight.id);

        // Refresh flight cards
        displayFlights(currentDisplayedFlights);

        // Refresh wishlist
        displayWishlist();

    });


    // Add buttons
    actions.append(bookButton, heartButton);


    // Add all elements to card
    card.append(
        airlineBox,
        departureBox,
        routeBox,
        arrivalBox,
        priceBox,
        actions
    );

    return card;

}


// =========================================
// 4. DISPLAY FLIGHTS
// =========================================

function displayFlights(flights) {

    currentDisplayedFlights = flights;

    flightList.replaceChildren();

    emptyState.hidden = flights.length !== 0;

    flights.forEach((flight) => {

        const card = createFlightCard(flight);

        flightList.appendChild(card);

    });

}


// =========================================
// 5. DISPLAY WISHLIST
// =========================================

function displayWishlist() {

    wishlistList.replaceChildren();

    const savedIds = getWishlist();

    const savedFlights = allFlights.filter((flight) =>
        savedIds.includes(flight.id)
    );


    // Empty wishlist message
    if (savedFlights.length === 0) {

        const message = document.createElement("p");

        message.textContent =
            "You haven't saved any flights yet.";

        wishlistList.appendChild(message);

        return;

    }


    // Display saved flights
    savedFlights.forEach((flight) => {

        const card = createFlightCard(flight);

        wishlistList.appendChild(card);

    });

}


// =========================================
// 6. APPLY FILTERS AND SORTING
// =========================================

function updateFlights() {

    const maxPrice = Number(priceFilter.value);

    const nonStopOnly = nonstopFilter.checked;

    const sortOrder = sortFilter.value;


    // Apply price and non-stop filters
    let filteredFlights = filterFlights(
        searchResults,
        maxPrice,
        nonStopOnly
    );


    // Apply sorting
    filteredFlights = sortFlights(
        filteredFlights,
        sortOrder
    );


    // Display filtered flights
    displayFlights(filteredFlights);


    // Update price label
    priceValue.textContent =
        maxPrice.toLocaleString("en-IN");

}


// =========================================
// 7. LOAD FLIGHT DATA
// =========================================

async function loadFlights() {

    loading.hidden = false;

    errorMessage.hidden = true;

    emptyState.hidden = true;

    flightList.replaceChildren();

    try {

        // Fetch flight data
        allFlights = await fetchFlights();

        // Initially show all flights
        searchResults = [...allFlights];

        // Apply filters and sorting
        updateFlights();

        // Display saved flights
        displayWishlist();

    } catch (error) {

        console.error("Flight loading error:", error);

        errorMessage.hidden = false;

    } finally {

        loading.hidden = true;

    }

}


// =========================================
// 8. SEARCH ONE-WAY FLIGHTS
// =========================================

searchForm.addEventListener("submit", (event) => {

    event.preventDefault();

    const from = document.getElementById("from")
        .value.trim().toUpperCase();

    const to = document.getElementById("to")
        .value.trim().toUpperCase();


    // Search original flight data
    searchResults = allFlights.filter((flight) => {

        return flight.from === from &&
               flight.to === to;

    });


    // Apply filters and sorting
    updateFlights();

    // Scroll to flight results
    document.getElementById("flight-results")
        .scrollIntoView({ behavior: "smooth" });

});


// =========================================
// 9. PRICE FILTER
// =========================================

priceFilter.addEventListener("input", () => {

    updateFlights();

});


// =========================================
// 10. NON-STOP FILTER
// =========================================

nonstopFilter.addEventListener("change", () => {

    updateFlights();

});


// =========================================
// 11. SORTING
// =========================================

sortFilter.addEventListener("change", () => {

    updateFlights();

});


// =========================================
// 12. RESET FILTERS
// =========================================

resetFilters.addEventListener("click", () => {

    priceFilter.value = priceFilter.max;

    nonstopFilter.checked = false;

    sortFilter.value = "cheapest";

    updateFlights();

});


// =========================================
// 13. RETRY BUTTON
// =========================================

retryButton.addEventListener("click", () => {

    loadFlights();

});


// =========================================
// 14. INITIALIZE APPLICATION
// =========================================

loadFlights();
