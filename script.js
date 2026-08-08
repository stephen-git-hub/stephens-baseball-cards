// ── Load data and boot the app ──
let allCards = [];

fetch('cards.json')
  .then(res => res.json())
  .then(data => {
    allCards = data;
    buildFilters(data);
    updateStats(data);
    renderCards(data);
  })
  .catch(() => {
    document.getElementById('card-grid').innerHTML =
      '<p class="no-results">Could not load cards.json. Make sure it is in the same folder as this file.</p>';
  });

// ── Build year and brand dropdowns from actual data ──
function buildFilters(cards) {
  const years  = [...new Set(cards.map(c => c.year))].sort((a, b) => b - a);
  const brands = [...new Set(cards.map(c => c.brand))].sort();

  const yearSel  = document.getElementById('filter-year');
  const brandSel = document.getElementById('filter-brand');

  years.forEach(y => {
    const opt = document.createElement('option');
    opt.value = y; opt.textContent = y;
    yearSel.appendChild(opt);
  });

  brands.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b; opt.textContent = b;
    brandSel.appendChild(opt);
  });
}

// ── Header stats ──
function updateStats(cards) {
  const totalValue = cards.reduce((sum, c) => sum + (c.estimated_value || 0), 0);
  document.getElementById('total-count').textContent = cards.length;
  document.getElementById('rc-count').textContent    = cards.filter(c => c.rookie_card).length;
  document.getElementById('total-value').textContent = '$' + totalValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// ── Filter + search logic ──
function getFiltered() {
  const query   = document.getElementById('search').value.toLowerCase().trim();
  const year    = document.getElementById('filter-year').value;
  const brand   = document.getElementById('filter-brand').value;
  const special = document.getElementById('filter-special').value;

  return allCards.filter(card => {
    if (query) {
      const haystack = [card.player, card.team, card.set, card.brand, card.year, card.card_number]
        .join(' ').toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (year    && String(card.year)  !== year)  return false;
    if (brand   && card.brand         !== brand)  return false;
    if (special === 'rookie' && !card.rookie_card) return false;
    if (special === 'auto'   && !card.autograph)   return false;
    return true;
  });
}

// ── Wire up live filtering ──
['search', 'filter-year', 'filter-brand', 'filter-special'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    const filtered = getFiltered();
    renderCards(filtered);
    updateStats(filtered);
  });
});

// ── Render card grid ──
function renderCards(cards) {
  const grid  = document.getElementById('card-grid');
  const label = document.getElementById('results-label');

  label.textContent = cards.length === allCards.length
    ? `Showing all ${cards.length} cards`
    : `Showing ${cards.length} of ${allCards.length} cards`;

  if (cards.length === 0) {
    grid.innerHTML = '<p class="no-results">No cards match your search.</p>';
    return;
  }

  grid.innerHTML = cards.map(cardHTML).join('');
}

// ── Build HTML for a single card ──
function cardHTML(card) {
  const badges = [
    card.rookie_card ? '<span class="badge badge-rc">RC</span>' : '',
    card.autograph   ? '<span class="badge badge-auto">Auto</span>' : ''
  ].join('');

  const value = card.estimated_value
    ? '$' + card.estimated_value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '—';

  const notes = card.notes
    ? `<div class="card-notes">${card.notes}</div>`
    : '';

  return `
    <div class="card">
      <div class="card-top">
        <div class="card-year-brand">${card.year} &middot; ${card.brand}</div>
        <div class="card-player">${card.player}</div>
        <div class="card-team">${card.team}</div>
        <div class="card-badges">${badges}</div>
      </div>
      <div class="card-body">
        <div class="card-row">
          <span class="row-label">Set</span>
          <span class="row-value">${card.set}</span>
        </div>
        <div class="card-row">
          <span class="row-label">Card #</span>
          <span class="row-value">#${card.card_number}</span>
        </div>
        <div class="card-row">
          <span class="row-label">Position</span>
          <span class="row-value">${card.position}</span>
        </div>
        <div class="card-row">
          <span class="row-label">Condition</span>
          <span class="row-value">${card.condition || '—'}</span>
        </div>
        <div class="card-row">
          <span class="row-label">Est. value</span>
          <span class="row-value value-money">${value}</span>
        </div>
        ${notes}
      </div>
    </div>`;
}
