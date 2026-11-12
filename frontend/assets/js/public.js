const menu = document.querySelector('.menu-toggle');
menu?.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded',String(open)); document.querySelector('#main-nav')?.classList.toggle('open',open); });
const utmKeys = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content'];
const current = new URL(location.href);
let campaign = {};
try { campaign = JSON.parse(sessionStorage.getItem('hm_utm') || '{}'); } catch { /* Storage can be disabled. */ }
for (const key of utmKeys) if (current.searchParams.has(key)) campaign[key] = current.searchParams.get(key).slice(0,300);
try { sessionStorage.setItem('hm_utm',JSON.stringify(campaign)); } catch { /* Context from current URL still works. */ }
for (const a of document.querySelectorAll('a[data-wa]')) {
 const u = new URL(a.href); u.searchParams.set('page',location.pathname+location.search); for (const [k,v] of Object.entries(campaign)) u.searchParams.set(k,v); a.href=u.pathname+u.search;
}
for (const a of document.querySelectorAll('[data-package]')) a.addEventListener('click',()=>{ const select=document.querySelector('select[name=package_id]');if(select)select.value=a.dataset.package; });
for (const form of document.querySelectorAll('[data-public-form]')) {
 form.addEventListener('submit',async e=>{
  e.preventDefault();const button=form.querySelector('button[type=submit],button:not([type])');const feedback=form.querySelector('.form-feedback');
  form.querySelectorAll('.field-error').forEach(el=>el.textContent='');form.querySelectorAll('.invalid').forEach(el=>{el.classList.remove('invalid');el.removeAttribute('aria-invalid');});
  button.disabled=true;feedback.textContent='Menyimpan pengajuan…';feedback.classList.remove('error');
  const body=Object.fromEntries(new FormData(form));Object.assign(body,campaign,{page:location.pathname+location.search});
  if(body.preferred_at)body.preferred_at=new Date(body.preferred_at+'+07:00').toISOString();
  try {const r=await fetch(form.action,{method:'POST',headers:{'content-type':'application/json',accept:'application/json'},body:JSON.stringify(body)});const result=await r.json();
   if(!r.ok){for(const [key,message]of Object.entries(result.fields||{})){const input=form.elements.namedItem(key);if(input){input.classList.add('invalid');input.setAttribute('aria-invalid','true');}const err=form.querySelector(`[data-error-for="${key}"]`);if(err)err.textContent=message;}throw new Error(result.error+'\n'+Object.values(result.fields||{}).join('\n'));}
   feedback.textContent='Pengajuan tersimpan. Membuka WhatsApp admin…';location.assign(result.next);
  } catch(err){feedback.classList.add('error');feedback.textContent=err.message||'Gagal menyimpan. Coba kembali.';feedback.focus();button.disabled=false;}
 });
}
const dialog=document.querySelector('#photo-dialog');
if(dialog){const photos=[...document.querySelectorAll('[data-gallery] img')];let index=0;const show=i=>{index=(i+photos.length)%photos.length;const img=dialog.querySelector('img');img.src=photos[index].src;img.alt=photos[index].alt;dialog.querySelector('[data-photo-count]').textContent=`${index+1} / ${photos.length}`;};document.querySelectorAll('[data-gallery]').forEach((button,i)=>button.addEventListener('click',()=>{show(i);dialog.showModal();}));dialog.querySelector('[data-photo-close]').addEventListener('click',()=>dialog.close());dialog.querySelector('[data-photo-prev]').addEventListener('click',()=>show(index-1));dialog.querySelector('[data-photo-next]').addEventListener('click',()=>show(index+1));dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight')show(index+1);if(e.key==='ArrowLeft')show(index-1);});dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});}
