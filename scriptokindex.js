    let products = []
    let profile = {}
    let orderData = []
    
    document.addEventListener("DOMContentLoaded", async (event) => {
      try {
        // แสดง spinner
        document.getElementById("loading-spinner").style.display = "flex";

        let result = await fetch("https://opensheet.elk.sh/1KWAcDNzQnFjd1UV4vigsJlwnJBs5mlUaG-bG-sM7CNk/products");
        let data = await result.json();
        products = data;

        await liff.init({ liffId: "1657704109-5AwJQQl2" });

        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }

        profile = await liff.getProfile();
        console.log("👤 LINE Profile:", profile);

        document.getElementById("profile-name").textContent = profile.displayName || "ผู้มาเยือน";
        document.getElementById("profile-img").src = profile.pictureUrl;

        loadCart();
        displayProducts();
        loadDataHistory();
        updateCart();
        setTimeout(showWelcomeNotification("ยินดีต้อนรับสู่ Gukkghu Dev Cafe!", "เลือกเครื่องดื่มที่คุณชื่นชอบและสั่งซื้อได้เลย"), 1000);    

      } catch (error) {
        console.error(error);
      } finally {
        // ซ่อน spinner หลังจากโหลดเสร็จหรือเกิด error
        document.getElementById("loading-spinner").style.display = "none";
      }
    });



    async function loadDataHistory() {
      try {
        const formData = new FormData();
        formData.append("type", "history");
        formData.append("customerId", profile.userId);

        const response = await fetch("https://script.google.com/macros/s/AKfycbwr3sCEKgqVEnKqglVmgEeeft7Ezvll1ehmxtNI0JXAhNt4utDtvqO3cz_z-qsWsDpesg/exec", {
          method: "POST",
          body: formData
        });

        const jsonData = await response.json();
        const data = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;

        if (data.success) {
          orderData = data.orderData; // ใช้งานข้อมูลประวัติ
        }

        // ทำงานต่อเมื่อโหลดข้อมูลเสร็จ


      } catch (error) {
        console.error("เกิดข้อผิดพลาด:", error);
      }
    }

    


      // Cart functionality
      let cart = [];
      let orderHistory = [];
      const cartButton = document.getElementById("cart-button");
      const cartSidebar = document.getElementById("cart-sidebar");
      const overlay = document.getElementById("overlay");
      const closeCart = document.getElementById("close-cart");
      const cartItems = document.getElementById("cart-items");
      const cartTotal = document.getElementById("cart-total");
      const cartCount = document.getElementById("cart-count");
      const checkoutBtn = document.getElementById("checkout-btn");
      const checkoutModal = document.getElementById("checkout-modal");
      const closeCheckout = document.getElementById("close-checkout");
      const checkoutItems = document.getElementById("checkout-items");
      const checkoutTotal = document.getElementById("checkout-total");
      const completeOrder = document.getElementById("complete-order");
      const thankYouModal = document.getElementById("thank-you-modal");
      const closeThankYou = document.getElementById("close-thank-you");
      const productsContainer = document.getElementById("products");
      const categoryButtons = document.querySelectorAll(".category-btn");
      const orderHistoryModal = document.getElementById("order-history-modal");
      const closeHistory = document.getElementById("close-history");
      const closeHistoryBtn = document.getElementById("close-history-btn");
      const orderHistoryItems = document.getElementById("order-history-items");

      // Load cart from localStorage
      function loadCart() {
        const savedCart = localStorage.getItem("brewHavenCart");
        if (savedCart) {
          cart = JSON.parse(savedCart);
          updateCart();
        }
      }

      // Save cart to localStorage
      function saveCart() {
        localStorage.setItem("brewHavenCart", JSON.stringify(cart));
      }

      // Load order history from localStorage
      function loadOrderHistory() {
        const savedHistory = localStorage.getItem("brewHavenOrderHistory");
        if (savedHistory) {
          orderHistory = JSON.parse(savedHistory);
          console.log("orderHistory ",orderHistory)
        }
      }

      // Save order history to localStorage
      function saveOrderHistory() {
        localStorage.setItem(
          "brewHavenOrderHistory",
          JSON.stringify(orderHistory)
        );
      }

      // Display products
      function displayProducts(category = "all") {
        productsContainer.innerHTML = "";

        const filteredProducts =
          category === "all"
            ? products
            : products.filter((product) => product.category === category);

        filteredProducts.forEach((product) => {
            // console.log(product)
          const productCard = document.createElement("div");
          productCard.className =
            "product-card bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 border border-coffee-100";
          productCard.innerHTML = `
                    <div class="p-6">
                        <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover mb-4 rounded-lg" />
                        <h3 class="text-xl font-semibold text-coffee-800 mb-2">${product.name}</h3>
                        <p class="text-coffee-600 mb-4">${product.description}</p>
                        <div class="flex justify-between items-center">
                            <span class="text-lg font-bold text-coffee-700">
                              ฿${product.discount && product.discount > 0 
                                  ? `<span class="line-through text-sm text-coffee-400 mr-2">฿${product.price}</span>฿${(product.price - product.discount).toFixed(2)}`
                                  : product.price}
                            </span>
                            <button class="add-to-cart bg-coffee-600 text-white px-4 py-2 rounded-lg hover:bg-coffee-700 transition" data-id="${product.id}">
                                เพิ่มลงตะกร้า
                            </button>
                        </div>
                    </div>

                `;
          productsContainer.appendChild(productCard);
        });

        // Add event listeners to "Add to Cart" buttons
        document.querySelectorAll(".add-to-cart").forEach((button) => {
          button.addEventListener("click", function () {
            const productId = this.getAttribute("data-id");
            addToCart(productId);

            // Add animation effect
            this.classList.add("bg-tea-600");
            this.textContent = "เพิ่มแล้ว!";
            setTimeout(() => {
              this.classList.remove("bg-tea-600");
              this.textContent = "เพิ่มลงตะกร้า";
            }, 1000);
          });
        });
      }

      // Filter products by category
      categoryButtons.forEach((button) => {
        button.addEventListener("click", function () {
          categoryButtons.forEach((btn) => btn.classList.remove("active"));
          this.classList.add("active");
          const category = this.getAttribute("data-category");
          displayProducts(category);
        });
      });

      // Add to cart function
      function addToCart(productId) {
        const product = products.find((p) => p.id === productId);
        const price = product.discount ? (product.price - product.discount) : product.price;

        const existingItem = cart.find((item) => item.id === productId);

        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          cart.push({
            ...product,
            price, // ราคาหลังหักส่วนลด
            originalPrice: product.price, // ราคาก่อนลด
            quantity: 1,
          });
        }

        updateCart();
        saveCart();
        // openCart();
      }

      function updateCart() {
        if (cart.length === 0) {
          cartItems.innerHTML =
            '<div class="text-center text-coffee-500 py-8">ตะกร้าว่างเปล่า</div>';
          checkoutBtn.disabled = true;

          // Clear all totals
          cartTotal.textContent = "฿0.00";
          document.getElementById("cart-discount").textContent = "฿0.00";
          document.getElementById("cart-vat").textContent = "฿0.00";
          document.getElementById("cart-grand-total").textContent = "฿0.00";
        } else {
          cartItems.innerHTML = "";

          cart.forEach((item) => {
            const cartItem = document.createElement("div");
            cartItem.className =
              "flex items-center justify-between p-3 bg-coffee-100 rounded-lg";

            const originalPrice = item.originalPrice || item.price;
            const hasDiscount = originalPrice > item.price;

            cartItem.innerHTML = `
              <div class="flex items-center">
                <div class="ml-3">
                  <h4 class="font-medium text-coffee-800">${item.name}</h4>
                  <p class="text-sm text-coffee-600">
                    ${
                      hasDiscount
                        ? `<span class="line-through text-red-400">฿${originalPrice}</span>
                          <span class="text-green-600 ml-1">฿${item.price}</span>`
                        : `฿${item.price}`
                    } x ${item.quantity}
                  </p>
                </div>
              </div>
              <div class="flex items-center">
                <span class="font-medium mr-4 text-coffee-800">฿${(
                  item.price * item.quantity
                ).toFixed(2)}</span>
                <div class="flex items-center border border-coffee-300 rounded">
                  <button class="decrease-quantity px-2 py-1 text-coffee-700 hover:bg-coffee-200" data-id="${item.id}">-</button>
                  <span class="px-3 text-coffee-800">${item.quantity}</span>
                  <button class="increase-quantity px-2 py-1 text-coffee-700 hover:bg-coffee-200" data-id="${item.id}">+</button>
                </div>
                <button class="remove-item ml-2 text-red-500 hover:text-red-700" data-id="${item.id}">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 
                    1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            `;

            cartItems.appendChild(cartItem);
          });

          // Event listeners
          document.querySelectorAll(".decrease-quantity").forEach((button) => {
            button.addEventListener("click", function () {
              const id = this.getAttribute("data-id");
              decreaseQuantity(id);
            });
          });

          document.querySelectorAll(".increase-quantity").forEach((button) => {
            button.addEventListener("click", function () {
              const id = this.getAttribute("data-id");
              increaseQuantity(id);
            });
          });

          document.querySelectorAll(".remove-item").forEach((button) => {
            button.addEventListener("click", function () {
              const id = this.getAttribute("data-id");
              removeItem(id);
            });
          });

          checkoutBtn.disabled = false;
        }

        // คำนวณยอดรวม ส่วนลด VAT และยอดสุทธิ
        let subtotal = 0;
        let totalDiscount = 0;

        cart.forEach(item => {
          const originalPrice = item.originalPrice || item.price;
          const discount = (originalPrice - item.price) * item.quantity;
          subtotal += item.price * item.quantity;
          totalDiscount += discount;
        });

        const vat = subtotal * 0.07;
        const grandTotal = subtotal + vat;

        // อัปเดตในหน้าเว็บ
        cartTotal.textContent = `฿${subtotal.toFixed(2)}`;
        document.getElementById("cart-discount").textContent = `฿${totalDiscount.toFixed(2)}`;
        document.getElementById("cart-vat").textContent = `฿${vat.toFixed(2)}`;
        document.getElementById("cart-grand-total").textContent = `฿${grandTotal.toFixed(2)}`;

        // จำนวนสินค้าทั้งหมด
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = count;
      }

      // Cart item functions
      function decreaseQuantity(id) {
        const item = cart.find((item) => item.id === id);
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else {
          removeItem(id);
          return;
        }
        updateCart();
        saveCart();
      }

      function increaseQuantity(id) {
        const item = cart.find((item) => item.id === id);
        item.quantity += 1;
        updateCart();
        saveCart();
      }

      function removeItem(id) {
        cart = cart.filter((item) => item.id !== id);
        updateCart();
        saveCart();
      }

      // Cart sidebar toggle
      function openCart() {
        cartSidebar.classList.add("open");
        overlay.classList.add("open");
        document.body.style.overflow = "hidden";
      }

      function closeCartSidebar() {
        cartSidebar.classList.remove("open");
        overlay.classList.remove("open");
        document.body.style.overflow = "";
      }

      cartButton.addEventListener("click", openCart);
      closeCart.addEventListener("click", closeCartSidebar);
      overlay.addEventListener("click", closeCartSidebar);

