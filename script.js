const products = [
  { id: 1, name: "Wireless Headphones", price: 1999, category: "electronics",image: "img/1.png"},
  { id: 2, name: "Smartphone Case", price: 499, category: "electronics", image: "img/2.png" },
  { id: 3, name: "T-Shirt", price: 799, category: "fashion", image: "img/3.png" },
  { id: 4, name: "Jeans", price: 1599, category: "fashion", image: "img/4.png" },
  { id: 5, name: "Novel: The Alchemist", price: 399, category: "books", image: "img/5.png" },
  { id: 6, name: "Notebook", price: 99, category: "books", image: "img/6.png" }
];

let cart = [];
let filteredCategory = "all";

document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  updateCart();

  // Payment form submission
  document.getElementById("payment-form").addEventListener("submit", (e) => {
    e.preventDefault();
    confirmPayment();
  });
});

// Show shop or orders page
function showSection(section) {
  document.getElementById("product-section").classList.add("hidden");
  document.getElementById("payment-options").classList.add("hidden");
  document.getElementById("confirmation").classList.add("hidden");
  document.getElementById("orders-page").classList.add("hidden");

  if (section === "shop") {
    document.getElementById("product-section").classList.remove("hidden");
    updateCart();
  } else if (section === "orders") {
    document.getElementById("orders-page").classList.remove("hidden");
    renderOrders();
  }
}

// Render products with category and search filtering
function renderProducts(searchTerm = "") {
  const container = document.getElementById("products");
  container.innerHTML = "";

  const filteredProducts = products.filter(product => {
    const matchCategory = filteredCategory === "all" || product.category === filteredCategory;
    const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (filteredProducts.length === 0) {
    container.innerHTML = "<p>No products found.</p>";
    return;
  }

  filteredProducts.forEach(product => {
    const div = document.createElement("div");
    div.className = "product-card";

    div.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="product-image" />
      <h3>${product.name}</h3>
      <p>₹${product.price}</p>
      <button onclick="addToCart(${product.id})">Add to Cart</button>
    `;
    container.appendChild(div);
  });
}

function filterCategory(category) {
  filteredCategory = category;
  const searchTerm = document.getElementById("searchBar").value.trim();
  renderProducts(searchTerm);
}

// Search bar input handler
function searchProducts() {
  const searchTerm = document.getElementById("searchBar").value.trim();
  renderProducts(searchTerm);
}

// Add product to cart
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  updateCart();
}

// Remove product from cart
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCart();
}

// Update cart UI and totals
function updateCart() {
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  const payBtn = document.getElementById("pay-btn");

  cartItems.innerHTML = "";

  if (cart.length === 0) {
    cartItems.innerHTML = "<li>Your cart is empty.</li>";
    cartTotal.textContent = "0";
    payBtn.disabled = true;
    return;
  }

  let total = 0;
  cart.forEach(item => {
    total += item.price * item.qty;

    const li = document.createElement("li");
    li.innerHTML = `
      ${item.name} (x${item.qty}) - ₹${item.price * item.qty}
      <button onclick="removeFromCart(${item.id})" title="Remove">&times;</button>
    `;
    cartItems.appendChild(li);
  });

  cartTotal.textContent = total;
  payBtn.disabled = false;
}

// Show payment options section
function showPaymentOptions() {
  if (cart.length === 0) return;

  document.getElementById("product-section").classList.add("hidden");
  document.getElementById("payment-options").classList.remove("hidden");
  document.getElementById("confirmation").classList.add("hidden");
  document.getElementById("orders-page").classList.add("hidden");
}

// Cancel payment and go back to shop
function cancelPayment() {
  document.getElementById("payment-options").classList.add("hidden");
  document.getElementById("product-section").classList.remove("hidden");
}

// Confirm payment and store order
function confirmPayment() {
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
  const amount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const orders = JSON.parse(localStorage.getItem("orders")) || [];

  const newOrder = {
    id: Date.now(),
    items: [...cart],
    amount,
    payment_method: paymentMethod,
    status: "Pending",
    timestamp: new Date().toISOString()
  };

  orders.push(newOrder);
  localStorage.setItem("orders", JSON.stringify(orders));

  // Clear cart after payment
  cart = [];
  updateCart();

  // Show confirmation UI
  document.getElementById("pay-method").textContent = paymentMethod;
  document.getElementById("pay-amount").textContent = amount;

  document.getElementById("payment-options").classList.add("hidden");
  document.getElementById("confirmation").classList.remove("hidden");
}

// Continue shopping after confirmation
function continueShopping() {
  document.getElementById("confirmation").classList.add("hidden");
  showSection("shop");
}

// Render orders in the "My Orders" page with editable status
function renderOrders() {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const container = document.getElementById("order-list");
  container.innerHTML = "";

  if (orders.length === 0) {
    container.innerHTML = "<p>No orders placed yet.</p>";
    return;
  }

  orders.forEach((order, index) => {
    const div = document.createElement("div");
    div.className = "order-card";

    // Create status select dropdown
    const statuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
    const statusSelect = document.createElement("select");

    statuses.forEach(status => {
      const option = document.createElement("option");
      option.value = status;
      option.textContent = status;
      if (status === order.status) option.selected = true;
      statusSelect.appendChild(option);
    });

    statusSelect.onchange = function () {
      updateOrderStatus(index, this.value);
    };

    div.innerHTML = `
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Amount:</strong> ₹${order.amount}</p>
      <p><strong>Payment Method:</strong> ${order.payment_method}</p>
      <p><strong>Status:</strong></p>
    `;

    div.appendChild(statusSelect);

    div.innerHTML += `
      <p><strong>Ordered On:</strong> ${new Date(order.timestamp).toLocaleString()}</p>
      <p><strong>Items:</strong></p>
      <ul>
        ${order.items.map(item => `<li>${item.name} (x${item.qty}) - ₹${item.price * item.qty}</li>`).join("")}
      </ul>
    `;

    container.appendChild(div);
  });
}

// Update order status in localStorage
function updateOrderStatus(orderIndex, newStatus) {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  if (!orders[orderIndex]) return;

  orders[orderIndex].status = newStatus;
  localStorage.setItem("orders", JSON.stringify(orders));
  alert(`Order status updated to: ${newStatus}`);
  renderOrders();
}
