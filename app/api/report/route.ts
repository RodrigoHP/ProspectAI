import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  try {
    const { lead, searchParams } = await request.json();

    if (!lead || !searchParams) {
      return NextResponse.json(
        { error: "Parâmetros obrigatórios ausentes: lead, searchParams" },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const reportPrompt = `
      Você é um consultor de vendas B2B especialista em IA.
      O usuário está tentando vender o seguinte serviço: "${searchParams.service}".

      Aqui estão os dados do lead (empresa):
      Nome: ${lead.name}
      Endereço: ${lead.address}
      Avaliação: ${lead.rating} (${lead.userRatingCount} avaliações)
      Website: ${lead.websiteUri ? "Sim" : "Não"}
      Telefone: ${lead.nationalPhoneNumber ? "Sim" : "Não"}
      Tipo: ${lead.primaryType}

      Avaliações recentes:
      ${
        lead.reviews
          ?.map((r: { rating: number; text?: { text?: string } }) => `- ${r.rating} estrelas: "${r.text?.text}"`)
          .join("\n") || "Nenhuma avaliação detalhada disponível."
      }

      Gere um relatório de oportunidade de vendas completo em formato Markdown (pt-BR).
      O relatório DEVE conter as seguintes seções (use headers h2 ##):

      ## Diagnóstico Digital
      (Analise o que está faltando ou fraco na presença online deles com base nos dados acima)

      ## Análise de Avaliações
      (Resumo do sentimento das avaliações e reclamações comuns, se houver)

      ## Por que esta empresa precisa de IA
      (Conecte as dores específicas deles com o serviço de IA oferecido pelo usuário)

      ## Abordagem de Vendas Sugerida
      (Como o usuário deve abordar este lead, o que dizer na primeira mensagem/ligação)

      ## Impacto Estimado
      (O que a IA poderia melhorar para eles em termos de negócios/faturamento/tempo)
    `;

    const reportResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: reportPrompt,
    });

    const report = reportResponse.text || "Relatório não gerado.";

    return NextResponse.json({ report });
  } catch (error) {
    console.error("[/api/report] Error:", error);
    return NextResponse.json(
      { error: "Erro interno ao gerar relatório. Tente novamente." },
      { status: 500 }
    );
  }
}
