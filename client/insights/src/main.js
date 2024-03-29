import { createApp } from 'vue'
import App from './App.vue'
import InsightsCharts from './components/pages/insights/Insights.vue';
import HomePageVue from './components/pages/home-page/HomePage.vue'
import { createRouter, createWebHistory } from 'vue-router';
import PrimeVue from 'primevue/config';
import FileUpload from 'primevue/fileupload';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import ToastService from 'primevue/toastservice';
import Card from 'primevue/card';
import Sidebar from 'primevue/sidebar';
import Calendar from "primevue/calendar";


import 'primevue/resources/themes/lara-dark-green/theme.css'
import 'primeicons/primeicons.css'


const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', name: 'home', component: HomePageVue },
      { path: '/dashboard', name: 'Dashboard', component: InsightsCharts}
    ],
  });

const app = createApp(App);
app.use(PrimeVue)
app.use(FileUpload)
app.use(InputText)
app.use(Button)
app.use(Card)
app.use(Sidebar)
app.use(Calendar)
app.use(ToastService);
app.use(router);
app.mount('#app')
