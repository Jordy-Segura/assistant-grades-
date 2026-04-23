/* ════════════════════════════════════════════════════════════
   BASE DE DATOS MULTI-CARRERA (ESPOCH - Sede Orellana)
════════════════════════════════════════════════════════════ */
const DB_RACS_TI = [
  { id: 'rac1', code: 'RAC1', description: 'Comunica efectivamente en español e inglés en diversos contextos profesionales.' },
  { id: 'rac2', code: 'RAC2', description: 'Aplica métodos y técnicas eficientes en el gobierno, auditoría y gestión de proyectos TI para la administración de tecnologías informáticas fiables que protejan la información.' },
  { id: 'rac3', code: 'RAC3', description: 'Implementa soluciones basadas en tecnologías web y móvil para el cumplimiento de los requerimientos y estándares corporativos.' },
  { id: 'rac4', code: 'RAC4', description: 'Aplica las competencias adquiridas con liderazgo en actividades inherentes a la profesión para la construcción de soluciones innovadoras con sostenibilidad ambiental.' },
  { id: 'rac5', code: 'RAC5', description: 'Desarrolla diferentes tecnologías de redes para la optimización de la administración y gestión de grandes volúmenes de datos en sistemas distribuidos.' }
];

const DB_ESPOCH = {
  "TECNOLOGÍAS DE LA INFORMACIÓN": {
    maxPao: 8,
    racs: DB_RACS_TI,
    malla: {
      "NIVELACIÓN": ["Introducción a las TIC", "Matemáticas Básicas"],
      "1": ["INGLÉS I", "FUNDAMENTOS DE PROGRAMACIÓN", "EDUCACIÓN FÍSICA", "SOSTENIBILIDAD AMBIENTAL", "COMUNICACIÓN ORAL Y ESCRITA"],
      "2": ["QUÍMICA", "ÁLGEBRA LINEAL", "FÍSICA MECÁNICA", "INGLÉS II", "METODOLOGÍA DE LA INVESTIGACIÓN"],
      "3": ["CALCULO DE UNA VARIABLE", "ADMINISTRACIÓN DE SISTEMAS OPERATIVOS", "ESTADÍSTICA Y PROBABILIDAD", "PROGRAMACIÓN", "INGLÉS III"],
      "4": ["SISTEMAS DE COMUNICACIÓN", "FUNDAMENTOS DE BASE DE DATOS", "ECUACIONES DIFERENCIALES", "CÁLCULO DE VARIAS VARIABLES"],
      "5": ["GESTIÓN DE PROYECTOS TI", "REALIDAD SOCIOECONÓMICA E INTERCULTURALIDAD", "INGLÉS IV", "MATEMÁTICA AVANZADA", "FUNDAMENTOS DE REDES"],
      "6": ["DISEÑO DE EXPERIENCIA DE USUARIO", "ADMINISTRACIÓN DE BASE DE DATOS", "MÉTODOS NUMÉRICOS", "GESTIÓN ADMINISTRATIVA", "CONMUTACIÓN Y ENRUTAMIENTO"],
      "7": ["TECNOLOGÍA WEB", "BIG DATA", "TECNOLOGIA Y DISEÑO MULTIMEDIA", "INFRAESTRUCTURA TI", "ÉTICA Y RELACIONES HUMANAS"],
      "8": ["ESCALABILIDAD DE REDES", "COMPUTACIÓN MÓVIL", "MACHINE LEARNING", "BUSINESS INTELLIGENCE", "SEGURIDAD TI", "GOBIERNO TI", "AUDITORÍA TI", "CLOUD COMPUTING"]
    },
    asignaturas: {
      "INGLÉS I": { raaus: [{ code: 'RAAU1', description: 'Utiliza expresiones de uso común para comunicar ideas sencillas sobre actividades cotidianas.', racId: 'rac1' }] },
      "FUNDAMENTOS DE PROGRAMACIÓN": { raaus: [{ code: 'RAAU1', description: 'Implementa algoritmos estructurados para computadoras eficientes para la resolución de problemas planteados.', racId: 'rac3' }] },
      "SOSTENIBILIDAD AMBIENTAL": { raaus: [{ code: 'RAAU1', description: 'Aplica los principios y normas ambientales para la adopción de alternativas de evaluación.', racId: 'rac4' }] },
      "COMUNICACIÓN ORAL Y ESCRITA": { raaus: [{ code: 'RAAU1', description: 'Aplica los conceptos de la comunicación oral y escrita en diversos contextos sociales y profesionales.', racId: 'rac1' }] },
      "GESTIÓN DE PROYECTOS TI": { raaus: [
        { code: 'RAAU1', description: 'Diseña planes de proyecto que garanticen la implementación de soluciones tecnológicas.', racId: 'rac2' },
        { code: 'RAAU2', description: 'Utiliza herramientas tecnológicas para el seguimiento y control de proyectos.', racId: 'rac2' }
      ]},
      "TECNOLOGÍA WEB": { raaus: [{ code: 'RAAU1', description: 'Implementa aplicaciones web para la solución de problemas tecnológicos en el entorno.', racId: 'rac3' }] },
      "BUSINESS INTELLIGENCE": { raaus: [{ code: 'RAAU1', description: 'Implementa entornos de visualización y análisis de negocios para la toma de desiciones estratégicas en una organización.', racId: 'rac2' }] },
      "FUNDAMENTOS DE REDES": { raaus: [{ code: 'RAAU1', description: 'Diseña redes de computadoras basados en modelos OSI, TCP/IP para entornos locales.', racId: 'rac5' }] },
      "GOBIERNO TI": { raaus: [{ code: 'RAAU1', description: 'Identifica los marcos de referencia, estándares y mejores prácticas relacionadas en el gobierno TI.', racId: 'rac2' }] },
      "AUDITORÍA TI": { raaus: [{ code: 'RAAU1', description: 'Aplica normas de auditoria TI en los sistemas de información.', racId: 'rac2' }] },
      "CLOUD COMPUTING": { raaus: [{ code: 'RAAU1', description: 'Aplica arquitecturas en la nube para la optimización de recursos y la escalabilidad de los servicios de TI.', racId: 'rac2' }] }
    }
  },
  "AMBIENTAL": { maxPao: 8, racs: [], malla: { "NIVELACIÓN": [] }, asignaturas: {} },
  "AGRONOMÍA": { maxPao: 9, racs: [], malla: { "NIVELACIÓN": [] }, asignaturas: {} },
  "ZOOTECNIA": { maxPao: 8, racs: [], malla: { "NIVELACIÓN": [] }, asignaturas: {} },
  "TURISMO": { maxPao: 8, racs: [], malla: { "NIVELACIÓN": [] }, asignaturas: {} },
  "DERECHO": { maxPao: 0, racs: [], malla: { "NIVELACIÓN": ["Introducción al Derecho"] }, asignaturas: {} }
};

let CAREER_RACS = []; // Se poblará dinámicamente

/* ════════════════════════════════════════════════════════════
   DATA
════════════════════════════════════════════════════════════ */
const EVAL_PROCEDURES = {
  ACD: [
    { id: 'acd1', name: 'Participación en clase' }, { id: 'acd2', name: 'Investigación Formativa' },
    { id: 'acd3', name: 'Resúmenes' }, { id: 'acd4', name: 'Lectura crítica de textos' },
    { id: 'acd5', name: 'Exposiciones' }, { id: 'acd6', name: 'Proyecto o planes en el aula' },
    { id: 'acd7', name: 'Comunicación oral y escrita' }, { id: 'acd8', name: 'Debates' },
    { id: 'acd9', name: 'Cuestionarios' }, { id: 'acd10', name: 'Ensayos' }, { id: 'acd11', name: 'Panel de discusión' },
  ],
  APEX: [
    { id: 'apex1', name: 'Aplicación de contenidos' }, { id: 'apex2', name: 'Talleres en equipo' },
    { id: 'apex3', name: 'Resolución de problemas' }, { id: 'apex4', name: 'Comprobación' },
    { id: 'apex5', name: 'Experimentación' }, { id: 'apex6', name: 'Replicación de casos' },
    { id: 'apex7', name: 'Práctica de laboratorio' }, { id: 'apex8', name: 'Simulación' }, { id: 'apex9', name: 'Talleres individuales' },
  ],
  AAUT: [
    { id: 'aaut1', name: 'Escritura académica' }, { id: 'aaut2', name: 'Elaboración de informes' },
    { id: 'aaut3', name: 'Preparación para lecciones' }, { id: 'aaut4', name: 'Preparación de exámenes' },
    { id: 'aaut5', name: 'Lecturas complementarias' }, { id: 'aaut6', name: 'Resolución de ejercicios' },
  ],
};
const COMPONENT_WEIGHTS = { ACD: 3.5, APEX: 3.5, AAUT: 3.0 };
const COMPONENT_COLORS = { ACD: '#3b82f6', APEX: '#22c55e', AAUT: '#f59e0b' };
const COMPONENT_LABELS = { ACD: 'Aprendizaje en Contacto con el Docente', APEX: 'Aprendizaje Práctico Experimental', AAUT: 'Aprendizaje Autónomo' };
const COMPONENTS = ['ACD', 'APEX', 'AAUT'];

