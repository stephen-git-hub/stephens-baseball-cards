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
  const rcBadge   = card.rookie_card ? '<span class="badge badge-rc">RC</span>' : '';
  const autoBadge  = card.autograph   ? '<span class="badge badge-auto">Auto</span>' : '';
  const badges     = rcBadge + autoBadge;
  const dualBadge  = card.rookie_card && card.autograph ? ' dual-badge' : '';

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
        <div class="card-player-row">
          <img src="Cubical_Logo.jpg" alt="" class="card-logo" />
          <div>
            <div class="card-player">${card.player}</div>
            <div class="card-team">${card.team}</div>
          </div>
        </div>
        <div class="card-badges${dualBadge}">
          ${badges}
          <svg class="position-diamond" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
            <polygon points="22,4 40,22 22,40 4,22" fill="#c8b98a" opacity="0.9"/>
            <polygon points="22,4 40,22 22,40 4,22" fill="none" stroke="#8b6a3a" stroke-width="1.2"/>
            <line x1="22" y1="4"  x2="40" y2="22" stroke="#8b6a3a" stroke-width="0.7" opacity="0.5"/>
            <line x1="40" y1="22" x2="22" y2="40" stroke="#8b6a3a" stroke-width="0.7" opacity="0.5"/>
            <line x1="22" y1="40" x2="4"  y2="22" stroke="#8b6a3a" stroke-width="0.7" opacity="0.5"/>
            <line x1="4"  y1="22" x2="22" y2="4"  stroke="#8b6a3a" stroke-width="0.7" opacity="0.5"/>
            <rect x="19.5" y="1.5"  width="5" height="5" rx="0.8" fill="#f5efe0" stroke="#8b6a3a" stroke-width="0.8" transform="rotate(45 22 4)"/>
            <rect x="37.5" y="19.5" width="5" height="5" rx="0.8" fill="#f5efe0" stroke="#8b6a3a" stroke-width="0.8" transform="rotate(45 40 22)"/>
            <rect x="19.5" y="37.5" width="5" height="5" rx="0.8" fill="#f5efe0" stroke="#8b6a3a" stroke-width="0.8" transform="rotate(45 22 40)"/>
            <rect x="1.5"  y="19.5" width="5" height="5" rx="0.8" fill="#f5efe0" stroke="#8b6a3a" stroke-width="0.8" transform="rotate(45 4 22)"/>
            <text x="22" y="27" text-anchor="middle" font-family="Caveat, cursive" font-size="11" font-weight="700" fill="#6b1a1a">${card.position}</text>
          </svg>
        </div>
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

// ── Hotdog rain on card hover ──
const HOTDOGS = ['🌭','🌭','🌭','🌭','🌭'];

document.getElementById('card-grid').addEventListener('mouseover', function(e) {
  const top = e.target.closest('.card-top');
  if (!top || top.querySelector('.emoji-rain')) return;

  const rain = document.createElement('div');
  rain.className = 'emoji-rain';
  top.appendChild(rain);

  function spawnDrop() {
    if (!top.querySelector('.emoji-rain')) return;
    const drop = document.createElement('span');
    drop.className   = 'emoji-drop';
    drop.textContent = '🌭';
    drop.style.left              = (Math.random() * 100) + '%';
    drop.style.fontSize          = (11 + Math.floor(Math.random() * 8)) + 'px';
    drop.style.animationDelay    = '0s';
    drop.style.animationDuration = (0.8 + Math.random() * 0.5) + 's';
    rain.appendChild(drop);
    setTimeout(() => drop.remove(), 1400);
    if (top.querySelector('.emoji-rain')) {
      setTimeout(spawnDrop, 80 + Math.random() * 100);
    }
  }

  spawnDrop();
});

document.getElementById('card-grid').addEventListener('mouseout', function(e) {
  const top = e.target.closest('.card-top');
  if (!top) return;
  const rain = top.querySelector('.emoji-rain');
  if (rain) rain.remove();
});
