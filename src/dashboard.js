document.addEventListener("DOMContentLoaded", function () {
  const tbody = document.getElementById("tbody");
  const totalBalanceElem = document.getElementById("totalBalance");
  const deleteModal = document.getElementById("deleteModal");
  const cancelDeleteBtn = document.getElementById("cancelDelete");
  const confirmDeleteBtn = document.getElementById("confirmDelete");
  let accountsData = [];

  // Fetch account data from the API
  async function fetchAccountsData() {
    try {
      const response = await fetch("/api/accounts/getAll");
      if (!response.ok) {
        throw new Error("Failed to fetch accounts data");
      }
      const data = await response.json();

      // Check if the response contains the accounts array
      accountsData = data.accounts || []; // Use data.accounts if it exists, otherwise an empty array

      displayAccounts();
      updateTotalBalance();
    } catch (error) {
      console.error("Error fetching accounts:", error);
      tbody.innerHTML =
        '<tr><td colspan="5" class="text-center">Erreur lors de la récupération des données</td></tr>';
    }
  }

  // Function to calculate and update the total balance
  function updateTotalBalance() {
    const totalBalance = accountsData.reduce(
      (acc, account) => acc + account.balance,
      0,
    );
    totalBalanceElem.textContent = `${totalBalance.toFixed(2)} €`;
  }

  // Display accounts in the table
  function displayAccounts() {
    tbody.innerHTML = ""; // Clear current content
    if (accountsData.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="5" class="text-center">Pas de donnée actuellement</td></tr>';
    } else {
      accountsData.forEach((account) => {
        const row = document.createElement("tr");

        // Account name
        const nameCell = document.createElement("td");
        nameCell.className = "px-6 py-3";
        nameCell.textContent = account.name;

        const typeCell = document.createElement("td");
        typeCell.className = "px-6 py-3";
        typeCell.textContent = formattedType(account.type);

        // Low sale
        const lowSaleCell = document.createElement("td");
        lowSaleCell.className = "px-6 py-3 text-right";
        lowSaleCell.textContent = `${account.lowsale} €`;

        // Current balance
        const balanceCell = document.createElement("td");
        balanceCell.className = "px-6 py-3 text-right";
        balanceCell.textContent = `${account.balance.toFixed(2)} €`;

        // Account type

                // Actions
                const actionsCell = document.createElement("td");
                actionsCell.className = "px-6 py-3";
                actionsCell.innerHTML = `
                    <a href="/history?id=${account.id}" 
                        class="text-[#008250] hover:text-[#006B3C]" 
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
        row.appendChild(typeCell);
        row.appendChild(balanceCell);
        row.appendChild(lowSaleCell);
        row.appendChild(actionsCell);

        tbody.appendChild(row);
      });
    }
  }

  // Open delete confirmation modal
  window.openDeleteModal = function (accountId) {
    deleteModal.classList.remove("hidden"); // Show the modal
    confirmDeleteBtn.onclick = function () {
      deleteAccount(accountId);
      deleteModal.classList.add("hidden"); // Hide the modal after confirmation
    };
    cancelDeleteBtn.onclick = function () {
      deleteModal.classList.add("hidden"); // Hide the modal after canceling
    };
  };

  function formattedType(type){
    let formattedType = ""
    if(type == "epargne") formattedType="Épargne";
    if(type == "courant") formattedType="Courant";
    return formattedType;
  }

  // Delete an account and update the total balance
  async function deleteAccount(accountId) {
    try {
      // Send POST request to the API to delete the account
      const response = await fetch("/api/accounts/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accountId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      // If successful, remove the account from the accountsData array
      accountsData = accountsData.filter((account) => account.id !== accountId);
      displayAccounts();
      updateTotalBalance();
    } catch (error) {
      console.error("Error deleting account:", error);
      // You can also show an error message to the user if you like
    }
  }

  // Initialize the display
  fetchAccountsData();
});