/* ── DEFAULT STATE ──────────────────────────────────────────*/
const DEFAULT_STATE = {
  courseConfig: {
    periodoAcademico: 'SEPTIEMBRE 2025 - FEBRERO 2026',
    facultad: 'SEDE ORELLANA',
    carrera: '',
    asignatura: '',
    docente: '',
    pao: '',
    aporte: 'FIN DE CICLO',
  },
  selectedRACIds: [],
  raauEntries: [],
  activities: [],
  students: [
    { id: 's1', cedula: '220027839-4', apellidos: 'ALCIVAR NOA', nombres: 'JOHN EDUARDO' },
    { id: 's2', cedula: '220032351-3', apellidos: 'ALVAREZ GUAMAN', nombres: 'MARLYN DAYSI' },
    { id: 's3', cedula: '220058310-8', apellidos: 'BARRE GODOY', nombres: 'NATALIA ABIGAIL' },
    { id: 's4', cedula: '225018097-9', apellidos: 'CALDERON GONZALEZ', nombres: 'SONIA MARIBEL' },
    { id: 's5', cedula: '220043125-8', apellidos: 'CALVOPIÑA BURGOS', nombres: 'KARLA JIALIN' },
    { id: 's6', cedula: '225003703-9', apellidos: 'CARDENAS RODRIGUEZ', nombres: 'FLOR YAMILECXI' },
  ],
  grades: [],
};

// Insertando notas de ejemplo
const rawGrades = [
  ['s1', [1.27, 1.8, 1.5, 0.87, 1.0, 0.3, 1.9]], ['s2', [1.43, 1.3, 1.3, 0.93, 1.0, 0.3, 2.4]],
  ['s3', [1.43, 1.8, 1.3, 0.93, 1.0, 0.3, 1.4]], ['s4', [1.37, 1.8, 0.7, 0.86, 0.7, 0.3, 1.4]],
  ['s5', [1.43, 2.0, 1.5, 0.84, 1.0, 0.3, 1.0]], ['s6', [1.43, 2.0, 1.0, 0.95, 1.0, 0.3, 1.1]],
];
// Configuración de actividades por defecto (para simular el dashboard original)
DEFAULT_STATE.selectedRACIds = ['rac2', 'rac4'];
DEFAULT_STATE.raauEntries = [
    { id: 'raau1', code: 'RAAU1', description: 'Diseña planes de proyecto que garanticen la implementación de soluciones tecnológicas.', racId: 'rac2' },
    { id: 'raau2', code: 'RAAU2', description: 'Utiliza herramientas tecnológicas para el seguimiento y control de proyectos.', racId: 'rac2' },
    { id: 'raau3', code: 'RAAU3', description: 'Trabaja de forma colaborativa en equipos de proyecto.', racId: 'rac4' }
];
DEFAULT_STATE.activities = [
    { id: 'act1', name: 'Tareas en Equipo', component: 'ACD', maxScore: 1.5, raauId: 'raau3', racId: 'rac4', procedureId: 'acd2' },
    { id: 'act2', name: 'Tareas Individuales', component: 'ACD', maxScore: 2.0, raauId: 'raau2', racId: 'rac2', procedureId: 'acd3' },
    { id: 'act3', name: 'PI', component: 'APEX', maxScore: 1.5, raauId: 'raau3', racId: 'rac4', procedureId: 'apex1' },
    { id: 'act4', name: 'IF', component: 'APEX', maxScore: 1.0, raauId: 'raau1', racId: 'rac2', procedureId: 'acd2' },
    { id: 'act5', name: 'Exposición', component: 'APEX', maxScore: 1.0, raauId: 'raau1', racId: 'rac2', procedureId: 'acd5' },
    { id: 'act6', name: 'Lectura Comp', component: 'AAUT', maxScore: 0.5, raauId: 'raau3', racId: 'rac4', procedureId: 'aaut5' },
    { id: 'act7', name: 'Examen', component: 'AAUT', maxScore: 2.5, raauId: 'raau1', racId: 'rac2', procedureId: 'aaut4' },
];
rawGrades.forEach(([sid, scores]) => {
  scores.forEach((score, i) => {
    DEFAULT_STATE.grades.push({ studentId: sid, activityId: `act${i + 1}`, score });
  });
});

/* ── STATE ──────────────────────────────────────────────────*/
let STATE = JSON.parse(JSON.stringify(DEFAULT_STATE));
function save() {
  try { localStorage.setItem('espoch_state_v4', JSON.stringify(STATE)); } catch (e) { }
}
function load() {
  try {
    const d = localStorage.getItem('espoch_state_v4');
    if (d) STATE = JSON.parse(d);
    
    // Al cargar, asegurarnos de que la base de datos de RACs coincida con la carrera
    if (STATE.courseConfig && STATE.courseConfig.carrera) {
      const carreraData = DB_ESPOCH[STATE.courseConfig.carrera.toUpperCase()];
      if(carreraData) CAREER_RACS = carreraData.racs || [];
    }
  } catch (e) { }
}
load();

/* ── LÓGICA DE AUTO-COMPLETADO Y CASCADA ────────────────────*/
function onCarreraChange() {
  const carreraSel = document.getElementById('cfg-carrera').value;
  const paoSel = document.getElementById('cfg-pao');
  const asigSel = document.getElementById('cfg-asignatura');
  
  paoSel.innerHTML = '<option value="">-- Seleccione PAO --</option>';
  asigSel.innerHTML = '<option value="">-- Seleccione primero Carrera y PAO --</option>';
  paoSel.disabled = true;
  asigSel.disabled = true;

  if (!carreraSel) return;

  const dataCarrera = DB_ESPOCH[carreraSel];
  CAREER_RACS = dataCarrera.racs || [];
  
  // Poblar PAO
  paoSel.innerHTML += `<option value="NIVELACIÓN">NIVELACIÓN</option>`;
  for (let i = 1; i <= dataCarrera.maxPao; i++) {
    paoSel.innerHTML += `<option value="${i}">PAO ${i}</option>`;
  }
  paoSel.disabled = false;
  
  STATE.courseConfig.carrera = carreraSel;
  save();
}

function onPaoChange() {
  const carreraSel = document.getElementById('cfg-carrera').value;
  const paoSel = document.getElementById('cfg-pao').value;
  const asigSel = document.getElementById('cfg-asignatura');
  
  asigSel.innerHTML = '<option value="">-- Seleccione Asignatura --</option>';
  
  if (!paoSel) {
    asigSel.disabled = true;
    return;
  }

  const materias = DB_ESPOCH[carreraSel].malla[paoSel] || [];
  materias.forEach(m => {
    asigSel.innerHTML += `<option value="${m}">${m}</option>`;
  });
  
  asigSel.disabled = false;
  STATE.courseConfig.pao = paoSel;
  save();
}

