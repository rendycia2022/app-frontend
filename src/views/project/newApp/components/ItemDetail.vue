<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useRouter } from 'vue-router';

// components
import Header from './detail/Header.vue';
import Plan from './detail/Plan.vue';
import Revenue from './detail/Revenue.vue';

const local = ref({
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
    code: (new URL(window.location.href)).pathname.split('/')[4],
});

// toast 
import { useToast } from 'primevue/usetoast';
const toast = useToast();

// router
const router = useRouter();

// define
const props = defineProps(['code', 'completed']);

const selected = () =>{
    router.push({path: '/project/new/dashboard/'+props.code});
}

const completedBudget= ref({});
const updateBudget = (updated) => {
    completedBudget.value = updated;
};
</script>

<template>
    <div class="card border-200 border-2 hover:border-primary transition-duration-300 transition-all" style="border-radius: 10px">
        <Header :code="props.code" :completed="props.completed" />
        <Plan :code="props.code" :completed="props.completed" @complete-budget="updateBudget"/>
        <Revenue :code="props.code" :completed="props.completed" :budget="completedBudget" />
        <div class="text-center" v-if="props.code !== local.code" >
            <Button @click="selected" label="See more" severity="info" size="small" rounded text aria-label="See more" />
        </div>
    </div>
</template>
