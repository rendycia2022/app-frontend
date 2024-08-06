<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast';

import { axiosCpSmart, axiosHR } from '../../../../../service/axios';

const toast = useToast();

const local = ref({
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
});
const props = defineProps(['params']);
onMounted( async () => {
    if(props.params.data[props.params.milestone.code+'_actual']){
        product.value.actual_date = props.params.data[props.params.milestone.code+'_actual'].value;
        product.value.created_at = props.params.data[props.params.milestone.code+'_actual'].created_at;

        // get user
        const created_by = props.params.data[props.params.milestone.code+'_actual'].created_by;

        const user = await axiosHR.get('/public/user/'+created_by,{
                    params:{
                        token: localStorage.getItem('token'),
                        user_id: localStorage.getItem('id'),
                    }
                });
        // console.log(user.data)
        if(user.data.message.name){
            product.value.created_by = user.data.message.name;
        }
    }
    
    // console.log(props.params.data[props.params.milestone.code+'_actual'].value);
});

const product = ref({});
const payload = ref({});

// save
const saveProduct = async () =>{
    payload.value.local = local.value;
    payload.value.data = props.params.data;
    payload.value.actual_date = formatDate(payload.value.actual_date);
    
    const data = payload.value;
    const params = props.params.milestone.code;
    const response = await axiosCpSmart.post('/dashboard/management/actual/'+params, data);
    if(response.data.status == 200){
        product.value.actual_date = response.data.actual;
        payload.value = {};
    }
}

// formating
const formatDate = (date) => {
    if(date === null){
        return null;
    }

    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

</script>

<template>
    <Card>
        <Toast />
        <template #title>
            <small>Milestone: {{ props.params.milestone.title }}</small>
        </template>
        <template #subtitle>
            <small>Deadline: {{ props.params.data[props.params.milestone.code] }}</small>
        </template>
        <template #content>
            <div class="flex flex-wrap gap-4 mb-5">
                <div class="flex-auto">
                    <label for="actual_date" class="small block mb-2">Select Date: <b v-tooltip="'Actual Date set'">{{ product.actual_date }}</b></label>
                    <Calendar 
                        v-model="payload.actual_date" 
                        :selectOtherMonths="true" 
                        dateFormat="yy-mm-dd" 
                        :showIcon="true" :showButtonBar="true" class="w-full" 
                    >
                    </Calendar>
                    <small v-if="product.created_by" >
                        <span class="small block">Updated By {{ product.created_by }} at {{ product.created_at }}</span>
                    </small>
                </div>
            </div>
            
            <div class="grid">
                <div class="flex justify-content-end col-12" >
                    <Button label="Success" severity="success" size="small" @click="saveProduct" rounded />
                </div> 
            </div>
            
        </template>
    </Card>
</template>

<style lang="scss" scoped>
</style>

