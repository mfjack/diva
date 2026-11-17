import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import {
  LegalDocument,
  LegalList,
  LegalSection,
} from "../components/legal-document";

export const metadata: Metadata = {
  title: "Termos de Uso",
};

export default function TermsPage() {
  return (
    <LegalDocument
      title="Termos de Uso"
      summary="As regras para usar o Divã, o sistema de gestão de consultório para profissionais de psicologia."
    >
      <LegalSection title="1. O que é o Divã">
        <p>
          O Divã é um sistema on-line para organizar o consultório: agenda,
          cadastro de pacientes, controle financeiro, prontuário, documentos e
          anotações de estudo. O Divã é uma ferramenta de apoio e não presta
          serviços de psicologia.
        </p>
      </LegalSection>

      <LegalSection title="2. Quem pode usar">
        <p>
          O Divã é feito para profissionais de psicologia com registro ativo no
          Conselho Regional de Psicologia (CRP), maiores de 18 anos. Ao criar a
          conta, você declara que as informações que fornece são verdadeiras.
        </p>
      </LegalSection>

      <LegalSection title="3. Sua conta">
        <LegalList
          items={[
            "O acesso é feito com a sua conta Google. Mantenha essa conta protegida, com senha forte e verificação em duas etapas.",
            "Cada conta é de uso pessoal e corresponde a um único profissional. Não compartilhe o acesso.",
            "Você é responsável pelo que for feito na sua conta. Se suspeitar de acesso indevido, avise a equipe do Divã.",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Suas responsabilidades como profissional">
        <LegalList
          items={[
            "O atendimento, as decisões clínicas e o conteúdo dos registros e documentos são de sua inteira responsabilidade.",
            "Você deve seguir o Código de Ética Profissional do Psicólogo e as resoluções do Conselho Federal de Psicologia, como as que tratam do registro documental e da elaboração de documentos escritos.",
            "Você deve ter base legal para registrar os dados dos seus pacientes e informá-los sobre esse tratamento, como pede a Lei Geral de Proteção de Dados (LGPD).",
            "Você é responsável por guardar o prontuário pelo prazo exigido pelas normas da profissão, inclusive se decidir deixar de usar o Divã.",
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Dados dos seus pacientes">
        <p>
          Em relação aos dados dos pacientes, você é o controlador e o Divã é o
          operador: tratamos esses dados apenas para fazer o sistema funcionar e
          de acordo com o que você registra. Os detalhes estão na{" "}
          <Link
            href={ROUTES.privacy}
            className="font-medium text-primary hover:underline"
          >
            Política de Privacidade
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="6. Uso permitido">
        <p>Não é permitido:</p>
        <LegalList
          items={[
            "usar o Divã para fins ilegais ou contrários à ética profissional;",
            "tentar acessar dados de outros profissionais ou burlar as proteções do sistema;",
            "copiar, revender ou explorar o sistema comercialmente sem autorização;",
            "enviar arquivos com vírus ou conteúdo que prejudique o funcionamento do serviço.",
          ]}
        />
        <p>
          O descumprimento destas regras pode levar à suspensão ou ao
          encerramento da conta.
        </p>
      </LegalSection>

      <LegalSection title="7. Disponibilidade do serviço">
        <p>
          Trabalhamos para manter o Divã disponível e seguro, mas não podemos
          garantir que ele funcione sem interrupções ou falhas. Podem ocorrer
          pausas para manutenção, atualizações e mudanças de funcionalidades.
        </p>
      </LegalSection>

      <LegalSection title="8. Preço">
        <p>
          O Divã é gratuito neste momento. Se passar a ser cobrado, você será
          avisado com antecedência e poderá decidir se continua usando.
        </p>
      </LegalSection>

      <LegalSection title="9. Encerramento da conta">
        <p>
          Você pode pedir o encerramento da conta a qualquer momento à equipe do
          Divã. Antes disso, guarde as informações que precisar manter,
          especialmente os prontuários. Depois do encerramento, os dados são
          excluídos conforme a Política de Privacidade.
        </p>
      </LegalSection>

      <LegalSection title="10. Limitação de responsabilidade">
        <p>
          O Divã não se responsabiliza por decisões clínicas, pelo conteúdo
          registrado pelos profissionais, nem por perdas causadas por uso
          indevido da conta ou por falhas de serviços de terceiros fora do nosso
          controle, nos limites permitidos pela lei.
        </p>
      </LegalSection>

      <LegalSection title="11. Mudanças nestes termos">
        <p>
          Estes termos podem ser atualizados. Quando isso acontecer, avisaremos
          no próprio sistema e pediremos um novo aceite antes de você continuar
          usando o Divã.
        </p>
      </LegalSection>

      <LegalSection title="12. Lei aplicável">
        <p>
          Estes termos seguem as leis brasileiras. Fica eleito o foro da comarca
          do domicílio do profissional para resolver qualquer questão
          relacionada a eles.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
