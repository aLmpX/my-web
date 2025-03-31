<template>
  <div class="card p-4 mb-4 shadow-lg border-0 profile-card">
    <h2 class="mb-4 text-primary fw-bold">ข้อมูลนิสิต</h2>

    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2">กำลังโหลดข้อมูล...</p>
    </div>

    <div v-else-if="student && student.name" class="row">
      <div class="col-md-4 text-center">
        <transition name="flip" mode="out-in">
          <img
            :src="currentImage"
            key="image"
            class="img-fluid rounded stylish-img"
            alt="Profile"
            @error="onImageError"
          />
        </transition>
      </div>
      <div class="col-md-8">
        <form @submit.prevent="updateStudent">
          <div class="mb-3">
            <label class="form-label fw-bold">ชื่อ-นามสกุล</label>
            <input v-model="student.name" class="form-control" />
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">รหัสนิสิต</label>
            <input v-model="student.id" class="form-control" />
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">สาขา</label>
            <input v-model="student.department" class="form-control" />
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">โรงเรียน</label>
            <input v-model="student.school" class="form-control" />
          </div>
          <button type="submit" class="btn btn-success px-4 mt-2">บันทึก</button>
        </form>
      </div>
    </div>

    <div v-else class="text-danger text-center my-4">
      information not found
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import axios from 'axios'

const student = ref(null)
const showFirstImage = ref(true)
const loading = ref(true)
const fallbackImage = '/img/default.jpg'

const currentImage = computed(() =>
  showFirstImage.value ? student.value?.image1 : student.value?.image2
)

const onImageError = (event) => {
  event.target.src = fallbackImage
}

let interval = null
const startAutoSlide = () => {
  interval = setInterval(() => {
    showFirstImage.value = !showFirstImage.value
  }, 3000)
}

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:3000/student')
    student.value = res.data
    startAutoSlide()
  } catch (err) {
    console.error('Error loading student:', err)
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  clearInterval(interval)
})

const updateStudent = async () => {
  await axios.put('http://localhost:3000/student', student.value)
  alert('Data saved successfully!')
}
</script>

<style scoped>
.profile-card {
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  border-radius: 1rem;
}

.stylish-img {
  width: 250px;
  height: 250px;
  object-fit: cover;
  border-radius: 50%;
  transition: transform 0.6s ease;
}
.stylish-img:hover {
  transform: scale(1.15);
}

.flip-enter-active,
.flip-leave-active {
  transition: transform 0.8s ease, opacity 0.6s ease;
}
.flip-enter-from {
  transform: rotateY(90deg);
  opacity: 0;
}
.flip-leave-to {
  transform: rotateY(-90deg);
  opacity: 0;
}
</style>