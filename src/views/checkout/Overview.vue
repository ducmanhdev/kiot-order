<template>
  <layout title="Overview" :back-route="{name: 'order'}">
    <div class="p-10 2xl:px-[100px] min-h-full flex flex-col">
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
          <router-link :to="{name: 'order'}" class="text-secondary text-28px 2xl:text-32px font-bold inline-flex items-center gap-4">
            <img class="w-[44px] 2xl:w-[60px]" src="@/assets/images/icon-add-more.svg" alt="">
            Add more
          </router-link>
          <div class="w-[400px] text-28px 2xl:text-32px font-medium">
            <div class="flex justify-between gap-4">Quantity: <strong>{{ cartQuantity }}</strong></div>
            <div class="flex justify-between gap-4">Subtotal: <strong>{{FormatHelper.formatShownPrice(priceSubtotal)}}</strong></div>
            <div class="flex justify-between gap-4">Tax: <strong>{{
                  FormatHelper.formatShownPrice(tax)
                }}</strong></div>
            <div class="flex justify-between gap-4">Total: <strong>{{ FormatHelper.formatShownPrice(priceTotal)}}</strong></div>
          </div>
        </div>
      </template>
      <div class="shrink-0 text-center pt-10 2xl:pt-[84px] border-t">
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
const priceSubtotal = computed(() => (orderStore as any).priceSubtotal);
const tax = computed(() => (orderStore as any).tax);

const handleShowModalAddCart = (data: CategoryItem) => {
  orderStore.showModalAddCart(data)
}
const handleDeleteCartItem = async (cart_id: number) => {
  orderStore.deleteCartItem(cart_id);
}
</script>

<style scoped>

</style>