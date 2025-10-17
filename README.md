# Personal Finance Management (PFM) Dashboard

A full-stack personal finance dashboard built with the MERN stack (MongoDB, Express.js, React, Node.js) and Plaid API. This application allows users to securely connect their bank accounts, track expenses, visualize spending habits, and manage budgets in a single, intuitive interface.

![Dashboard Screenshot](path/to/your/screenshot.png) ---

## ✨ Features

* **User Authentication**: Secure user registration and login using JWT (JSON Web Tokens).
* **Plaid Integration**: Securely link multiple bank accounts using the Plaid API.
* **Transaction Aggregation**: Fetches and displays recent transactions from all linked accounts.
* **Data Visualization**:
    * Interactive pie chart showing spending by category.
    * Bar chart displaying monthly income vs. expenses.
* **Budgeting**: Users can set monthly budgets for different categories and track their progress.
* **Manual Transactions**: Ability to add transactions manually for cash expenses.
* **Protected Routes**: The dashboard is only accessible to authenticated users.

---

## 🚀 Tech Stack

* **Frontend**: React, React Router, Axios, Tailwind CSS, Recharts
* **Backend**: Node.js, Express.js
* **Database**: MongoDB (with Mongoose)
* **APIs**: Plaid API (for bank account integration)
* **Authentication**: bcryptjs (for password hashing), JWT
* **Testing**: Jest, Supertest

---

## ⚙️ Setup and Installation

To run this project locally, follow these steps:

### Prerequisites

* Node.js installed
* MongoDB installed and running locally
* A free Plaid developer account

### 1. Clone the repository

```bash
git clone [https://github.com/your-username/pfm-dashboard.git](https://github.com/your-username/pfm-dashboard.git)
cd pfm-dashboard