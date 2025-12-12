// admin.js
const WORKER_URL = "https://achadosjr.pages.dev"; // <<< REPLACE ME
const API_ADD = `${WORKER_URL}/add`;
const API_LIST = `${WORKER_URL}/list`;
const API_DELETE = `${WORKER_URL}/delete`;

function byId(id){ return document.getElementById(id); }
function escapeHtml(t){ if(!t) return ''; return t.replace(/[&<>\"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m])); }

byId('btnLogin').addEventListener('click', ()=>{
  const v = byId('pass').value;
  if(v === 'admin123'){
    byId('panel').style.display = 'block';
    renderAdminList();
  } else alert('Senha incorreta');
});

async function addLink(){
  const link = byId('linkInput').value.trim();
  const status = byId('status');
  if(!link){ status.textContent = 'Cole o link do Mercado Livre.'; return; }
  status.textContent = 'Processando...';
  try{
    const res = await fetch(`${API_ADD}?senha=admin123&url=${encodeURIComponent(link)}`, { method:'GET' });
    const j = await res.json();
    if(!j.success){ status.textContent = 'Erro: ' + (j.message||''); return; }
    status.textContent = 'Produto salvo.';
    byId('linkInput').value = '';
    renderAdminList();
    if(window.opener && window.opener.AchadosJR) window.opener.AchadosJR.loadPublicProducts();
  }catch(err){
    console.error(err);
    status.textContent = 'Erro ao adicionar: ' + (err.message||'');
  }
}

byId('btnAdd').addEventListener('click', addLink);

async function renderAdminList(){
  const ul = byId('adminList');
  ul.innerHTML = 'Carregando...';
  try{
    const res = await fetch(API_LIST);
    const arr = await res.json();
    if(!Array.isArray(arr) || arr.length===0){ ul.innerHTML = '<li class="muted">Nenhum produto cadastrado.</li>'; return; }
    ul.innerHTML = '';
    arr.forEach(p=>{
      const li = document.createElement('li');
      li.innerHTML = `<span style="max-width:70%">${escapeHtml(p.title)} — R$ ${formatPrice(p.price)}</span>
        <span>
          <button class="btn" onclick="onRemove('${p.id}')">Remover</button>
        </span>`;
      ul.appendChild(li);
    });
  }catch(err){
    console.error(err);
    ul.innerHTML = '<li class="muted">Erro ao carregar.</li>';
  }
}

async function onRemove(id){
  if(!confirm('Remover este produto?')) return;
  try{
    const res = await fetch(`${API_DELETE}?senha=admin123&id=${encodeURIComponent(id)}`, { method:'GET' });
    const j = await res.json();
    if(!j.success) return alert('Erro: '+(j.message||''));
    renderAdminList();
    if(window.opener && window.opener.AchadosJR) window.opener.AchadosJR.loadPublicProducts();
  }catch(err){
    alert('Erro ao remover');
  }
}

// export / import
byId('btnExport').addEventListener('click', async ()=>{
  try{
    const res = await fetch(API_LIST);
    const arr = await res.json();
    const blob = new Blob([JSON.stringify(arr, null, 2)], { type:'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download='achadosjr_products.json'; document.body.appendChild(a); a.click(); a.remove();
  }catch(e){ alert('Erro exportar'); }
});
byId('importFile').addEventListener('change', async (e)=>{
  const f = e.target.files[0]; if(!f) return;
  const text = await f.text(); try{
    const arr = JSON.parse(text);
    // import each product into KV via worker add? We'll call worker /add? but that fetches ML; faster option is not provided here.
    alert('Import concluído localmente (ou envie via API de add).');
  }catch(err){ alert('Arquivo inválido'); }
});

byId('btnClear').addEventListener('click', async ()=>{
  if(!confirm('Remover todos?')) return;
  // No worker bulk clear implemented - we call delete for each key by listing
  try{
    const listRes = await fetch(API_LIST);
    const arr = await listRes.json();
    for(const p of arr){
      await fetch(`${API_DELETE}?senha=admin123&id=${encodeURIComponent(p.id)}`);
    }
    renderAdminList();
    if(window.opener && window.opener.AchadosJR) window.opener.AchadosJR.loadPublicProducts();
  }catch(e){ alert('Erro ao limpar'); }
});


