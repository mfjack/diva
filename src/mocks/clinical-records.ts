import type {
  ClinicalRecord,
  ClinicalRecordId,
  DocumentTemplate,
  DocumentTemplateId,
} from "@/features/clinical-records/types";
import { mockDateTime } from "./mock-dates";
import { getMockPatient } from "./patients";

function clinicalRecord(
  id: string,
  patientId: string,
  dayOffset: number,
  record: Pick<ClinicalRecord, "kind" | "title" | "content">,
): ClinicalRecord {
  const patient = getMockPatient(patientId);
  const createdAt = mockDateTime(dayOffset, "11:00");
  return {
    id: id as ClinicalRecordId,
    patientId: patient.id,
    patientName: patient.fullName,
    createdAt,
    updatedAt: createdAt,
    ...record,
  };
}

export const mockClinicalRecords: ClinicalRecord[] = [
  clinicalRecord("record-1", "patient-mariana", -3, {
    kind: "session_note",
    title: "Sessão 31: reestruturação cognitiva",
    content:
      "Paciente relatou melhora na qualidade do sono após a introdução da rotina de higiene do sono. Trabalhamos pensamentos automáticos ligados ao desempenho no trabalho. Tarefa: registro de pensamentos disfuncionais até a próxima sessão.",
  }),
  clinicalRecord("record-2", "patient-rafael", -7, {
    kind: "session_note",
    title: "Sessão 15: ansiedade social",
    content:
      "Revisamos a hierarquia de exposição. Paciente conseguiu realizar duas exposições de nível 3 durante a semana. Relata ansiedade antecipatória menor.",
  }),
  clinicalRecord("record-3", "patient-joao", -12, {
    kind: "report",
    title: "Laudo psicológico para a escola",
    content:
      "Atesto, para os devidos fins, que o adolescente está em acompanhamento psicológico semanal desde o início do semestre, com boa adesão ao processo terapêutico.",
  }),
  clinicalRecord("record-4", "patient-carla", -20, {
    kind: "certificate",
    title: "Declaração de comparecimento",
    content:
      "Declaro que a paciente compareceu à sessão de psicoterapia no horário das 10h às 10h50.",
  }),
  clinicalRecord("record-5", "patient-beatriz", -25, {
    kind: "referral",
    title: "Encaminhamento para avaliação psiquiátrica",
    content:
      "Encaminho a paciente para avaliação psiquiátrica, considerando sintomas persistentes de humor deprimido. Fico à disposição para contato.",
  }),
];

export const mockDocumentTemplates: DocumentTemplate[] = [
  {
    id: "template-session" as DocumentTemplateId,
    kind: "session_note",
    title: "Evolução padrão",
    content:
      "Demanda trazida:\n\nIntervenções realizadas:\n\nObservações clínicas:\n\nPlano para a próxima sessão:",
  },
  {
    id: "template-certificate" as DocumentTemplateId,
    kind: "certificate",
    title: "Declaração de comparecimento",
    content:
      "Declaro, para os devidos fins, que [NOME DO PACIENTE] compareceu à sessão de psicoterapia no dia [DATA], das [HORA INÍCIO] às [HORA FIM].",
  },
  {
    id: "template-report" as DocumentTemplateId,
    kind: "report",
    title: "Laudo psicológico (Resolução CFP 06/2019)",
    content:
      "1. Identificação\n\n2. Descrição da demanda\n\n3. Procedimento\n\n4. Análise\n\n5. Conclusão",
  },
  {
    id: "template-referral" as DocumentTemplateId,
    kind: "referral",
    title: "Encaminhamento",
    content:
      "Encaminho [NOME DO PACIENTE] para avaliação com [ESPECIALIDADE], considerando [MOTIVO]. Coloco-me à disposição para troca de informações.",
  },
];