function triggerLoadAsignatura() {
  const carrera = document.getElementById('cfg-carrera').value;
  const asignatura = document.getElementById('cfg-asignatura').value;
  
  STATE.courseConfig.asignatura = asignatura;
  
  if (!carrera || !asignatura) return;

  const dataAsignatura = DB_ESPOCH[carrera].asignaturas[asignatura];
  
  if (dataAsignatura && dataAsignatura.raaus && dataAsignatura.raaus.length > 0) {
    // Cargar RAAUs automáticamente
    STATE.raauEntries = dataAsignatura.raaus.map((r, index) => ({
      id: `raau_auto_${index}_${Date.now()}`,
      code: r.code,
      description: r.description,
      racId: r.racId
    }));

    // Extraer y seleccionar automáticamente los RACs vinculados
    STATE.selectedRACIds = [...new Set(dataAsignatura.raaus.map(r => r.racId))];
    
    showToast(`RACs y RAAUs mapeados automáticamente para ${asignatura}`, 'success');
  } else {
    // Si la materia existe en la malla pero no tiene mapeo aún en el objeto
    STATE.raauEntries = [];
    STATE.selectedRACIds = [];
    showToast('Esta asignatura requiere ingreso manual de RAAUs.', 'error');
  }
  
  save();
  updateSidebar();
}

/* ── HELPERS ─────────────────────────────────────────────── */
function getGrade(sid, aid) {
  const g = STATE.grades.find(g => g.studentId === sid && g.activityId === aid);
  return g ? g.score : null;
}
function setGrade(sid, aid, score) {
  const idx = STATE.grades.findIndex(g => g.studentId === sid && g.activityId === aid);
  if (idx >= 0) STATE.grades[idx].score = score;
  else STATE.grades.push({ studentId: sid, activityId: aid, score });
}
function studentTotal(sid) {
  return STATE.activities.reduce((s, a) => {
    const g = getGrade(sid, a.id);
    return s + (g != null ? g : 0);
  }, 0);
}
function fmt(n) { return n.toFixed(2) }
function pct(a, b) { return b > 0 ? Math.round(a / b * 100) : 0 }

/* ── NAVIGATION ─────────────────────────────────────────── */
let currentPage = 'dashboard';
function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelector(`.nav-item[data-page="${page}"]`).classList.add('active');
  currentPage = page;
  renderPage(page);
}
document.querySelectorAll('.nav-item').forEach(el => {
  el.addEventListener('click', () => navigate(el.dataset.page));
});
document.querySelectorAll('[data-page]').forEach(el => {
  if (!el.classList.contains('nav-item')) {
    el.addEventListener('click', () => navigate(el.dataset.page));
  }
});

function renderPage(page) {
  updateSidebar();
  if (page === 'dashboard') renderDashboard();
  else if (page === 'configuracion') renderConfig();
  else if (page === 'estudiantes') renderEstudiantes();
  else if (page === 'calificaciones') renderCalificaciones();
  else if (page === 'reporte') renderReporte();
}

function updateSidebar() {
  const c = STATE.courseConfig;
  document.getElementById('sb-asignatura').textContent = c.asignatura || '—';
  document.getElementById('sb-pao').textContent = 'PAO ' + (c.pao || '—');
  document.getElementById('sb-aporte').textContent = c.aporte || '—';
  document.getElementById('sb-docente').textContent = c.docente || '—';
}

