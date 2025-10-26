<template>
  <div class="flex flex-wrap gap-2 border border-gray-300 rounded p-2 mb-4">
    <button
      v-for="btn in computedButtons"
      :key="btn.label"
      type="button"
      :class="[
        'px-3 py-1 rounded text-sm flex items-center gap-1 border cursor-pointer',
        btn.active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white hover:bg-gray-100 border-gray-300'
      ]"
      @click="btn.action"
    >
      <i :class="btn.icon" />
      <span>{{ btn.label }}</span>
    </button>
  </div>
</template>

<script setup>
import { computed, toRef } from 'vue'

const props = defineProps({
  editor: {
    type: Object,
    required: true
  }
})

const editor = toRef(props, 'editor')

const computedButtons = computed(() => {
  if (!editor.value) return []

  return [
    {
      label: 'Bold',
      icon: 'pi pi-bold',
      active: editor.value.isActive('bold'),
      action: () => editor.value.chain().focus().toggleBold().run()
    },
    {
      label: 'Italic',
      icon: 'pi pi-italic',
      active: editor.value.isActive('italic'),
      action: () => editor.value.chain().focus().toggleItalic().run()
    },
    {
      label: 'Bullet List',
      icon: 'pi pi-list',
      active: editor.value.isActive('bulletList'),
      action: () => editor.value.chain().focus().toggleBulletList().run()
    },
    {
      label: 'Ordered List',
      icon: 'pi pi-sort-numeric-down',
      active: editor.value.isActive('orderedList'),
      action: () => editor.value.chain().focus().toggleOrderedList().run()
    },
    {
      label: 'Heading 1',
      icon: 'pi pi-heading',
      active: editor.value.isActive('heading', { level: 1 }),
      action: () => editor.value.chain().focus().toggleHeading({ level: 1 }).run()
    },
    {
      label: 'Undo',
      icon: 'pi pi-undo',
      active: false,
      action: () => editor.value.chain().focus().undo().run()
    },
    {
      label: 'Redo',
      icon: 'pi pi-redo',
      active: false,
      action: () => editor.value.chain().focus().redo().run()
    }
  ]
})
</script>