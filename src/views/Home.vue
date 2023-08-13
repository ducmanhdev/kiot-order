<template>
    <!-- <div class="home-page flex-center flex-col w-full h-full relative bg-[#FFFCF3]"> -->
    <div class="home-page flex-center flex-col w-full h-full relative bg-[#df3f0012] pb-[120px]">
        <!-- <img class="absolute inset-0 w-full h-full z-[0]" src="@/assets/images/home/background.png" alt=""> -->
        <img class="absolute left-[100px] bottom-[145px] opacity-[0.04] z-[0] shape-1" src="@/assets/images/home/hero-shape-1.png" alt="">
        <img class="absolute right-[55px] bottom-[85px] opacity-[0.04] z-[0] shape-2" src="@/assets/images/home/hero-shape-2.png" alt="">
        <!-- <img class="absolute z-[0] line-1" src="@/assets/images/home/line-1.png" alt=""> -->
        <img class="w-[120px] h-[120px] lg:w-[158px]  lg:h-[158px]" src="@/assets/images/home/logo.png" alt="">
        <p class="text-[60px] lg:text-[80px] text-[#103A6D] font-bold translate-y-[-30px]">GO ORDER</p>
        <p class="w-full text-[48px] lg:text-[64px] font-bold text-center px-10 mb-10 z-[10]">Where will you be eating today?</p>
        <div class="flex-center z-[10]">
            <template v-for="item in btnList" :key="item.id">
                <button class="flex-center flex-col bg-[#fff] mr-8 btn" :class="{'active': item.active}" @click.prevent="handleClick(item.id)" @touchstart.prevent="handleClick(item.id)">
                    <img class="w-[80px] h-[80px] pointer-events-none mb-[18px]" :src="item.icon" alt="">
                    <p class="text-36px font-semibold pointer-events-none">{{  item.label }}</p>
                </button>
            </template>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';

// ICON
// import icon1 from '@/assets/images/home/cutlery.svg'
// import icon2 from '@/assets/images/home/bike.svg'
import icon1 from '@/assets/images/home/images1.png'
import icon2 from '@/assets/images/home/images.png'
import icon3 from '@/assets/images/home/menu-3.png'

import { useRouter } from 'vue-router';

const router = useRouter();

const touch = ref(false);
const btnList = ref([
    {id: 0, label: 'Eating', active: false, icon: icon1},
    {id: 1, label: 'Take away', active: false, icon: icon2},
])
const handleClick = (id: number) => {
    btnList.value[id].active = true;
    setTimeout(() => {
        btnList.value[id].active = false;
    }, 250);
    setTimeout(() => {
        // btnList.value[id].active = false;
        router.push({name: 'order'})
    }, 100);
}
</script>

<style lang="scss" scoped>
.home-page{
    .btn{
        width: 292px;
        height: 292px;
        border-radius: 24px;
        background: #FFF;
        box-shadow: 1px 1px 10px 0px rgba(0, 0, 0, 0.15);
        transition: 0.25s ease-out;
        animation: none;

        &.active {
            animation: button-pop 0.25s ease-out !important;
            box-shadow: 0px 0px 1px 0px rgba(0, 0, 0, 0.05) !important;
            // box-shadow: none;
            // transition: box-shadow 0.25s ease-out;
            // transition-delay: 0.1s;
        }
        // transform: scale(var(--btn-focus-scale, 0.97));
    }
    .shape-1{
        width: 30%;
    }
    .shape-2{
        width: 30%;
    }
    .line-1{
        width: 35%;
        top: 60%;
        transform: translateY(-60%);
        right: 55px;
    }
    @media (min-width: 1990px) {
        .btn{
            width: 292px;
            height: 292px;
        }
    }
}
</style>