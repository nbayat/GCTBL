document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("transactionForm");
    const amountInput = document.getElementById("amount");
    const errorContainer = document.createElement("div");
    errorContainer.className = "mb-4 text-red-600 dark:text-red-400";
    form.insertBefore(errorContainer, form.querySelector(".flex.justify-between"));

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        let errors = [];

        // Validation du montant
        const amount = parseFloat(amountInput.value);
        if (isNaN(amount) || amount <= 0) {
            errors.push("Le montant doit être un nombre positif.");
        }

        // Afficher les erreurs ou rediriger si tout est valide
        if (errors.length > 0) {
            errorContainer.innerHTML = errors.join("<br>");
        } else {
            errorContainer.innerHTML = ""; // Effacer les erreurs précédentes
            window.location.href = "dashboard.html"; // Redirection vers le tableau de bord
        }
    });
});
