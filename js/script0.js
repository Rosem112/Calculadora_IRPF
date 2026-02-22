// ==========================
// CONFIGURAÇÕES 2026
// ==========================
const CONFIG = {
    VALOR_DEPENDENTE: 189.59,
    DESCONTO_SIMPLIFICADO: 607.00,
    REDUTOR_BASE: 978.62,
    REDUTOR_FATOR: 0.133145
};

// ==========================
// CARREGAR CONFIG SALVA
// ==========================
(function carregarConfig() {
    let cfgSalva = localStorage.getItem("config2026");
    if (cfgSalva) {
        Object.assign(CONFIG, JSON.parse(cfgSalva));
    }
})();

// ==========================
// UTILITÁRIOS
// ==========================
function parseMoeda(valor) {
    if (!valor) return 0;
    return parseFloat(
        valor.replace(/\./g, '').replace(',', '.')
    ) || 0;
}

function formatar(v) {
    return v.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// ==========================
// INSS PROGRESSIVO OFICIAL 2026
// ==========================
function calcularINSS(salario) {

    const faixas = [
        { limite: 1412.00, aliquota: 0.075 },
        { limite: 2666.68, aliquota: 0.09 },
        { limite: 4000.03, aliquota: 0.12 },
        { limite: 7786.02, aliquota: 0.14 }
    ];

    let total = 0;
    let anterior = 0;

    for (let f of faixas) {
        if (salario > anterior) {
            let base = Math.min(salario, f.limite) - anterior;
            total += base * f.aliquota;
            anterior = f.limite;
        }
    }

    return total;
}

// ==========================
// IR PROGRESSIVO
// ==========================
function calcularIR(base) {

    if (base <= 2428.80) return { ir: 0, faixa: "Isento" };
    if (base <= 2826.65) return { ir: (base * 0.075) - 182.16, faixa: "7,5%" };
    if (base <= 3751.05) return { ir: (base * 0.15) - 394.16, faixa: "15%" };
    if (base <= 4664.68) return { ir: (base * 0.225) - 675.49, faixa: "22,5%" };

    return { ir: (base * 0.275) - 908.73, faixa: "27,5%" };
}

// ==========================
// REDUTOR 2026
// Fórmula:
// 978.62 - (0.133145 × base)
// ==========================
function calcularRedutor(base) {
    let valor = CONFIG.REDUTOR_BASE -
        (CONFIG.REDUTOR_FATOR * base);

    return Math.max(valor, 0);
}

// ==========================
// CÁLCULO PRINCIPAL
// ==========================
function calcular() {

    if (document.getElementById("emailLead")) {
    let email = document.getElementById("emailLead").value;
    localStorage.setItem("leadEmail", email);
    }

    let salario = parseMoeda(document.getElementById("salario").value);
    let dep = parseInt(document.getElementById("dependentes").value) || 0;
    let pensao = parseMoeda(document.getElementById("pensao").value);
    let prev = parseMoeda(document.getElementById("previdencia").value);

    let inss = calcularINSS(salario);

    // ==========================
    // REGIME COMPLETO
    // ==========================
    let dedDependentes = dep * CONFIG.VALOR_DEPENDENTE;

    let baseCompleta = Math.max(
        salario - inss - dedDependentes - pensao - prev,
        0
    );

    let irProgCompleto = calcularIR(baseCompleta);
    let redutorCompleto = calcularRedutor(baseCompleta);

    let irCompleto = Math.max(
        irProgCompleto.ir - redutorCompleto,
        0
    );

    // ==========================
    // REGIME SIMPLIFICADO
    // ==========================
    let baseSimplificado = Math.max(
        salario - inss - CONFIG.DESCONTO_SIMPLIFICADO,
        0
    );

    let irProgSimplificado = calcularIR(baseSimplificado);
    let redutorSimplificado = calcularRedutor(baseSimplificado);

    let irSimplificado = Math.max(
        irProgSimplificado.ir - redutorSimplificado,
        0
    );

    // ==========================
    // MELHOR REGIME
    // ==========================
    let melhorIR = Math.min(irCompleto, irSimplificado);
    let regime = melhorIR === irCompleto ?
        "Completo" :
        "Simplificado";

    // ==========================
    // EXIBIR RESULTADO
    // ==========================
    document.getElementById("resultado").innerHTML = `
        <h3>Melhor Regime: ${regime}</h3>

        <strong>INSS:</strong> ${formatar(inss)}<br><br>

        <strong>REGIME COMPLETO</strong><br>
        Base: ${formatar(baseCompleta)}<br>
        Faixa: ${irProgCompleto.faixa}<br>
        IR Progressivo: ${formatar(irProgCompleto.ir)}<br>
        Redutor: ${formatar(redutorCompleto)}<br>
        IR Final: ${formatar(irCompleto)}<br><br>

        <strong>REGIME SIMPLIFICADO</strong><br>
        Base: ${formatar(baseSimplificado)}<br>
        Faixa: ${irProgSimplificado.faixa}<br>
        IR Progressivo: ${formatar(irProgSimplificado.ir)}<br>
        Redutor: ${formatar(redutorSimplificado)}<br>
        IR Final: ${formatar(irSimplificado)}<br><br>

        <strong>IR DEVIDO: ${formatar(melhorIR)}</strong>
    `;

    gerarGrafico(irCompleto, irSimplificado);
}

// ==========================
// GRÁFICO
// ==========================
let grafico;

function gerarGrafico(irCompleto, irSimplificado) {
    
    const ctx = document.getElementById("grafico").getContext("2d");
    
    if (grafico) {
        grafico.destroy();
    }

    grafico = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Regime Completo", "Regime Simplificado"],
            datasets: [{
                label: "IR Devido (R$)",
                data: [irCompleto, irSimplificado],
                backgroundColor: [
                    "#3b82f6",  // Azul profissional
                    "#10b981"   // Verde premium
                ],
                borderRadius: 8,
                borderSkipped: false
            }]
        },
         
        options: {
            responsive: true,
            maintainAspectRatio: false,

            layout: {
                padding: {
                    top: 30,
                    bottom: 30
                }
            },

            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: "rgba(255,255,255,0.75)", // branco fosco
                        padding: 20,
                        boxWidth: 20,
                        font: {
                            size: 13
                        }
                    }
                }
            },

            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: "rgba(255,255,255,0.75)", // branco fosco
                        padding: 10
                    },
                    grid: {
                        color: "rgba(255,255,255,0.08)" // grade bem suave
                    }
                },
                x: {
                    ticks: {
                        color: "rgba(255,255,255,0.75)", // branco fosco
                        padding: 10
                    },
                    grid: {
                        color: "rgba(255,255,255,0.05)"
                    }
                }
            }
        }  //===== daqui para cima

    });
}

