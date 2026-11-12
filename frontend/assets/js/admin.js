const csrf = document.querySelector('meta[name=csrf-token]')?.content;
async function send(url,body,method='POST',isFile=false){
 const r=await fetch(url,{method,headers:{'x-csrf-token':csrf,accept:'application/json',...(isFile?{}:{'content-type':'application/json'})},body:body?(isFile?body:JSON.stringify(body)):undefined});
 const result=await r.json();if(!r.ok)throw Object.assign(new Error(result.error||'Gagal menyimpan'),{fields:result.fields});return result;
}
function error(form,err){const f=form.querySelector('.form-feedback');f.classList.add('error');f.textContent=err.message+'\n'+Object.values(err.fields||{}).join('\n');f.focus();for(const [k,v] of Object.entries(err.fields||{})){const node=form.querySelector(`[data-error-for="${k}"]`);if(node)node.textContent=v;const input=form.elements.namedItem(k);if(input?.setAttribute)input.setAttribute('aria-invalid','true');}}
for(const f of document.querySelectorAll('[data-admin-form]'))f.addEventListener('submit',async e=>{
 e.preventDefault();const button=e.submitter;const feedback=f.querySelector('.form-feedback');button.disabled=true;feedback.classList.remove('error');feedback.textContent='Menyimpan…';const form=new FormData(f),body=Object.fromEntries(form);
 if(f.hasAttribute('data-property-form')){body.facility_ids=form.getAll('facility_ids');body.featured=form.has('featured');}
 try{const data=await send(f.action,body);if(f.hasAttribute('data-property-form')&&data.id)location.assign('/admin/properties/'+data.id+'?saved=1');else{feedback.textContent='Perubahan tersimpan.';button.disabled=false;}}
 catch(err){error(f,err);button.disabled=false;}
});
const slugify=s=>s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const title=document.querySelector('[data-property-form] [name=title]'),slug=document.querySelector('[data-property-form] [name=slug]');let autoSlug=!slug?.value;slug?.addEventListener('input',()=>autoSlug=false);title?.addEventListener('input',()=>{if(autoSlug)slug.value=slugify(title.value);});
if(new URL(location.href).searchParams.has('saved')){const f=document.querySelector('[data-property-form] .form-feedback');if(f)f.textContent='Listing berhasil disimpan.';}
for(const button of document.querySelectorAll('[data-confirm]'))button.addEventListener('click',e=>{if(!confirm(button.dataset.confirm))e.preventDefault();});
for(const f of document.querySelectorAll('[data-upload]'))f.addEventListener('submit',async e=>{e.preventDefault();const button=e.submitter;const feedback=f.querySelector('.form-feedback');button.disabled=true;feedback.textContent='Memproses foto…';try{await send(f.action,new FormData(f),'POST',true);location.hash='media';location.reload();}catch(err){error(f,err);button.disabled=false;}});
for(const f of document.querySelectorAll('[data-media-order]')){
 f.querySelectorAll('[data-move]').forEach(button=>button.addEventListener('click',()=>{const tile=button.closest('[data-media-id]');if(button.dataset.move==='up'&&tile.previousElementSibling)tile.parentNode.insertBefore(tile,tile.previousElementSibling);if(button.dataset.move==='down'&&tile.nextElementSibling)tile.parentNode.insertBefore(tile.nextElementSibling,tile);}));
 f.addEventListener('submit',async e=>{e.preventDefault();const button=e.submitter;button.disabled=true;try{const ids=[...f.querySelectorAll('[data-media-id]')].map(el=>Number(el.dataset.mediaId));const alts=Object.fromEntries(ids.map(id=>[id,f.elements.namedItem('alt_'+id).value]));await send(`/api/admin/properties/${f.dataset.propertyId}/media/order`,{ids,cover_id:Number(new FormData(f).get('cover_id')),alts});location.reload();}catch(err){error(f,err);button.disabled=false;}});
 f.querySelectorAll('[data-delete-media]').forEach(button=>button.addEventListener('click',async()=>{if(!confirm('Hapus foto dari listing?'))return;try{await send(`/api/admin/properties/${f.dataset.propertyId}/media/${button.dataset.deleteMedia}`,null,'DELETE');location.reload();}catch(err){error(f,err);}}));
}
