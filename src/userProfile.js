// Create a new XMLHttpRequest to fetch the connection history data
var xhr = new XMLHttpRequest();
xhr.open('GET', 'http://localhost:3000/api/user/connections', true);

xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
        // Parse the response JSON
        var data = JSON.parse(xhr.responseText);
        var tbody = document.getElementById('tbody');

        // Check if there are at least two connections
        if (data.connections.length >= 2) {
            var lastIp = data.connections[0].ip_address;
            var secondLastIp = data.connections[1].ip_address;

            // Compare the last two IP addresses
            if (lastIp !== secondLastIp) {
                document.getElementById('ip-check-result').textContent = 'Attention : Les deux dernières adresses IP sont différentes.';
            }
        }

        // Loop through the connections and append rows to the table
        data.connections.forEach(function (connection) {
            var row = document.createElement('tr');

            // Format the date and time
            var date = new Date(connection.access_date);
            var formattedDate = date.toLocaleDateString('fr-FR');
            var formattedTime = connection.access_time;
            var ipAddress = connection.ip_address;

            // Create table cells
            var dateCell = document.createElement('td');
            dateCell.classList.add('px-6', 'py-3');
            dateCell.textContent = formattedDate;

            var timeCell = document.createElement('td');
            timeCell.classList.add('px-6', 'py-3');
            timeCell.textContent = formattedTime;

            var deviceCell = document.createElement('td');
            deviceCell.classList.add('px-6', 'py-3');
            deviceCell.textContent = ipAddress;

            // Append cells to the row
            row.appendChild(dateCell);
            row.appendChild(timeCell);
            row.appendChild(deviceCell);

            // Append the row to the table body
            tbody.appendChild(row);
        });
    }
};

// Send the request
xhr.send();