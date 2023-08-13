<template>
  <div class="flex items-center" :class="{'w-[140px]': small}">
    <div
        role="button"
        class="btn btn-white btn-square shadow-[1px_1px_6px_0_rgba(0,0,0,0.25)]"
        @click.prevent="handleDecrement"
        :class="{
          'pointer-events-none': counter <= min,
          'w-10 h-10 min-h-[40px]': small
        }"
    >
      <img src="@/assets/images/icon-minus.svg" alt="" :class="{'w-5': small }">
    </div>
    <input
        type="text"
        class="w-[calc(100%-60px*2)] input input-ghost bg-transparent text-center text-26px font-bold border-0 focus:!shadow-[none] focus:outline-0 px-4"
        :class="{
           '!w-[calc(100%-40px*2)] !h-10 !text-16px !px-1': small,
        }"
        :min="min"
        :max="max"
        v-model.number="counter"
        v-input-number="{min, max}"
    >
    <div
        role="button"
        class="btn btn-white btn-square shadow-[1px_1px_6px_0_rgba(0,0,0,0.25)]"
        @click.prevent="handleIncrement"
        :class="{
          'pointer-events-none': max && counter >= max,
          'w-10 h-10 min-h-[40px]': small
        }"
    >
      <img src="@/assets/images/icon-plus.svg" alt="" :class="{'w-5': small }">
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, watch} from "vue";

interface Emit {
  (e: 'update:modelValue', newValue: number): void
}

const emit = defineEmits<Emit>();

interface Props {
  modelValue: number,
  min?: number,
  max?: number,
  small?: boolean
}

const props = withDefaults(
    defineProps<Props>(),
    {
      min: 1,
      small: false,
    }
)

watch(() => props.max, (newMaxValue) => {
  if (newMaxValue && counter.value > newMaxValue) {
    counter.value = newMaxValue;
  }
})

const counter = computed({
  get() {
    return props.modelValue || 1;
  },
  set(newValue) {
    let finalValue;
    if (props.min && newValue < props.min) {
      finalValue = props.min;
    } else if (props.max && newValue > props.max) {
      finalValue = props.max;
    } else {
      finalValue = newValue;
    }
    emit('update:modelValue', finalValue);
  }
});
const handleDecrement = () => {
  counter.value -= 1;
}
const handleIncrement = () => {
  counter.value += 1;
}
</script>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
}
</style>