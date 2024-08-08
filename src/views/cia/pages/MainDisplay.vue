<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import SummaryProject from './project/Summary.vue';

</script>

<template>
    <SummaryProject />
</template>
