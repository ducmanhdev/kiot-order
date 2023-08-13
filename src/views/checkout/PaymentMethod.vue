<template>
  <layout
      title="Payment method"
  >
    <div class="p-[60px] text-center">
      <p class="text-40px font-bold text-gray3">TOTAL</p>
      <p class="text-60px font-bold text-secondary">{{ FormatHelper.formatShownPrice(priceTotal) }}</p>
      <div class="border-t mt-2 mb-[60px] w-[308px] mx-auto border-[#1D1D1D]"></div>
      <p class="text-center text-46px font-semibold mb-[60px]">How do you prefer to proceed with <br>the payment?</p>
      <div class="flex justify-center gap-[60px]">
        <div
            v-for="(method, key) in PAYMENT_METHODS"
            :key="key"
            class="shadow-[1px_1px_10px_0_rgba(0,0,0,0.15)] w-[234px] min-h-[234px] p-10 text-center flex flex-col justify-center items-center rounded-[24px] cursor-pointer"
            @click="handleChangePaymentMethod(method.value)"
            :class="{
                    'bg-primary text-white': paymentMethod === method.value,
                    'bg-white text-black': paymentMethod !== method.value,
                  }"
        >
          <img
              :src="getImageUrl(method.icon)" alt=""
              class="block mb-4"
              :class="{'brightness-0 invert': paymentMethod === method.value}"
          >
          <p class="text-36px font-bold">{{ method.label }}</p>
        </div>
      </div>
      <button
          type="button"
          class="btn btn-success mt-[100px] w-[430px]"
          @click="handleCheckout"
          :disabled="isCheckoutLoading || isCartEmpty"
      >
        <span class="loading loading-spinner" v-if="isCheckoutLoading"></span>
        COMPLETE
      </button>
    </div>

    <modal-checkout-loading ref="modalCheckoutLoadingRef"/>
    <modal-checkout-success ref="modalCheckoutSuccessRef" @after-close="handleAfterModalCheckoutSuccessClose"/>
    <modal-checkout-failed ref="modalCheckoutFailedRef" @after-close="handleAfterModalCheckoutFailedClose"/>
  </layout>
</template>

<script setup lang="ts">
import Layout from "./Layout.vue";
import {useOrderStore} from "@/stores/order";
import {computed, ref} from "vue";
import handleError from "@/utils/error";
import {useConnectStore} from "@/stores/connect";
import {useRouter} from "vue-router";
import {printReceipt} from "@/utils/print";
import ModalCheckoutLoading from "@/views/checkout/ModalCheckoutLoading.vue";
import ModalCheckoutSuccess from "@/views/checkout/ModalCheckoutSuccess.vue";
import ModalCheckoutFailed from "@/views/checkout/ModalCheckoutFailed.vue";
import FormatHelper from "@/utils/formatHelper";
import {getImageUrl} from "@/utils/path";

const router = useRouter();
const orderStore = useOrderStore();
const connectStore = useConnectStore();

const PAYMENT_METHODS = {
  CASH: {
    icon: 'icon-cash.svg',
    label: 'Cash',
    value: 'cash',
  },
  CREDIT_CARD: {
    icon: 'icon-card.svg',
    label: 'Credit',
    value: 'credit_card',
  }
} as const;

const isPaxConnected = computed(() => connectStore.isPaxConnected);
const isCartEmpty = computed(() => (orderStore as any).isCartEmpty);
const priceTotal = computed(() => (orderStore as any).priceTotal);
const paymentMethod = computed({
  get() {
    return orderStore.paymentMethod;
  },
  set(newValue) {
    orderStore.paymentMethod = newValue;
  }
});
const handleChangePaymentMethod = (method: typeof paymentMethod.value) => {
  paymentMethod.value = method;
  // if (orderType.value === 'delivery' && method === 'credit_card') {
  //   handleAddCard();
  // }
}

const handleAfterModalCheckoutSuccessClose = () => {
  orderStore.clearCart();
  router.push({
    name: 'order',
  });
}

const handleAfterModalCheckoutFailedClose = () => {
  router.push({
    name: 'overview',
  });
}

const handleCheckCanPayment = () => {
  if (paymentMethod.value === 'credit_card' && !isPaxConnected.value) {
    throw new Error('No Pax connected yet. Please back to order and config.')
  }
}

const isCheckoutLoading = ref(false);
const handleCheckout = async () => {
  try {
    handleCheckCanPayment();
    isCheckoutLoading.value = true;
    const checkoutRes: any = await orderStore.checkout();
    const orderID = checkoutRes?.data?.result?.data?.id;
    try {
      if (paymentMethod.value === 'credit_card') {
        modalCheckoutLoadingRef.value?.show();
        const response = await connectStore.pax?.doSales({
          amount: priceTotal.value * 100,
          orderID: orderID,
          tips: 0,
        });
        await orderStore.updatePaymentData({
          order_id: orderID,
          payment_action: "SALE_RESPONSE",
          data: {
            amount: priceTotal.value,
            responseCode: response?.responseCode!,
            ...response
          }
        });
        modalCheckoutLoadingRef.value?.hide();
        if (response?.responseMessage !== 'OK') {
          throw new Error('Pax payment failed!')
        }
        orderStore.clearOrderFailedId();
      }
    } catch (error) {
      orderStore.setOrderFailedId(orderID);
      modalCheckoutFailedRef.value?.show();
      isCheckoutLoading.value = false;
      return;
    }

    modalCheckoutSuccessRef.value?.show();
    await printReceipt(orderStore.cartList, checkoutRes?.data?.result?.data);
  } catch (error) {
    handleError({error});
  } finally {
    isCheckoutLoading.value = false;
  }
};

const modalCheckoutLoadingRef = ref<InstanceType<typeof ModalCheckoutLoading> | null>(null);
const modalCheckoutSuccessRef = ref<InstanceType<typeof ModalCheckoutSuccess> | null>(null);
const modalCheckoutFailedRef = ref<InstanceType<typeof ModalCheckoutFailed> | null>(null);
</script>

<style scoped>

</style>