document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const accountNameInput = document.getElementById("accountName");
    const lowSaleInput = document.getElementById("lowSale");
    const balanceInput = document.getElementById("balance"); // Ajout du champ solde
    const errorContainer = document.createElement("div");
    errorContainer.className = "mb-4 text-red-600 dark:text-red-400";
    form.insertBefore(errorContainer, form.querySelector(".flex.justify-between"));

    form.addEventListener("submit", function (e) {
        e.preventDefault();
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

        // Afficher les erreurs ou rediriger si tout est valide
        if (errors.length > 0) {
            errorContainer.innerHTML = errors.join("<br>");
        } else {
            errorContainer.innerHTML = ""; // Effacer les erreurs précédentes
            window.location.href = "dashboard.html"; // Redirection vers le tableau de bord
        }
    });
});