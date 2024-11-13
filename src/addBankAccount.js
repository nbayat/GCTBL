document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  const accountNameInput = document.getElementById("accountName");
  const lowSaleInput = document.getElementById("lowSale");
  const balanceInput = document.getElementById("balance");
  const typeAccountSelect = document.getElementById("typeAccount"); // New line to get the account type
  const errorContainer = document.createElement("div");
  errorContainer.className = "mb-4 text-red-600";
  form.insertBefore(
    errorContainer,
    form.querySelector(".flex.justify-between"),
  );

  form.addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent the default form submission
    let errors = [];

    // Validation du nom de compte
    const accountName = accountNameInput.value.trim();
    if (accountName.length < 6 || accountName.length > 35) {
      errors.push("Le nom de compte doit contenir entre 6 et 35 caractères.");
    }

    // Validation du bas solde
    const lowSale = parseFloat(lowSaleInput.value);
    if (isNaN(lowSale) || lowSale <= 0) {
      errors.push("Le bas solde doit être un nombre positif.");
    }

    // Validation du solde
    const balance = parseFloat(balanceInput.value);
    if (isNaN(balance) || balance < 0) {
      errors.push("Le solde doit être un nombre positif.");
    }

    // Validation du type de compte
    const accountType = typeAccountSelect.value;
    if (!accountType) {
      errors.push("Veuillez choisir un type de compte.");
    }

    // Afficher les erreurs ou procéder avec la requête AJAX
    if (errors.length > 0) {
      errorContainer.innerHTML = errors.join("<br>");
    } else {
      errorContainer.innerHTML = ""; // Clear previous errors

      // Create the data object to send in the request
      const accountData = {
        name: accountName,
        type: accountType, // Use the selected account type
        lowSale: lowSale,
        balance: balance,
      };

      // Send the data using Fetch API (AJAX)
      fetch("/api/account/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accountData), // Convert the object to JSON string
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data.message);
          if (data.message === "Account created successfully") {
            // Redirect to dashboard after successful account creation
            localStorage.setItem("successMessage", "Votre compte a été créé avec succès.");
            window.location.href = "/dashboard";
          } else {
            // Display error if account creation failed
            errorContainer.innerHTML = data.error || "Une erreur est survenue.";
          }
        })
        .catch((error) => {
          // Handle network or server errors
          console.error("Error:", error);
          errorContainer.innerHTML = "Une erreur réseau est survenue.";
        });
    }
  });
});
