Simulador Inteligente IRPF 2026

img/logo.png

Simulador interativo para cálculo do Imposto de Renda Pessoa Física (IRPF) 2026, desenvolvido pela RCONT-SCT Soluções Contábeis e Tributárias.
A ferramenta compara os regimes Completo e Simplificado, aplica o redutor da lei e exibe o melhor resultado para o contribuinte.

---

✨ Funcionalidades

· ✅ Cálculo automático do INSS progressivo (faixas 2026)
· ✅ Cálculo do IRPF com as tabelas progressivas
· ✅ Aplicação do redutor para salários entre R$ 5.000,00 e R$ 7.350,00
· ✅ Comparação entre Regime Completo (com deduções) e Regime Simplificado (desconto padrão)
· ✅ Gráfico comparativo interativo (Chart.js)
· ✅ Exportação para PDF (jsPDF)
· ✅ Exportação para Excel (.xls)
· ✅ Envio do resultado por WhatsApp – o usuário informa seu número e recebe o resumo
· ✅ Painel administrativo para ajustar parâmetros (Redutor Base, Fator, Desconto Simplificado)
· ✅ PWA – pode ser instalado como aplicativo e funciona offline (service worker incluso)

---

🚀 Como usar

1. Clone ou faça o download deste repositório.
2. Abra o arquivo index.html em qualquer navegador moderno.
3. Preencha os campos:
   · Salário Bruto (ex: 5.373,72)
   · Dependentes
   · Pensão Alimentícia (se houver)
   · Previdência Privada (se houver)
4. Clique em Simular.
5. Visualize o resultado, o gráfico e utilize os botões de exportação ou envio por WhatsApp.

💡 Para usar o envio por WhatsApp, digite seu número com DDI (ex: 5511999998888) e clique no botão correspondente.

---

🛠️ Tecnologias utilizadas

· HTML5 + CSS3
· JavaScript (ES6)
· Chart.js – gráficos
· jsPDF – geração de PDF
· LocalStorage – persistência das configurações administrativas
· Service Worker – para funcionamento offline (PWA)

---

⚙️ Painel Administrativo

O simulador permite ajustar três parâmetros importantes para o cálculo de 2026:

· Redutor Base – valor fixo da fórmula (padrão: 978.62)
· Redutor Fator – multiplicador (padrão: 0.133145)
· Desconto Simplificado – valor fixo do regime simplificado (padrão: 607.20)

Para acessar, clique no botão "Painel Administrativo" no final da página. As alterações são salvas automaticamente no navegador (localStorage) e persistidas entre sessões.

---

📁 Estrutura de arquivos

```
/
├── index.html              # Página principal
├── manifest.json           # Configuração PWA
├── service-worker.js       # Service Worker para offline
├── css/
│   └── style0.css          # Estilos personalizados
├── js/
│   └── script0.js          # Lógica completa da aplicação
├── img/
│   ├── logo.png            # Logotipo
│   └── whatsapp-icon.png   # Ícone do WhatsApp
└── README.md               # Este arquivo
```

---

📲 Instalação como aplicativo (PWA)

No celular ou desktop, após abrir o simulador, utilize a opção "Adicionar à tela inicial" do navegador. O aplicativo funcionará mesmo sem internet.

---

📞 Contato

RCONT-SCT | Soluções Contábeis e Tributárias
Rosemberg Oliveira – Contador
📧 contato@rcont-sct.com.br
📱 (11) 95893-0291

---

📄 Licença

Este projeto é de uso interno e demonstração. Todos os direitos reservados à RCONT-SCT.
