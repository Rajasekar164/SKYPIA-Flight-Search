
// Get saved wishlist from Local Storage

export function getWishlist() {

    return JSON.parse(localStorage.getItem("wishlist")) || [];

}


// Add or remove a flight from wishlist

export function toggleWishlist(flightId) {

    let wishlist = getWishlist();

    if (wishlist.includes(flightId)) {

        wishlist = wishlist.filter((id) => id !== flightId);

    } else {

        wishlist.push(flightId);

    }

    localStorage.setItem("wishlist", JSON.stringify(wishlist));

    return wishlist;

}


// Check whether a flight is saved

export function isWishlisted(flightId) {

    return getWishlist().includes(flightId);

}