// ==========================
// PAINEL ADMIN
// ==========================
function toggleAdmin() {
    let p = document.getElementById("adminPanel");
    p.style.display =
        p.style.display === "none" ? "block" : "none";
}

function salvarConfig() {

    CONFIG.REDUTOR_BASE =
        parseFloat(document.getElementById("cfgRedBase").value) || CONFIG.REDUTOR_BASE;

    CONFIG.REDUTOR_FATOR =
        parseFloat(document.getElementById("cfgRedFator").value) || CONFIG.REDUTOR_FATOR;

    CONFIG.DESCONTO_SIMPLIFICADO =
        parseFloat(document.getElementById("cfgSimplificado").value) || CONFIG.DESCONTO_SIMPLIFICADO;

    localStorage.setItem("config2026", JSON.stringify(CONFIG));

    alert("Configurações atualizadas!");
}

// ==========================
// GERAR PDF
// ==========================
async function gerarPDF() {

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("RCONT-SCT | Soluções Contábeis e Tributárias", 20, 20);

    doc.setFontSize(14);
    doc.text("Simulação IRPF 2026", 20, 30);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    let linhas = document
        .getElementById("resultado")
        .innerText
        .split("\n");

    let y = 45;

    linhas.forEach(linha => {
        doc.text(linha, 20, y);
        y += 7;
    });

    doc.save("Simulacao_IRPF_RCONT_2026.pdf");
}

// ==========================
// EXPORTAR EXCEL
// ==========================
function exportarExcel() {

    let resultado = document.getElementById("resultado").innerText;

    let linhas = resultado.split("\n");

    let tabela = `
        <table border="1">
            <tr>
                <th>Descrição</th>
                <th>Valor</th>
            </tr>
    `;

    linhas.forEach(linha => {

        if (linha.includes(":")) {
            let partes = linha.split(":");

            tabela += `
                <tr>
                    <td>${partes[0]}</td>
                    <td>${partes[1]}</td>
                </tr>
            `;
        }
    });

    tabela += "</table>";

    let blob = new Blob(
        ["\ufeff", tabela],
        { type: "application/vnd.ms-excel" }
    );

    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Simulacao_IRPF_RCONT_2026.xls";
    link.click();
}

// ==========================
// EXPORTAR EXCEL
// ==========================
function enviarWhatsApp() {
    // 1️⃣ Calcula normalmente
    calcular();

    // 2️⃣ Pega resultado limpo
    let resultado = document.getElementById("resultado").textContent || "";
    resultado = resultado.replace(/[\uFEFF\uFFFD\u200B]/g, '').trim();

    // 3️⃣ Quebra em linhas e remove vazias
    let linhas = resultado.split("\n").map(l => l.trim()).filter(l => l !== "");

    // 4️⃣ Monta mensagem segura para WhatsApp
    let mensagemFormatada = "Simulação IRPF 2026 - RCONT-SCT\n\n";

    linhas.forEach((linha) => {
        mensagemFormatada += linha + "\n"; // cada linha + quebra
        // adiciona linha extra entre blocos
        if (
            linha.startsWith("INSS") ||
            linha.startsWith("IR Final") ||
            linha.startsWith("IR DEVIDO")
        ) {
            mensagemFormatada += "\n";
        }
    });

    mensagemFormatada += "Precisa de ajuda para declarar seu IR? Fale com a RCONT-SCT!";

    // 5️⃣ Substitui quebras de linha por %0A (garante quebras no WhatsApp)
    let mensagem = mensagemFormatada.split("\n").join("%0A");

    // 6️⃣ Número do WhatsApp
    let numero = "5511958930291";

    // 7️⃣ Abre WhatsApp
    let url = `https://wa.me/${numero}?text=${mensagem}`;
    window.open(url, "_blank");
}
