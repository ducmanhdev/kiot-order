<template>
  <aside class="laptop:flex hidden flex-col p-6 lg:p-7 2xl:p-9 overflow-y-auto overflow-x-hidden">
    <div class="shrink-0 flex justify-between items-center pb-4 border-b border-gray3">
      <p class="text-32px font-bold">Order</p>
      <div class="relative mr-6">
        <img src="@/assets/images/order/shopping-cart.svg" alt="">
        <div class="absolute top-[-14px] right-[-26px] w-9 h-9 rounded-full bg-primary flex-center text-white font-semibold text-20px 2xl:text-24px">
          {{ cartQuantity }}
        </div>
      </div>
    </div>
    <div class="grow overflow-y-auto min-h-[200px] show-scrollbar divide-y -ml-4 pl-4">
      <aside-cart-item
          v-for="item in cartList"
          :key="item.id"
          :data="item"
          class="cursor-pointer"
          @click="handleShowModalAddCart(item)"
          @delete="handleDeleteCartItem"
      />
    </div>
    <div class="shrink-0 pt-7 2xl:pt-9 border-t border-gray3">
      <div class="flex justify-between items-center mb-4 text-24px font-semibold">
        <p class="">TOTAL</p>
        <p class="">{{ FormatHelper.formatShownPrice(priceSubtotal) }}</p>
      </div>
      <button
          type="button"
          class="w-full btn btn-success add-btn"
          :disabled="isCartEmpty"
          @click="handleCheckout"
      >
        NEXT
      </button>
    </div>
  </aside>
</template>

<script lang="ts" setup>
import {computed} from "vue";
import {useOrderStore} from "@/stores/order";
import type {CategoryItem} from "@/stores/order";
import FormatHelper from '@/utils/formatHelper'
import {useRouter} from "vue-router";
import AsideCartItem from "@/views/order/AsideCartItem.vue";

const orderStore = useOrderStore();
const router = useRouter();

const cartList = computed(() => orderStore.cartList);
const isCartEmpty = computed(() => (orderStore as any).isCartEmpty);
const cartQuantity = computed(() => (orderStore as any).cartQuantity);
const priceSubtotal = computed(() => (orderStore as any).priceSubtotal);

const handleShowModalAddCart = (data: CategoryItem) => {
  orderStore.showModalAddCart(data)
}
const handleDeleteCartItem = async (cart_id: number) => {
  orderStore.deleteCartItem(cart_id);
}
const handleCheckout = () => {
  router.push({
    name: 'overview',
  })
}
</script>

<style lang="scss" scoped>
</style>