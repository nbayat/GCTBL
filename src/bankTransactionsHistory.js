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

  // Function to get URL parameter
  function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  // Function to fetch transactions from the API (POST method with accountId from URL)
  async function fetchTransactions() {
    try {
      const accountId = getUrlParameter("id");
      if (!accountId) {
        console.error("No account ID provided in URL");
        return;
      }

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
    }
  }

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
        '<tr><td colspan="4" class="text-center">No data available for the selected period</td></tr>';
    } else {
      sortedTransactions.forEach((transaction) => {
        const row = document.createElement("tr");

        // Create cells for date, type, amount, and balance
        const dateCell = document.createElement("td");
        const transactionDate = parseDate(transaction.transaction_date);
        dateCell.textContent = transactionDate.toLocaleDateString(); // Format date as you need

        const typeCell = document.createElement("td");
        typeCell.textContent = transaction.type;

        const amountCell = document.createElement("td");

        console.log("amount " + transaction.type);
        console.log(transaction);

        // Check if transaction type is 'deposit' or 'withdrawal'
        if (transaction.type === "deposit") {
          amountCell.textContent = `+€${transaction.amount}`;
          amountCell.style.color = "green";
        } else if (transaction.type === "withdrawal") {
          amountCell.textContent = `-€${transaction.amount}`;
          amountCell.style.color = "red";
        } else {
          amountCell.textContent = `-`;
        }

        const balanceCell = document.createElement("td");
        balanceCell.textContent = `€${transaction.balance.toFixed(2)}`;

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

  // Set default sort and filter options
  sortByElem.value = "date";
  filterPeriodElem.value = "all"; // Show all transactions by default

  // Event listeners for sorting and filtering
  sortByElem.addEventListener("change", displayTransactions);
  filterPeriodElem.addEventListener("change", displayTransactions);

  // Initialize the display by fetching transactions
  fetchTransactions();
});
