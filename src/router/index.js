import { createRouter, createWebHistory } from 'vue-router'
import StudentProfile from '../views/StudentProfile.vue'
import CourseList from '../views/CourseList.vue'

const routes = [
  { path: '/', redirect: '/profile' },
  { path: '/profile', component: StudentProfile },
  { path: '/courses', component: CourseList },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router