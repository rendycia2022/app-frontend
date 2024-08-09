<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount, defineProps } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast';

import { axiosCpSmart, axiosHR } from '../../../../service/axios';

const toast = useToast();

const local = ref({
    project: (new URL(window.location.href)).pathname.split('/')[3],
    project_id: (new URL(window.location.href)).pathname.split('/')[4],
    project_name: (new URL(window.location.href)).pathname.split('/')[5],
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
});

onMounted(() => {
    fetching();
    
});

const products = ref(null);
const fetching = async () =>{
    const response = await axiosCpSmart.get('/budget/plan/'+local.value.project_id+'/'+local.value.project_name,{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    products.value = response.data
    console.log(products.value);
}

// filter
const filters = ref({});
onBeforeMount(() => {
    initFilters();
});
const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};

// New
const openNew = () =>{

}


</script>

<template>
    
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toast />
                <h5 class="mb-2 text-900">Privacy</h5>
                <span class="text-600">Neque egestas congue quisque.</span>

                <DataTable
                    :value="products"
                    removableSort
                    :paginator="true"
                    :rows="25"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[25, 50, 100]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                    responsiveLayout="scroll"
                    scrollable scrollHeight="500px"
                    size="small"
                >
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <div class="flex items-center gap-2">
                                <Button icon="pi pi-plus" severity="success" v-tooltip="'Create'" outlined rounded aria-label="New" @click="openNew" />
                            </div>
                            <h5>Budget</h5>
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Search" type="text" class="w-32 sm:w-auto" style="border-radius: 3rem" />
                            </span>
                        </div>
                    </template>

                    <Column header="#" headerStyle="width:2%; min-width:2rem;">
                        <template #body="slotProps">
                            <small>{{ slotProps.index + 1 }}</small>
                        </template>
                    </Column>
                    <Column field="percent" header="Percent" :sortable="true" headerStyle="width:5%; min-width:5rem;">
                        <template #body="slotProps">
                        </template>
                    </Column>
                    
                </DataTable>

                
            </div>
        </div>
    </div>

</template>

<style lang="scss" scoped>
</style>

