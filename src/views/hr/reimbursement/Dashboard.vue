<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { axiosHR } from '../../../service/axios';

const items = ref(null);
const badge = ref(null);
const paid = ref(null);
const approval = ref({});
const role = ref({});
const filters = ref({});

onBeforeMount(() => {
    initFilters();
});

// new plafon data for items in dashboard
onMounted(async () => {
    const result = await axiosHR.get('/reimbursment/dashboard/plafon',{
                params:{
                    token: localStorage.getItem('token'),
                    user_id: localStorage.getItem('id'),
                }
            });
    items.value = result.data.metadata.data;
});

// get notif plafon data
onMounted(async () => {
    const result = await axiosHR.get('/reimbursment/dashboard/approval',{
                params:{
                    token: localStorage.getItem('token'),
                    id: localStorage.getItem('id'),
                }
            });
    badge.value = result.data.metadata.count;
});

// get notif paid data
onMounted(async () => {
    const result = await axiosHR.get('/reimbursment/dashboard/paid',{
                params:{
                    token: localStorage.getItem('token'),
                }
            });
    paid.value = result.data.metadata.count;
    // console.log(result.data)
});


// get approval data
onMounted(async () => {
    const result = await axiosHR.get('/reimbursment/approval',{
                params:{
                    token: localStorage.getItem('token'),
                    id: localStorage.getItem('id'),
                }
            });
      approval.value = result.data.metadata.data;
});

// get role user
onMounted(async () => {
    const result = await axiosHR.get('/reimbursment/role/user',{
                params:{
                    token: localStorage.getItem('token'),
                    id: localStorage.getItem('id'),
                }
            });
    role.value = result.data.metadata.data;
});


const formatCurrency = (value) => {
    return value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
};

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};

</script>

<template>
    <div class="grid" >
        <div class="col-12 lg:col-6 xl:col-3" v-for="(item, i) in items" :key="item">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">{{ item.item }}</span>
                        <div class="text-900 font-medium text-xl">{{ formatCurrency(item.plafon) }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-blue-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-wallet text-green-500 text-xl"></i>
                    </div>
                </div>
                <div>
                    <span class="text-green-500 font-medium">{{ formatCurrency(item.base_plafon) }}</span> 
                    <span class="text-500">, base plafon</span>
                </div>
                <div>
                    <span class="text-red-500 font-medium">- {{ formatCurrency(item.usage) }}</span> 
                    <span class="text-500">, usage</span>
                </div>
                
            </div>
        </div>
    </div>
    <div class="card">
        <TabView class="tabview-custom">
            <TabPanel>
                <template #header>
                    <router-link to="/reimbursement/dashboard/request">
                        <Button label="Status Reimbursement" class="p-button-primary p-button-text" ></Button>
                    </router-link>
                </template>
                <router-view />
            </TabPanel>
            <TabPanel v-if="approval">
                <template #header>
                    <router-link to="/reimbursement/dashboard/approval">
                        <Button v-if="!badge" label="Reimbursement Approval" class="p-button-primary p-button-text" ></Button>
                        <Button v-else label="Reimbursement Approval" class="p-button-primary p-button-text" :badge="badge.toString()" badgeClass="p-badge-danger" ></Button>
                    </router-link>
                </template>
                <router-view />
            </TabPanel>
            <TabPanel v-if="role <= 1">
                <template #header>
                    <router-link to="/reimbursement/dashboard/payment">
                        <Button v-if="!paid" label="Reimbursement Payment" class="p-button-primary p-button-text" ></Button>
                        <Button v-else label="Reimbursement Payment" class="p-button-primary p-button-text" :badge="paid.toString()" badgeClass="p-badge-danger" ></Button>
                    </router-link>
                </template>
                <router-view />
            </TabPanel>
        </TabView>
    </div>
</template>
