import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import './styles/tailwind.scss';
import './styles/index.scss';

import App from './App.vue';
import router from './router';
import {inputNumber} from "@/directives";
import { vMaska } from "maska"

const app = createApp(App);

app.use(createPinia().use(piniaPluginPersistedstate))
app.use(router)

app.directive('maska', vMaska);
app.directive('input-number', inputNumber);

app.mount('#app')
