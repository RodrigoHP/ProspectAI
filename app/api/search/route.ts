import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { SearchParamsSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = SearchParamsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Parâmetros inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { icp, service, state, city } = parsed.data;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const locationStr = city ? `${city}, ${state}, Brasil` : `${state}, Brasil`;

    const prompt = `
      Você é um especialista em prospecção B2B.
      O usuário está procurando por leads com o seguinte Perfil de Cliente Ideal (ICP): "${icp}".
      A localização alvo é: "${locationStr}".
      O usuário oferece o seguinte serviço: "${service}".

      Use o Google Maps para encontrar cerca de 10 a 15 negócios reais que correspondam a este ICP nesta localização.

      Para cada negócio encontrado, forneça os seguintes dados em formato JSON estrito (uma array de objetos):
      [
        {
          "id": "um identificador único gerado por você",
          "name": "Nome do negócio",
          "address": "Endereço completo",
          "city": "Cidade",
          "state": "Estado",
          "rating": 4.5,
          "userRatingCount": 120,
          "primaryType": "Categoria principal",
          "nationalPhoneNumber": "Telefone se disponível, ou null",
          "websiteUri": "Website se disponível, ou null",
          "googleMapsUri": "Link do Google Maps se disponível, ou null",
          "digitalPainScore": 75,
          "aiSummary": "Resumo de oportunidade de no máximo 3 linhas em português (pt-BR), explicando por que este negócio é um bom lead para o serviço oferecido."
        }
      ]

      O campo digitalPainScore é um número inteiro de 0 a 100. Quanto maior, maior a oportunidade de venda. Considere: falta de website (+30), poucas avaliações (<20) (+20), nota baixa (<3.5) (+20), sem telefone (+15), poucas fotos (+15).

      Retorne APENAS o JSON válido, sem blocos de código markdown e sem texto adicional.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    });

    let searchResults: unknown[] = [];
    try {
      const text = response.text || "[]";
      searchResults = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Falha ao processar resposta da IA. Tente novamente." },
        { status: 502 }
      );
    }

    // Enrich with grounding chunks from Maps
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: { maps?: { uri?: string; title?: string } }) => {
        if (chunk.maps?.uri && chunk.maps?.title) {
          const matchedResult = (searchResults as Array<{ name: string; googleMapsUri?: string }>).find(
            (r) =>
              r.name.toLowerCase().includes(chunk.maps!.title!.toLowerCase()) ||
              chunk.maps!.title!.toLowerCase().includes(r.name.toLowerCase())
          );
          if (matchedResult && !matchedResult.googleMapsUri) {
            matchedResult.googleMapsUri = chunk.maps.uri;
          }
        }
      });
    }

    const sorted = (searchResults as Array<{ digitalPainScore?: number }>).sort(
      (a, b) => (b.digitalPainScore || 0) - (a.digitalPainScore || 0)
    );

    return NextResponse.json(sorted);
  } catch (error) {
    console.error("[/api/search] Error:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar leads. Tente novamente." },
      { status: 500 }
    );
  }
}
