<script setup>
import { onMounted, reactive, ref, watch, onBeforeMount, defineProps } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast';

import { axiosCpSmart, axiosHR } from '../../../../service/axios';

const toast = useToast();

const local = ref({
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
});

onMounted(() => {
    fetching();
});

const products = ref(null);
const fetching = async () =>{
    const response = await axiosCpSmart.get('/budget/report',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    products.value = response.data.list;
    // console.log(products.value)
}

// filtering start
import { FilterMatchMode, FilterOperator } from 'primevue/api';
const filters = ref();

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        project_name: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        ringspan_name: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        budget_name: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        budget_value: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
        total_request: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
        balance: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
        
    };
};

initFilters();

const clearFilter = () => {
    initFilters();
};

// filtering end

// export start
const dt = ref();
const exportCSV = () => {
    dt.value.exportCSV();
};

// export end

// formating data
const formatCurrency = (value) => {
    return value?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
};

const getFullDateTime = () => {
    
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear(),

        hours = d.getHours(),
        minutes = d.getMinutes(),
        seconds = d.getSeconds();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    let newDateFormated =  [year, month, day].join('-');

    let newTimeFormated = [hours, minutes, seconds].join('');

    return newDateFormated+" "+newTimeFormated;
}


</script>

<template>
    
    <div class="card">
        <DataTable 
            :value="products" 
            
            v-model:filters="filters"
            dataKey="budget_id" 
            filterDisplay="menu"
            :globalFilterFields="['project_name', 'ringspan_name', 'budget_name', 'budget_value', 'total_request', 'balance']"
            removableSort
            
            :paginator="true"
            :rows="50"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[50, 100, 200]"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} items"

            responsiveLayout="scroll"
            size="small"
            scrollable scrollHeight="800px"

            ref="dt"
            csvSeparator=";"
            :exportFilename="'Report_budget_'+getFullDateTime()"
            
        >   
            <template #header>
                <div class="flex justify-content-between">
                    <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilter()" />
                    <span class="block mt-2 md:mt-0 p-input-icon-left">
                        <i class="pi pi-search" />
                        <InputText v-model="filters['global'].value" placeholder="Search..." />
                    </span>
                    <Button icon="pi pi-external-link" severity="success" label="Export" @click="exportCSV($event)" />
                </div>
            </template>
            <template #empty> No Items found. </template>
            <Column header="#" headerStyle="width:3rem">
                <template #body="slotProps">
                    {{ slotProps.index + 1 }}
                </template>
            </Column>
            <Column field="project_name" header="Project's Name" sortable >
                <template #body="{ data }">
                    <small>{{ data.project_name }}</small>
                </template>
                <template #filter="{ filterModel }">
                    <InputText v-model="filterModel.value" type="text" class="p-column-filter" />
                </template>
            </Column>
            <Column field="ringspan_name" header="Segment" sortable >
                <template #body="{ data }">
                    <small>{{ data.ringspan_name }}</small>
                </template>
                <template #filter="{ filterModel }">
                    <InputText v-model="filterModel.value" type="text" class="p-column-filter" />
                </template>
            </Column>
            <Column field="budget_name" header="Budget's Name" sortable >
                <template #body="{ data }">
                    <small>{{ data.budget_name }}</small>
                </template>
                <template #filter="{ filterModel }">
                    <InputText v-model="filterModel.value" type="text" class="p-column-filter" />
                </template>
            </Column>
            <Column field="budget_value" header="Budget" sortable filterField="budget_value" dataType="numeric" >
                <template #body="{ data }">
                    <small>{{ formatCurrency(data.budget_value) }}</small>
                </template>
                <template #filter="{ filterModel }">
                    <InputNumber v-model="filterModel.value" mode="currency" currency="IDR" locale="id-ID" />
                </template>
            </Column>
            <Column field="total_request" header="Request" sortable filterField="total_request" dataType="numeric" >
                <template #body="{ data }">
                    <small>{{ formatCurrency(data.total_request) }}</small>
                </template>
                <template #filter="{ filterModel }">
                    <InputNumber v-model="filterModel.value" mode="currency" currency="IDR" locale="id-ID" />
                </template>
            </Column>
            <Column field="balance" header="Balance" sortable filterField="balance" dataType="numeric" >
                <template #body="{ data }">
                    <small>{{ formatCurrency(data.balance) }}</small>
                </template>
                <template #filter="{ filterModel }">
                    <InputNumber v-model="filterModel.value" mode="currency" currency="IDR" locale="id-ID" />
                </template>
            </Column>
            
        </DataTable>
    </div>

</template>

<style lang="scss" scoped>
</style>

