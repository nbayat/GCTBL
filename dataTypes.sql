CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255),         
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE ip (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE, 
    access_date DATE NOT NULL,                         
    access_time TIME NOT NULL,                          
    ip_address VARCHAR(45) NOT NULL                     
);

CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,         
    name VARCHAR(255) NOT NULL,    
    type VARCHAR(100) NOT NULL,   
    lowSale INT NOT NULL,          
    balance INT NOT NULL,          
    userId INT NOT NULL,          
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE 
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,         
    type VARCHAR(100) NOT NULL,    
    amount INT NOT NULL,           
    balance INT NOT NULL,          
    accountId INT NOT NULL,       
    transaction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (accountId) REFERENCES accounts(id) ON DELETE CASCADE 
);
