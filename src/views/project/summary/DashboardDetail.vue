<script setup>
import { ref, } from 'vue';
import DashboardProject from './component/DashboardProject.vue';
import DashboardProgress from './component/DashboardProgress.vue';
import Revenue from './Revenue.vue';
import Direct from './cost/Direct.vue';
import Indirect from './cost/Indirect.vue';
import PurchaseOrder from './cost/PurchaseOrder.vue';
import BudgetOrder from './cost/BudgetOrder.vue';
import SitesTracker from './cost/SitesTracker.vue';


const display = ref({
    height: screen.height+'px',
});

const todos = ref(false)
const updateTodos = (updatedTodo) => {
    todos.value = updatedTodo;
};

</script>

<template>
    <div class="grid">
        <div class="col-4 sm:col-12 lg:col-4 xl:col-4" >
            <ScrollPanel :style="{ width: '100%', height: display.height }" >
                <DashboardProject :todos="todos" />
                <DashboardProgress :todos="todos" />
            </ScrollPanel>
        </div>
        <div class="col-8 sm:col-12 lg:col-8 xl:col-8" >
            <ScrollPanel :style="{ width: '100%', height: display.height }" >
                <Accordion>
                    <AccordionTab header="Expected Revenue Services">
                        <Revenue @complete-todo="updateTodos" />
                    </AccordionTab>
                    <AccordionTab header="Indirect Cost">
                        <Indirect @complete-todo="updateTodos" />
                    </AccordionTab>
                    <AccordionTab header="Direct Cost">
                        <Direct @complete-todo="updateTodos" />
                    </AccordionTab>
                    <AccordionTab header="Request Budget">
                        <div class="mb-5">
                            <BudgetOrder :todos="todos" />
                        </div>
                        <div>
                            <PurchaseOrder :todos="todos" />
                        </div>
                    </AccordionTab>
                    <AccordionTab header="Tracking Sites">
                        <div class="mb-5">
                            <SitesTracker :todos="todos" />
                        </div>
                    </AccordionTab>
                </Accordion>
                <ScrollTop target="parent" :threshold="10" icon="pi pi-arrow-up"></ScrollTop>
            </ScrollPanel>
        </div>  
    </div>
    
    
</template>