/* ── DASHBOARD ───────────────────────────────────────────── */
function renderDashboard() {
  const c = STATE.courseConfig;
  const stu = STATE.students, acts = STATE.activities;

  document.getElementById('dash-sub').textContent = `${c.asignatura || 'Sin Asignatura'} — ${c.periodoAcademico}`;

  // Banner
  document.getElementById('dash-banner').innerHTML = `
    <div class="course-banner-fields">
      ${[['Facultad', c.facultad], ['Carrera', c.carrera], ['Asignatura', c.asignatura], ['PAO', c.pao], ['Aporte', c.aporte], ['Docente', c.docente]]
      .map(([l, v]) => `<div class="banner-field"><div class="lbl">${l}</div><div class="val">${v || '—'}</div></div>`).join('')}
    </div>`;

  // Stats
  const totals = stu.map(s => studentTotal(s.id));
  const approved = totals.filter(t => t >= 7).length;
  const failed = totals.filter(t => t > 0 && t < 7).length;
  const avg = totals.length > 0 ? totals.reduce((a, b) => a + b, 0) / totals.length : 0;
  const totalExp = stu.length * acts.length;
  const totalDone = STATE.grades.filter(g => g.score != null).length;

  document.getElementById('dash-stats').innerHTML = [
    { title: 'Estudiantes', value: stu.length, sub: 'Matriculados', color: 'var(--navy)' },
    { title: 'Aprobados', value: approved, sub: `de ${stu.length} estudiantes`, color: 'var(--green)' },
    { title: 'Reprobados', value: failed, sub: 'Nota < 7.0', color: 'var(--red)' },
    { title: 'Promedio', value: avg.toFixed(2), sub: 'Nota de la clase', color: 'var(--amber)' },
  ].map(s => `
    <div class="stat-card">
      <div class="stat-row">
        <div>
          <div class="stat-label">${s.title}</div>
          <div class="stat-val" style="color:${s.color}">${s.value}</div>
          <div class="stat-sub">${s.sub}</div>
        </div>
        <div class="stat-icon" style="background:${s.color}18"></div>
      </div>
    </div>`).join('');

  // Progress
  const progPct = pct(totalDone, totalExp);
  document.getElementById('dash-pct-badge').textContent = progPct + '% completado';
  document.getElementById('dash-progress').style.width = progPct + '%';
  document.getElementById('dash-prog-label').textContent = `${totalDone} de ${totalExp} calificaciones ingresadas`;

  // Component breakdown
  document.getElementById('dash-comp-cards').innerHTML = COMPONENTS.map(comp => {
    const max = acts.filter(a => a.component === comp).reduce((s, a) => s + a.maxScore, 0);
    const c = COMPONENT_COLORS[comp];
    return `<div style="border-radius:var(--radius);padding:12px;background:${c}10">
      <div style="font-size:.72rem;font-weight:700;color:${c}">${comp}</div>
      <div style="font-size:1.2rem;font-weight:700;color:${c};margin-top:3px">${max.toFixed(1)} pts</div>
      <div style="font-size:.7rem;color:var(--gray-400)">${((max / 10) * 100).toFixed(0)}% del total</div>
    </div>`;
  }).join('');

  // RA Summary
  document.getElementById('dash-ra-summary').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:10px">
      ${[['RAC seleccionados', STATE.selectedRACIds.length, 'var(--blue)'],
    ['RAAU definidos', STATE.raauEntries.length, 'var(--green)'],
    ['Actividades', acts.length, 'var(--amber)']].map(([l, v, co]) => `
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:.82rem">
          <span style="color:var(--gray-500)">${l}</span>
          <span style="padding:2px 8px;border-radius:5px;font-size:.72rem;font-weight:700;background:${co}15;color:${co}">${v}</span>
        </div>`).join('')}
    </div>
    <div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--gray-100)">
      <div style="font-size:.72rem;color:var(--gray-400);margin-bottom:8px">Ponderación componentes</div>
      ${COMPONENTS.map(comp => {
      const w = COMPONENT_WEIGHTS[comp], co = COMPONENT_COLORS[comp];
      return `<div style="display:flex;align-items:center;gap:7px;margin-bottom:8px">
          <div style="width:8px;height:8px;border-radius:2px;background:${co};flex-shrink:0"></div>
          <span style="font-size:.76rem;color:var(--gray-600)">${comp}</span>
          <div style="flex:1;height:5px;background:var(--gray-100);border-radius:5px;overflow:hidden">
            <div style="height:100%;width:${(w / 10) * 100}%;background:${co};border-radius:5px"></div>
          </div>
          <span style="font-size:.72rem;color:var(--gray-500)">${w}</span>
        </div>`;
    }).join('')}
    </div>`;

  // Quick actions
  document.getElementById('dash-quick').innerHTML = [
    { page: 'configuracion', label: 'Configurar RAC/RAAU', color: 'var(--navy)' },
    { page: 'estudiantes', label: 'Gestionar Estudiantes', color: 'var(--green)' },
    { page: 'calificaciones', label: 'Ingresar Notas', color: 'var(--purple)' },
    { page: 'reporte', label: 'Ver Reporte Final', color: 'var(--amber)' },
  ].map(q => `
    <div class="quick-card" data-page="${q.page}" onclick="navigate('${q.page}')">
      <div class="quick-icon" style="background:${q.color}15">
        <svg style="color:${q.color}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
      </div>
      <span class="quick-label">${q.label}</span>
      <span class="quick-chevron"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></span>
    </div>`).join('');

  // Student table
  const preview = stu.slice(0, 10);
  document.getElementById('dash-student-body').innerHTML = preview.map((s, i) => {
    const tot = studentTotal(s.id), pass = tot >= 7;
    const maxT = acts.reduce((sum, a) => sum + a.maxScore, 0);
    const p = pct(tot, maxT);
    return `<tr>
      <td style="color:var(--gray-400)">${i + 1}</td>
      <td>
        <div style="font-weight:500;font-size:.83rem">${s.apellidos} ${s.nombres}</div>
        <div style="font-size:.72rem;color:var(--gray-400);font-family:var(--mono)">${s.cedula}</div>
      </td>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <div class="progress-bar" style="width:60px">
            <div class="progress-fill" style="width:${Math.min(p, 100)}%;background:${pass ? 'var(--green)' : 'var(--red)'}"></div>
          </div>
          <span style="font-weight:700;color:${pass ? 'var(--green)' : 'var(--red)'};font-size:.83rem">${fmt(tot)}</span>
        </div>
      </td>
      <td><span class="badge ${pass ? 'badge-green' : 'badge-red'}">${pass ? '✓ Aprobado' : '✗ Reprobado'}</span></td>
    </tr>`;
  }).join('');

  if (stu.length > 10) {
    document.getElementById('dash-more-link').style.display = 'block';
    document.getElementById('dash-more-text').textContent = `Ver los ${stu.length - 10} estudiantes restantes →`;
  }
}

/* ── CONFIGURACIÓN ───────────────────────────────────────── */
let cfgStep = 0;
const CFG_STEPS = ['Información', 'RAC de la Carrera', 'RAAU de la Asignatura', 'Actividades'];

function renderConfig() {
  cfgStep = 0;
  renderCfgStep();
}

function renderStepper() {
  document.getElementById('cfg-stepper').innerHTML = CFG_STEPS.map((label, i) => {
    const done = i < cfgStep, active = i === cfgStep;
    const cls = done ? 'done' : active ? 'active' : 'pending';
    return `<div class="step-item">
      <div class="step-dot ${cls}">${done ? '✓' : i + 1}</div>
      <span class="step-label ${cls}">${label}</span>
      ${i < CFG_STEPS.length - 1 ? `<div class="step-line ${done ? 'done' : ''}"></div>` : ''}
    </div>`;
  }).join('');
}

function renderCfgStep() {
  renderStepper();
  for (let i = 0; i < 4; i++) document.getElementById(`cfg-step-${i}`).style.display = 'none';
  document.getElementById(`cfg-step-${cfgStep}`).style.display = 'block';
  document.getElementById('cfg-prev').style.display = cfgStep > 0 ? '' : 'none';
  document.getElementById('cfg-next').style.display = cfgStep < 3 ? '' : 'none';
  document.getElementById('cfg-save').style.display = cfgStep === 3 ? '' : 'none';

  const c = STATE.courseConfig;
  if (cfgStep === 0) {
    document.getElementById('cfg-periodo').value = c.periodoAcademico || '';
    document.getElementById('cfg-docente').value = c.docente || '';
    document.getElementById('cfg-aporte').value = c.aporte || 'FIN DE CICLO';
    
    // Autoselectores
    const elCarrera = document.getElementById('cfg-carrera');
    if(c.carrera) {
      elCarrera.value = c.carrera;
      onCarreraChange();
      const elPao = document.getElementById('cfg-pao');
      if(c.pao) {
        elPao.value = c.pao;
        onPaoChange();
        const elAsig = document.getElementById('cfg-asignatura');
        if(c.asignatura) { elAsig.value = c.asignatura; }
      }
    }
  }
  if (cfgStep === 1) {
    document.getElementById('cfg-rac-title').textContent = `RAC disponibles — Carrera: ${STATE.courseConfig.carrera || '—'}`;
    
    if(CAREER_RACS.length === 0) {
      document.getElementById('cfg-rac-list').innerHTML = `<div class="info-box" style="background:#fee2e2;border-color:#fca5a5"><p style="color:#991b1b">No hay RACs configurados para la carrera seleccionada.</p></div>`;
    } else {
      document.getElementById('cfg-rac-list').innerHTML = CAREER_RACS.map(rac => {
        const sel = STATE.selectedRACIds.includes(rac.id);
        return `<div class="rac-card ${sel ? 'selected' : ''}" onclick="toggleRAC('${rac.id}',this)">
          <div class="rac-checkbox"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div>
            <div class="rac-code">${rac.code}</div>
            <div class="rac-desc">${rac.description}</div>
          </div>
        </div>`;
      }).join('');
    }
  }
  if (cfgStep === 2) renderRAAUList();
  if (cfgStep === 3) renderActivitiesPanels();
}

function toggleRAC(id, el) {
  if (STATE.selectedRACIds.includes(id)) {
    STATE.selectedRACIds = STATE.selectedRACIds.filter(r => r !== id);
    el.classList.remove('selected');
  } else {
    STATE.selectedRACIds = [...STATE.selectedRACIds, id];
    el.classList.add('selected');
  }
}

function cfgPrev() { if (cfgStep > 0) { cfgStep--; renderCfgStep(); } }
function cfgNext() {
  if (cfgStep === 0) {
    STATE.courseConfig.periodoAcademico = document.getElementById('cfg-periodo').value;
    STATE.courseConfig.facultad = document.getElementById('cfg-facultad').value;
    STATE.courseConfig.carrera = document.getElementById('cfg-carrera').value;
    STATE.courseConfig.asignatura = document.getElementById('cfg-asignatura').value;
    STATE.courseConfig.docente = document.getElementById('cfg-docente').value;
    STATE.courseConfig.pao = document.getElementById('cfg-pao').value;
    STATE.courseConfig.aporte = document.getElementById('cfg-aporte').value;
  }
  if (cfgStep < 3) { cfgStep++; renderCfgStep(); }
}
function cfgSave() { save(); updateSidebar(); showToast('Configuración guardada correctamente', 'success'); }

// RAAU
function renderRAAUList() {
  if(STATE.raauEntries.length === 0) {
     document.getElementById('cfg-raau-list').innerHTML = `<p style="font-size:0.8rem;color:var(--gray-500);text-align:center;padding:20px;">No hay RAAU definidos. Seleccione la asignatura correcta en el Paso 1 para cargarlos automáticamente o agréguelos manualmente.</p>`;
     return;
  }
  document.getElementById('cfg-raau-list').innerHTML = STATE.raauEntries.map((r, i) => `
    <div class="item-row">
      <div style="font-size:.72rem;font-weight:700;color:var(--navy);min-width:50px">${r.code}</div>
      <div style="flex:1">
        <div style="font-size:.82rem;font-weight:500;color:var(--gray-700)">${r.description}</div>
        <div style="font-size:.72rem;color:var(--gray-400);margin-top:2px">
          ${CAREER_RACS.find(c => c.id === r.racId)?.code || r.racId}
        </div>
      </div>
      <button class="btn btn-danger btn-sm" onclick="deleteRAAU(${i})">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
      </button>
    </div>`).join('');
}
function deleteRAAU(i) { STATE.raauEntries.splice(i, 1); renderRAAUList(); }
function addRAAU() {
  const selRacs = STATE.selectedRACIds;
  if (selRacs.length === 0) { showToast('Primero seleccione al menos un RAC en el paso anterior', 'error'); return; }
  const code = 'RAAU' + (STATE.raauEntries.length + 1);
  openModal('Nuevo RAAU', `
    <div class="form-group"><label class="form-label">Código</label>
      <input class="form-input" id="m-code" value="${code}"></div>
    <div class="form-group"><label class="form-label">Descripción</label>
      <textarea class="form-input" id="m-desc" rows="3" style="resize:vertical"></textarea></div>
    <div class="form-group"><label class="form-label">RAC asociado</label>
      <select class="form-select" id="m-rac">
        ${CAREER_RACS.filter(r => selRacs.includes(r.id)).map(r => `<option value="${r.id}">${r.code} — ${r.description.slice(0, 60)}…</option>`).join('')}
      </select></div>
  `, [
    { label: 'Cancelar', cls: 'btn-ghost', action: 'close' },
    {
      label: 'Agregar', cls: 'btn-primary', action: () => {
        const c2 = document.getElementById('m-code').value;
        const d = document.getElementById('m-desc').value;
        const rid = document.getElementById('m-rac').value;
        if (!c2 || !d) return;
        STATE.raauEntries.push({ id: 'raau' + Date.now(), code: c2, description: d, racId: rid });
        renderRAAUList();
        closeModal();
      }
    },
  ]);
}

// Activities
function renderActivitiesPanels() {
  document.getElementById('cfg-activities-panels').innerHTML = COMPONENTS.map(comp => {
    const acts = STATE.activities.filter(a => a.component === comp);
    const color = COMPONENT_COLORS[comp];
    const totalMax = acts.reduce((s, a) => s + a.maxScore, 0);
    return `<div style="margin-bottom:18px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <div>
          <span style="font-weight:700;color:${color};font-size:.85rem">${comp}</span>
          <span style="font-size:.75rem;color:var(--gray-500);margin-left:8px">${COMPONENT_LABELS[comp]} — ${totalMax.toFixed(1)} / ${COMPONENT_WEIGHTS[comp]} pts</span>
        </div>
        <button class="btn btn-sm" style="background:${color}15;color:${color}" onclick="addActivity('${comp}')">+ Agregar</button>
      </div>
      <div id="acts-${comp}">
        ${acts.map((a, i) => activityItemHTML(a, i, comp, color)).join('')}
      </div>
    </div>`;
  }).join('');
}
function activityItemHTML(a, i, comp, color) {
  return `<div class="item-row">
    <div class="comp-pill" style="background:${color}15;color:${color}">${comp}</div>
    <div style="flex:1">
      <div style="font-size:.82rem;font-weight:500">${a.name}</div>
      <div style="font-size:.72rem;color:var(--gray-400)">Max: ${a.maxScore} pts</div>
    </div>
    <button class="btn btn-danger btn-sm" onclick="deleteActivity('${a.id}','${comp}')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
    </button>
  </div>`;
}
function deleteActivity(id, comp) {
  STATE.activities = STATE.activities.filter(a => a.id !== id);
  renderActivitiesPanels();
}
function addActivity(comp) {
  const raauOpts = STATE.raauEntries.map(r => `<option value="${r.id}">${r.code}</option>`).join('');
  const procOpts = (EVAL_PROCEDURES[comp] || []).map(p => `<option value="${p.id}">${p.name}</option>`).join('');
  
  if (STATE.raauEntries.length === 0) {
    showToast('Debe tener al menos un RAAU antes de crear actividades', 'error');
    return;
  }

  openModal(`Nueva Actividad — ${comp}`, `
    <div class="form-group"><label class="form-label">Nombre</label><input class="form-input" id="m-aname" placeholder="Ej: Tareas en Equipo"></div>
    <div class="form-group"><label class="form-label">Puntaje Máximo</label><input class="form-input" type="number" id="m-amax" step="0.5" min="0.5" value="1.0"></div>
    <div class="form-group"><label class="form-label">RAAU asociado</label><select class="form-select" id="m-araau">${raauOpts}</select></div>
    <div class="form-group"><label class="form-label">Procedimiento evaluativo</label><select class="form-select" id="m-aproc">${procOpts}</select></div>
  `, [
    { label: 'Cancelar', cls: 'btn-ghost', action: 'close' },
    {
      label: 'Agregar', cls: 'btn-primary', action: () => {
        const name = document.getElementById('m-aname').value;
        const max = parseFloat(document.getElementById('m-amax').value);
        if (!name || isNaN(max)) return;

        // VALIDACIÓN ESTRICTA DE LÍMITES
        const currentTotal = STATE.activities
          .filter(a => a.component === comp)
          .reduce((sum, a) => sum + a.maxScore, 0);
          
        const pesoMaximo = COMPONENT_WEIGHTS[comp];

        if ((currentTotal + max) > pesoMaximo) {
          showToast(`Error: El componente ${comp} no puede exceder los ${pesoMaximo} pts. Tienes ${currentTotal} asignados.`, 'error');
          return; // Detiene la creación
        }

        STATE.activities.push({
          id: 'act' + Date.now(), name, component: comp, maxScore: max,
          raauId: document.getElementById('m-araau').value,
          racId: STATE.raauEntries.find(r => r.id === document.getElementById('m-araau').value)?.racId || '',
          procedureId: document.getElementById('m-aproc').value,
        });
        renderActivitiesPanels(); closeModal();
      }
    },
  ]);
}

/* ── ESTUDIANTES ─────────────────────────────────────────── */
function renderEstudiantes() {
  const stu = STATE.students;
  document.getElementById('est-sub').textContent = `${stu.length} estudiantes matriculados`;

  const totals = stu.map(s => studentTotal(s.id));
  const approved = totals.filter(t => t >= 7).length;
  const avg = totals.length > 0 ? totals.reduce((a, b) => a + b, 0) / totals.length : 0;

  document.getElementById('est-stats').innerHTML = [
    { label: 'Total', val: stu.length, color: 'var(--navy)' },
    { label: 'Aprobados', val: approved, color: 'var(--green)' },
    { label: 'Promedio', val: avg.toFixed(2), color: 'var(--amber)' },
  ].map(s => `
    <div class="card" style="padding:14px 18px">
      <div style="font-size:.75rem;color:var(--gray-400)">${s.label}</div>
      <div style="font-size:1.4rem;font-weight:700;color:${s.color};margin-top:3px">${s.val}</div>
    </div>`).join('');

  renderStudentTable();
}

function renderStudentTable() {
  const q = (document.getElementById('est-search')?.value || '').toLowerCase();
  const filtered = STATE.students.filter(s => `${s.apellidos} ${s.nombres} ${s.cedula}`.toLowerCase().includes(q));
  document.getElementById('est-table-title').textContent = `Nómina (${filtered.length})`;
  document.getElementById('est-body').innerHTML = filtered.map((s, i) => {
    const tot = studentTotal(s.id), pass = tot >= 7;
    return `<tr>
      <td style="color:var(--gray-400)">${i + 1}</td>
      <td style="font-family:var(--mono);font-size:.78rem">${s.cedula}</td>
      <td style="font-weight:500">${s.apellidos}</td>
      <td>${s.nombres}</td>
      <td style="text-align:center;font-weight:700;font-family:var(--mono);color:${pass ? 'var(--green)' : 'var(--red)'}">${fmt(tot)}</td>
      <td style="text-align:center"><span class="badge ${pass ? 'badge-green' : 'badge-red'}">${pass ? 'Aprobado' : 'Reprobado'}</span></td>
      <td style="text-align:center">
        <div style="display:flex;gap:5px;justify-content:center">
          <button class="btn btn-ghost btn-sm" onclick="editStudent('${s.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn btn-danger btn-sm" onclick="confirmDelete('${s.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function showAddStudent() {
  document.getElementById('est-add-form').style.display = 'block';
  document.getElementById('est-add-form').innerHTML = `
    <div class="inline-form">
      <div class="inline-form-title">Nuevo Estudiante</div>
      <div class="form-grid-3">
        <div class="form-group"><label class="form-label">Cédula</label><input class="form-input" id="add-cedula" placeholder="Ej: 220027839-4"></div>
        <div class="form-group"><label class="form-label">Apellidos</label><input class="form-input" id="add-apellidos" placeholder="Ej: GARCIA LOPEZ"></div>
        <div class="form-group"><label class="form-label">Nombres</label><input class="form-input" id="add-nombres" placeholder="Ej: JUAN CARLOS"></div>
      </div>
      <div style="display:flex;gap:8px;margin-top:8px">
        <button class="btn btn-success btn-sm" onclick="saveAddStudent()">✓ Guardar</button>
        <button class="btn btn-ghost btn-sm" onclick="document.getElementById('est-add-form').style.display='none'">✕ Cancelar</button>
      </div>
    </div>`;
}
function saveAddStudent() {
  const ced = document.getElementById('add-cedula').value.trim();
  const ape = document.getElementById('add-apellidos').value.trim().toUpperCase();
  const nom = document.getElementById('add-nombres').value.trim().toUpperCase();
  if (!ced || !ape || !nom) return;
  STATE.students.push({ id: 's' + Date.now(), cedula: ced, apellidos: ape, nombres: nom });
  save();
  document.getElementById('est-add-form').style.display = 'none';
  renderEstudiantes();
  showToast('Estudiante agregado', 'success');
}
function editStudent(id) {
  const s = STATE.students.find(x => x.id === id);
  if (!s) return;
  openModal('Editar Estudiante', `
    <div class="form-group"><label class="form-label">Cédula</label><input class="form-input" id="m-ced" value="${s.cedula}"></div>
    <div class="form-group"><label class="form-label">Apellidos</label><input class="form-input" id="m-ape" value="${s.apellidos}"></div>
    <div class="form-group"><label class="form-label">Nombres</label><input class="form-input" id="m-nom" value="${s.nombres}"></div>
  `, [
    { label: 'Cancelar', cls: 'btn-ghost', action: 'close' },
    {
      label: 'Guardar', cls: 'btn-success', action: () => {
        s.cedula = document.getElementById('m-ced').value;
        s.apellidos = document.getElementById('m-ape').value.toUpperCase();
        s.nombres = document.getElementById('m-nom').value.toUpperCase();
        save(); renderEstudiantes(); closeModal(); showToast('Estudiante actualizado', 'success');
      }
    },
  ]);
}
function confirmDelete(id) {
  const s = STATE.students.find(x => x.id === id);
  openModal('Eliminar Estudiante', `<p style="color:var(--gray-600);font-size:.85rem">¿Desea eliminar a <strong>${s.apellidos} ${s.nombres}</strong>? Se eliminarán también sus calificaciones.</p>`, [
    { label: 'Cancelar', cls: 'btn-ghost', action: 'close' },
    {
      label: 'Eliminar', cls: 'btn-danger', action: () => {
        STATE.students = STATE.students.filter(x => x.id !== id);
        STATE.grades = STATE.grades.filter(g => g.studentId !== id);
        save(); renderEstudiantes(); closeModal(); showToast('Estudiante eliminado', 'success');
      }
    },
  ]);
}

