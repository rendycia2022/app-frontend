<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import { axiosHR } from '../../../../service/axios';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const products = ref(null);
const selectedProducts = ref(null);
const dt = ref(null);
const filters = ref({});

onBeforeMount(() => {
    initFilters();
});
onMounted( async() => {
    const user_id = (new URL(window.location.href)).pathname.split('/')[4];
    const plafon_id = (new URL(window.location.href)).pathname.split('/')[5];
    await axiosHR.get('/reimbursment/data/transaction_detail/'+user_id+'/'+plafon_id,{
        params:{
            token: localStorage.getItem('token'),
        }
    })
    .then(response => {
        products.value = response.data.metadata.users;
    })
    .catch(error => {
        console.log(error)
    })
});

const formatCurrency = (value) => {
    return value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
};

const exportCSV = () => {
    dt.value.exportCSV();
};

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toast />
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <!-- filter area-->
                            <router-link to="/reimbursement/report">
                                <Button type="button" class="mr-2 mb-2" label="Back" icon="pi pi-angle-left" />
                            </router-link>
                        </div>
                    </template>

                    <template v-slot:end>
                        <Button label="Export" icon="pi pi-upload" class="p-button-help" @click="exportCSV($event)" />
                    </template>
                </Toolbar>

                <DataTable
                    ref="dt"
                    :value="products"
                    v-model:selection="selectedProducts"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25, 100]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                    responsiveLayout="scroll"
                >
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Detail Usage</h5>
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Search..." />
                            </span>
                        </div>
                    </template>
                    <Column field="emp_id" header="EMP ID" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">EMP ID</span>
                            {{ slotProps.data.emp_id }}
                        </template>
                    </Column>
                    <Column field="name" header="Name" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Name</span>
                            {{ slotProps.data.name }}
                        </template>
                    </Column>
                    <Column field="date_join" header="Date Join" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Date Join</span>
                            {{ slotProps.data.date_join }}
                        </template>
                    </Column>
                    <Column field="level" header="Level" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Level</span>
                            {{ slotProps.data.level }}
                        </template>
                    </Column>
                    <Column field="grade" header="Grade" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Grade</span>
                            {{ slotProps.data.grade }}
                        </template>
                    </Column>
                    <Column field="item" header="Item" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Item</span>
                            {{ slotProps.data.item }}
                        </template>
                    </Column>
                    <Column field="base_plafon" header="Base Plafon" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Base Plafon</span>
                            {{ formatCurrency(slotProps.data.base_plafon) }}
                        </template>
                    </Column>
                    <Column field="usage" header="Usage" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Usage</span>
                            {{ formatCurrency(slotProps.data.usage) }}
                        </template>
                    </Column>
                    <Column field="plafon" header="Plafon" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Plafon</span>
                            {{ formatCurrency(slotProps.data.plafon) }}
                        </template>
                    </Column>
                </DataTable>

                <!-- Dialog start -->
                <!-- Dialog end -->
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import '@/assets/demo/styles/badges.scss';
</style>
