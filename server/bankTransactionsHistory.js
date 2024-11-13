document.addEventListener("DOMContentLoaded", function () {
    const tbody = document.getElementById("tbody");
    const sortByElem = document.getElementById("sortBy");
    const filterPeriodElem = document.getElementById("filterPeriod");

    // Exemple de données de transactions
    let transactionsData = [
        { date: "2024-11-10", type: "Dépôt", amount: 500, balance: 3000 },
        { date: "2024-11-05", type: "Retrait", amount: 200, balance: 2800 },
        { date: "2024-10-25", type: "Dépôt", amount: 1000, balance: 3800 },
        { date: "2024-11-01", type: "Retrait", amount: 150, balance: 3650 }
    ];

    // Fonction pour filtrer les transactions par période
    function filterByPeriod(period) {
        const now = new Date();
        now.setHours(0, 0, 0, 0);  // Remettre à minuit pour ignorer l'heure

        return transactionsData.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            const diffInDays = (now - transactionDate) / (1000 * 3600 * 24);

            // Si la période sélectionnée est 'all', toutes les transactions sont incluses
            if (period === 'all') return true;

            // Filtrer par la période sélectionnée (7, 30, 90 jours)
            return diffInDays <= period;
        });
    }

    // Fonction pour trier les transactions par type ou date
    function sortTransactions(sortBy) {
        return transactionsData.sort((a, b) => {
            if (sortBy === 'type') {
                return a.type.localeCompare(b.type); // Tri par type
            } else if (sortBy === 'date') {
                return new Date(b.date) - new Date(a.date); // Tri par date
            }
        });
    }

    // Afficher les transactions
    function displayTransactions() {
        // Filtrer les transactions selon la période sélectionnée
        const filteredTransactions = filterByPeriod(filterPeriodElem.value);

        // Trier les transactions selon le critère sélectionné
        const sortedTransactions = sortTransactions(sortByElem.value);

        // Affichage des transactions dans le tableau
        tbody.innerHTML = ""; // Effacer le contenu actuel
        if (filteredTransactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">Pas de données pour la période sélectionnée</td></tr>';
        } else {
            sortedTransactions.forEach(transaction => {
                // Si la transaction est dans la période filtrée, l'afficher
                if (filteredTransactions.includes(transaction)) {
                    const row = document.createElement("tr");

                    const dateCell = document.createElement("td");
                    dateCell.textContent = transaction.date;

                    const typeCell = document.createElement("td");
                    typeCell.textContent = transaction.type;

                    const amountCell = document.createElement("td");

                    // Ajouter signe + ou - et colorer le montant
                    if (transaction.type === "Dépôt") {
                        amountCell.textContent = `+€${transaction.amount.toFixed(2)}`;
                        amountCell.style.color = "green";
                    } else if (transaction.type === "Retrait") {
                        amountCell.textContent = `-€${transaction.amount.toFixed(2)}`;
                        amountCell.style.color = "red";
                    }

                    const balanceCell = document.createElement("td");
                    balanceCell.textContent = `€${transaction.balance.toFixed(2)}`;

                    row.appendChild(dateCell);
                    row.appendChild(typeCell);
                    row.appendChild(amountCell);
                    row.appendChild(balanceCell);

                    tbody.appendChild(row);
                }
            });
        }
    }

    // Définir la valeur de tri par défaut à "date"
    sortByElem.value = 'date';
    filterPeriodElem.value = 'all';  // Afficher toutes les transactions par défaut

    // Mettre à jour l'affichage lorsque l'utilisateur change le filtre ou le tri
    sortByElem.addEventListener("change", displayTransactions);
    filterPeriodElem.addEventListener("change", displayTransactions);

    // Initialisation de l'affichage
    displayTransactions();
});
