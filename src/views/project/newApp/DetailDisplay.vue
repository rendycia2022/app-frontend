<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { axiosProject } from '../../../service/axios';

// components
import Controller from './components/Controller.vue';
import ItemDetail from './components/ItemDetail.vue';
import ManageHeader from './components/manages/Header.vue';
import ManageRevenue from './components/manages/Revenue.vue';

const local = ref({
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
    code: (new URL(window.location.href)).pathname.split('/')[4],
});

// toast 
import { useToast } from 'primevue/usetoast';
const toast = useToast();

// stored from controller
const completedTodo = ref({});
const updateTodos = (updatedTodo) => {
    completedTodo.value = updatedTodo;
};

</script>

<template>
    <Toast />
    <div class="mb-2 text-right">
        <Controller @complete-todo="updateTodos" />
    </div>
    
        <div class="grid">
            
            <div class="col-12 md:col-6 lg:col-4 xl:col-3" >
                <ItemDetail :code="local.code" :completed="completedTodo" />
            </div>
            <div class="col-12 md:col-6 lg:col-8 xl:col-9" >
                <ScrollPanel :style="{ width: '100%', height: '760px' }" >
                    <Accordion>
                        <AccordionTab header="Project's Information">
                            <ManageHeader :code="local.code" @complete-todo="updateTodos" />
                        </AccordionTab>
                        <AccordionTab header="Expected Revenue">
                            <ManageRevenue :code="local.code" @complete-todo="updateTodos" />
                        </AccordionTab>
                    </Accordion>
                    <ScrollTop target="parent" :threshold="100" icon="pi pi-angle-up" :buttonProps="{ severity: 'secondary', raised: true, rounded: true }" />
                </ScrollPanel>
                
            </div>

        </div>
    
    
</template>
