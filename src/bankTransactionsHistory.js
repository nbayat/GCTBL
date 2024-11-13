document.addEventListener("DOMContentLoaded", function () {
  const tbody = document.getElementById("tbody");
  const sortByElem = document.getElementById("sortBy");
  const filterPeriodElem = document.getElementById("filterPeriod");

  // Function to fetch transactions from the API
  async function fetchTransactions() {
    try {
      const response = await fetch("/api/transactions/getAll", {
        method: "GET", // Change this to GET if your API uses GET method
        headers: {
          "Content-Type": "application/json",
          // Add other headers here if needed (like Authorization if required)
        },
        // Include additional body if needed (e.g., for POST requests)
      });

      // Check if the response is ok (status 200-299)
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      // Parse the response as JSON
      const data = await response.json();

      console.log(data);

      // Return the list of transactions
      return data.transactions || [];
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return []; // Return empty array on error
    }
  }

  // Function for filtering transactions by period
  function filterByPeriod(transactions, period) {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to midnight to ignore time part

    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      const diffInDays = (now - transactionDate) / (1000 * 3600 * 24);

      // If the period is 'all', include all transactions
      if (period === "all") return true;

      // Filter by selected period (7, 30, 90 days)
      return diffInDays <= period;
    });
  }

  // Function to sort transactions by type or date
  function sortTransactions(transactions, sortBy) {
    return transactions.sort((a, b) => {
      if (sortBy === "type") {
        return a.type.localeCompare(b.type); // Sort by type
      } else if (sortBy === "date") {
        return new Date(b.date) - new Date(a.date); // Sort by date
      }
    });
  }

  // Function to display transactions in the table
  async function displayTransactions() {
    // Fetch the transactions from the API
    const transactionsData = await fetchTransactions();

    // Filter transactions according to the selected period
    const filteredTransactions = filterByPeriod(
      transactionsData,
      filterPeriodElem.value,
    );

    // Sort the transactions based on the selected criteria
    const sortedTransactions = sortTransactions(
      filteredTransactions,
      sortByElem.value,
    );

    // Clear the existing table contents
    tbody.innerHTML = "";

    if (sortedTransactions.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="4" class="text-center">Pas de données pour la période sélectionnée</td></tr>';
    } else {
      sortedTransactions.forEach((transaction) => {
        const row = document.createElement("tr");

        const dateCell = document.createElement("td");
        dateCell.textContent = transaction.date;

        const typeCell = document.createElement("td");
        typeCell.textContent = transaction.type;

        const amountCell = document.createElement("td");

        // Add sign (+ or -) and color the amount
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
      });
    }
  }

  // Set the default sort value to "date"
  sortByElem.value = "date";
  filterPeriodElem.value = "all"; // Show all transactions by default

  // Update the display when the user changes the sort or filter
  sortByElem.addEventListener("change", displayTransactions);
  filterPeriodElem.addEventListener("change", displayTransactions);

  // Initialize the display
  displayTransactions();
});
