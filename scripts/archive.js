import { loadData } from "./storage.js";
import { categoryColors, categoryLabels } from "./constants.js";

const { income, expenses } = loadData();

const archiveData = {};

const listContainer = document.querySelector(".archive-expenses-list");
const barContainer = document.querySelector(".expenses-bar-list");

expenses.forEach((exp) => {
  const date = new Date(exp.date);
  const year = date.getFullYear();
  const month = date.toLocaleString("en-US", { month: "long" });

  if (!archiveData[year]) {
    archiveData[year] = {};
  }

  if (!archiveData[year][month]) {
    archiveData[year][month] = {
      income,
      expenses: 0,
    };
  }

  archiveData[year][month].expenses += exp.amount;
});

Object.entries(archiveData)
  .sort((a, b) => b[0] - a[0]) // годы ↓
  .forEach(([year, months]) => {
    const yearBlock = document.createElement("div");
    yearBlock.className = "archive-year";
    yearBlock.innerHTML = `<h2>${year}</h2>`;

    Object.entries(months).forEach(([month, data]) => {
      const saldo = data.income - data.expenses;

      const row = document.createElement("div");
      row.className = "archive-month-row";
      row.innerHTML = `
        <span class="month-name">${month}</span>
        <span class="month-income">+${data.income.toFixed(2)} kr</span>
        <span class="month-expenses">-${data.expenses.toFixed(2)} kr</span>
        <span class="month-saldo ${saldo >= 0 ? "positive" : "negative"}">
          ${saldo.toFixed(2)} kr
        </span>
      `;

      yearBlock.appendChild(row);
    });

    listContainer.appendChild(yearBlock);
  });

const grouped = {};

expenses.forEach((exp) => {
  const d = new Date(exp.date);
  const year = d.getFullYear();
  const monthIndex = d.getMonth();
  const monthName = d.toLocaleString("en-US", { month: "long" });

  if (!grouped[year]) grouped[year] = {};
  if (!grouped[year][monthIndex]) {
    grouped[year][monthIndex] = {
      name: monthName,
      income,
      totalExpenses: 0,
      categories: {},
    };
  }

  grouped[year][monthIndex].totalExpenses += exp.amount;

  if (!grouped[year][monthIndex].categories[exp.category]) {
    grouped[year][monthIndex].categories[exp.category] = 0;
  }

  grouped[year][monthIndex].categories[exp.category] += exp.amount;
});

function renderMonthBars(data, container) {
  const max = Math.max(data.income, data.totalExpenses) || 1;

  const incomeWidth = (data.income / max) * 100;

  // INCOME BAR
  // const incomeBar = document.createElement("div");
  // incomeBar.className = "month-bar income-bar";
  // incomeBar.innerHTML = `
  //   <div class="month-bar-income" style="width:${incomeWidth}%"></div>
  // `;

  // EXPENSES BAR
  const expensesBar = document.createElement("div");
  expensesBar.className = "month-bar expenses-bar";

  Object.entries(data.categories).forEach(([cat, amount]) => {
    const segment = document.createElement("div");
    segment.className = "expense-bar-segment";
    segment.style.backgroundColor = categoryColors[cat];
    expensesBar.appendChild(segment);
  });

  // const expensesLabel = document.createElement("span");
  // expensesLabel.className = "bar-label";
  // expensesLabel.textContent = `-${data.totalExpenses.toFixed(2)} kr`;

  // container.appendChild(incomeBar);
  container.appendChild(expensesBar);
  // container.appendChild(expensesLabel);
}

Object.entries(grouped)
  .sort((a, b) => b[0] - a[0])
  .forEach(([year, months]) => {
    const yearBlock = document.createElement("div");
    yearBlock.className = "archive-year";
    yearBlock.innerHTML = `<h2>${year}</h2>`;

    Object.entries(months)
      .sort((a, b) => b[0] - a[0])
      .forEach(([_, data]) => {
        const monthBlock = document.createElement("div");
        monthBlock.className = "archive-month-block";
        monthBlock.innerHTML = `<h3>${data.name}</h3>`;

        renderMonthBars(data, monthBlock);

        yearBlock.appendChild(monthBlock);
      });

    barContainer.appendChild(yearBlock);
  });
