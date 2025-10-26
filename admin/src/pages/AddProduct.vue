<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { useProductStore } from '@/stores/products'
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { onBeforeUnmount } from 'vue'
import RichTextControls from '@/components/RichTextControls.vue'
import { toast } from '@/services/toast'
import BackButton from '@/components/ui/BackButton.vue'
import { useHead } from '@vueuse/head'

useHead({title:`Add Product - Muzayyin.com.bd`})

// Rich text editor setup
const editor = ref(null)
const router = useRouter()
const productStore = useProductStore()
const isSubmitting = ref(false)
const progressMessage = ref('')

const form = reactive({
  name: '',
  categories: [],
  sku: '',
  slug: '',
  description: '',
  price: '',
  compared_price: '',
  discount: '',
  cost_price: '',
  stock: '',
  is_active: true,
  images: [],
  variants: [],
  colors: []
})

const categories = ref([])
const categoryLoading = ref(false)
const categoryError = ref(null)
const newCategoryName = ref('')
const showCategoryForm = ref(false)
const addingCategory = ref(false)

const errors = reactive({})
const imagePreviews = ref([])

const onImagesChange = (e) => {
  const files = Array.from(e.target.files)
  form.images = files
  imagePreviews.value = files.map(file => URL.createObjectURL(file))
}

const addVariant = () => form.variants.push({ name: '', stock: '' })
const removeVariant = (i) => form.variants.splice(i, 1)

const addColor = () => form.colors.push({ name: '', hex_code: '#000000', stock: 0 })
const removeColor = (i) => form.colors.splice(i, 1)

const addNewCategory = async () => {
  const name = newCategoryName.value.trim()
  if (!name) return
  const exists = categories.value.some(cat => cat.name.toLowerCase() === name.toLowerCase())
  if (exists) return

  addingCategory.value = true
  try {
    console.log('adding')
    const response = await api.post('/categories/', { name })
    const newCat = response.data
    categories.value.push(newCat)
    form.categories.push(newCat.id)
    newCategoryName.value = ''
    showCategoryForm.value = false
  } catch (err) {
    console.log('error')
  } finally {
    addingCategory.value = false
  }
}

const toggleCategory = (id) => {
  const index = form.categories.indexOf(id)
  if (index === -1) {
    form.categories.push(id)
  } else {
    form.categories.splice(index, 1)
  }
}

const validate = () => {
  errors.name = !form.name ? 'Name required' : ''
  errors.sku = !form.sku ? 'SKU required' : ''
  errors.slug = !form.sku ? 'Slug required' : ''
  errors.categories = form.categories.length === 0 ? 'At least one category' : ''
  errors.images = form.images.length === 0 ? 'At least one image' : ''
  errors.price = !form.price ? 'Price required' : ''
  errors.compared_price = !form.price ? 'Compared Price required' : ''
  errors.cost_price = !form.price ? 'Cost Price required' : ''
  errors.stock = !form.price ? 'Stock required' : ''
  errors.description = !form.price ? 'Description required' : ''
  return !errors.name && !errors.sku && !errors.categories && !errors.price && !errors.images && !errors.price && !errors.compared_price && !errors.cost_price && !errors.stock && !errors.description
}

