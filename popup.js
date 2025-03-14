document.addEventListener("DOMContentLoaded", async function () {
    document.getElementById("generatePdf").addEventListener("click", async () => {
      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        await chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ["content.js"]
        });
        chrome.tabs.sendMessage(tabs[0].id, { action: "startScroll" });
      } catch (error) {
        console.error("Ошибка при выполнении скрипта:", error);
      }
    });
  });

// Получаем данные из content.js
chrome.runtime.onMessage.addListener(async (message) => {
    if (message.action === "sendData") {
        console.log("Полученные данные:", message.items);
        await generatePDF(message.items);
    }
});

// Функция создания PDF
async function generatePDF(items) {
    if (!window.jspdf) {
        console.error("Ошибка: jsPDF не загружен!");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Добавляем шрифты Arial
    doc.addFileToVFS("Arial.ttf", arial_base64);
    doc.addFileToVFS("Arial-Bold.ttf", arial_bold_base64);
    doc.addFont("Arial-Bold.ttf", "Arial", "bold");
    doc.addFont("Arial.ttf", "Arial", "normal");
    doc.setFont("Arial", "bold");
    doc.setFontSize(14);

    // Заголовок для изображений
    doc.text("Изображения по запросу:", 10, 10);

    let x = 40, y = 20;
    const itemWidth = 25;
    const itemHeight = 25;
    const rowCount = 5;  // 5 элементов в строке
    const colSpacing = 25;
    const rowSpacing = 26;
    const maxItems = Math.min(items.length, 50); // Ограничение на 50 элементов

    for (let i = 0; i < maxItems; i++) {
        let item = items[i];

        try {
            // Добавляем изображение, если оно есть
            if (item.image) {
                doc.addImage(item.image, "JPEG", x, y, itemWidth, itemHeight);
            }

            x += colSpacing;

            // Переход на новую строку после rowCount элементов
            if ((i + 1) % rowCount === 0) {
                x = 40;
                y += rowSpacing;
            }
        } catch (error) {
            console.error("Ошибка добавления изображения в PDF:", error);
        }
    }

    // Добавляем текстовые данные — по 4 объявления на страницу
    y = 10;
    for (let i = 0; i < maxItems; i += 4) {
        doc.addPage();
        y = 10;

        for (let j = 0; j < 4 && (i + j) < maxItems; j++) {
            let item = items[i + j];
            try {
                doc.setFont("Arial", "bold");
                doc.setFontSize(12);
                doc.text(`Объявление ${i + j + 1}: ${item.title}`, 10, y + 5);
                doc.setFont("Arial", "normal");
                doc.setFontSize(11);
                doc.text(`Цена: ${item.price}`, 10, y + 10);
                doc.text(`Компания: ${item.company}`, 10, y + 15);
                doc.text(`Рейтинг: ${item.rating}`, 10, y + 20);
                doc.text(`Отзывы: ${item.reviews}`, 10, y + 25);
                
                if (item.text) {
                    let shortText = doc.splitTextToSize(`Краткое описание: ${item.text.slice(0, 100)}`, 180);
                    let fullText = doc.splitTextToSize(`Полное описание: ${item.text.slice(0, 200)}`, 180);
                    doc.text(shortText, 10, y + 35);
                    doc.text(fullText, 10, y + 50);
                }

                y += 70;
            } catch (error) {
                console.error("Ошибка добавления текста в PDF:", error);
            }
        }
    }

    doc.save("result.pdf");
}