/*
=========================================================
   RCONT-SCT
   SIMULADOR IRRF MENSAL 2026

   Base oficial:
   - Tabela progressiva mensal do IRRF 2026 (Anexo X,
     IN RFB nº 1.500/2014, vigente em 2026)
   - Tabela de Redução Mensal 2026
     (Lei nº 15.270, de 26/11/2025)
   - INSS progressivo 2026
     (Portaria Interministerial MPS/MF nº 13/2026)
   - Dedução por dependente: R$ 189,59/mês
   - Desconto simplificado mensal: R$ 607,20

   IMPORTANTE:
   Este código calcula o IRRF mensal. Não é um motor
   completo da Declaração de Ajuste Anual.
=========================================================
*/

/* =========================================================
   CONFIGURAÇÕES 2026 (valores oficiais)
========================================================= */
const CONFIG_PADRAO = {
    // Dedução mensal por dependente
    VALOR_DEPENDENTE: 189.59,
    // Desconto simplificado mensal
    DESCONTO_SIMPLIFICADO: 607.20,
    // Redução do IR — faixa de R$ 5.000,01 a R$ 7.350,00
    REDUTOR_BASE: 978.62,
    REDUTOR_FATOR: 0.133145,
    // Limite superior da redução variável
    LIMITE_REDUCAO: 7350.00,
    // Limite para redução integral
    LIMITE_REDUCAO_TOTAL: 5000.00,
    // Teto da redução para rendimentos até R$ 5.000
    REDUCAO_MAXIMA_5000: 312.89
};

/* =========================================================
   CONFIGURAÇÃO ATUAL
========================================================= */
const CONFIG = {
    ...CONFIG_PADRAO
};

/* =========================================================
   CARREGAR CONFIGURAÇÃO SALVA
========================================================= */
function carregarConfig() {
    try {
        const salva = localStorage.getItem("config2026");
        if (!salva) {
            return;
        }
        const dados = JSON.parse(salva);
        Object.keys(CONFIG_PADRAO).forEach(chave => {
            if (
                Object.prototype.hasOwnProperty.call(dados, chave) &&
                Number.isFinite(Number(dados[chave]))
            ) {
                CONFIG[chave] = Number(dados[chave]);
            }
        });
    } catch (erro) {
        console.warn("Não foi possível carregar a configuração:", erro);
    }
}

carregarConfig();

/* =========================================================
   UTILITÁRIOS
========================================================= */

/**
 * Converte texto monetário brasileiro para número.
 *
 * Exemplos:
 * "6.500,00" -> 6500
 * "6500,00"  -> 6500
 * "6500.00"  -> 6500
 */
function parseMoeda(valor) {
    if (valor === null || valor === undefined || valor === "") {
        return 0;
    }
    let texto = String(valor).trim().replace(/[^\d,.-]/g, "");
    if (!texto) {
        return 0;
    }
    /*
     * Se houver vírgula:
     * padrão brasileiro.
     */
    if (texto.includes(",")) {
        texto = texto.replace(/\./g, "").replace(",", ".");
    }
    /*
     * Caso tenha mais de um ponto,
     * preserva apenas o último como decimal.
     */
    const partes = texto.split(".");
    if (partes.length > 2) {
        const decimal = partes.pop();
        texto = partes.join("") + "." + decimal;
    }
    const numero = Number(texto);
    return Number.isFinite(numero) ? numero : 0;
}

/**
 * Arredondamento monetário (2 casas).
 */
function arredondar(valor) {
    /*
     * Tolerância de 1e-6 por centavo para
     * neutralizar artefatos de ponto flutuante
     * (ex.: 24,1949999... deve virar 24,20).
     */
    return Math.round(Number(valor) * 100 + 1e-6) / 100;
}

/**
 * Formatação brasileira (BRL).
 */
function formatar(valor) {
    return Number(valor || 0)
        .toLocaleString(
            "pt-BR",
            { style: "currency", currency: "BRL" }
        );
}

/**
 * Formatação de percentual.
 */
