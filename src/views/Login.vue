<template>
  <div class="login">
    <div class="login__inside">
      <div class="login__left">
        <div class="w-[306px]">
          <div class="login__left__title">
            <p class="text-[40px] font-semibold m-0">Welcome to</p>
            <p class="text-[64px] font-bold m-0">Go Order</p>
            <p class="mb-0">Login your account</p>
          </div>
          <div class="login__left__form">
            <form @submit.prevent="handleLogin" class="form__login">
              <div class="form__login__item">
                <p class="text__title">ID</p>
                <input type="text" v-model="form.id" placeholder="Enter your ID" @input="checkInputRequired"/>
                <p class="text__error" v-if="idRequired">ID is required</p>
              </div>
              <div class="form__login__item">
                <p class="text__title">Username</p>
                <input type="text" v-model="form.username" placeholder="Enter your user" @input="checkInputRequired"/>
                <p class="text__error" v-if="usernameRequired">Username is required</p>
              </div>
              <div class="form__login__item">
                <p class="text__title">Password</p>
                <div class="relative">
                  <input type="password" v-model="form.password" placeholder="Enter your password" v-if="showPassword" @input="checkInputRequired"/>
                  <input type="text" v-model="form.password" placeholder="Enter your password" v-else @input="checkInputRequired"/>
                  <p class="btn__show__pass" @click="handleShowPassword">
                    <img src="@/assets/images/icon-eye.svg" alt="" v-if="showPassword">
                    <img src="@/assets/images/icon-eye-off.svg" alt="" v-else>
                  </p>
                </div>
                <p class="text__error" v-if="passwordRequired">Password is required</p>
              </div>
              <div class="form__login__item flex items-center">
                <input type="checkbox" v-model="form.remember_me" class="custom__checkbox"/>
                <span>Remember me</span>
              </div>
              <button type="submit" class="btn__submit" @click="handleLogin" :disabled="isLoginLoading">{{ isLoginLoading ? 'LOGGING...' : 'LOGIN' }}</button>
            </form>
          </div>
        </div>
      </div>
      <div class="login__right bg-[url('@/assets/images/bg-color.png')] bg-cover">
        <img src="@/assets/images/bg-login.png" alt=""/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {useAuthStore} from "@/stores/auth";
import {useRouter} from "vue-router";
import notification from "@/utils/notification";

const router = useRouter();
const authStore = useAuthStore();

interface Form {
  id: string,
  username: string;
  password: string;
  remember_me: boolean,
}

const form = ref<Form>({
  id: "",
  username: "",
  password: "",
  remember_me: false,
});

const showPassword = ref(true);
const idRequired = ref(false)
const usernameRequired = ref(false)
const passwordRequired = ref(false)

const handleShowPassword = () => {
  showPassword.value = !showPassword.value
}

const checkInputRequired = () => {
  if (!form.value.id.length) {
    idRequired.value = true;
  } else {
    idRequired.value = false;
  }
  if (!form.value.username.length) {
    usernameRequired.value = true;
  } else {
    usernameRequired.value = false;
  }
  if (!form.value.password.length) {
    passwordRequired.value = true;
  } else {
    passwordRequired.value = false;
  }
}

const isLoginLoading = ref(false);
const handleLogin = async () => {
  try {
    await checkInputRequired()
    if (idRequired.value && usernameRequired.value && passwordRequired.value) return
    isLoginLoading.value = true;
    const dnsInfoResponse = await authStore.getDnsInfo({
      id: form.value.id,
      type: 'new',
      remember_me: form.value.remember_me,
    });
    await authStore.login({
      username: form.value.username,
      password: form.value.password,
      g_client_id: form.value.id,
      domain: (dnsInfoResponse as any).domain,
      remember_me: form.value.remember_me,
    });
    await router.push({name: 'home'});
  } catch (error: any) {
    notification.error({ message: 'ID or Username or Password is incorrect!' })
  } finally {
    isLoginLoading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.login {
  --breakpoint: 640px;
  height: 100%;
  // min-height: 100vh;
  // min-height: calc(100 * var(--vh));
  display: flex;
  align-items: center;
  justify-content: center;
  @media (max-width: 640px) {
    display: block;
    background-size: 40%, 84%;
  }

  &__inside {
    height: 100%;
    display: grid;
    grid-template-columns: 4fr 6fr;
    // justify-items: flex-end;
    // padding: 5rem 2rem;
    width: 100%;
    // max-width: 1688px;
    gap: 2rem;
    align-items: center;
    @media (max-width: 640px) {
      grid-template-columns: 1fr;
      justify-items: initial;
    }
  }

  &__left {
    // width: 306px;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    @media (max-width: 640px) {
      width: 100%;
    }

    &__title {
      margin-bottom: 2.5rem;
      line-height: 60px;
      @media (max-width: 640px) {
        text-align: center;
        margin-bottom: 1.25rem;
      }
    }
  }

  &__right {
    height: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    img {
      display: block;
      width: 820px;
      max-width: 100%;
    }
  }
}
.form__login{
  &__item{
    margin-bottom: 16px;
    .text__title{
        font-weight: 600;
    }

    .btn__show__pass{
      cursor: pointer;
      position: absolute;
      top: 45%;
      right: 12px;
    }
    input{
      height: 40px;
      border-radius: 8px;
      border: 1px solid var(--Gray-5, #E0E0E0);
      margin-top: 10px;
      width: 100%;
      font-size: 14px;
    }
    .text__error{
      font-size: 12px;
      font-style: italic;
      color: var(--error);
    }
    .custom__checkbox{
      width: 20px;
      height: 20px;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 0;
      margin-right: 6px;

      &:focus{
        --tw-ring-shadow: none;
      }

      &[type='checkbox']{
        color: var(--primary);
      }
    }
  }
  .btn__submit{
    background-color: var(--primary);
    color: var(--white);
    font-size: 18px;
    height: 46px;
    width: 100%;
    border-radius: 8px;
    font-weight: 600;
    margin-top: 20px;
    &:disabled{
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}
</style>
