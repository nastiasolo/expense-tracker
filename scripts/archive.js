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
  const categories = data.categories;
  const totalExpenses = Object.values(categories).reduce((a, b) => a + b, 0);

  if (totalExpenses === 0) return;

  const bar = document.createElement("div");
  bar.className = "expenses-bar";

  Object.entries(categories).forEach(([cat, amount]) => {
    const segment = document.createElement("div");
    segment.className = "expense-bar-segment";
    segment.style.width = (amount / totalExpenses) * 100 + "%";
    segment.style.backgroundColor = categoryColors[cat];
    bar.appendChild(segment);
  });

  container.appendChild(bar);

  const list = document.createElement("div");
  list.className = "expenses-bar-list";

  const maxAmount = Math.max(...Object.values(categories));

  Object.entries(categories).forEach(([cat, amount]) => {
    const widthPercent = (amount / maxAmount) * 100;

    const item = document.createElement("div");
    item.className = "expense-bar-item";

    item.innerHTML = `
      <div class="category-bar-wrapper">
        <div class="category-bar"
          style="background-color:${categoryColors[cat]};
                 width:${widthPercent}%">
        </div>
        <span class="category-title">${categoryLabels[cat]}</span>
      </div>
      <p>${amount.toFixed(2)} kr</p>
    `;

    list.appendChild(item);
  });

  container.appendChild(list);
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

        monthBlock.innerHTML = `<h4>${data.name}</h4>`;

        renderMonthBars(data, monthBlock);

        yearBlock.appendChild(monthBlock);
      });

    barContainer.appendChild(yearBlock);
  });
