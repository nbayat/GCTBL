document.addEventListener("DOMContentLoaded", function () {
    const tbody = document.getElementById("tbody");
    const titleElem = document.querySelector("h2"); // Sélectionner le titre de la page
    const accountId = new URLSearchParams(window.location.search).get("id"); // Récupérer l'accountId depuis l'URL

    // Exemple de données (à remplacer par une source réelle, comme une API ou un stockage)
    const transactionsData = {
        1: [
            { date: "2024-10-01", type: "Dépôt", amount: 500, balance: 2000 },
            { date: "2024-10-05", type: "Retrait", amount: 100, balance: 1900 }
        ],
        2: [
            { date: "2024-09-15", type: "Dépôt", amount: 1000, balance: 3500 },
            { date: "2024-09-20", type: "Retrait", amount: 200, balance: 3300 }
        ]
    };

    // Fonction pour afficher l'historique des transactions
    function displayTransactions() {
        tbody.innerHTML = ""; // Effacer le contenu actuel

        const accountTransactions = transactionsData[accountId] || [];

        if (accountTransactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">Aucune transaction trouvée</td></tr>';
        } else {
            accountTransactions.forEach(transaction => {
                const row = document.createElement("tr");

                const dateCell = document.createElement("td");
                dateCell.className = "px-6 py-3";
                dateCell.textContent = transaction.date;

                const typeCell = document.createElement("td");
                typeCell.className = "px-6 py-3";
                typeCell.textContent = transaction.type;

                const amountCell = document.createElement("td");
                amountCell.className = "px-6 py-3";
                amountCell.textContent = `€${transaction.amount.toFixed(2)}`;

                const balanceCell = document.createElement("td");
                balanceCell.className = "px-6 py-3";
                balanceCell.textContent = `€${transaction.balance.toFixed(2)}`;

                row.appendChild(dateCell);
                row.appendChild(typeCell);
                row.appendChild(amountCell);
                row.appendChild(balanceCell);

                tbody.appendChild(row);
            });
        }
    }

    // Fonction pour changer le titre de la page en fonction du compte
    function updateTitle() {
        const account = accountsData.find(account => account.id == accountId); // Trouver le compte par ID
        if (account) {
            titleElem.textContent = `Historique des transactions de ${account.name}`;
        } else {
            titleElem.textContent = "Historique des transactions";
        }
    }

    // Récupérer les données du compte pour changer le titre
    const accountsData = [
        { id: 1, name: "Compte Principal" },
        { id: 2, name: "Compte Épargne" }
    ];

    // Mettre à jour le titre et afficher les transactions
    updateTitle();
    displayTransactions();
});
