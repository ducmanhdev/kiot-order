<template>
  <div class="quantity" :class="{'quantity--sm': small}">
    <div
        role="button"
        class="quantity__btn"
        @click.prevent="handleDecrement"
        :class="{
          'disabled': min && counter <= min,
        }"
    >
      <img src="@/assets/images/icon-minus.svg" alt="">
    </div>
    <input
        type="number"
        class="quantity__input"
        v-model.number="counter"
        v-input-number="{min, max}"
        disabled
    >
    <div
        role="button"
        class="quantity__btn"
        @click.prevent="handleIncrement"
        :class="{
          'disabled': max && counter >= max,
        }"
    >
      <img src="@/assets/images/icon-plus.svg" alt="">
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

<style lang="scss" scoped>
.quantity {
  --btn-size: 60px;
  --btn-radius: 14px;
  --btn-shadow: 1px 1px 8px 0 #00000040;
  --input-font-size: 24px;
  display: flex;
  width: 214px;
  height: var(--btn-size);

  &--sm {
    width: 140px;
    --btn-size: 40px;
    --btn-radius: 10px;
    --btn-shadow: 1px 1px 6px 0 #00000040;
    --input-font-size: 16px;
  }

  &__btn {
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: var(--btn-shadow);
    width: var(--btn-size);
    height: var(--btn-size);
    border-radius: var(--btn-radius);
    background-color: #fff;
    color: #000;

    &.disabled {
      pointer-events: none;
      //opacity: 0.5;
    }

    > img {
      display: block;
      width: 50%;
    }
  }

  &__input {
    width: calc(100% - var(--btn-size) * 2);
    padding: 4px;
    border: 0;
    background-color: transparent;
    outline: none;
    appearance: none;
    text-align: center;
    font-weight: 600;
    font-size: var(--input-font-size);
    -moz-appearance: textfield;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }
}
</style>