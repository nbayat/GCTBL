# Mina - Gestion de Comptes et Transactions Bancaires en Ligne

Ce projet est une application permettant aux utilisateurs de gérer leurs comptes et transactions bancaires en ligne. Elle inclut des fonctionnalités pour la création et gestion de comptes, l'affichage des transactions, et la sécurisation des informations utilisateur.

## Fonctionnalités

1. **Création d’un Compte Utilisateur**
   - Permet aux utilisateurs de créer un compte personnel avec des informations comme nom, email et mot de passe.
   - Critères d'acceptation : Validation des données et confirmation de création.
   - [S'inscrire](http://localhost:3000/register)

2. **Connexion et Déconnexion**
   - Authentification des utilisateurs via email et mot de passe.
   - Gestion des erreurs de connexion et déconnexion avec redirection vers l’écran d’accueil.
   - [Se connecter](http://localhost:3000/login)
   - [Se déconnecter](http://localhost:3000/profile) (Connexion requise)

3. **Visualisation des Comptes Bancaires**
   - Affiche la liste des comptes bancaires de l’utilisateur avec nom et solde.
   - Option pour afficher les transactions associées.
   - [Page des visualisation des comptes bancaires](http://localhost:3000/dashboard) (Connexion requise)

4. **Ajout d’un Compte Bancaire**
   - Permet l’ajout de nouveaux comptes bancaires avec des informations comme le nom et le type de compte.
   - Confirmation de création et affichage dans la liste.
   - [Page d'ajout d'un compte bancaire](http://localhost:3000/account/add) (Connexion requise)

5. **Ajout d’une Transaction**
   - Ajout de transactions (dépôts/retraits) pour les comptes avec validation des montants.
   - Les transactions sont ajoutées à l’historique du compte.
   - [Page d'ajout d'une transaction](http://localhost:3000/transactions?id=) (Connexion requise) (Être sur un compte avant pour l'identifier)

6. **Consultation de l’Historique des Transactions**
   - Affichage de l’historique des transactions par compte, avec options de filtre (type, date).
   - Message d’information si aucune transaction n’est trouvée.
   - [Page de consultation de l’Historique des Transactions](http://localhost:3000/history?id=) (Connexion requise) (Être sur un compte avant pour l'identifier)

7. **Calcul et Affichage du Solde Total**
   - Affiche le solde combiné de tous les comptes de l’utilisateur, mis à jour après chaque transaction.
   - [Page des calcul et affichage du solde Total](http://localhost:3000/dashboard) (Connexion requise)

8. **Gestion des Notifications de Solde Bas**
   - Permet de définir un seuil pour chaque compte et envoie une alerte si le solde descend en dessous.
   - [Page d'ajout d'une transaction pour avoir une notification de solde bas](http://localhost:3000/transactions?id=) (Connexion requise) (Être sur un compte avant pour l'identifier)

9.  **Filtrage des Transactions par Période**
   - Filtre des transactions par période (7, 30, ou 90 jours).
   - Notification si aucune transaction ne correspond au filtre.
   - [Page de consultation de l’Historique des Transactions pour le filtrage des transactions par période](http://localhost:3000/history?id=) (Connexion requise) (Être sur un compte avant pour l'identifier)

10.  **Téléchargement de l’Historique des Transactions**
    - Téléchargement de l’historique en fichier CSV avec toutes les informations nécessaires.
    - [Page de consultation de l’Historique des Transactions pour le téléchargement de l’historique des Transactions](http://localhost:3000/history?id=) (Connexion requise) (Être sur un compte avant pour l'identifier)

11.  **Profil Utilisateur et Modification des Informations Personnelles**
    - Affiche et permet la modification des informations personnelles de l’utilisateur.
    - [Page de profil utilisateur](http://localhost:3000/profile) (Connexion requise)

12.  **Historique de Connexion et Sécurité**
    - Affichage des connexions avec des détails comme l’adresse IP et la date, et alerte en cas de connexion suspecte.
    - [Page de profil utilisateur pour l'historique de Connexion et Sécurité](http://localhost:3000/profile) (Connexion requise)

13.  **Suppression d’un Compte Bancaire**
    - Permet la suppression de comptes bancaires avec confirmation et mise à jour du solde total.
    - [Page des visualisation des comptes bancaires pour la Suppression d’un Compte Bancaire](http://localhost:3000/dashboard) (Connexion requise) (création d'un compte bancaire requis)

## Technologies Utilisées

- **Front-end** : HTML, css, Javascript, Tailwind CSS
- **Back-end** : Express, bibliothèques : jwt, papaparse, bcrypt
- **Base de Données** : PostgreSQL avec Neon Tech
- **Outils** : Git (Github), Discord, Visual Studio Code

## Installation

1. Clonez le dépôt :
   ```bash
   git clone <url-du-repo>
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Lancez l'application :
   ```bash
   npm start
   ```