checkoutBtn.addEventListener("click", function () {
  // เคลียร์รายการก่อนเติมใหม่
  checkoutItems.innerHTML = "";

  let subtotal = 0;   // ยอดรวมก่อนหักส่วนลดและ VAT
  let totalDiscount = 0; // รวมส่วนลด

  cart.forEach((item) => {
    const originalPrice = item.originalPrice || item.price; // ราคาปกติ
    const discount = originalPrice > item.price ? (originalPrice - item.price) * item.quantity : 0;

    const itemTotal = item.price * item.quantity; // ราคาหลังลด * จำนวน
    subtotal += itemTotal;
    totalDiscount += discount;

    const checkoutItem = document.createElement("div");
    checkoutItem.className = "flex justify-between items-center";
    checkoutItem.innerHTML = `
      <span class="text-coffee-800">${item.name} x ${item.quantity}</span>
      <span class="text-coffee-800">฿${itemTotal.toFixed(2)}</span>
    `;
    checkoutItems.appendChild(checkoutItem);
  });

  // คำนวณ VAT 7%
  const vat = subtotal * 0.07;

  // ยอดสุทธิ (รวม VAT)
  const grandTotal = subtotal + vat;

  // แสดงผล
  checkoutTotal.innerHTML = `
    <div class="flex justify-between">
      <span>ยอดรวม (ไม่รวม VAT):</span>
      <span>฿${subtotal.toFixed(2)}</span>
    </div>
    <div class="flex justify-between text-green-600">
      <span>ส่วนลดทั้งหมด:</span>
      <span>฿${totalDiscount.toFixed(2)}</span>
    </div>
    <div class="flex justify-between">
      <span>VAT 7%:</span>
      <span>฿${vat.toFixed(2)}</span>
    </div>
    <hr class="my-2 border-coffee-300" />
    <div class="flex justify-between font-semibold text-lg">
      <span>ยอดสุทธิที่ต้องชำระ:</span>
      <span>฿${grandTotal.toFixed(2)}</span>
    </div>
  `;

  // สร้าง QR Code ด้วย PromptPay.io
  const qrcodeContainer = document.getElementById("qrcode");
  qrcodeContainer.innerHTML = "";

  const phone = "0817410181"; // เปลี่ยนเป็นเบอร์ PromptPay ของคุณ
  const qrImg = document.createElement("img");
  qrImg.src = `https://promptpay.io/${phone}/${grandTotal.toFixed(2)}`;
  qrImg.alt = "PromptPay QR";
  qrcodeContainer.appendChild(qrImg);

  // sendOrderSummaryToLINE(cart, subtotal, totalDiscount, vat, grandTotal, phone)

  // แสดง modal
  checkoutModal.classList.remove("hidden");
  closeCartSidebar();
});


      closeCheckout.addEventListener("click", function () {
        checkoutModal.classList.add("hidden");
      });

