<template>
  <div class="cursor-pointer">
    <div
        class="border-2 border-transparent bg-white shadow-[1px_1px_8px_0_rgba(0,0,0,0.15)] rounded-[24px] mb-4 relative aspect-square"
        :class="{'!border-secondary': countInCart > 0}"
    >
      <img class="w-full h-full object-cover rounded-[24px]" :src="data.image" alt="" v-if="data.image">
      <img class="w-full h-full object-cover rounded-[24px]" src="@/assets/images/order/food-empty.png" alt="" v-else>
      <div
          class="absolute top-2.5 right-2.5 w-[54px] h-[54px] bg-secondary text-white text-24px font-bold rounded-full flex-center"
          v-if="countInCart > 0"
      >
        {{ countInCart }}
      </div>
    </div>
    <div class="flex gap-4">
      <p class="grow text-24px font-medium">{{ data.name }}</p>
      <div class="shrink-0 text-right">
        <p class="text-24px text-primary font-semibold">{{ FormatHelper.formatShownPrice(price) }}</p>
        <del class="text-20px text-gray3 font-medium line-through mt-1" v-if="priceBefore && priceBefore < price">
          {{ FormatHelper.formatShownPrice(priceBefore) }}
        </del>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed} from 'vue';
import FormatHelper from '@/utils/formatHelper';
import {useOrderStore} from "@/stores/order";
import type {CartItem, CategoryItem} from "@/stores/order";

interface Props {
  data: CategoryItem,
}

const props = defineProps<Props>();

const orderStore = useOrderStore();

const countInCart = computed(() => {
  return (orderStore.cartList || [])
      .filter((item: CartItem) => item.id === props.data?.id)
      .reduce((total: number, item: CartItem) => total + (item?.quantity || 1), 0);
});

const price = computed(() => {
  if (props.data && props.data.item_variants.length) {
    return props.data.item_variants[0].price || 0;
  }
  return 0;
});
const priceBefore = computed(() => {
  if (props.data?.item_variants?.length) {
    return props.data.item_variants[0]?.price_before_discount || 0;
  }
  return 0;
});
</script>

<style lang="scss" scoped>
</style>