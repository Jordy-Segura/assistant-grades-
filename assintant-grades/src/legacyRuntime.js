/* eslint-disable no-var */

export function initLegacyRuntime() {
  if (window.__espochLegacyInit) return;
  window.__espochLegacyInit = true;

  var DB_RACS_TI = [
    { id: 'rac1', code: 'RAC1', description: 'Comunica efectivamente en español e inglés en diversos contextos profesionales.' },
    { id: 'rac2', code: 'RAC2', description: 'Aplica métodos y técnicas eficientes en el gobierno, auditoría y gestión de proyectos TI.' },
    { id: 'rac3', code: 'RAC3', description: 'Implementa soluciones basadas en tecnologías web y móvil para estándares corporativos.' },
    { id: 'rac4', code: 'RAC4', description: 'Aplica competencias con liderazgo para construcción de soluciones innovadoras con sostenibilidad ambiental.' },
    { id: 'rac5', code: 'RAC5', description: 'Desarrolla tecnologías de redes para optimización de administración y gestión de grandes volúmenes de datos.' }
  ];

  var DB_ESPOCH = {
    'TECNOLOGÍAS DE LA INFORMACIÓN': {
      maxPao: 8,
      racs: DB_RACS_TI,
      malla: {
        'NIVELACIÓN': ['Introducción a las TIC', 'Matemáticas Básicas'],
        '1': ['INGLÉS I', 'FUNDAMENTOS DE PROGRAMACIÓN', 'EDUCACIÓN FÍSICA', 'SOSTENIBILIDAD AMBIENTAL', 'COMUNICACIÓN ORAL Y ESCRITA', 'QUÍMICA', 'ÁLGEBRA LINEAL'],
        '2': ['FÍSICA MECÁNICA', 'INGLÉS II', 'METODOLOGÍA DE LA INVESTIGACIÓN', 'CÁLCULO DE UNA VARIABLE', 'ADMINISTRACIÓN DE SISTEMAS OPERATIVOS', 'PROGRAMACIÓN'],
        '3': ['INGLÉS III', 'SISTEMAS DE COMUNICACIÓN', 'FUNDAMENTOS DE BASE DE DATOS', 'ECUACIONES DIFERENCIALES', 'CÁLCULO DE VARIAS VARIABLES', 'GESTIÓN DE PROYECTOS TI', 'REALIDAD SOCIOECONÓMICA E INTERCULTURALIDAD'],
        '4': ['INGLÉS IV', 'MATEMÁTICA AVANZADA', 'FUNDAMENTOS DE REDES', 'DISEÑO DE EXPERIENCIA DE USUARIO', 'ADMINISTRACIÓN DE BASE DE DATOS', 'MÉTODOS NUMÉRICOS', 'GESTIÓN ADMINISTRATIVA'],
        '5': ['CONMUTACIÓN Y ENRUTAMIENTO', 'ESTADÍSTICA Y PROBABILIDAD', 'TECNOLOGÍA WEB', 'BIG DATA', 'TECNOLOGÍA Y DISEÑO MULTIMEDIA', 'INFRAESTRUCTURA TI', 'ÉTICA Y RELACIONES HUMANAS'],
        '6': ['ESCALABILIDAD DE REDES', 'COMPUTACIÓN MÓVIL', 'MACHINE LEARNING', 'PRÁCTICAS DE SERVICIOS COMUNITARIO', 'INTEROPERABILIDAD DE PLATAFORMAS', 'EMPRENDIMIENTO'],
        '7': ['ITINERARIO 1', 'BUSINESS INTELLIGENCE', 'SEGURIDAD TI', 'APLICACIONES IoT', 'PRÁCTICAS LABORALES', 'FORMULACIÓN DE TRABAJO DE TITULACIÓN'],
        '8': ['CLOUD COMPUTING', 'AUDITORÍA TI', 'GOBIERNO TI', 'SISTEMAS DE INFORMACIÓN GEOGRÁFICA', 'ITINERARIO 2', 'TRABAJO DE TITULACIÓN']
      },
      asignaturas: {
        'TECNOLOGÍA WEB': { raau: [{ code: 'RAAU1', description: 'Implementa aplicaciones web para solución de problemas tecnológicos.', racId: 'rac3' }] },
        'GESTIÓN DE PROYECTOS TI': { raau: [
          { code: 'RAAU1', description: 'Diseña planes de proyecto que garanticen la implementación de soluciones.', racId: 'rac2' },
          { code: 'RAAU2', description: 'Utiliza herramientas tecnológicas para el seguimiento y control.', racId: 'rac2' }
        ]}
      }
    },
    'AMBIENTAL': { maxPao: 8, racs: [], malla: { 'NIVELACIÓN': [] }, asignaturas: {} },
    'AGRONOMÍA': { maxPao: 9, racs: [], malla: { 'NIVELACIÓN': [] }, asignaturas: {} },
    'ZOOTECNIA': { maxPao: 8, racs: [], malla: { 'NIVELACIÓN': [] }, asignaturas: {} },
    'TURISMO': { maxPao: 8, racs: [], malla: { 'NIVELACIÓN': [] }, asignaturas: {} },
    'DERECHO': { maxPao: 0, racs: [], malla: { 'NIVELACIÓN': ['Introducción al Derecho'] }, asignaturas: {} }
  };

  var EVAL_PROCEDURES = {
    ACD: [{ id: 'acd1', name: 'Participación en clase' }, { id: 'acd2', name: 'Investigación Formativa' }],
    APEX: [{ id: 'apex1', name: 'Aplicación de contenidos' }, { id: 'apex2', name: 'Talleres en equipo' }],
    AAUT: [{ id: 'aaut1', name: 'Escritura académica' }, { id: 'aaut2', name: 'Elaboración de informes' }]
  };

  var COMPONENT_WEIGHTS = { ACD: 3.5, APEX: 3.5, AAUT: 3.0 };
  var COMPONENT_COLORS = { ACD: '#3b82f6', APEX: '#22c55e', AAUT: '#f59e0b' };
  var COMPONENT_LABELS = { ACD: 'Aprendizaje en Contacto con el Docente', APEX: 'Aprendizaje Práctico Experimental', AAUT: 'Aprendizaje Autónomo' };
  var COMPONENTS = ['ACD', 'APEX', 'AAUT'];

  var DEFAULT_STATE = {
    courseConfig: { periodoAcademico: 'SEPTIEMBRE 2025 - FEBRERO 2026', facultad: 'SEDE ORELLANA', carrera: '', asignatura: '', docente: '', pao: '', aporte: 'FIN DE CICLO' },
    selectedRACIds: [], raauEntries: [], activities: [],
    students: [
      { id: 's1', cedula: '220027839-4', apellidos: 'ALCIVAR NOA', nombres: 'JOHN EDUARDO' },
      { id: 's2', cedula: '220032351-3', apellidos: 'ALVAREZ GUAMAN', nombres: 'MARLYN DAYSI' }
    ],
    grades: [], recentActivity: []
  };

  var STATE = {};
  var CAREER_RACS = [];
  function save() { try { localStorage.setItem('espoch_state_v8', JSON.stringify(STATE)); } catch (e) {} }
  function load() {
    try {
      var stored = localStorage.getItem('espoch_state_v8');
      STATE = stored ? JSON.parse(stored) : JSON.parse(JSON.stringify(DEFAULT_STATE));
      if (STATE.courseConfig && STATE.courseConfig.carrera && DB_ESPOCH[STATE.courseConfig.carrera]) CAREER_RACS = DB_ESPOCH[STATE.courseConfig.carrera].racs || [];
    } catch (e) { STATE = JSON.parse(JSON.stringify(DEFAULT_STATE)); }
  }
  load();

  function showToast(msg, type) {
    var toastEl = document.getElementById('toast');
    var text = document.getElementById('toast-text');
    if (!toastEl || !text) return;
    text.textContent = msg;
    toastEl.style.background = type === 'error' ? 'var(--red)' : 'var(--green)';
    toastEl.classList.add('show');
    setTimeout(function () { toastEl.classList.remove('show'); }, 2800);
  }

  function closeModal(e) {
    if (e && e.target !== document.getElementById('modal-overlay')) return;
    var overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.classList.remove('open');
  }

  function openModal(title, bodyHtml, actions) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHtml;
    document.getElementById('modal-actions').innerHTML = actions.map(function (a, i) {
      return '<button class="btn ' + a.cls + '" onclick="_modalAction(' + i + ')">' + a.label + '</button>';
    }).join('');
    window._modalActions = actions;
    document.getElementById('modal-overlay').classList.add('open');
  }

  window._modalAction = function (i) {
    var a = window._modalActions[i];
    if (typeof a.action === 'function') a.action();
    else if (a.action === 'close') closeModal();
  };

  function updateSidebar() {
    var c = STATE.courseConfig;
    var set = function (id, val) { var el = document.getElementById(id); if (el) el.textContent = val; };
    set('sb-asignatura', c.asignatura || '—');
    set('sb-pao', 'PAO ' + (c.pao || '—'));
    set('sb-aporte', c.aporte || '—');
    set('sb-docente', c.docente || '—');
  }

  function onCarreraChange() {
    var carreraValue = document.getElementById('cfg-carrera').value;
    var paoSelect = document.getElementById('cfg-pao');
    var asigSelect = document.getElementById('cfg-asignatura');
    paoSelect.innerHTML = '<option value="">-- Seleccione PAO --</option>';
    asigSelect.innerHTML = '<option value="">-- Seleccione primero Carrera y PAO --</option>';
    paoSelect.disabled = true;
    asigSelect.disabled = true;
    if (!carreraValue) return;
    var carreraData = DB_ESPOCH[carreraValue];
    CAREER_RACS = carreraData.racs || [];
    paoSelect.innerHTML += '<option value="NIVELACIÓN">NIVELACIÓN</option>';
    for (var p = 1; p <= carreraData.maxPao; p++) paoSelect.innerHTML += '<option value="' + p + '">PAO ' + p + '</option>';
    paoSelect.disabled = false;
    STATE.courseConfig.carrera = carreraValue;
    STATE.selectedRACIds = [];
    STATE.raauEntries = [];
    save();
  }

  function onPaoChange() {
    var carreraValue = document.getElementById('cfg-carrera').value;
    var paoValue = document.getElementById('cfg-pao').value;
    var asigSelect = document.getElementById('cfg-asignatura');
    asigSelect.innerHTML = '<option value="">-- Seleccione Asignatura --</option>';
    if (!paoValue) { asigSelect.disabled = true; return; }
    var materias = (DB_ESPOCH[carreraValue] && DB_ESPOCH[carreraValue].malla[paoValue]) || [];
    materias.forEach(function (mat) { asigSelect.innerHTML += '<option value="' + mat + '">' + mat + '</option>'; });
    asigSelect.disabled = false;
    STATE.courseConfig.pao = paoValue;
    save();
  }

  function onAsignaturaChange() {
    var carrera = document.getElementById('cfg-carrera').value;
    var asignatura = document.getElementById('cfg-asignatura').value;
    STATE.courseConfig.asignatura = asignatura;
    if (!carrera || !asignatura) return;
    var asignaturaData = DB_ESPOCH[carrera] && DB_ESPOCH[carrera].asignaturas[asignatura];
    if (asignaturaData && asignaturaData.raau && asignaturaData.raau.length > 0) {
      STATE.raauEntries = asignaturaData.raau.map(function (r, index) {
        return { id: 'raau_auto_' + index + '_' + Date.now(), code: r.code, description: r.description, racId: r.racId };
      });
      STATE.selectedRACIds = [];
      asignaturaData.raau.forEach(function (r) { if (STATE.selectedRACIds.indexOf(r.racId) === -1) STATE.selectedRACIds.push(r.racId); });
      showToast('RACs y RAAUs mapeados automáticamente para ' + asignatura, 'success');
    } else {
      STATE.raauEntries = [];
      STATE.selectedRACIds = [];
      showToast('Esta asignatura requiere ingreso manual de RAAUs.', 'error');
    }
    save();
    updateSidebar();
    renderRAAUList();
  }

  var cfgStep = 0;
  var CFG_STEPS = ['Información', 'RAC de la Carrera', 'RAAU de la Asignatura', 'Actividades'];

  function renderConfig() { cfgStep = 0; renderCfgStep(); }

  function renderStepper() {
    document.getElementById('cfg-stepper').innerHTML = CFG_STEPS.map(function (label, i) {
      var isDone = i < cfgStep;
      var isActive = i === cfgStep;
      var cssClass = isDone ? 'done' : isActive ? 'active' : 'pending';
      return '<div class="step-item"><div class="step-dot ' + cssClass + '">' + (isDone ? '✓' : (i + 1)) + '</div><span class="step-label ' + cssClass + '">' + label + '</span>' + (i < CFG_STEPS.length - 1 ? '<div class="step-line' + (isDone ? ' done' : '') + '"></div>' : '') + '</div>';
    }).join('');
  }

  function renderRAAUList() {
    var target = document.getElementById('cfg-raau-list');
    if (!target) return;
    if (STATE.raauEntries.length === 0) {
      target.innerHTML = '<p style="font-size:0.8rem;color:var(--gray-500);text-align:center;padding:20px;">No hay RAAU definidos. Seleccione la asignatura correcta en el Paso 1.</p>';
      return;
    }
    target.innerHTML = STATE.raauEntries.map(function (entry, i) {
      var rac = CAREER_RACS.find(function (c) { return c.id === entry.racId; });
      return '<div class="item-row"><div style="font-size:.72rem;font-weight:700;color:var(--navy);min-width:50px">' + entry.code + '</div><div style="flex:1"><div style="font-size:.82rem;font-weight:500;color:var(--gray-700)">' + entry.description + '</div><div style="font-size:.72rem;color:var(--gray-400);margin-top:2px">' + (rac ? rac.code : entry.racId) + '</div></div><button class="btn btn-danger btn-sm" onclick="deleteRAAU(' + i + ')" title="Eliminar">Eliminar</button></div>';
    }).join('');
  }

  function renderActivitiesPanels() {
    var panel = document.getElementById('cfg-activities-panels');
    var summaryDiv = document.getElementById('cfg-activities-summary');
    if (!panel || !summaryDiv) return;
    var hasAny = STATE.activities.length > 0;
    summaryDiv.style.display = hasAny ? 'block' : 'none';
    panel.innerHTML = COMPONENTS.map(function (comp) {
      var acts = STATE.activities.filter(function (a) { return a.component === comp; });
      var color = COMPONENT_COLORS[comp];
      var totalMax = acts.reduce(function (s, a) { return s + a.maxScore; }, 0);
      var maxWeight = COMPONENT_WEIGHTS[comp];
      var remaining = maxWeight - totalMax;
      return '<div style="margin-bottom:20px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><div><span style="font-weight:700;color:' + color + ';font-size:.85rem">' + comp + '</span><span style="font-size:.75rem;color:var(--gray-500);margin-left:8px">' + COMPONENT_LABELS[comp] + '</span></div><div style="display:flex;align-items:center;gap:8px"><span style="font-size:.72rem;color:' + (remaining < 0 ? 'var(--red)' : 'var(--gray-400)') + '">' + remaining.toFixed(1) + ' pts disponibles</span><button class="btn btn-sm" style="background:' + color + '15;color:' + color + '" onclick="addActivity(\'' + comp + '\')">Agregar</button></div></div><div id="acts-' + comp + '">' + acts.map(function (act) { return activityItemHTML(act, comp, color); }).join('') + '</div></div>';
    }).join('');
  }

  function activityItemHTML(act, comp, color) {
    var raauEntry = STATE.raauEntries.find(function (r) { return r.id === act.raauId; });
    return '<div class="item-row"><span class="comp-pill" style="background:' + color + '15;color:' + color + '">' + comp + '</span><div style="flex:1"><div class="item-name">' + act.name + '</div><div class="item-sub">Max: ' + act.maxScore + ' pts | RAAU: ' + (raauEntry ? raauEntry.code : '—') + '</div></div><button class="btn btn-danger btn-sm" onclick="deleteActivity(\'' + act.id + '\')">Eliminar</button></div>';
  }

  function renderCfgStep() {
    renderStepper();
    for (var i = 0; i < 4; i++) {
      var stepEl = document.getElementById('cfg-step-' + i);
      if (stepEl) stepEl.style.display = 'none';
    }
    var current = document.getElementById('cfg-step-' + cfgStep);
    if (current) current.style.display = 'block';
    document.getElementById('cfg-prev').style.display = cfgStep > 0 ? '' : 'none';
    document.getElementById('cfg-next').style.display = cfgStep < 3 ? '' : 'none';
    document.getElementById('cfg-save').style.display = cfgStep === 3 ? '' : 'none';

    var config = STATE.courseConfig;
    if (cfgStep === 0) {
      document.getElementById('cfg-periodo').value = config.periodoAcademico || '';
      document.getElementById('cfg-docente').value = config.docente || '';
      document.getElementById('cfg-aporte').value = config.aporte || 'FIN DE CICLO';
    }
    if (cfgStep === 1) {
      document.getElementById('cfg-rac-title').textContent = 'RAC disponibles — Carrera: ' + (STATE.courseConfig.carrera || '—');
      document.getElementById('cfg-rac-list').innerHTML = CAREER_RACS.map(function (rac) {
        var isSelected = STATE.selectedRACIds.indexOf(rac.id) !== -1;
        return '<div class="rac-card ' + (isSelected ? 'selected' : '') + '" onclick="toggleRAC(\'' + rac.id + '\',this)"><div class="rac-checkbox"></div><div><div class="rac-code">' + rac.code + '</div><div class="rac-desc">' + rac.description + '</div></div></div>';
      }).join('');
    }
    if (cfgStep === 2) renderRAAUList();
    if (cfgStep === 3) renderActivitiesPanels();
  }

  function cfgPrev() { if (cfgStep > 0) { cfgStep--; renderCfgStep(); } }
  function cfgNext() { if (cfgStep < 3) { cfgStep++; renderCfgStep(); } }
  function cfgSave() { save(); updateSidebar(); showToast('Configuración guardada', 'success'); }

  function toggleRAC(id, el) {
    if (STATE.selectedRACIds.indexOf(id) !== -1) {
      STATE.selectedRACIds = STATE.selectedRACIds.filter(function (r) { return r !== id; });
      el.classList.remove('selected');
    } else {
      STATE.selectedRACIds.push(id);
      el.classList.add('selected');
    }
  }

  function deleteRAAU(i) { STATE.raauEntries.splice(i, 1); renderRAAUList(); }
  function addRAAU() { showToast('Modal de RAAU pendiente (llega en la siguiente parte del JS).', 'success'); }
  function addActivity(comp) { STATE.activities.push({ id: 'act' + Date.now(), name: 'Nueva actividad', component: comp, maxScore: 1, raauId: STATE.raauEntries[0] ? STATE.raauEntries[0].id : '' }); renderActivitiesPanels(); }
  function deleteActivity(id) { STATE.activities = STATE.activities.filter(function (a) { return a.id !== id; }); renderActivitiesPanels(); }

  function getGrade(sid, aid) {
    var g = STATE.grades.find(function (x) { return x.studentId === sid && x.activityId === aid; });
    return g ? g.score : null;
  }
  function setGrade(sid, aid, score) {
    var idx = STATE.grades.findIndex(function (x) { return x.studentId === sid && x.activityId === aid; });
    if (idx >= 0) STATE.grades[idx].score = score;
    else STATE.grades.push({ studentId: sid, activityId: aid, score: score });
  }
  function studentTotal(sid) {
    return STATE.activities.reduce(function (sum, act) {
      var g = getGrade(sid, act.id);
      return sum + (g != null ? g : 0);
    }, 0);
  }
  function fmt(n) { return Number(n || 0).toFixed(2); }
  function pct(a, b) { return b > 0 ? Math.round(a / b * 100) : 0; }
  function addRecentActivity(text, type) {
    var now = new Date();
    var timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    STATE.recentActivity.unshift({ text: text, type: type, time: timeStr, date: now.toLocaleDateString() });
    if (STATE.recentActivity.length > 20) STATE.recentActivity.pop();
  }

  function renderDashboard() {
    var config = STATE.courseConfig;
    var students = STATE.students;
    var activities = STATE.activities;
    var allTotals = students.map(function (s) { return studentTotal(s.id); });
    var approvedCount = allTotals.filter(function (t) { return t >= 7; }).length;
    var failedCount = allTotals.filter(function (t) { return t > 0 && t < 7; }).length;
    var classAverage = allTotals.length > 0 ? allTotals.reduce(function (a, b) { return a + b; }, 0) / allTotals.length : 0;

    var dashSub = document.getElementById('dash-sub');
    if (dashSub) dashSub.textContent = (config.asignatura || 'Sin Asignatura') + ' — ' + (config.periodoAcademico || '—');
    var dashStats = document.getElementById('dash-stats');
    if (dashStats) {
      dashStats.innerHTML = [
        { label: 'Estudiantes', val: students.length, color: 'var(--navy)' },
        { label: 'Aprobados', val: approvedCount, color: 'var(--green)' },
        { label: 'Reprobados', val: failedCount, color: 'var(--red)' },
        { label: 'Promedio', val: classAverage.toFixed(2), color: 'var(--amber)' }
      ].map(function (s) {
        return '<div class="stat-card"><div class="stat-label">' + s.label + '</div><div class="stat-val" style="color:' + s.color + '">' + s.val + '</div></div>';
      }).join('');
    }
    var dashBody = document.getElementById('dash-student-body');
    if (dashBody) {
      dashBody.innerHTML = students.map(function (s, i) {
        var tot = studentTotal(s.id);
        var passed = tot >= 7;
        return '<tr><td>' + (i + 1) + '</td><td>' + s.apellidos + ' ' + s.nombres + '</td><td>' + fmt(tot) + '</td><td><span class="badge ' + (passed ? 'badge-green' : 'badge-red') + '">' + (passed ? 'Aprobado' : 'Reprobado') + '</span></td></tr>';
      }).join('');
    }
    var dashRa = document.getElementById('dash-ra-summary');
    if (dashRa) {
      dashRa.innerHTML = '<div class="item-row"><div class="item-name">RAAU</div><div>' + STATE.raauEntries.length + '</div></div>' +
        '<div class="item-row"><div class="item-name">Actividades</div><div>' + activities.length + '</div></div>';
    }
  }

  function renderEstudiantes() {
    var students = STATE.students;
    document.getElementById('est-sub').textContent = students.length + ' estudiantes matriculados';
    var allTotals = students.map(function (s) { return studentTotal(s.id); });
    var approvedCount = allTotals.filter(function (t) { return t >= 7; }).length;
    var classAverage = allTotals.length > 0 ? allTotals.reduce(function (a, b) { return a + b; }, 0) / allTotals.length : 0;
    document.getElementById('est-stats').innerHTML = [
      { label: 'Total', val: students.length, color: 'var(--navy)' },
      { label: 'Aprobados', val: approvedCount, color: 'var(--green)' },
      { label: 'Promedio', val: classAverage.toFixed(2), color: 'var(--amber)' }
    ].map(function (s) {
      return '<div class="card" style="padding:14px 18px"><div style="font-size:.75rem;color:var(--gray-400)">' + s.label + '</div><div style="font-size:1.4rem;font-weight:700;color:' + s.color + ';margin-top:3px">' + s.val + '</div></div>';
    }).join('');
    renderStudentTable();
  }

  function renderStudentTable() {
    var query = (document.getElementById('est-search') ? document.getElementById('est-search').value : '').toLowerCase();
    var filtered = STATE.students.filter(function (s) {
      return (s.apellidos + ' ' + s.nombres + ' ' + s.cedula).toLowerCase().indexOf(query) !== -1;
    });
    document.getElementById('est-table-title').textContent = 'Nómina (' + filtered.length + ')';
    document.getElementById('est-body').innerHTML = filtered.map(function (s, i) {
      var tot = studentTotal(s.id);
      var passed = tot >= 7;
      return '<tr><td style="color:var(--gray-400)">' + (i + 1) + '</td><td style="font-family:var(--mono);font-size:.78rem">' + s.cedula + '</td><td style="font-weight:500">' + s.apellidos + '</td><td>' + s.nombres + '</td><td style="text-align:center;font-weight:700;font-family:var(--mono);color:' + (passed ? 'var(--green)' : 'var(--red)') + '">' + fmt(tot) + '</td><td style="text-align:center"><span class="badge ' + (passed ? 'badge-green' : 'badge-red') + '">' + (passed ? 'Aprobado' : 'Reprobado') + '</span></td><td style="text-align:center"><div style="display:flex;gap:5px;justify-content:center"><button class="btn btn-ghost btn-sm" onclick="editStudent(\'' + s.id + '\')" title="Editar">Editar</button><button class="btn btn-danger btn-sm" onclick="confirmDelete(\'' + s.id + '\')" title="Eliminar">Eliminar</button></div></td></tr>';
    }).join('');
  }

  function showAddStudent() {
    var formEl = document.getElementById('est-add-form');
    formEl.style.display = 'block';
    formEl.innerHTML = '<div class="inline-form"><div class="inline-form-title">Nuevo Estudiante</div>' +
      '<div class="form-grid-3">' +
      '<div class="form-group"><label class="form-label">Cédula</label><input class="form-input" id="add-cedula" placeholder="Ej: 220027839-4"></div>' +
      '<div class="form-group"><label class="form-label">Apellidos</label><input class="form-input" id="add-apellidos" placeholder="Ej: GARCIA LOPEZ"></div>' +
      '<div class="form-group"><label class="form-label">Nombres</label><input class="form-input" id="add-nombres" placeholder="Ej: JUAN CARLOS"></div>' +
      '</div>' +
      '<div style="display:flex;gap:8px;margin-top:8px">' +
      '<button class="btn btn-success btn-sm" onclick="saveAddStudent()">✓ Guardar</button>' +
      '<button class="btn btn-ghost btn-sm" onclick="document.getElementById(\'est-add-form\').style.display=\'none\'">✕ Cancelar</button>' +
      '</div></div>';
  }

  function saveAddStudent() {
    var cedulaVal = document.getElementById('add-cedula').value.trim();
    var apellidosVal = document.getElementById('add-apellidos').value.trim().toUpperCase();
    var nombresVal = document.getElementById('add-nombres').value.trim().toUpperCase();
    if (!cedulaVal || !apellidosVal || !nombresVal) return;
    STATE.students.push({ id: 's' + Date.now(), cedula: cedulaVal, apellidos: apellidosVal, nombres: nombresVal });
    save();
    document.getElementById('est-add-form').style.display = 'none';
    addRecentActivity('Estudiante ' + nombresVal + ' ' + apellidosVal + ' agregado', 'student');
    renderEstudiantes();
    showToast('Estudiante agregado', 'success');
  }

  function editStudent(id) {
    var student = STATE.students.find(function (x) { return x.id === id; });
    if (!student) return;
    openModal('Editar Estudiante',
      '<div class="form-group"><label class="form-label">Cédula</label><input class="form-input" id="m-ced" value="' + student.cedula + '"></div>' +
      '<div class="form-group"><label class="form-label">Apellidos</label><input class="form-input" id="m-ape" value="' + student.apellidos + '"></div>' +
      '<div class="form-group"><label class="form-label">Nombres</label><input class="form-input" id="m-nom" value="' + student.nombres + '"></div>',
      [
        { label: 'Cancelar', cls: 'btn-ghost', action: 'close' },
        { label: 'Guardar', cls: 'btn-success', action: function () {
          student.cedula = document.getElementById('m-ced').value;
          student.apellidos = document.getElementById('m-ape').value.toUpperCase();
          student.nombres = document.getElementById('m-nom').value.toUpperCase();
          save(); renderEstudiantes(); closeModal();
          showToast('Estudiante actualizado', 'success');
        } }
      ]);
  }

  function confirmDelete(id) {
    var student = STATE.students.find(function (x) { return x.id === id; });
    openModal('Eliminar Estudiante',
      '<p style="color:var(--gray-600);font-size:.85rem">¿Desea eliminar a <strong>' + student.apellidos + ' ' + student.nombres + '</strong>? Se eliminarán sus calificaciones.</p>',
      [
        { label: 'Cancelar', cls: 'btn-ghost', action: 'close' },
        { label: 'Eliminar', cls: 'btn-danger', action: function () {
          STATE.students = STATE.students.filter(function (x) { return x.id !== id; });
          STATE.grades = STATE.grades.filter(function (g) { return g.studentId !== id; });
          save(); renderEstudiantes(); closeModal();
          showToast('Estudiante eliminado', 'success');
        } }
      ]);
  }

  function renderCalificaciones() {
    var config = STATE.courseConfig;
    document.getElementById('cal-sub').textContent = (config.asignatura || 'Sin Asignatura') + ' — ' + config.aporte + ' — PAO ' + config.pao;
    document.getElementById('cal-legend').innerHTML = COMPONENTS.map(function (comp) {
      return '<div class="comp-legend"><div class="comp-dot" style="background:' + COMPONENT_COLORS[comp] + '"></div>' + comp + ' (' + COMPONENT_WEIGHTS[comp] + ' pts)</div>';
    }).join('');
    renderGradeTable();
  }

  function renderGradeTable() {
    var query = (document.getElementById('cal-search') ? document.getElementById('cal-search').value : '').toLowerCase();
    var filtered = STATE.students.filter(function (s) {
      return (s.apellidos + ' ' + s.nombres + ' ' + s.cedula).toLowerCase().indexOf(query) !== -1;
    });
    var activities = STATE.activities;
    var totalExpected = STATE.students.length * activities.length;
    var totalEntered = STATE.grades.filter(function (g) { return g.score != null; }).length;
    var progressPct = pct(totalEntered, totalExpected);
    document.getElementById('cal-progress-label').textContent = totalEntered + '/' + totalExpected + ' notas';
    document.getElementById('cal-progress-fill').style.width = progressPct + '%';
    document.getElementById('cal-progress-pct').textContent = progressPct + '%';

    var html = '<table class="grade-table"><thead><tr><th class="student-cell">Estudiante</th>';
    activities.forEach(function (act) {
      html += '<th>' + act.name + '<br><span style="font-size:.6rem">/' + act.maxScore + '</span></th>';
    });
    html += '<th>NOTA FINAL</th></tr></thead><tbody>';
    filtered.forEach(function (student) {
      var tot = studentTotal(student.id);
      var passed = tot >= 7;
      html += '<tr><td class="student-cell"><div class="student-name">' + student.apellidos + ' ' + student.nombres + '</div><div class="student-id">' + student.cedula + '</div></td>';
      activities.forEach(function (act) {
        var gradeVal = getGrade(student.id, act.id);
        var hasValue = gradeVal != null;
        html += '<td><input class="grade-input ' + (hasValue ? 'has-val' : '') + '" type="number" step="0.01" min="0" max="' + act.maxScore + '" data-sid="' + student.id + '" data-aid="' + act.id + '" data-max="' + act.maxScore + '" value="' + (hasValue ? gradeVal : '') + '" onchange="onGradeChange(this)"></td>';
      });
      html += '<td><input class="grade-total-input ' + (passed ? 'pass' : 'fail') + '" type="text" readonly value="' + fmt(tot) + '"></td></tr>';
    });
    html += '</tbody></table>';
    document.getElementById('cal-table-wrap').innerHTML = html;
  }

  function onGradeChange(el) {
    var sid = el.dataset.sid;
    var aid = el.dataset.aid;
    var maxVal = parseFloat(el.dataset.max);
    var raw = parseFloat(el.value);
    var score = null;
    if (!isNaN(raw)) score = Math.round(Math.max(0, Math.min(maxVal, raw)) * 100) / 100;
    setGrade(sid, aid, score);
    if (score != null) el.value = score;
    renderGradeTable();
  }

  function calSave() {
    save();
    addRecentActivity('Calificaciones guardadas manualmente', 'grade');
    showToast('Calificaciones guardadas', 'success');
  }

  function renderReporte() {
    var config = STATE.courseConfig;
    var students = STATE.students;
    var allTotals = students.map(function (s) { return studentTotal(s.id); });
    var classAverage = allTotals.length > 0 ? allTotals.reduce(function (a, b) { return a + b; }, 0) / allTotals.length : 0;
    var approvedCount = allTotals.filter(function (t) { return t >= 7; }).length;
    document.getElementById('rep-stats').innerHTML = [
      { label: 'Promedio', val: classAverage.toFixed(2), color: 'var(--navy)' },
      { label: 'Aprobados', val: approvedCount + '/' + students.length, color: 'var(--green)' }
    ].map(function (s) {
      return '<div class="stat-card"><div class="stat-label">' + s.label + '</div><div class="stat-val" style="color:' + s.color + '">' + s.val + '</div></div>';
    }).join('');
    document.getElementById('rep-printable').innerHTML = '<div class="report-header"><div class="report-institution">ESCUELA SUPERIOR POLITÉCNICA DE CHIMBORAZO</div><div class="report-subtitle">' + (config.asignatura || '—') + '</div></div>';
  }

  function renderPage(page) {
    if (page === 'dashboard') renderDashboard();
    else if (page === 'configuracion') renderConfig();
    else if (page === 'estudiantes') renderEstudiantes();
    else if (page === 'calificaciones') renderCalificaciones();
    else if (page === 'reporte') renderReporte();
  }

  function navigate(page) {
    document.querySelectorAll('.page').forEach(function (p) { p.classList.remove('active'); });
    document.querySelectorAll('.nav-item').forEach(function (n) { n.classList.remove('active'); });
    var pageEl = document.getElementById('page-' + page);
    if (pageEl) pageEl.classList.add('active');
    var navEl = document.querySelector('.nav-item[data-page="' + page + '"]');
    if (navEl) navEl.classList.add('active');
    renderPage(page);
  }

  window.closeModal = closeModal;
  window.onCarreraChange = onCarreraChange;
  window.onPaoChange = onPaoChange;
  window.onAsignaturaChange = onAsignaturaChange;
  window.cfgPrev = cfgPrev;
  window.cfgNext = cfgNext;
  window.cfgSave = cfgSave;
  window.toggleRAC = toggleRAC;
  window.addRAAU = addRAAU;
  window.deleteRAAU = deleteRAAU;
  window.addActivity = addActivity;
  window.deleteActivity = deleteActivity;
  window.renderStudentTable = renderStudentTable;
  window.showAddStudent = showAddStudent;
  window.saveAddStudent = saveAddStudent;
  window.editStudent = editStudent;
  window.confirmDelete = confirmDelete;
  window.onGradeChange = onGradeChange;
  window.calSave = calSave;

  var carrera = document.getElementById('cfg-carrera');
  var pao = document.getElementById('cfg-pao');
  var asig = document.getElementById('cfg-asignatura');
  if (carrera) carrera.addEventListener('change', onCarreraChange);
  if (pao) pao.addEventListener('change', onPaoChange);
  if (asig) asig.addEventListener('change', onAsignaturaChange);

  var prev = document.getElementById('cfg-prev');
  var next = document.getElementById('cfg-next');
  var saveBtn = document.getElementById('cfg-save');
  if (prev) prev.addEventListener('click', cfgPrev);
  if (next) next.addEventListener('click', cfgNext);
  if (saveBtn) saveBtn.addEventListener('click', cfgSave);

  document.querySelectorAll('.nav-item').forEach(function (el) {
    el.addEventListener('click', function () { navigate(el.dataset.page); });
  });

  updateSidebar();
  renderDashboard();
}