/* ── CALIFICACIONES ──────────────────────────────────────── */
function renderCalificaciones() {
  const c = STATE.courseConfig;
  document.getElementById('cal-sub').textContent = `${c.asignatura || 'Sin Asignatura'} — ${c.aporte} — PAO ${c.pao}`;

  // Legend
  document.getElementById('cal-legend').innerHTML = COMPONENTS.map(comp => `
    <div class="comp-legend">
      <div class="comp-dot" style="background:${COMPONENT_COLORS[comp]}"></div>
      ${comp} (${COMPONENT_WEIGHTS[comp]} pts)
    </div>`).join('') + `
    <div class="comp-legend" style="margin-left:12px">
      <div style="width:11px;height:11px;border-radius:3px;background:#f0fdf4;border:1px solid #bbf7d0"></div> Con nota
    </div>
    <div class="comp-legend">
      <div style="width:11px;height:11px;border-radius:3px;background:var(--gray-100);border:1px solid var(--gray-200)"></div> Sin nota
    </div>`;

  renderGradeTable();
}

function renderGradeTable() {
  const q = (document.getElementById('cal-search')?.value || '').toLowerCase();
  const filtered = STATE.students.filter(s => `${s.apellidos} ${s.nombres} ${s.cedula}`.toLowerCase().includes(q));
  const acts = STATE.activities;
  const grouped = COMPONENTS.map(comp => ({ comp, acts: acts.filter(a => a.component === comp) }));

  // Update progress
  const total = STATE.students.length * acts.length;
  const done = STATE.grades.filter(g => g.score != null).length;
  const p = pct(done, total);
  document.getElementById('cal-progress-label').textContent = `${done}/${total} notas`;
  document.getElementById('cal-progress-fill').style.width = p + '%';
  document.getElementById('cal-progress-pct').textContent = p + '%';

  let html = `<table class="grade-table">
    <thead>
      <tr>
        <th colspan="2" class="student-cell" rowspan="4" style="background:var(--gray-50);min-width:200px">
          <div style="font-weight:600;color:var(--gray-700)">ESTUDIANTE</div>
          <div style="font-size:.68rem;color:var(--gray-400);margin-top:2px">${STATE.courseConfig.carrera || 'CARRERA NO DEFINIDA'}</div>
        </th>
        ${grouped.map(({ comp, acts: a }) => `
          <th colspan="${a.length + 1}" class="comp-header" style="background:${COMPONENT_COLORS[comp]}18;color:${COMPONENT_COLORS[comp]}">
            ${comp} (${COMPONENT_WEIGHTS[comp]} pts)
          </th>`).join('')}
        <th rowspan="4" style="min-width:55px;background:var(--gray-50);font-size:.73rem;color:var(--gray-600)">SUMA</th>
        <th rowspan="4" style="min-width:65px;background:var(--gray-50);font-size:.73rem;color:var(--gray-600)">NOTA<br>FINAL</th>
      </tr>
      <tr>
        ${grouped.map(({ comp, acts: a }) => [
    ...a.map(act => {
      const raau = STATE.raauEntries.find(r => r.id === act.raauId);
      return `<td style="text-align:center;font-size:.68rem;color:var(--gray-400);padding:4px 6px;border:1px solid var(--gray-200)">${raau?.code || '—'}</td>`;
    }),
    `<td style="text-align:center;background:${COMPONENT_COLORS[comp]}08;border:1px solid var(--gray-200)"></td>`,
  ].join('')).join('')}
      </tr>
      <tr>
        ${grouped.map(({ comp, acts: a }) => [
    ...a.map(act => {
      const racIdToSearch = STATE.raauEntries.find(r => r.id === act.raauId)?.racId || act.racId;
      const rac = CAREER_RACS.find(r => r.id === racIdToSearch);
      return `<td style="text-align:center;font-size:.68rem;color:var(--gray-400);padding:3px 6px;border:1px solid var(--gray-200)">${rac?.code || '—'}</td>`;
    }),
    `<td style="background:${COMPONENT_COLORS[comp]}08;border:1px solid var(--gray-200)"></td>`,
  ].join('')).join('')}
      </tr>
      <tr>
        ${grouped.map(({ comp, acts: a }) => [
    ...a.map(act => `<td style="text-align:center;font-size:.72rem;font-weight:600;color:var(--gray-700);padding:5px 6px;min-width:65px;border:1px solid var(--gray-200)">${act.name}<br><span style="font-size:.65rem;color:var(--gray-400);font-weight:400">/${act.maxScore}</span></td>`),
    `<td style="text-align:center;font-size:.7rem;font-weight:600;color:${COMPONENT_COLORS[comp]};padding:5px 6px;background:${COMPONENT_COLORS[comp]}08;border:1px solid var(--gray-200)">SUB<br><span style="font-size:.65rem;font-weight:400">/${COMPONENT_WEIGHTS[comp]}</span></td>`,
  ].join('')).join('')}
      </tr>
    </thead>
    <tbody>`;

  filtered.forEach((s, idx) => {
    const tot = studentTotal(s.id);
    const pass = tot >= 7;
    html += `<tr>
      <td class="student-cell" colspan="2">
        <div class="student-name">${s.apellidos} ${s.nombres}</div>
        <div class="student-id">${s.cedula}</div>
      </td>
      ${grouped.map(({ comp, acts: a }) => [
      ...a.map(act => {
        const g = getGrade(s.id, act.id);
        const hasVal = g != null;
        const over = hasVal && g > act.maxScore;
        return `<td style="padding:1px;border:1px solid var(--gray-200)">
            <input type="number" step="0.01" min="0" max="${act.maxScore}"
              class="grade-input${hasVal ? ' has-val' : ''}${over ? ' over' : ''}"
              value="${hasVal ? g : ''}"
              data-sid="${s.id}" data-aid="${act.id}" data-max="${act.maxScore}"
              onchange="onGradeChange(this)" oninput="onGradeInput(this)">
          </td>`;
      }),
      `<td style="text-align:center;font-family:var(--mono);font-size:.78rem;font-weight:700;color:${COMPONENT_COLORS[comp]};background:${COMPONENT_COLORS[comp]}08;padding:6px;border:1px solid var(--gray-200)">
          ${a.reduce((s2, act2) => { const g = getGrade(s.id, act2.id); return s2 + (g != null ? g : 0); }, 0).toFixed(2)}
        </td>`,
    ].join('')).join('')}
      <td class="total-cell" style="color:var(--gray-700)">${fmt(tot)}</td>
      <td class="nota-cell ${pass ? 'nota-pass' : 'nota-fail'}">${fmt(tot)}</td>
    </tr>`;
  });

  html += `</tbody></table>`;
  document.getElementById('cal-table-wrap').innerHTML = html;
}

