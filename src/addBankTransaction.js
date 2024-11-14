document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("transactionForm");
  const amountInput = document.getElementById("amount");
  const typeSelect = document.getElementById("type");
  const currentDate = new Date();

  let day = currentDate.getDate();
  let month = currentDate.getMonth() + 1;
  let year = currentDate.getFullYear();

  // This arrangement can be altered based on how we want the date's format to appear.
  let formattedCurrentDate = `${year}-${month}-${day}`;
  document.getElementById("date").value = formattedCurrentDate;
  const date = document.getElementById("date").value;
  const errorContainer = document.createElement("div");
  errorContainer.className = "mb-4 text-red-600";
  form.insertBefore(
    errorContainer,
    form.querySelector(".flex.justify-between"),
  );

  // Get the account ID from the URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const accountId = urlParams.get("id"); // Fetch the `id` from the URL parameters

  fetch('api/accounts/getById?accountId=' + accountId, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })
    .then(response => response.json())
    .then(data => {
      if (data) {
        form.addEventListener("submit", async function (e) {
          e.preventDefault();
          let errors = [];
          // Validate amount
          const amount = parseFloat(amountInput.value);
          if (isNaN(amount) || amount <= 0) {
            errors.push("Le montant doit être un nombre positif.");
          }

          if ((amount > data.account.balance) && typeSelect.value == "withdrawal") {
            errors.push("Vous ne pouvez pas retirer plus que ce que vous avez en solde."+" Solde actuel: "+data.account.balance+",00 €");
          }

          // Display errors or proceed
          if (errors.length > 0) {
            errorContainer.innerHTML = errors.join("<br>");
          } else {
            errorContainer.innerHTML = ""; // Clear previous errors

            let amountByType = 0;
            if (typeSelect.value == "deposit") amountByType = amount;
            else if (typeSelect.value == "withdrawal") amountByType = (amount * (-1));

            // Prepare the data to send
            const transactionData = {
              type: typeSelect.value,
              amount: amountByType,
              accountId: accountId,
              transaction_date: date // Include the accountId from the URL
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
                if (((data.account.balance - amountByType) < data.account.lowsale) && typeSelect.value == "withdrawal") localStorage.setItem("warningMessage", "Votre solde est inférieur au seuil défini. Veuillez recharger votre compte.");
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
        // Remplir le formulaire avec les données de l'utilisateur
      } else {
        console.error('Utilisateur non trouvé ou données manquantes');
      }
    })
    .catch(error => {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
    });
});
