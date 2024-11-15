document.addEventListener("DOMContentLoaded", async function () {
    const accountNameInput = document.getElementById("accountName");
    const typeAccountSelect = document.getElementById("typeAccount");
    const balanceInput = document.getElementById("balance");
    const lowSaleInput = document.getElementById("lowSale");
    const form = document.getElementById("editAccountForm");
    const pageTitle = document.getElementById("pageTitle");

    const urlParams = new URLSearchParams(window.location.search);
    const accountId = urlParams.get("id");

    if (!accountId) {
        alert("Compte introuvable");
        window.location.href = "/dashboard";
        return;
    }

    // Fonction pour récupérer et afficher les données du compte
    async function fetchAccountData() {
        try {
            const response = await fetch(`/api/accounts/getById?accountId=${accountId}`);
            if (!response.ok) throw new Error("Erreur lors de la récupération des données du compte.");

            const { account } = await response.json();

            // Mise à jour du titre et des valeurs par défaut des champs
            pageTitle.textContent = `Modification de ${account.name}`;
            accountNameInput.value = account.name;
            typeAccountSelect.value = account.type;
            balanceInput.value = account.balance;
            lowSaleInput.value = account.lowsale;
        } catch (error) {
            console.error(error);
            alert("Une erreur est survenue lors du chargement des données du compte.");
            window.location.href = "/dashboard";
        }
    }

    // Charger les données du compte
    await fetchAccountData();

    // Gestion de la soumission du formulaire
    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const updatedAccountData = {
            id: accountId,
            name: accountNameInput.value.trim(),
            type: typeAccountSelect.value,
            balance: parseFloat(balanceInput.value),
            lowSale: parseFloat(lowSaleInput.value)
        };

        try {
            const response = await fetch("/api/account/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedAccountData)
            });

            if (!response.ok) throw new Error("Erreur lors de la mise à jour du compte.");

            const data = await response.json();
            if (data.message === "Compte mis à jour avec succès") {
                localStorage.setItem("successMessage", "Votre compte a été modifiée avec succès.");
                window.location.href = "/dashboard";
            } else {
                alert(data.error || "Une erreur est survenue lors de la mise à jour.");
            }
        } catch (error) {
            console.error(error);
            alert("Erreur réseau lors de la mise à jour du compte.");
        }
    });
});
