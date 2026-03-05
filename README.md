Simulador Inteligente IRPF 2026

<p align="center">
  <strong>RCONT-SCT | Soluções Contábeis e Tributárias</strong><br>
  Simule seu Imposto de Renda 2026 de forma rápida e compare os regimes Completo e Simplificado.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/versão-1.0.0-blue">
  <img src="https://img.shields.io/badge/licença-MIT-green">
  <img src="https://img.shields.io/badge/PWA-ready-brightgreen">
</p>

---

📋 Sobre o Projeto

Este simulador interativo calcula o Imposto de Renda Pessoa Física (IRPF) para o ano‑base 2026, aplicando as regras oficiais da Receita Federal.
Ele compara automaticamente os regimes Completo (com deduções legais) e Simplificado (desconto padrão), aplica o redutor previsto para a faixa de isenção ampliada e exibe o melhor resultado para o contribuinte.

---

✨ Funcionalidades

· ✅ Cálculo automático do INSS – progressivo por faixas (2026)
· ✅ Cálculo do IRPF – tabela progressiva com alíquotas de 7,5% a 27,5%
· ✅ Redutor da lei – aplicado para salários entre R$ 5.000,00 e R$ 7.350,00
· ✅ Comparação de regimes – Completo (dependentes, pensão, previdência) vs. Simplificado (desconto padrão)
· ✅ Gráfico interativo – visualização em barras com Chart.js
· ✅ Exportação para PDF – relatório profissional gerado com jsPDF
· ✅ Exportação para Excel – arquivo .xls com os dados da simulação
· ✅ Envio por WhatsApp – usuário informa o número e recebe o resumo formatado
· ✅ Painel administrativo – ajuste de parâmetros (redutor, desconto simplificado) com persistência via localStorage
· ✅ PWA – instalável como aplicativo, com suporte a offline

---

🚀 Como Usar

1. Acesse a página – abra o index.html em qualquer navegador moderno.
2. Preencha os campos:
   · Salário Bruto (ex: 5.373,72)
   · Dependentes (número inteiro)
   · Pensão Alimentícia (valor, se houver)
   · Previdência Privada (valor, se houver)
3. Clique em Simular.
4. Visualize o resultado, o gráfico e utilize os botões de exportação ou envio por WhatsApp.

💡 Para o envio por WhatsApp, digite seu número com DDI (ex: 5511999998888) e clique em "Enviar relatório - WhatsApp".

---

🛠️ Tecnologias Utilizadas

· HTML5 + CSS3 – estrutura e estilização
· JavaScript (ES6+) – lógica da aplicação
· Chart.js – gráficos interativos
· jsPDF – geração de PDF
· LocalStorage – armazenamento das configurações administrativas
· Service Worker – funcionamento offline (PWA)

---

⚙️ Painel Administrativo

O simulador permite ajustar três parâmetros fundamentais para o cálculo de 2026:

Parâmetro Descrição Padrão
Redutor Base Valor fixo da fórmula do redutor 978.62
Redutor Fator Multiplicador da fórmula 0.133145
Desconto Simplificado Valor fixo do regime simplificado 607.20

Para acessar, clique no botão "Painel Administrativo" no final da página. As alterações são salvas automaticamente no navegador e mantidas entre sessões.

---

📁 Estrutura de Arquivos

```
/
├── index.html                  # Página principal
├── manifest.json               # Configuração do PWA
├── service-worker.js           # Service Worker para offline
├── css/
│   └── style0.css              # Folha de estilos
├── js/
│   └── script0.js              # Código JavaScript completo
├── img/
│   ├── logo.png                 # Logotipo da RCONT-SCT
│   └── whatsapp-icon.png        # Ícone do WhatsApp
└── README.md                    # Documentação
```

---

📲 Instalação como Aplicativo (PWA)

1. Abra o simulador no navegador do seu celular ou computador.
2. No menu do navegador, escolha "Adicionar à tela inicial" (ou equivalente).
3. O aplicativo será instalado e poderá ser usado mesmo sem conexão com a internet.

---

📞 Contato

RCONT-SCT | Soluções Contábeis e Tributárias
Rosemberg Oliveira – Contador
📧 contato@rcont-sct.com.br
📱 WhatsApp (11) 95893-0291

---

📄 Licença

Este projeto é de uso interno e demonstração. Todos os direitos reservados à RCONT-SCT.

---· Service Worker – para funcionamento offline (PWA)

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
