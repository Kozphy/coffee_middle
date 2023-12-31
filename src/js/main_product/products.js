import { productsSrc } from "./productsData.js";
import { btnAddRm } from "../common/btnAddRm.js";
import { browserStorage } from "../common/browserStorage.js";
import { shopCartCanvas } from "../shopCartCanvas.js";
import { nav } from "../navbar.js";

export { product };

const filterMap = {
  HQcoffee: "coffeeBeverage",
  coffeeBean: "coffeeBean",
  Indonesia: "Indonesia",
  India: "India",
  sunShine: "sunShine",
  waterWash: "waterWash",
};

class Product extends btnAddRm {
  constructor() {
    super();

    this.content = document.querySelector(".products");
    this.productSection = this.content.querySelector(".products-content .row");
    this.filterSection = document.querySelector(".products-filter");
    this.filterCheckboxs = this.filterSection.querySelectorAll(
      "input[type='checkbox']"
    );
    this.filterBtn = this.filterSection.querySelector(".filterBtn");

    this.storage = sessionStorage;
    this.storageObjectName = "products";

    this.renderProductsData = productsSrc;
    this.filterConditions = [];
    this.searchBarCondition;
    this.searchBarValue;

    this.render();

    shopCartCanvas.renderCanvasProducts();
    // this.productsSearchClickEvent();
  }

  render() {
    this.renderProducts(productsSrc);
    this.addEvents();
  }

  addEvents() {
    this.filterBtnEvent();
    this.productsSearchClickEvent();
    this.bindEventsAfterRender();
  }

  bindEventsAfterRender() {
    this.addBtn = this.content.querySelectorAll(".products-content .btn-add");
    this.reduceBtn = this.content.querySelectorAll(".btn-reduce");
    this.increaseCounterEvent();
    this.reduceCounterEvent();
    this.productToShopCartClickEvent();
  }

  // Events
  filterBtnEvent() {
    this.filterBtn.addEventListener("click", (e) => {
      this.getSearchBarValue();
      let productsAfterSearch = this.handleSearchBarData();
      this.getcheckBoxConditions();
      let productsAfterFilter = this.handleFilterData(productsAfterSearch);
      this.renderProducts(productsAfterFilter);
      this.bindEventsAfterRender();
    });
  }

  productsSearchClickEvent() {
    let productsSearchBtn = this.content.querySelector(".productsSearchBtn");
    productsSearchBtn.addEventListener("click", (e) => {
      this.getSearchBarValue();
      let productsAfterSearch = this.handleSearchBarData();
      console.log(productsAfterSearch);
      this.renderProducts(productsAfterSearch);
      this.bindEventsAfterRender();
    });
  }

  productToShopCartClickEvent() {
    // reset counter handler
    const productCounterResetHandler = (e) => {
      let productCounter =
        e.currentTarget.parentNode.parentNode.querySelector(".productCounter");

      if (productCounter.value > 1) {
        productCounter.setAttribute("value", 1);
      }
    };

    const getDOMProductInfo = (e) => {
      let cardDOM = e.target.closest(".card");
      let productImg = cardDOM.querySelector("img");
      let cardBody = cardDOM.querySelector(".card-body");
      // console.log("productImg: ", productImg);
      let productTitle = cardBody.querySelector(".productName");
      // console.log("productTitle: ", productTitle.getAttribute);
      let productContent = cardBody.querySelector(".productContent");
      // console.log("productContent: ", productContent.textContent);
      let productCounter = cardBody.querySelector(".productCounter");
      // console.log("productCounter: ", productCounter.value);
      let prodcutPrice = cardBody.querySelector(".productPrice");
      let productPriceWithoutPrefix = prodcutPrice.textContent
        .trim()
        .split(" ")[1];
      // console.log("prodcutPrice: ", prodcutPrice.textContent);
      let product = {
        img: {
          src: productImg.getAttribute("src"),
          alt: productImg.getAttribute("alt"),
        },
        Title: productTitle.textContent.trim(),
        Counter: productCounter.value,
        Content: productContent.textContent.trim(),
        Price: productPriceWithoutPrefix,
      };
      // console.log(product);
      return product;
    };

    const mergeDOMAndStorageData = (DOMproductInfo) => {
      let storageDatas = browserStorage.getStorageData(
        this.storage,
        this.storageObjectName
      );

      if (!storageDatas.length) {
        return [DOMproductInfo];
      }

      let newDatas;
      for (let i = 0; i < storageDatas.length; i++) {
        if (storageDatas[i].Title.trim() == DOMproductInfo.Title.trim()) {
          // console.log(storageDatas[i].Price.split(" ")[1]);

          let unitPrice =
            Number(storageDatas[i].Price) / storageDatas[i].Counter;
          console.log(unitPrice);
          let quantity =
            Number(storageDatas[i].Counter) + Number(DOMproductInfo.Counter);
          storageDatas[i].Counter = quantity;
          storageDatas[i].Price = quantity * unitPrice;
          newDatas = storageDatas;
          return newDatas;
        }
      }

      storageDatas.push(DOMproductInfo);
      newDatas = storageDatas;
      return newDatas;
    };

    let addToShoppingCartBtn = document.querySelectorAll(
      ".content .products .addToCart"
    );

    // add to shopCart click event
    addToShoppingCartBtn.forEach((btn, ind) => {
      btn.addEventListener("click", (e) => {
        const DOMproductInfo = getDOMProductInfo(e);
        const newDatas = mergeDOMAndStorageData(DOMproductInfo);
        browserStorage.setStorageData(
          this.storage,
          this.storageObjectName,
          newDatas
        );
        productCounterResetHandler(e);
        shopCartCanvas.renderCanvasProducts();
        nav.changeNavShoppingCartCounter();

        let toastEl = document.getElementById("liveToast");
        const toastB = bootstrap.Toast.getOrCreateInstance(toastEl);
        toastB.show();
      });
    });
  }

