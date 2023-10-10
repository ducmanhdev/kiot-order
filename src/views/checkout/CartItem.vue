<template>
  <div class="grid grid-cols-[90px_1fr_210px_210px_40px] gap-7 items-start cursor-pointer">
    <div class="w-[90px] aspect-square rounded-[10px] overflow-hidden shadow-[1px_1px_8px_0_rgba(0,0,0,0.15)] bg-white flex items-center justify-center">
      <img :src="data?.image" alt="" class="w-ful h-full object-contain" v-if="data?.image">
      <img src="@/assets/images/order/food-empty.png" alt="" class="w-ful h-full object-contain" v-else>
    </div>
    <div class="text-24px">
      <h5 class="text-28px 2xl:text-32px font-medium mb-1">{{ data?.name }}</h5>
      <p class="mb-2">
        <span class="font-semibold mr-2">{{ FormatHelper.formatShownPrice(data?.price) }}</span>
      </p>
      <div class="space-y-0.5 italic">
        <p>{{ data?.item_variant?.name }}</p>
        <template v-for="item in data.modifier" :key="item?.value?.id">
          <template v-for="value in item.value" :key="value.id">
            <p v-if="value.name">{{ item?.modifier_name }}: {{ value.name }}</p>
          </template>
        </template>
        <p v-if="data?.note" class="font-medium">
          <span class="font-semibold">Note: </span>
          {{ data?.note }}
        </p>
      </div>
    </div>
    <input-quantity v-model="quantity" @click.stop/>
    <p class="text-28px 2xl:text-32px font-semibold min-h-[60px] flex items-center justify-center text-center">
      {{ FormatHelper.formatShownPrice(priceTotalOfCartItem) }}
    </p>
    <button class="shrink-0 min-h-[60px]" @click.stop="handleDelete">
      <img class="w-[40px] h-auto" src="@/assets/images/icon-x-circle.svg" alt="">
    </button>
  </div>
</template>

<script lang="ts" setup>
import {computed} from "vue";
import InputQuantity from "@/components/InputQuantity.vue";
import FormatHelper from "@/utils/formatHelper";
import {useOrderStore} from "@/stores/order";
import type {CartItem} from "@/stores/order";

const orderStore = useOrderStore();

interface Props {
  data: CartItem;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'delete', cartId: number): void,
}

const emits = defineEmits<Emits>();

const quantity = computed({
  get() {
    return props.data?.quantity ?? 1;
  },
  set(newQuantity) {
    orderStore.setCartItemQuantity(props.data.cart_id, newQuantity!);
  }
});

const handleDelete = () => {
  emits('delete', props.data.cart_id);
};
// const priceSubTotalOfCartItem = computed(() => (orderStore as any).priceSubTotalOfCartItem(props.data?.cart_id));
const priceTotalOfCartItem = computed(() => (orderStore as any).priceTotalOfCartItem(props.data?.cart_id));
</script>

<style lang="scss" scoped>

</style>