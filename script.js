(() => {
  const isHomePage = () => {
    return (
      window.location.pathname === "/" ||
      window.location.pathname === "/index.html"
    );
  };

  const init = () => {
    if (!isHomePage()) {
      console.log("yanlış sayfa");
      return;
    }

    getProducts().then((products) => {
      buildHTML(products);
      buildCSS();
      setEvents(products);
    });
  };

  const getProducts = async () => {
    const storedProducts = localStorage.getItem("carouselProducts");
    if (storedProducts) {
      return JSON.parse(storedProducts);
    }

    try {
      const response = await fetch(
        "https://gist.githubusercontent.com/sevindi/8bcbde9f02c1d4abe112809c974e1f49/raw/9bf93b58df623a9b16f1db721cd0a7a539296cf0/products.json"
      );
      const products = await response.json();

      localStorage.setItem("carouselProducts", JSON.stringify(products));
      return products;
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  };

  const createElement = (
    tag,
    classes = [],
    attributes = {},
    textContent = ""
  ) => {
    const element = document.createElement(tag);

    if (classes.length) {
      element.classList.add(...classes);
    }

    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });

    if (textContent) {
      element.textContent = textContent;
    }

    return element;
  };

  const formatPrice = (price) => {
    return (
      new Intl.NumberFormat("tr-TR", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price) + " TL"
    );
  };

  const createHeartIcon = (isFavorite) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.setAttribute("fill", isFavorite ? "#ff8000" : "none");
    svg.setAttribute("stroke", isFavorite ? "#ff8000" : "currentColor");
    svg.setAttribute("stroke-width", "2");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
    );

    svg.appendChild(path);
    return svg;
  };

  const buildHTML = (products) => {
    const favorites =
      JSON.parse(localStorage.getItem("carouselFavorites")) || [];

    const container = createElement("div", ["custom-carousel"]);

    const innerContainer = createElement("div", ["carousel-inner-container"]);
    container.appendChild(innerContainer);

    const title = createElement(
      "h2",
      ["carousel-title"],
      {},
      "Beğenebileceğinizi düşündüklerimiz"
    );
    innerContainer.appendChild(title);

    const carouselContainer = createElement("div", ["carousel-container"]);

    const wrapper = createElement("div", ["carousel-wrapper"]);
    const track = createElement("div", ["carousel-track"]);

    products.forEach((product) => {
      const isFavorite = favorites.includes(product.id.toString());

      const item = createElement("div", ["product-item"], {
        "data-product-id": product.id,
      });

      const imageContainer = createElement("div", ["product-image-container"]);

      const image = createElement("img", ["product-image"], {
        src: product.img,
        alt: product.name,
        loading: "lazy",
      });
      imageContainer.appendChild(image);

      const favoriteButton = createElement(
        "button",
        ["favorite-button", ...(isFavorite ? ["favorite-active"] : [])],
        { "data-product-id": product.id }
      );
      favoriteButton.appendChild(createHeartIcon(isFavorite));
      imageContainer.appendChild(favoriteButton);

      item.appendChild(imageContainer);

      const infoContainer = createElement("div", ["product-info"]);

      const brandElement = createElement(
        "span",
        ["product-brand"],
        {},
        product.brand
      );

      const separator = document.createTextNode(" - ");

      const nameElement = createElement(
        "span",
        ["product-name"],
        {},
        product.name
      );

      infoContainer.appendChild(brandElement);
      infoContainer.appendChild(separator);
      infoContainer.appendChild(nameElement);

      const priceContainer = createElement("div", ["product-price-container"]);

      if (product.original_price && product.original_price !== product.price) {
        const originalSection = createElement(
          "div",
          ["product-original-section"],
          {}
        );

        const originalPrice = createElement(
          "span",
          ["product-original-price"],
          {},
          formatPrice(product.original_price)
        );
        originalSection.appendChild(originalPrice);

        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#00a365">
          <path d="M440-800v487L216-537l-56 57 320 320 320-320-56-57-224 224v-487h-80Z"/>
        </svg>`;

        const tempDiv = document.createElement("div", ["color-green"]);
        tempDiv.innerHTML = svgString;

        const discountPercent = Math.round(
          100 - (product.price / product.original_price) * 100
        );
        const discount = createElement(
          "div",
          ["product-discount", "color-green"],
          {},
          `%${discountPercent}`
        );

        originalSection.appendChild(discount);
        originalSection.append(tempDiv.firstElementChild);

        const currentPrice = createElement(
          "div",
          ["product-price", "color-green"],
          {},
          formatPrice(product.price)
        );

        priceContainer.appendChild(originalSection);
        priceContainer.appendChild(currentPrice);
      } else {
        const price = createElement(
          "div",
          ["product-price"],
          {},
          formatPrice(product.price)
        );
        priceContainer.appendChild(price);
      }

      const productItemContent = createElement(
        "div",
        ["product-item-content"],
        {}
      );

      productItemContent.appendChild(infoContainer);
      productItemContent.appendChild(priceContainer);

      item.append(productItemContent);

      const addToCartButton = createElement(
        "button",
        ["add-to-cart-button"],
        {},
        "Sepete Ekle"
      );
      item.appendChild(addToCartButton);

      track.appendChild(item);
    });

    wrapper.appendChild(track);
    carouselContainer.appendChild(wrapper);

    innerContainer.appendChild(carouselContainer);

    const prevButton = createElement("button", ["carousel-prev"], {}, "❮");
    container.appendChild(prevButton);

    const nextButton = createElement("button", ["carousel-next"], {}, "❯");
    container.appendChild(nextButton);

    const storiesSection = document.querySelector(".Section1") || document.body;
    storiesSection.after(container);
  };

  const buildCSS = () => {
    const css = `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      :root {
        --main-color: #f28e00;
        --main-bg-color: #fef6eb;
        --carousel-gap: 20px;
      }
      
      .custom-carousel {
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        position: relative;
        width: 100%;
        padding-top: 25px;
        margin-right: auto;
        margin-left: auto;
        max-width: 1320px;
        box-sizing: border-box;
      }
      
      .carousel-inner-container {
        padding-right: 10px;
        padding-left: 10px;
        width: 100%;
        margin: 0 auto;
        box-sizing: border-box;
      }
      
      .carousel-title {
        font-size: 28.8px;
        padding: 25px 67px;
        color: var(--main-color);
        background-color: var(--main-bg-color);
        border-top-left-radius: 35px;
        border-top-right-radius: 35px;
        font-weight: 700;
        line-height: 1.11;
        width: 100%;
        box-sizing: border-box;
        text-align: start;
        font-family: Quicksand-Bold;
      }
      
      @media (max-width: 480px) {
        .carousel-title {
          padding: 0 22px 0 10px;
        }
      }
      
      .carousel-container {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
      }
      
      .carousel-wrapper {
        width: 100%;
        overflow: hidden;
        position: relative;
      }
      
      .carousel-track {
        display: flex;
        transition: transform 0.5s ease;
        box-sizing: border-box;
        gap: var(--carousel-gap);
      }
      
      .product-item {
        width: 100%;
        z-index: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-direction: column;
        height: 545px;
        min-width: 260px;
        flex: 1;
        font-family: Poppins, "cursive";
        position: relative;
        border: 1px solid #ededed;
        border-radius: 10px;
        padding: 15px;
        display: flex;
        flex-direction: column;
        cursor: pointer;
        color: #7d7d7d;
        margin: 0 0 20px 0;
        position: relative;
        text-decoration: none;
        margin-top: 20px;
        box-sizing: border-box;
      }
      
      .product-item:hover {
        box-shadow: 0 0 0 0 #00000030, inset 0 0 0 3px var(--main-color);
      }
      
      .product-image-container {
        position: relative;
        width: 100%;
        height: 250px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 15px;
      }
      
      .product-image {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
      
      .favorite-button {
        position: absolute;
        background-color: #fff;
        top: 5px;
        right: 5px;
        background: none;
        border: none;
        cursor: pointer;
        width: 50px;
        height: 50px;
        z-index: 2;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        box-shadow: 0 2px 4px 0 #00000024;
      }
      
      .favorite-button:hover {
        border: 1px solid var(--main-color);
      }
      
      .favorite-button svg {
        transition: fill 0.3s, stroke 0.3s;
      }
      
      .favorite-active svg {
        fill: var(--main-color);
        stroke: var(--main-color);
      }
      
      .product-info {
        margin-bottom: 10px;
        min-height: 60px;
        display: inline;
        color: #7d7d7d;
      }
      
      .product-item-content {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 0 17px 17px;
        width: 100%;
      }
      
      @media (max-width: 480px) {
        .product-item-content {
          padding: 0 10px 10px;
        }
      }
      
      @media screen and (max-width: 375px) {
        .product-item-content {
          padding: 5px 5px 10px 0;
        }
      }
      
      .product-brand {
        font-weight: bold;
        white-space: nowrap;
        font-size: 14px;
      }
      
      .product-name {
        font-size: 14px;
        line-height: 1.4;
      }
      
      .product-price-container {
        display: flex;
        flex-direction: column;
        align-items: start;
        height: 43px;
      }
      
      .product-original-section {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
      }
      
      .product-original-price {
        color: #999;
        text-decoration: line-through;
        font-size: 14px;
        margin-right: 8px;
      }
      
      .product-price {
        color: #333;
        font-weight: bold;
        font-size: 18px;
      }
      
      .product-discount {
        display: inline-block;
        color: white;
        font-size: 18px;
        font-weight: bold;
      }
      
      .add-to-cart-button {
        width: 100%;
        background-color: var(--main-bg-color);
        color: var(--main-color);
        border: none;
        border-radius: 37.5px;
        margin-top: 19px;
        padding: 15px 20px;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.3s;
      }
      
      .add-to-cart-button:hover {
        color: white;
        background-color: var(--main-color);
      }
      
      .carousel-prev,
      .carousel-next {
        background-color: var(--main-bg-color);
        border: 1px solid var(--main-bg-color);
        color: var(--main-color);
        border-radius: 50%;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 3;
        transition: all 0.3s ease;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        font-size: 24px;
        padding: 1px 6px;
      }
      
      .carousel-prev {
        left: 40px;
      }
      
      .carousel-next {
        right: 40px;
      }
      
      .carousel-prev:hover,
      .carousel-next:hover {
        background-color: white;
        border: 1px solid var(--main-color);
      }
      
      .carousel-prev.disabled,
      .carousel-next.disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      @media (min-width: 1281px) {
        .product-item {
          flex: 0 0 calc(20% - var(--carousel-gap));
          min-width: calc(20% - var(--carousel-gap));
        }
      
        .carousel-prev {
          left: -50px;
        }
      
        .carousel-next {
          right: -50px;
        }
      }
      
      @media (min-width: 992px) and (max-width: 1280px) {
        .custom-carousel {
          max-width: 1200px;
        }
      
        .product-item {
          flex: 0 0 calc(25% - var(--carousel-gap));
          min-width: calc(25% - var(--carousel-gap));
        }
      
        .carousel-inner-container {
          width: 85%;
        }
      
        .carousel-prev {
          left:20px;
        }
      
        .carousel-next {
          right: 20px;
        }
      }
      
      @media (min-width: 769px) and (max-width: 991px) {
        .custom-carousel {
          max-width: 960px;
        }
      
        .product-item {
          flex: 0 0 calc(33.333% - var(--carousel-gap));
          min-width: calc(33.333% - var(--carousel-gap));
        }
      
        .carousel-inner-container {
          width: 80%;
        }
      
        .carousel-prev {
          left: 30px;
        }
      
        .carousel-next {
          right: 30px;
        }
      }
      
      @media (max-width: 768px) {
        .custom-carousel {
          max-width: 100%;
          padding: 0;
        }
      
        .product-item {
          flex: 0 0 calc(50% - var(--carousel-gap));
          min-width: calc(50% - var(--carousel-gap));
        }
      
        .carousel-inner-container {
          width: 100%;
          padding: 0 5px;
        }
      
        .carousel-prev,
        .carousel-next {
          display: none;
        }
      }
      
      .color-green {
        color: #00a365;
      }
      `;

    const style = document.createElement("style");
    style.className = "custom-carousel-style";
    style.textContent = css;
    document.head.appendChild(style);
  };

  const setEvents = (products) => {
    const carouselTrack = document.querySelector(".carousel-track");
    const prevButton = document.querySelector(".carousel-prev");
    const nextButton = document.querySelector(".carousel-next");
    const carouselItems = document.querySelectorAll(".product-item");
    const favoriteButtons = document.querySelectorAll(".favorite-button");
    const addToCartButtons = document.querySelectorAll(".add-to-cart-button");
    const carouselWrapper = document.querySelector(".carousel-wrapper");

    let position = 0;
    let itemsPerView = calculateItemsPerView();
    let maxPosition = Math.max(0, carouselItems.length - itemsPerView);
    let itemWidth = 0;
    let gapWidth = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--carousel-gap"
      )
    );

    if (isNaN(gapWidth)) {
      gapWidth = 20;
    }

    function calculateItemsPerView() {
      if (window.innerWidth >= 1281) {
        return 5;
      } else if (window.innerWidth >= 992) {
        return 4;
      } else if (window.innerWidth >= 769) {
        return 3;
      } else {
        return 2;
      }
    }

    function updateItemWidth() {
      const availableWidth = carouselWrapper.offsetWidth;
      const itemsCount = calculateItemsPerView();
      const totalGapWidth = gapWidth * (itemsCount - 1);

      itemWidth = (availableWidth - totalGapWidth) / itemsCount;

      carouselItems.forEach((item) => {
        item.style.minWidth = `${itemWidth}px`;
        item.style.flexBasis = `${itemWidth}px`;
      });
    }

    function updateCarouselPosition() {
      const scrollAmount = position * (itemWidth + gapWidth);
      carouselTrack.style.transform = `translateX(-${scrollAmount}px)`;

      updateButtonStates();
    }

    function updateButtonStates() {
      if (window.innerWidth <= 768) {
        return;
      }

      prevButton.classList.toggle("disabled", position <= 0);
      nextButton.classList.toggle("disabled", position >= maxPosition);
    }

    const debounce = (func, delay) => {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
      };
    };

    const handleResize = debounce(() => {
      const oldItemsPerView = itemsPerView;
      itemsPerView = calculateItemsPerView();
      maxPosition = Math.max(0, carouselItems.length - itemsPerView);

      updateItemWidth();

      if (oldItemsPerView !== itemsPerView) {
        position = Math.min(position, maxPosition);
      }

      updateCarouselPosition();
    }, 200);

    window.addEventListener("resize", handleResize);
    updateItemWidth();
    updateButtonStates();

    prevButton.addEventListener("click", () => {
      if (position > 0) {
        position--;
        updateCarouselPosition();
      }
    });

    nextButton.addEventListener("click", () => {
      if (position < maxPosition) {
        position++;
        updateCarouselPosition();
      }
    });

    let touchStartX = 0;
    let touchEndX = 0;
    let isSwiping = false;

    carouselTrack.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.touches[0].clientX;
        isSwiping = true;
      },
      { passive: true }
    );

    carouselTrack.addEventListener(
      "touchmove",
      (e) => {
        if (!isSwiping) return;

        e.preventDefault();

        touchEndX = e.touches[0].clientX;
        const diffX = touchStartX - touchEndX;

        if (
          (diffX > 0 && position < maxPosition) ||
          (diffX < 0 && position > 0)
        ) {
          const moveX = -position * (itemWidth + gapWidth) - diffX * 0.5;
          carouselTrack.style.transform = `translateX(${moveX}px)`;
        }
      },
      { passive: false }
    );

    carouselTrack.addEventListener(
      "touchend",
      (e) => {
        if (!isSwiping) return;

        touchEndX = e.changedTouches[0].clientX;
        handleSwipe();
        isSwiping = false;
      },
      { passive: true }
    );

    function handleSwipe() {
      const swipeThreshold = 50;
      const swipeDistance = touchStartX - touchEndX;

      if (swipeDistance > swipeThreshold && position < maxPosition) {
        position++;
        updateCarouselPosition();
      } else if (swipeDistance < -swipeThreshold && position > 0) {
        position--;
        updateCarouselPosition();
      } else {
        updateCarouselPosition();
      }
    }

    carouselItems.forEach((item) => {
      item.addEventListener("click", (event) => {
        if (
          event.target.closest(".favorite-button") ||
          event.target.closest(".add-to-cart-button")
        ) {
          return;
        }

        const productId = item.dataset.productId;
        const product = products.find((p) => p.id.toString() === productId);
        if (product && product.url) {
          window.open(product.url, "_blank");
        }
      });
    });

    favoriteButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();

        const productId = button.dataset.productId;
        toggleFavorite(productId, button);
      });
    });

    addToCartButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();

        console.log("Add to cart clicked");
      });
    });
  };

  const toggleFavorite = (productId, button) => {
    const favorites =
      JSON.parse(localStorage.getItem("carouselFavorites")) || [];

    const index = favorites.indexOf(productId);
    if (index === -1) {
      localStorage.setItem(
        "carouselFavorites",
        JSON.stringify([...favorites, productId])
      );
      button.classList.add("favorite-active");
      button.querySelector("svg").setAttribute("fill", "#ff8000");
      button.querySelector("svg").setAttribute("stroke", "#ff8000");
    } else {
      localStorage.setItem(
        "carouselFavorites",
        JSON.stringify(favorites.filter((id) => id !== productId))
      );
      button.classList.remove("favorite-active");
      button.querySelector("svg").setAttribute("fill", "none");
      button.querySelector("svg").setAttribute("stroke", "currentColor");
    }
  };

  init();
})();
