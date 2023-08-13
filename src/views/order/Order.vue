<template>
  <div class="grid grid-cols-[300px_1fr_440px] 2xl:grid-cols-[370px_1fr_500px] h-screen">
    <aside-menu/>
    <div class="overflow-auto bg-[#F4F4F4]">
      <div class="p-8 2xl:p-10">
        <div class="grid grid-cols-2 2xl:grid-cols-3 gap-8 2xl:gap-10" v-if="productList?.length">
          <product-item
              v-for="product in productList"
              :key="product.id"
              :data="product"
              @click="handleShowModalAddCart(product)"
          />
        </div>
        <div class="text-32px font-bold text-center" v-else>
          No products in this category
        </div>
      </div>
    </div>
    <aside-cart/>
  </div>
</template>

<script lang="ts" setup>
import {computed} from 'vue';
import AsideMenu from '@/views/order/AsideMenu.vue';
import AsideCart from "@/views/order/AsideCart.vue";
import {useRoute} from 'vue-router';
import {useOrderStore} from "@/stores/order";
import type {CategoryItem} from "@/stores/order";
import ProductItem from "@/views/order/ProductItem.vue";

const route = useRoute();
const orderStore = useOrderStore();
const productList = computed(() => {
  const currentCategory = orderStore.categoryList.find((item: any) => item.id.toString() === route.params.categoryId);
  if (!currentCategory) return [];
  return currentCategory.items;
});
const handleShowModalAddCart = (data: CategoryItem) => {
  orderStore.showModalAddCart(data)
}
</script>

<style lang="scss" scoped>
</style>