<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount, defineProps } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast';

import { axiosManagement } from '../../../../../service/axios';

const toast = useToast();

const local = ref({
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
});

// props
const props = defineProps(['params']);
onMounted(() => {
    fetching();
});

const events = ref(null);
const fetching = async () =>{
    const response = await axiosManagement.get('/project/new/bast/bypo',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
            code: props.params.po_number,
        }
    });
    events.value = response.data.events;
    // console.log(events.value)
}

// formating
const formatCurrency = (value) => {
    return value?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
};

// calculate
const calculateTotal = (label) =>{
    let total = 0;

    var items = events.value;

    for(let item in items){
        let payment = items[item].label
        if(payment == label){
            var raws = items[item].raw;
            for(let list in raws){
                let subtotal = raws[list].subtotal;

                total = total + subtotal;
            }
        }
    }

    return total;
}

const calculateQty = (label) =>{
    let total = 0;

    var items = events.value;

    for(let item in items){
        let payment = items[item].label
        if(payment == label){
            var raws = items[item].raw;
            for(let list in raws){
                let subtotal = raws[list].qty;

                total = total + subtotal;
            }
        }
    }

    return total;
}

</script>

<template>
    
    <Timeline :value="events" align="alternate" class="customized-timeline">
        <template #content="slotProps">
            <Card class="mt-4">
                <template #title>
                    {{ slotProps.item.label }}
                </template>
                <template #subtitle>
                    
                </template>
                <template #content>
                    <DataTable 
                        :value="slotProps.item.raw" 
                        tableStyle="min-width: 20rem" 
                        size="small"
                        sortField="date" :sortOrder="1"
                        removableSort 
                    >
                        <Column header="#">
                            <template #body="slotProps">
                                <small>{{ slotProps.index + 1 }}</small>
                            </template>
                        </Column>
                        <Column field="invoice_number" header="Invoice" sortable>
                            <template #body="slotTableProps">
                                <small>{{ slotTableProps.data.invoice_number }}</small>
                            </template>
                        </Column>
                        <Column field="date" header="Date" sortable>
                            <template #body="slotTableProps">
                                <small>{{ slotTableProps.data.date }}</small>
                            </template>
                        </Column>
                        <Column field="price" header="Unit Price">
                            <template #body="slotTableProps">
                                <small>{{ formatCurrency(slotTableProps.data.price) }}</small>
                            </template>
                        </Column>
                        <Column field="qty" header="Qty">
                            <template #body="slotTableProps">
                                <small>{{ slotTableProps.data.qty }}</small>
                            </template>
                        </Column>
                        <Column field="term" header="Term Percent">
                            <template #body="slotTableProps">
                                <small>{{ slotTableProps.data.term }}%</small>
                            </template>
                        </Column>
                        <Column field="subtotal" header="Subtotal">
                            <template #body="slotTableProps">
                                <small v-tooltip="'(price * (term / 100)) * qty'">{{ formatCurrency(slotTableProps.data.subtotal) }}</small>
                            </template>
                        </Column>
                        <template #footer="slotTableProps">
                            <div class="text-right font-bold w-full">
                                <small class="mr-3">Total Qty : {{ calculateQty(slotProps.item.label) }}</small>
                                <small>Total : {{ formatCurrency(calculateTotal(slotProps.item.label)) }}</small>
                            </div>
                        </template>
                    </DataTable>
                </template>
            </Card>
        </template>
    </Timeline>

</template>

<style lang="scss" scoped>
</style>