//       completeOrder.addEventListener("click", function () {
//         // Save order to history
//         const orderDate = new Date();
//         const orderItems = [...cart];
//         const orderTotal = cart.reduce(
//           (sum, item) => sum + item.price * item.quantity,
//           0
//         );

//         const order = {
//           id: Date.now(),
//           date: orderDate,
//           items: orderItems,
//           total: orderTotal,
//         };

//         orderHistory.push(order);
//         saveOrderHistory();

//         // Clear cart
//         cart = [];
//         saveCart();
//         updateCart();

//         // Show thank you modal
//         checkoutModal.classList.add("hidden");
//         thankYouModal.classList.remove("hidden");
//       });

completeOrder.addEventListener("click", function () {
  // 1. เตรียมข้อมูลคำสั่งซื้อ
  const orderDate = new Date();
  const orderItems = [...cart];

  // คำนวณยอดรวม รายการ
  let subtotal = 0;
  let totalDiscount = 0;

  cart.forEach((item) => {
    const originalPrice = item.originalPrice || item.price;
    const discount = originalPrice > item.price ? (originalPrice - item.price) * item.quantity : 0;
    const itemTotal = item.price * item.quantity;

    subtotal += itemTotal;
    totalDiscount += discount;
  });

  const vat = subtotal * 0.07;
  const grandTotal = subtotal + vat;

  // 2. ส่งข้อมูลไป LINE
  const phone = "0817410181"; // เบอร์ PromptPay ของคุณ

  const orderID = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  // 3. บันทึกคำสั่งซื้อ
  const order = {
    id: orderID,
    date: orderDate,
    items: orderItems,
    total: grandTotal,
    customerId: profile.userId
  };
  console.log("order ", order)
  
  //save order to Sheet
const formData = new FormData();
formData.append("type", "saveorder");
formData.append("order", JSON.stringify(order)); // ส่งรวมเป็น order object

fetch("https://script.google.com/macros/s/AKfycbwr3sCEKgqVEnKqglVmgEeeft7Ezvll1ehmxtNI0JXAhNt4utDtvqO3cz_z-qsWsDpesg/exec?type=saveorder", {
  method: "POST",
  body: formData
})
  .then(res => res.text())
  .then(result => setTimeout(showWelcomeNotification("บันทึกการสั่งซื้อเรียบร้อย","ยินดีให้บริการครับขณะนี้ เราได้รับ order จากคุณแล้วกรุณารอเครื่องดื่มสักครู่..."),1000))
  .catch(err => console.error("เกิดข้อผิดพลาด:", err));


  
  
  sendOrderSummaryToLINE(cart, subtotal, totalDiscount, vat, grandTotal, phone, orderID);
  // orderHistory.push(order);
  // saveOrderHistory();

  // 4. ล้างตะกร้า
  cart = [];
  saveCart();
  updateCart();

  // 5. ปิด checkout modal → เปิด thank you modal
  checkoutModal.classList.add("hidden");
  thankYouModal.classList.remove("hidden");
});


      closeThankYou.addEventListener("click", function () {
        thankYouModal.classList.add("hidden");
      });

      // Display order history
