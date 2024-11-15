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
        else if (data.connections.length < 1) {
            tbody.innerHTML =
                '<tr><td colspan="3" class="text-center">Pas de session actuellement</td></tr>';
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

var firstnameLoaded = "";
var lastnameLoaded = "";
var emailLoaded = "";

function loadUserData() {
    showLoader();
    fetch('/api/user', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.user && data.user.nom && data.user.email) {
                // Remplir le formulaire avec les données de l'utilisateur
                firstnameLoaded = data.user.nom.split(' ')[1];
                lastnameLoaded = data.user.nom.split(' ')[0];
                emailLoaded = data.user.email;
                document.getElementById('firstname').value = firstnameLoaded;
                document.getElementById('lastname').value = lastnameLoaded;
                document.getElementById('email').value = emailLoaded;
            } else {
                console.error('Utilisateur non trouvé ou données manquantes');
            }
            hideLoader();
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des données utilisateur:', error);
            hideLoader();
        });
}

// Appeler la fonction pour charger les données au chargement de la page
document.addEventListener("DOMContentLoaded", loadUserData);

// Gérer la soumission du formulaire pour mettre à jour les informations
function editData(event) {
    showLoader();
    event.preventDefault(); // Empêche le rafraîchissement de la page

    const firstname = document.getElementById('firstname').value;
    const lastname = document.getElementById('lastname').value;
    const email = document.getElementById('email').value;

    // Envoi de la requête PUT pour mettre à jour les informations
    fetch('/api/user/update', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            firstname: firstname,
            lastname: lastname,
            email: email,
        }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Optionnellement, recharger les données utilisateur
                if (firstnameLoaded != firstname || lastnameLoaded != lastname || emailLoaded != email) {
                    document.getElementById("notification-message").textContent = "Vos informations personnelles ont bien été modifiées.";
                    notification.classList.remove("hidden");
                    setTimeout(closeNotification, 4000);
                    loadUserData();
                }
            } else {
                alert("L'email est déjà utilisé.");
            }
            hideLoader();
        })
        .catch(error => {
            console.error('Erreur lors de la mise à jour des informations utilisateur:', error);
            hideLoader();
        });
}
function reload() {
    window.location.reload();
}

function closeNotification() {
    document.getElementById("notification").classList.add("hidden");
}

function changePassword(event) {
    event.preventDefault();

    const currentPassword = document.getElementById('password').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    if (newPassword !== confirmNewPassword) {
        alert("Les nouveaux mots de passe ne correspondent pas.");
        return;
    }

    fetch('/api/user/updatePassword', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
    })
        .then(showLoader())
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Mot de passe modifié avec succès.");
            } else {
                alert("Erreur: " + data.error);
            }
            hideLoader();
        })
        .catch(error => { console.error("Erreur:", error); hideLoader(); });
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