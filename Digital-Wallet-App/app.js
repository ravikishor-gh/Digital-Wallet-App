"use strict";

const KEYS = {
  users: "walletwise_users_v1",
  session: "walletwise_session_v1",
  transactions: "walletwise_transactions_v1",
  bills: "walletwise_bills_v1",
  notices: "walletwise_notices_v1",
  budgets: "walletwise_budgets_v1",
  settings: "walletwise_settings_v1"
};

const state = { route: "dashboard", transactionFilter: "all", search: "" };

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function uid(prefix) { return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`; }
function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
}
function initials(name) { return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "WW"; }
function money(value) { return `Rs. ${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function shortMoney(value) { return `Rs. ${Number(value || 0).toLocaleString("en-IN")}`; }
function nowText() { return new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }); }
function dateText(date = new Date()) { return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
function currentMonthKey() { const d = new Date(); return `${d.getFullYear()}-${d.getMonth()}`; }

function seedData(force = false) {
  if (!force && localStorage.getItem(KEYS.users)) return;
  const today = new Date();
  const ago = (days) => new Date(today.getTime() - days * 86400000).toISOString();
  const users = [
    { id: "admin-001", name: "Priya Sharma", email: "admin@walletwise.demo", password: "admin123", role: "admin", status: "active", balance: 0, createdAt: ago(120) },
    { id: "user-001", name: "Aarav Mehta", email: "user@walletwise.demo", password: "user123", role: "user", status: "active", balance: 24580, createdAt: ago(95), linkedBank: "HDFC Bank ending 4521" },
    { id: "user-002", name: "Nisha Kapoor", email: "nisha@walletwise.demo", password: "nisha123", role: "user", status: "active", balance: 12640, createdAt: ago(48), linkedBank: "ICICI Bank ending 1108" },
    { id: "user-003", name: "Kabir Singh", email: "kabir@walletwise.demo", password: "kabir123", role: "user", status: "active", balance: 8930, createdAt: ago(22), linkedBank: "SBI Bank ending 9240" }
  ];
  const transactions = [
    { id: "tx-101", userId: "user-001", type: "credit", category: "Top up", title: "Money added from HDFC Bank", amount: 12000, createdAt: ago(1), status: "Success" },
    { id: "tx-102", userId: "user-001", type: "debit", category: "Food", title: "QR payment to Cafe Terra", amount: 480, createdAt: ago(2), status: "Success" },
    { id: "tx-103", userId: "user-001", type: "debit", category: "Bills", title: "Electricity bill paid", amount: 1680, createdAt: ago(4), status: "Success" },
    { id: "tx-104", userId: "user-001", type: "credit", category: "Transfer", title: "Received from Nisha Kapoor", amount: 2500, createdAt: ago(6), status: "Success" },
    { id: "tx-105", userId: "user-001", type: "debit", category: "Transfer", title: "Sent to Kabir Singh", amount: 1200, createdAt: ago(8), status: "Success" },
    { id: "tx-106", userId: "user-002", type: "debit", category: "Bills", title: "Mobile recharge", amount: 599, createdAt: ago(2), status: "Success" },
    { id: "tx-107", userId: "user-003", type: "credit", category: "Transfer", title: "Received from Aarav Mehta", amount: 1200, createdAt: ago(8), status: "Success" }
  ];
  const bills = [
    { id: "bill-101", userId: "user-001", provider: "Airtel Prepaid", category: "Mobile", account: "98765 43210", amount: 599, dueDate: "06 Oct 2026", status: "Due" },
    { id: "bill-102", userId: "user-001", provider: "Tata Power", category: "Electricity", account: "CA 21980471", amount: 1680, dueDate: "11 Oct 2026", status: "Due" },
    { id: "bill-103", userId: "user-001", provider: "JioFiber", category: "Broadband", account: "JIO 481129", amount: 999, dueDate: "17 Oct 2026", status: "Due" },
    { id: "bill-104", userId: "user-002", provider: "Mahanagar Gas", category: "Gas", account: "MG 732200", amount: 740, dueDate: "09 Oct 2026", status: "Due" }
  ];
  const notices = [
    { id: "notice-101", userId: "user-001", title: "Payment completed", message: "Your QR payment of Rs. 480.00 to Cafe Terra was successful.", createdAt: ago(2), read: false },
    { id: "notice-102", userId: "user-001", title: "Bill reminder", message: "Your Airtel Prepaid bill of Rs. 599.00 is due on 06 Oct 2026.", createdAt: ago(1), read: false },
    { id: "notice-103", userId: "user-001", title: "Money received", message: "Nisha Kapoor sent you Rs. 2,500.00.", createdAt: ago(6), read: true },
    { id: "notice-104", userId: "admin-001", title: "New system activity", message: "Aarav Mehta paid an electricity bill.", createdAt: ago(4), read: false }
  ];
  write(KEYS.users, users);
  write(KEYS.transactions, transactions);
  write(KEYS.bills, bills);
  write(KEYS.notices, notices);
  write(KEYS.budgets, [{ userId: "user-001", monthlyLimit: 20000, month: currentMonthKey() }, { userId: "user-002", monthlyLimit: 15000, month: currentMonthKey() }, { userId: "user-003", monthlyLimit: 12000, month: currentMonthKey() }]);
  write(KEYS.settings, { maintenance: false, dailyTransferLimit: 50000, supportEmail: "support@walletwise.demo" });
  localStorage.removeItem(KEYS.session);
}

function getUsers() { return read(KEYS.users, []); }
function getTransactions() { return read(KEYS.transactions, []); }
function getBills() { return read(KEYS.bills, []); }
function getNotices() { return read(KEYS.notices, []); }
function getBudgets() { return read(KEYS.budgets, []); }
function getSettings() { return read(KEYS.settings, { maintenance: false, dailyTransferLimit: 50000 }); }
function currentUser() {
  const session = read(KEYS.session, null);
  return session ? getUsers().find((user) => user.id === session.userId) : null;
}
function setUser(updated) {
  const users = getUsers().map((user) => user.id === updated.id ? updated : user);
  write(KEYS.users, users);
}
function pushTransaction(transaction) {
  const all = getTransactions(); all.unshift(transaction); write(KEYS.transactions, all);
}
function pushNotice(userId, title, message) {
  const all = getNotices(); all.unshift({ id: uid("notice"), userId, title, message, createdAt: new Date().toISOString(), read: false }); write(KEYS.notices, all);
}
function toast(title, message, error = false) {
  const item = document.createElement("div");
  item.className = `toast${error ? " error" : ""}`;
  item.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(message)}</span>`;
  document.getElementById("toastRegion").appendChild(item);
  setTimeout(() => item.remove(), 3600);
}
function sortNewest(items) { return [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); }
function getBudget(userId) { return getBudgets().find((item) => item.userId === userId) || { userId, monthlyLimit: 20000, month: currentMonthKey() }; }
function userTransactions(userId) { return sortNewest(getTransactions().filter((transaction) => transaction.userId === userId)); }
function userBills(userId) { return getBills().filter((bill) => bill.userId === userId); }
function userNotices(userId) { return sortNewest(getNotices().filter((notice) => notice.userId === userId)); }
function expenseBreakdown(userId) {
  const categories = { Food: 0, Bills: 0, Transfer: 0, Shopping: 0, Other: 0 };
  userTransactions(userId).forEach((tx) => { if (tx.type === "debit") categories[categories[tx.category] !== undefined ? tx.category : "Other"] += Number(tx.amount); });
  return categories;
}
function totalDebit(userId) { return userTransactions(userId).filter((tx) => tx.type === "debit").reduce((sum, tx) => sum + Number(tx.amount), 0); }
function pageTitleFor(route) {
  const titles = { dashboard: ["OVERVIEW", "Dashboard"], wallet: ["YOUR WALLET", "Wallet operations"], payments: ["MAKE A PAYMENT", "Payments"], transactions: ["MONEY MOVEMENT", "Transactions"], budget: ["SPENDING PLAN", "Budget and expenses"], notifications: ["ACCOUNT ACTIVITY", "Notifications"], settings: ["ACCOUNT", "Profile and settings"], adminDashboard: ["ADMIN MODULE", "Admin dashboard"], users: ["ADMIN MODULE", "User management"], adminTransactions: ["ADMIN MODULE", "All transactions"], adminBills: ["ADMIN MODULE", "Bill controls"], controls: ["ADMIN MODULE", "System controls"] };
  return titles[route] || titles.dashboard;
}

const userNavigation = [
  ["WALLET", "dashboard", "&#9632;", "Dashboard"], ["", "wallet", "&#8645;", "Add or transfer"], ["", "payments", "&#9638;", "QR and bills"], ["TRACK", "transactions", "&#9776;", "Transactions"], ["", "budget", "&#9646;", "Budget"], ["", "notifications", "&#9673;", "Notifications"], ["ACCOUNT", "settings", "&#9881;", "Settings"]
];
const adminNavigation = [
  ["ADMIN", "adminDashboard", "&#9632;", "Dashboard"], ["MANAGE", "users", "&#9786;", "Users"], ["", "adminTransactions", "&#9776;", "Transactions"], ["", "adminBills", "&#9638;", "Bills"], ["", "controls", "&#9881;", "System controls"]
];

function renderNavigation(user) {
  const nav = user.role === "admin" ? adminNavigation : userNavigation;
  document.getElementById("mainNav").innerHTML = nav.map(([section, route, icon, label]) => `${section ? `<p class="nav-section">${section}</p>` : ""}<button class="nav-item ${state.route === route ? "active" : ""}" type="button" data-route="${route}"><span aria-hidden="true">${icon}</span><span>${label}</span></button>`).join("");
}
function renderShell(user) {
  document.getElementById("authView").classList.add("hidden");
  document.getElementById("appView").classList.remove("hidden");
  document.getElementById("sidebarUser").innerHTML = `<span class="avatar avatar-teal">${initials(user.name)}</span><span class="user-copy"><strong>${escapeHtml(user.name)}</strong><span>${user.role === "admin" ? "Administrator" : "Wallet member"}</span></span>`;
  document.getElementById("topbarAvatar").innerHTML = `<span class="avatar avatar-teal" title="${escapeHtml(user.name)}">${initials(user.name)}</span>`;
  renderNavigation(user);
  const [kicker, title] = pageTitleFor(state.route);
  document.getElementById("pageKicker").textContent = kicker;
  document.getElementById("pageTitle").textContent = title;
  const unread = userNotices(user.id).filter((notice) => !notice.read).length;
  const count = document.getElementById("notificationCount");
  count.textContent = unread > 9 ? "9+" : String(unread);
  count.classList.toggle("hidden", unread === 0);
  const maintenance = getSettings().maintenance && user.role !== "admin";
  const banner = document.getElementById("maintenanceBanner");
  banner.classList.toggle("hidden", !maintenance);
  banner.textContent = "Maintenance mode is enabled. Existing wallet features remain available for this classroom demonstration.";
  document.getElementById("routeView").innerHTML = user.role === "admin" ? renderAdminRoute(user) : renderUserRoute(user);
  if (state.route === "payments") buildQr();
}
function navigate(route) {
  const user = currentUser(); if (!user) return;
  const allowed = user.role === "admin" ? adminNavigation.map((item) => item[1]) : userNavigation.map((item) => item[1]);
  state.route = allowed.includes(route) ? route : allowed[0];
  state.search = "";
  const search = document.getElementById("globalSearch"); if (search) search.value = "";
  document.getElementById("sidebar").classList.remove("open");
  renderShell(user);
}

function renderUserRoute(user) {
  switch (state.route) {
    case "wallet": return renderWallet(user);
    case "payments": return renderPayments(user);
    case "transactions": return renderTransactions(user);
    case "budget": return renderBudget(user);
    case "notifications": return renderNotifications(user);
    case "settings": return renderSettings(user);
    default: return renderDashboard(user);
  }
}
function metric(label, value, foot, type) { return `<article class="metric-card"><span class="metric-icon ${type}">${type === "teal" ? "Rs" : type === "blue" ? "#" : type === "coral" ? "!" : "*"}</span><span class="metric-label">${label}</span><strong>${value}</strong><span class="metric-foot ${type === "teal" ? "positive" : ""}">${foot}</span></article>`; }
function renderDashboard(user) {
  const budget = getBudget(user.id); const spent = totalDebit(user.id); const dueBills = userBills(user.id).filter((bill) => bill.status === "Due"); const txs = userTransactions(user.id).slice(0, 5);
  const limitPercent = Math.min(100, Math.round((spent / budget.monthlyLimit) * 100));
  return `<div class="page-intro"><div><h2>Good day, ${escapeHtml(user.name.split(" ")[0])}.</h2><p>Here is a clear view of your wallet today.</p></div><div class="action-row"><button class="button button-primary" type="button" data-route="wallet">+ Add money</button><button class="button button-secondary" type="button" data-route="payments">Pay a bill</button></div></div>
  <section class="metric-grid">${metric("Available balance", money(user.balance), "Ready to use", "teal")}${metric("Monthly spending", money(spent), `${limitPercent}% of your budget`, "coral")}${metric("Bills due", `${dueBills.length} pending`, dueBills.length ? `Next: ${dueBills[0].dueDate}` : "Nothing due", "gold")}${metric("Transactions", `${userTransactions(user.id).length} total`, "All wallet activity", "blue")}</section>
  <section class="content-grid"><article class="panel"><header class="panel-heading"><div><h3>Quick actions</h3><p>Move money in a few taps</p></div></header><div class="panel-body"><div class="quick-actions"><button class="quick-action" type="button" data-route="wallet"><span>+</span>Add money<small>Top up wallet</small></button><button class="quick-action" type="button" data-route="wallet"><span>&#8599;</span>Send money<small>Pay a contact</small></button><button class="quick-action" type="button" data-route="payments"><span>&#9638;</span>Scan and pay<small>QR payment</small></button><button class="quick-action" type="button" data-route="payments"><span>&#9673;</span>Pay bills<small>${dueBills.length} pending</small></button></div></div></article>
  <article class="panel"><header class="panel-heading"><div><h3>Budget status</h3><p>${money(spent)} spent this month</p></div><button class="link-button" type="button" data-route="budget">View budget</button></header><div class="panel-body"><div class="progress-row"><div class="progress-label"><span>Monthly limit</span><span>${money(spent)} / ${money(budget.monthlyLimit)}</span></div><div class="progress-track"><div class="progress-value" style="width:${limitPercent}%"></div></div></div><div class="info-strip"><span aria-hidden="true">i</span><span><strong>${Math.max(0, 100 - limitPercent)}% remaining.</strong> Keep an eye on recurring bills as they come due.</span></div></div></article></section>
  <section class="content-grid" style="margin-top:18px"><article class="panel"><header class="panel-heading"><div><h3>Recent activity</h3><p>Your latest wallet movements</p></div><button class="link-button" type="button" data-route="transactions">See all</button></header>${renderTransactionRows(txs)}</article><article class="panel"><header class="panel-heading"><div><h3>Upcoming bills</h3><p>Pay before the due date</p></div><button class="link-button" type="button" data-route="payments">Manage bills</button></header><div class="panel-body">${dueBills.length ? `<div class="bill-list">${dueBills.slice(0, 3).map(renderBillCompact).join("")}</div>` : `<div class="empty-state"><strong>All clear</strong>No bills are waiting for payment.</div>`}</div></article></section>`;
}
function renderTransactionRows(transactions) {
  if (!transactions.length) return `<div class="empty-state"><strong>No transactions yet</strong>Use Add money to begin using your wallet.</div>`;
  return `<div class="transaction-list">${transactions.map((tx) => `<div class="transaction-row"><span class="transaction-icon ${tx.type}">${tx.type === "credit" ? "+" : "-"}</span><div class="transaction-copy"><strong>${escapeHtml(tx.title)}</strong><span>${escapeHtml(tx.category)} | ${dateText(tx.createdAt)}</span></div><div class="transaction-amount ${tx.type}">${tx.type === "credit" ? "+" : "-"}${money(tx.amount)}<small>${escapeHtml(tx.status)}</small></div></div>`).join("")}</div>`;
}
function renderBillCompact(bill) { return `<div class="bill-item"><span class="bill-symbol">${escapeHtml(bill.category[0])}</span><div class="bill-copy"><strong>${escapeHtml(bill.provider)}</strong><span>Due ${escapeHtml(bill.dueDate)}</span></div><div class="bill-value"><strong>${money(bill.amount)}</strong><span class="status due">${escapeHtml(bill.status)}</span></div></div>`; }
function renderWallet(user) {
  const budget = getBudget(user.id); const spent = totalDebit(user.id);
  return `<div class="page-intro"><div><h2>Wallet operations</h2><p>Add funds, send money, or record money received.</p></div></div>
  <section class="wallet-summary"><article class="balance-card"><span>Available wallet balance</span><strong>${money(user.balance)}</strong><footer><span>Primary wallet</span><b>WALLETWISE</b></footer></article><article class="wallet-mini"><span>Monthly budget</span><strong>${money(budget.monthlyLimit)}</strong><small>${money(Math.max(0, budget.monthlyLimit - spent))} remaining</small></article><article class="wallet-mini"><span>Linked account</span><strong>${escapeHtml((user.linkedBank || "No bank linked").split(" ending")[0])}</strong><small>${escapeHtml(user.linkedBank || "Link an account in settings")}</small></article></section>
  <section class="operation-grid"><article class="panel"><header class="panel-heading"><div><h3>Add money</h3><p>Top up from a linked account</p></div></header><div class="panel-body"><form id="addMoneyForm"><div class="form-field"><label>Funding source<select name="source"><option>${escapeHtml(user.linkedBank || "Demo bank account")}</option><option>Debit card ending 7842</option></select></label></div><div class="form-field" style="margin-top:14px"><label>Amount<input name="amount" type="number" min="1" step="1" placeholder="Enter amount" required></label></div><div class="form-actions"><button class="button button-primary" type="submit">Add to wallet</button></div></form></div></article>
  <article class="panel"><header class="panel-heading"><div><h3>Send money</h3><p>Transfer to another wallet user</p></div></header><div class="panel-body"><form id="sendMoneyForm"><div class="form-field"><label>Recipient name or email<input name="recipient" type="text" placeholder="e.g. Nisha Kapoor" required></label></div><div class="form-field" style="margin-top:14px"><label>Amount<input name="amount" type="number" min="1" step="1" placeholder="Enter amount" required></label></div><div class="form-actions"><button class="button button-primary" type="submit">Send money</button></div></form></div></article>
  <article class="panel"><header class="panel-heading"><div><h3>Receive money</h3><p>Record a received transfer</p></div></header><div class="panel-body"><form id="receiveMoneyForm"><div class="form-field"><label>Sender name<input name="sender" type="text" placeholder="Who sent it?" required></label></div><div class="form-field" style="margin-top:14px"><label>Amount<input name="amount" type="number" min="1" step="1" placeholder="Enter amount" required></label></div><div class="form-actions"><button class="button button-primary" type="submit">Receive money</button></div></form></div></article></section>`;
}
function renderPayments(user) {
  const bills = userBills(user.id); const due = bills.filter((bill) => bill.status === "Due");
  return `<div class="page-intro"><div><h2>Payments</h2><p>Use a QR payment or settle any pending bill.</p></div></div>
  <section class="content-grid"><article class="panel"><header class="panel-heading"><div><h3>QR code payment</h3><p>Scan simulation for in-store payments</p></div></header><div class="panel-body"><div class="qr-layout"><div class="qr-frame"><div id="qrGrid" class="qr-grid" aria-label="Simulated QR code"></div></div><div class="qr-copy"><h3>Pay any merchant</h3><p>Enter the merchant and amount to simulate scanning and paying a QR code.</p><form id="qrPayForm" style="margin-top:16px"><div class="form-field"><label>Merchant<input name="merchant" type="text" placeholder="Merchant name" required></label></div><div class="form-field" style="margin-top:12px"><label>Amount<input name="amount" type="number" min="1" step="1" placeholder="Enter amount" required></label></div><div class="form-actions"><button class="button button-primary" type="submit">Pay securely</button></div></form></div></div></div></article>
  <article class="panel"><header class="panel-heading"><div><h3>Pay a bill</h3><p>${due.length} pending bill${due.length === 1 ? "" : "s"}</p></div></header><div class="panel-body">${due.length ? `<form id="billPayForm"><div class="form-field"><label>Select pending bill<select name="billId">${due.map((bill) => `<option value="${bill.id}">${escapeHtml(bill.provider)} - ${money(bill.amount)}</option>`).join("")}</select></label></div><div class="info-strip"><span aria-hidden="true">i</span><span>The bill amount will be deducted from your wallet after confirmation.</span></div><div class="form-actions"><button class="button button-primary" type="submit">Pay selected bill</button></div></form>` : `<div class="empty-state"><strong>You are up to date</strong>There are no bills waiting to be paid.</div>`}</div></article></section>
  <section class="panel" style="margin-top:18px"><header class="panel-heading"><div><h3>All bill accounts</h3><p>Saved billers in your wallet</p></div></header><div class="panel-body"><div class="bill-list">${bills.length ? bills.map(renderBillCompact).join("") : `<div class="empty-state"><strong>No billers yet</strong>Ask the administrator to add a bill account.</div>`}</div></div></section>`;
}
function renderTransactions(user) {
  let txs = userTransactions(user.id); const q = state.search.toLowerCase();
  if (state.transactionFilter !== "all") txs = txs.filter((tx) => tx.type === state.transactionFilter);
  if (q) txs = txs.filter((tx) => `${tx.title} ${tx.category} ${tx.amount}`.toLowerCase().includes(q));
  const credits = userTransactions(user.id).filter((tx) => tx.type === "credit").reduce((sum, tx) => sum + Number(tx.amount), 0);
  const debits = totalDebit(user.id);
  return `<div class="page-intro"><div><h2>Transaction history</h2><p>Every wallet movement, in one place.</p></div><div class="action-row"><button class="button button-secondary" type="button" data-action="export-transactions">&#8595; Export view</button></div></div>
  <section class="metric-grid"><article class="metric-card"><span class="metric-label">Money in</span><strong>${money(credits)}</strong><span class="metric-foot positive">All credits</span></article><article class="metric-card"><span class="metric-label">Money out</span><strong>${money(debits)}</strong><span class="metric-foot">All debits</span></article><article class="metric-card"><span class="metric-label">Net movement</span><strong>${money(credits - debits)}</strong><span class="metric-foot">This wallet history</span></article><article class="metric-card"><span class="metric-label">Records found</span><strong>${txs.length}</strong><span class="metric-foot">Filtered results</span></article></section>
  <section class="panel"><header class="panel-heading"><div><h3>All activity</h3><p>Use the filters or the search box above</p></div></header><div class="panel-body"><div class="filter-bar"><button class="filter-button ${state.transactionFilter === "all" ? "active" : ""}" type="button" data-filter="all">All transactions</button><button class="filter-button ${state.transactionFilter === "credit" ? "active" : ""}" type="button" data-filter="credit">Money in</button><button class="filter-button ${state.transactionFilter === "debit" ? "active" : ""}" type="button" data-filter="debit">Money out</button></div></div>${renderTransactionRows(txs)}</section>`;
}
function renderBudget(user) {
  const budget = getBudget(user.id); const spent = totalDebit(user.id); const percent = Math.min(100, Math.round(spent / budget.monthlyLimit * 100)); const breakdown = expenseBreakdown(user.id); const topCategories = Object.entries(breakdown).filter(([, value]) => value > 0).sort((a, b) => b[1] - a[1]);
  return `<div class="page-intro"><div><h2>Budget and expenses</h2><p>Set a monthly ceiling and track where your money goes.</p></div></div>
  <section class="budget-hero"><div><p>MONTHLY SPENDING PLAN</p><h2>${money(Math.max(0, budget.monthlyLimit - spent))} remaining</h2><div class="progress-row"><div class="progress-label"><span>${money(spent)} spent</span><span>${percent}% used</span></div><div class="progress-track"><div class="progress-value" style="width:${percent}%"></div></div></div></div><button class="button button-secondary" type="button" data-action="focus-budget">Edit budget</button></section>
  <section class="content-grid" style="margin-top:18px"><article class="panel"><header class="panel-heading"><div><h3>Monthly budget</h3><p>Adjust your limit whenever your plans change</p></div></header><div class="panel-body"><form id="budgetForm"><div class="form-field"><label>Monthly spending limit<input id="budgetLimit" name="limit" type="number" min="1" step="1" value="${budget.monthlyLimit}" required></label></div><div class="info-strip"><span aria-hidden="true">i</span><span>Only debit transactions count towards this monthly limit in the demo.</span></div><div class="form-actions"><button class="button button-primary" type="submit">Save budget</button></div></form></div></article><article class="panel"><header class="panel-heading"><div><h3>Expense categories</h3><p>Based on wallet transaction history</p></div></header><div class="panel-body">${topCategories.length ? topCategories.map(([category, value], index) => `<div class="progress-row"><div class="progress-label"><span>${escapeHtml(category)}</span><span>${money(value)}</span></div><div class="progress-track"><div class="progress-value ${["", "blue", "coral", "gold"][index % 4]}" style="width:${Math.min(100, Math.round(value / Math.max(spent, 1) * 100))}%"></div></div></div>`).join("") : `<div class="empty-state"><strong>No expenses yet</strong>Your spending categories will appear here.</div>`}</div></article></section>`;
}
function renderNotifications(user) {
  const notices = userNotices(user.id);
  return `<div class="page-intro"><div><h2>Notifications</h2><p>Important updates from your wallet.</p></div><div class="action-row"><button class="button button-secondary" type="button" data-action="mark-all-read">Mark all as read</button></div></div><section class="panel"><header class="panel-heading"><div><h3>Account updates</h3><p>${notices.filter((notice) => !notice.read).length} unread notification${notices.filter((notice) => !notice.read).length === 1 ? "" : "s"}</p></div></header><div class="notification-list">${notices.length ? notices.map((notice) => `<article class="notice ${notice.read ? "" : "unread"}"><span class="notice-icon">&#9673;</span><div><strong>${escapeHtml(notice.title)}</strong><p>${escapeHtml(notice.message)}</p></div><time>${dateText(notice.createdAt)}</time></article>`).join("") : `<div class="empty-state"><strong>No notifications</strong>Wallet updates will appear here.</div>`}</div></section>`;
}
function renderSettings(user) {
  const preferences = user.preferences || { paymentAlerts: true, transactionPin: false, biometric: false };
  return `<div class="page-intro"><div><h2>Profile and settings</h2><p>Keep your account details and security preferences up to date.</p></div></div><section class="content-grid equal"><article class="panel"><header class="panel-heading"><div><h3>Profile details</h3><p>Your WalletWise account information</p></div></header><div class="panel-body"><form id="profileForm" class="form-grid"><div class="form-field"><label>Full name<input name="name" value="${escapeHtml(user.name)}" required></label></div><div class="form-field"><label>Email address<input value="${escapeHtml(user.email)}" disabled></label></div><div class="form-actions form-span"><button class="button button-primary" type="submit">Save profile</button></div></form></div></article><article class="panel"><header class="panel-heading"><div><h3>Linked bank account</h3><p>Add an account for wallet top-ups</p></div></header><div class="panel-body"><form id="linkBankForm" class="form-grid"><div class="form-field"><label>Bank name<input name="bank" placeholder="e.g. HDFC Bank" required></label></div><div class="form-field"><label>Last 4 digits<input name="last4" inputmode="numeric" maxlength="4" pattern="[0-9]{4}" placeholder="4521" required></label></div><div class="form-actions form-span"><button class="button button-secondary" type="submit">Link bank account</button></div></form></div></article></section><section class="panel" style="margin-top:18px"><header class="panel-heading"><div><h3>Security and alerts</h3><p>Demo controls saved in your browser</p></div></header><div class="panel-body settings-group"><div class="toggle-row"><div class="toggle-copy"><strong>Payment notifications</strong><span>Receive an update after each wallet action</span></div><label class="switch"><input type="checkbox" ${preferences.paymentAlerts ? "checked" : ""} data-setting="paymentAlerts"><span></span></label></div><div class="toggle-row"><div class="toggle-copy"><strong>Transaction PIN</strong><span>Ask for a PIN before sending money</span></div><label class="switch"><input type="checkbox" ${preferences.transactionPin ? "checked" : ""} data-setting="transactionPin"><span></span></label></div><div class="toggle-row"><div class="toggle-copy"><strong>Biometric sign-in</strong><span>Simulated device biometric login preference</span></div><label class="switch"><input type="checkbox" ${preferences.biometric ? "checked" : ""} data-setting="biometric"><span></span></label></div></div></section>`;
}

function renderAdminRoute(admin) {
  switch (state.route) { case "users": return renderAdminUsers(admin); case "adminTransactions": return renderAdminTransactions(); case "adminBills": return renderAdminBills(); case "controls": return renderControls(); default: return renderAdminDashboard(); }
}
function renderAdminDashboard() {
  const users = getUsers().filter((user) => user.role === "user"); const txs = getTransactions(); const bills = getBills(); const active = users.filter((user) => user.status === "active").length; const due = bills.filter((bill) => bill.status === "Due").length; const total = txs.reduce((sum, tx) => sum + Number(tx.amount), 0);
  return `<div class="page-intro"><div><h2>Wallet operations at a glance</h2><p>Review users, payments, bills, and platform controls.</p></div><div class="action-row"><button class="button button-primary" type="button" data-route="users">Manage users</button><button class="button button-secondary" type="button" data-route="adminBills">Add a bill</button></div></div><section class="metric-grid">${metric("Registered users", String(users.length), `${active} active account${active === 1 ? "" : "s"}`, "teal")}${metric("All transactions", String(txs.length), "Recorded in local storage", "blue")}${metric("Transaction volume", money(total), "Credit and debit activity", "coral")}${metric("Bills pending", String(due), "Awaiting payment", "gold")}</section><section class="content-grid"><article class="panel"><header class="panel-heading"><div><h3>Weekly transaction activity</h3><p>Classroom demo overview</p></div><button class="link-button" type="button" data-route="adminTransactions">View transactions</button></header><div class="panel-body"><div class="chart-bars">${[42, 68, 51, 84, 59, 75].map((height, index) => `<div class="chart-bar"><span style="height:${height}%"></span><small>${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][index]}</small></div>`).join("")}</div></div></article><article class="panel"><header class="panel-heading"><div><h3>Admin reminders</h3><p>Actions that may need attention</p></div></header><div class="panel-body"><div class="progress-row"><div class="progress-label"><span>Active user accounts</span><span>${active} / ${users.length}</span></div><div class="progress-track"><div class="progress-value" style="width:${users.length ? active / users.length * 100 : 0}%"></div></div></div><div class="info-strip"><span aria-hidden="true">i</span><span><strong>${due} bill${due === 1 ? " is" : "s are"} pending.</strong> Use Bill controls to create or review bill accounts.</span></div><div class="info-strip"><span aria-hidden="true">i</span><span>Maintenance mode is currently <strong>${getSettings().maintenance ? "on" : "off"}</strong>.</span></div></div></article></section><section class="panel" style="margin-top:18px"><header class="panel-heading"><div><h3>Latest platform transactions</h3><p>Recent activity from all wallet users</p></div></header>${renderAdminTransactionTable(sortNewest(txs).slice(0, 5))}</section>`;
}
function renderAdminUsers() {
  const q = state.search.toLowerCase(); let users = getUsers().filter((user) => user.role === "user"); if (q) users = users.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(q));
  return `<div class="page-intro"><div><h2>User management</h2><p>Review registered wallet members and account access.</p></div><div class="action-row"><button class="button button-secondary" type="button" data-action="reset-demo">Reset demo data</button></div></div><section class="panel"><header class="panel-heading"><div><h3>Registered users</h3><p>${users.length} result${users.length === 1 ? "" : "s"}${state.search ? " matching search" : ""}</p></div></header><div class="table-wrap"><table class="data-table"><thead><tr><th>User</th><th>Wallet balance</th><th>Joined</th><th>Status</th><th>Action</th></tr></thead><tbody>${users.length ? users.map((user) => `<tr><td><div class="table-person"><span class="avatar avatar-blue">${initials(user.name)}</span><span><strong>${escapeHtml(user.name)}</strong><small>${escapeHtml(user.email)}</small></span></div></td><td>${money(user.balance)}</td><td>${dateText(user.createdAt)}</td><td><span class="status ${user.status}">${escapeHtml(user.status)}</span></td><td><div class="table-actions"><button class="button button-small ${user.status === "active" ? "button-danger" : "button-secondary"}" type="button" data-toggle-user="${user.id}">${user.status === "active" ? "Block" : "Activate"}</button></div></td></tr>`).join("") : `<tr><td colspan="5"><div class="empty-state"><strong>No matching users</strong>Try a different search.</div></td></tr>`}</tbody></table></div></section>`;
}
function renderAdminTransactionTable(txs) {
  const users = getUsers();
  return `<div class="table-wrap"><table class="data-table"><thead><tr><th>Transaction</th><th>User</th><th>Type</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead><tbody>${txs.length ? txs.map((tx) => { const owner = users.find((user) => user.id === tx.userId); return `<tr><td><strong>${escapeHtml(tx.title)}</strong><small>${escapeHtml(tx.category)}</small></td><td>${escapeHtml(owner ? owner.name : "Unknown user")}</td><td><span class="status ${tx.type === "credit" ? "paid" : "due"}">${escapeHtml(tx.type)}</span></td><td>${tx.type === "credit" ? "+" : "-"}${money(tx.amount)}</td><td>${dateText(tx.createdAt)}</td><td><span class="status success">${escapeHtml(tx.status)}</span></td></tr>`; }).join("") : `<tr><td colspan="6"><div class="empty-state"><strong>No transactions</strong>Transactions will appear here.</div></td></tr>`}</tbody></table></div>`;
}
function renderAdminTransactions() {
  const q = state.search.toLowerCase(); let txs = sortNewest(getTransactions()); if (q) txs = txs.filter((tx) => `${tx.title} ${tx.category} ${tx.amount}`.toLowerCase().includes(q));
  return `<div class="page-intro"><div><h2>All transactions</h2><p>Audit every money movement across the application.</p></div><div class="action-row"><button class="button button-secondary" type="button" data-action="export-transactions">&#8595; Export view</button></div></div><section class="panel"><header class="panel-heading"><div><h3>Transaction register</h3><p>${txs.length} transaction${txs.length === 1 ? "" : "s"}${state.search ? " matching search" : ""}</p></div></header>${renderAdminTransactionTable(txs)}</section>`;
}
function renderAdminBills() {
  const bills = getBills(); const users = getUsers().filter((user) => user.role === "user");
  return `<div class="page-intro"><div><h2>Bill controls</h2><p>Create bill accounts and monitor payment status.</p></div></div><section class="content-grid"><article class="panel"><header class="panel-heading"><div><h3>Add bill account</h3><p>Create a payable bill for a wallet user</p></div></header><div class="panel-body"><form id="adminBillForm" class="form-grid"><div class="form-field form-span"><label>Wallet user<select name="userId" required>${users.map((user) => `<option value="${user.id}">${escapeHtml(user.name)} - ${escapeHtml(user.email)}</option>`).join("")}</select></label></div><div class="form-field"><label>Provider<input name="provider" placeholder="e.g. Tata Power" required></label></div><div class="form-field"><label>Category<select name="category"><option>Electricity</option><option>Mobile</option><option>Broadband</option><option>Gas</option><option>Water</option></select></label></div><div class="form-field"><label>Amount<input name="amount" type="number" min="1" required></label></div><div class="form-field"><label>Due date<input name="dueDate" type="text" placeholder="e.g. 20 Oct 2026" required></label></div><div class="form-actions form-span"><button class="button button-primary" type="submit">Create bill</button></div></form></div></article><article class="panel"><header class="panel-heading"><div><h3>Bill status</h3><p>${bills.filter((bill) => bill.status === "Due").length} currently due</p></div></header><div class="panel-body"><div class="progress-row"><div class="progress-label"><span>Due bills</span><span>${bills.filter((bill) => bill.status === "Due").length}</span></div><div class="progress-track"><div class="progress-value coral" style="width:${bills.length ? bills.filter((bill) => bill.status === "Due").length / bills.length * 100 : 0}%"></div></div></div><div class="info-strip"><span aria-hidden="true">i</span><span>Users can pay their own due bills from the Payments module.</span></div></div></article></section><section class="panel" style="margin-top:18px"><header class="panel-heading"><div><h3>All saved bill accounts</h3><p>Use the action to mark a bill as settled</p></div></header><div class="table-wrap"><table class="data-table"><thead><tr><th>Provider</th><th>User</th><th>Category</th><th>Amount</th><th>Due date</th><th>Status</th><th>Action</th></tr></thead><tbody>${bills.map((bill) => { const owner = users.find((user) => user.id === bill.userId); return `<tr><td><strong>${escapeHtml(bill.provider)}</strong><small>${escapeHtml(bill.account)}</small></td><td>${escapeHtml(owner ? owner.name : "Unknown")}</td><td>${escapeHtml(bill.category)}</td><td>${money(bill.amount)}</td><td>${escapeHtml(bill.dueDate)}</td><td><span class="status ${bill.status === "Paid" ? "paid" : "due"}">${escapeHtml(bill.status)}</span></td><td>${bill.status === "Due" ? `<button class="button button-small button-secondary" type="button" data-settle-bill="${bill.id}">Settle</button>` : "-"}</td></tr>`; }).join("")}</tbody></table></div></section>`;
}
function renderControls() {
  const settings = getSettings();
  return `<div class="page-intro"><div><h2>System controls</h2><p>Manage the demonstration environment and platform preferences.</p></div></div><section class="content-grid equal"><article class="panel"><header class="panel-heading"><div><h3>Platform settings</h3><p>Saved locally in this browser</p></div></header><div class="panel-body"><form id="adminSettingsForm"><div class="toggle-row"><div class="toggle-copy"><strong>Maintenance mode</strong><span>Display a maintenance notice to wallet users</span></div><label class="switch"><input name="maintenance" type="checkbox" ${settings.maintenance ? "checked" : ""}><span></span></label></div><div class="form-field" style="margin-top:16px"><label>Daily transfer limit<input name="dailyTransferLimit" type="number" min="1000" value="${settings.dailyTransferLimit}" required></label></div><div class="form-field" style="margin-top:14px"><label>Support email<input name="supportEmail" type="email" value="${escapeHtml(settings.supportEmail || "")}" required></label></div><div class="form-actions"><button class="button button-primary" type="submit">Save controls</button></div></form></div></article><article class="panel"><header class="panel-heading"><div><h3>Demo management</h3><p>Useful before presenting the project again</p></div></header><div class="panel-body"><div class="info-strip"><span aria-hidden="true">i</span><span><strong>Reset demo data</strong> restores all seeded accounts, bills, balances, and transactions. It is deliberately only available to the admin.</span></div><div class="form-actions"><button class="button button-danger" type="button" data-action="reset-demo">Reset demo data</button></div></div></article></section>`;
}

