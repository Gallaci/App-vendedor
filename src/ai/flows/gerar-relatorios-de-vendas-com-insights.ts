'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating sales reports with insights in Portuguese.
 *
 * The flow takes a report type (daily, weekly, monthly) as input and returns a sales report with AI-summarized trends and insights.
 * It exports:
 *   - gerarRelatorioDeVendasComInsights: The main function to trigger the flow.
 *   - GerarRelatorioDeVendasComInsightsInput: The input type for the flow.
 *   - GerarRelatorioDeVendasComInsightsOutput: The output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GerarRelatorioDeVendasComInsightsInputSchema = z.object({
  tipoRelatorio: z
    .enum(['diario', 'semanal', 'mensal'])
    .describe('O tipo de relatório de vendas a ser gerado (diário, semanal ou mensal).'),
});
export type GerarRelatorioDeVendasComInsightsInput = z.infer<typeof GerarRelatorioDeVendasComInsightsInputSchema>;

const GerarRelatorioDeVendasComInsightsOutputSchema = z.object({
  relatorio: z.string().describe('O relatório de vendas gerado.'),
  insights: z.string().describe('Um resumo das tendências e insights de vendas gerado por IA.'),
});
export type GerarRelatorioDeVendasComInsightsOutput = z.infer<typeof GerarRelatorioDeVendasComInsightsOutputSchema>;

export async function gerarRelatorioDeVendasComInsights(
  input: GerarRelatorioDeVendasComInsightsInput
): Promise<GerarRelatorioDeVendasComInsightsOutput> {
  return gerarRelatorioDeVendasComInsightsFlow(input);
}

const gerarRelatorioPrompt = ai.definePrompt({
  name: 'gerarRelatorioDeVendasComInsightsPrompt',
  input: {schema: GerarRelatorioDeVendasComInsightsInputSchema},
  output: {schema: GerarRelatorioDeVendasComInsightsOutputSchema},
  prompt: `Você é um especialista em análise de vendas e marketing.

  Gere um relatório de vendas {{tipoRelatorio}} detalhado e, em seguida, forneça um resumo conciso das principais tendências e insights de vendas.
  Use linguagem clara e objetiva, adequada para vendedores que precisam entender seu desempenho e tomar decisões informadas.

  Relatório de Vendas {{tipoRelatorio}}:
  [Aqui o sistema preencherá os dados do relatório de vendas]

  Resumo de Insights e Tendências:
  `,
});

const gerarRelatorioDeVendasComInsightsFlow = ai.defineFlow(
  {
    name: 'gerarRelatorioDeVendasComInsightsFlow',
    inputSchema: GerarRelatorioDeVendasComInsightsInputSchema,
    outputSchema: GerarRelatorioDeVendasComInsightsOutputSchema,
  },
  async input => {
    // Mock data for the sales report
    const relatorioDeVendasData = {
      diario: `Vendas diárias: R$1000, Produtos vendidos: 20, Novos clientes: 5`,
      semanal: `Vendas semanais: R$7000, Produtos vendidos: 140, Novos clientes: 35`,
      mensal: `Vendas mensais: R$30000, Produtos vendidos: 600, Novos clientes: 150`,
    };

    // Get the sales report data based on the report type
    const relatorio = relatorioDeVendasData[input.tipoRelatorio];

    const {output} = await gerarRelatorioPrompt({...input, relatorio});

    // Add the sales report data to the output
    return {
      relatorio: relatorio || 'Erro: Tipo de relatório inválido.',
      insights: output!.insights,
    };
  }
);
