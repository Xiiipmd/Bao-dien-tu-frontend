import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/components/Layout.vue'
import AdminLayout from '@/components/AdminLayout.vue'

type AppRouteMeta = {
  requiresAuth?: boolean
  allowedRoles?: string[]
}

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
        {
          path: 'vip',
          component: () => import('@/views/VIPSubscription.vue'),
          meta: { requiresAuth: true } satisfies AppRouteMeta,
        },
        { path: 'search', component: () => import('@/views/Search.vue') },
        {
          path: 'preferences',
          component: () => import('@/views/Preferences.vue'),
          meta: { requiresAuth: true } satisfies AppRouteMeta,
        },
        {
          path: 'account',
          component: () => import('@/views/Account.vue'),
          meta: { requiresAuth: true } satisfies AppRouteMeta,
        },
      ],
    },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true, allowedRoles: ['ADMIN', 'AUTHOR', 'CENSOR'] } satisfies AppRouteMeta,
      children: [
        { path: '', component: () => import('@/views/admin/Dashboard.vue') },
        {
          path: 'posts/manage',
          component: () => import('@/views/admin/ManagePosts.vue'),
          meta: { requiresAuth: true, allowedRoles: ['AUTHOR'] } satisfies AppRouteMeta,
        },
        {
          path: 'posts/create',
          component: () => import('@/views/admin/CreatePost.vue'),
          meta: { requiresAuth: true, allowedRoles: ['AUTHOR'] } satisfies AppRouteMeta,
        },
        {
          path: 'posts/:articleId/edit',
          component: () => import('@/views/admin/CreatePost.vue'),
          meta: { requiresAuth: true, allowedRoles: ['AUTHOR'] } satisfies AppRouteMeta,
        },
        {
          path: 'revenue',
          component: () => import('@/views/admin/RevenueStats.vue'),
          meta: { requiresAuth: true, allowedRoles: ['ADMIN', 'AUTHOR'] } satisfies AppRouteMeta,
        },
        {
          path: 'posts/approval',
          component: () => import('@/views/admin/ApprovePost.vue'),
          meta: { requiresAuth: true, allowedRoles: ['ADMIN', 'CENSOR'] } satisfies AppRouteMeta,
        },
        {
          path: 'posts/visibility',
          component: () => import('@/views/admin/ManageArticleVisibility.vue'),
          meta: { requiresAuth: true, allowedRoles: ['ADMIN'] } satisfies AppRouteMeta,
        },
        {
          path: 'vip',
          component: () => import('@/views/admin/ManageVIP.vue'),
          meta: { requiresAuth: true, allowedRoles: ['ADMIN'] } satisfies AppRouteMeta,
        },
        {
          path: 'stats',
          component: () => import('@/views/admin/AdminStats.vue'),
          meta: { requiresAuth: true, allowedRoles: ['ADMIN'] } satisfies AppRouteMeta,
        },
        {
          path: 'users',
          component: () => import('@/views/admin/ManageUsers.vue'),
          meta: { requiresAuth: true, allowedRoles: ['ADMIN'] } satisfies AppRouteMeta,
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const token = localStorage.getItem('jwt_token')
  const role = localStorage.getItem('user_role')
  const requiresAuth = to.matched.some(record => Boolean((record.meta as AppRouteMeta).requiresAuth))
  const mostSpecificRoleRule = [...to.matched]
    .reverse()
    .map(record => (record.meta as AppRouteMeta).allowedRoles)
    .find((allowedRoles): allowedRoles is string[] => Array.isArray(allowedRoles) && allowedRoles.length > 0)

  if (requiresAuth && !token) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (mostSpecificRoleRule && !mostSpecificRoleRule.includes(role ?? '')) {
    return { path: '/' }
  }
})
