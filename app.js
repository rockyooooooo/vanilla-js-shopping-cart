const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "pyj296w915fr",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "bpaPDIeC5Yvo75ZTILxvTryZC7Aba9znqNVekSDRPqU",
});

const productsWall = document.querySelector(".products-wall");
const overlay = document.querySelector(".overlay");
const cartPage = document.querySelector(".cart-page");
const cart = document.querySelector(".cart");
const totalItems = document.querySelector(".total-items");
const cartBtn = document.querySelector(".cart-btn");
const closeBtn = document.querySelector(".close-btn");
const clearBtn = document.querySelector(".clear-btn");
const totalPrice = document.querySelector(".total-price");

let cartItems = [];

// update value in cart page
function updateCartValue(items) {
  let cost = 0;
  let totalItemsAmount = 0;
  items.forEach((item) => {
    cost += item.price * item.amount;
    totalItemsAmount += item.amount;
  });

  cost = cost.toFixed(2);
  totalPrice.innerText = `$${cost}`;
  totalItems.innerText = totalItemsAmount;
}

// show / hide overlay and cart page
function toggleCartPage() {
  overlay.classList.toggle("show-overlay");
  cartPage.classList.toggle("show-cart-page");
}

// add product to cart
function addToCart(items) {
  items.forEach((item) => {
    cart.innerHTML += `
        <div class="cart-item" data-id="${item.id}">
            <img src="${item.img}" alt="product">
            <div>
                <h4>${item.title}</h4>
                <h5>${item.price}</h5>
                <p class="remove-btn" data-id="${item.id}">remove</p>
            </div>
            <div>
              <i class="fas fa-caret-up" data-id="${item.id}"></i>
              <span class="item-amount">${item.amount}</span>
              <i class="fas fa-caret-down" data-id="${item.id}"></i>
            </div>
        </div>  
    `;
  });
  updateCartValue(cartItems);
}

function btnListener() {
  let id = this.dataset.id;
  let newItem = [{ ...getFromStorage(id), amount: 1 }];
  cartItems = [...cartItems, ...newItem];
  saveToStorage(cartItems, "cart");
  addToCart(newItem);
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
    cartItems = [...productsInCart];
    addToCart(productsInCart);
  }
}

// set the products to the wall
function setProductsToWall(allProducts) {
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
    const response = await client.getEntries({
      content_type: "comfyHouseProducts",
    });
    let products = response.items;

    // const data = await fetch("products.json").then((response) =>
    //   response.json()
    // );
    // let products = data.items;

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

// get products from localStorage
function getFromStorage(id) {
  let products = JSON.parse(localStorage.getItem("products"));
  return products.find((product) => product.id === id);
}

document.addEventListener("DOMContentLoaded", () => {
  getProducts().then((data) => {
    saveToStorage(data);
    setProductsToCart();
    setProductsToWall(data);
    addToCartButtons();
  });

  cartBtn.addEventListener("click", () => {
    toggleCartPage();
  });
  closeBtn.addEventListener("click", () => {
    toggleCartPage();
  });
  clearBtn.addEventListener("click", () => {
    // clear all the items in the cart
    const itemsToBeRemoved = document.querySelectorAll(".cart-item");
    itemsToBeRemoved.forEach((item) => {
      const id = item.dataset.id;
      removeItem(item, id);
      updateCartValue(cartItems);
    });
  });

  //   use event bubling to remove and increase / decrease
  cart.addEventListener("click", (event) => {
    const clickedItem = event.target.parentNode.parentNode;
    const id = event.target.dataset.id;

    if (event.target.classList.contains("remove-btn")) {
      // remove the item
      removeItem(clickedItem, id);
    } else if (event.target.classList.contains("fa-caret-up")) {
      // increase amount
      cartItems.forEach((item) => {
        if (item.id === id) {
          item.amount++;
          event.target.nextElementSibling.innerText = item.amount;
        }
      });
      saveToStorage(cartItems, "cart");
    } else if (event.target.classList.contains("fa-caret-down")) {
      // decrease amount
      cartItems.forEach((item, idx) => {
        if (item.id === id && item.amount > 0) {
          item.amount--;
          event.target.previousElementSibling.innerText = item.amount;
          if (item.amount == 0) {
            cartItems.splice(idx, 1);
            removeItem(clickedItem, id);
          }
        }
      });

      saveToStorage(cartItems, "cart");
    }

    updateCartValue(cartItems);
  });
});

function removeItem(clickedItem, id) {
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
}
