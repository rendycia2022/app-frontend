<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { axiosProject } from '../../../service/axios';

// components
import Controller from './components/Controller.vue';
import ItemDetail from './components/ItemDetail.vue';

const local = ref({
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
    code: (new URL(window.location.href)).pathname.split('/')[4],
});

// toast 
import { useToast } from 'primevue/usetoast';
const toast = useToast();

</script>

<template>
    <Toast />
    <div class="mb-2 text-right">
        <Controller />
    </div>
    <ScrollPanel :style="{ width: '100%', height: '840px' }" >
        <div class="grid">
            
            <div class="col-12 md:col-6 lg:col-4 xl:col-3" >
                <ItemDetail :code="local.code" />
            </div>

        </div>
    </ScrollPanel>
    
</template>
