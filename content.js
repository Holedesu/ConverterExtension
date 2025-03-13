function extractData() {
    let items = [];
    document.querySelectorAll(".iva-item-content-OWwoq").forEach(div => {
        // Проверяем, находится ли div внутри нежелательного блока
        if (div.closest(".items-itemsCarouselWidget-wrEhr")) {
            return; // Пропускаем этот элемент, если он внутри карусели
        }

        let data = {};

        // Изображение
        const img = div.querySelector("img");
        if (img) {
            data.image = img.src;
        }

        // Заголовок объявления
        const titleBlock = div.querySelector("div.iva-item-body-GQomw a");
        if (titleBlock) {
            data.title = titleBlock.innerText.trim();
        } else {
            data.title = "Без заголовка";
        }

        // Цена
        const priceTag = div.querySelector("span");
        if (priceTag) {
            data.price = priceTag.innerText.trim();
        } else {
            data.price = "Цена не указана";
        }

        // Информация о компании
        const companyTag = div.querySelector("div.style-root-Dh2i5 p");
        if (companyTag) {
            data.company = companyTag.innerText.trim();
        } else {
            data.company = "Частное лицо";
        }

        // Отзывы и рейтинг
        const companyInfoTag = div.querySelector("div.style-root-Dh2i5");
        if (companyInfoTag) {
            let text = companyInfoTag.innerText.replace(data.company, "").trim();
            let rating = text.slice(0, 3);
            let reviews = text.slice(3).replace("\n\n", "");
            data.rating = rating || "Нет рейтинга";
            data.reviews = reviews || "Нет отзывов";
        } else {
            data.rating = "Нет рейтинга";
            data.reviews = "Нет отзывов";
        }

        // Текст объявления
        const textDivList = div.querySelectorAll("div.iva-item-bottomBlock-FhNhY p");
        if (textDivList.length > 0) {
            data.text = textDivList[0].innerText.trim();
        } else {
            data.text = "Описание отсутствует";
        }

        items.push(data);
    });

    console.log("Собранные данные:", items);

    // Отправляем данные в popup.js
    chrome.runtime.sendMessage({ action: "sendData", items: items });
}

extractData();
