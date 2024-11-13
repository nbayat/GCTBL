document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("transactionForm");
  const amountInput = document.getElementById("amount");
  const typeSelect = document.getElementById("type");
  const errorContainer = document.createElement("div");
  errorContainer.className = "mb-4 text-red-600";
  form.insertBefore(
    errorContainer,
    form.querySelector(".flex.justify-between"),
  );

  // Get the account ID from the URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const accountId = urlParams.get("id"); // Fetch the `id` from the URL parameters

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    let errors = [];

    // Validate amount
    const amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount <= 0) {
      errors.push("Le montant doit être un nombre positif.");
    }

    // Display errors or proceed
    if (errors.length > 0) {
      errorContainer.innerHTML = errors.join("<br>");
    } else {
      errorContainer.innerHTML = ""; // Clear previous errors

      // Prepare the data to send
      const transactionData = {
        type: typeSelect.value,
        amount: amount,
        accountId: accountId, // Include the accountId from the URL
      };

      try {
        // Make the API call to add the transaction
        const response = await fetch("/api/transactions/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(transactionData),
        });

        if (response.ok) {
          // Redirect to /history?id=3
          window.location.href = "/history?id=" + accountId;
        } else {
          // Display error message if the API call fails
          errorContainer.innerHTML =
            "Erreur lors de l'ajout de la transaction.";
        }
      } catch (error) {
        errorContainer.innerHTML = "Erreur de connexion au serveur.";
      }
    }
  });
});