function buildQr() {
  const target = document.getElementById("qrGrid"); if (!target) return;
  let html = "";
  for (let y = 0; y < 21; y += 1) for (let x = 0; x < 21; x += 1) {
    const finder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
    const finderBorder = finder && ((x % 6 === 0 || y % 6 === 0) || (x % 6 === 4 && y % 6 === 4));
    const finderCenter = finder && x % 6 >= 2 && x % 6 <= 4 && y % 6 >= 2 && y % 6 <= 4;
    const dark = finderBorder || finderCenter || (!finder && ((x * 11 + y * 7 + x * y) % 5 < 2));
    html += `<span class="qr-cell${dark ? " dark" : ""}"></span>`;
  }
  target.innerHTML = html;
}

function addMoney(form) {
  const user = currentUser(); const amount = Number(new FormData(form).get("amount")); const source = new FormData(form).get("source");
  if (!amount || amount <= 0) return toast("Enter a valid amount", "The amount must be greater than zero.", true);
  user.balance += amount; setUser(user); pushTransaction({ id: uid("tx"), userId: user.id, type: "credit", category: "Top up", title: `Money added from ${source}`, amount, createdAt: new Date().toISOString(), status: "Success" }); pushNotice(user.id, "Money added", `${money(amount)} was added to your wallet from ${source}.`); toast("Money added", `${money(amount)} is now available in your wallet.`); renderShell(user);
}
function sendMoney(form) {
  const user = currentUser(); const data = new FormData(form); const recipientValue = String(data.get("recipient")).trim(); const amount = Number(data.get("amount")); const limit = getSettings().dailyTransferLimit;
  if (!amount || amount <= 0) return toast("Enter a valid amount", "The amount must be greater than zero.", true);
  if (amount > user.balance) return toast("Not enough balance", "Add money before making this transfer.", true);
  if (amount > limit) return toast("Transfer limit reached", `The admin limit is ${money(limit)} per transfer.`, true);
  const target = getUsers().find((candidate) => candidate.id !== user.id && (candidate.name.toLowerCase() === recipientValue.toLowerCase() || candidate.email.toLowerCase() === recipientValue.toLowerCase()));
  user.balance -= amount; setUser(user); pushTransaction({ id: uid("tx"), userId: user.id, type: "debit", category: "Transfer", title: `Sent to ${target ? target.name : recipientValue}`, amount, createdAt: new Date().toISOString(), status: "Success" });
  if (target && target.role === "user") { target.balance += amount; setUser(target); pushTransaction({ id: uid("tx"), userId: target.id, type: "credit", category: "Transfer", title: `Received from ${user.name}`, amount, createdAt: new Date().toISOString(), status: "Success" }); pushNotice(target.id, "Money received", `${user.name} sent you ${money(amount)}.`); }
  pushNotice(user.id, "Transfer successful", `${money(amount)} was sent to ${target ? target.name : recipientValue}.`); pushNotice("admin-001", "New wallet transfer", `${user.name} sent ${money(amount)} to ${target ? target.name : recipientValue}.`); toast("Transfer complete", `${money(amount)} was sent successfully.`); renderShell(user);
}
function receiveMoney(form) {
  const user = currentUser(); const data = new FormData(form); const sender = String(data.get("sender")).trim(); const amount = Number(data.get("amount"));
  if (!amount || amount <= 0) return toast("Enter a valid amount", "The amount must be greater than zero.", true);
  user.balance += amount; setUser(user); pushTransaction({ id: uid("tx"), userId: user.id, type: "credit", category: "Transfer", title: `Received from ${sender}`, amount, createdAt: new Date().toISOString(), status: "Success" }); pushNotice(user.id, "Money received", `${sender} sent you ${money(amount)}.`); toast("Money received", `${money(amount)} was added to your wallet.`); renderShell(user);
}
function qrPayment(form) {
  const user = currentUser(); const data = new FormData(form); const merchant = String(data.get("merchant")).trim(); const amount = Number(data.get("amount"));
  if (!amount || amount <= 0 || !merchant) return toast("Complete payment details", "Enter a merchant and a valid amount.", true);
  if (amount > user.balance) return toast("Not enough balance", "Add money before making this payment.", true);
  user.balance -= amount; setUser(user); pushTransaction({ id: uid("tx"), userId: user.id, type: "debit", category: "Food", title: `QR payment to ${merchant}`, amount, createdAt: new Date().toISOString(), status: "Success" }); pushNotice(user.id, "QR payment completed", `${money(amount)} was paid to ${merchant}.`); toast("Payment successful", `${money(amount)} was paid to ${merchant}.`); renderShell(user);
}
function payBill(form) {
  const user = currentUser(); const billId = new FormData(form).get("billId"); const bills = getBills(); const bill = bills.find((item) => item.id === billId && item.userId === user.id);
  if (!bill) return toast("Bill not found", "Choose a current due bill.", true);
  if (user.balance < bill.amount) return toast("Not enough balance", "Add money before paying this bill.", true);
  user.balance -= Number(bill.amount); setUser(user); bill.status = "Paid"; write(KEYS.bills, bills); pushTransaction({ id: uid("tx"), userId: user.id, type: "debit", category: "Bills", title: `${bill.provider} bill paid`, amount: bill.amount, createdAt: new Date().toISOString(), status: "Success" }); pushNotice(user.id, "Bill payment completed", `${money(bill.amount)} was paid to ${bill.provider}.`); pushNotice("admin-001", "Bill paid", `${user.name} paid ${money(bill.amount)} to ${bill.provider}.`); toast("Bill paid", `${bill.provider} has been marked as paid.`); renderShell(user);
}
function saveBudget(form) { const user = currentUser(); const limit = Number(new FormData(form).get("limit")); if (!limit || limit <= 0) return toast("Enter a valid budget", "The limit must be greater than zero.", true); const budgets = getBudgets().filter((item) => item.userId !== user.id); budgets.push({ userId: user.id, monthlyLimit: limit, month: currentMonthKey() }); write(KEYS.budgets, budgets); toast("Budget saved", `Your monthly budget is now ${money(limit)}.`); renderShell(user); }
function saveProfile(form) { const user = currentUser(); const name = String(new FormData(form).get("name")).trim(); if (!name) return toast("Name required", "Enter your full name.", true); user.name = name; setUser(user); toast("Profile saved", "Your account name was updated."); renderShell(user); }
function linkBank(form) { const user = currentUser(); const data = new FormData(form); const bank = String(data.get("bank")).trim(); const last4 = String(data.get("last4")).trim(); if (!bank || !/^\d{4}$/.test(last4)) return toast("Check account details", "Enter a bank name and four digits.", true); user.linkedBank = `${bank} ending ${last4}`; setUser(user); toast("Bank linked", `${bank} is ready for wallet top-ups.`); renderShell(user); }
function createAdminBill(form) { const data = new FormData(form); const userId = data.get("userId"); const provider = String(data.get("provider")).trim(); const category = String(data.get("category")); const amount = Number(data.get("amount")); const dueDate = String(data.get("dueDate")).trim(); const owner = getUsers().find((user) => user.id === userId); if (!owner || !provider || !amount || !dueDate) return toast("Complete bill details", "Fill all of the required bill fields.", true); const bills = getBills(); bills.unshift({ id: uid("bill"), userId, provider, category, account: "New bill account", amount, dueDate, status: "Due" }); write(KEYS.bills, bills); pushNotice(userId, "New bill added", `${provider} added a bill of ${money(amount)} due ${dueDate}.`); toast("Bill created", `A ${provider} bill was added for ${owner.name}.`); renderShell(currentUser()); }
function saveAdminSettings(form) { const data = new FormData(form); write(KEYS.settings, { maintenance: data.get("maintenance") === "on", dailyTransferLimit: Number(data.get("dailyTransferLimit")), supportEmail: String(data.get("supportEmail")) }); toast("Controls saved", "Platform settings were updated locally."); renderShell(currentUser()); }
function toggleUser(userId) { const user = getUsers().find((item) => item.id === userId); if (!user) return; user.status = user.status === "active" ? "blocked" : "active"; setUser(user); pushNotice(user.id, "Account status updated", `Your wallet account is now ${user.status}.`); toast("User updated", `${user.name} is now ${user.status}.`); renderShell(currentUser()); }
function settleBill(billId) { const bills = getBills(); const bill = bills.find((item) => item.id === billId); if (!bill) return; bill.status = "Paid"; write(KEYS.bills, bills); pushNotice(bill.userId, "Bill settled by admin", `${bill.provider} has been marked as paid.`); toast("Bill settled", `${bill.provider} has been marked paid.`); renderShell(currentUser()); }
function markAllRead() { const user = currentUser(); const notices = getNotices().map((notice) => notice.userId === user.id ? { ...notice, read: true } : notice); write(KEYS.notices, notices); toast("Notifications updated", "All account notifications are marked as read."); renderShell(user); }
function resetDemo() { seedData(true); write(KEYS.session, { userId: "admin-001" }); state.route = "adminDashboard"; toast("Demo data restored", "All seeded accounts and wallet activity are back."); renderShell(currentUser()); }
function exportTransactions() { const user = currentUser(); const rows = user.role === "admin" ? getTransactions() : userTransactions(user.id); const text = rows.map((tx) => `${dateText(tx.createdAt)} | ${tx.type.toUpperCase()} | ${tx.category} | ${tx.title} | ${money(tx.amount)} | ${tx.status}`).join("\n"); navigator.clipboard?.writeText(text).then(() => toast("Transaction view copied", "The current transaction list was copied to your clipboard.")).catch(() => toast("Transaction view ready", "Your browser blocked clipboard access; the history remains visible here.")); }

