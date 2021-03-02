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
function addToCart(cartItems) {
  cartItems.forEach((item) => {
    allProducts.forEach((product) => {
      if (item.id === product.id) {
        cart.innerHTML += `
        <div class="cart-item">
            <img src="${product.img}" alt="product">
            <div>
                <h4>${product.title}</h4>
                <h5>${product.price}</h5>
                <p class="remove-btn" data-id="${product.id}">remove</p>
            </div>
            <div>
              <i class="fas fa-caret-up" data-id="${product.id}"></i>
              <span class="item-amount">${item.amount}</span>
              <i class="fas fa-caret-down" data-id="${product.id}"></i>
            </div>
        </div>  
    `;
      }
    });
  });
}

function btnListener() {
  let id = this.dataset.id;
  allProducts.forEach((product) => {
    if (product.id === id) {
      let newItem = [{ id: product.id, amount: 1 }];
      cartItems = [...cartItems, ...newItem];
      saveToStorage(cartItems, "cart");
      addToCart(newItem);
    }
  });
  this.innerText = "in cart";
  this.classList.add("in-cart");
  toggleCartPage();
  this.removeEventListener("click", btnListener);
}

function addToCartButtons() {
  const addToCartBtns = [...document.querySelectorAll(".add-to-cart")];
  addToCartBtns.forEach((btn) => {
    let id = btn.dataset.id;
    let inCart = cartItems.find((item) => item.id === id);

    if (inCart) {
      btn.innerText = "in cart";
      btn.classList.add("in-cart");
    } else {
      btn.addEventListener("click", btnListener);
    }
  });
}

// set products to cart
function setProductsToCart() {
  const productsInCart = JSON.parse(localStorage.getItem("cart"));

  if (productsInCart) {
    allProducts.forEach((product) => {
      productsInCart.forEach((item) => {
        if (item.id === product.id) {
          cartItems = [...cartItems, { id: product.id, amount: item.amount }];
        }
      });
    });
    saveToStorage(cartItems, "cart");
    addToCart(cartItems);
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
  addToCartButtons();

  cartBtn.addEventListener("click", () => {
    toggleCartPage();
  });
  closeBtn.addEventListener("click", () => {
    toggleCartPage();
  });
  clearBtn.addEventListener("click", () => {
    // clear all the items in the cart
  });

  //   use event bubling to remove and increase / decrease
  cart.addEventListener("click", (event) => {
    const clickedItem = event.target.parentNode.parentNode;
    const id = event.target.dataset.id;
    if (event.target.classList.contains("remove-btn")) {
      // remove the item
      cartItems = cartItems.filter((item) => item.id !== id);
      saveToStorage(cartItems, "cart");
      const addToCartBtns = document.querySelectorAll(".add-to-cart");
      addToCartBtns.forEach((btn) => {
        if (btn.dataset.id === id) {
          btn.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
          btn.addEventListener("click", btnListener);
        }
      });
      cart.removeChild(clickedItem);
    } else if (event.target.classList.contains("fa-caret-up")) {
      // increase amount
      cartItems.forEach((item) => {
        if (item.id === id) {
          item.amount++;
        }
      });
      saveToStorage(cartItems, "cart");
    } else if (event.target.classList.contains("fa-caret-down")) {
      // decrease amount
      cartItems.forEach((item) => {
        if (item.id === id) {
          item.amount--;
        }
      });
      saveToStorage(cartItems, "cart");
    }
  });
});
