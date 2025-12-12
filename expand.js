export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname || '/';
    try {
      if (pathname === '/add') return await handleAdd(url, env);
      if (pathname === '/list') return await handleList(env);
      if (pathname === '/delete') return await handleDelete(url, env);
      return new Response(JSON.stringify({ success:true, message:'API AchadosJR'}), { headers:{'Content-Type':'application/json'}});
    } catch (err) {
      return new Response(JSON.stringify({ success:false, message: err.message }), { status:500, headers:{'Content-Type':'application/json'}});
    }
  }
};

function extractIdFromString(s) {
  if(!s) return null;
  const m1 = s.match(/MLB\d{5,15}/i) || s.match(/MLA\d{5,15}/i);
  if(m1) return m1[0];
  const m2 = s.match(/wid=(MLB\d{5,15})/i);
  if(m2) return m2[1];
  const m3 = s.match(/\/p\/(MLB\d{5,15})/i);
  if(m3) return m3[1];
  const m4 = s.match(/(\d{6,15})/g);
  if(m4 && m4.length>0) return 'MLB' + m4[m4.length-1];
  return null;
}

async function handleAdd(url, env){
  const params = url.searchParams;
  const link = (params.get('url') || '').trim();
  const senha = params.get('senha') || '';

  if(senha !== 'admin123') return new Response(JSON.stringify({ success:false, message:'Senha incorreta' }), { status:401, headers:{'Content-Type':'application/json'}});
  if(!link) return new Response(JSON.stringify({ success:false, message:'Falta url' }), { status:400, headers:{'Content-Type':'application/json'}});

  // expand redirects
  let finalUrl = link;
  let pageText = '';
  try {
    const r = await fetch(link, { redirect: 'follow', method:'GET' });
    finalUrl = r.url || finalUrl;
    // try to get body if needed
    try{ pageText = await r.text(); }catch(e){ pageText = ''; }
  } catch(e){
    // ignore, try to extract from link itself
  }

  // extract ID
  let id = extractIdFromString(finalUrl) || extractIdFromString(link) || extractIdFromString(pageText);
  if(!id) return new Response(JSON.stringify({ success:false, message:'ID não encontrado' }), { status:404, headers:{'Content-Type':'application/json'}});
  id = id.replace('-','').toUpperCase();

  // fetch ML API
  const api = await fetch(`https://api.mercadolibre.com/items/${id}`);
  if(!api.ok) return new Response(JSON.stringify({ success:false, message:'Produto não encontrado na API' }), { status:404, headers:{'Content-Type':'application/json'}});
  const item = await api.json();

  // build stored object
  const obj = {
    id: id,
    title: item.title || '',
    price: item.price || 0,
    thumbnail: item.thumbnail || (item.pictures && item.pictures[0] && item.pictures[0].secure_url) || '',
    permalink: item.permalink || finalUrl,
    finalUrl: finalUrl,
    date: new Date().toISOString()
  };

  await env.PRODUCTS.put(obj.id, JSON.stringify(obj));
  return new Response(JSON.stringify({ success:true, item: obj }), { headers:{'Content-Type':'application/json'}});
}

async function handleList(env){
  // list all keys
  const list = await env.PRODUCTS.list();
  const out = [];
  for(const k of list.keys){
    const v = await env.PRODUCTS.get(k.name);
    if(v) out.push(JSON.parse(v));
  }
  return new Response(JSON.stringify(out), { headers:{'Content-Type':'application/json'}});
}

async function handleDelete(url, env){
  const params = url.searchParams;
  const senha = params.get('senha') || '';
  const id = params.get('id') || '';
  if(senha !== 'admin123') return new Response(JSON.stringify({ success:false, message:'Senha incorreta' }), { status:401, headers:{'Content-Type':'application/json'}});
  if(!id) return new Response(JSON.stringify({ success:false, message:'Falta id' }), { status:400, headers:{'Content-Type':'application/json'}});
  await env.PRODUCTS.delete(id);
  return new Response(JSON.stringify({ success:true }), { headers:{'Content-Type':'application/json'}});
}
