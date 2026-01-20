const STORAGE_KEY = "expense-tracker-data";

const categoryLabels = {
  housing: "Housing",
  food: "Food & Groceries",
  transport: "Transportation",
  entertainment: "Entertainment",
  shopping: "Shopping",
  health: "Health",
  utilities: "Bills & Utilities",
};

const categoryColors = {
  housing: "#9b59b6",
  food: "#0b7a4eff",
  transport: "#e73cb4ff",
  entertainment: "#4DA8DA",
  shopping: "#E52020",
  health: "#00b894",
  utilities: "#FF9D23",
};

const allExpenses = [];
console.log(allExpenses);

function saveToStorage() {
  const data = {
    income: monthlyIncome,
    expenses: allExpenses,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadFromStorage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return false;

  const data = JSON.parse(saved);
  monthlyIncome = data.income || 0;
  allExpenses.push(...(data.expenses || []));

  return true;
}

function renderAllExpenses() {
  list.innerHTML = "";
  allExpenses.forEach(renderExpense);
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
    <span class="expense-amount badge"
      style="background-color:${categoryColors[category]}">
      -${amount.toFixed(2)} kr
    </span>
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

const hasSavedData = loadFromStorage();

if (!hasSavedData) {
  let input = prompt("Enter your income for this month:");

  if (input === null || input.trim() === "" || isNaN(input)) {
    monthlyIncome = 0;
  } else {
    monthlyIncome = parseFloat(input);
  }

  saveToStorage();
}

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
console.log(lastDay + "last day");

dateInput.min = firstDay;
dateInput.max = lastDay;

const addBtn = document.querySelector(".add-button");
const expenseInput = document.getElementById("expense");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const list = document.querySelector(".expenses-list");

const totalParagr = document.querySelector(".total-expenses");

function formatDate(inputDate) {
  const date = new Date(inputDate);
  const day = date.getDate();
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  return { day, weekday };
}

addBtn.addEventListener("click", function () {
  const title = expenseInput.value.trim();
  const amount = parseFloat(amountInput.value.replace(",", "."));
  const category = categoryInput.value;
  const date = dateInput.value;

  if (!title || !amount || !date) {
    alert("Please fill out all fields!");
    return;
  }

  const expense = { title, amount, category, date };

  allExpenses.push(expense);
  saveToStorage();

  renderExpense(expense);
  updateCategorySummary();

  expenseInput.value = "";
  amountInput.value = "";
  dateInput.value = "";
});

function updateCategorySummary() {
  const bar = document.querySelector(".expenses-bar");
  const list = document.querySelector(".expenses-bar-list");

  bar.innerHTML = "";
  list.innerHTML = "";

  if (allExpenses.length === 0) return;

  const categoryTotals = {};

  allExpenses.forEach((exp) => {
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
