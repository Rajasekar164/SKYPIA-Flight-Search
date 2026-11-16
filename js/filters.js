
// Filter flights by price and stops

export function filterFlights(flights, maxPrice, nonStopOnly) {

    return flights.filter((flight) => {

        // Keep flights with missing prices for testing
        const matchesPrice = !Number.isFinite(flight.price)
            || flight.price <= maxPrice;

        // Check non-stop condition
        const matchesStops = nonStopOnly
            ? flight.stops === 0
            : true;

        return matchesPrice && matchesStops;

    });

}


// Sort flights by price

export function sortFlights(flights, sortOrder) {

    const sortedFlights = [...flights];

    if (sortOrder === "cheapest") {

        sortedFlights.sort((a, b) => {

            // Flights without prices go to the bottom
            if (!Number.isFinite(a.price)) return 1;
            if (!Number.isFinite(b.price)) return -1;

            return a.price - b.price;

        });

    }

    return sortedFlights;

}
