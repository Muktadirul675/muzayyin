import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { nextTick } from 'vue'

// â Lazy-load layouts
const DefaultLayout = () => import('@/layouts/DefaultLayout.vue')

// â Lazy-load pages
const Login = () => import('@/pages/Login.vue')
const Dashboard = () => import('@/pages/Dashboard.vue')
const Users = () => import('@/pages/Users.vue')
const Products = () => import('@/pages/Products.vue')
const AddProduct = () => import('@/pages/AddProduct.vue')
const EditProduct = () => import('@/pages/EditProduct.vue')
const Orders = () => import('@/pages/Orders.vue')
const AddOrder = () => import('@/pages/AddOrder.vue')
const EditOrder = () => import('@/pages/EditOrder.vue')
const Logs = () => import('@/pages/Logs.vue')
const Settings = () => import('@/pages/Settings.vue')
const AddStock = () => import('@/pages/AddStock.vue')
const ReadyForCourier = () => import('@/pages/ReadyForCourier.vue')
const DashboardOrder = () => import('@/pages/OrdersOverview.vue')
const FeedBuilder = () => import('@/pages/FeedBuilder.vue')

const routes = [
  {
    path: '/login',
    component: Login,
  },
  {
    path: '/',
    component: DefaultLayout,
    children: [
      { path: '', redirect: '/dashboard' },
      { path: 'dashboard', component: Dashboard },
      { path: 'dashboard/orders', component: DashboardOrder },
      { path: 'users', component: Users },
      { path: 'products', component: Products },
      { path: 'products/add', component: AddProduct },
      { path: 'products/stocks/add', component: AddStock },
      { path: 'products/:id', name: 'ProductEdit', component: EditProduct },
      { path: 'orders', component: Orders },
      { path: 'orders/add', component: AddOrder },
      { path: 'orders/:id', name: 'OrdersEdit', component: EditOrder },
      { path: 'logs', component: Logs },
      { path: 'settings', component: Settings },
      { path: 'builder', component: FeedBuilder },
      { path: 'couriers', component: ReadyForCourier },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// â Global Navigation Guard
router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()

  if (!auth.isAuthenticated) {
    await auth.fetchUser()
    await nextTick()
  }

  const isLoggedIn = auth.isAuthenticated

  if (to.path === '/login') {
    isLoggedIn ? next('/dashboard') : next()
  } else {
    if(isLoggedIn){
      if(to.path === '/orders' || to.path === '/couriers'){
        next()
      }else{
        if(auth.isAdmin){
          next()
        }else{
          next('/orders')
        }
      }
    }else{
      next('/login')
    }
  }
})

export default router