<template>
    <div @click.stop="toggle" class="cursor-pointer px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 w-fit"
        :title="text">
        <span>
            {{ isExpanded || text.length <= limit ? text : truncatedText }} <span v-if="!isExpanded && text.length > limit">
                ...</span>
        </span>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    text: {
        type: String,
        required: true,
    },
    limit: {
        type: Number,
        default: 10
    }
})

const isExpanded = ref(false)

const toggle = () => {
    if (props.text.length > props.limit) {
        isExpanded.value = !isExpanded.value
    }
}

const truncatedText = computed(() => props.text.slice(0, props.limit))
</script>