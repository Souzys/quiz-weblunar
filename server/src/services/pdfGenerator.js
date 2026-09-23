import PDFDocument from 'pdfkit';

/**
 * Gera o buffer binário do Dossiê Completo em formato PDF de alta resolução (Exatamente 3 páginas, sem páginas em branco)
 */
export async function generateDossierPdf({ firstName, archetype, sessionId }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 40, bottom: 35, left: 45, right: 45 },
        autoFirstPage: true,
        info: {
          Title: `Dossiê de Percepção Social - ${firstName}`,
          Author: 'WebLunar Analytics',
          Subject: 'Relatório Confidencial de Decodificação de Personalidade',
          Keywords: 'psicologia, percepção social, arquétipos, dossiê'
        }
      });

      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer);
      });

      const primaryColor = '#8B5CF6'; // Violet
      const secondaryColor = '#38BDF8'; // Sky Blue
      const accentCta = '#22C55E'; // Emerald
      const darkBg = '#0D0E1F';
      const cardBg = '#141738';
      const textWhite = '#FFFFFF';
      const textMuted = '#94A3B8';
      const textLight = '#E2E8F0';

      const pageWidth = doc.page.width;
      const contentWidth = pageWidth - 90;

      // Função auxiliar para desenhar o fundo escuro da página atual
      const drawPageBackground = () => {
        doc.save();
        doc.rect(0, 0, doc.page.width, doc.page.height).fill(darkBg);
        doc.restore();
      };

      // Função auxiliar para desenhar o rodapé fixo de forma segura (sem overflow)
      const drawPageFooter = (pageNum) => {
        doc.save();
        const oldBottom = doc.page.margins.bottom;
        doc.page.margins.bottom = 0;
        doc.fillColor(textMuted).fontSize(8).font('Helvetica').text(
          `Página ${pageNum} de 3  •  WebLunar Analytics  •  Todos os direitos reservados`,
          45,
          doc.page.height - 24,
          { align: 'center', lineBreak: false }
        );
        doc.page.margins.bottom = oldBottom;
        doc.restore();
      };

      // =============================================================
      // PÁGINA 1: Capa e Visão Geral
      // =============================================================
      drawPageBackground();
      drawPageFooter(1);

      // Topo confidencial
      doc.fillColor(primaryColor)
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('DOCUMENTO CONFIDENCIAL • DECODIFICAÇÃO DE PERSONALIDADE', 45, 45, {
          align: 'center',
          characterSpacing: 1.5
        });

      doc.moveDown(0.6);

      // Título Principal
      doc.fillColor(textWhite)
        .fontSize(24)
        .font('Helvetica-Bold')
        .text('DOSSIÊ DE PERCEPÇÃO SOCIAL', { align: 'center' });

      doc.moveDown(0.2);

      doc.fillColor(secondaryColor)
        .fontSize(11)
        .font('Helvetica')
        .text(`Classificação Primária: ${archetype.title}`, { align: 'center' });

      doc.moveDown(1.2);

      // Box de Identificação e Protocolo
      const boxY = doc.y;
      const boxHeight = 65;
      doc.roundedRect(45, boxY, contentWidth, boxHeight, 8).fill(cardBg);
      doc.roundedRect(45, boxY, contentWidth, boxHeight, 8).lineWidth(1).stroke('#1E214A');

      // Linha 1 do Box
      doc.fillColor(textMuted).fontSize(8).font('Helvetica-Bold').text('TITULAR DA ANÁLISE:', 60, boxY + 14);
      doc.fillColor(textWhite).fontSize(12).font('Helvetica-Bold').text(firstName || 'Cliente', 60, boxY + 26);

      doc.fillColor(textMuted).fontSize(8).font('Helvetica-Bold').text('STATUS DO ACESSO:', 240, boxY + 14);
      doc.fillColor(accentCta).fontSize(10).font('Helvetica-Bold').text('AUTORIZADO & CONFIRMADO', 240, boxY + 28);

      const codeStr = sessionId ? `WL-${sessionId.substring(0, 8).toUpperCase()}` : 'WL-OFFICIAL';
      doc.fillColor(textMuted).fontSize(8).font('Helvetica-Bold').text('CÓDIGO DE PROTOCOLO:', 410, boxY + 14);
      doc.fillColor(secondaryColor).fontSize(10).font('Helvetica').text(codeStr, 410, boxY + 28);

      // Linha divisória inferior do box
      const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
      doc.fillColor(textMuted).fontSize(8).font('Helvetica').text(`Emissão oficial em: ${today}`, 60, boxY + 48);

      doc.y = boxY + boxHeight + 25;

      // Matriz de Indicadores (Scores)
      doc.fillColor(textWhite).fontSize(13).font('Helvetica-Bold').text('MÉTRICAS DA MATRIZ COMPORTAMENTAL', 45, doc.y);
      doc.moveDown(0.4);

      const scores = archetype.scores || { magnetism: 90, intimidation: 80, depth: 85, accessibility: 50 };
      const scoreLabels = [
        { label: 'Índice de Magnetismo Inconsciente', val: scores.magnetism, color: '#8B5CF6' },
        { label: 'Projeção de Tensão & Intimidação', val: scores.intimidation, color: '#D946EF' },
        { label: 'Profundidade Percebida em 30 Segundos', val: scores.depth, color: '#38BDF8' },
        { label: 'Acessibilidade Social & Calor Humano', val: scores.accessibility, color: '#22C55E' }
      ];

      scoreLabels.forEach((item) => {
        const itemY = doc.y;
        doc.fillColor(textLight).fontSize(9).font('Helvetica').text(item.label, 45, itemY);
        doc.fillColor(item.color).fontSize(9).font('Helvetica-Bold').text(`${item.val}%`, contentWidth + 15, itemY, { align: 'right' });
        doc.moveDown(0.3);

        // Barra de progresso
        const barY = doc.y;
        doc.roundedRect(45, barY, contentWidth, 7, 3).fill('#1A1D42');
        const fillWidth = Math.max(10, (contentWidth * item.val) / 100);
        doc.roundedRect(45, barY, fillWidth, 7, 3).fill(item.color);
        doc.y = barY + 14;
      });

      doc.moveDown(1);

      // Capítulo 1
      const fullDossier = archetype.full_dossier || {};
      const cap1 = fullDossier.chapter1_first_impression;

      if (cap1) {
        doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text(cap1.title.toUpperCase(), 45, doc.y);
        doc.moveDown(0.4);
        doc.fillColor(textLight).fontSize(9.5).font('Helvetica').lineGap(3).text(cap1.content, 45, doc.y, {
          width: contentWidth,
          align: 'justify'
        });
      }

      // =============================================================
      // PÁGINA 2: Capítulo 2 & Capítulo 3
      // =============================================================
      doc.addPage();
      drawPageBackground();
      drawPageFooter(2);

      // Mini Header
      doc.fillColor(primaryColor).fontSize(8).font('Helvetica-Bold').text('DOSSIÊ DE PERCEPÇÃO SOCIAL • RELATÓRIO COMPLETO', 45, 35, { align: 'center', characterSpacing: 1 });
      doc.moveDown(1.5);

      // Capítulo 2
      const cap2 = fullDossier.chapter2_hidden_trait;
      if (cap2) {
        doc.fillColor(primaryColor).fontSize(13).font('Helvetica-Bold').text(cap2.title.toUpperCase(), 45, doc.y);
        doc.moveDown(0.4);
        doc.fillColor(textLight).fontSize(9.5).font('Helvetica').lineGap(3.5).text(cap2.content, 45, doc.y, {
          width: contentWidth,
          align: 'justify'
        });
        doc.moveDown(1.8);
      }

      // Capítulo 3 (Ponto Cego Fatal)
      const cap3 = fullDossier.chapter3_blind_spot;
      if (cap3) {
        doc.fillColor('#F43F5E').fontSize(13).font('Helvetica-Bold').text(cap3.title.toUpperCase(), 45, doc.y);
        doc.moveDown(0.4);
        doc.fillColor(textLight).fontSize(9.5).font('Helvetica').lineGap(3.5).text(cap3.content, 45, doc.y, {
          width: contentWidth,
          align: 'justify'
        });
      }

      // =============================================================
      // PÁGINA 3: Capítulo 4 (Guia de Ativação) e Encerramento
      // =============================================================
      doc.addPage();
      drawPageBackground();
      drawPageFooter(3);

      // Mini Header
      doc.fillColor(primaryColor).fontSize(8).font('Helvetica-Bold').text('DOSSIÊ DE PERCEPÇÃO SOCIAL • GUIA DE ATIVAÇÃO', 45, 35, { align: 'center', characterSpacing: 1 });
      doc.moveDown(1.5);

      const cap4 = fullDossier.chapter4_activation_key;
      if (cap4) {
        doc.fillColor(accentCta).fontSize(14).font('Helvetica-Bold').text(cap4.title.toUpperCase(), 45, doc.y);
        doc.moveDown(0.3);
        doc.fillColor(textMuted).fontSize(9).font('Helvetica').text('Execute estes 3 ajustes práticos no seu cotidiano para alinhar sua intenção interna com a percepção externa.', 45, doc.y);
        doc.moveDown(1);

        if (Array.isArray(cap4.steps)) {
          cap4.steps.forEach((step, idx) => {
            const stepY = doc.y;
            // Card do Passo
            doc.roundedRect(45, stepY, contentWidth, 58, 6).fill(cardBg);
            doc.roundedRect(45, stepY, contentWidth, 58, 6).lineWidth(1).stroke('#1E214A');

            // Número / Badge
            doc.fillColor(accentCta).fontSize(10).font('Helvetica-Bold').text(`PASSO 0${idx + 1}: ${step.name.toUpperCase()}`, 58, stepY + 11);
            // Instrução
            doc.fillColor(textLight).fontSize(8.5).font('Helvetica').lineGap(2).text(step.instruction, 58, stepY + 26, {
              width: contentWidth - 26,
              align: 'left'
            });

            doc.y = stepY + 68;
          });
        }
      }

      doc.moveDown(1);

      // Selo de Conclusão Final
      const sealY = doc.y;
      doc.roundedRect(45, sealY, contentWidth, 60, 8).fill('#0F172A');
      doc.roundedRect(45, sealY, contentWidth, 60, 8).lineWidth(1).stroke(accentCta);

      doc.fillColor(accentCta).fontSize(11).font('Helvetica-Bold').text('SELO DE AUTENTICIDADE E CONCLUSÃO', 60, sealY + 13);
      doc.fillColor(textLight).fontSize(8.5).font('Helvetica').text('Este dossiê comportamental é de uso estritamente pessoal. A retenção deste material é de inteira responsabilidade do titular. Guarde este arquivo em segurança em seu dispositivo.', 60, sealY + 28, {
        width: contentWidth - 30
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
