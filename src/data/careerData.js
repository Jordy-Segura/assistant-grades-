export const DB_RACS_TI = [
  { id: 'rac1', code: 'RAC1', description: 'Comunica efectivamente en español e inglés en diversos contextos profesionales.' },
  { id: 'rac2', code: 'RAC2', description: 'Aplica métodos y técnicas eficientes en el gobierno, auditoría y gestión de proyectos de Tecnologías de la Información (TI) para la administración de tecnologías informáticas fiables que protejan la información de los usuarios o corporaciones.' },
  { id: 'rac3', code: 'RAC3', description: 'Implementa soluciones basadas en tecnologías web y móvil para el cumplimiento de los requerimientos y estándares corporativos.' },
  { id: 'rac4', code: 'RAC4', description: 'Aplica las competencias adquiridas con liderazgo en actividades inherentes a la profesión para la construcción de soluciones innovadoras con sostenibilidad ambiental basados en TIC y TIP.' },
  { id: 'rac5', code: 'RAC5', description: 'Desarrolla diferentes tecnologías de redes para la optimización de la administración y gestión de grandes volúmenes de datos en sistemas distribuidos.' }
];

export const COMPONENT_WEIGHTS = { ACD: 3.5, APEX: 3.5, AAUT: 3.0 };
export const COMPONENT_COLORS = { ACD: '#3b82f6', APEX: '#22c55e', AAUT: '#f59e0b' };
export const COMPONENT_LABELS = { ACD: 'Aprendizaje en Contacto con el Docente', APEX: 'Aprendizaje Práctico Experimental', AAUT: 'Aprendizaje Autónomo' };
export const COMPONENTS = ['ACD', 'APEX', 'AAUT'];

export const EVAL_PROCEDURES = {
  ACD: [
    { id: 'acd1', name: 'Participación en clase' }, { id: 'acd2', name: 'Investigación Formativa' },
    { id: 'acd3', name: 'Resúmenes' }, { id: 'acd4', name: 'Lectura crítica de textos' },
    { id: 'acd5', name: 'Exposiciones' }, { id: 'acd6', name: 'Proyecto o planes en el aula' },
    { id: 'acd7', name: 'Comunicación oral y escrita' }, { id: 'acd8', name: 'Debates' },
    { id: 'acd9', name: 'Cuestionarios' }, { id: 'acd10', name: 'Ensayos' }, { id: 'acd11', name: 'Panel de discusión' }
  ],
  APEX: [
    { id: 'apex1', name: 'Aplicación de contenidos' }, { id: 'apex2', name: 'Talleres en equipo' },
    { id: 'apex3', name: 'Resolución de problemas' }, { id: 'apex4', name: 'Comprobación' },
    { id: 'apex5', name: 'Experimentación' }, { id: 'apex6', name: 'Replicación de casos' },
    { id: 'apex7', name: 'Práctica de laboratorio' }, { id: 'apex8', name: 'Simulación' }, { id: 'apex9', name: 'Talleres individuales' }
  ],
  AAUT: [
    { id: 'aaut1', name: 'Escritura académica' }, { id: 'aaut2', name: 'Elaboración de informes' },
    { id: 'aaut3', name: 'Preparación para lecciones' }, { id: 'aaut4', name: 'Preparación de exámenes' },
    { id: 'aaut5', name: 'Lecturas complementarias' }, { id: 'aaut6', name: 'Resolución de ejercicios' }
  ]
};

