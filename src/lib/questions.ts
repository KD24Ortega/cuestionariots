export type Pregunta = {
  enunciado: string;
  opciones: [string, string, string, string];
  respuestaCorrecta: "A" | "B" | "C" | "D";
};

const isOptionLine = (s: string) => /^[ABCD]\)\s?/.test(s.trim());
const optionText = (s: string) => s.trim().slice(2).trim();

export function parsePreguntas(txt: string): Pregunta[] {
  const lines = txt.replace(/\r\n/g, "\n").split("\n");
  const preguntas: Pregunta[] = [];

  let i = 0;
  while (i < lines.length) {
    while (i < lines.length && lines[i].trim() === "") i++;
    if (i >= lines.length) break;

    // enunciado hasta encontrar "A)"
    const enunciadoLines: string[] = [];
    while (i < lines.length && !isOptionLine(lines[i])) {
      enunciadoLines.push(lines[i]);
      i++;
    }
    const enunciado = enunciadoLines.join("\n").trim();
    if (!enunciado) continue;

    // opciones A-D
    const opts: string[] = [];
    for (let k = 0; k < 4; k++) {
      if (i >= lines.length || !isOptionLine(lines[i])) {
        // formato inválido: saltar hasta línea vacía
        while (i < lines.length && lines[i].trim() !== "") i++;
        opts.length = 0;
        break;
      }
      opts.push(optionText(lines[i]));
      i++;
    }
    if (opts.length !== 4) continue;

    // ANSWER:
    while (i < lines.length && lines[i].trim() === "") i++;
    if (i >= lines.length) break;
    const ansLine = lines[i].trim();
    i++;

    const m = /^ANSWER:\s*([ABCD])\s*$/.exec(ansLine);
    if (!m) continue;

    const opciones = [opts[0]!, opts[1]!, opts[2]!, opts[3]!] as [
      string,
      string,
      string,
      string
    ];
    const respuestaCorrecta = m[1] as Pregunta["respuestaCorrecta"];

    preguntas.push({
      enunciado,
      opciones,
      respuestaCorrecta
    });
  }

  return preguntas;
}
