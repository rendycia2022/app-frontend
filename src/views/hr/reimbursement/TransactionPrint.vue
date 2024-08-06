<script setup>
import { ref, onMounted, onBeforeMount } from 'vue';
import { axiosHR } from '../../../service/axios';

const transaction = ref({});
const transactionDetail = ref(null);
const dt = ref(null);
const filters = ref({});

onMounted(async () => {
    const transaction_id = (new URL(window.location.href)).pathname.split('/')[3];
    const transactionResult = await axiosHR.get('/reimbursment/data/transaction/id/'+transaction_id,{
    params:{
            token: localStorage.getItem('token'),
        }
    });
    if(transactionResult.status == 200){
        transaction.value = transactionResult.data.metadata.data;
    }
    //transaction end
    //transaction detail start
    const transactionDetailResult = await axiosHR.get('/reimbursment/data/transaction_detail/'+transaction_id,{
    params:{
            token: localStorage.getItem('token'),
        }
    });
    if(transactionDetailResult.status == 200){
        transactionDetail.value = transactionDetailResult.data.metadata.data;
    }
});

const formatCurrency = (value) => {
    return value?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
};
</script>

<template>
    <div class="surface-ground flex align-items-center justify-content-center min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <div style="border-radius: 56px; padding: 0.3rem;">
                <div class="w-full surface-card py-8 px-5 sm:px-8 flex flex-column align-items-center" style="border-radius: 53px">
                    <h1 class="text-900 font-bold text-3xl lg:text-5xl mb-2">Request Detail</h1>
                    <div class="w-full flex align-items-center py-5 border-300">
                        <span class="ml-4 flex flex-column mr-5">
                            <span class="text-900 lg:text-xl font-medium mb-0 block">Transaction ID:</span>
                            <span class="text-600 lg:text-xl">{{ transaction.request_id }}</span>
                        </span>
                        <span class="ml-4 flex flex-column mr-5">
                            <span class="text-900 lg:text-xl font-medium mb-0 block">Submitted Date:</span>
                            <span class="text-600 lg:text-xl">{{ transaction.created_at }}</span>
                        </span>    
                    </div>
                    <div class="w-full flex align-items-center py-5 border-300 border-bottom-1">
                        <span class="ml-4 flex flex-column mr-5">
                            <span class="text-900 lg:text-xl font-medium mb-0 block">Employee Name:</span>
                            <span class="text-600 lg:text-xl">{{ transaction.employee_name }}</span>
                        </span>
                        <span class="ml-4 flex flex-column mr-5">
                            <span class="text-900 lg:text-xl font-medium mb-0 block">Reimbursement:</span>
                            <span class="text-600 lg:text-xl">{{ transaction.plafon_item }}</span>
                        </span>
                        <span class="ml-4 flex flex-column mr-5">
                            <span class="text-900 lg:text-xl font-medium mb-0 block">Base Plafon:</span>
                            <span class="text-600 lg:text-xl">{{ formatCurrency(transaction.plafon_amount) }}</span>
                        </span>
                    </div>
                    <div class="w-full flex align-items-center py-5 border-300 border-bottom-1">
                        <span class="ml-4 flex flex-column mr-5">
                            <span class="text-900 lg:text-xl font-medium mb-0 block">Usage:</span>
                            <span class="text-600 lg:text-xl">{{ formatCurrency(transaction.usage) }}</span>
                        </span>
                        <span class="ml-4 flex flex-column mr-5">
                            <span class="text-900 lg:text-xl font-medium mb-0 block">Total Amount:</span>
                            <span class="text-600 lg:text-xl">{{ formatCurrency(transaction.total_amount) }}</span>
                        </span>
                        <span class="ml-4 flex flex-column mr-5">
                            <span class="text-900 lg:text-xl font-medium mb-0 block">Balance:</span>
                            <span class="text-600 lg:text-xl">{{ formatCurrency(transaction.balance) }}</span>
                        </span>
                    </div>
                    <div class="w-full flex align-items-center py-2 ">
                        <span class="ml-4 flex flex-column mr-5">
                            <span class="text-900 lg:text-xl font-medium mb-0 block">Status:</span>
                            <span class="text-600 lg:text-xl"><Tag class="mr-2" :severity="transaction.status_id?.severity" :value="transaction.status_id?.label" :rounded="true"></Tag></span>
                        </span>
                    </div>
                    <div class="w-full flex align-items-center py-5 border-300 border-bottom-1 col-12 grid">
                        <span class="ml-4 flex flex-column md:col-12" v-for="(item, i) in transaction.approval" :key="item">
                            <span class="text-900 lg:text-xl font-medium mb-0 block">Approval {{ i+1 }}:</span>
                            <span class="text-600 lg:text-xl">{{ formatCurrency(item.name) }}</span>
                        </span>
                    </div>

                    <div>
                        <DataTable :value="transactionDetail" responsiveLayout="scroll">
                            <Column field="files" header="Files" headerStyle="width:20%; min-width:10rem;">
                                <template #body="slotProps">
                                    <span class="p-column-title">Files</span>
                                    <div class="grid">
                                        <Image v-for="(item, i) in slotProps.data.files" :key="item" :src="item" :alt="item" class="mr-2" width="25" height="25" preview />
                                    </div>
                                </template>
                            </Column>
                            <Column field="description" header="Description" headerStyle="width:20%; min-width:10rem;">
                                <template #body="slotProps">
                                    <span class="p-column-title">Description</span>
                                    {{ slotProps.data.description }}
                                </template>
                            </Column>
                            <Column field="treatment" header="Treatment Place" headerStyle="width:20%; min-width:10rem;">
                                <template #body="slotProps">
                                    <span class="p-column-title">Treatment Place</span>
                                    {{ slotProps.data.treatment }}
                                </template>
                            </Column>
                            <Column field="amount" header="Amount" headerStyle="width:20%; min-width:10rem;">
                                <template #body="slotProps">
                                    <span class="p-column-title">Amount</span>
                                    {{ formatCurrency(slotProps.data.amount) }}
                                </template>
                            </Column>
                            <Column field="effective_date" header="Effective date" headerStyle="width:20%; min-width:10rem;">
                                <template #body="slotProps">
                                    <span class="p-column-title">Effective date</span>
                                    {{ slotProps.data.effective_date }}
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                    
                </div>
            </div>
        </div>
    </div>
</template>
