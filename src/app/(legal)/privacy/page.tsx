import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import {
  LegalDocument,
  LegalList,
  LegalSection,
} from "../components/legal-document";

export const metadata: Metadata = {
  title: "Política de Privacidade",
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Política de Privacidade"
      summary="Como o Divã trata os seus dados e os dados dos seus pacientes, de acordo com a Lei Geral de Proteção de Dados (Lei 13.709/2018)."
    >
      <LegalSection title="1. Papéis de cada um">
        <LegalList
          items={[
            "Dados da sua conta (seus dados como profissional): o Divã é o controlador.",
            "Dados dos seus pacientes, incluindo prontuários: você é o controlador e o Divã é o operador. Tratamos esses dados apenas para fazer o sistema funcionar, conforme o que você registra.",
          ]}
        />
      </LegalSection>

      <LegalSection title="2. Quais dados tratamos">
        <p>Da sua conta:</p>
        <LegalList
          items={[
            "nome, e-mail e foto vindos da sua conta Google;",
            "dados que você informa nas configurações, como número do CRP, CPF, chave Pix, endereço do consultório, link da sala on-line, valores e horários de atendimento.",
          ]}
        />
        <p>Dos seus pacientes, registrados por você:</p>
        <LegalList
          items={[
            "identificação e contato: nome, CPF, data de nascimento, e-mail, telefone e contato de emergência;",
            "atendimento: sessões, modalidade, valores, forma de pagamento, pagamentos e observações;",
            "prontuário e documentos, que são dados pessoais sensíveis de saúde.",
          ]}
        />
        <p>
          Também guardamos suas despesas e anexos, suas anotações de estudo e o
          registro de quem acessou ou alterou cada prontuário.
        </p>
      </LegalSection>

      <LegalSection title="3. Para que usamos">
        <LegalList
          items={[
            "Fazer o Divã funcionar: agenda, cadastro, financeiro, cobranças, prontuário e documentos (execução do contrato com você).",
            "Proteger a sua conta e investigar acessos indevidos (legítimo interesse e segurança).",
            "Cumprir obrigações legais e atender pedidos de autoridades, quando a lei exigir.",
          ]}
        />
        <p>
          Os dados de saúde dos pacientes são tratados por você, profissional de
          saúde, para a tutela da saúde dos seus pacientes (art. 11, II, f, da
          LGPD). O Divã não usa esses dados para nenhuma outra finalidade.
        </p>
        <p>
          Não vendemos dados, não usamos dados para publicidade e não fazemos
          perfis de comportamento.
        </p>
      </LegalSection>

      <LegalSection title="4. Com quem compartilhamos">
        <p>
          Só com os fornecedores necessários para o Divã funcionar, que tratam
          os dados em nosso nome e com obrigações de segurança:
        </p>
        <LegalList
          items={[
            "Supabase: banco de dados, arquivos e autenticação, com servidores em São Paulo.",
            "Vercel: hospedagem do sistema, com processamento em São Paulo.",
            "Google: apenas para o login com a sua conta Google.",
          ]}
        />
        <p>
          Esses fornecedores são empresas estrangeiras. Quando algum dado for
          tratado fora do Brasil, isso ocorre com as garantias previstas no art.
          33 da LGPD.
        </p>
      </LegalSection>

      <LegalSection title="5. Como protegemos">
        <LegalList
          items={[
            "Toda a comunicação com o Divã é criptografada (HTTPS).",
            "O conteúdo dos prontuários e documentos é criptografado antes de ser gravado no banco.",
            "Cada profissional só consegue acessar os próprios dados, por regras aplicadas no próprio banco de dados.",
            "Anexos ficam em armazenamento privado, acessível apenas pelo dono da conta.",
            "Cada leitura e alteração de prontuário fica registrada.",
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Por quanto tempo guardamos">
        <p>
          Guardamos os dados enquanto a sua conta estiver ativa. Se você pedir o
          encerramento, excluímos os dados em até 30 dias, salvo quando a lei
          exigir que sejam mantidos por mais tempo.
        </p>
        <p>
          As normas da psicologia exigem que o prontuário seja guardado por um
          prazo mínimo. Essa guarda é responsabilidade do profissional, por isso
          salve os documentos que precisar antes de encerrar a conta.
        </p>
      </LegalSection>

      <LegalSection title="7. Seus direitos e os dos seus pacientes">
        <p>
          A LGPD garante, entre outros, os direitos de confirmar o tratamento,
          acessar, corrigir, excluir e saber com quem os dados foram
          compartilhados. Para os dados da sua conta, faça o pedido à equipe do
          Divã.
        </p>
        <p>
          Pacientes que quiserem exercer esses direitos devem procurar o próprio
          profissional, que é o controlador dos dados. Se for preciso, o Divã
          ajuda o profissional a atender o pedido.
        </p>
      </LegalSection>

      <LegalSection title="8. Cookies">
        <p>
          Usamos apenas os cookies necessários para manter você conectado. Não
          usamos cookies de publicidade nem de rastreamento.
        </p>
      </LegalSection>

      <LegalSection title="9. Pacientes menores de idade">
        <p>
          Quando o paciente for criança ou adolescente, cabe ao profissional
          obter o consentimento de um dos pais ou do responsável legal, como
          pede o art. 14 da LGPD.
        </p>
      </LegalSection>

      <LegalSection title="10. Mudanças nesta política">
        <p>
          Esta política pode ser atualizada. Avisaremos no próprio sistema e
          pediremos um novo aceite antes de você continuar usando o Divã. Veja
          também os{" "}
          <Link
            href={ROUTES.terms}
            className="font-medium text-primary hover:underline"
          >
            Termos de Uso
          </Link>
          .
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