function login(form) {
  const data = new FormData(form); const email = String(data.get("email") || "").trim().toLowerCase(); const password = String(data.get("password") || ""); const user = getUsers().find((item) => item.email.toLowerCase() === email && item.password === password);
  if (!user) return toast("Sign in failed", "Check your demo email and password.", true);
  if (user.status !== "active") return toast("Account unavailable", "This account has been blocked by the administrator.", true);
  write(KEYS.session, { userId: user.id }); state.route = user.role === "admin" ? "adminDashboard" : "dashboard"; toast("Welcome back", `Signed in as ${user.role === "admin" ? "Administrator" : user.name}.`); renderShell(user);
}
function signup(form) {
  const data = new FormData(form); const name = String(data.get("name") || "").trim(); const email = String(data.get("email") || "").trim().toLowerCase(); const password = String(data.get("password") || "");
  if (!name || !email || password.length < 4) return toast("Complete signup", "Use a name, valid email, and password of at least 4 characters.", true);
  if (getUsers().some((user) => user.email.toLowerCase() === email)) return toast("Email already registered", "Sign in instead or use another email address.", true);
  const user = { id: uid("user"), name, email, password, role: "user", status: "active", balance: 0, createdAt: new Date().toISOString(), linkedBank: "" }; const users = getUsers(); users.push(user); write(KEYS.users, users); const budgets = getBudgets(); budgets.push({ userId: user.id, monthlyLimit: 20000, month: currentMonthKey() }); write(KEYS.budgets, budgets); pushNotice(user.id, "Welcome to WalletWise", "Your wallet is ready. Link a bank account and add money to begin."); pushNotice("admin-001", "New user registered", `${name} created a new wallet account.`); write(KEYS.session, { userId: user.id }); state.route = "dashboard"; toast("Wallet created", "Your new wallet is ready to use."); renderShell(user);
}
function setAuthMode(mode) { const signupMode = mode === "signup"; document.getElementById("loginForm").classList.toggle("hidden", signupMode); document.getElementById("signupForm").classList.toggle("hidden", !signupMode); document.getElementById("authTitle").textContent = signupMode ? "Create your wallet" : "Sign in to your wallet"; document.getElementById("authSubtitle").textContent = signupMode ? "It takes less than a minute to get started." : "Manage your money with clarity and confidence."; }
function logout() { localStorage.removeItem(KEYS.session); document.getElementById("appView").classList.add("hidden"); document.getElementById("authView").classList.remove("hidden"); document.getElementById("loginForm").reset(); setAuthMode("login"); toast("Signed out", "You have safely signed out of this demo wallet."); }

