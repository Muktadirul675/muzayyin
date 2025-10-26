<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import RichTextControls from '@/components/RichTextControls.vue'
import { toast } from '@/services/toast'
import BackButton from '@/components/ui/BackButton.vue'
import { handleError } from '@/services/errors'
import { useHead } from '@vueuse/head'

const route = useRoute()
const router = useRouter()
const productId = route.params.id

useHead({
  title: `Edit Product #${productId} - Muzayyin.com.bd`
})

const editor = ref(null)
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

const existingImages = ref([]) // { id, url }
const newImages = ref([]) // { file, preview }
const categories = ref([])
const errors = reactive({})

const fetchProduct = async () => {
  const res = await api.get(`/products/${productId}/`)
  const product = res.data
  Object.assign(form, {
    name: product.name,
    categories: product.categories.map(cat => cat.id),
    sku: product.sku,
    slug: product.slug,
    description: product.description,
    price: product.price,
    compared_price: product.compared_price,
    discount: product.discount,
    cost_price: product.cost_price,
    stock: product.stock,
    is_active: product.is_active,
    variants: product.variants || [],
    colors: product.colors || [],
    images: product.images.map(img => img.id)
  })
  existingImages.value = product.images.map(img => ({ id: img.id, url: img.image || img.url }))
  editor.value.commands.setContent(product.description || '')
}

const fetchCategories = async () => {
  const res = await api.get('/categories/')
  categories.value = res.data.results || res.data
}

const onImagesChange = (e) => {
  const files = Array.from(e.target.files)
  newImages.value.push(...files.map(file => ({
    file,
    preview: URL.createObjectURL(file)
  })))
}

const removeExistingImage = (id) => {
  form.images = form.images.filter(imgId => imgId !== id)
  existingImages.value = existingImages.value.filter(img => img.id !== id)
}

const removeNewImage = (index) => {
  URL.revokeObjectURL(newImages.value[index].preview)
  newImages.value.splice(index, 1)
}

const addVariant = () => form.variants.push({ name: '', stock: '' })
const removeVariant = (i) => form.variants.splice(i, 1)

const addColor = () => form.colors.push({ name: '', hex_code: '#000000', stock: '' })
const removeColor = (i) => form.colors.splice(i, 1)

const toggleCategory = (id) => {
  const i = form.categories.indexOf(id)
  i === -1 ? form.categories.push(id) : form.categories.splice(i, 1)
}

const validate = () => {
  errors.name = !form.name ? 'Name required' : ''
  errors.sku = !form.sku ? 'SKU required' : ''
  errors.slug = !form.sku ? 'Slug required' : ''
  errors.categories = form.categories.length === 0 ? 'At least one category' : ''
  errors.images = (form.images.length + newImages.length) === 0 ? 'At least one image' : ''
  errors.price = !form.price ? 'Price required' : ''
  errors.compared_price = !form.price ? 'Compared Price required' : ''
  errors.cost_price = !form.price ? 'Cost Price required' : ''
  errors.stock = !form.price ? 'Stock required' : ''
  errors.description = !form.price ? 'Description required' : ''
  return !errors.name && !errors.sku && !errors.categories && !errors.price && !errors.images && !errors.price && !errors.compared_price && !errors.cost_price && !errors.stock && !errors.description
}

const handleUpdate = async () => {
  if (!validate()){
    toast.error("Not valid")
    for(const [key, value] of Object.entries(errors)){
      if(value){
        toast.error(value)
      }
    }
    return
  }
  isSubmitting.value = true
  try {
    const uploadedImageIds = []

    for (let i = 0; i < newImages.value.length; i++) {
      progressMessage.value = `Uploading image ${i + 1} of ${newImages.value.length}...`
      const formData = new FormData()
      formData.append('image', newImages.value[i].file)
      const res = await api.post('/images/upload/', formData)
      uploadedImageIds.push(res.data.id)
    }

    progressMessage.value = 'Updating product...'

    const updatedData = {
      ...form,
      image_ids: [...form.images, ...uploadedImageIds],
      category_ids: form.categories
    }
    console.log(updatedData)
    await api.patch(`/products/${productId}/`, updatedData)

    toast.success('Product updated successfully!')
    router.push('/products')
  } catch (err) {
    handleError(err)
    let msg = 'Error occurred.'
    if (err.response?.data) {
      const data = err.response.data
      msg = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('\n')
    }
    toast.error(`Error: ${msg}`)
  } finally {
    isSubmitting.value = false
    progressMessage.value = ''
  }
}

