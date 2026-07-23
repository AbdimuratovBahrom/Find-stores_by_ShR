
// Транслитерация
const uz_cyr_to_lat = {
  'а':'a','А':'A','б':'b','Б':'B','в':'v','В':'V','г':'g','Г':'G','д':'d','Д':'D',
  'е':'e','Е':'E','ё':'yo','Ё':'Yo','ж':'j','Ж':'J','з':'z','З':'Z','и':'i','И':'I',
  'й':'y','Й':'Y','к':'k','К':'K','л':'l','Л':'L','м':'m','М':'M','н':'n','Н':'N',
  'о':'o','О':'O','п':'p','П':'P','р':'r','Р':'R','с':'s','С':'S','т':'t','Т':'T',
  'у':'u','У':'U','ф':'f','Ф':'F','х':'x','Х':'X','ц':'ts','Ц':'Ts','ч':'ch','Ч':'Ch',
  'ш':'sh','Ш':'Sh','щ':'sh','Щ':'Sh','ъ':"'",'Ъ':"'",'ы':'i','Ы':'I','ь':'','Ь':'',
  'э':'e','Э':'E','ю':'yu','Ю':'Yu','я':'ya','Я':'Ya','ғ':"g'",'Ғ':"G'",'қ':'q','Қ':'Q',
  'ҳ':'h','Ҳ':'H','ў':"o'",'Ў':"O'"
};

function transliterate(text) {
  return text.split('').map(c => uz_cyr_to_lat[c] || c).join('');
}

let data = [];
let dataLoadError = false;
let currentLang = localStorage.getItem('shr_lang') || 'ru';
let t = translations[currentLang];

// ── Цветные чипы пути (та же схема, что и в abusaxiy) ──────────────────
function getChipType(part) {
  if (/^ТП-/i.test(part))             return 'tp';
  if (/^(Т1|Т2)$/i.test(part))        return 'transformer';
  if (/^ВРУ/i.test(part))             return 'vru';
  if (/^ЩР|^[Шш]ит/i.test(part))     return 'shr';
  if (/^ЯРВ|^АВР/i.test(part))       return 'yarv';
  if (/^ШО-/i.test(part))             return 'sho';
  if (/блок/i.test(part))             return 'block';
  if (/[Рр]яд/i.test(part))          return 'row';
  return 'default';
}

// ── Тема (авто по ОС + переключатель, персист в localStorage) ─────────
function applyTheme(theme) {
  const btn = document.getElementById('themeToggle');
  if (theme === 'dark' || theme === 'light') {
    document.documentElement.setAttribute('data-theme', theme);
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  const isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (btn) btn.textContent = isDark ? '☀️' : '🌙';
}

// ── Недавние запросы ────────────────────────────────────────────────────
function getRecentSearches() {
  try { return JSON.parse(localStorage.getItem('shr_recent_searches') || '[]'); }
  catch { return []; }
}
function addRecentSearch(query) {
  if (!query) return;
  let list = getRecentSearches().filter(q => q !== query);
  list.unshift(query);
  list = list.slice(0, 5);
  localStorage.setItem('shr_recent_searches', JSON.stringify(list));
  renderRecentSearches();
}
function renderRecentSearches() {
  const el = document.getElementById('recentSearches');
  if (!el) return;
  const list = getRecentSearches();
  el.innerHTML = list.map(q =>
    `<button type="button" class="ds-recent-chip" data-q="${q.replace(/"/g, '&quot;')}">${q}</button>`
  ).join('');
  el.querySelectorAll('.ds-recent-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('searchInput').value = btn.dataset.q;
      document.getElementById('clearBtn').style.display = 'block';
      performSearch();
    });
  });
}

// Нормализация для поиска (убираем всё лишнее)
function normalizeForSearch(str) {
  return str
    .toLowerCase()
    .replace(/[\s\-–—−•·.,;:!?()]+/g, '')   // все разделители → ''
    .replace(/ё/g, 'е')
    .replace(/ъ/g, "'")
    .replace(/ь/g, "")
    .trim();
}

// Обновление кнопок в зависимости от языка
function updateQuickButtons() {
  const container = document.getElementById('quickActions');
  if (!container) return;

  container.innerHTML = '';

  let buttonsConfig = [];

  if (currentLang === 'uz_latn') {
    buttonsConfig = [
      { display: 'ShR ', insert: 'ShR ' },
      { display: 'ShO-', insert: 'ShO-' },
      { display: 'Ryad ', insert: 'Ryad ' }
    ];
  } else {
    buttonsConfig = [
      { display: 'ЩР ', insert: 'ЩР ' },
      { display: 'ШО-', insert: 'ШО-' },
      { display: 'Ряд ', insert: 'Ряд ' }
    ];
  }

  buttonsConfig.forEach(config => {
    const btn = document.createElement('button');
    btn.className = 'chip-btn';
    btn.textContent = config.display;
    btn.onclick = () => addPrefix(config.insert);
    container.appendChild(btn);
  });
}