export const FULL_RAAU_TI = {
  'INGLÉS I': ['Utiliza expresiones de uso común para comunicar ideas sencillas sobre actividades cotidianas, descripciones familiares y opiniones básicas.', 'rac1'],
  'FUNDAMENTOS DE PROGRAMACIÓN': ['Implementa algoritmos estructurados para computadoras eficientes para la resolución de problemas planteados.', 'rac3'],
  'EDUCACIÓN FÍSICA': ['Aplica métodos teóricos y prácticos para facilitar la comprensión de las diferentes técnicas de los deportes.', 'rac4'],
  'SOSTENIBILIDAD AMBIENTAL': ['Aplica los principios y normas ambientales para la adopción de alternativas de evaluación, control y mitigación de impactos ambientales contribuyendo al equilibrio ecológico, económico, y social.', 'rac4'],
  'COMUNICACIÓN ORAL Y ESCRITA': ['Aplica los conceptos de la comunicación oral y escrita en diversos contextos sociales y profesionales.', 'rac1'],
  'QUÍMICA': ['Evalúa las reacciones químicas inorgánicas en el laboratorio caracterizando las funciones químicas.', 'rac2'],
  'ÁLGEBRA LINEAL': ['Comprende las representaciones algebraicas y geométricas de vectores en varias dimensiones y sus operaciones.', 'rac2'],
  'FÍSICA MECÁNICA': ['Aplica los principios fundamentales de la física mecánica en la resolución de problemas relacionados con el movimiento y las fuerzas en sistemas físicos.', 'rac2'],
  'INGLÉS II': ['Utiliza vocabulario y frases simples sobre temas de interés personal comunicando ideas básicas y comunes con tiempos gramaticales como presente, pasado y futuro.', 'rac1'],
  'METODOLOGÍA DE LA INVESTIGACIÓN': ['Aplica las metodologías de investigación en las propuestas de proyectos tecnológicos.', 'rac2'],
  'CÁLCULO DE UNA VARIABLE': ['Aplica los conocimientos del cálculo para la resolución de problemas matemáticos con aplicaciones tecnológicas en su entorno.', 'rac2'],
  'ADMINISTRACIÓN DE SISTEMAS OPERATIVOS': ['Configura sistemas operativos para la solución de problemas tecnológicos en diferentes plataformas.', 'rac2'],
  'ESTADÍSTICA Y PROBABILIDAD': ['Aplica conceptos estadísticos y probabilísticos para el tratamiento de datos en eventos aleatorios.', 'rac2'],
  'PROGRAMACIÓN': ['Implementa aplicaciones de escritorio para ambientes colaborativos en desarrollo de soluciones informáticas.', 'rac3'],
  'INGLÉS III': ['Habla en diversos contextos sobre situaciones reales, verdades científicas y hechos describiendo eventos pasados, presentes y futuros con claridad.', 'rac1'],
  'SISTEMAS DE COMUNICACIÓN': ['Interpreta las técnicas de transmisión, modulación y multiplexación para la transmisión de señales analógicas y digitales.', 'rac5'],
  'FUNDAMENTOS DE BASE DE DATOS': ['Diseña modelos bases de datos relacionales para la manipulación de los datos en la resolución de problemas del entorno.', 'rac5'],
  'ECUACIONES DIFERENCIALES': ['Aplica métodos de ecuaciones diferenciales en la resolución de problemas reales en el área de las tecnologías de la información.', 'rac2'],
  'CÁLCULO DE VARIAS VARIABLES': ['Aplica los conceptos del cálculo diferencial e integral en problemas reales que involucran múltiples variables.', 'rac2'],
  'GESTIÓN DE PROYECTOS TI': ['Diseña planes de proyecto que garanticen la implementación de soluciones tecnológicas.', 'rac2'],
  'REALIDAD SOCIOECONÓMICA E INTERCULTURALIDAD': ['Relaciona los conceptos entre la estructura de la economía, cultura y el proceso social en el contexto ecuatoriano.', 'rac4'],
  'INGLÉS IV': ['Construye ideas coherentes con un lenguaje claro y preciso desarrollando el pensamiento crítico y argumentativo.', 'rac1'],
  'MATEMÁTICA AVANZADA': ['Integra modelos de matemática avanzada en la resolución de problemas complejos de ingeniería en TI.', 'rac2'],
  'FUNDAMENTOS DE REDES': ['Diseña redes de computadoras basados en modelos OSI, TCP/IP para entornos locales.', 'rac5'],
  'DISEÑO DE EXPERIENCIA DE USUARIO': ['Aplica los principios de usabilidad, accesibilidad y diseño centrado en el usuario en la creación de prototipos.', 'rac3'],
  'ADMINISTRACIÓN DE BASE DE DATOS': ['Diseña base de datos avanzadas SQL y no SQL para soluciones tecnológicas.', 'rac5'],
  'MÉTODOS NUMÉRICOS': ['Aplica los métodos numéricos para resolución de problemas de un paso y multipaso aplicados en tecnologías informáticas.', 'rac2'],
  'GESTIÓN ADMINISTRATIVA': ['Identifica riesgos y procesos de control estratégico con la aplicación de medidas preventivas para organizaciones.', 'rac2'],
  'CONMUTACIÓN Y ENRUTAMIENTO': ['Diseña topologías de redes de datos para la conmutación y enrutamiento de paquetes en diferentes ambientes.', 'rac5'],
  'TECNOLOGÍA WEB': ['Implementa aplicaciones web para la solución de problemas tecnológicos en el entorno.', 'rac3'],
  'BIG DATA': ['Utiliza aplicaciones del ecosistema de Big Data para la implementación de soluciones escalables.', 'rac5'],
  'TECNOLOGIA Y DISEÑO MULTIMEDIA': ['Utiliza software y herramientas multimedia para creación y edición de contenido multimedia e inmersivo.', 'rac3'],
  'INFRAESTRUCTURA TI': ['Implementa infraestructura TI para soluciones escalables que atiendan necesidades empresariales.', 'rac2'],
  'ÉTICA Y RELACIONES HUMANAS': ['Aplica los principios éticos universales en los diferentes ambientes sociales y laborales para una convivencia armónica.', 'rac4'],
  'ESCALABILIDAD DE REDES': ['Implementa redes escalables con alta disponibilidad y redundancia para pequeñas y medianas empresas.', 'rac5'],
  'COMPUTACIÓN MÓVIL': ['Desarrolla aplicaciones móviles adaptables para diferentes plataformas móviles.', 'rac3'],
  'MACHINE LEARNING': ['Analiza patrones de comportamiento de datos en la implementación de modelos predictivos integrados en producción.', 'rac2'],
  'INTEROPERABILIDAD DE PLATAFORMAS': ['Analiza las arquitecturas orientadas a servicios (SOA) y los servicios de integración SOAP y REST.', 'rac2'],
  'EMPRENDIMIENTO': ['Diseña planes de negocios tecnológicos, innovadores y sostenibles para diferentes grupos humanos.', 'rac4'],
  'ITINERARIO 1: Ethical Hacking': ['Aplica técnicas de hacking ético en la identificación de vulnerabilidades de sistemas informáticos y redes.', 'rac2'],
  'ITINERARIO 1: Criptografía': ['Aplica criptosistemas y protocolos de criptografía para el aseguramiento de infraestructuras tecnológicas.', 'rac2'],
  'BUSINESS INTELLIGENCE': ['Implementa entornos de visualización y análisis de negocios para la toma de decisiones estratégicas.', 'rac2'],
  'SEGURIDAD TI': ['Implementa medidas de seguridad efectivas que salvaguarden recursos y procesos críticos dentro de una organización.', 'rac2'],
  'APLICACIONES IoT': ['Implementa soluciones tecnológicas innovadoras basadas en IoT para sectores industrial, empresarial y social.', 'rac3'],
  'FORMULACIÓN DE TRABAJO DE TITULACIÓN': ['Desarrolla la propuesta de trabajo de titulación acorde a la normativa vigente.', 'rac2'],
  'CLOUD COMPUTING': ['Aplica arquitecturas en la nube para la optimización de recursos y la escalabilidad de servicios de TI.', 'rac2'],
  'AUDITORÍA TI': ['Aplica normas de auditoría TI en los sistemas de información.', 'rac2'],
  'GOBIERNO TI': ['Identifica marcos de referencia, estándares y mejores prácticas relacionadas al gobierno TI.', 'rac2'],
  'SISTEMAS DE INFORMACIÓN GEOGRÁFICA': ['Desarrolla soluciones tecnológicas integrales basadas en SIG para análisis avanzado geoespacial.', 'rac3'],
  'ITINERARIO 2: Deep Learning 2': ['Implementa modelos de inteligencia artificial con datos multimodales para automatización de procesos.', 'rac2'],
  'ITINERARIO 2: Deep Learning 1': ['Implementa modelos de inteligencia artificial para automatización de procesos con datos 2D y 3D.', 'rac2'],
  'TRABAJO DE TITULACIÓN': ['Desarrolla el trabajo de titulación de acuerdo a la modalidad seleccionada.', 'rac2']
};

