window.W_results_explorer = function init(root) {
  const tabsEl = root.querySelector('[data-results="tabs"]');
  const panelEl = root.querySelector('[data-results="panel"]');
  const data = (window.PI07_RESULTS && window.PI07_RESULTS.tabs) || [];
  let active = data[0] ? data[0].id : null;

  function renderTabs() {
    tabsEl.innerHTML = '';
    data.forEach(tab => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'lab-tab';
      button.textContent = tab.label;
      button.setAttribute('aria-pressed', tab.id === active ? 'true' : 'false');
      button.addEventListener('click', () => {
        active = tab.id;
        render();
      });
      tabsEl.appendChild(button);
    });
  }

  function renderPanel() {
    const tab = data.find(item => item.id === active) || data[0];
    panelEl.innerHTML = '';
    if (!tab) return;

    const head = document.createElement('div');
    head.className = 'results-head';
    head.innerHTML = `
      <span>${tab.figure}</span>
      <h4>${tab.title}</h4>
      <p>${tab.summary}</p>
    `;
    panelEl.appendChild(head);

    const table = document.createElement('div');
    table.className = 'result-table';
    table.setAttribute('role', 'table');
    table.innerHTML = `
      <div class="result-row result-header" role="row">
        <span>Task</span><span>Measured</span><span>Reported result</span>
      </div>
    `;
    tab.rows.forEach(row => {
      const item = document.createElement('div');
      item.className = 'result-row';
      item.setAttribute('role', 'row');
      item.innerHTML = `
        <span>${row.task}</span>
        <span>${row.measure}</span>
        <span><strong>${row.result}</strong><em>${row.evidence}</em></span>
      `;
      table.appendChild(item);
    });
    panelEl.appendChild(table);

    const source = document.createElement('p');
    source.className = 'source-note';
    source.innerHTML = `Source: <a href="${tab.sourceUrl}" target="_blank" rel="noopener">${tab.source}</a>. This explorer avoids invented numeric bars where exact values are only visible in the paper figure.`;
    panelEl.appendChild(source);
  }

  function render() {
    renderTabs();
    renderPanel();
  }

  render();
};