onMounted(async () => {
  editor.value = new Editor({
    extensions: [StarterKit],
    content: '',
    onUpdate: ({ editor }) => {
      form.description = editor.getHTML()
    }
  })
  await Promise.all([fetchProduct(), fetchCategories()])
})

onBeforeUnmount(() => editor.value?.destroy())
</script>
<template>
  <div class="max-w-3xl mx-auto bg-white p-6 rounded shadow">
    <h2 class="text-2xl font-semibold mb-4 flex items-center gap-2">
      <BackButton />
      Edit Product
    </h2>

    <div v-if="isSubmitting" class="text-blue-600 mb-4 font-medium flex items-center gap-2">
      <i class="pi pi-spin pi-spinner"></i> {{ progressMessage }}
    </div>

    <form v-else @submit.prevent="handleUpdate" class="space-y-4">
      <!-- Name -->
      <div>
        <label class="block font-medium mb-1"><i class="pi pi-tag mr-1"></i> Name *</label>
        <input v-model="form.name" class="w-full border border-gray-300 px-3 py-2 rounded" />
        <p v-if="errors.name" class="text-red-500 text-sm mt-1">{{ errors.name }}</p>
      </div>

      <!-- Categories -->
      <div>
        <label class="block font-medium mb-1"><i class="pi pi-th-large mr-1"></i> Categories *</label>
        <div class="flex flex-col divide-y divide-gray-300 max-h-[150px] overflow-auto border border-gray-300 rounded">
          <div v-for="cat in categories" :key="cat.id" @click="toggleCategory(cat.id)"
            :class="['p-2 cursor-pointer', form.categories.includes(cat.id) ? 'bg-blue-500 text-white' : 'hover:bg-gray-100']">
            {{ cat.name }}
          </div>
        </div>
        <p v-if="errors.categories" class="text-red-500 text-sm mt-1">{{ errors.categories }}</p>
      </div>

      <!-- SKU & Price etc -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label><i class="pi pi-hashtag mr-1"></i> SKU *</label>
          <input required v-model="form.sku" class="w-full border border-gray-300 px-3 py-2 rounded" />
          <p v-if="errors.sku" class="text-red-500 text-sm mt-1">{{ errors.sku }}</p>
        </div>
        <div>
          <label><i class="pi pi-link mr-1"></i> Slug *</label>
          <input required v-model="form.slug" class="w-full border border-gray-300 px-3 py-2 rounded" />
          <p v-if="errors.slug" class="text-red-500 text-sm mt-1">{{ errors.slug }}</p>
        </div>
        <div>
          <label><i class="pi pi-dollar mr-1"></i> Price *</label>
          <input required v-model="form.price" type="number" class="w-full border border-gray-300 px-3 py-2 rounded" />
          <p v-if="errors.price" class="text-red-500 text-sm mt-1">{{ errors.price }}</p>
        </div>
        <div>
          <label><i class="pi pi-arrow-down mr-1"></i> Compared Price</label>
          <input required v-model="form.compared_price" type="number" class="w-full border border-gray-300 px-3 py-2 rounded" />
          <p v-if="errors.compared_price" class="text-red-500 text-sm mt-1">{{ errors.compared_price }}</p>
        </div>
        <div>
          <label><i class="pi pi-percentage mr-1"></i> Discount</label>
          <input v-model="form.discount" type="number" class="w-full border border-gray-300 px-3 py-2 rounded" />
        </div>
        <div>
          <label><i class="pi pi-wallet mr-1"></i> Cost Price *</label>
          <input required v-model="form.cost_price" type="number" class="w-full border border-gray-300 px-3 py-2 rounded" />
          <p v-if="errors.cost_price" class="text-red-500 text-sm mt-1">{{ errors.cost_price }}</p>
        </div>
        <div>
          <label><i class="pi pi-box mr-1"></i> Stock *</label>
          <input required v-model="form.stock" type="number" class="w-full border border-gray-300 px-3 py-2 rounded" />
          <p v-if="errors.stock" class="text-red-500 text-sm mt-1">{{ errors.stock }}</p>
        </div>
      </div>

      <!-- Description -->
      <div>
        <label><i class="pi pi-align-left mr-1"></i> Description *</label>
        <RichTextControls :editor="editor" v-if="editor" />
        <div class="border border-gray-300 rounded p-2">
          <EditorContent :editor="editor" />
        </div>
          <p v-if="errors.description" class="text-red-500 text-sm mt-1">{{ errors.description }}</p>
      </div>

      <!-- Variants -->
      <div>
        <label class="font-semibold mb-1 block"><i class="pi pi-list mr-1"></i> Variants</label>
        <div v-for="(variant, i) in form.variants" :key="i" class="flex gap-2 mb-2">
          <input v-model="variant.name" placeholder="Name" class="border border-gray-300 rounded px-3 py-2 flex-1" />
          <input v-model="variant.stock" type="number" placeholder="Stock"
            class="border border-gray-300 rounded px-3 py-2 w-24" />
          <button type="button" @click="removeVariant(i)" class="text-red-600 hover:underline cursor-pointer">
            <i class="pi pi-trash"></i>
          </button>
        </div>
        <button type="button" @click="addVariant" class="text-blue-600 hover:underline cursor-pointer">
          <i class="pi pi-plus-circle mr-1"></i> Add Variant
        </button>
      </div>

      <!-- Colors -->
      <div>
        <label class="font-semibold mb-1 block"><i class="pi pi-palette mr-1"></i> Colors</label>
        <div v-for="(color, i) in form.colors" :key="i" class="flex gap-2 mb-2 items-center">
          <input v-model="color.name" placeholder="Color name"
            class="border border-gray-300 rounded px-3 py-2 flex-1" />
          <input v-model="color.stock" type="number" placeholder="Stock"
            class="border border-gray-300 rounded px-3 py-2 w-24" />
          <input v-model="color.hex_code" type="text" class="border border-gray-300 rounded px-3 py-2 w-24" />
          <input type="color" v-model="color.hex_code" class="w-8 h-8 border border-gray-300 rounded" />
          <button type="button" @click="removeColor(i)" class="text-red-600 hover:underline cursor-pointer">
            <i class="pi pi-trash"></i>
          </button>
        </div>
        <button type="button" @click="addColor" class="text-blue-600 hover:underline cursor-pointer">
          <i class="pi pi-plus-circle mr-1"></i> Add Color
        </button>
      </div>

      <!-- Images -->
      <div>
        <label><i class="pi pi-image mr-1"></i> Upload New Images</label>
        <input type="file" multiple @change="onImagesChange"
          class="border cursor-pointer border-gray-300 rounded px-3 py-2 w-full" />
      </div>

      <div class="flex flex-wrap gap-2 mt-2">
        <div v-for="img in existingImages" :key="img.id" class="relative group">
          <img :src="img.url" class="w-24 h-24 object-cover border border-gray-300 rounded" />
          <button @click="removeExistingImage(img.id)"
            class="absolute cursor-pointer top-1 right-1 bg-red-600 text-white text-xs rounded-full w-6 h-6 hidden group-hover:flex items-center justify-center">
            <i class="pi pi-trash"></i>
          </button>
        </div>
        <div v-for="(img, i) in newImages" :key="i" class="relative group">
          <img :src="img.preview" class="w-24 h-24 object-cover border border-gray-300 rounded" />
          <button @click="removeNewImage(i)"
            class="absolute cursor-pointer top-1 right-1 bg-red-600 text-white text-xs rounded-full w-6 h-6 hidden group-hover:flex items-center justify-center">
            <i class="pi pi-trash"></i>
          </button>
        </div>
      </div>
      <p v-if="errors.images" class="text-red-500 text-sm mt-1">{{ errors.images }}</p>


      <!-- Active Toggle -->
      <div class="flex items-center mt-4">
        <input type="checkbox" v-model="form.is_active" class="mr-2" />
        <label><i class="pi pi-check-square mr-1"></i> Is Active</label>
      </div>

      <!-- Submit -->
      <div class="mt-4">
        <button type="submit"
          class="bg-indigo-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          :disabled="isSubmitting">
          <i class="pi pi-check"></i> Update Product
        </button>
      </div>
    </form>
  </div>
</template>