  // method
  getcheckBoxConditions() {
    let filterConditions = [];
    this.filterCheckboxs.forEach((checkbox) => {
      const checkedCondition = checkbox.checked;
      const filterMethod = filterMap[checkbox.getAttribute("id")];
      if (checkedCondition) {
        filterConditions.push(filterMethod);
      }
    });
    this.filterConditions = filterConditions;
  }

  getSearchBarValue() {
    this.searchBarValue = undefined;
    let searchBtnParent = document.querySelector(".search-bar");
    let searchBar = searchBtnParent.querySelector(".productsSearchBar");
    if (searchBar.value) {
      this.searchBarValue = searchBar.value;
    }
  }

  handleSearchBarData() {
    let productsAfterSearch;
    if (this.searchBarValue == undefined) {
      productsAfterSearch = productsSrc;
      return productsAfterSearch;
    }
    console.log(this.searchBarValue);
    productsAfterSearch = productsSrc.filter((product) => {
      // console.log(product.cardTitle);
      return product.cardTitle.includes(this.searchBarValue);
    });
    return productsAfterSearch;
  }

  handleFilterData(productsAfterSearch) {
    let productsAfterFilter;
    if (this.filterConditions.length === 0) {
      productsAfterFilter = productsAfterSearch;
      return productsAfterFilter;
    }
    // console.log(productsSrc);

    productsAfterFilter = productsAfterSearch.filter((product) => {
      let filterConditions =
        this.filterConditions.indexOf(product.productType) !== -1 ||
        this.filterConditions.indexOf(product.placeOfOrigin) !== -1 ||
        this.filterConditions.indexOf(product.handleMethod) !== -1;

      // console.log("filterConditions: ", filterConditions);
      // console.log("searchBarCondition: ", searchBarCondition);
      return filterConditions;
    });
    return productsAfterFilter;
  }

  // render
  renderProducts(products) {
    this.productSection.innerHTML = "";

    products.forEach((product) => {
      const productHTML = this.getProductHTML(product);
      this.productSection.insertAdjacentHTML("beforeend", productHTML);
    });
  }

  getProductHTML(product) {
    let badgesMap = {
      coffeeBean: "咖啡豆",
      coffeeBeverage: "精品咖啡",
      waterWash: "水洗",
      sunShine: "日曬",
      Indonesia: "印尼",
      India: "印度",
    };

    return `<div class="col-lg-4 col-12 mb-3">
                <div class="card img-fluid" >
                <a href="${
                  product.img_src
                }" data-lightbox="img-1" style="display:inline-block" 
                data-title="${product.cardTitle}"
                data-alt="${product.img_alt}">

                  <img
                    src="${product.img_src}"
                    class="card-img-top"
                    alt="${product.img_alt}"
                  />
                </a>
                  <div class="card-body">
                    <h5 class="card-title productName">
                    ${product.cardTitle} 
                    </h5>
                    <h5 class="product-badges">
                      <span class="badge bg-secondary">${
                        badgesMap[product.productType]
                      }</span>
                      <span class="badge bg-secondary">${
                        badgesMap[product.placeOfOrigin]
                      }</span>
                      <span class="badge bg-secondary">${
                        badgesMap[product.handleMethod]
                      }</span>
                    </h5>
                    <p class="card-text productContent overflow-auto" style="height:120px">
                    ${product.content}
                    </p>
                    <div class="input-group  mb-3">
                      <button
                        class="btn btn-outline-secondary btn-reduce"
                        type="button"
                      >
                        <span>-</span>
                      </button>
                      <input
                        type="text"
                        class="form-control text-center productCounter"
                        aria-label="Example text with button addon"
                        aria-describedby="button-addon1"
                        value="1"
                      />
                      <button
                        class="btn btn-outline-secondary btn-add"
                        type="button"
                      >
                        <span> + </span>
                      </button>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                    <div class"mb-2">
                      <span class="romantic-text productPrice h5">$ ${
                        product.price
                      }</span>
                    </div>
                    <button id="liveToastBtn" type="button"  class="btn btn-primary addToCart">加入購物車</button>
                    </div>
                  </div>
                </div>
              </div>`;
  }
}

let product = new Product();
