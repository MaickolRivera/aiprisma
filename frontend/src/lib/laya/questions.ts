/**
 * Preguntas que se le hacen a Laya. Port 1:1 de `backend/app/questions/laya.py`:
 * si cambias una, cámbiala en los dos lados.
 */

export type Question =
  | { type: "choice"; instructions: string; criteria: Record<string, string> }
  | { type: "noul"; instructions: string };

const TEMAS: Record<string, Question> = {
  tema: {
    type: "choice",
    instructions: "¿De qué trata principalmente la noticia? Elige según el hecho central, no según quién habla.",
    criteria: {
      salud: "enfermedades, hospitales, medicina, sistema de salud",
      deporte: "partidos, competencias, equipos, atletas, torneos",
      cultura: "arte, música, cine, literatura, tradiciones, patrimonio",
      sociedad: "educación, comunidad, familia, derechos, vida cotidiana",
      economia: "mercados, empleo, impuestos, precios, empresas, inflación",
      politica: "elecciones, partidos políticos, leyes, debates en el congreso, decisiones de gobierno",
      seguridad: "crimen, violencia, policía, conflicto armado, justicia",
      tecnologia: "internet, inteligencia artificial, dispositivos, ciencia, investigación",
      entretenimiento: "farándula, celebridades, televisión, espectáculos, redes sociales",
      internacional: "relaciones entre países, diplomacia, guerras, organismos internacionales",
      medio_ambiente: "clima, desastres naturales, sismos, contaminación, ecosistemas",
    },
  },
};

const ALERTAS: Record<string, Question> = {
  alerta_clickbait: {
    type: "noul",
    instructions: "¿El titular oculta información o usa frases como 'no vas a creer' para provocar que el lector haga clic?",
  },
  alerta_lenguaje_cargado: {
    type: "noul",
    instructions: "¿Usa adjetivos valorativos o palabras con carga emocional para describir hechos?",
  },
  alerta_miedo: {
    type: "noul",
    instructions: "¿Busca generar miedo o una urgencia falsa?",
  },
  alerta_nosotros_ellos: {
    type: "noul",
    instructions: "¿Divide a las personas en dos bandos enfrentados?",
  },
  alerta_ataque_personal: {
    type: "noul",
    instructions: "¿Descalifica a personas en vez de discutir sus ideas?",
  },
  alerta_generalizacion: {
    type: "noul",
    instructions: "¿El texto atribuye una característica negativa a todo un grupo de personas a partir de pocos casos?",
  },
};

/** [pregunta del polo negativo | null, pregunta del polo positivo]. `null` = eje de un solo polo. */
export const EJES: Record<string, [string | null, string]> = {
  politica_x: [
    "¿El texto defiende posturas económicas de izquierda, como más impuestos a los ricos, redistribución o más intervención del Estado?",
    "¿El texto defiende posturas económicas de derecha, como menos impuestos, más mercado o menos intervención del Estado?",
  ],
  politica_y: [
    "¿El texto defiende las libertades individuales frente al control del Estado o de la autoridad?",
    "¿El texto defiende el orden, la mano dura, el control o la autoridad por encima de las libertades individuales?",
  ],

  intencion_x: [
    null, // informar
    "¿El texto busca persuadir al lector de adoptar una postura en lugar de solo informar?",
  ],
  intencion_y: [
    null, // equilibrado
    "¿El texto presenta solo la versión de una parte, sin incluir otras voces?",
  ],

  tono_x: [
    null, // sobrio
    "¿El texto usa un tono sensacionalista, exagerado o alarmista?",
  ],
  tono_y: [
    "¿El texto transmite esperanza, alegría u optimismo?",
    "¿El texto busca que el lector sienta miedo, rabia o indignación?",
  ],

  sustento_x: [
    null, // hechos
    "¿El texto se basa principalmente en opiniones en lugar de hechos comprobables?",
  ],
  sustento_y: [
    null, // fuentes verificables
    "¿El texto carece de fuentes identificables o usa fuentes anónimas?",
  ],
};

const CAPAS: Record<string, Question> = {
  politica_aplica: {
    type: "noul",
    instructions: "¿El texto trata un tema político o social, como gobierno, leyes, economía pública o derechos?",
  },
};
for (const [eje, [neg, pos]] of Object.entries(EJES)) {
  if (neg) CAPAS[`${eje}_neg`] = { type: "noul", instructions: neg };
  CAPAS[`${eje}_pos`] = { type: "noul", instructions: pos };
}

export const QUESTIONS: Record<string, Question> = { ...TEMAS, ...ALERTAS, ...CAPAS };
