import type {
  DocumentTemplate,
  DocumentTemplateId,
} from "@/features/clinical-records/types";

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
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
