// Load content from data/content.json and render cards
const state = {
  items: [],
  filter: 'all',
  q: '',
  sort: 'newest',
};

// Map types to short labels
const TYPE_LABEL = {
  blog: 'Blog',
  podcast: 'Podcast',
  talk: 'Talk',
  video: 'Video',
  profile: 'Profile'
};

function fmtDate(iso){
  if(!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {year:'numeric', month:'short', day:'numeric'});
}

function render(){
  const cards = document.getElementById('cards');
  const q = state.q.trim().toLowerCase();
  let items = state.items.filter(it => (state.filter==='all' || it.type===state.filter));
  if (q){
    items = items.filter(it =>
      (it.title||'').toLowerCase().includes(q) ||
      (it.description||'').toLowerCase().includes(q) ||
      (it.source||'').toLowerCase().includes(q) ||
      (it.tags||[]).join(' ').toLowerCase().includes(q)
    );
  }
  if (state.sort==='newest'){
    items.sort((a,b)=> (b.date||'').localeCompare(a.date||''));
  } else if (state.sort==='oldest'){
    items.sort((a,b)=> (a.date||'').localeCompare(b.date||''));
  } else if (state.sort==='title'){
    items.sort((a,b)=> (a.title||'').localeCompare(b.title||''));
  }

  cards.innerHTML = items.map(it => {
    // Use specific thumbnail path if provided; otherwise, generate path from type.
    const img = it.thumbnail || `assets/${it.type || 'default'}.jpg`;
    const typeBadge = TYPE_LABEL[it.type] || it.type || '';
    return `
      <article class="card">
        <div class="kicker">${it.type || ''}${it.source ? ' • ' + it.source : ''}</div>
        <div class="thumb"><img src="${img}" alt="${it.title}"></div>
        <h3>${it.title}</h3>
        <div class="meta">
          ${it.date ? `<span>${fmtDate(it.date)}</span><span class="dot"></span>` : ''}
          ${it.duration ? `<span>${it.duration}</span><span class="dot"></span>` : ''}
          ${it.author ? `<span>${it.author}</span>` : ''}
        </div>
        ${it.description ? `<p class="desc">${it.description}</p>` : ''}
        <div class="actions">
          <a class="btn primary" href="${it.url}" target="_blank" rel="noopener">Open</a>
          ${it.secondary ? `<a class="btn" href="${it.secondary}" target="_blank" rel="noopener">Alt Link</a>` : ''}
        </div>
      </article>
    `;
  }).join('');
}

async function init(){
  document.getElementById('year').textContent = new Date().getFullYear();
  // UI handlers
  document.querySelectorAll('.chip').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.filter = btn.dataset.filter;
      render();
    });
  });
  document.getElementById('sortSelect').addEventListener('change', (e)=>{
    state.sort = e.target.value;
    render();
  });
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', (e)=>{
    state.q = e.target.value;
    render();
  });
  document.getElementById('clearSearch').addEventListener('click', ()=>{
    state.q=''; searchInput.value=''; render();
  });

  try{
    const res = await fetch('data/content.json', {cache:'no-store'});
    const json = await res.json();
    state.items = json.items || [];
  }catch(e){
    console.error('Failed to load content.json', e);
  }
  render();
}
init();