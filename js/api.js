
// Fetch flight data from JSON file

export async function fetchFlights() {

    try {

        const response = await fetch("./data/flights.json");

        // Check whether the server response is successful
        if (!response.ok) {
            throw new Error("Unable to fetch flight data");
        }

        // Convert JSON response into JavaScript data
        const flights = await response.json();

        return flights;

    } catch (error) {

        console.error("API Error:", error);

        throw error;

    }

}