//       function displayOrderHistory() {
//         console.log("orderData ",orderData)
//         if (orderHistory.length === 0) {
//           orderHistoryItems.innerHTML =
//             '<div class="text-center text-coffee-500 py-8">ไม่มีประวัติการสั่งซื้อ</div>';
//           return;
//         }

//         orderHistoryItems.innerHTML = "";
//         orderHistory.forEach((order) => {
//           const orderDate = new Date(order.date);
//           const formattedDate = `${orderDate.getDate()}/${
//             orderDate.getMonth() + 1
//           }/${orderDate.getFullYear()} ${orderDate.getHours()}:${orderDate
//             .getMinutes()
//             .toString()
//             .padStart(2, "0")}`;

//           const orderElement = document.createElement("div");
//           orderElement.className = "bg-coffee-100 rounded-lg p-4";

//           let orderItemsHTML = "";
//           order.items.forEach((item) => {
//             orderItemsHTML += `
//                         <div class="flex justify-between text-sm py-1">
//                             <span>${item.name} x ${item.quantity}</span>
//                             <span>฿${(item.price * item.quantity).toFixed(
//                               2
//                             )}</span>
//                         </div>
//                     `;
//           });

//           orderElement.innerHTML = `
//                     <div class="flex justify-between items-center mb-2">
//                         <h4 class="font-semibold text-coffee-800">คำสั่งซื้อ #${order.id}</h4>
//                         <span class="text-sm text-coffee-600">${formattedDate}</span>
//                     </div>
//                     <div class="border-t border-coffee-200 pt-2 mb-2">
//                         ${orderItemsHTML}
//                     </div>
//                     <div class="flex justify-between font-semibold text-coffee-800">
//                         <span>รวมทั้งหมด:</span>
//                         <span>฿${order.total.toFixed(2)}</span>
//                     </div>
//                 `;