const handleSubmit = async () => {
  if (!validate()) {
    toast.error("Not valid")
    for (const [key, value] of Object.entries(errors)) {
      if (value) {
        toast.error(value)
      }
    }
    return
  }
  isSubmitting.value = true
  progressMessage.value = 'Uploading images...'

  try {
    // 1. Upload images one by one
    const uploadedImageIds = []

    for (let i = 0; i < form.images.length; i++) {
      const file = form.images[i]
      progressMessage.value = `Uploading image ${i + 1} of ${form.images.length}...`

      const imageForm = new FormData()
      imageForm.append('image', file)

      const res = await api.post('/images/upload/', imageForm, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      uploadedImageIds.push(res.data.id)
      progressMessage.value = `Uploaded image ${i + 1}!`
    }

    // 2. Submit product
    progressMessage.value = 'Creating product...'

    const submissionData = {
      ...form,
      discount: form.discount || null,
      images: uploadedImageIds,
      categories: [...form.categories], // already list of ids
    }

    await productStore.addProduct(submissionData)

    progressMessage.value = 'Product created!'
    router.push("/products")
  } catch (err) {
    console.error(err)

    let message = 'Something went wrong.'

    if (err.response?.data) {
      const data = err.response.data
      if (typeof data === 'string') {
        message = data
      } else if (typeof data === 'object') {
        message = Object.entries(data)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('\n')
      }
    }

    toast.error(`Error:\n${JSON.stringify(message, null, 2)}`)
  } finally {
    isSubmitting.value = false
    progressMessage.value = ''
  }
}

onMounted(async () => {
  categoryLoading.value = true
  try {
    const response = await api.get('/categories/')
    categories.value = response.data.results || response.data
  } catch (err) {
    categoryError.value = 'Failed to load categories'
  } finally {
    categoryLoading.value = false
  }
  editor.value = new Editor({
    content: '',
    extensions: [StarterKit],
    onUpdate({ editor }) {
      form.description = editor.getHTML()
    },
  })
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})

</script>
<template>
  <div class="max-w-3xl mx-auto bg-white rounded p-6 shadow">
    <h2 class="text-2xl font-semibold mb-6 flex items-center gap-2">
      <BackButton />
      Add Product
    </h2>

    <div v-if="isSubmitting" class="mb-4 text-blue-600 font-medium flex items-center gap-2">
      <i class="pi pi-spin pi-spinner"></i>
      {{ progressMessage }}
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-4" :disabled="isSubmitting">
      <!-- Name -->
      <div>
        <label class="block font-medium mb-1 flex items-center gap-1">
          <i class="pi pi-tag"></i> Name *
        </label>
        <input v-model="form.name" required :disabled="isSubmitting" :class="[
          'w-full border rounded px-3 py-2',
          errors.name ? 'border-red-500' : 'border-gray-300'
        ]" />
        <p v-if="errors.name" class="text-red-500 text-sm mt-1">{{ errors.name }}</p>
      </div>

      <!-- Categories (Multi-select) -->
      <div>
        <label class="block font-medium mb-1 flex items-center gap-1">
          <i class="pi pi-tags"></i> Categories *
        </label>

        <div v-if="categoryLoading" class="text-gray-500 text-sm flex items-center gap-2">
          <i class="pi pi-spin pi-spinner"></i>
          Loading categories...
        </div>
        <div v-else
          class="flex flex-col divide-y max-h-[150px] overflow-auto rounded border border-gray-300 divide-gray-300">
          <template v-for="cat in categories" :key="cat.id">
            <div @click="toggleCategory(cat.id)" :class="[
              'p-2 cursor-pointer',
              form.categories.includes(cat.id) ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
            ]">
              {{ cat.name }}
            </div>
          </template>
        </div>

        <p v-if="errors.categories" class="text-red-500 text-sm mt-1">{{ errors.categories }}</p>
        <p v-if="categoryError" class="text-red-500 text-sm mt-1">{{ categoryError }}</p>
      </div>

      <!-- Inline Category Creator -->
      <div class="mt-2">
        <button type="button" :disabled="isSubmitting" @click="showCategoryForm = !showCategoryForm"
          class="text-sm cursor-pointer text-indigo-600 hover:underline flex items-center gap-1">
          <i class="pi pi-plus text-sm"></i>
          Add New Category
        </button>

        <div v-if="showCategoryForm" class="mt-2 flex items-center gap-2">
          <input :disabled="isSubmitting" v-model="newCategoryName" type="text" placeholder="Category name"
            class="w-1/2 px-3 py-1 border border-gray-300 rounded text-sm" />
          <button :disabled="isSubmitting || addingCategory" type="button" @click="addNewCategory"
            class="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1">
            <i class="pi pi-check"></i>
            Add
          </button>
        </div>
      </div>

      <!-- SKU -->
      <div>
        <label class="block font-medium mb-1 flex items-center gap-1">
          <i class="pi pi-barcode"></i> SKU *
        </label>
        <input :disabled="isSubmitting" v-model="form.sku" required :class="[
          'w-full border rounded px-3 py-2',
          errors.sku ? 'border-red-500' : 'border-gray-300'
        ]" />
        <p v-if="errors.sku" class="text-red-500 text-sm mt-1">{{ errors.sku }}</p>
      </div>

      <!-- Slug -->
      <div>
        <label class="block font-medium mb-1 flex items-center gap-1">
          <i class="pi pi-link"></i> Slug *
        </label>
        <input :disabled="isSubmitting" v-model="form.slug" required
          class="w-full border border-gray-300 rounded px-3 py-2" />
        <p v-if="errors.slug" class="text-red-500 text-sm mt-1">{{ errors.slug }}</p>
      </div>

      <!-- Price -->
      <div>
        <label class="block font-medium mb-1 flex items-center gap-1">
          <i class="pi pi-dollar"></i> Price *
        </label>
        <input :disabled="isSubmitting" v-model="form.price" type="number" required :class="[
          'w-full border rounded px-3 py-2',
          errors.price ? 'border-red-500' : 'border-gray-300'
        ]" />
        <p v-if="errors.price" class="text-red-500 text-sm mt-1">{{ errors.price }}</p>
      </div>

      <!-- Compared Price -->
      <div>
        <label class="block font-medium mb-1 flex items-center gap-1">
          <i class="pi pi-wallet"></i> Compared Price *
        </label>
        <input :disabled="isSubmitting" v-model="form.compared_price" required type="number"
          class="w-full border border-gray-300 rounded px-3 py-2" />
        <p v-if="errors.compared_price" class="text-red-500 text-sm mt-1">{{ errors.compared_price }}</p>
      </div>

      <!-- Discount -->
      <div>
        <label class="block font-medium mb-1 flex items-center gap-1">
          <i class="pi pi-percent"></i> Discount
        </label>
        <input :disabled="isSubmitting" v-model="form.discount" type="number"
          class="w-full border border-gray-300 rounded px-3 py-2" />
      </div>

      <!-- Cost Price -->
      <div>
        <label class="block font-medium mb-1 flex items-center gap-1">
          <i class="pi pi-credit-card"></i> Cost Price *
        </label>
        <input :disabled="isSubmitting" v-model="form.cost_price" required type="number"
          class="w-full border border-gray-300 rounded px-3 py-2" />
        <p v-if="errors.cost_price" class="text-red-500 text-sm mt-1">{{ errors.cost_price }}</p>
      </div>

      <!-- Stock -->
      <div>
        <label class="block font-medium mb-1 flex items-center gap-1">
          <i class="pi pi-box"></i> Stock *
        </label>
        <input :disabled="isSubmitting" v-model="form.stock" required type="number"
          class="w-full border border-gray-300 rounded px-3 py-2" />
        <p v-if="errors.stock" class="text-red-500 text-sm mt-1">{{ errors.stock }}</p>
      </div>

      <!-- Description -->
      <div>
        <label class="block font-medium mb-1 flex items-center gap-1">
          <i class="pi pi-align-left"></i> Description *
        </label>
        <template v-if="editor">
          <RichTextControls :editor="editor" />
          <div class="border border-gray-300 rounded p-2 min-h-[150px]">
            <EditorContent :editor="editor" />
          </div>
        </template>
        <p v-if="errors.description" class="text-red-500 text-sm mt-1">{{ errors.description }}</p>
      </div>

      <!-- Is Active -->
      <div class="flex items-center gap-2">
        <input :disabled="isSubmitting" v-model="form.is_active" type="checkbox" class="mr-2" />
        <i class="pi pi-check-circle text-green-600"></i>
        <label>Is Active</label>
      </div>

      <!-- Variants -->
      <div>
        <label class="block font-semibold mb-2 flex items-center gap-2">
          <i class="pi pi-tags"></i> Variants
        </label>
        <div v-for="(variant, index) in form.variants" :key="index" class="flex gap-4 mb-2 items-center">
          <input :disabled="isSubmitting" v-model="variant.name" placeholder="Variant name"
            class="flex-1 border border-gray-300 rounded px-3 py-2" />
          <input :disabled="isSubmitting" v-model="variant.stock" type="number" placeholder="Stock"
            class="w-32 border border-gray-300 rounded px-3 py-2" />
          <button type="button" @click="removeVariant(index)"
            class="text-red-600 cursor-pointer flex items-center gap-1">
            <i class="pi pi-trash"></i>
            Remove
          </button>
        </div>
        <button type="button" @click="addVariant"
          class="text-indigo-600 cursor-pointer font-medium flex items-center gap-1">
          <i class="pi pi-plus"></i>
          Add Variant
        </button>
      </div>

      <!-- Colors -->
      <div class="mt-6">
        <label class="block font-semibold mb-2 flex items-center gap-2">
          <i class="pi pi-palette"></i> Colors
        </label>
        <div v-for="(color, index) in form.colors" :key="index" class="flex gap-4 mb-2 items-center">
          <input :disabled="isSubmitting" v-model="color.name" placeholder="Color name"
            class="flex-1 border border-gray-300 rounded px-3 py-2" />
          <input :disabled="isSubmitting" v-model="color.hex_code" type="text" placeholder="#RRGGBB"
            class="w-28 border border-gray-300 rounded px-3 py-2" />
          <input :disabled="isSubmitting" v-model="color.stock" type="number" placeholder="Stock"
            class="w-24 border border-gray-300 rounded px-3 py-2" />
          <input :disabled="isSubmitting" type="color" v-model="color.hex_code"
            class="w-10 h-10 p-0 border border-gray-300 rounded" />
          <button type="button" @click="removeColor(index)" class="text-red-600 cursor-pointer flex items-center gap-1">
            <i class="pi pi-trash"></i>
            Remove
          </button>
        </div>
        <button type="button" @click="addColor"
          class="text-indigo-600 cursor-pointer font-medium flex items-center gap-1">
          <i class="pi pi-plus"></i>
          Add Color
        </button>
      </div>

      <!-- Images (Multiple Uploads) -->
      <div>
        <label class="block font-medium mb-1 flex items-center gap-1">
          <i class="pi pi-image"></i> Images
        </label>
        <input :disabled="isSubmitting" type="file" accept="image/*" multiple @change="onImagesChange"
          class="border cursor-pointer border-gray-300 rounded px-3 py-2 w-full" />
      </div>

      <!-- Image Preview -->
      <div v-if="imagePreviews.length" class="mt-2 flex flex-wrap gap-2">
        <img v-for="(src, i) in imagePreviews" :key="i" :src="src" class="w-24 h-24 object-cover border rounded" />
      </div>

      <p v-if="errors.images" class="text-red-500 text-sm mt-1">{{ errors.images }}</p>


      <!-- Submit -->
      <div>
        <button :disabled="isSubmitting" type="submit"
          class="bg-indigo-600 text-white px-4 py-2 cursor-pointer rounded hover:bg-indigo-700 flex items-center gap-2">
          <i class="pi pi-check-circle"></i>
          Add Product
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
/* Remove blue outline and reset ProseMirror styles */
.ProseMirror {
  outline: none;
  min-height: 150px;
  padding: 0.5rem;
  line-height: 1.5;
}

/* Optional: Add a focus style if you still want feedback */
.ProseMirror:focus {
  outline: none;
  box-shadow: none;
}
</style>