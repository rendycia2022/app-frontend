<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';

// components
import Header from './detail/Header.vue';

const local = ref({
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
});

// toast 
import { useToast } from 'primevue/usetoast';
const toast = useToast();


// define
const props = defineProps(['code']);

</script>

<template>
    <div class="card mb-0">
        <div class="flex justify-content-between mb-5">
            <Header :code="props.code" />
        </div>
    </div>
</template>