//           orderHistoryItems.appendChild(orderElement);
//         });
//       }


      function displayOrderHistory() {
        console.log("orderData ",orderData)
        if (orderData.length === 0) {
          orderHistoryItems.innerHTML =
            '<div class="text-center text-coffee-500 py-8">ไม่มีประวัติการสั่งซื้อ</div>';
          return;
        }
        document.getElementById("lengthOrder").textContent = `${orderData.length} order`        
        orderHistoryItems.innerHTML = "";
        orderData.forEach((order) => {
          const orderDate = new Date(order.orderDate);
          const formattedDate = `${orderDate.getDate()}/${
            orderDate.getMonth() + 1
          }/${orderDate.getFullYear()} ${orderDate.getHours()}:${orderDate
            .getMinutes()
            .toString()
            .padStart(2, "0")}`;

          const orderElement = document.createElement("div");
          orderElement.className = "bg-coffee-100 rounded-lg p-4";

          let orderItemsHTML = "";
          order.items.forEach((item) => {
            orderItemsHTML += `
                        <div class="flex justify-between text-sm py-1">
                            <span>${item.name} x ${item.quantity}</span>
                            <span>฿${(item.price * item.quantity).toFixed(
                              2
                            )}</span>
                        </div>
                    `;
          });

          orderElement.innerHTML = `
                    <div class="flex justify-between items-center mb-2">
                        <h4 class="font-semibold text-coffee-800">คำสั่งซื้อ #${order.orderId}</h4>
                        <span class="text-sm text-coffee-600">${formattedDate}</span>
                    </div>
                    <div class="border-t border-coffee-200 pt-2 mb-2">
                        ${orderItemsHTML}
                    </div>
                    <div class="flex justify-between font-semibold text-coffee-800">
                        <span>รวมทั้งหมด:</span>
                        <span>฿${order.total.toFixed(2)}</span>
                    </div>
                `;

          orderHistoryItems.appendChild(orderElement);
        });
      }


      // Add a floating button for order history
      const historyButton = document.createElement("button");
      historyButton.className =
        "fixed bottom-6 right-6 bg-coffee-600 text-white p-3 rounded-full shadow-lg hover:bg-coffee-700 transition z-10";
      historyButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        `;
      document.body.appendChild(historyButton);

      historyButton.addEventListener("click", async function () {
        document.getElementById("loading-spinner").style.display = "flex";
        await loadDataHistory()
        displayOrderHistory();
        orderHistoryModal.classList.remove("hidden");
        document.getElementById("loading-spinner").style.display = "none";
      });

      closeHistory.addEventListener("click", function () {
        orderHistoryModal.classList.add("hidden");
      });

      closeHistoryBtn.addEventListener("click", function () {
        orderHistoryModal.classList.add("hidden");
      });

      // Add a welcome notification
      function showWelcomeNotification(title, description) {
        const notification = document.createElement("div");
        notification.className =
          "fixed top-24 right-6 bg-coffee-100 border-l-4 border-coffee-600 text-coffee-800 p-4 rounded shadow-lg z-50 animate-pulse-slow";
        notification.style.maxWidth = "300px";
        notification.innerHTML = `
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-coffee-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm font-medium">${title}</p>
                        <p class="text-xs mt-1">${description}</p>
                    </div>
                </div>
            `;
        document.body.appendChild(notification);

        setTimeout(() => {
          notification.style.opacity = "0";
          notification.style.transition = "opacity 0.5s ease-in-out";
          setTimeout(() => {
            document.body.removeChild(notification);
          }, 500);
        }, 5000);
      }

      // Initialize
      // loadCart();
      // loadOrderHistory();
      // displayProducts();
      // updateCart();
      // setTimeout(showWelcomeNotification, 1000);


async function sendOrderSummaryToLINE(cart, subtotal, totalDiscount, vat, grandTotal, phone, orderID) {
  const items = cart.map((item) => {
    const itemTotal = item.price * item.quantity;
    return {
      type: "box",
      layout: "horizontal",
      contents: [
        {
          type: "text",
          text: `${item.name} x ${item.quantity}`,
          size: "sm",
          color: "#555555",
          flex: 0
        },
        {
          type: "text",
          text: `฿${itemTotal.toFixed(2)}`,
          size: "sm",
          color: "#111111",
          align: "end"
        }
      ]
    };
  });

  const flexMessage = {
    type: "flex",
    altText: "สรุปคำสั่งซื้อร้านกาแฟ",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "☕ สรุปคำสั่งซื้อ",
            weight: "bold",
            size: "lg",
            color: "#8B4513"
          },
          {
            type: "separator",
            margin: "md"
          },
          ...items,
          {
            type: "separator",
            margin: "md"
          },
          {
            type: "box",
            layout: "vertical",
            margin: "md",
            contents: [
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  { type: "text", text: "ยอดรวม", size: "sm", flex: 0 },
                  { type: "text", text: `฿${subtotal.toFixed(2)}`, size: "sm", align: "end" }
                ]
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  { type: "text", text: "ส่วนลด", size: "sm", flex: 0, color: "#00AA00" },
                  { type: "text", text: `฿${totalDiscount.toFixed(2)}`, size: "sm", align: "end", color: "#00AA00" }
                ]
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  { type: "text", text: "VAT 7%", size: "sm", flex: 0 },
                  { type: "text", text: `฿${vat.toFixed(2)}`, size: "sm", align: "end" }
                ]
              },
              {
                type: "box",
                layout: "horizontal",
                margin: "md",
                contents: [
                  {
                    type: "text",
                    text: "ยอดสุทธิ",
                    weight: "bold",
                    size: "md",
                    flex: 0
                  },
                  {
                    type: "text",
                    text: `฿${grandTotal.toFixed(2)}`,
                    weight: "bold",
                    size: "md",
                    align: "end"
                  }
                ]
              }
            ]
          }
        ]
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "image",
            url: `https://promptpay.io/${phone}/${grandTotal}`,
            size: "full",
            aspectMode: "fit",
            aspectRatio: "1:1"
          },
          {
            type: "text",
            text: "ชำระเงินผ่าน PromptPay",
            align: "center",
            color: "#8B4513",
            size: "sm",
            margin: "sm"
          },
          {
            type: "text",
            text: "#"+orderID,
            align: "center",
            color: "#8B4513",
            size: "sm",
            margin: "sm"
          }
          
        ]
      }
    }
  };

  try {
    if (liff.isInClient()) {
      // 📱 รันในแอป LINE บนมือถือ
      await liff.sendMessages([flexMessage]);
      console.log("✅ ส่งข้อความผ่าน sendMessages สำเร็จ");
    } else {
      // 💻 หรือ browser ปกติ (Desktop, Safari, etc.)
      await liff.shareTargetPicker([flexMessage]);
      console.log("✅ ส่งข้อความผ่าน shareTargetPicker สำเร็จ");
    }
  } catch (err) {
    console.error("❌ LINE Flex Message Error:", err);
    alert("ไม่สามารถส่งข้อความ LINE ได้: " + err.message);
  }
}

