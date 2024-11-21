<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { axiosProject, axiosManagement } from '../../../../../service/axios';

const local = ref({
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
});

// toast 
import { useToast } from 'primevue/usetoast';
const toast = useToast();

// define
const props = defineProps(['code', 'completed']); 
watch(() => props.completed, async (newValue, oldValue) => {
    fetching();  
});
watch(() => props.code, async (newValue, oldValue) => {
    fetching();  
});

// data
const slicingText = ref(20);
const products = ref(null);
const externalLink = ref({});
const fetching = async () =>{
    const response = await axiosProject.get('/v2/projects/'+props.code,{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    products.value = response.data;

    const responseDocument = await axiosManagement.get('/public/file/po',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
            document: products.value[0].po_number,
        }
    });
    externalLink.value = responseDocument.data.link;
}

onMounted(() => {
    fetching();
});

const openLink = (link) =>{
    window.open(link, '_blank').focus();
}

</script>

<template>
    <table class="text-left mb-3" v-for="(n, index) in products" > 
        <tr>
            <td><small>PO Number:</small></td>
            <td>
                <small v-if="n.po_number?.length > slicingText" v-tooltip="n.po_number" class="font-bold">{{ n.po_number.slice(0, slicingText) }}...</small>
                <small v-else class="font-bold">{{ n.po_number }}</small>
                <small v-tooltip="'PO Document'" @click="openLink(externalLink)" class="cursor-pointer" >
                    <i class="pi pi-fw pi-external-link text-xs text-blue-500 ml-2"></i>
                </small> 
            </td>
        </tr>
        <tr>
            <td><small>Project's Name:</small></td>
            <td>
                <small v-if="n.name?.length > slicingText" v-tooltip="n.name" class="font-bold">{{ n.name.slice(0, slicingText) }}...</small>
                <small v-else class="font-bold">{{ n.name }}</small>
            </td>
        </tr>
        <tr>
            <td><small>Project's Type:</small></td>
            <td>
                <small v-if="n.type?.length > slicingText" v-tooltip="n.type" class="font-bold">{{ n.type.slice(0, slicingText) }}...</small>
                <small v-else class="font-bold">{{ n.type }}</small>
            </td>
        </tr>
        <tr>
            <td><small>Customer:</small></td>
            <td>
                <small v-if="n.customer?.length > slicingText" v-tooltip="n.customer" class="font-bold">{{ n.customer.slice(0, slicingText) }}...</small>
                <small v-else class="font-bold">{{ n.customer }}</small>
            </td>
        </tr>
        <tr>
            <td><small>Assign Ref:</small></td>
            <td>
                <small v-if="n.ref?.length > slicingText" v-tooltip="n.ref" class="font-bold">{{ n.ref.slice(0, slicingText) }}...</small>
                <small v-else class="font-bold">{{ n.ref }}</small>
            </td>
        </tr>
        <tr>
            <td><small>Assign Date:</small></td>
            <td><small class="font-bold">{{ n.date }}</small></td>
        </tr>
        <tr>
            <td><small>Project:</small></td>
            <td><small class="font-bold">{{ n.project.code }}</small></td>
        </tr>
    </table>
</template>
