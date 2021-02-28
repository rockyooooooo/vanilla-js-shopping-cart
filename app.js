const productsWall = document.querySelector(".products-wall");
const overlay = document.querySelector(".overlay");
const cartPage = document.querySelector(".cart-page");
const cart = document.querySelector(".cart");
const cartBtn = document.querySelector(".cart-btn");
const closeBtn = document.querySelector(".close-btn");
const clearBtn = document.querySelector(".clear-btn");

const allProducts = JSON.parse(localStorage.getItem("products"));
let cartItems = [];

// show / hide overlay and cart page
function toggleCartPage() {
  overlay.classList.toggle("show-overlay");
  cartPage.classList.toggle("show-cart-page");
}

// add product to cart
function addToCart(product) {
  cart.innerHTML += `
        <div class="cart-item">
            <img src="${product.img}" alt="product">
            <div>
                <h4>${product.title}</h4>
                <h5>${product.price}</h5>
                <p>remove</p>
            </div>
            <div>
                <i class="fas fa-caret-up"></i>
                <span>1</span>
                <i class="fas fa-caret-down"></i>
            </div>
        </div>  
    `;

  cartItems = [...cartItems, { id: product.id, amount: 1 }];
  saveToStorage(cartItems, "cart");
}

// set products to cart
function setProductsToCart() {
  const productsInCart = JSON.parse(localStorage.getItem("cart"));

  if (productsInCart) {
    allProducts.forEach((product) => {
      if (productsInCart.find((item) => item.id === product.id)) {
        addToCart(product);
      }
    });
  }
}

// set the products to the wall
function setProductsToWall() {
  allProducts.forEach((product) => {
    productsWall.innerHTML += `
            <div class="product">
                <img src="${product.img}" alt="product">
                <h4>${product.title}</h4>
                <h5>${product.price}</h5>
                <span class="add-to-cart" data-id=${product.id}><i class="fas fa-shopping-cart"></i>add to cart</span>
            </div>
        `;
  });

  const addToCartBtns = [...document.querySelectorAll(".add-to-cart")];
  addToCartBtns.forEach((btn) => {
    let id = btn.dataset.id;
    let inCart = cartItems.find((item) => item.id === id);

    if (inCart) {
      btn.innerText = "in cart";
      btn.classList.add("in-cart");
    } else {
      btn.addEventListener("click", () => {
        allProducts.forEach((product) => {
          if (product.id === id) {
            addToCart(product);
          }
        });
        btn.innerText = "in cart";
        btn.classList.add("in-cart");

        toggleCartPage();
      });
    }
  });
}

// get all the products from json
async function getProducts() {
  try {
    const data = await fetch("products.json").then((response) =>
      response.json()
    );
    let products = data.items;

    products = products.map((item) => {
      const { id } = item.sys;
      const { title, price } = item.fields;
      const img = item.fields.image.fields.file.url;
      return { id, title, price, img };
    });
    return products;
  } catch (error) {
    console.log(error);
  }
}

// save data to localStorage
function saveToStorage(data, target) {
  if (target === "cart") {
    localStorage.setItem("cart", JSON.stringify(data));
  } else {
    localStorage.setItem("products", JSON.stringify(data));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  getProducts().then((data) => {
    saveToStorage(data);
  });
  setProductsToCart();
  setProductsToWall();

  cartBtn.addEventListener("click", () => {
    toggleCartPage();
  });
  closeBtn.addEventListener("click", () => {
    toggleCartPage();
  });
  clearBtn.addEventListener("click", () => {
    cartItems = [];
  });
});