export function buildDB_ESPOCH() {
  const db = {
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
        '7': ['ITINERARIO 1: Ethical Hacking', 'ITINERARIO 1: Criptografía', 'BUSINESS INTELLIGENCE', 'SEGURIDAD TI', 'APLICACIONES IoT', 'PRÁCTICAS LABORALES', 'FORMULACIÓN DE TRABAJO DE TITULACIÓN'],
        '8': ['CLOUD COMPUTING', 'AUDITORÍA TI', 'GOBIERNO TI', 'SISTEMAS DE INFORMACIÓN GEOGRÁFICA', 'ITINERARIO 2: Deep Learning 2', 'ITINERARIO 2: Deep Learning 1', 'TRABAJO DE TITULACIÓN']
      },
      asignaturas: {
        'INGLÉS I': { raau: [{ code: 'RAAU1', description: 'Utiliza expresiones de uso común para comunicar ideas sencillas.', racId: 'rac1' }] },
        'FUNDAMENTOS DE PROGRAMACIÓN': { raau: [{ code: 'RAAU1', description: 'Implementa algoritmos estructurados para computadoras eficientes.', racId: 'rac3' }] },
        'SOSTENIBILIDAD AMBIENTAL': { raau: [{ code: 'RAAU1', description: 'Aplica los principios y normas ambientales para la adopción de alternativas.', racId: 'rac4' }] },
        'COMUNICACIÓN ORAL Y ESCRITA': { raau: [{ code: 'RAAU1', description: 'Aplica los conceptos de la comunicación oral y escrita en diversos contextos.', racId: 'rac1' }] },
        'GESTIÓN DE PROYECTOS TI': { raau: [
          { code: 'RAAU1', description: 'Diseña planes de proyecto que garanticen la implementación de soluciones.', racId: 'rac2' },
          { code: 'RAAU2', description: 'Utiliza herramientas tecnológicas para el seguimiento y control.', racId: 'rac2' }
        ] },
        'FUNDAMENTOS DE REDES': { raau: [{ code: 'RAAU1', description: 'Diseña redes de computadoras basados en modelos OSI, TCP/IP.', racId: 'rac5' }] },
        'GOBIERNO TI': { raau: [{ code: 'RAAU1', description: 'Identifica los marcos de referencia y estándares del gobierno TI.', racId: 'rac2' }] },
        'AUDITORÍA TI': { raau: [{ code: 'RAAU1', description: 'Aplica normas de auditoría TI en sistemas de información.', racId: 'rac2' }] },
        'CLOUD COMPUTING': { raau: [{ code: 'RAAU1', description: 'Aplica arquitecturas en la nube para optimización de recursos.', racId: 'rac2' }] },
        'PROGRAMACIÓN': { raau: [{ code: 'RAAU1', description: 'Implementa aplicaciones de escritorio para ambientes colaborativos.', racId: 'rac3' }] },
        'ADMINISTRACIÓN DE SISTEMAS OPERATIVOS': { raau: [{ code: 'RAAU1', description: 'Configura sistemas operativos para solución de problemas.', racId: 'rac2' }] },
        'INGLÉS II': { raau: [{ code: 'RAAU1', description: 'Utiliza vocabulario y frases simples sobre temas de interés.', racId: 'rac1' }] },
        'INGLÉS III': { raau: [{ code: 'RAAU1', description: 'Habla en diversos contextos sobre situaciones reales con claridad.', racId: 'rac1' }] },
        'INGLÉS IV': { raau: [{ code: 'RAAU1', description: 'Construye ideas coherentes con lenguaje claro y preciso.', racId: 'rac1' }] },
        'SISTEMAS DE COMUNICACIÓN': { raau: [{ code: 'RAAU1', description: 'Interpreta técnicas de transmisión, modulación y multiplexación.', racId: 'rac5' }] },
        'FUNDAMENTOS DE BASE DE DATOS': { raau: [{ code: 'RAAU1', description: 'Diseña modelos de bases de datos relacionales.', racId: 'rac5' }] },
        'MACHINE LEARNING': { raau: [{ code: 'RAAU1', description: 'Analiza patrones de datos en implementación de modelos predictivos.', racId: 'rac2' }] },
        'SEGURIDAD TI': { raau: [{ code: 'RAAU1', description: 'Implementa medidas de seguridad efectivas.', racId: 'rac2' }] },
        'COMPUTACIÓN MÓVIL': { raau: [{ code: 'RAAU1', description: 'Desarrolla aplicaciones móviles adaptables.', racId: 'rac3' }] },
        'ADMINISTRACIÓN DE BASE DE DATOS': { raau: [{ code: 'RAAU1', description: 'Diseña bases de datos avanzadas SQL y no SQL.', racId: 'rac5' }] },
        'CONMUTACIÓN Y ENRUTAMIENTO': { raau: [{ code: 'RAAU1', description: 'Diseña topologías de redes para conmutación y enrutamiento.', racId: 'rac5' }] },
        'DISEÑO DE EXPERIENCIA DE USUARIO': { raau: [{ code: 'RAAU1', description: 'Aplica principios de usabilidad y diseño centrado en el usuario.', racId: 'rac3' }] },
        'INFRAESTRUCTURA TI': { raau: [{ code: 'RAAU1', description: 'Implementa infraestructura TI para soluciones escalables.', racId: 'rac2' }] },
        'ESCALABILIDAD DE REDES': { raau: [{ code: 'RAAU1', description: 'Implementa redes escalables con alta disponibilidad.', racId: 'rac5' }] },
        'TECNOLOGÍA WEB': { raau: [{ code: 'RAAU1', description: 'Implementa aplicaciones web para solución de problemas tecnológicos.', racId: 'rac3' }] },
        'BIG DATA': { raau: [{ code: 'RAAU1', description: 'Utiliza aplicaciones del ecosistema Big Data.', racId: 'rac5' }] },
        'MÉTODOS NUMÉRICOS': { raau: [{ code: 'RAAU1', description: 'Aplica métodos numéricos para resolución de problemas en TI.', racId: 'rac2' }] },
        'TECNOLOGÍA Y DISEÑO MULTIMEDIA': { raau: [{ code: 'RAAU1', description: 'Utiliza software multimedia para creación de contenido.', racId: 'rac3' }] },
        'GESTIÓN ADMINISTRATIVA': { raau: [{ code: 'RAAU1', description: 'Identifica riesgos y procesos de control estratégico.', racId: 'rac2' }] },
        'ÉTICA Y RELACIONES HUMANAS': { raau: [{ code: 'RAAU1', description: 'Aplica principios éticos universales.', racId: 'rac4' }] },
        'CÁLCULO DE UNA VARIABLE': { raau: [{ code: 'RAAU1', description: 'Aplica conocimientos del cálculo para resolución de problemas.', racId: 'rac2' }] },
        'ESTADÍSTICA Y PROBABILIDAD': { raau: [{ code: 'RAAU1', description: 'Aplica conceptos estadísticos y probabilísticos.', racId: 'rac2' }] },
        'ECUACIONES DIFERENCIALES': { raau: [{ code: 'RAAU1', description: 'Aplica métodos de ecuaciones diferenciales en problemas reales.', racId: 'rac2' }] },
        'CÁLCULO DE VARIAS VARIABLES': { raau: [{ code: 'RAAU1', description: 'Aplica cálculo diferencial e integral con múltiples variables.', racId: 'rac2' }] },
        'MATEMÁTICA AVANZADA': { raau: [{ code: 'RAAU1', description: 'Integra modelos de matemática avanzada.', racId: 'rac2' }] },
        'ÁLGEBRA LINEAL': { raau: [{ code: 'RAAU1', description: 'Comprende representaciones algebraicas de vectores.', racId: 'rac2' }] },
        'FÍSICA MECÁNICA': { raau: [{ code: 'RAAU1', description: 'Aplica principios de física mecánica.', racId: 'rac2' }] },
        'QUÍMICA': { raau: [{ code: 'RAAU1', description: 'Evalúa reacciones químicas inorgánicas.', racId: 'rac2' }] },
        'METODOLOGÍA DE LA INVESTIGACIÓN': { raau: [{ code: 'RAAU1', description: 'Aplica metodologías de investigación.', racId: 'rac2' }] },
        'REALIDAD SOCIOECONÓMICA E INTERCULTURALIDAD': { raau: [{ code: 'RAAU1', description: 'Relaciona conceptos de economía, cultura y proceso social.', racId: 'rac4' }] },
        'BUSINESS INTELLIGENCE': { raau: [{ code: 'RAAU1', description: 'Implementa entornos de visualización y análisis de negocios.', racId: 'rac2' }] },
        'Introducción a las TIC': { raau: [{ code: 'RAAU1', description: 'Identifica conceptos básicos de TIC.', racId: 'rac1' }] },
        'Matemáticas Básicas': { raau: [{ code: 'RAAU1', description: 'Aplica conceptos matemáticos básicos.', racId: 'rac2' }] }
      }
    },
    'AMBIENTAL': { maxPao: 8, racs: [], malla: { 'NIVELACIÓN': [] }, asignaturas: {} },
    'AGRONOMÍA': { maxPao: 9, racs: [], malla: { 'NIVELACIÓN': [] }, asignaturas: {} },
    'ZOOTECNIA': { maxPao: 8, racs: [], malla: { 'NIVELACIÓN': [] }, asignaturas: {} },
    'TURISMO': { maxPao: 8, racs: [], malla: { 'NIVELACIÓN': [] }, asignaturas: {} },
    'DERECHO': { maxPao: 0, racs: [], malla: { 'NIVELACIÓN': ['Introducción al Derecho'] }, asignaturas: {} }
  };

  // Merge FULL_RAAU_TI into TI asignaturas
  Object.keys(FULL_RAAU_TI).forEach(function (subject) {
    var pair = FULL_RAAU_TI[subject];
    db['TECNOLOGÍAS DE LA INFORMACIÓN'].asignaturas[subject] = {
      raau: [{ code: 'RAAU1', description: pair[0], racId: pair[1] }]
    };
  });

  return db;
}

export const DB_ESPOCH = buildDB_ESPOCH();
