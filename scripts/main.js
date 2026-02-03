import { loadData, saveData } from "./storage.js";
import { formatDate, isCurrentMonth } from "./utils.js";
import { categoryColors, categoryLabels } from "./constants.js";

const data = loadData();
let monthlyIncome = data.income;
const allExpenses = data.expenses;
const hasSavedData = data.expenses.length > 0;

document.body.classList.add("loading");

window.addEventListener("load", () => {
  const loader = document.querySelector(".loader-overlay");

  setTimeout(() => {
    loader.remove();
    document.body.classList.remove("loading");

    if (!hasSavedData) {
      dialog.showModal();
    }
  }, 3100);
});

// const allExpenses = [];
console.log(allExpenses);

function renderAllExpenses() {
  list.innerHTML = "";

  const currentMonthExpenses = allExpenses
    .filter((exp) => isCurrentMonth(exp.date))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  currentMonthExpenses.forEach(renderExpense);
}

function renderExpense(expense) {
  const { title, amount, category, date } = expense;
  const { day, weekday } = formatDate(date);

  let daySection = document.querySelector(`[data-day="${date}"]`);

  if (!daySection) {
    daySection = document.createElement("div");
    daySection.className = "day-section";
    daySection.dataset.day = date;

    daySection.innerHTML = `
      <div class="day-header">
        <div class="day-date">
          <span class="day-number">${day}</span>
          <span class="day-name">${weekday}</span>
        </div>
        <span class="day-total">0 kr</span>
      </div>
      <div class="day-items"></div>
    `;

    list.appendChild(daySection);
  }

  const itemsContainer = daySection.querySelector(".day-items");

  const item = document.createElement("div");
  item.className = "expense-item";
  item.innerHTML = `
    <span class="expense-title">${title}</span>
      <div class="expense-right">
    <span class="expense-amount badge"
      style="background-color:${categoryColors[category]}">
      -${amount.toFixed(2)} kr
    </span>
    <button class="expense-delete" data-id="${expense.id}" aria-label="Delete">
      ✕
    </button>
    </div>
  `;

  itemsContainer.appendChild(item);

  const totalEl = daySection.querySelector(".day-total");
  const current = parseFloat(totalEl.textContent) || 0;
  totalEl.textContent = `${(current - amount).toFixed(2)} kr`;
}

// DYNAMIC HEADING
const heading = document.querySelector(".app-heading");

const currentDate = new Date();
const monthName = currentDate
  .toLocaleString("en-US", { month: "long" })
  .toUpperCase();

heading.textContent = `${monthName} EXPENSE TRACKER`;

const dialog = document.querySelector(".income-dialog");
const dialogInput = dialog.querySelector("input");

dialog.addEventListener("close", () => {
  const value = parseFloat(dialogInput.value);

  if (isNaN(value) || value <= 0) {
    dialog.showModal();
    return;
  }

  monthlyIncome = value;
  saveData(monthlyIncome, allExpenses);

  document.querySelector(".total-income").textContent =
    `${monthlyIncome.toFixed(2)} kr`;
});

document.querySelector(".total-income").textContent = `${monthlyIncome.toFixed(
  2,
)} kr`;

const dateInput = document.getElementById("date");

const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, "0");
const dd = String(today.getDate()).padStart(2, "0");

dateInput.value = `${yyyy}-${mm}-${dd}`;

// make it only for current month
const firstDay = `${yyyy}-${mm}-01`;
const lastDay = `${yyyy}-${mm}-${new Date(
  yyyy,
  today.getMonth() + 1,
  0,
).getDate()}`;

const addBtn = document.querySelector(".add-button");
const expenseInput = document.getElementById("expense");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const list = document.querySelector(".expenses-list");

const totalParagr = document.querySelector(".total-expenses");

addBtn.addEventListener("click", function () {
  const title = expenseInput.value.trim();
  const amount = parseFloat(amountInput.value.replace(",", "."));
  const category = categoryInput.value;
  const date = dateInput.value;

  if (!title || !amount || !date) {
    alert("Please fill out all fields!");
    return;
  }

  const expense = { id: crypto.randomUUID(), title, amount, category, date };

  allExpenses.push(expense);
  saveData(monthlyIncome, allExpenses);

  renderAllExpenses();
  updateCategorySummary();

  expenseInput.value = "";
  amountInput.value = "";
  dateInput.value = "";
});

list.addEventListener("click", (e) => {
  if (!e.target.classList.contains("expense-delete")) return;

  const id = e.target.dataset.id;

  const index = allExpenses.findIndex((exp) => exp.id === id);
  if (index === -1) return;

  allExpenses.splice(index, 1);

  saveData(monthlyIncome, allExpenses);
  renderAllExpenses();
  updateCategorySummary();
});

function updateCategorySummary() {
  const bar = document.querySelector(".expenses-bar");
  const list = document.querySelector(".expenses-bar-list");

  bar.innerHTML = "";
  list.innerHTML = "";

  const currentMonthExpenses = allExpenses.filter((exp) =>
    isCurrentMonth(exp.date),
  );

  if (currentMonthExpenses.length === 0) {
    totalParagr.textContent = "0.00 kr";
    return;
  }

  const categoryTotals = {};

  currentMonthExpenses.forEach((exp) => {
    if (!categoryTotals[exp.category]) {
      categoryTotals[exp.category] = 0;
    }
    categoryTotals[exp.category] += exp.amount;
  });

  const totalSpent = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  totalParagr.textContent = `${totalSpent.toFixed(2)} kr`;

  // TOTAL EXPENSES BAR
  Object.entries(categoryTotals).forEach(([cat, amount]) => {
    const div = document.createElement("div");
    div.className = "expense-bar-segment";
    div.style.width = (amount / totalSpent) * 100 + "%";
    div.style.backgroundColor = categoryColors[cat];
    bar.appendChild(div);
  });

  // LIST
  const maxAmount = Math.max(...Object.values(categoryTotals));

  Object.entries(categoryTotals).forEach(([cat, amount]) => {
    const widthPercent = (amount / maxAmount) * 100;

    const item = document.createElement("div");
    item.className = "expense-bar-item";

    item.innerHTML = `
      <div class="category-bar-wrapper">
        <div class="category-bar" 
             style="background-color: ${
               categoryColors[cat]
             }; width: ${widthPercent}%;">
        </div>
        <span class="category-title">${categoryLabels[cat]}</span>
      </div>
      <p>${amount.toFixed(2)} kr</p>
  `;

    list.appendChild(item);
  });
}

renderAllExpenses();
updateCategorySummary();
