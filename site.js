// Comportamiento común de las landings Life City. Objetivo único de la página: conseguir el lead.
const C = window.ALAMEDA || {};
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
$$('[data-cfg]').forEach(el => { const v = C[el.dataset.cfg]; if (v == null || v === '') { el.textContent = 'Por definir'; el.classList.add('tbd'); } else el.textContent = v; });
const nav = $('#nav'); if (nav) { const f = () => nav.classList.toggle('solid', scrollY > 60); f(); addEventListener('scroll', f, { passive: true }); }
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .08 });
$$('.reveal').forEach(el => io.observe(el));
const lb = $('#lb'); if (lb) { $$('.gallery img,.renders img,.cloud img,.plano img').forEach(i => i.parentElement.onclick = () => { lb.firstElementChild.src = i.src; lb.classList.add('on'); }); lb.onclick = () => lb.classList.remove('on'); addEventListener('keydown', e => e.key === 'Escape' && lb.classList.remove('on')); }
$$('a[data-portal]').forEach(a => a.href = `https://proyectos-lifecity.github.io/crm/portal.html?proyecto=${encodeURIComponent(C.nombre || '')}`);

// ---------- Formulario corto de lead (se reutiliza en portada, ventana emergente y pie)
const leadForm = (origen, titulo, sub) => `<form class="lead" data-origen="${origen}"><h3>${titulo}</h3><p>${sub}</p>
<input name="nombre" placeholder="Tu nombre" required autocomplete="name"><input name="celular" type="tel" placeholder="Celular / WhatsApp" required autocomplete="tel" minlength="7"><input name="correo" type="email" placeholder="Correo" required autocomplete="email">
<label class="ck"><input type="checkbox" required> Autorizo el tratamiento de mis datos para ser contactado sobre este proyecto (Ley 1581 de 2012).</label>
<button class="btn btn-primary" type="submit">Quiero el dossier</button><small>Sin costo ni compromiso · Tus datos no se comparten con terceros</small><div class="msg"></div></form>`;
const isLanding = !!$('.hero'), noLead = !!$('.checkout');
if (isLanding) {                                                   // formulario dentro de la portada
  const w = $('.hero .wrap'); const left = document.createElement('div'); left.className = 'hero-copy'; while (w.firstChild) left.appendChild(w.firstChild);
  w.classList.add('hero-grid'); w.append(left); w.insertAdjacentHTML('beforeend', `<aside class="hero-form">${leadForm('Portada', 'Recibe el dossier del proyecto', 'Cifras, planos, renders y estructura legal, directo a tu WhatsApp y correo.')}</aside>`);
}
if (!noLead) {                                                     // ventana emergente + barra fija
  document.body.insertAdjacentHTML('beforeend', `<div class="modal" id="leadModal"><div class="modal-box"><button class="modal-x" aria-label="Cerrar">✕</button>${leadForm('Ventana', 'Te enviamos toda la información', 'Déjanos tus datos y recibe el dossier de ' + (C.nombre || 'este proyecto') + '.')}</div></div>
<div class="sticky-cta"><span><b>${C.nombre || ''}</b> · participaciones limitadas</span><button class="btn btn-primary" data-lead="Barra fija">Quiero el dossier</button></div>`);
  const modal = $('#leadModal'), open = o => { modal.classList.add('on'); const f = $('form', modal); if (f) f.dataset.origen = o || 'Ventana'; setTimeout(() => $('input', modal)?.focus(), 50); }, close = () => modal.classList.remove('on');
  modal.addEventListener('click', e => (e.target === modal || e.target.closest('.modal-x')) && close()); addEventListener('keydown', e => e.key === 'Escape' && close());
  // todo enlace "más información" o marcado con data-lead abre el formulario; el botón del menú también
  $$('a[href$="#contacto"],[data-lead]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); open(a.dataset.lead || a.textContent.trim().slice(0, 40)); }));
  const hc = $$('.hero .cta a'); if (hc.length === 2) { hc[0].textContent = 'Quiero el dossier'; hc[0].removeAttribute('href'); hc[0].style.cursor = 'pointer'; hc[0].addEventListener('click', () => innerWidth > 960 ? $('.hero-form input')?.focus() : open('Portada (botón)')); hc[1].textContent = 'Quiero invertir'; hc[1].href = 'invertir.html'; hc[1].replaceWith(hc[1].cloneNode(true)); }
  const nb = $('.nav .btn-primary'); if (nb && isLanding) { nb.textContent = 'Recibir dossier'; nb.addEventListener('click', e => { e.preventDefault(); open('Menú'); }); }
  const sticky = $('.sticky-cta'); addEventListener('scroll', () => sticky.classList.toggle('on', scrollY > innerHeight * .8), { passive: true });
  let asked = false; document.addEventListener('mouseout', e => { let sent; try { sent = sessionStorage.lcLead; } catch { } if (!asked && !e.relatedTarget && e.clientY < 8 && !sent) { asked = true; open('Intención de salida'); } });
}
// formulario largo existente -> mismo manejador
const old = $('#infoForm'); if (old) { old.classList.add('lead-legacy'); old.dataset.origen = 'Formulario final'; }
document.addEventListener('submit', async e => {
  const form = e.target.closest('form.lead,form.lead-legacy'); if (!form) return; e.preventDefault();
  const d = Object.fromEntries(new FormData(form)), msg = $('.msg', form), btn = $('button[type=submit]', form); msg.classList.add('on'); msg.textContent = 'Enviando…'; btn.disabled = true;
  try {
    const { guardarLead } = await import('https://proyectos-lifecity.github.io/crm/lead.js');
    await guardarLead({ ...d, proyecto: C.nombre, origen: form.dataset.origen });
    try { sessionStorage.lcLead = 1; } catch { }
    const wa = C.whatsapp ? `<a class="btn btn-primary" target="_blank" rel="noopener" href="https://wa.me/${C.whatsapp}?text=${encodeURIComponent(`Hola, soy ${d.nombre}. Acabo de pedir el dossier de ${C.nombre}.`)}">Escribir por WhatsApp ahora</a>` : '';
    form.innerHTML = `<h3>¡Listo, ${String(d.nombre).split(' ')[0].replace(/[<>&]/g, '')}!</h3><p>Recibimos tus datos. Un asesor te enviará el dossier y resolverá tus dudas muy pronto.</p>${wa}<a class="btn btn-ghost btn-dark" href="proyecto.html">Ver renders y modelo 3D</a>`;
  } catch (err) { console.error(err); msg.textContent = 'No pudimos registrar tus datos. Intenta de nuevo en un momento.'; btn.disabled = false; }
});
