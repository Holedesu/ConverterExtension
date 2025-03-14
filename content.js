// Функция плавной прокрутки до конца страницы
async function autoScroll() {
    return new Promise((resolve) => {
      // Используем основной элемент для скроллинга (document.scrollingElement или body)
      const scrollElement = document.scrollingElement || document.body;
      let lastScrollTop = scrollElement.scrollTop;
      const distance = 400; // пикселей для прокрутки за шаг
      const delay = 100;    // задержка между шагами в мс
  
      const timer = setInterval(() => {
        scrollElement.scrollBy(0, distance);
        console.log("Прокрутка... текущий scrollTop:", scrollElement.scrollTop);
  
        // Если достигли низа страницы
        if (scrollElement.scrollTop + window.innerHeight >= scrollElement.scrollHeight) {
          // Если scrollTop не изменился, значит контент подгружаться не будет
          if (scrollElement.scrollTop === lastScrollTop) {
            console.log("Достигнут конец страницы");
            clearInterval(timer);
            resolve();
          } else {
            lastScrollTop = scrollElement.scrollTop;
          }
        }
      }, delay);
    });
  }
  
  // Функция извлечения данных со страницы
  async function extractData() {
    let items = [];
    const elements = document.querySelectorAll(".iva-item-content-OWwoq");
  
    for (const div of elements) {
      // Пропускаем элементы, находящиеся внутри нежелательных блоков (например, каруселей)
      if (div.closest(".items-itemsCarouselWidget-wrEhr")) continue;
  
      let data = {};
  
      // Извлечение изображения
      const img = div.querySelector("img");
      data.image = img ? img.src : "";
  
      // Извлечение заголовка объявления
      const titleBlock = div.querySelector("div.iva-item-body-GQomw a");
      data.title = titleBlock ? titleBlock.innerText.trim() : "Без заголовка";
  
      // Извлечение цены
      const priceTag = div.querySelector("span");
      data.price = priceTag ? priceTag.innerText.trim() : "Цена не указана";
  
      // Извлечение информации о компании
      const companyTag = div.querySelector("div.style-root-Dh2i5 p");
      data.company = companyTag ? companyTag.innerText.trim() : "Частное лицо";
  
      // Извлечение отзывов и рейтинга
      const companyInfoTag = div.querySelector("div.style-root-Dh2i5");
      if (companyInfoTag) {
        let text = companyInfoTag.innerText.replace(data.company, "").trim();
        data.rating = text.slice(0, 3) || "Нет рейтинга";
        data.reviews = text.slice(3).replace("\n\n", "") || "Нет отзывов";
      } else {
        data.rating = "Нет рейтинга";
        data.reviews = "Нет отзывов";
      }
  
      // Извлечение текста объявления
      const textDivList = div.querySelectorAll("div.iva-item-bottomBlock-FhNhY p");
      data.text = textDivList.length > 0 ? textDivList[0].innerText.trim() : "Описание отсутствует";
  
      items.push(data);
    }
  
    console.log("Собранные данные:", items);
    // Отправляем данные в popup.js
    chrome.runtime.sendMessage({ action: "sendData", items: items });
  }
  
  // Функция, объединяющая прокрутку, сбор данных и возврат наверх
  async function scrollAndExtract() {
    await autoScroll();
    await extractData();
    // Возвращаем страницу наверх после завершения всех операций
    console.log("Возвращаем страницу наверх");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  
  // Слушатель сообщений, который ждет команду для запуска прокрутки, сбора данных и возврата наверх
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "startScroll") {
      console.log("Получено сообщение 'startScroll'. Запускаем прокрутку и сбор данных...");
      scrollAndExtract();
    }
  });
  