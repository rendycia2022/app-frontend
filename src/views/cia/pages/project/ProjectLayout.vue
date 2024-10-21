<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/cia/composables/layout';
import History from './components/History.vue';
import { useRoute } from 'vue-router'

const local = ref({
    user_id: localStorage.getItem('userId'),
    token: localStorage.getItem('token'),
});

onMounted(() => {
    var port = route.params.projectInitial;
    local.value.link = 'http://103.188.175.175:'+port+'/dashboard';
});

const route = useRoute()
watch(() => route.params.projectInitial, async newValue => {
    var port = newValue;
    local.value.link = 'http://103.188.175.175:'+port+'/dashboard';
  }
);

</script>

<template>
    <div class="grid">
        <div class="col-9">
            <div class="container">
                <iframe class="responsive-iframe" :src="local.link"></iframe>
            </div>
        </div>
        <div class="col-3">
            <History />
        </div>
    </div>
    
</template>

<style scoped>
    .container {
        position: relative;
        overflow: hidden;
        height: 100%;
        width: 100%;
        padding-top: 56.25%; /* 16:9 Aspect Ratio (divide 9 by 16 = 0.5625) */
    }
  
  /* Then style the iframe to fit in the container div with full height and width */
  .responsive-iframe {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    width: 100%;
    height: 870px;
  }
</style>