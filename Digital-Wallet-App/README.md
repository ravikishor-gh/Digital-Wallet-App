# WalletWise - Digital Wallet App

WalletWise is a complete front-end digital wallet application made for the SDC Project Review-1. It is designed to demonstrate how a user can store, transfer, and manage funds digitally through a polished browser interface.

## Problem statement

People need a simple place to manage digital money. A wallet application should allow users to add money, send and receive money, pay merchants and bills, review transaction history, and understand their spending. An administrator needs visibility of users, transactions, bills, and platform controls.

## Business system

The project models a digital wallet business. It has two required business modules:

- **User Module:** wallet dashboard, add money, peer-to-peer transfers, received money, QR payment simulation, bill payments, transaction history, budget and expense tracking, notifications, profile, bank linking, and security preferences.
- **Admin Module:** admin dashboard, registered-user management, user blocking/activation, transaction audit register, bill creation and settlement, maintenance mode, transfer limits, support settings, and demo-data reset.

## Technologies

- HTML5 for page structure
- CSS3 for responsive layout, CSS Grid, and Flexbox
- Vanilla JavaScript for navigation, rendering, forms, and application behavior
- Browser Local Storage for data persistence and demo authentication

No React, Bootstrap, Tailwind, server, database, backend, or external framework is used.

## SDC requirement checklist

| Requirement | Where it is satisfied |
| --- | --- |
| Clear problem statement | This README and the wallet business features |
| Minimum Admin and User modules | Separate role-based User and Admin dashboards/navigation |
| Only HTML, CSS, JavaScript | `index.html`, `styles.css`, `app.js` only |
| CSS Grid/Flexbox UI | Responsive layout throughout `styles.css` |
| Signup and Login with Local Storage | Login and signup forms in `index.html`; logic in `app.js` |
| JavaScript navigation/redirection | Role-aware sidebar navigation and `navigate()` in `app.js` |
| Working major functions | Add/send/receive money, QR payment, bills, history, budget, notices, admin controls |
| GitHub ready | This project has no build step and can be pushed as-is |

## Demo accounts

Use the two **Ready for review** buttons on the sign-in screen, or enter these values manually:

| Role | Email | Password |
| --- | --- | --- |
| User | `user@walletwise.demo` | `user123` |
| Admin | `admin@walletwise.demo` | `admin123` |

Additional seeded users are available to demonstrate recipient transfers: `nisha@walletwise.demo` and `kabir@walletwise.demo` (passwords: `nisha123`, `kabir123`).

## How Local Storage works

On the first browser visit, `app.js` creates demo users, balances, bills, transactions, budgets, notifications, and platform settings in Local Storage. A successful login writes a small session object to Local Storage. Every wallet action updates the same Local Storage data, so refresh the page and the change remains visible.

This is a classroom demonstration, not production authentication: passwords are stored locally in plain text and there is no server-side security.

The Admin Module includes **Reset demo data**, which restores the original sample accounts and records before a new presentation.

## How to run

1. Open `index.html` in any modern browser.
2. Click a User or Admin demo account on the sign-in screen.
3. Use the sidebar to demonstrate the relevant module.

The project works directly from the file system; a development server is not required.

## Suggested review demonstration

1. Sign in as the User demo account and show the dashboard balance, quick actions, and recent activity.
2. Add money, then send money to `Nisha Kapoor`; show the new balance and transaction record.
3. Open Payments, perform a QR merchant payment, then pay a bill.
4. Open Budget, change the monthly budget, and show expense categories.
5. Open Notifications and Profile/Settings to show the remaining User Module features.
6. Sign out and sign in as Admin. Show user management, all transactions, bill creation, and System Controls.
7. Use Reset demo data if the demonstration needs to start over.

## Push to GitHub

Create an empty GitHub repository, then run these commands from this project folder:

```powershell
git init
git add index.html styles.css app.js README.md
git commit -m "Build WalletWise digital wallet SDC project"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```
