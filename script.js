// script.js (shared)
const WORKER_URL = "achadosjr.pages.dev"; // <<< REPLACE ME with your Worker URL
const API_ADD = `${WORKER_URL}/add`;
const API_LIST = `${WORKER_URL}/list`;
const API_DELETE = `${WORKER_URL}/delete?senha=admin123&id=`;

function escapeHtml(t){ if(!t) return ''; return t.replace(/[&<>\"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m])); }
function formatPrice(v){ if(v===null||v===undefined) return '---'; const n=Number(v); if(isNaN(n)) return v; return n.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}); }

async function loadPublicProducts(filter='', sort='new'){
  const listEl = document.getElementById('products');
  const empty = document.getElementById('empty');
  if(!listEl) return;
  listEl.innerHTML = '';
  empty.textContent = 'Carregando...';
  try{
    const res = await fetch(API_LIST);
    const arr = await res.json();
    if(!Array.isArray(arr) || arr.length===0){
      empty.textContent = 'Nenhum produto cadastrado.';
      return;
    }
    empty.textContent = '';
    // filter
    let data = arr.slice();
    if(filter) data = data.filter(p => (p.title||'').toLowerCase().includes(filter.toLowerCase()));
    // sort
    if(sort==='cheap') data.sort((a,b)=>a.price-b.price);
    else if(sort==='expensive') data.sort((a,b)=>b.price-a.price);
    else data.sort((a,b)=> new Date(b.date||0) - new Date(a.date||0));
    data.forEach(p=>{
      const li = document.createElement('li');
      li.innerHTML = `
        <img src="${escapeHtml(p.thumbnail||'')}" style="width:100%;height:160px;object-fit:cover;border-radius:8px" />
        <h3>${escapeHtml(p.title)}</h3>
        <p><strong>R$ ${formatPrice(p.price)}</strong></p>
        <p><a class="btn" href="${escapeHtml(p.permalink||p.finalUrl||p.link||'')}" target="_blank">Ver oferta</a></p>
      `;
      listEl.appendChild(li);
    });
  }catch(err){
    empty.textContent = 'Erro ao carregar produtos.';
    console.error(err);
  }
}

document.addEventListener('DOMContentLoaded', ()=>{
  const search = document.getElementById('search');
  const sort = document.getElementById('sort');
  if(search) search.addEventListener('input', ()=> loadPublicProducts(search.value, sort.value));
  if(sort) sort.addEventListener('change', ()=> loadPublicProducts(search ? search.value : '', sort.value));
  loadPublicProducts();
});

// expose helper for admin page to refresh list if admin and public same origin
window.AchadosJR = { loadPublicProducts };

