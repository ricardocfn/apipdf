import express from 'express';
import cors from 'cors';
import { generatePDF } from './pdfGenerator.js';
import { getAILayout } from './aiService.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware para logar todas as requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  if (req.body) console.log('Body:', req.body);
  next();
});

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Importante: posicionar o express.json() após o CORS
app.use(express.json());

// Rota OPTIONS para pre-flight requests
app.options('*', cors());

app.get('/', (req, res) => {
  console.log('Rota / acessada');
  res.json({ 
    message: 'API está funcionando!',
    templates: [
      'RELATORIO_CLIENTES',
      'RELATORIO_VENDAS',
      'FICHA_CLIENTE',
      'ORCAMENTO'
    ]
  });
});

app.post('/generate-pdf', async (req, res) => {
  console.log('Rota /generate-pdf acessada');
  try {
    const { type, headerText, data } = req.body;

    if (!type || !headerText || !data) {
      console.log('Dados inválidos recebidos:', { type, headerText, data });
      return res.status(400).json({
        error: 'Dados inválidos',
        message: 'Type, headerText e data são obrigatórios',
        example: {
          type: 'RELATORIO_CLIENTES',
          headerText: 'Lista de Clientes',
          data: {
            items: [
              { nome: 'João Silva', telefone: '(11) 99999-9999' },
              { nome: 'Maria Santos', telefone: '(11) 88888-8888' }
            ],
            metadata: {
              totalRegistros: 2,
              dataGeracao: '2024-01-20'
            }
          }
        }
      });
    }

    console.log('Gerando layout para:', type);
    const layoutSuggestion = await getAILayout(type, data);
    console.log('Gerando PDF com layout:', layoutSuggestion);
    const pdfBytes = await generatePDF(headerText, layoutSuggestion, data);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=documento.pdf');
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('Erro na geração do PDF:', error);
    res.status(500).json({
      error: 'Erro interno',
      message: error.message,
      stack: error.stack
    });
  }
});

// Middleware para capturar rotas não encontradas
app.use((req, res) => {
  console.log('Rota não encontrada:', req.method, req.url);
  res.status(404).json({
    error: 'Rota não encontrada',
    method: req.method,
    url: req.url
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});