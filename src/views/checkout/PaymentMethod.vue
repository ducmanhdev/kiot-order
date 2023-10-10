<template>
  <layout title="Payment method">
    <div class="p-10 2xl:p-[60px] text-center">
      <p class="text-36px 2xl:text-40px font-bold text-gray3">TOTAL</p>
      <p class="text-50px 2xl:text-60px font-bold text-secondary">{{ FormatHelper.formatShownPrice(priceTotal) }}</p>
      <div class="border-t mt-2 mb-8 2xl:mb-[60px] w-[308px] mx-auto border-[#1D1D1D]"></div>
      <p class="text-center text-40px 2xl:text-46px font-semibold mb-8 2xl:mb-[60px]">How do you prefer to proceed with
        <br>the payment?</p>
      <div class="flex justify-center gap-10 2xl:gap-[60px]">
        <div
            v-for="(method, key) in PAYMENT_METHODS"
            :key="key"
            class="shadow-[1px_1px_10px_0_rgba(0,0,0,0.15)] w-[200px] 2xl:w-[234px] min-h-[200px] 2xl:min-h-[234px] p-10 text-center flex flex-col justify-center items-center rounded-[24px] cursor-pointer"
            @click="handleChangePaymentMethod(method.value)"
            :class="{
                    'bg-primary text-white': paymentMethod === method.value,
                    'bg-white text-black': paymentMethod !== method.value,
                  }"
        >
          <img
              :src="getImageUrl(method.icon)" alt=""
              class="block mb-2 2xl:mb-4"
              :class="{'brightness-0 invert': paymentMethod === method.value}"
          >
          <p class="text-32px 2xl:text-36px font-bold">{{ method.label }}</p>
        </div>
      </div>
      <button
          type="button"
          class="btn btn-success mt-10 2xl:mt-[100px] w-[430px]"
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
import {useConnectStore} from "@/stores/connect";
import {useRouter} from "vue-router";
import ModalCheckoutLoading from "@/views/checkout/ModalCheckoutLoading.vue";
import ModalCheckoutSuccess from "@/views/checkout/ModalCheckoutSuccess.vue";
import ModalCheckoutFailed from "@/views/checkout/ModalCheckoutFailed.vue";
import FormatHelper from "@/utils/formatHelper";
import {getImageUrl} from "@/utils/path";
import {printReceipt} from "@/utils/prints/receipt"
import {printReceiptTemp} from "@/utils/prints/receiptTemp";
import {Gap} from 'gap-nodejs-sdk';
import {useBusinessStore} from "@/stores/business";
import {storeToRefs} from "pinia";
import {PAYMENT_TYPES} from "@/constant";
import notification from "@/utils/notification";

const router = useRouter();
const orderStore = useOrderStore();
const connectStore = useConnectStore();
const businessStore = useBusinessStore();

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
const businessSiteInfo = computed<any>(() => businessStore.businessSiteInfo);
const {orderDetail} = storeToRefs(orderStore);

orderStore.resetPaymentMethod();
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
  router.replace({
    name: 'home',
  });
}

const handleAfterModalCheckoutFailedClose = () => {
  router.replace({
    name: 'overview',
  });
}

const handlePrintReceipt = async (checkoutRes: any) => {
  try {
    await orderStore.getOrderDetail(checkoutRes?.data?.result?.data?.id);
    if (paymentMethod.value === 'credit_card') {
      await printReceipt(orderStore.cartList, checkoutRes?.data?.result?.data, businessSiteInfo.value, orderDetail.value)
    } else if (paymentMethod.value === 'cash') {
      await printReceiptTemp(orderStore.cartList, checkoutRes?.data?.result?.data, businessSiteInfo.value, orderDetail.value)
    }
  } catch (error) {
    console.error(error);
  }
}

const handleUpdatePaymentData = async (orderId: number, updatePaymentData: any) => {
  return orderStore.updatePaymentData({
    order_id: orderId,
    payment_id: updatePaymentData?.refID,
    payment_status: '',
    status: updatePaymentData?.status,
    data: updatePaymentData?.data,
    type: updatePaymentData?.data?.payment_type,
  });
}

