<template>
  <v-row>
    <v-col cols="12">
      <v-card class="pa-6" elevation="2">
        <!-- Выбор даты -->
        <v-row class="mb-6" justify="center">
          <v-col cols="8" md="8">
            <v-text-field
              v-model="selectedDate"
              label="Дата рабочего собрания"
              type="date"
              color="primary"
              variant="outlined"
              prepend-inner-icon="mdi-calendar"
            ></v-text-field>
          </v-col>
        </v-row>

        <!-- Выбор должностей -->
        <v-card-subtitle class="text-h6 pa-0 mb-3">Выбери свободные служения:</v-card-subtitle>

        <v-row justify="center">
          <v-col cols="12" md="6" lg="4" v-for="position in positions" :key="position.id">
            <v-card
              :color="selectedPositions.includes(position.id) ? 'green-darken-3' : 'grey-darken-1'"
              :class="{ 'text-white': selectedPositions.includes(position.id) }"
              @click="togglePosition(position.id)"
              style="cursor: pointer"
              elevation="2"
              hover
              variant="tonal"
            >
              <v-card-text class="d-flex align-center pa-3">
                <v-avatar size="48" class="mr-3">
                  <v-img :src="position.image" :alt="position.name"></v-img>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="font-weight-medium">{{ position.name }}</div>
                </div>
                <v-icon
                  :icon="
                    selectedPositions.includes(position.id)
                      ? 'mdi-check-circle'
                      : 'mdi-circle-outline'
                  "
                  :color="
                    selectedPositions.includes(position.id) ? 'green-darken-3' : 'grey-darken-3'
                  "
                ></v-icon>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Превью выбранных должностей -->
        <!-- <div v-if="selectedPositions.length > 0" class="mt-6">
          <v-card-subtitle class="text-h6 pa-0 mb-3">Выбранные служения:</v-card-subtitle>
          <v-chip
            v-for="positionId in selectedPositions"
            :key="positionId"
            class="ma-1"
            color="primary"
            closable
            @click:close="togglePosition(positionId)"
          >
            {{ getPositionName(positionId) }}
          </v-chip>
        </div> -->

        <!-- Кнопка генерации -->
        <v-row class="mt-6">
          <v-col cols="12" class="text-center">
            <v-btn
              color="surface-bg"
              size="large"
              :disabled="!canGenerate"
              @click="generateFlyer"
              prepend-icon="mdi-download"
              class="text-none font-weight-bold"
              variant="tonal"
            >
              Сгенерировать флаер
            </v-btn>
          </v-col>
        </v-row>

        <!-- Canvas для генерации (скрытый) -->
        <canvas
          ref="canvas"
          :width="canvasWidth"
          :height="canvasHeight"
          style="display: none"
        ></canvas>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { MAPPING } from '../images_to_names_mapping.js'

// Реактивные данные
const selectedDate = ref('')
const selectedPositions = ref([])
const canvas = ref(null)

// Размеры canvas (обновлено до 1200x1200)
const canvasWidth = 1200
const canvasHeight = 1200

// Генерируем список должностей из маппинга
const positions = ref(
  Object.entries(MAPPING).map(([imageKey, name], index) => ({
    id: index + 1,
    name: name,
    imageKey: imageKey,
    image: `images/${imageKey}.jpg`,
  })),
)

// Вычисляемые свойства
const canGenerate = computed(() => {
  return selectedDate.value && selectedPositions.value.length > 0
})

// Методы
const togglePosition = (positionId) => {
  const index = selectedPositions.value.indexOf(positionId)
  if (index > -1) {
    selectedPositions.value.splice(index, 1)
  } else {
    selectedPositions.value.push(positionId)
  }
}

// const getPositionName = (positionId) => {
//   const position = positions.value.find((p) => p.id === positionId)
//   return position ? position.name : ''
// }

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

