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
});

// toast 
import { useToast } from 'primevue/usetoast';
const toast = useToast();

// data
const products = ref(null);
const fetching = async () =>{
    const response = await axiosProject.get('/v2/projects',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    products.value = response.data.list;
}

onMounted(() => {
    fetching();
});

// stored from controller
const updateTodos = (updatedTodo) => {
    fetching();
};

</script>

<template>
    <Toast />
    <div class="mb-2 text-right">
        <Controller @complete-todo="updateTodos" />
    </div>
    <ScrollPanel :style="{ width: '100%', height: '840px' }" >
        <div class="grid">
            
            <div v-for="(n, index) in products" class="col-12 md:col-6 lg:col-4 xl:col-3" >
                <ItemDetail :code="n.code" />
            </div>

        </div>
    </ScrollPanel>
    
</template>
