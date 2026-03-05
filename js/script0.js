// ==========================
// CONFIGURAÇÕES 2026
// ==========================
const CONFIG = {
    VALOR_DEPENDENTE: 189.59,
    DESCONTO_SIMPLIFICADO: 607.20,
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
// INSS PROGRESSIVO
// ==========================
function calcularINSS(salario) {

    const faixas = [
        { limite: 1621.00, aliquota: 0.075 },
        { limite: 2902.84, aliquota: 0.09 },
        { limite: 4354.27, aliquota: 0.12 },
        { limite: 8475.55, aliquota: 0.14 }
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
// 978.62 - (0.133145 × bruto)
// ==========================
function calcularRedutor(salarioBruto) {
    
    if (!salarioBruto || salarioBruto <= 5000) return 0;
    if (salarioBruto > 7350) return 0;
    
    let redutor =
        CONFIG.REDUTOR_BASE -
        (CONFIG.REDUTOR_FATOR * salarioBruto);
    
    return Math.max(0, redutor);
}

// ==========================
// CÁLCULO PRINCIPAL
// ==========================
function calcular() {
    
    try {
        
        if (document.getElementById("emailLead")) {
            let email = document.getElementById("emailLead").value;
            localStorage.setItem("leadEmail", email);
        }
        
        // ==========================
        // ENTRADAS
        // ==========================
        let salario = parseMoeda(document.getElementById("salario").value);
        let dep = parseInt(document.getElementById("dependentes").value) || 0;
        let pensao = parseMoeda(document.getElementById("pensao").value);
        let prev = parseMoeda(document.getElementById("previdencia").value);
        
        salario = Math.max(0, salario);
        
        // ==========================
        // INSS
        // ==========================
        let inss = calcularINSS(salario);
        
        // ==========================
        // REGIME COMPLETO
        // ==========================
        let dedDependentes = dep * CONFIG.VALOR_DEPENDENTE;
        
        let baseCompleta = salario -
            inss -
            dedDependentes -
            pensao -
            prev;
        
        baseCompleta = Math.max(0, baseCompleta);
        
        let irProgCompleto = calcularIR(baseCompleta);
        let impostoCompleto = Math.max(0, irProgCompleto.ir);
        
        let redutorRealCompleto = calcularRedutor(salario);

        let redutorAplicadoCompleto = Math.min(
      redutorRealCompleto,
       impostoCompleto
         );
        
        let irCompleto = Math.max(
        impostoCompleto - redutorAplicadoCompleto,
         0
         );
        
        // ==========================
        // REGIME SIMPLIFICADO
        // ==========================
        let baseSimplificado = salario -
            inss -
            CONFIG.DESCONTO_SIMPLIFICADO;
        
        baseSimplificado = Math.max(0, baseSimplificado);
        
        let irProgSimplificado = calcularIR(baseSimplificado);
        let impostoSimplificado = Math.max(0, irProgSimplificado.ir);
        
        let redutorRealSimplificado = calcularRedutor(salario);

        let redutorAplicadoSimplificado = Math.min(
        redutorRealSimplificado,
       impostoSimplificado
        );
        
        let irSimplificado = Math.max(
        impostoSimplificado - redutorAplicadoSimplificado,
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
            IR Progressivo: ${formatar(impostoCompleto)}<br>
            Redutor: ${formatar(redutorRealCompleto)}<br>
            IR Final: ${formatar(irCompleto)}<br><br>

            <strong>REGIME SIMPLIFICADO</strong><br>
            Base: ${formatar(baseSimplificado)}<br>
            Faixa: ${irProgSimplificado.faixa}<br>
            IR Progressivo: ${formatar(impostoSimplificado)}<br>
            Redutor: ${formatar(redutorRealSimplificado)}<br>
            IR Final: ${formatar(irSimplificado)}<br><br>

            <strong>IR DEVIDO: ${formatar(melhorIR)}</strong>
        `;
        
        gerarGrafico(irCompleto, irSimplificado);
        
    } catch (erro) {
        
        console.error("Erro no cálculo:", erro);
        alert("Ocorreu um erro no cálculo. Verifique os valores informados.");
        
    }
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
        "#3498db",
        "#2ecc71"]       
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // ESSENCIAL
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
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

    let salario = document.getElementById("salario").value;
    let dependentes = document.getElementById("dependentes").value;
    let pensao = document.getElementById("pensao").value;
    let previdencia = document.getElementById("previdencia").value;

    let resultado = document.getElementById("resultado").innerText;

    let y = 20;

    // TÍTULO
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("RCONT-SCT | Soluções Contábeis e Tributárias", 20, y);

    y += 10;

    doc.setFontSize(12);
    doc.text("Relatório de Simulação IRPF 2026", 20, y);

    y += 8;

    doc.setDrawColor(150);
    doc.line(20, y, 190, y);

    y += 10;

    // DADOS INFORMADOS
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("DADOS INFORMADOS", 20, y);

    y += 8;

    doc.setFont("helvetica", "normal");

    doc.text(`Salário bruto: ${salario}`, 20, y); y += 6;
    doc.text(`Dependentes: ${dependentes}`, 20, y); y += 6;
    doc.text(`Pensão alimentícia: ${pensao}`, 20, y); y += 6;
    doc.text(`Previdência privada: ${previdencia}`, 20, y); y += 10;

    doc.line(20, y, 190, y);
    y += 10;

    // RESULTADO
    doc.setFont("helvetica", "bold");
    doc.text("RESULTADO DA SIMULAÇÃO", 20, y);

    y += 8;

    doc.setFont("helvetica", "normal");

    let linhas = resultado.split("\n");

    linhas.forEach(linha => {

        if (linha.trim() !== "") {

            if (y > 270) {
                doc.addPage();
                y = 20;
            }

            doc.text(linha, 20, y);
            y += 6;
        }

    });

    y += 10;

    doc.line(20, y, 190, y);

    y += 8;

    doc.setFontSize(9);
    doc.text(
        "Relatório gerado automaticamente | RCONT-SCT Consultoria Tributária - Fone: (11) 95893-0291",
        20,
        y
    );

    doc.save("Relatorio_Simulacao_IRPF_RCONT.pdf");
}

// ==========================
// EXPORTAR EXCEL
// ==========================
function exportarExcel() {

    let conteudo = document.getElementById("resultado").innerText;

    let blob = new Blob(
        [conteudo],
        { type: "application/vnd.ms-excel" }
    );

    let link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = "Simulacao_IRPF_RCONT.xls";
    link.click();
}

// ==========================
// ENVIAR RESULTADO POR WHATSAPP
// ==========================
function enviarWhatsAppUsuario() {
    try {
        calcular();
        
        const inputNumero = document.getElementById("whatsappUsuario");
        if (!inputNumero) {
            alert("Campo de número não encontrado!");
            return;
        }
        
        let numero = inputNumero.value.trim().replace(/\D/g, "");
        if (!numero) {
            alert("Por favor, digite o número com DDI. Ex: 5511999998888");
            inputNumero.focus();
            return;
        }
        if (numero.length < 10 || numero.length > 13) {
            alert("Número inválido! Use o formato com DDI. Ex: 5511999998888");
            inputNumero.focus();
            return;
        }
        
        const resultadoElement = document.getElementById("resultado");
        if (!resultadoElement) {
            alert("Resultado não encontrado! Execute uma simulação primeiro.");
            return;
        }
        
        const resultadoHTML = resultadoElement.innerHTML || "";
        
        // ==========================
        // CONVERTER HTML PARA TEXTO
        // ==========================
        let texto = resultadoHTML
            .replace(/<br\s*\/?>/gi, "\n") // <br> vira quebra de linha
            .replace(/<[^>]*>/g, "") // remove outras tags
            .replace(/&nbsp;/g, " "); // decodifica &nbsp; para espaço
        
        // ==========================
        // QUEBRAR EM LINHAS E LIMPAR ESPAÇOS
        // ==========================
        const linhas = texto
            .split("\n")
            .map(l => l.replace(/\s+/g, " ").trim())
            .filter(l => l !== "");
        
        // ==========================
        // MONTAR MENSAGEM
        // ==========================
        let mensagemFormatada = "*Simulação IRPF 2026 - RCONT-SCT*\n\n";
        
        linhas.forEach((linha) => {
            mensagemFormatada += linha + "\n";
            if (linha.startsWith("INSS") ||
                linha.startsWith("IR Final") ||
                linha.startsWith("IR DEVIDO")) {
                mensagemFormatada += "\n";
            }
        });
        
        mensagemFormatada += "\n_Precisa de ajuda para declarar seu IR? Fale com a RCONT-SCT!_\n";
        mensagemFormatada += "📞 (11) 95893-0291";
        
        const mensagem = encodeURIComponent(mensagemFormatada);
        const url = `https://wa.me/${numero}?text=${mensagem}`;
        window.open(url, "_blank");
        
    } catch (erro) {
        console.error("Erro ao enviar WhatsApp:", erro);
        alert("Ocorreu um erro ao enviar a mensagem. Tente novamente.");
    }

}
