import './assets/main.css'
import 'primeicons/primeicons.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import axios from 'axios'
import { getCookie } from './services/cookies'
import Vue3Toastify, { toast } from 'vue3-toastify'
import { createHead } from '@unhead/vue'

async function initializeCsrf() {
    await axios.get('http://localhost:8000/auth/csrf/', { withCredentials: true });
}

async function bootstrap(){
    // await initializeCsrf()
    // axios.defaults.withCredentials = true
    // axios.interceptors.request.use(config => {
    //     const csrftoken = getCookie('csrftoken')
    //     // console.log(csrftoken)
    //     if (csrftoken) {
    //         config.headers['X-CSRFToken'] = csrftoken
    //     }
    //     return config
    // }, error => {
    //     return Promise.reject(error)
    // })
    
    const app = createApp(App)
    const head = createHead()
    app.use(createPinia())
    app.use(head)
    app.use(router)
    app.use(Vue3Toastify,{
        autoClose: 3000,
        position: toast.POSITION.TOP_CENTER
    })
    
    app.mount('#app')
}

bootstrap()
