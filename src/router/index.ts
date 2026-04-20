import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/components/Layout.vue'
import AdminLayout from '@/components/AdminLayout.vue'

export const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: '/',
      component: Layout,
      children: [
        { path: '', component: () => import('@/views/Home.vue') },
        { path: 'login', component: () => import('@/views/Login.vue') },
        { path: 'register', component: () => import('@/views/Register.vue') },
        { path: 'article/:id', component: () => import('@/views/ArticleDetail.vue') },
        { path: 'author/:id', component: () => import('@/views/AuthorProfile.vue') },
        { path: 'vip', component: () => import('@/views/VIPSubscription.vue') },
        { path: 'search', component: () => import('@/views/Search.vue') },
      ],
    },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        { path: '', component: () => import('@/views/admin/Dashboard.vue') },
        { path: 'posts/create', component: () => import('@/views/admin/CreatePost.vue') },
        { path: 'posts/approval', component: () => import('@/views/admin/ApprovePost.vue') },
        { path: 'vip', component: () => import('@/views/admin/ManageVIP.vue') },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const token = localStorage.getItem('jwt_token')
  const role = localStorage.getItem('user_role')

  if (to.meta.requiresAuth && !token) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (to.meta.requiresAdmin && role !== 'ADMIN') {
    return { path: '/' }
  }
})
