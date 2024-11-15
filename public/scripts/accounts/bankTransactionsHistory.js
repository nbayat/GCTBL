document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const currentPageId = urlParams.get("id");

  // Find the "Ajouter une transaction" link and update its href attribute
  const addTransactionLink = document.querySelector('a[href="/transactions"]');
  if (addTransactionLink) {
    addTransactionLink.href = `/transactions?id=${currentPageId}`;
  }

  const tbody = document.getElementById("tbody");
  const sortByElem = document.getElementById("sortBy");
  const filterPeriodElem = document.getElementById("filterPeriod");

  // Initial data container for transactions
  let transactionsData = [];

  if (localStorage.getItem("warningMessage")) {
    document.getElementById("notification-message").textContent = localStorage.getItem("warningMessage");
    notification.classList.remove("hidden");
    setTimeout(closeNotification, 4000);
  }

  // Function to get URL parameter
  function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  // Function to fetch transactions from the API (POST method with accountId from URL)
  async function fetchTransactions() {
    showLoader();
    try {
      const accountId = getUrlParameter("id");
      if (!accountId) {
        console.error("No account ID provided in URL");
        return;
      }

      fetch("api/accounts/getById?accountId=" + accountId, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data) {
            document.getElementById("accountTitle").innerHTML = "Historique des transactions de " + data.account.name;
            document.getElementById("balance").innerHTML = "Solde : " + '<span class="font-semibold text-[#008250]">' + formatCurrency(data.account.balance) + '</span>';
            document.getElementById("lowSale").innerHTML = "Solde bas : " + '<span class="font-semibold text-[#008250]">' + formatCurrency(data.account.lowsale) + '</span>';
            // Remplir le formulaire avec les données de l'utilisateur
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

      const response = await fetch("/api/transactions/getAll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accountId }), // Send accountId in request body
      });

      const data = await response.json();

      if (response.ok) {
        transactionsData = data.transactions || [];
        displayTransactions();
      } else {
        console.error("Error fetching transactions:", data.error);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      hideLoader();
    }
  }

  // Download transactions as CSV

  // Function to filter transactions by period
  function filterByPeriod(transactions, period) {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset to midnight to ignore time

    if (period === "all") {
      return transactions;
    } else if (period === "7") {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      return transactions.filter((transaction) => {
        const transactionDate = parseDate(transaction.transaction_date);
        return transactionDate >= sevenDaysAgo;
      });
    } else if (period === "30") {
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      return transactions.filter((transaction) => {
        const transactionDate = parseDate(transaction.transaction_date);
        return transactionDate >= thirtyDaysAgo;
      });
    } else if (period === "90") {
      const ninetyDaysAgo = new Date(now);
      ninetyDaysAgo.setDate(now.getDate() - 90);
      return transactions.filter((transaction) => {
        const transactionDate = parseDate(transaction.transaction_date);
        return transactionDate >= ninetyDaysAgo;
      });
    }

    return transactions;
  }

  // Function to sort transactions by type or date
  function sortTransactions(transactions, sortBy) {
    return transactions.sort((a, b) => {
      if (sortBy === "type") {
        return a.type.localeCompare(b.type); // Sort by type
      } else if (sortBy === "date") {
        const dateA = new Date(a.transaction_date);
        const dateB = new Date(b.transaction_date);
        return dateB - dateA; // Sort by date, descending
      }
      return 0; // Default no sorting
    });
  }

  // Function to safely parse date
  function parseDate(dateString) {
    const parsedDate = new Date(dateString);
    if (isNaN(parsedDate)) {
      console.error("Invalid Date:", dateString);
      return new Date(); // Return current date if invalid
    }
    return parsedDate;
  }

  // Display the transactions in the table
  function displayTransactions() {
    const filteredTransactions = filterByPeriod(
      transactionsData,
      filterPeriodElem.value,
    );

    const sortedTransactions = sortTransactions(
      filteredTransactions,
      sortByElem.value,
    );

    // Clear current content in the table body
    tbody.innerHTML = "";

    if (sortedTransactions.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="4" class="text-center">Pas de transactions pour la période demandée.</td></tr>';
    } else {
      sortedTransactions.forEach((transaction) => {
        const row = document.createElement("tr");

        // Create cells for date, type, amount, and balance
        const dateCell = document.createElement("td");
        dateCell.className = "text-center";
        const transactionDate = parseDate(transaction.transaction_date);
        dateCell.textContent = transactionDate.toLocaleDateString(); // Format date as you need

        const typeCell = document.createElement("td");
        typeCell.className = "text-center font-semibold";
        let formattedType = "";
        if (transaction.type == "deposit") formattedType = "Dépôt";
        else if (transaction.type == "withdrawal") formattedType = "Retrait";
        typeCell.textContent = formattedType;

        const amountCell = document.createElement("td");
        amountCell.className = "text-right";

        // Check if transaction type is 'deposit' or 'withdrawal'
        if (transaction.type === "deposit") {
          amountCell.textContent = "+" + formatCurrency(transaction.amount);
          amountCell.style.color = "green";
        } else if (transaction.type === "withdrawal") {
          amountCell.textContent = "-" + formatCurrency(Math.abs(transaction.amount));
          amountCell.style.color = "red";
        } else {
          amountCell.textContent = `-`;
        }

        const balanceCell = document.createElement("td");
        balanceCell.className = "text-right";
        balanceCell.textContent = formatCurrency(transaction.balance);

        // Append cells to the row
        row.appendChild(dateCell);
        row.appendChild(typeCell);
        row.appendChild(amountCell);
        row.appendChild(balanceCell);

        // Append row to the table body
        tbody.appendChild(row);
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Récupérer les paramètres de l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');

    // Vérifie si le paramètre 'success' est présent dans l'URL
    if (success === 'true') {
      const notification = document.getElementById("notification");
      const notificationMessage = document.getElementById("notification-message");
      notificationMessage.textContent = "Le fichier CSV a été téléchargé avec succès!";
      notification.classList.remove("hidden");

      // Efface le paramètre de l'URL après 3 secondes
      setTimeout(() => {
        const url = new URL(window.location);
        url.searchParams.delete('success');
        window.history.replaceState({}, document.title, url);
      }, 3000);
    }
  });

  // Fonction pour fermer la notification
  function closeNotification() {
    document.getElementById("notification").classList.add("hidden");
  }


  function closeNotification() {
    document.getElementById("notification").classList.add("hidden");
    localStorage.clear();
  }
  // Set default sort and filter options
  sortByElem.value = "date";
  filterPeriodElem.value = "all"; // Show all transactions by default

  // Event listeners for sorting and filtering
  sortByElem.addEventListener("change", displayTransactions);
  filterPeriodElem.addEventListener("change", displayTransactions);

  // Initialize the display by fetching transactions
  fetchTransactions();
});

function formatCurrency(amount) {
  return amount.toFixed(2) // Formater en deux décimales
    .replace(/\d(?=(\d{3})+\.)/g, '$& ') // Ajouter un espace tous les trois chiffres avant le point
    .replace('.', ',') + ' €'; // Remplacer le point par une virgule et ajouter le symbole €
}

// Fonction pour afficher le loader
function showLoader() {
  const loader = document.getElementById("loader");
  loader.classList.remove("hidden");
}

// Fonction pour masquer le loader
function hideLoader() {
  const loader = document.getElementById("loader");
  loader.classList.add("hidden");
}

async function downloadCSV() {
  showLoader();
  try {
      // Get the 'id' parameter from the current URL
      const urlParams = new URLSearchParams(window.location.search);
      const accountId = urlParams.get("id");

      if (!accountId) {
          console.error("Account ID is missing in the URL");
          return;
      }

      // Call the API with the accountId as a query parameter
      const response = await fetch(
          `/api/transaction/account/csv?accountId=${accountId}`,
          {
              method: "GET",
          },
      );

      if (response.ok) {
          // Convert the response to a Blob for download
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);

          // Create a temporary anchor to initiate download
          const a = document.createElement("a");
          a.href = url;
          a.download = `transactions_${accountId}.csv`; // Set the desired file name here
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          // Show notification
          const notification = document.getElementById("notification");
          const notificationMessage = document.getElementById(
              "notification-message",
          );
          notificationMessage.textContent =
              "Le fichier CSV a été téléchargé avec succès!";
          notification.classList.remove("hidden");

          // Hide the notification after 3 seconds
          setTimeout(() => {
              notification.classList.add("hidden");
          }, 3000);
      } else {
          console.error("Error fetching transactions:", await response.text());
          // You can display an error message to the user here if necessary
      }
  } catch (error) {
      console.error("Fetch error:", error);
  } finally{
    hideLoader();
  }
}