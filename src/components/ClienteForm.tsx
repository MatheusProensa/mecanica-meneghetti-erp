import type { Cliente } from "@/generated/prisma/client";
import PhoneInput from "@/components/PhoneInput";

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ""}
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
}

export default function ClienteForm({
  cliente,
  action,
}: {
  cliente?: Cliente;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nome *" name="nome" defaultValue={cliente?.nome} required />
        <Field label="CPF/CNPJ" name="cpfCnpj" defaultValue={cliente?.cpfCnpj} />
        <div>
          <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">
            Telefone
          </label>
          <PhoneInput id="telefone" name="telefone" defaultValue={cliente?.telefone} />
        </div>
        <div>
          <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">
            WhatsApp
          </label>
          <PhoneInput id="whatsapp" name="whatsapp" defaultValue={cliente?.whatsapp} />
        </div>
        <Field label="Cidade" name="cidade" defaultValue={cliente?.cidade} />
        <Field label="E-mail" name="email" type="email" defaultValue={cliente?.email} />
      </div>

      <Field label="Endereço" name="endereco" defaultValue={cliente?.endereco} />

      <div>
        <label
          htmlFor="observacoes"
          className="block text-sm font-medium text-gray-700"
        >
          Observações
        </label>
        <textarea
          id="observacoes"
          name="observacoes"
          rows={3}
          defaultValue={cliente?.observacoes ?? ""}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 sm:w-auto"
      >
        {cliente ? "Salvar alterações" : "Cadastrar cliente"}
      </button>
    </form>
  );
}
