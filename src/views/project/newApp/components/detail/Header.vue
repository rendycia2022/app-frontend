<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { axiosProject } from '../../../../../service/axios';

const local = ref({
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
});

// toast 
import { useToast } from 'primevue/usetoast';
const toast = useToast();

// define
const props = defineProps(['code']);

// data
const slicingText = ref(25);
const products = ref(null);
const fetching = async () =>{
    const response = await axiosProject.get('/v2/projects/'+props.code,{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    products.value = response.data;
}

onMounted(() => {
    fetching();
});

</script>

<template>
    <table class="text-left">
        <tr>
            <td><small>PO Number:</small></td>
            <td>
                <small v-if="products?.po_number.length > slicingText" v-tooltip="products?.po_number" class="font-bold">{{ products?.po_number.slice(0, slicingText) }}...</small>
                <small v-else class="font-bold">{{ products?.po_number }}</small>
            
            </td>
        </tr>
        <tr>
            <td><small>Project's Name:</small></td>
            <td>
                <small v-if="products?.name.length > slicingText" v-tooltip="products?.name" class="font-bold">{{ products?.name.slice(0, slicingText) }}...</small>
                <small v-else class="font-bold">{{ products?.name }}</small>
            </td>
        </tr>
        <tr>
            <td><small>Project's Type:</small></td>
            <td>
                <small v-if="products?.type.length > slicingText" v-tooltip="products?.type" class="font-bold">{{ products?.type.slice(0, slicingText) }}...</small>
                <small v-else class="font-bold">{{ products?.type }}</small>
            </td>
        </tr>
        <tr>
            <td><small>Customer:</small></td>
            <td>
                <small v-if="products?.customer.length > slicingText" v-tooltip="products?.customer" class="font-bold">{{ products?.customer.slice(0, slicingText) }}...</small>
                <small v-else class="font-bold">{{ products?.customer }}</small>
            </td>
        </tr>
        <tr>
            <td><small>Assign Ref:</small></td>
            <td>
                <small v-if="products?.ref.length > slicingText" v-tooltip="products?.ref" class="font-bold">{{ products?.ref.slice(0, slicingText) }}...</small>
                <small v-else class="font-bold">{{ products?.ref }}</small>
            </td>
        </tr>
        <tr>
            <td><small>Assign Date:</small></td>
            <td><small class="font-bold">{{ products?.date }}</small></td>
        </tr>
        <tr>
            <td><small>Linked Ref:</small></td>
            <td><small class="font-bold">{{ products?.project }}</small></td>
        </tr>
    </table>
</template>