function onGradeInput(el) {
  const max = parseFloat(el.dataset.max);
  const v = parseFloat(el.value);
  el.classList.remove('has-val', 'over');
  if (!isNaN(v)) {
    el.classList.add(v > max ? 'over' : 'has-val');
  }
}
function onGradeChange(el) {
  const sid = el.dataset.sid, aid = el.dataset.aid;
  const max = parseFloat(el.dataset.max);
  const raw = parseFloat(el.value);
  let score = null;
  if (!isNaN(raw)) { score = Math.round(Math.max(0, Math.min(max, raw)) * 100) / 100; }
  setGrade(sid, aid, score);
  if (score != null) el.value = score;
  
  const row = el.closest('tr');
  if (row) {
    const notaCell = row.querySelector('.nota-cell');
    const totalCell = row.querySelector('.total-cell');
    if (notaCell) {
      const tot = studentTotal(sid);
      const pass = tot >= 7;
      notaCell.textContent = fmt(tot);
      notaCell.className = 'nota-cell ' + (pass ? 'nota-pass' : 'nota-fail');
      if (totalCell) totalCell.textContent = fmt(tot);
    }
    
    // Update subtotals visually
    const acts = STATE.activities;
    const grouped = COMPONENTS.map(comp => ({ comp, acts: acts.filter(a => a.component === comp) }));
    let cellIndex = 2; // Offset for student columns
    grouped.forEach(g => {
       const subTotalCell = row.cells[cellIndex + g.acts.length];
       if(subTotalCell) {
         const subTot = g.acts.reduce((acc, a) => { const gv = getGrade(sid, a.id); return acc + (gv != null ? gv : 0); }, 0);
         subTotalCell.textContent = subTot.toFixed(2);
       }
       cellIndex += g.acts.length + 1;
    });
  }
  
  const total = STATE.students.length * STATE.activities.length;
  const done = STATE.grades.filter(g => g.score != null).length;
  const p = pct(done, total);
  document.getElementById('cal-progress-label').textContent = `${done}/${total} notas`;
  document.getElementById('cal-progress-fill').style.width = p + '%';
  document.getElementById('cal-progress-pct').textContent = p + '%';
}
function calSave() {
  save();
  const btn = document.getElementById('cal-save-btn');
  btn.style.background = 'var(--green)';
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Guardado';
  setTimeout(() => {
    btn.style.background = ''; btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Guardar';
  }, 2000);
  showToast('Calificaciones guardadas', 'success');
}