function formatarPercentual(valor) {
    return Number(valor || 0)
        .toLocaleString(
            "pt-BR",
            { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        ) + "%";
}

/**
 * Escapa conteúdo antes de inserir no HTML.
 */
function escapeHTML(valor) {
    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Garante número >= 0.
 */
function naoNegativo(valor) {
    return Math.max(0, Number(valor) || 0);
}

/* =========================================================
   INSS 2026
========================================================= */

/*
    Empregado, empregado doméstico
    e trabalhador avulso.

    Tabela 2026 (Portaria Interministerial
    MPS/MF nº 13/2026):

    Até 1.621,00               7,5%
    1.621,01 a 2.902,84        9%
    2.902,85 a 4.354,27       12%
    4.354,28 a 8.475,55       14%

    Teto: R$ 8.475,55.
*/
function calcularINSS(salario) {
    const teto = 8475.55;
    if (salario <= 0) {
        return 0;
    }
    const baseContribuicao = Math.min(salario, teto);
    const faixas = [
        { limite: 1621.00, aliquota: 0.075 },
        { limite: 2902.84, aliquota: 0.09 },
        { limite: 4354.27, aliquota: 0.12 },
        { limite: teto, aliquota: 0.14 }
    ];
    let total = 0;
    let anterior = 0;
    for (const faixa of faixas) {
        if (baseContribuicao <= anterior) {
            break;
        }
        const baseFaixa = Math.min(baseContribuicao, faixa.limite) - anterior;
        if (baseFaixa > 0) {
            total += baseFaixa * faixa.aliquota;
        }
        anterior = faixa.limite;
    }
    return arredondar(total);
}

/* =========================================================
   TABELA PROGRESSIVA IR 2026
========================================================= */
function calcularIRProgressivo(base) {
    if (base <= 0 || base <= 2428.80) {
        return { imposto: 0, aliquota: 0, faixa: "Isento" };
    }
    if (base <= 2826.65) {
        return {
            imposto: base * 0.075 - 182.16,
            aliquota: 7.5,
            faixa: "7,5%"
        };
    }
    if (base <= 3751.05) {
        return {
            imposto: base * 0.15 - 394.16,
            aliquota: 15,
            faixa: "15%"
        };
    }
    if (base <= 4664.68) {
        return {
            imposto: base * 0.225 - 675.49,
            aliquota: 22.5,
            faixa: "22,5%"
        };
    }
    return {
        imposto: base * 0.275 - 908.73,
        aliquota: 27.5,
        faixa: "27,5%"
    };
}

/* =========================================================
   REDUÇÃO DO IR 2026
========================================================= */

/*
    Tabela de Redução Mensal
    (Lei nº 15.270/2025):

    Até R$ 5.000,00:
        redução de até R$ 312,89,
        de modo que o imposto devido
        seja zero — limitada ao
        imposto calculado.

    De R$ 5.000,01 até R$ 7.350,00:
        978,62 - (0,133145 x rendimentos
        tributáveis sujeitos à incidência
        mensal)

    Acima de R$ 7.350,00:
        sem redução.

    ATENÇÃO:
    A fórmula usa o rendimento tributável
    sujeito à incidência mensal, NÃO a base
    de cálculo após as deduções.
*/
function calcularReducaoIR(rendimentoTributavel, impostoProgressivo) {
    const rendimento = naoNegativo(rendimentoTributavel);
    const imposto = naoNegativo(impostoProgressivo);
    if (rendimento <= 0 || imposto <= 0) {
        return 0;
    }
    let reducao = 0;
    /*
     * Até R$ 5.000:
     * redução suficiente para zerar
     * o imposto, limitada a
     * R$ 312,89 e ao próprio imposto.
     */
    if (rendimento <= CONFIG.LIMITE_REDUCAO_TOTAL) {
        reducao = CONFIG.REDUCAO_MAXIMA_5000;
    }
    /*
     * De R$ 5.000,01 a R$ 7.350:
     * fórmula oficial.
     */
    else if (rendimento <= CONFIG.LIMITE_REDUCAO) {
        reducao = CONFIG.REDUTOR_BASE - (CONFIG.REDUTOR_FATOR * rendimento);
    }
    /*
     * A redução nunca pode exceder
     * o próprio imposto calculado.
     */
    return Math.min(Math.max(0, reducao), imposto);
}

/* =========================================================
   MOTOR PRINCIPAL
========================================================= */

/*
    Arquitetura do cálculo:

    RENDIMENTO TRIBUTÁVEL
        |-> Deduções legais (INSS, dependentes,
        |    pensão, PGBL dedutível)
        |-> BASE LEGAL -> IR (tabela) -> REDUÇÃO -> IR FINAL

    RENDIMENTO TRIBUTÁVEL
        |-> - R$ 607,20 (desconto simplificado,
        |    que SUBSTITUI as deduções legais)
        |-> BASE SIMPLIFICADA -> IR (tabela)
        |    -> REDUÇÃO -> IR FINAL
*/
function calcularIRSituacao(entrada) {
    const rendimento = naoNegativo(entrada.salario);
    const dependentes = Math.max(0, Math.trunc(Number(entrada.dependentes) || 0));
    const pensao = naoNegativo(entrada.pensao);
    const pgbl = naoNegativo(entrada.pgbldedutivel);

    /* ---- INSS ---- */
    const inss = calcularINSS(rendimento);

    /* ---- Deduções legais ---- */
    const dedDependentes = arredondar(dependentes * CONFIG.VALOR_DEPENDENTE);
    const deducoesLegais = arredondar(inss + dedDependentes + pensao + pgbl);

    /* ---- Método completo (deduções legais) ---- */
    const baseCompleta = arredondar(naoNegativo(rendimento - deducoesLegais));
    const irTabelaCompleto = calcularIRProgressivo(baseCompleta);
    const impostoCompleto = arredondar(naoNegativo(irTabelaCompleto.imposto));
    const reducaoCompleta = arredondar(calcularReducaoIR(rendimento, impostoCompleto));
    const irCompleto = arredondar(impostoCompleto - reducaoCompleta);

    /* ---- Método simplificado ---- */
    const baseSimplificada = arredondar(naoNegativo(rendimento - CONFIG.DESCONTO_SIMPLIFICADO));
    const irTabelaSimplificado = calcularIRProgressivo(baseSimplificada);
    const impostoSimplificado = arredondar(naoNegativo(irTabelaSimplificado.imposto));
    const reducaoSimplificada = arredondar(calcularReducaoIR(rendimento, impostoSimplificado));
    const irSimplificado = arredondar(impostoSimplificado - reducaoSimplificada);

    /* ---- Método com menor imposto mensal ---- */
    let melhorMetodo;
    if (irSimplificado < irCompleto) {
        melhorMetodo = "simplificado";
    } else if (irCompleto < irSimplificado) {
        melhorMetodo = "completo";
    } else {
        melhorMetodo = "indiferente";
    }
    const irFinal = Math.min(irCompleto, irSimplificado);
    const aliquotaEfetiva = rendimento > 0 ? (irFinal / rendimento) * 100 : 0;

    return {
        rendimento,
        dependentes,
        pensao,
        pgbl,
        inss,
        dedDependentes,
        deducoesLegais,
        baseCompleta,
        irTabelaCompleto,
        impostoCompleto,
        reducaoCompleta,
        irCompleto,
        baseSimplificada,
        irTabelaSimplificado,
        impostoSimplificado,
        reducaoSimplificada,
        irSimplificado,
        melhorMetodo,
        irFinal,
        aliquotaEfetiva
    };
}

/* =========================================================
   UI — CAMADAS
========================================================= */
let ultimoResultado = null;
let instanciaGrafico = null;

function lerCampos() {
    return {
        salario: parseMoeda(document.getElementById("salario").value),
        dependentes: Number(document.getElementById("dependentes").value) || 0,
        pensao: parseMoeda(document.getElementById("pensao").value),
        pgbldedutivel: parseMoeda(document.getElementById("previdencia").value)
    };
}

function nomeMetodo(metodo) {
    if (metodo === "completo") {
        return "Deduções legais";
    }
    if (metodo === "simplificado") {
        return "Desconto simplificado";
    }
    return "Ambos (valores iguais)";
}

/* =========================================================
   UI — CALCULAR
========================================================= */
function calcular() {
    const campos = lerCampos();
    const res = calcularIRSituacao(campos);
    ultimoResultado = res;
    renderizarResultado(res);
    atualizarGrafico(res);
    document.getElementById("resultado").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function renderizarResultado(res) {
    const resultado = document.getElementById("resultado");
    const metodoMelhor = nomeMetodo(res.melhorMetodo);

    const html =
        '<div class="resultado-header">' +
            "<h2>IRRF mensal estimado</h2>" +
            "<p>Referência 2026 — Lei nº 15.270/2025</p>" +
            '<div class="valor-final">' +
                formatar(res.irFinal) +
            "</div>" +
        "</div>" +

        '<div class="result-grid">' +

            /* Card do melhor método */
            '<div class="result-card melhor">' +
                "<h3>Método com menor imposto mensal</h3>" +
                '<div class="row">' +
                    '<span class="label">Método aplicável</span>' +
                    '<span class="value">' + escapeHTML(metodoMelhor) + "</span>" +
                "</div>" +
                '<div class="row">' +
                    '<span class="label">IRRF final</span>' +
                    '<span class="value destacado">' + formatar(res.irFinal) + "</span>" +
                "</div>" +
                '<div class="row">' +
                    '<span class="label">Alíquota efetiva</span>' +
                    '<span class="value">' + formatarPercentual(res.aliquotaEfetiva) + "</span>" +
                "</div>" +
            "</div>" +

            /* Card deduções legais */
            '<div class="result-card">' +
                "<h3>Deduções legais (completo)</h3>" +
                '<div class="row">' +
                    '<span class="label">INSS</span>' +
                    '<span class="value">' + formatar(res.inss) + "</span>" +
                "</div>" +
                '<div class="row">' +
                    '<span class="label">Dependentes</span>' +
                    '<span class="value">' + formatar(res.dedDependentes) + "</span>" +
                "</div>" +
                '<div class="row">' +
                    '<span class="label">Pensão / PGBL</span>' +
                    '<span class="value">' + formatar(res.pensao + res.pgbl) + "</span>" +
                "</div>" +
                '<div class="row">' +
                    '<span class="label">Total deduzido</span>' +
                    '<span class="value">' + formatar(res.deducoesLegais) + "</span>" +
                "</div>" +
                '<div class="row">' +
                    '<span class="label">Base de cálculo</span>' +
                    '<span class="value">' + formatar(res.baseCompleta) + "</span>" +
                "</div>" +
                '<div class="row">' +
                    '<span class="label">IR pela tabela</span>' +
                    '<span class="value">' + formatar(res.impostoCompleto) + "</span>" +
                "</div>" +
                '<div class="row">' +
                    '<span class="label">Redução 2026</span>' +
                    '<span class="value">' + formatar(res.reducaoCompleta) + "</span>" +
                "</div>" +
                '<div class="row total">' +
                    '<span class="label">IRRF final</span>' +
                    '<span class="value">' + formatar(res.irCompleto) + "</span>" +
                "</div>" +
            "</div>" +

            /* Card desconto simplificado */
            '<div class="result-card">' +
                "<h3>Desconto simplificado</h3>" +
                '<div class="row">' +
                    '<span class="label">Desconto simplificado</span>' +
                    '<span class="value">' + formatar(CONFIG.DESCONTO_SIMPLIFICADO) + "</span>" +
                "</div>" +
                '<div class="row">' +
                    '<span class="label">Base de cálculo</span>' +
                    '<span class="value">' + formatar(res.baseSimplificada) + "</span>" +
                "</div>" +
                '<div class="row">' +
                    '<span class="label">IR pela tabela</span>' +
                    '<span class="value">' + formatar(res.impostoSimplificado) + "</span>" +
                "</div>" +
                '<div class="row">' +
                    '<span class="label">Redução 2026</span>' +
                    '<span class="value">' + formatar(res.reducaoSimplificada) + "</span>" +
                "</div>" +
                '<div class="row total">' +
                    '<span class="label">IRRF final</span>' +
                    '<span class="value">' + formatar(res.irSimplificado) + "</span>" +
                "</div>" +
            "</div>" +

            /* Card comparativo */
            '<div class="result-card">' +
                "<h3>Comparação da base de cálculo</h3>" +
                '<div class="row">' +
                    '<span class="label">Base — deduções legais</span>' +
                    '<span class="value">' + formatar(res.baseCompleta) + "</span>" +
                "</div>" +
                '<div class="row">' +
                    '<span class="label">Base — desconto simplificado</span>' +
                    '<span class="value">' + formatar(res.baseSimplificada) + "</span>" +
                "</div>" +
                '<div class="row">' +
                    '<span class="label">Diferença de base</span>' +
                    '<span class="value">' + formatar(Math.abs(res.baseCompleta - res.baseSimplificada)) + "</span>" +
                "</div>" +
                '<div class="row">' +
                    '<span class="label">IR — legal vs. simplificado</span>' +
                    '<span class="value">' +
                        formatar(res.irCompleto) + " / " + formatar(res.irSimplificado) +
                    "</span>" +
                "</div>" +
            "</div>" +

        "</div>" +

        '<div class="info-box">' +
            "<strong>Como ler:</strong> o desconto simplificado " +
            "(R$ 607,20) <em>substitui</em> as deduções legais " +
            "quando for mais vantajoso. A redução da " +
            "Lei nº 15.270/2025 é aplicada depois da tabela " +
            "progressiva e zera o imposto para rendimentos " +
            "tributáveis de até R$ 5.000, reduzindo-o " +
            "progressivamente até R$ 7.350." +
        "</div>";

    resultado.innerHTML = html;
}

/* =========================================================
   UI — GRÁFICO
========================================================= */
function atualizarGrafico(res) {
    const canvas = document.getElementById("grafico");
    if (!canvas || !window.Chart) {
        return;
    }
    if (instanciaGrafico) {
        instanciaGrafico.destroy();
        instanciaGrafico = null;
    }
    instanciaGrafico = new Chart(canvas, {
        type: "bar",
        data: {
            labels: ["Deduções legais", "Desconto simplificado"],
            datasets: [
                {
                    label: "Base de cálculo",
                    data: [res.baseCompleta, res.baseSimplificada],
                    backgroundColor: [
                        "rgba(30, 58, 138, 0.85)",
                        "rgba(37, 99, 235, 0.85)"
                    ],
                    borderRadius: 8
                },
                {
                    label: "IRRF final",
                    data: [res.irCompleto, res.irSimplificado],
                    backgroundColor: [
                        "rgba(22, 163, 74, 0.85)",
                        "rgba(22, 101, 52, 0.85)"
                    ],
                    borderRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (contexto) {
                            return contexto.dataset.label + ": " + formatar(contexto.raw);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (valor) {
                            return formatar(valor);
                        }
                    }
                }
            }
        }
    });
}

/* =========================================================
   UI — LIMPAR
========================================================= */
function limparFormulario() {
    [
        "salario",
        "dependentes",
        "pensao",
        "previdencia",
        "whatsappUsuario"
    ].forEach(function (id) {
        const campo = document.getElementById(id);
        if (campo) {
            campo.value = id === "dependentes" ? "0" : "";
        }
    });

    ultimoResultado = null;

    const resultado = document.getElementById("resultado");
    resultado.innerHTML =
        '<div class="empty-state">' +
            '<div class="empty-icon">$</div>' +
            "<h3>Aguardando cálculo</h3>" +
            "<p>Informe os dados acima e clique em " +
            "<strong>Calcular IRRF</strong>.</p>" +
        "</div>";

    if (instanciaGrafico) {
        instanciaGrafico.destroy();
        instanciaGrafico = null;
        const canvas = document.getElementById("grafico");
        if (canvas) {
            const parent = canvas.parentNode;
            parent.removeChild(canvas);
            parent.appendChild(document.createElement("canvas")).setAttribute("id", "grafico");
        }
    }
}

/* =========================================================
   UI — ADMIN
========================================================= */
function toggleAdmin() {
    const painel = document.getElementById("adminPanel");
    if (painel) {
        painel.classList.toggle("open");
    }
}

function preencherAdmin() {
    const mapa = {
        cfgRedBase: "REDUTOR_BASE",
        cfgRedFator: "REDUTOR_FATOR",
        cfgSimplificado: "DESCONTO_SIMPLIFICADO",
        cfgDependente: "VALOR_DEPENDENTE"
    };
    Object.keys(mapa).forEach(function (idCampo) {
        const campo = document.getElementById(idCampo);
        if (campo) {
            campo.value = CONFIG[mapa[idCampo]];
        }
    });
}

function salvarConfig() {
    const mapa = {
        cfgRedBase: "REDUTOR_BASE",
        cfgRedFator: "REDUTOR_FATOR",
        cfgSimplificado: "DESCONTO_SIMPLIFICADO",
        cfgDependente: "VALOR_DEPENDENTE",
        cfgLimiteReducao: "LIMITE_REDUCAO",
        cfgLimiteReducaoTotal: "LIMITE_REDUCAO_TOTAL",
        cfgReducaoMaxima: "REDUCAO_MAXIMA_5000"
    };
    Object.keys(mapa).forEach(function (idCampo) {
        const campo = document.getElementById(idCampo);
        if (campo) {
            const valor = Number(campo.value);
            if (Number.isFinite(valor)) {
                CONFIG[mapa[idCampo]] = valor;
            }
        }
    });
    try {
        localStorage.setItem("config2026", JSON.stringify(CONFIG));
        alert("Parâmetros salvos com sucesso.");
    } catch (erro) {
        alert("Não foi possível salvar os parâmetros.");
    }
}

function restaurarConfigPadrao() {
    Object.keys(CONFIG_PADRAO).forEach(function (chave) {
        CONFIG[chave] = CONFIG_PADRAO[chave];
    });
    try {
        localStorage.removeItem("config2026");
    } catch (erro) {
        /* não impede a restauração em memória */
    }
    preencherAdmin();
    alert("Parâmetros padrão restaurados.");
}

/* =========================================================
   UI — RELATÓRIO
========================================================= */
function linhasRelatorio() {
    if (!ultimoResultado) {
        return [];
    }
    const res = ultimoResultado;
    return [
        "SIMULADOR IRRF MENSAL 2026 — RCONT-SCT",
        "=======================================",
        "",
        "Rendimento tributável:   " + formatar(res.rendimento),
        "",
        "DEDUÇÕES LEGAIS",
        "  INSS:                  " + formatar(res.inss),
        "  Dependentes:           " + formatar(res.dedDependentes),
        "  Pensão alimentícia:    " + formatar(res.pensao),
        "  Previdência privada:   " + formatar(res.pgbl),
        "  Total deduzido:        " + formatar(res.deducoesLegais),
        "  Base de cálculo:       " + formatar(res.baseCompleta),
        "  IR pela tabela:        " + formatar(res.impostoCompleto),
        "  Redução 2026:          " + formatar(res.reducaoCompleta),
        "  IRRF final:            " + formatar(res.irCompleto),
        "",
        "DESCONTO SIMPLIFICADO (substitui as deduções legais)",
        "  Desconto aplicado:     " + formatar(CONFIG.DESCONTO_SIMPLIFICADO),
        "  Base de cálculo:       " + formatar(res.baseSimplificada),
        "  IR pela tabela:        " + formatar(res.impostoSimplificado),
        "  Redução 2026:          " + formatar(res.reducaoSimplificada),
        "  IRRF final:            " + formatar(res.irSimplificado),
        "",
        "MÉTODO COM MENOR IMPOSTO MENSAL",
        "  Método:                " + nomeMetodo(res.melhorMetodo),
        "  IRRF final:            " + formatar(res.irFinal),
        "  Alíquota efetiva:      " + formatarPercentual(res.aliquotaEfetiva),
        "",
        "Referência: Lei nº 15.270/2025. Este relatório não",
        "substitui a apuração oficial da folha nem a",
        "Declaração de Ajuste Anual."
    ];
}

function gerarPDF() {
    if (!ultimoResultado) {
        alert("Calcule o IRRF antes de gerar o PDF.");
        return;
    }
    /*
     * Se a biblioteca jsPDF ainda não estiver
     * disponível, imprime a página como
     * alternativa.
     */
    if (!window.jspdf) {
        window.print();
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const linhas = linhasRelatorio();
    let y = 20;
    linhas.forEach(function (linha) {
        if (y > 280) {
            doc.addPage();
            y = 20;
        }
        const paginas = doc.splitTextToSize(linha, 180);
        paginas.forEach(function (pagina) {
            doc.text(pagina, 15, y);
            y += 6;
        });
    });
    doc.save("simulador-irrf-2026.pdf");
}

/* =========================================================
   UI — EXCEL
========================================================= */
function exportarExcel() {
    if (!ultimoResultado) {
        alert("Calcule o IRRF antes de exportar.");
        return;
    }
    const res = ultimoResultado;
    const linhas = [
        ["Item", "Valor (R$)"],
        ["Rendimento tributável", res.rendimento],
        ["INSS", res.inss],
        ["Dependentes", res.dedDependentes],
        ["Pensão alimentícia", res.pensao],
        ["Previdência privada (PGBL)", res.pgbl],
        ["Total de deduções legais", res.deducoesLegais],
        ["Base de cálculo — deduções legais", res.baseCompleta],
        ["IR pela tabela — legal", res.impostoCompleto],
        ["Redução 2026 — legal", res.reducaoCompleta],
        ["IRRF final — legal", res.irCompleto],
        ["Desconto simplificado", CONFIG.DESCONTO_SIMPLIFICADO],
        ["Base de cálculo — simplificado", res.baseSimplificada],
        ["IR pela tabela — simplificado", res.impostoSimplificado],
        ["Redução 2026 — simplificado", res.reducaoSimplificada],
        ["IRRF final — simplificado", res.irSimplificado],
        ["IRRF final (menor imposto)", res.irFinal],
        ["Alíquota efetiva (%)", res.aliquotaEfetiva],
        ["Método", nomeMetodo(res.melhorMetodo)]
    ];

    const formatoNumero = function (valor) {
        return Number(valor || 0).toFixed(2).replace(".", ",");
    };

    const csv =
        "\uFEFF" +
        linhas
            .map(function (linha) {
                return linha
                    .map(function (celula) {
                        const texto = typeof celula === "number"
                            ? formatoNumero(celula)
                            : String(celula);
                        if (texto.includes(";") || texto.includes(",") || texto.includes('"')) {
                            return '"' + texto.replace(/"/g, '""') + '"';
                        }
                        return texto;
                    })
                    .join(";");
            })
            .join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "simulador-irrf-2026.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

/* =========================================================
   UI — WHATSAPP
========================================================= */
function enviarWhatsAppUsuario() {
    if (!ultimoResultado) {
        alert("Calcule o IRRF antes de enviar pelo WhatsApp.");
        return;
    }
    const campoNumero = document.getElementById("whatsappUsuario");
    const numero = campoNumero ? campoNumero.value.replace(/\D/g, "") : "";
    if (!numero || numero.length < 11) {
        alert("Informe o número completo com DDI (ex.: 5511999998888).");
        return;
    }
    const mensagem = linhasRelatorio().join("\n");
    window.open(
        "https://wa.me/" + numero + "?text=" + encodeURIComponent(mensagem),
        "_blank"
    );
}

/* =========================================================
   TEMA CLARO / ESCURO
========================================================= */
function aplicarTema(temaEscuro) {
    const corpo = document.body;
    corpo.classList.toggle("dark", temaEscuro);
    const botao = document.getElementById("btnTema");
    if (botao) {
        botao.textContent = temaEscuro ? "Modo claro" : "Modo escuro";
        botao.setAttribute("aria-pressed", String(temaEscuro));
    }
}

function carregarTema() {
    let temaEscuro = false;
    try {
        temaEscuro = localStorage.getItem("tema2026") === "dark";
    } catch (erro) {
        /* segue com o padrão claro */
    }
    aplicarTema(temaEscuro);
}

function toggleTema() {
    const temaEscuro = !document.body.classList.contains("dark");
    try {
        localStorage.setItem("tema2026", temaEscuro ? "dark" : "light");
    } catch (erro) {
        /* segue apenas em memória */
    }
    aplicarTema(temaEscuro);
}

/* =========================================================
   INICIALIZAÇÃO
========================================================= */
document.addEventListener("DOMContentLoaded", function () {
    preencherAdmin();
    carregarTema();
    document.getElementById("salario").addEventListener("keydown", function (evento) {
        if (evento.key === "Enter") {
            calcular();
        }
    });
});
