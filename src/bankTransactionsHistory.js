document.addEventListener("DOMContentLoaded", function () {
  const tbody = document.getElementById("tbody");
  const sortByElem = document.getElementById("sortBy");
  const filterPeriodElem = document.getElementById("filterPeriod");

  // Initial data container for transactions
  let transactionsData = [];

  // Function to fetch transactions from the API (GET method)
  async function fetchTransactions() {
    try {
      // Making a GET request to the API
      const response = await fetch("/api/transactions/getAll", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (response.ok) {
        transactionsData = data.transactions || [];
        displayTransactions();
      } else {
        console.error("Error fetching transactions:", data.error);
        // You can display an error message to the user here
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }

  // Function to filter transactions by period
  function filterByPeriod(period) {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset to midnight to ignore time

    return transactionsData.filter((transaction) => {
      const transactionDate = new Date(transaction.transaction_date);
      const diffInDays = (now - transactionDate) / (1000 * 3600 * 24);

      // If the selected period is 'all', include all transactions
      if (period === "all") return true;

      // Filter by selected period (7, 30, 90 days)
      return diffInDays <= period;
    });
  }

  // Function to sort transactions by type or date
  function sortTransactions(sortBy) {
    return transactionsData.sort((a, b) => {
      if (sortBy === "type") {
        return a.type.localeCompare(b.type); // Sort by type
      } else if (sortBy === "date") {
        const dateA = new Date(a.transaction_date);
        const dateB = new Date(b.transaction_date);
        return dateB - dateA; // Sort by date, descending
      }
    });
  }

  // Function to safely parse date
  function parseDate(dateString) {
    const parsedDate = new Date(dateString);

    // Check if the date is valid
    if (isNaN(parsedDate)) {
      console.error("Invalid Date:", dateString);
      return new Date(); // Return current date if invalid
    }

    return parsedDate;
  }

  // Display the transactions in the table
  function displayTransactions() {
    // Filter transactions based on the selected period
    const filteredTransactions = filterByPeriod(filterPeriodElem.value);

    // Sort transactions based on the selected sort option
    const sortedTransactions = sortTransactions(sortByElem.value);

    // Clear current content in the table body
    tbody.innerHTML = "";

    if (filteredTransactions.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="4" class="text-center">No data available for the selected period</td></tr>';
    } else {
      sortedTransactions.forEach((transaction) => {
        // Display transaction if it is in the filtered period
        if (filteredTransactions.includes(transaction)) {
          const row = document.createElement("tr");

          // Create cells for date, type, amount, and balance
          const dateCell = document.createElement("td");
          const transactionDate = parseDate(transaction.transaction_date);
          dateCell.textContent = transactionDate.toLocaleDateString(); // Format date as you need

          const typeCell = document.createElement("td");
          typeCell.textContent = transaction.type;

          const amountCell = document.createElement("td");

          // Debugging: Log the transaction data and check type and amount
          console.log("Transaction type:", transaction.type);
          console.log("Transaction amount:", transaction.amount);

          // Check if transaction type is either 'Dépôt' or 'Retrait' and set amount
          if (transaction.type === "Dépôt") {
            amountCell.textContent = `+€${transaction.amount.toFixed(2)}`;
            amountCell.style.color = "green";
          } else if (transaction.type === "Retrait") {
            amountCell.textContent = `-€${transaction.amount.toFixed(2)}`;
            amountCell.style.color = "red";
          } else {
            console.error("Unexpected transaction type:", transaction.type);
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
        }
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
