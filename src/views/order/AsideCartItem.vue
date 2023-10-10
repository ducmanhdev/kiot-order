<template>
  <div class="py-7">
    <div class="flex items-start">
      <div class="shrink-0 w-[90px] bg-white shadow-[1px_1px_8px_0_rgba(0,0,0,0.15)] rounded-[10px] overflow-hidden aspect-square">
        <img class="w-full h-full object-contain" :src="data.image" alt="" v-if="data.image">
        <img class="w-full h-full object-cover" src="@/assets/images/order/food-empty.png" alt="" v-else>
      </div>
      <div class="grow pl-4">
        <div class="flex">
          <div class="grow-1">
            <p class="text-24px font-medium w-break-words mb-2">{{ data.name }}</p>
          </div>
          <div class="shrink-0 text-24px font-semibold pl-4">{{ FormatHelper.formatShownPrice(price) }}</div>
          <div class="shrink-0 pl-2">
            <img src="@/assets/images/icon-x-circle.svg" alt="" class="block w-10 h-auto cursor-pointer" @click.stop="handleDelete">
          </div>
        </div>
        <input-quantity v-model="quantity" small @click.stop/>
        <div class="mt-4 text-20px space-y-1">
          <p>{{ data?.item_variant?.name }}</p>
          <template v-for="item in data.modifier" :key="item?.value?.id">
            <template v-for="value in item.value" :key="value.id">
              <p v-if="value.name">{{ item?.modifier_name }}: {{ value.name }}</p>
            </template>
          </template>
          <p v-if="data?.note" class="font-medium italic">
            <span class="font-semibold">Note: </span>
            {{ data?.note }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed} from "vue";
import type {CartItem} from "@/stores/order";
import InputQuantity from "@/components/InputQuantity.vue";
import {useOrderStore} from "@/stores/order";
import FormatHelper from "../../utils/formatHelper";

const orderStore = useOrderStore();

interface Props {
  data: CartItem
}

const props = defineProps<Props>();

interface Emits {
  (e: 'delete', cartId: number): void,
}

const emits = defineEmits<Emits>();
const handleDelete = () => {
  emits('delete', props.data.cart_id)
}

const quantity = computed({
  get() {
    return props.data.quantity ?? 1;
  },
  set(newQuantity) {
    orderStore.setCartItemQuantity(props.data.cart_id, newQuantity!);
  }
});
const price = computed(() => (orderStore as any).priceTotalOfCartItem(props.data.cart_id));
</script>

<style lang="scss" scoped>
</style>