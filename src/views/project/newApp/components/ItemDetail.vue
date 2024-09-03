<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useRouter } from 'vue-router';

// components
import Header from './detail/Header.vue';

const local = ref({
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
});

// toast 
import { useToast } from 'primevue/usetoast';
const toast = useToast();

// router
const router = useRouter();

// define
const props = defineProps(['code']);

const selected = () =>{
    router.push({path: '/project/new/dashboard/'+props.code});
}
</script>

<template>
    <div @click="selected" class="card border-200 cursor-pointer border-2 hover:border-primary transition-duration-300 transition-all" style="border-radius: 10px">
        <Header :code="props.code" />
    </div>
    
    <!-- <div class="card mb-0">
        <div class="flex justify-content-between mb-5">
            
        </div>
    </div> -->
</template>
