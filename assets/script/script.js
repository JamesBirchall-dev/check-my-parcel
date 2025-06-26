// Wait for the DOM to fully load before attaching event listeners
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("shipping-form");

  // Attach a submit event listener to the form
  form.addEventListener("submit", async function (e) {
    e.preventDefault(); // Prevent the default form submission behavior (page reload)

    // Get values from input fields
    const originPostcode = document.getElementById("origin-postcode").value.trim();
    const destinationCountry = document.getElementById("destination-country").value.trim().toUpperCase();
    const destinationPostcode = document.getElementById("destination-postcode").value.trim();

    // Get parcel dimensions and weight
    const weight = parseFloat(document.getElementById("weight").value); // in kilograms
    const length = parseInt(document.getElementById("length").value);   // in cm
    const width = parseInt(document.getElementById("width").value);     // in cm
    const height = parseInt(document.getElementById("height").value);   // in cm

    // Construct the request payload in the format expected by the Easyship API
    const requestData = {
      origin_country_alpha2: "UK", // You can change this or make it dynamic
      origin_postal_code: originPostcode,
      destination_country_alpha2: destinationCountry,
      destination_postal_code: destinationPostcode,
      tax_id: null, // Optional; not used in this example
      items: [
        {
          actual_weight: weight,             // in kg
          length: length,                    // in cm
          width: width,                      // in cm
          height: height,                    // in cm
          category: "package",               // Required field by Easyship
          declared_currency: "USD",          // Currency for customs value
          declared_customs_value: 100        // Default value; adjust as needed
        }
      ]
    };

    try {
      // Send the data to your backend server, which will forward it to Easyship API
      const response = await fetch("/get-shipping-rates", {
        method: "GET",
        headers: {
          "Content-Type": "application/json" // Tell the backend we're sending JSON
        },
        body: JSON.stringify(requestData)     // Convert JS object to JSON string
      });

      const data = await response.json(); // Parse the JSON response

      const resultsContainer = document.getElementById("results");

      // Check if rates are returned and display them
      if (data.rates && data.rates.length > 0) {
        resultsContainer.innerHTML = `
          <h4>Available Shipping Rates:</h4>
          <ul class="list-group">
            ${data.rates.map(rate => `
              <li class="list-group-item">
                <strong>${rate.courier_name}</strong> -
                ${rate.shipping_cost.amount} ${rate.shipping_cost.currency}
                (${rate.estimated_delivery_days} days)
              </li>
            `).join("")}
          </ul>
        `;
      } else {
        // Handle case when no rates are returned
        resultsContainer.innerHTML = `<p class="text-danger">No shipping rates available.</p>`;
      }
    } catch (error) {
      // Catch and display any error that occurred during the request
      console.error("Error fetching shipping rates:", error);
      document.getElementById("results").innerHTML = `
        <p class="text-danger">An error occurred while fetching shipping rates. Please try again later.</p>
      `;
    }
  });
});