// Инициализация
document.addEventListener('DOMContentLoaded', async () => {
  document.querySelectorAll('.ds-lang-btn[data-lang]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
    btn.addEventListener('click', () => changeLanguage(btn.dataset.lang));
  });
  applyTranslations();
  updateQuickButtons();
  renderRecentSearches();

  applyTheme(localStorage.getItem('shr_theme'));
  document.getElementById('themeToggle').addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
      || (!document.documentElement.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const next = isDark ? 'light' : 'dark';
    localStorage.setItem('shr_theme', next);
    applyTheme(next);
  });

  try {
    const res = await fetch('data.json');
    data = await res.json();
  } catch (e) {
    dataLoadError = true;
    document.getElementById('resultsContainer').innerHTML = `<p style="color:red; text-align:center;">${t.error}</p>`;
  }

  document.getElementById('searchInput').addEventListener('keypress', e => {
    if (e.key === 'Enter') performSearch();
  });

  document.getElementById('searchInput').addEventListener('input', function() {
    document.getElementById('clearBtn').style.display = this.value ? 'block' : 'none';
  });
});

function applyTranslations() {
  t = translations[currentLang];
  document.getElementById('title').textContent = '⚡ ' + t.title;
  document.getElementById('searchInput').placeholder = t.placeholder;
  document.querySelector('.search-btn').textContent = t.search_btn;
  // Убрали перезапись .chip-btn — теперь они только через updateQuickButtons
}

function changeLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('shr_lang', lang);
  document.querySelectorAll('.ds-lang-btn[data-lang]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  applyTranslations();
  updateQuickButtons();
  performSearch();
}

function addPrefix(text) {
  const input = document.getElementById('searchInput');
  input.value = text;
  input.focus();
  document.getElementById('clearBtn').style.display = 'block';
}

function clearSearch() {
  document.getElementById('searchInput').value = '';
  document.getElementById('clearBtn').style.display = 'none';
  document.getElementById('resultsContainer').innerHTML = '';
}

function performSearch() {
  const rawQuery = document.getElementById('searchInput').value.trim();
  const container = document.getElementById('resultsContainer');

  if (dataLoadError) {
    container.innerHTML = `<div class="ds-empty"><span class="ds-empty-icon">⚠️</span>${t.error}</div>`;
    return;
  }

  if (!rawQuery) {
    container.innerHTML = '';
    return;
  }

  const userNorm = normalizeForSearch(rawQuery);

  const results = data.filter(item => {
    let pathNorm = normalizeForSearch(item.path);
    let shopsNorm = item.shops.map(s => normalizeForSearch(s));

    if (currentLang === 'uz_latn') {
      pathNorm = normalizeForSearch(transliterate(item.path));
      shopsNorm = item.shops.map(s => normalizeForSearch(transliterate(s)));
    }

    return pathNorm.includes(userNorm) ||
           shopsNorm.some(s => s.includes(userNorm));
  });

  container.innerHTML = '';

  if (results.length === 0) {
    container.innerHTML = `<div class="ds-empty"><span class="ds-empty-icon">🙈</span>${t.no_results}</div>`;
    addRecentSearch(rawQuery);
    return;
  }

  results.forEach(item => {
    const card = document.createElement('div');
    card.className = 'result-card';

    // Путь — отображаем в нужном алфавите, но тип чипа определяем по исходному (кириллица)
    const displayPath = (currentLang === 'uz_latn') ? transliterate(item.path) : item.path;
    const pathParts = displayPath.split('>').map(p => p.trim());
    const originalParts = item.path.split('>').map(p => p.trim());
    let pathHtml = '';

    pathParts.forEach((part, index) => {
      const normPart = normalizeForSearch(part);
      const isMatch = normPart.includes(userNorm);
      const chipType = getChipType(originalParts[index]);
      const className = 'path-step chip-' + chipType + (isMatch ? ' highlight' : '');
      pathHtml += `<span class="${className}">${part}</span>`;
      if (index < pathParts.length - 1) pathHtml += '<span class="arrow">➤</span>';
    });

    // Магазины
    let shopsHtml = `<div class="shops-list"><small>${t.stores_label}:</small><br>`;
    const displayShops = (currentLang === 'uz_latn') ? item.shops.map(s => transliterate(s)) : item.shops;

    displayShops.forEach(shop => {
      const normShop = normalizeForSearch(shop);
      const isMatch = normShop.includes(userNorm);
      const shopClass = isMatch ? 'shop-badge highlight' : 'shop-badge';
      shopsHtml += `<span class="${shopClass}">${shop}</span> `;
    });
    shopsHtml += '</div>';

    card.innerHTML = `<div class="path-display">${pathHtml}</div>${shopsHtml}`;
    container.appendChild(card);
  });

  addRecentSearch(rawQuery);
}
