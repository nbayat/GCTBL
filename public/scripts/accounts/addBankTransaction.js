document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("transactionForm");
  const amountInput = document.getElementById("amount");
  const typeSelect = document.getElementById("type");
  const dateInput = document.getElementById("date");
  const errorContainer = document.createElement("div");

  errorContainer.className = "mb-4 text-red-600";
  form.insertBefore(
    errorContainer,
    form.querySelector(".flex.justify-between"),
  );

  const urlParams = new URLSearchParams(window.location.search);
  const accountId = urlParams.get("id");

  fetch("api/accounts/getById?accountId=" + accountId, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data) {
        form.addEventListener("submit", async function (e) {
          e.preventDefault();
          let errors = [];

          const amount = parseFloat(amountInput.value);
          if (isNaN(amount) || amount <= 0) {
            errors.push("Le montant doit être un nombre positif.");
          }

          if ((amount > data.account.balance) && typeSelect.value == "withdrawal") {
            errors.push("Vous ne pouvez pas retirer plus que ce que vous avez en solde." + " Solde actuel: " + data.account.balance + ",00 €");
          }

          // Display errors or proceed
          if (errors.length > 0) {
            errorContainer.innerHTML = errors.join("<br>");
          } else {
            errorContainer.innerHTML = "";

            const amountByType =
              typeSelect.value === "withdrawal" ? -amount : amount;

            const transactionData = {
              type: typeSelect.value,
              amount: amountByType,
              accountId: accountId,
              transaction_date: dateInput.value,
            };

            try {
              const response = await fetch("/api/transactions/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(transactionData),
              });

              if (response.ok) {
                if (((data.account.balance - amountByType) < data.account.lowsale) && typeSelect.value == "withdrawal") {
                  localStorage.setItem("warningMessage", "Votre solde est inférieur au seuil défini. Veuillez recharger votre compte.");
                }
                window.location.href = "/history?id=" + accountId;
              } else {
                errorContainer.innerHTML =
                  "Erreur lors de l'ajout de la transaction.";
              }
            } catch (error) {
              errorContainer.innerHTML = "Erreur de connexion au serveur.";
            }
          }
        });
      } else {
        console.error("Utilisateur non trouvé ou données manquantes");
      }
    })
    .catch((error) => {
      console.error(
        "Erreur lors de la récupération des données utilisateur:",
        error,
      );
    });
});
