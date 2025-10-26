<template>
    <div class="w-full lg:w-2/3 mx-auto p-3">
        <div class="text-xl font-semibold flex mb-3 items-center gap-2">
            <BackButton/>
            Contact Us</div>
    </div>
</template>

<script setup>
import BackButton from '@/components/ui/BackButton.vue';
import { onMounted } from 'vue';

onMounted(()=>{
    window.scrollTo({top:0})
})

</script>