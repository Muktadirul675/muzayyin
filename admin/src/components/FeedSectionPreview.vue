<!-- FeedSectionPreview.vue -->
<template>
  <div class="preview-section">
    <template v-if="section.type === 'notice'">
      <div class="notice-bar">
        <span v-for="notice in section.notices" :key="notice.id" class="notice-text">
          {{ notice.text }}
        </span>
        <span v-if="section.notices.length === 0">No notices</span>
      </div>
    </template>

    <template v-else-if="section.type === 'navbar'">
      <nav class="navbar">
        <span class="logo">LOGO</span>
        <ul class="nav-links">
          <li><a href="#">Home</a></li>
          <li><a href="#">Shop</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </nav>
    </template>

    <template v-else-if="section.type === 'products_slider' || section.type === 'products'">
      <div class="product-slider">
        <div
          v-for="product in section.products"
          :key="product.id"
          class="product-card"
        >
          <div class="product-image-placeholder"></div>
          <div class="product-name">{{ product.name }}</div>
          <div class="product-price">à§³{{ product.price }}</div>
        </div>
        <div v-if="section.products.length === 0">No products</div>
      </div>
    </template>

    <template v-else-if="section.type === 'categories_bar'">
      <div class="categories-bar">
        <span
          v-for="category in section.categories"
          :key="category.id"
          class="category-chip"
        >
          {{ category.name }}
        </span>
        <span v-if="section.categories.length === 0">No categories</span>
      </div>
    </template>

    <template v-else-if="section.type === 'category'">
      <div class="category-section">
        <h4>Category: {{ section.category?.name || 'N/A' }}</h4>
        <div class="products-list">
          <div
            v-for="product in section.products"
            :key="product.id"
            class="product-card-small"
          >
            {{ product.name }}
          </div>
          <div v-if="section.products.length === 0">No products</div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="unknown-section">Section type "{{ section.type }}" preview not available.</div>
    </template>
  </div>
</template>

<script setup>
defineProps({
  section: Object,
})
</script>

<style scoped>
.notice-bar {
  background-color: #fef3c7;
  padding: 8px 12px;
  border-radius: 4px;
  font-weight: 600;
  color: #92400e;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.notice-text {
  background-color: #fde68a;
  padding: 2px 8px;
  border-radius: 12px;
}

.navbar {
  background-color: #3b82f6;
  padding: 10px 20px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  border-radius: 4px;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 16px;
  margin: 0;
  padding: 0;
}

.nav-links li a {
  color: white;
  text-decoration: none;
  font-weight: 600;
}

.product-slider {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 10px 0;
}

.product-card {
  min-width: 100px;
  border: 1px solid #ddd;
  padding: 8px;
  border-radius: 6px;
  text-align: center;
  background: #fff;
}

.product-image-placeholder {
  background-color: #e5e7eb;
  height: 60px;
  margin-bottom: 6px;
  border-radius: 4px;
}

.product-name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.product-price {
  color: #10b981;
  font-weight: 700;
}

.categories-bar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 10px 0;
}

.category-chip {
  background-color: #bfdbfe;
  color: #1e40af;
  padding: 4px 12px;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 13px;
}

.category-section {
  border: 1px solid #cbd5e1;
  padding: 10px;
  border-radius: 6px;
}

.products-list {
  margin-top: 8px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.product-card-small {
  background: #f3f4f6;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
}
.unknown-section {
  font-style: italic;
  color: #6b7280;
}
</style>