const generateFlyer = async () => {
  if (!canGenerate.value) return

  try {
    // Загрузка background изображения
    const backgroundImg = new Image()

    await new Promise((resolve, reject) => {
      backgroundImg.onload = resolve
      backgroundImg.onerror = reject
      backgroundImg.src = 'images/BACKGROUND.jpg'
    })

    // Получаем оригинальные размеры фонового изображения
    const bgWidth = backgroundImg.naturalWidth
    const bgHeight = backgroundImg.naturalHeight

    // Настраиваем canvas под размеры фонового изображения + место для списка должностей
    const rowsCount = Math.ceil(selectedPositions.value.length / 2) // Количество строк (по 2 элемента в строке)
    const totalHeight = bgHeight + Math.max(rowsCount * 350 + 120, 300) // Увеличено для больших элементов и отступов

    // Обновляем размеры canvas
    canvas.value.width = bgWidth
    canvas.value.height = totalHeight

    const ctx = canvas.value.getContext('2d')

    // Очистка canvas белым фоном
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, bgWidth, totalHeight)

    // Рисуем background изображение в оригинальном размере
    ctx.drawImage(backgroundImg, 0, 0, bgWidth, bgHeight)

    // Добавляем дату в левый верхний угол с увеличенным шрифтом
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 36px Montserrat'
    ctx.fillText(`Рабочее собрание: ${formatDate(selectedDate.value)}`, 30, 60)

    // Рисуем выбранные должности под фоновым изображением
    const startY = bgHeight + 60 // Начинаем под фоновым изображением
    const rowHeight = 320 // Увеличиваем высоту строки для больших изображений
    const imageSize = 256 // Увеличиваем в 2 раза (128 * 2)
    const columnCount = 2 // Количество колонок
    const itemSpacing = 100 // Промежуток между элементами

    for (let i = 0; i < selectedPositions.value.length; i++) {
      const position = positions.value.find((p) => p.id === selectedPositions.value[i])
      if (!position) continue

      const rowIndex = Math.floor(i / columnCount)
      const colIndex = i % columnCount
      const itemsInCurrentRow = Math.min(selectedPositions.value.length - rowIndex * columnCount, columnCount)

      // Общая ширина одного элемента (изображение + отступ + текст)
      const textWidth = 200 // Примерная ширина для названия должности
      const itemFullWidth = imageSize + 10 + textWidth // Полная ширина элемента
      const totalContentWidth = itemFullWidth * itemsInCurrentRow + (itemsInCurrentRow - 1) * itemSpacing
      
      // Фиксированные отступы по краям 100px
      const edgeMargin = 100
      const availableWidth = bgWidth - 2 * edgeMargin
      
      // Рассчитываем позицию с фиксированными отступами
      const rowStartX = edgeMargin + (availableWidth - totalContentWidth) / 2

      const y = startY + rowIndex * rowHeight
      const x = rowStartX + colIndex * (itemFullWidth + itemSpacing)

      // Загружаем изображение должности
      const posImg = new Image()

      await new Promise((resolve) => {
        posImg.onload = resolve
        posImg.onerror = resolve // Игнорируем ошибки загрузки
        posImg.src = position.image
      })

      // Рисуем квадратную миниатюру с округлением углов
      ctx.save()
      ctx.beginPath()
      ctx.roundRect(x, y, imageSize, imageSize, 8)
      ctx.clip()
      ctx.drawImage(posImg, x, y, imageSize, imageSize)
      ctx.restore()

      // Рисуем название должности с увеличенным шрифтом
      ctx.fillStyle = '#000000'
      ctx.font = 'bold 28px Montserrat'
      ctx.fillText(position.name, x + imageSize + 10, y + imageSize / 2 + 10)
    }

    // Скачиваем изображение в формате PNG
    const link = document.createElement('a')
    link.download = `Свобода. Рабочее собрание - ${formatDate(selectedDate.value)}.png`
    link.href = canvas.value.toDataURL('image/png', 1.0) // Максимальное качество
    link.click()
  } catch (error) {
    console.error('Ошибка при генерации флаера:', error)
    alert('Произошла ошибка при генерации флаера. Проверьте, что все изображения доступны.')
  }
}

// Установка текущей даты при загрузке
onMounted(() => {
  const today = new Date()
  selectedDate.value = today.toISOString().split('T')[0]
})
</script>

<style scoped>
.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-2px);
}
</style>
