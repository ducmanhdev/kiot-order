<template>
  <layout title="Overview" :back-route="{name: 'order'}">
    <div class="py-[40px] px-[100px] min-h-full flex flex-col">
      <div class="shrink-0 text-center py-10" v-if="isCartEmpty">
        <img src="@/assets/images/empty-cart.png" alt="" class="block w-[200px] h-auto mx-auto mb-4">
        <p class="text-28px text-gray3 font-medium">YOUR CART IS EMPTY</p>
      </div>
      <template v-else>
        <div
            class="shrink-0 grid grid-cols-[90px_1fr_210px_210px_40px] gap-7 items-start text-gray3 font-bold text-24px pb-4 border-b border-black">
          <div></div>
          <div>PRODUCT</div>
          <div class="text-center">QTY</div>
          <div class="text-center">SUBTOTAL</div>
          <div></div>
        </div>
        <div class="grow overflow-y-auto min-h-[300px] show-scrollbar relative pl-4 -ml-4">
          <div class="absolute inset-0 left-4 divide-y">
            <div
                class="py-8"
                v-for="item in cartList"
                :key="item?.id"
            >
              <cart-item
                  class="cursor-pointer"
                  :data="item"
                  @click="handleShowModalAddCart(item)"
                  @delete="handleDeleteCartItem"
              />
            </div>
          </div>
        </div>
        <div class="shrink-0 flex items-center justify-between py-7 gap-7 border-t">
          <router-link :to="{name: 'order'}"
                       class="text-secondary text-32px font-bold inline-flex items-center gap-4">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                  d="M30 55C43.8071 55 55 43.8071 55 30C55 16.1929 43.8071 5 30 5C16.1929 5 5 16.1929 5 30C5 43.8071 16.1929 55 30 55Z"
                  stroke="#FF7731" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M30 20V40" stroke="#FF7731" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M20 30H40" stroke="#FF7731" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Add more
          </router-link>
          <div class="flex items-center gap-4">
            <div class="relative pr-6">
              <img src="@/assets/images/icon-cart.svg" alt="">
              <div
                  class="absolute -top-1/2 right-0 min-w-[36px] h-[36px] bg-primary text-white rounded-full text-24px font-semibold text-center"
              >
                {{ cartQuantity }}
              </div>
            </div>
            <p class="text-40px font-medium">Total: <strong>{{ FormatHelper.formatShownPrice(priceTotal) }}</strong></p>
          </div>
        </div>
      </template>
      <div class="shrink-0 text-center !pt-[84px] border-t">
        <button
            type="button"
            class="btn btn-success w-[430px]"
            @click="router.push({name: 'payment-method'})"
            :disabled="isCartEmpty"
        >
          PAY
        </button>
      </div>
    </div>
  </layout>
</template>

<script setup lang="ts">
import Layout from "./Layout.vue";
import CartItem from "./CartItem.vue";
import {computed} from "vue";
import {useOrderStore} from "@/stores/order";
import type {CategoryItem} from "@/stores/order";
import {useRouter} from "vue-router";
import FormatHelper from "@/utils/formatHelper";

const router = useRouter();
const orderStore = useOrderStore();

const cartList = computed(() => orderStore.cartList);
const cartQuantity = computed(() => (orderStore as any).cartQuantity);
const isCartEmpty = computed(() => (orderStore as any).isCartEmpty);
const priceTotal = computed(() => (orderStore as any).priceTotal);

const handleShowModalAddCart = (data: CategoryItem) => {
  orderStore.showModalAddCart(data)
}
const handleDeleteCartItem = async (cart_id: number) => {
  orderStore.deleteCartItem(cart_id);
}
</script>

<style scoped>

</style>