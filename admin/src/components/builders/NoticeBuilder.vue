<script setup>
import { computed, ref } from 'vue';
import Builder from '../Builder.vue';
import { useBuilderStore } from '@/stores/builder';

const props = defineProps({
    uid: Number
})
const builder = useBuilderStore()
const section = computed(() => builder.feed.find(s => s.uid === props.uid))
const text = ref('')
let uid = 1000;

const add = () => {
    if (text.value.trim() !== '') {
        section.value.notices.push({
            uid: uid++,
            text: text.value,
        })
    }
    text.value = ''
}

const remove = (uid) =>{
    section.value.notices = section.value.notices.filter((n)=>n.uid!==uid)
}

</script>

<template>
    <Builder :uid="props.uid">
        <div class="p-2 flex flex-col gap-2">
            <div class="label">Notices</div>
            <template v-for="notice in section.notices" :key="notice.uid">
                <div class="flex flex-row items-center gap-2">
                    <input type="text" v-model="notice.text" class="input">
                    <i @click="remove(notice.uid)" class="pi pi-trash text-red-500"></i>
                </div>
            </template>
            <div class="flex flex-row gap-2">
                <input type="text" placeholder="Add Notice" v-model="text" class="input">
                <button class="btn" @click="add">Add</button>
            </div>
        </div>
    </Builder>
</template>