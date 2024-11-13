document.addEventListener("DOMContentLoaded", function () {
    const tbody = document.getElementById("tbody");
    const totalBalanceElem = document.getElementById("totalBalance");
    const deleteModal = document.getElementById("deleteModal");
    const cancelDeleteBtn = document.getElementById("cancelDelete");
    const confirmDeleteBtn = document.getElementById("confirmDelete");
    let accountsData = [
        { id: 1, name: "Compte Principal", type: "Courant", lowSale: 500, balance: 1500, userId: 123 },
        { id: 2, name: "Compte Épargne", type: "Épargne", lowSale: 1000, balance: 2500, userId: 123 }
    ];

    // Fonction pour calculer le solde total
    function updateTotalBalance() {
        const totalBalance = accountsData.reduce((acc, account) => acc + account.balance, 0);
        totalBalanceElem.textContent = `€${totalBalance.toFixed(2)}`;
    }

    // Afficher les comptes bancaires dans le tableau
    function displayAccounts() {
        tbody.innerHTML = ""; // Effacer le contenu actuel
        if (accountsData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Pas de donnée actuellement</td></tr>';
        } else {
            accountsData.forEach(account => {
                const row = document.createElement("tr");

                // Nom du compte
                const nameCell = document.createElement("td");
                nameCell.className = "px-6 py-3";
                nameCell.textContent = account.name;

                // Bas solde
                const lowSaleCell = document.createElement("td");
                lowSaleCell.className = "px-6 py-3";
                lowSaleCell.textContent = `€${account.lowSale}`;

                // Solde actuel
                const balanceCell = document.createElement("td");
                balanceCell.className = "px-6 py-3";
                balanceCell.textContent = `€${account.balance.toFixed(2)}`;

                // Type de compte
                const typeCell = document.createElement("td");  // Nouvelle cellule
                typeCell.className = "px-6 py-3";
                typeCell.textContent = account.type;  // Afficher le type de compte (courant, épargne, etc.)

                // Actions
                const actionsCell = document.createElement("td");
                actionsCell.className = "px-6 py-3";
                actionsCell.innerHTML = `
                    <a href="bankTransactionsHistory.html?id=${account.id}" 
                        class="text-blue-600 hover:text-blue-800" 
                        title="Voir les transactions">
                        <i class="fas fa-history"></i>
                    </a>
                    <button class="text-red-600 hover:text-red-800 ml-4" 
                        title="Supprimer le compte" 
                        onclick="openDeleteModal(${account.id})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                `;

                row.appendChild(nameCell);
                row.appendChild(lowSaleCell);
                row.appendChild(balanceCell);
                row.appendChild(typeCell);  // Ajouter la cellule du type de compte
                row.appendChild(actionsCell);

                tbody.appendChild(row);
            });
        }
    }

    // Ouvrir la modale de confirmation de suppression
    window.openDeleteModal = function(accountId) {
        console.log("Ouverture de la modale pour le compte avec ID:", accountId);
        deleteModal.classList.remove("hidden"); // Retirer la classe hidden pour afficher la modale
        confirmDeleteBtn.onclick = function () {
            deleteAccount(accountId);
            deleteModal.classList.add("hidden"); // Cacher la modale après confirmation
        };
        cancelDeleteBtn.onclick = function () {
            console.log("Suppression annulée");
            deleteModal.classList.add("hidden"); // Cacher la modale après annulation
        };
    }

    // Supprimer un compte et mettre à jour le solde total
    function deleteAccount(accountId) {
        accountsData = accountsData.filter(account => account.id !== accountId);
        displayAccounts();
        updateTotalBalance();
    }

    // Initialiser l'affichage
    displayAccounts();
    updateTotalBalance();
});