document.addEventListener("submit", (event) => {
  const handlers = { loginForm: login, signupForm: signup, addMoneyForm: addMoney, sendMoneyForm: sendMoney, receiveMoneyForm: receiveMoney, qrPayForm: qrPayment, billPayForm: payBill, budgetForm: saveBudget, profileForm: saveProfile, linkBankForm: linkBank, adminBillForm: createAdminBill, adminSettingsForm: saveAdminSettings };
  const handler = handlers[event.target.id]; if (!handler) return; event.preventDefault(); handler(event.target);
});
document.addEventListener("click", (event) => {
  const route = event.target.closest("[data-route]"); if (route) { navigate(route.dataset.route); return; }
  const authMode = event.target.closest("[data-auth-mode]"); if (authMode) { setAuthMode(authMode.dataset.authMode); return; }
  const demo = event.target.closest("[data-demo]"); if (demo) { const admin = demo.dataset.demo === "admin"; document.getElementById("loginEmail").value = admin ? "admin@walletwise.demo" : "user@walletwise.demo"; document.getElementById("loginPassword").value = admin ? "admin123" : "user123"; setAuthMode("login"); return; }
  const filter = event.target.closest("[data-filter]"); if (filter) { state.transactionFilter = filter.dataset.filter; renderShell(currentUser()); return; }
  const toggle = event.target.closest("[data-toggle-user]"); if (toggle) { toggleUser(toggle.dataset.toggleUser); return; }
  const settle = event.target.closest("[data-settle-bill]"); if (settle) { settleBill(settle.dataset.settleBill); return; }
  const action = event.target.closest("[data-action]"); if (!action) return;
  const actions = { logout, "mark-all-read": markAllRead, "reset-demo": resetDemo, "export-transactions": exportTransactions, "focus-budget": () => document.getElementById("budgetLimit")?.focus() };
  actions[action.dataset.action]?.();
});
document.addEventListener("change", (event) => {
  const setting = event.target.dataset.setting;
  if (!setting) return;
  const user = currentUser(); if (!user) return;
  user.preferences = { paymentAlerts: true, transactionPin: false, biometric: false, ...(user.preferences || {}), [setting]: event.target.checked };
  setUser(user);
  toast("Preference saved", "Your security preference was updated.");
});
document.getElementById("globalSearch").addEventListener("input", (event) => { state.search = event.target.value.trim(); const user = currentUser(); if (!user) return; if (user.role === "admin" && !["users", "adminTransactions"].includes(state.route)) state.route = "adminTransactions"; if (user.role === "user" && state.route !== "transactions") state.route = "transactions"; renderShell(user); document.getElementById("globalSearch").value = state.search; document.getElementById("globalSearch").focus(); });
document.getElementById("menuButton").addEventListener("click", () => document.getElementById("sidebar").classList.toggle("open"));

seedData();
const sessionUser = currentUser();
if (sessionUser) { state.route = sessionUser.role === "admin" ? "adminDashboard" : "dashboard"; renderShell(sessionUser); }
