import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/components/Layout.vue'
import AdminLayout from '@/components/AdminLayout.vue'
import { useAuthStore } from '@/stores/auth'

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
        { path: 'user/:id', component: () => import('@/views/PublicUserProfile.vue') },
        {
          path: 'account',
          component: () => import('@/views/Account.vue'),
          meta: { requiresAuth: true } satisfies AppRouteMeta,
        },
        {
          path: 'vip',
          component: () => import('@/views/VIPSubscription.vue'),
          meta: { requiresAuth: true, allowedRoles: ['MEMBER', 'VIP'] } satisfies AppRouteMeta,
        },
        { path: 'search', component: () => import('@/views/Search.vue') },
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
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  const token = localStorage.getItem('jwt_token')
  const requiresAuth = to.matched.some(record => Boolean((record.meta as AppRouteMeta).requiresAuth))
  const mostSpecificRoleRule = [...to.matched]
    .reverse()
    .map(record => (record.meta as AppRouteMeta).allowedRoles)
    .find((allowedRoles): allowedRoles is string[] => Array.isArray(allowedRoles) && allowedRoles.length > 0)

  if (requiresAuth && !token) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  const auth = useAuthStore()
  if (requiresAuth && token) {
    try {
      await auth.refreshSession()
    } catch (error: any) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        auth.logout()
        return { path: '/login', query: { redirect: to.fullPath } }
      }
      // A temporary network error must not destroy a valid local session.
      // Backend authorization still protects every privileged request.
    }
  }

  const role = auth.role ?? localStorage.getItem('user_role')

  if (mostSpecificRoleRule && !mostSpecificRoleRule.includes(role ?? '')) {
    return { path: '/' }
  }
})