const handleCheckAmountDue = async (orderId: number, paidResponse: any) => {
  if (Number(paidResponse.amountDue) === 0) return;
  await Gap.Payment?.doVoid?.({
    orderId: paidResponse.refID,
    paymentId: paidResponse.refID,
  });
  await handleUpdatePaymentData(orderId, paidResponse);
  throw new Error(`The remaining balance of this card ${FormatHelper.formatShownPrice((paidResponse?.approveAmount || 0) / 100)} is not enough for this transaction of ${FormatHelper.formatShownPrice(priceTotal.value)}. Your customer need to use another card or payment method`)
}

const handleRetrieve = async (orderId: number) => {
  try {
    const localDetailReportResponse = await Gap.Payment?.doRetrieve({refId: orderId});
    const isPaid = localDetailReportResponse?.statusMessage === 'OK';
    if (!isPaid) return false;
    await handleCheckAmountDue(orderId, localDetailReportResponse);
    await handleUpdatePaymentData(orderId, localDetailReportResponse);
    await orderStore.submitPaymentMethods({
      order_id: orderId,
      tax: (orderStore as any).tax,
      payment: [{
        type: PAYMENT_TYPES.CREDIT,
        total_paid: priceTotal.value,
      }],
    });
    return true;
  } catch (error) {
    return false;
  }
}

const handlePayCredit = async (orderId: number, amountAsCent: number) => {
  const doSaleResponse = await Gap.Payment?.doSale({
    amount: amountAsCent,
    refId: orderId,
    method: "sale",
    tipAmount: 0,
  });
  if (doSaleResponse?.statusMessage !== 'OK') {
    await handleUpdatePaymentData(orderId, doSaleResponse);
    throw new Error(`Pay with credit failed: ${doSaleResponse?.statusMessage}`)
  }
  await handleCheckAmountDue(orderId, doSaleResponse);
  await handleUpdatePaymentData(orderId, doSaleResponse);
}

const isCheckoutLoading = ref(false);
const handleCheckout = async () => {
  if (
      paymentMethod.value === 'credit_card' &&
      !isPaxConnected.value
  ) {
    return notification.error('No Pax connected yet. Please back to order and config.');
  }

  const amount = priceTotal.value;
  const CENTS_IN_DOLLAR = 100;
  const amountAsCent = Math.round(priceTotal.value * CENTS_IN_DOLLAR);
  let sessionOrderID: number;
  try {
    isCheckoutLoading.value = true;
    modalCheckoutLoadingRef.value?.show();

    const checkoutResponse: any = await orderStore.checkout();
    sessionOrderID = checkoutResponse?.data?.result?.data?.id;
    const isRetrieved = await handleRetrieve(sessionOrderID);
    if (!isRetrieved) {
      if (paymentMethod.value === 'credit_card') {
        await handlePayCredit(sessionOrderID, amountAsCent);
      }
      await orderStore.submitPaymentMethods({
        order_id: sessionOrderID,
        tax: (orderStore as any).tax,
        payment: [{
          type: paymentMethod.value === 'credit_card' ? PAYMENT_TYPES.CREDIT : PAYMENT_TYPES.CASH,
          total_paid: amount,
        }],
      });
    }

    orderStore.clearFailedOrder();
    modalCheckoutSuccessRef.value?.show();
    handlePrintReceipt(checkoutResponse);
  } catch (error) {
    orderStore.setFailedOrder(sessionOrderID!);
    modalCheckoutFailedRef.value?.show();
  } finally {
    isCheckoutLoading.value = false;
    modalCheckoutLoadingRef.value?.hide();
  }
};

const modalCheckoutLoadingRef = ref<InstanceType<typeof ModalCheckoutLoading> | null>(null);
const modalCheckoutSuccessRef = ref<InstanceType<typeof ModalCheckoutSuccess> | null>(null);
const modalCheckoutFailedRef = ref<InstanceType<typeof ModalCheckoutFailed> | null>(null);
</script>

<style scoped>

</style>