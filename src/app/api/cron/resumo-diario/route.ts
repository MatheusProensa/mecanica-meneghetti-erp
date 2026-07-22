import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { calcularSituacaoDivida } from "@/lib/dividas";
import { enviarPushParaTodos } from "@/lib/push";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const [osAtrasadas, dividas] = await Promise.all([
    prisma.ordemServico.findMany({
      where: { pago: false, status: { not: "cancelada" }, previsaoEntrega: { lt: new Date() } },
      include: { itens: true },
    }),
    prisma.divida.findMany({ include: { itens: true, pagamentos: true } }),
  ]);

  const totalOSAtrasadas = osAtrasadas.reduce(
    (sum, os) => sum + os.itens.reduce((s, i) => s + i.valor, 0),
    0
  );

  const dividasEmAberto = dividas
    .map((d) => calcularSituacaoDivida(d.itens, d.pagamentos))
    .filter((d) => d.situacao !== "quitado");
  const totalDividas = dividasEmAberto.reduce((sum, d) => sum + d.saldo, 0);

  if (osAtrasadas.length === 0 && dividasEmAberto.length === 0) {
    return NextResponse.json({ enviado: false, motivo: "nada pendente" });
  }

  const partes: string[] = [];
  if (osAtrasadas.length > 0) {
    partes.push(
      `${osAtrasadas.length} OS atrasada${osAtrasadas.length === 1 ? "" : "s"} (${formatCurrency(totalOSAtrasadas)})`
    );
  }
  if (dividasEmAberto.length > 0) {
    partes.push(
      `${dividasEmAberto.length} dívida${dividasEmAberto.length === 1 ? "" : "s"} antiga${dividasEmAberto.length === 1 ? "" : "s"} em aberto (${formatCurrency(totalDividas)})`
    );
  }

  const resultado = await enviarPushParaTodos({
    title: "Cobranças pendentes",
    body: partes.join(" · "),
    url: osAtrasadas.length > 0 ? "/os?pagamento=atrasado" : "/devedores",
  });

  return NextResponse.json({ enviado: true, ...resultado });
}
