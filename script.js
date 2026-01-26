// Переводы (аналогично вашему translations)
const translations = {
  ru: {
    title: 'Поиск схемы электропитания',
    placeholder: 'Введите ЩР, ШО, Ряд или номер магазина (например: ЩР 17, ШО-0, 25)...',
    search_btn: 'Найти',
    chip1: 'ЩР',
    chip2: 'ШО',
    chip3: 'Ряд',
    searching: 'Поиск...',
    no_results: 'Ничего не найдено 😕',
    error: 'Ошибка загрузки данных.',
    stores_label: 'МАГАЗИНЫ'
  },
  uz_cyrl: {
    title: 'Электр таъминоти схемасини қидириш',
    placeholder: 'ЩР, ШО, Ряд ёки дўкон рақамини киритинг (масалан: ЩР 17, ШО-0, 25)...',
    search_btn: 'Топиш',
    chip1: 'ЩР',
    chip2: 'ШО',
    chip3: 'Ряд',
    searching: 'Қидирув...',
    no_results: 'Ҳеч нарса топилмади 😕',
    error: 'Маълумот юклашда хато.',
    stores_label: 'ДЎКОНЛАР'
  },
  uz_latn: {
    title: "Elektr ta'minoti sxemasini qidirish",
    placeholder: "ShR, ShO, Ryad yoki do'kon raqamini kiriting (masalan: ShR 17, ShO-0, 25)...",
    search_btn: 'Topish',
    chip1: 'ShR',
    chip2: 'ShO',
    chip3: 'Ryad',
    searching: 'Qidiruv...',
    no_results: "Hech narsa topilmadi 😕",
    error: "Ma'lumot yuklashda xato.",
    stores_label: "DO'KONLAR"
  }
};

// Транслитерация (для поиска на латинице)
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
let currentLang = localStorage.getItem('lang') || 'ru';
let t = translations[currentLang];

// Инициализация
document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('langSelector').value = currentLang;
  applyTranslations();

  // Загрузка данных
  try {
    const res = await fetch('data.json');
    data = await res.json();
  } catch (e) {
    document.getElementById('resultsContainer').innerHTML = `<p style="color:red; text-align:center;">${t.error}</p>`;
  }

  // Тема
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark');
  }

  // Enter для поиска
  document.getElementById('searchInput').addEventListener('keypress', e => {
    if (e.key === 'Enter') performSearch();
  });

  // Показ крестика
  document.getElementById('searchInput').addEventListener('input', function() {
    document.getElementById('clearBtn').style.display = this.value ? 'block' : 'none';
  });
});

function applyTranslations() {
  t = translations[currentLang];
  document.getElementById('title').textContent = '⚡ ' + t.title;
  document.getElementById('searchInput').placeholder = t.placeholder;
  document.querySelector('.search-btn').textContent = t.search_btn;
  document.querySelectorAll('.chip-btn')[0].textContent = t.chip1;
  document.querySelectorAll('.chip-btn')[1].textContent = t.chip2 + '-';
  document.querySelectorAll('.chip-btn')[2].textContent = t.chip3;
}

function changeLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  applyTranslations();
  performSearch(); // перерисовать результаты на новом языке
}

function toggleTheme() {
  document.body.classList.toggle('dark');
  localStorage.setItem('darkMode', document.body.classList.contains('dark'));
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

async function performSearch() {
  const query = document.getElementById('searchInput').value.trim();
  const container = document.getElementById('resultsContainer');
  if (!query) return;

  container.innerHTML = `<p style="text-align:center; color:#777;">${t.searching}</p>`;

  const normQuery = query.toLowerCase().replace(/\s+/g, '');

  const results = data.filter(item => {
    let pathCheck = item.path.toLowerCase().replace(/\s+/g, '');
    let shopsCheck = item.shops.map(s => s.toLowerCase());

    if (currentLang === 'uz_latn') {
      pathCheck = transliterate(item.path).toLowerCase().replace(/\s+/g, '');
      shopsCheck = item.shops.map(s => transliterate(s).toLowerCase());
    }

    return pathCheck.includes(normQuery) || shopsCheck.some(sh => sh.includes(normQuery));
  });

  container.innerHTML = '';

  if (results.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:20px; background:var(--card-bg); border-radius:8px;">${t.no_results}</div>`;
    return;
  }

  results.forEach(item => {
    const card = document.createElement('div');
    card.className = 'result-card';

    // Путь с подсветкой
    const pathParts = item.path.split('>').map(p => p.trim());
    let pathHtml = '';
    pathParts.forEach((part, i) => {
      const match = part.toLowerCase().replace(/\s/g, '').includes(normQuery);
      const cls = match ? 'path-step highlight' : 'path-step';
      pathHtml += `<span class="${cls}">${part}</span>`;
      if (i < pathParts.length - 1) pathHtml += '<span class="arrow">➤</span>';
    });

    // Магазины с подсветкой
    let shopsHtml = `<div class="shops-list"><small style="color:#777">${t.stores_label}:</small><br>`;
    item.shops.forEach(shop => {
      const match = shop.toLowerCase() === query.toLowerCase();
      const cls = match ? 'shop-badge highlight' : 'shop-badge';
      shopsHtml += `<span class="${cls}">${shop}</span> `;
    });
    shopsHtml += '</div>';

    card.innerHTML = `<div class="path-display">${pathHtml}</div>${shopsHtml}`;
    container.appendChild(card);
  });
}

function addPrefixByLang(cyril, latin) {
  const prefix = (currentLang === 'uz_latn') ? latin : cyril;
  addPrefix(prefix);
}