<template>
  <modal-base
      ref="modalRef"
      title="Details"
      :width="1660"
      :height="1000"
  >
    <div class="p-[60px] min-h-full">
      <div v-if="data && Object.keys(data).length" class="flex h-full">
        <div class="shrink-0 w-[340px] 2xl:w-[400px]">
          <div
              class="mb-4 aspect-square bg-white shadow-[1px_1px_12px_0_rgba(0,0,0,0.25)] rounded-[24px] overflow-hidden">
            <img :src="data.image" alt="" class="w-full h-full object-cover" v-if="data.image"/>
            <img src="@/assets/images/order/food-empty.png" alt="" class="w-full h-full object-cover" v-else/>
          </div>
          <p class="text-24px font-semibold mb-1">{{ data.name }}</p>
          <div class="">
            <span class="text-32px text-primary font-semibold mr-3">{{ FormatHelper.formatShownPrice(price) }}</span>
            <!--          <del class="text-24px text-gray3 font-medium">{{ FormatHelper.formatShownPrice(priceBeforeDiscount) }}</del>-->
          </div>
        </div>
        <div class="grow ml-[60px] 2xl:ml-[110px] relative">
          <div class="absolute inset-0 overflow-y-auto px-4 -mx-4 space-y-8">
            <div>
              <checkbox-group
                  ref="checkboxGroupRefs"
                  class="-m-4 p-4"
                  title="Please select"
                  :multiple="false"
                  required
                  :options="data.item_variants"
                  v-model="data.item_variant"
              />
            </div>
            <div
                v-for="item in modifierDataFiltered"
                :key="item.id"
            >
              <checkbox-group
                  ref="checkboxGroupRefs"
                  class="-m-4 p-4"
                  :title="item.modifier_name"
                  :multiple="item.type === 'multi'"
                  :required="item.required"
                  :options="item.details"
                  :model-value="item.value"
                  @update:model-value="(newValue) => item.value = [newValue].flat()"
              />
            </div>
            <div>
              <p class="text-32px font-semibold mb-4">Note:</p>
              <textarea
                  class="w-full block border-2 border-gray4 h-[140px] textarea textarea-bordered resize-none"
                  v-model="data.note"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-24px font-bold text-center">
        Something went wrong, please try again!
      </div>
    </div>
    <template #footer>
      <div class="flex justify-center gap-x-10 2xl:gap-x-[80px] gap-y-6">
        <input-quantity
            v-if="data?.quantity"
            v-model="data.quantity"
            class="w-[245px]"
        />
        <button type="button" class="btn btn-success w-[520px]" @click="handleAddCart">
          ADD TO CART - Total: {{ FormatHelper.formatShownPrice(price) }}
        </button>
      </div>
    </template>
  </modal-base>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue';
import ModalBase from '@/components/modal/ModalBase.vue';
import InputQuantity from "@/components/InputQuantity.vue";
import CheckboxGroup from "@/components/CheckboxGroup.vue";
import FormatHelper from '@/utils/formatHelper';
import handleError from '@/utils/error';
import {useOrderStore} from "@/stores/order";
import type {CategoryItem} from "@/stores/order";

const orderStore = useOrderStore();

const data = ref<CategoryItem & { note: string } | null>(null);

const modifierDataFiltered = computed(() => (data.value?.modifier || []).filter(item => item?.is_selected));

const getPrice = (key: 'price' | 'price_before_discount') => {
  if (!data.value) return 0;
  const initPrice = data.value?.item_variant && data.value.item_variant[key] ? data.value?.item_variant[key]! : 0;
  const price = modifierDataFiltered.value.reduce((total, element: any) => {
    total += ([element.value] || []).flat().reduce((_total: number, _element: any) => _total = Number(_element?.price) || 0, 0);
    return total;
  }, initPrice);
  return price * data.value?.quantity!;
}

const price = computed(() => getPrice('price'));

const checkboxGroupRefs = ref<InstanceType<typeof CheckboxGroup>[] | null>(null);
const handleValidateAddCart = async () => {
  let results = await Promise.allSettled(checkboxGroupRefs.value?.map(group => group?.validate()) || []);
  results = results.filter(result => result.status === 'rejected');
  if (!results.length) return true;
  results.forEach(result => {
    if (!("reason" in result)) return;
    handleError({
      error: result.reason
    });
  });
  const invalidGroup = checkboxGroupRefs.value?.find(item => item.isInvalid);
  invalidGroup?.$el?.scrollIntoView({
    behavior: 'smooth'
  });
  return false;
}
const handleAddCart = async () => {
  const isValid = await handleValidateAddCart();
  if (!isValid) return;
  orderStore.addCartItem(data.value);
  hide();
}

const modalRef = ref<InstanceType<typeof ModalBase> | null>(null);
const show = (value: CategoryItem) => {
  try {
    if (!value) {
      throw new Error('Param value not found!')
    }

    const modifier = (value.modifier || []).map(({value, ...item}) => ({...item}));
    data.value = {
      ...value,
      quantity: 1,
      item_variant: value.item_variants[0],
      modifier: modifier,
      note: '',
    };
  } catch (error) {
    handleError({error});
    data.value = null;
  } finally {
    modalRef.value?.show();
  }
}
const hide = () => {
  modalRef.value?.hide();
}

defineExpose({show, hide});
</script>

<style lang="scss" scoped>
</style>
  