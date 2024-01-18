import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import FileUpload from 'primevue/fileupload';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import ToastService from 'primevue/toastservice'


import 'primevue/resources/themes/lara-light-green/theme.css'

const app = createApp(App);
app.use(PrimeVue)
app.use(FileUpload)
app.use(InputText)
app.use(Button)
app.use(ToastService)
app.mount('#app')