/* ── REPORTE (CON CSS PARA IMPRESIÓN MEJORADO) ───────────── */
function renderReporte() {
  const c = STATE.courseConfig;
  const stu = STATE.students, acts = STATE.activities;
  const totals = stu.map(s => studentTotal(s.id));
  const avg = totals.length > 0 ? totals.reduce((a, b) => a + b, 0) / totals.length : 0;
  const maxNote = totals.length > 0 ? Math.max(...totals) : 0;
  const minNote = totals.filter(t => t > 0).length > 0 ? Math.min(...totals.filter(t => t > 0)) : 0;
  const approved = totals.filter(t => t >= 7).length;

  document.getElementById('rep-stats').innerHTML = [
    { label: 'Promedio', val: avg.toFixed(2), color: 'var(--navy)' },
    { label: 'Aprobados', val: `${approved}/${stu.length}`, color: 'var(--green)' },
    { label: 'Nota Máx.', val: maxNote.toFixed(2), color: 'var(--purple)' },
    { label: 'Nota Mín.', val: minNote.toFixed(2), color: 'var(--amber)' },
  ].map(s => `
    <div class="stat-card">
      <div class="stat-row">
        <div><div class="stat-label">${s.label}</div><div class="stat-val" style="color:${s.color}">${s.val}</div></div>
      </div>
    </div>`).join('');

  const dist = [
    { label: '9-10', min: 9, max: 10.01, color: 'var(--green)' },
    { label: '8-9', min: 8, max: 9, color: 'var(--blue)' },
    { label: '7-8', min: 7, max: 8, color: 'var(--amber)' },
    { label: '6-7', min: 6, max: 7, color: '#f97316' },
    { label: '<6', min: 0, max: 6, color: 'var(--red)' },
  ].map(d => ({ ...d, count: totals.filter(t => t >= d.min && t < d.max).length }));
  const maxDist = Math.max(...dist.map(d => d.count), 1);
  document.getElementById('rep-dist').innerHTML = dist.map(d => `
    <div class="dist-bar-wrap">
      <span class="dist-count" style="color:${d.color}">${d.count}</span>
      <div class="dist-bar" style="height:${(d.count / maxDist) * 100}%;background:${d.color}"></div>
      <span class="dist-label">${d.label}</span>
    </div>`).join('');

  const grouped = COMPONENTS.map(comp => ({ comp, acts: acts.filter(a => a.component === comp) }));

  let reportHtml = `
  <div class="report-header">
    <div style="display:flex;align-items:center;justify-content:space-between">
      <div style="text-align:left">
        <div style="font-weight:700;color:var(--navy);font-size:.78rem">ESPOCH</div>
        <div style="font-size:.72rem;color:var(--gray-500)">Sede Orellana</div>
      </div>
      <div style="text-align:center;flex:1">
        <div class="report-institution">Escuela Superior Politécnica de Chimborazo</div>
        <div class="report-subtitle">Evaluación formativa y sumativa para alcanzar los resultados de aprendizaje</div>
      </div>
      <div style="width:100px"></div>
    </div>
  </div>

  <div class="report-info-grid">
    <div class="report-info-cell"><span class="report-info-label">Período académico: </span><span class="report-info-val">${c.periodoAcademico}</span></div>
    <div class="report-info-cell"><span class="report-info-label">Asignatura: </span><span class="report-info-val">${c.asignatura}</span></div>
    <div class="report-info-cell"><span class="report-info-label">Facultad: </span><span class="report-info-val">${c.facultad}</span></div>
    <div class="report-info-cell"><span class="report-info-label">PAO: </span><span class="report-info-val">${c.pao}</span></div>
    <div class="report-info-cell"><span class="report-info-label">Carrera: </span><span class="report-info-val">${c.carrera}</span></div>
    <div class="report-info-cell"><span class="report-info-label">Aporte: </span><span class="report-info-val">${c.aporte}</span></div>
    <div class="report-info-cell" style="grid-column:1/-1"><span class="report-info-label">Docente: </span><span class="report-info-val">${c.docente}</span></div>
  </div>

  <div style="padding:10px 16px;border-bottom:1px solid var(--gray-200)">
    <div style="font-size:.72rem;font-weight:700;color:var(--navy);margin-bottom:6px">RESULTADOS DE APRENDIZAJE</div>
    ${STATE.raauEntries.map(r => {
    const rac = CAREER_RACS.find(x => x.id === r.racId);
    return `<div style="font-size:.72rem;color:var(--gray-600);margin-bottom:3px">
        <span style="font-weight:600">${r.code}</span> → ${rac?.code || ''}: ${r.description}
      </div>`;
  }).join('')}
  </div>

  <div class="report-table-container" style="overflow-x:auto;padding:0;margin-top:10px;">
  <table style="width:100%;border-collapse:collapse;font-size:.72rem">
    <thead>
      <tr>
        <th style="border:1px solid var(--gray-200);padding:6px 8px;background:var(--gray-50);text-align:left;min-width:24px">#</th>
        <th style="border:1px solid var(--gray-200);padding:6px 8px;background:var(--gray-50);text-align:left;min-width:200px">APELLIDOS Y NOMBRES</th>
        <th style="border:1px solid var(--gray-200);padding:6px;background:var(--gray-50);text-align:center;min-width:90px">CÉDULA</th>
        ${grouped.map(({ comp, acts: a }) => `
          <th colspan="${a.length + 1}" style="border:1px solid var(--gray-200);padding:5px;text-align:center;background:${COMPONENT_COLORS[comp]}18;color:${COMPONENT_COLORS[comp]};font-weight:700">
            ${comp} (${COMPONENT_WEIGHTS[comp]} pts)
          </th>`).join('')}
        <th style="border:1px solid var(--gray-200);padding:6px;background:var(--gray-50);text-align:center;min-width:50px">SUMA</th>
        <th style="border:1px solid var(--gray-200);padding:6px;background:var(--gray-50);text-align:center;min-width:60px">NOTA FINAL</th>
      </tr>
      <tr>
        <th colspan="3" style="border:1px solid var(--gray-200);background:var(--gray-50)"></th>
        ${grouped.map(({ comp, acts: a }) => [
    ...a.map(act => `<th style="border:1px solid var(--gray-200);padding:5px 4px;text-align:center;font-size:.68rem;color:var(--gray-600);font-weight:500;background:${COMPONENT_COLORS[comp]}08">
            ${act.name}<br><span style="color:var(--gray-400)">/${act.maxScore}</span>
          </th>`),
    `<th style="border:1px solid var(--gray-200);padding:5px;text-align:center;color:${COMPONENT_COLORS[comp]};font-weight:700;background:${COMPONENT_COLORS[comp]}08">SUB</th>`,
  ].join('')).join('')}
        <th colspan="2" style="border:1px solid var(--gray-200);background:var(--gray-50)"></th>
      </tr>
    </thead>
    <tbody>
      ${stu.map((s, idx) => {
    const tot = studentTotal(s.id);
    const pass = tot >= 7;
    return `<tr style="${idx % 2 === 0 ? '' : 'background:#fafafa'}">
          <td style="border:1px solid var(--gray-200);padding:5px 7px;text-align:center;color:var(--gray-400)">${idx + 1}</td>
          <td style="border:1px solid var(--gray-200);padding:5px 8px;font-weight:500">${s.apellidos} ${s.nombres}</td>
          <td style="border:1px solid var(--gray-200);padding:5px 7px;text-align:center;font-family:var(--mono)">${s.cedula}</td>
          ${grouped.map(({ comp, acts: a }) => [
      ...a.map(act => {
        const g = getGrade(s.id, act.id);
        return `<td style="border:1px solid var(--gray-200);padding:5px;text-align:center;font-family:var(--mono);font-weight:600;color:${g != null ? (g >= act.maxScore * 0.6 ? 'var(--green)' : 'var(--red)') : 'var(--gray-300)'}">
                ${g != null ? g : '—'}
              </td>`;
      }),
      `<td style="border:1px solid var(--gray-200);padding:5px;text-align:center;font-family:var(--mono);font-weight:700;color:${COMPONENT_COLORS[comp]};background:${COMPONENT_COLORS[comp]}08">
              ${a.reduce((s2, act2) => { const g = getGrade(s.id, act2.id); return s2 + (g != null ? g : 0); }, 0).toFixed(2)}
            </td>`,
    ].join('')).join('')}
          <td style="border:1px solid var(--gray-200);padding:5px;text-align:center;font-family:var(--mono);font-weight:700;background:var(--gray-50)">${fmt(tot)}</td>
          <td style="border:1px solid var(--gray-200);padding:5px;text-align:center;font-family:var(--mono);font-weight:700;color:${pass ? 'var(--green)' : 'var(--red)'};background:${pass ? '#f0fdf4' : '#fee2e2'}">${fmt(tot)}</td>
        </tr>`;
  }).join('')}
    </tbody>
    <tfoot>
      <tr style="background:var(--navy)15">
        <td colspan="3" style="border:1px solid var(--gray-200);padding:6px 8px;font-weight:700;color:var(--gray-700)">PROMEDIO GENERAL</td>
        ${grouped.map(({ comp, acts: a }) => [
    ...a.map(act => {
      const compAvg = stu.reduce((s2, s3) => { const g = getGrade(s3.id, act.id); return s2 + (g != null ? g : 0); }, 0) / stu.length;
      return `<td style="border:1px solid var(--gray-200);padding:5px;text-align:center;font-weight:700;font-family:var(--mono);background:${COMPONENT_COLORS[comp]}08">${compAvg.toFixed(2)}</td>`;
    }),
    `<td style="border:1px solid var(--gray-200);padding:5px;text-align:center;font-weight:700;font-family:var(--mono);color:${COMPONENT_COLORS[comp]};background:${COMPONENT_COLORS[comp]}15">
            ${(stu.reduce((s2, s3) => s2 + a.reduce((s4, act2) => { const g = getGrade(s3.id, act2.id); return s4 + (g != null ? g : 0); }, 0), 0) / stu.length).toFixed(2)}
          </td>`,
  ].join('')).join('')}
        <td style="border:1px solid var(--gray-200);padding:5px;text-align:center;font-weight:700;font-family:var(--mono);background:var(--gray-50)">${avg.toFixed(2)}</td>
        <td style="border:1px solid var(--gray-200);padding:5px;text-align:center;font-weight:700;font-family:var(--mono);background:var(--gray-50)">${avg.toFixed(2)}</td>
      </tr>
    </tfoot>
  </table>
  </div>

  <div class="signatures-container" style="padding:20px 24px;display:flex;justify-content:space-between;align-items:flex-end;margin-top:8px">
    <div style="text-align:center">
      <div style="width:180px;border-top:1px solid var(--gray-700);padding-top:6px;font-size:.73rem;color:var(--gray-600);font-weight:600">${c.docente || '—'}</div>
      <div style="font-size:.68rem;color:var(--gray-400)">Firma del Docente</div>
    </div>
    <div style="text-align:center">
      <div style="font-size:.72rem;color:var(--gray-500)">Aprobados: <strong style="color:var(--green)">${approved}</strong> / Reprobados: <strong style="color:var(--red)">${stu.length - approved}</strong></div>
      <div style="font-size:.72rem;color:var(--gray-500);margin-top:3px">Promedio general: <strong>${avg.toFixed(2)}</strong></div>
    </div>
    <div style="text-align:center">
      <div style="width:180px;border-top:1px solid var(--gray-700);padding-top:6px;font-size:.73rem;color:var(--gray-600);font-weight:600">Firma Director/a de Carrera</div>
      <div style="font-size:.68rem;color:var(--gray-400)">Visto Bueno</div>
    </div>
  </div>`;

  document.getElementById('rep-printable').innerHTML = reportHtml;
}

/* ── MODAL ───────────────────────────────────────────────── */
function openModal(title, body, actions) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = body;
  document.getElementById('modal-actions').innerHTML = actions.map(a => `
    <button class="btn ${a.cls}" onclick="${typeof a.action === 'function' ? '_modalCb(' + actions.indexOf(a) + ')' : 'closeModal()'}">
      ${a.label}
    </button>`).join('');
  window._modalActions = actions;
  document.getElementById('modal-overlay').classList.add('open');
}
window._modalCb = function (i) {
  const a = window._modalActions[i];
  if (typeof a.action === 'function') a.action();
  else if (a.action === 'close') closeModal();
};
function closeModal(e) {
  if (e && e.target !== document.getElementById('modal-overlay')) return;
  document.getElementById('modal-overlay').classList.remove('open');
}

/* ── TOAST ───────────────────────────────────────────────── */
let toastTimer;
function showToast(msg, type) {
  const t = document.getElementById('toast');
  document.getElementById('toast-text').textContent = msg;
  t.style.background = type === 'error' ? 'var(--red)' : 'var(--green)';
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

/* ── INIT ────────────────────────────────────────────────── */
updateSidebar();
renderDashboard();