<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useRoute } from 'vue-router'

import History from './History.vue';

const local = ref({
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
});

onMounted(() => {
    var apps = route.params.apps;
    var code = route.params.code;
    local.value.link = 'http://103.188.175.175:'+apps+'/workorder/scope/'+code;
    local.value.object = '<iframe class="responsive-iframe" src="'+local.value.link+'"></iframe>';
});

const route = useRoute()
watch(() => route.params.code, async newValue => {
    var apps = route.params.apps;
    var code = newValue;
    local.value.link = 'http://103.188.175.175:'+apps+'/workorder/scope/'+code;
  }
);

</script>

<template>
    <div class="card">
      <div class="grid">
          <div class="col-12 sm:col-12 md:col-6 lg:col-9 xl:col-9">
            <div class="container">
                <iframe class="responsive-iframe" :src="local.link"></iframe>
            </div>
          </div>
          <div class="col-12 sm:col-12 md:col-6 lg:col-3 xl:col-3">
              <History />
          </div>
      </div>
    </div>
    
</template>

<style scoped>
    .container {
        position: relative;
        overflow: hidden;
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
    height: 100%;
  }
</style>

