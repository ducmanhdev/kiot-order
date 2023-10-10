<template>
  <!-- <div class="grid grid-cols-[240px_1fr_380px] xl:grid-cols-[300px_1fr_440px] 2xl:grid-cols-[370px_1fr_500px] h-screen"> -->
  <div class="grid laptop:grid-cols-[300px_1fr_440px] grid-cols-[370px_1fr] laptop:h-screen h-[calc(100%-134px)]">
    <aside-menu/>
    <div class="overflow-auto bg-[#F4F4F4]">
      <div class="p-6 lg:p-8 2xl:p-10">
        <!-- <div class="grid grid-cols-2 2xl:grid-cols-3 gap-6 lg:gap-8 2xl:gap-10" v-if="productList?.length"> -->
        <div class="grid grid-cols-2 laptop:grid-cols-3 gap-6 lg:gap-8 2xl:gap-10" v-if="productList?.length">
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
  <div class="w-full h-[134px] laptop:hidden shadow-[0px_-4px_6px_0px_rgba(0,0,0,0.15)] grid grid-cols-[1fr_433px] items-center px-[60px] bg-white z-10">
    <div class="flex items-center gap-x-12">
      <div class="relative flex-shrink-0">
        <img src="@/assets/images/order/shopping-cart.svg" alt="" class="">
        <!-- <div class="absolute top-[-14px] right-[-26px] w-9 h-9 rounded-full bg-primary flex-center text-white font-semibold text-20px 2xl:text-24px"> -->
        <div class="absolute top-[-14px] right-[-26px] w-9 h-9 rounded-full bg-primary flex-center text-white font-semibold text-20px 2xl:text-24px">
          {{ cartQuantity }}
        </div>
      </div>
      <div class="text-[40px]">
        <span class="font-medium">TOTAL: </span>
        <span class="font-bold">{{ FormatHelper.formatShownPrice(priceSubtotal) }}</span>
      </div>
    </div>
    <button type="button" class="btn bg-primary rounded-xl text-white" @click="handleCheckout">MY ORDER</button>
  </div>
</template>

<script lang="ts" setup>
import {computed} from 'vue';
import AsideMenu from '@/views/order/AsideMenu.vue';
import AsideCart from "@/views/order/AsideCart.vue";
import {useRoute, useRouter} from 'vue-router';
import {useOrderStore} from "@/stores/order";
import type {CategoryItem} from "@/stores/order";
import ProductItem from "@/views/order/ProductItem.vue";
import FormatHelper from '@/utils/formatHelper';

const route = useRoute();
const router = useRouter();
const orderStore = useOrderStore();
const productList = computed(() => {
  const currentCategory = orderStore.categoryList.find((item: any) => item.id.toString() === route.params.categoryId);
  if (!currentCategory) return [];
  return currentCategory.items;
});
const cartQuantity = computed(() => (orderStore as any).cartQuantity);
const priceSubtotal = computed(() => (orderStore as any).priceSubtotal);
const handleShowModalAddCart = (data: CategoryItem) => {
  orderStore.showModalAddCart(data)
}

const handleCheckout = () => {
  router.push({
    name: 'overview',
  })
}
</script>

<style lang="scss" scoped>
</style>