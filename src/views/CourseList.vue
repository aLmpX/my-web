<template>
  <div class="card p-4 mb-4 shadow-sm border-0">
    <h2 class="mb-4 text-dark fw-bold">รายละเอียดการเรียน</h2>

    <div v-for="(group, term) in groupedCourses" :key="term" class="mb-5">
      <div class="d-flex justify-content-between align-items-center bg-light px-3 py-2 rounded-top">
        <span class="badge bg-info text-dark fs-6">ภาคเรียน {{ term }}</span>
        <div class="text-end fw-semibold">
          หน่วยกิต {{ totalCredits(group) }} เกรดเฉลี่ย <span class="text-primary">{{ calculateGPA(group) }}</span>
        </div>
      </div>

      <div v-for="course in group" :key="course.id" class="border-bottom p-3 d-flex justify-content-between align-items-center">
        <div>
          <div class="fw-bold">{{ course.code }}</div>
          <small>{{ course.credit }} หน่วยกิต</small>
        </div>
        <div class="flex-fill mx-3">
          <div>{{ course.nameTh }}</div>
          <small class="text-muted">{{ course.nameEn }}</small>
        </div>
        <div class="text-end fw-bold d-flex align-items-center" style="min-width: 80px;">
          <span :class="gradeClass(course.grade)" class="me-3">{{ course.grade }}</span>
          <button class="btn btn-sm btn-outline-primary me-1" @click="editCourse(course)">แก้ไข</button>
          <button class="btn btn-sm btn-outline-danger" @click="deleteCourse(course.id)">ลบ</button>
        </div>
      </div>
    </div>

    <div class="bg-light p-3 mt-3 rounded">
      <h6 class="mb-3 fw-bold">{{ isEditing ? 'แก้ไขรายวิชา' : 'เพิ่มรายวิชาใหม่' }}</h6>
      <form @submit.prevent="submitCourse">
        <div class="row g-2 align-items-end">
          <div class="col-md-2">
            <select v-model="form.termPart" class="form-select" required>
              <option disabled value="">เลือกภาคเรียน</option>
              <option value="ภาคต้น">ภาคต้น</option>
              <option value="ภาคปลาย">ภาคปลาย</option>
              <option value="ภาคฤดูร้อน">ภาคฤดูร้อน</option>
            </select>
          </div>
          <div class="col-md-2">
            <input v-model="form.termYear" type="text" class="form-control" placeholder="ปีการศึกษา เช่น 2567" required />
          </div>
          <div class="col-md-2">
            <input v-model="form.code" class="form-control" placeholder="รหัสวิชา" required />
          </div>
          <div class="col-md-2">
            <input v-model="form.nameTh" class="form-control" placeholder="ชื่อวิชา (ไทย)" required />
          </div>
          <div class="col-md-2">
            <input v-model="form.nameEn" class="form-control" placeholder="ชื่อวิชา (อังกฤษ)" required />
          </div>
          <div class="col-md-1">
            <input v-model.number="form.credit" type="number" class="form-control" placeholder="หน่วยกิต" required />
          </div>
          <div class="col-md-1">
            <input v-model="form.grade" class="form-control" placeholder="เกรด" required />
          </div>
          <div class="col-md-12 text-end mt-2">
            <button type="submit" class="btn btn-success">{{ isEditing ? 'อัปเดต' : 'เพิ่ม' }}</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const courses = ref([])
const form = ref({ term: '', termPart: '', termYear: '', code: '', nameTh: '', nameEn: '', credit: 0, grade: '' })
const isEditing = ref(false)
let editingId = null

const loadCourses = async () => {
  const res = await axios.get('http://localhost:3000/courses')
  courses.value = res.data
}

onMounted(() => {
  loadCourses()
})

const submitCourse = async () => {
  form.value.term = `${form.value.termPart} ${form.value.termYear}`
  if (isEditing.value) {
    await axios.put(`http://localhost:3000/courses/${editingId}`, form.value)
  } else {
    await axios.post('http://localhost:3000/courses', form.value)
  }
  form.value = { term: '', termPart: '', termYear: '', code: '', nameTh: '', nameEn: '', credit: 0, grade: '' }
  isEditing.value = false
  editingId = null
  loadCourses()
}

const editCourse = (course) => {
  const [part, year] = course.term.split(' ')
  form.value = { ...course, termPart: part, termYear: year }
  isEditing.value = true
  editingId = course.id
}

const deleteCourse = async (id) => {
  await axios.delete(`http://localhost:3000/courses/${id}`)
  loadCourses()
}

const groupedCourses = computed(() => {
  const groups = courses.value.reduce((acc, course) => {
    const term = course.term || 'ไม่ระบุ'
    if (!acc[term]) acc[term] = []
    acc[term].push(course)
    return acc
  }, {})

  const termOrder = { "ภาคปลาย": 1, "ภาคต้น": 2, "ภาคฤดูร้อน": 3 }
  const sortedTerms = Object.keys(groups).sort((a, b) => {
    const [ta, ya] = a.split(" ")
    const [tb, yb] = b.split(" ")
    const yaNum = parseInt(ya) || 0
    const ybNum = parseInt(yb) || 0
    if (ybNum !== yaNum) return ybNum - yaNum
    return (termOrder[ta] || 99) - (termOrder[tb] || 99)
  })

  const sortedGroups = {}
  sortedTerms.forEach(term => {
    sortedGroups[term] = groups[term]
  })

  return sortedGroups
})

const gradeToPoint = (grade) => {
  const map = { 'A': 4, 'B+': 3.5, 'B': 3, 'C+': 2.5, 'C': 2, 'D+': 1.5, 'D': 1, 'F': 0 }
  return map[grade.toUpperCase()] ?? null
}

const calculateGPA = (group) => {
  let totalCredits = 0
  let totalPoints = 0
  group.forEach(course => {
    const points = gradeToPoint(course.grade)
    if (points !== null) {
      totalCredits += course.credit
      totalPoints += points * course.credit
    }
  })
  return totalCredits ? (totalPoints / totalCredits).toFixed(2) : '-'
}

const totalCredits = (group) => {
  return group.reduce((sum, c) => sum + (gradeToPoint(c.grade) !== null ? c.credit : 0), 0)
}

const gradeClass = (grade) => {
  return grade.toUpperCase() === 'F' ? 'text-danger' : 'text-dark'
}
</script>