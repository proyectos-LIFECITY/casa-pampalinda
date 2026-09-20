// Comportamiento común de las landings Life City: cifras, navegación, galería y captura de leads al CRM
const C = window.ALAMEDA || {};
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
$$('[data-cfg]').forEach(el => { const v = C[el.dataset.cfg]; if (v == null || v === '') { el.textContent = 'Por definir'; el.classList.add('tbd'); } else el.textContent = v; });
const nav = $('#nav'); if (nav) { const f = () => nav.classList.toggle('solid', scrollY > 60); f(); addEventListener('scroll', f, { passive: true }); }
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .08 });
$$('.reveal').forEach(el => io.observe(el));
const lb = $('#lb'); if (lb) { $$('.gallery img,.renders img,.cloud img').forEach(i => i.parentElement.onclick = () => { lb.firstElementChild.src = i.src; lb.classList.add('on'); }); lb.onclick = () => lb.classList.remove('on'); addEventListener('keydown', e => e.key === 'Escape' && lb.classList.remove('on')); }
$$('a[data-portal]').forEach(a => a.href = `https://proyectos-lifecity.github.io/crm/portal.html?proyecto=${encodeURIComponent(C.nombre || '')}`);
const form = $('#infoForm');
if (form) form.addEventListener('submit', async e => {
  e.preventDefault(); const d = Object.fromEntries(new FormData(form)), msg = $('#formMsg'), btn = form.querySelector('button[type=submit]');
  msg.classList.add('on'); msg.textContent = 'Enviando…'; btn.disabled = true;
  try {
    const { guardarLead } = await import('https://proyectos-lifecity.github.io/crm/lead.js');
    await guardarLead({ ...d, proyecto: C.nombre });
    msg.textContent = '¡Gracias! Recibimos tus datos y te contactaremos muy pronto con el dossier del proyecto.'; form.reset();
  } catch (err) { console.error(err); msg.textContent = 'No pudimos registrar tus datos en este momento. Por favor intenta de nuevo o escríbenos directamente.'; }
  btn.disabled = false;
  if (C.whatsapp) window.open(`https://wa.me/${C.whatsapp}?text=${encodeURIComponent(`Hola, acabo de dejar mis datos para ${C.nombre}. Soy ${d.nombre}.`)}`, '_blank');
});
