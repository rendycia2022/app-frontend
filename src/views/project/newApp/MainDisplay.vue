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
const search = (event) => {
    let query = event.query;
    items.value = productsOriginal.value;
    if(query){
        items.value = items.value.filter((val) => val.po_number.includes(query));
    }
}

const handleSelected = (item) => {
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
}

const handleUnSelected = (item) => {
    if(selectedItems.value.length > 0){
        products.value = products.value.filter((val) => val.code !== item.value.code);
    }else{
        products.value = productsOriginal.value;
    }
    
}



</script>

<template>
    <Toast />
    <div class="mb-2 text-right">
        <AutoComplete 
            v-model="selectedItems" 
            @item-select="handleSelected"
            @item-unselect="handleUnSelected"
            :suggestions="items" 
            @complete="search" 
            optionLabel="po_number"
            placeholder="Search PO Number"
            class="mr-2 "
            multiple fluid
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
