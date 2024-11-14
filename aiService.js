import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function getAILayout(type, data) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Crie um layout profissional para um PDF do tipo ${type}. 
    Retorne APENAS um objeto JSON simples sem formatação markdown, sem crase (\`\`\`) e sem a palavra "json".
    
    Dados de exemplo: ${JSON.stringify(data)}
    
    O JSON deve conter:
    - columns: array com nomes das colunas
    - spacing: objeto com lineHeight e columnWidth
    - styling: objeto com configurações de estilo
    
    Exemplo do formato esperado:
    {
      "columns": ["Coluna1", "Coluna2"],
      "spacing": {
        "lineHeight": 25,
        "columnWidth": 200
      },
      "styling": {
        "header": {
          "fontSize": 24,
          "color": {"r": 0, "g": 0, "b": 0}
        }
      }
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let suggestions = response.text();
    
    // Remove markdown e caracteres especiais
    suggestions = suggestions.replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    console.log('Layout sugerido:', suggestions);
    
    return JSON.parse(suggestions);
  } catch (error) {
    console.error('Erro ao obter sugestões de layout:', error);
    return getDefaultLayout(type);
  }
}

function getDefaultLayout(type) {
  const layouts = {
    RELATORIO_CLIENTES: {
      columns: ['Nome', 'Telefone'],
      spacing: { lineHeight: 25, columnWidth: 200 },
      styling: {
        header: { fontSize: 24, color: { r: 0, g: 0, b: 0 } },
        columnHeaders: { fontSize: 12, color: { r: 0.3, g: 0.3, b: 0.3 } },
        content: { fontSize: 11, color: { r: 0, g: 0, b: 0 } },
        metadata: { fontSize: 10, color: { r: 0.5, g: 0.5, b: 0.5 } }
      }
    }
  };

  return layouts[type] || layouts.RELATORIO_CLIENTES;
}