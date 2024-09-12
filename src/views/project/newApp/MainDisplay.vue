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
const productsOriginal = ref(null);
const fetching = async () =>{
    const response = await axiosProject.get('/v2/projects',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    products.value = response.data.list;
    productsOriginal.value = response.data.list;
    items.value = productsOriginal.value;
}

onMounted(() => {
    fetching();
});

// stored from controller
const updateTodos = (updatedTodo) => {
    fetching();
};

// selected data
const items = ref([]);
const selectedItems = ref();

const handleSelected = (item) => {
    if(selectedItems.value.length > 0){
        products.value = [];
        let index = 0;
        for (let i = 0; i < productsOriginal.value.length; i++) {
            for (let j = 0; j < selectedItems.value.length; j++) {
                if (productsOriginal.value[i].code === selectedItems.value[j].code) {
                    products.value.push(selectedItems.value[index]);
                    
                    index++;
                }
            }
        }
    }else{
        clearSelected();
    }
    
}

const clearSelected = () =>{
    products.value = productsOriginal.value;
    selectedItems.value = null;
}



</script>

<template>
    <Toast />
    <div class="mb-2 text-right">
        <Button 
            class="mr-1" 
            icon="pi pi-times" aria-label="Clear" v-tooltip="'Clear search'" rounded severity="danger" size="small"  @click="clearSelected" />
        <MultiSelect 
            v-model="selectedItems" 
            :options="items" filter 
            placeholder="Select PO Number" optionLabel="po_number"
            :maxSelectedLabels="3" class="mr-5" 
            @change="handleSelected"
        />
        <Controller @complete-todo="updateTodos" />
    </div>
    <ScrollPanel :style="{ width: '100%', height: '840px' }" >
        <div class="grid">
            
            <div v-for="(n, index) in products" class="col-12 md:col-6 lg:col-4 xl:col-3" >
                <ItemDetail :code="n.code" />
            </div>

        </div>
        <ScrollTop target="parent" :threshold="100" icon="pi pi-angle-up" :buttonProps="{ severity: 'secondary', raised: true, rounded: true }" />
    </ScrollPanel>
</template>
