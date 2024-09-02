<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';

const local = ref({
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
});

// toast 
import { useToast } from 'primevue/usetoast';
const toast = useToast();

</script>

<template>
    <table class="text-left">
        <tr>
            <th><small>PO Number:</small></th>
        </tr>
        <tr>
            <th><small>Project's Name:</small></th>
        </tr>
        <tr>
            <th><small>Project's Type:</small></th>
        </tr>
        <tr>
            <th><small>Customer:</small></th>
        </tr>
        <tr>
            <th><small>Assign Ref:</small></th>
        </tr>
        <tr>
            <th><small>Assign Date:</small></th>
        </tr>
        <tr>
            <th><small>Linked Ref:</small></th>
        </tr>
    </table>
</template>
