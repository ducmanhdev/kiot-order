<template>
  <div
      class="p-4 rounded-xl border-2 border-transparent"
      :class="{
        '!border-error': isInvalid,
      }"
  >
    <p class="text-28px lg:text-32px font-semibold mb-4">
      {{ title }}
      <span class="text-error" v-if="required">*</span>
    </p>
    <div class="space-y-4">
      <label
          class="text-24px font-medium flex justify-between gap-4"
          v-for="option in options"
          :key="option.id"
      >
        <span class="flex cursor-pointer gap-4">
          <input v-bind="inputOptions" :value="option" v-model="value"/>
          <span class="">{{ option[labelKey] }}</span>
        </span>
        <span class="text-right text-gray3">+{{FormatHelper.formatShownPrice(option[priceKey])}}</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, ref} from "vue";
import FormatHelper from "@/utils/formatHelper";

interface Props {
  modelValue: any;
  options: any[];
  title: string;
  labelKey?: string;
  priceKey?: string;
  multiple?: boolean;
  required?: boolean;
  autoSelect?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: [],
  labelKey: 'name',
  priceKey: 'price',
  multiple: true,
  required: false,
  autoSelect: false,
})

interface Emits {
  (e: 'update:modelValue', newValue: any): void;
}

const emits = defineEmits<Emits>();

const value = computed({
  get() {
    return !props.multiple && Array.isArray(props.modelValue) ? props.modelValue[0] : props.modelValue;
  },
  set(newValue) {
    emits('update:modelValue', newValue);
  }
}, {
  onTrigger() {
    isInvalid.value = false;
  }
});

const inputOptions = computed(() => {
  if (props.multiple) {
    return {
      type: "checkbox",
      class: "checkbox checkbox-primary"
    }
  }
  return {
    type: "radio",
    class: "radio radio-primary"
  }
});

const isInvalid = ref(false);
const validate = () => {
  isInvalid.value = false;
  return new Promise((resolve, reject) => {
    const isMultipleValueInvalid = props.multiple && !value.value.length;
    const isSingleValueInvalid = !props.multiple && !value.value;
    if (props.required && (isMultipleValueInvalid || isSingleValueInvalid)) {
      isInvalid.value = true;
      reject(new Error(`${props.title} is required!`));
    }
    resolve(true);
  })
}
defineExpose({
  validate,
  isInvalid
})
</script>

<style scoped>

</style>