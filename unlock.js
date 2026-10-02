const $ = (s, root=document) => root.querySelector(s);
const enc = new TextEncoder();
const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const readEncrypted = async (path, iv, key) => {
  const response = await fetch(path); if (!response.ok) throw Error('Content could not be loaded');
  const cipher = await response.arrayBuffer();
  return crypto.subtle.decrypt({name:'AES-GCM',iv:b64(iv)},key,cipher);
};
const escapeHtml = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function getKey(pass, salt) {
  const material = await crypto.subtle.importKey('raw',enc.encode(pass),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:600000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['decrypt']);
}
$('#key-form').addEventListener('submit',async event=>{
  event.preventDefault(); const button=$('button',event.currentTarget), error=$('#key-error'); button.disabled=true; button.textContent='Opening…';error.textContent='';
  try {
    const meta=await fetch('vault.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error();return r.json()});
    const key=await getKey($('#key').value,b64(meta.salt));
    const manifest=JSON.parse(new TextDecoder().decode(await readEncrypted('content.enc',meta.iv,key)));
    openLetter(manifest,key);
  } catch(e) { error.textContent='That passkey didn’t open this letter. Please try again.'; button.disabled=false;button.textContent='Open'; }
});
function openLetter(data,key){
 const site=$('#site');
 const video=id=>`<video muted loop playsinline preload="none" data-id="${escapeHtml(id)}" aria-label="Video moment"></video>`;
 const intro=`<section class="hero opening">${video(data.hero)}<div class="hero-copy"><h1>Some people live in a house. You make mine a home.</h1></div><div class="scroll-cue">A little love letter</div></section>`;
 const chapters=data.clips.filter(v=>v.section==='chapter').map((v,i)=>`<section class="chapter" data-chapter><div class="chapter-media">${video(v.id)}<button class="play-sound" type="button">Listen to this moment</button></div><div class="chapter-copy"><span class="eyebrow">Chapters of an ordinary day · 0${i+1}</span><h2>${escapeHtml(v.title)}</h2><p>${escapeHtml(v.caption)}</p></div></section>`).join('');
 const letter=`<section class="letter"><div class="letter-media">${video(data.barefoot)}</div><div class="letter-copy"><span class="eyebrow">A note for you</span><h2>What “Home”<br>Actually Means</h2>${data.letter.map(p=>`<p>${escapeHtml(p)}</p>`).join('')}</div></section>`;
 const ending=`<section class="hero closing">${video(data.closing)}<div class="hero-copy"><p>You didn't just move into my life. You made it feel lived-in. Thank you for that — and for every ordinary, flour-covered, barefoot, completely unposed day that proves it.</p><p>I love you.</p><p class="signature">— Ainain</p></div></section>`;
 site.innerHTML=intro+`<div class="chapters">${chapters}</div>`+letter+ending;site.hidden=false;$('#unlock').remove();
 const clips=Object.fromEntries(data.clips.map(c=>[c.id,c])); const all=Object.fromEntries(data.media.map(m=>[m.id,m]));
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 for(const v of site.querySelectorAll('video')){const item=clips[v.dataset.id]||all[v.dataset.id];v.poster=item.poster||'assets/posters/floor-picnic.svg';}
 if(!reduced){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{const v=entry.target.querySelector('video');if(!v)return;if(entry.isIntersecting){loadVideo(v).then(()=>v.play().catch(()=>{}));entry.target.classList.add('is-active')}else{v.pause();entry.target.classList.remove('is-active')}}),{threshold:.25});
  site.querySelectorAll('.hero,.chapter,.letter').forEach(s=>observer.observe(s));
 }
 async function loadVideo(v){if(v.src)return;const item=clips[v.dataset.id]||all[v.dataset.id];const bytes=await readEncrypted(item.path,item.iv,key);v.src=URL.createObjectURL(new Blob([bytes],{type:'video/mp4'}));v.preload='metadata';}
 site.querySelectorAll('.play-sound').forEach(button=>button.addEventListener('click',async()=>{const v=button.closest('.chapter-media').querySelector('video');await loadVideo(v);v.muted=false;v.controls=true;await v.play().catch(()=>{});button.textContent='Sound on · pause to listen';v.addEventListener('pause',()=>{v.controls=false;v.muted=true;button.textContent='Listen to this moment'},{once:true})}));
}
