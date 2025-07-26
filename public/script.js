const container = document.getElementById("product-container");
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (!id) {
  container.innerHTML = "<p>❌ No product ID provided in URL.</p>";
} else {
  fetchProduct();
}

async function fetchProduct() {
  try {
    const res = await fetch(`https://backend-dpp.onrender.com/product/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load product.");
    container.innerHTML = `
      <h1>${data.name}</h1>
      <p><strong>ID:</strong> ${data.product_id}</p>
      <p><strong>Country:</strong> ${data.country}</p>
      <p><strong>Sport:</strong> ${Array.isArray(data.sport) ? data.sport.join(", ") : data.sport}</p>
      <p><strong>Description:</strong> ${data.description}</p>
    `;
  } catch (err) {
    container.innerHTML = "<p>❌ " + err.message + "</p>";
  }
}