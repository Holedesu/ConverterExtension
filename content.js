async function extractData() {
    let items = [];
    const elements = document.querySelectorAll(".iva-item-content-OWwoq");
    
    for (const div of elements) {
        // Проверяем, находится ли div внутри нежелательного блока
        if (div.closest(".items-itemsCarouselWidget-wrEhr")) {
            continue; // Пропускаем этот элемент, если он внутри карусели
        }

        let data = {};

        // Изображение
        const img = div.querySelector("img");
        data.image = img ? img.src : "";

        // Заголовок объявления
        const titleBlock = div.querySelector("div.iva-item-body-GQomw a");
        data.title = titleBlock ? titleBlock.innerText.trim() : "Без заголовка";

        // Цена
        const priceTag = div.querySelector("span");
        data.price = priceTag ? priceTag.innerText.trim() : "Цена не указана";

        // Информация о компании
        const companyTag = div.querySelector("div.style-root-Dh2i5 p");
        data.company = companyTag ? companyTag.innerText.trim() : "Частное лицо";

        // Отзывы и рейтинг
        const companyInfoTag = div.querySelector("div.style-root-Dh2i5");
        if (companyInfoTag) {
            let text = companyInfoTag.innerText.replace(data.company, "").trim();
            data.rating = text.slice(0, 3) || "Нет рейтинга";
            data.reviews = text.slice(3).replace("\n\n", "") || "Нет отзывов";
        } else {
            data.rating = "Нет рейтинга";
            data.reviews = "Нет отзывов";
        }

        // 🔹 Текст объявления
        const textDivList = div.querySelectorAll("div.iva-item-bottomBlock-FhNhY p");
        data.text = textDivList.length > 0 ? textDivList[0].innerText.trim() : "Описание отсутствует";

        items.push(data);
    }

    console.log("Собранные данные:", items);

    // 🔹 Отправляем данные в popup.js
    chrome.runtime.sendMessage({ action: "sendData", items: items });
}

extractData();