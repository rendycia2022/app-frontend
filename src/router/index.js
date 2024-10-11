import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from '@/layout/AppLayout.vue';
import AppLayoutReimbursement from '@/views/hr/layout/AppLayout.vue';
import AppLayoutProject from '@/views/project/layout/AppLayout.vue';
import AppLayoutAf from '@/views/af/layout/AppLayout.vue';
import AppLayoutMaintenance from '@/views/maintenance/layout/AppLayout.vue';
import AppLayoutCia from '@/layout/cia/AppLayout.vue';
import AppLayoutCp from '@/views/cp/layout/AppLayout.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'default',
            component: () => import('@/index.html')
        },

        // cp dashboard
        {
            path: '/cp',
            name: 'cpLogin',
            component: () => import('@/views/cp/auth/Login.vue')
        },
        {
            path: '/cp/auth/forgot',
            name: 'cpForgot',
            component: () => import('@/views/cp/auth/Forgot.vue')
        },
        {
            path: '/cp/auth/forgot/:email/result',
            name: 'cpForgotresult',
            component: () => import('@/views/cp/auth/ForgotResult.vue')
        },
        {
            path: '/cp/pages',
            component: AppLayoutCp,
            children: [
                
                {
                    path: '/cp/dashboard',
                    name: 'cpDashboard',
                    component: () => import('@/views/cp/pages/dashboard/MainDisplay.vue'),
                },
                {
                    path: '/cp/dashboard/milestone',
                    name: 'cpMilestone',
                    component: () => import('@/views/cp/pages/dashboard/components/Milestone.vue'),
                },
                
                // budget
                {
                    path: '/cp/budget/:project_id/:project_name',
                    name: 'cpBudget',
                    component: () => import('@/views/cp/pages/dashboard/Budget.vue'),
                },
                {
                    path: '/cp/budget/report',
                    name: 'cpBudgetReport',
                    component: () => import('@/views/cp/pages/dashboard/BudgetReport.vue'),
                },
                
            ]
        },
        // cia dashboard
        {
            path: '/cia',
            name: 'ciaLogin',
            component: () => import('@/views/cia/auth/Login.vue')
        },
        {
            path: '/cia/auth/forgot',
            name: 'ciaForgot',
            component: () => import('@/views/cia/auth/Forgot.vue')
        },
        {
            path: '/cia/auth/forgot/:email/result',
            name: 'ciaForgotresult',
            component: () => import('@/views/cia/auth/ForgotResult.vue')
        },
        {
            path: '/cia/pages',
            component: AppLayoutCia,
            children: [

                // new design start

                {
                    path: '/cia/project/new/list',
                    name: 'ciaPageProjectListNew',
                    component: () => import('@/views/cia/pages/project/newList.vue'),
                },
                {
                    path: '/cia/project/new/chart',
                    name: 'ciaPageProjectChartNew',
                    component: () => import('@/views/cia/pages/project/components/newChart.vue'),
                },

                // new design end

                {
                    path: '/cia/dashboard',
                    name: 'ciaDashboard',
                    component: () => import('@/views/cia/pages/MainDisplay.vue'),
                },
                {
                    path: '/cia/dashboard/finance',
                    name: 'ciaDashboardFinance',
                    component: () => import('@/views/cia/pages/DataFinance.vue'),
                },

                // project
                {
                    path: '/cia/project/summary',
                    name: 'ciaPageProjectSummary',
                    component: () => import('@/views/cia/pages/project/Summary.vue'),
                },
                {
                    path: '/cia/project',
                    name: 'ciaPageProject',
                    component: () => import('@/views/cia/pages/project/ProjectLayout.vue'),
                },
                {
                    path: '/cia/project/sites/:apps/:code',
                    name: 'ciaPageProjectSites',
                    component: () => import('@/views/cia/pages/project/Sites.vue'),
                },

                
            ]
        },

        // account financial
        {
            path: '/af',
            name: 'afLogin',
            component: () => import('@/views/af/auth/Login.vue')
        },
        {
            path: '/af/auth/forgot',
            name: 'afForgot',
            component: () => import('@/views/af/auth/Forgot.vue')
        },
        {
            path: '/af/auth/forgot/:email/result',
            name: 'afForgotresult',
            component: () => import('@/views/af/auth/ForgotResult.vue')
        },
        {
            path: '/af/pages',
            component: AppLayoutCia,
            children: [
                
                {
                    path: '/af/dashboard',
                    name: 'afDashboard',
                    component: () => import('@/views/af/pages/MainDisplay.vue'),
                    

                },
                {
                    path: '/af/items',
                    name: 'afItemsList',
                    component: () => import('@/views/af/pages/af/approval/Items.vue'),
                },

                // approval
                {
                    path: '/af/approval',
                    name: 'afApprovalList',
                    component: () => import('@/views/af/pages/af/approval/List.vue'),
                },
                {
                    path: '/af/approval/:id',
                    name: 'afApprovalDocument',
                    component: () => import('@/views/af/pages/af/approval/Document.vue'),
                },

                // access
                {
                    path: '/af/access',
                    name: 'afAccess',
                    component: () => import('@/views/af/pages/af/Access.vue'),
                },

                
            ]
        },


        // maintenance
        {
            path: '/maintenance',
            name: 'maintenanceLogin',
            component: () => import('@/views/maintenance/auth/Login.vue')
        },
        {
            path: '/maintenance/auth/forgot',
            name: 'maintenanceForgot',
            component: () => import('@/views/maintenance/auth/Forgot.vue')
        },
        {
            path: '/maintenance/auth/forgot/:email/result',
            name: 'maintenanceForgotresult',
            component: () => import('@/views/maintenance/auth/ForgotResult.vue')
        },
        {
            path: '/maintenance/pages',
            component: AppLayoutMaintenance,
            children: [
                
                {
                    path: '/maintenance/dashboard',
                    name: 'maintenanceDashboard',
                    component: () => import('@/views/maintenance/dashboard/MainDisplay.vue'),
                    children:[
                        {
                            path: '/maintenance/dashboard/data',
                            component: () => import('@/views/maintenance/dashboard/components/Workorders.vue')
                        },
                    ]

                },

                
            ]
        },

        // development
        {
            path: '/development/datatable/:user_id',
            name: 'DevDataTable',
            component: () => import('@/views/development/datatable/DataTable.vue'),
        },
        {
            path: '/development/datatable/:user_id/headers',
            name: 'DevDataTable_Headers',
            component: () => import('@/views/development/datatable/Headers.vue'),
        },
        {
            path: '/development/example',
            name: 'DevExample',
            component: () => import('@/views/development/Example.vue'),
        },

        // wctr
        {
            path: '/bast/wctr',
            name: 'wctr',
            component: () => import('@/views/bast/wctr/List.vue')
        },

        // project routes start
        
        {
            path: '/project',
            name: 'loginProject',
            component: () => import('@/views/project/auth/Login.vue')
        },
        {
            path: '/project/auth/forgot',
            name: 'forgotProject',
            component: () => import('@/views/project/auth/Forgot.vue')
        },
        {
            path: '/project/auth/forgot/:email/result',
            name: 'forgotresultProject',
            component: () => import('@/views/project/auth/ForgotResult.vue')
        },
        // new app
        {
            path: '/project/new',
            component: AppLayoutCia,
            children: [
                
                {
                    path: '/project/new/dashboard',
                    name: 'ProjectNewDashboard',
                    component: () => import('@/views/project/newApp/MainDisplay.vue')
                },
                {
                    path: '/project/new/dashboard/:code',
                    name: 'ProjectNewDetail',
                    component: () => import('@/views/project/newApp/DetailDisplay.vue')
                },
            ]
        },
        // print to pdf
        {
            path: '/project/summary/:projectId/direct/:directId/pdf',
            name: 'DirectCostPdf',
            component: () => import('@/views/project/summary/cost/component/PurchasingRequestPdf.vue')
        },
        {
            path: '/project/pages',
            component: AppLayoutProject,
            children: [
                
                {
                    path: '/project/summary/dashboard',
                    name: 'ProjectSummaryDashboard',
                    component: () => import('@/views/project/summary/Dashboard.vue')
                },
                {
                    path: '/project/summary/:projectId/dashboard',
                    name: 'ProjectSummaryProjectDashboard',
                    component: () => import('@/views/project/summary/component/DashboardProject.vue')
                },
                {
                    path: '/project/summary/:projectId/detail',
                    name: 'ProjectSummaryDetail',
                    component: () => import('@/views/project/summary/DashboardDetail.vue'),
                },
                {
                    path: '/project/summary/purchasing',
                    name: 'ProjectSummaryPurchasing',
                    component: () => import('@/views/project/summary/Purchasing.vue')
                },
            ]
        },


        // project routes end

        // hr routes start
        {
            path: '/hr',
            name: 'loginHr',
            component: () => import('@/views/hr/auth/Login.vue')
        },
        {
            path: '/hr/auth/forgot',
            name: 'forgotHr',
            component: () => import('@/views/hr/auth/Forgot.vue')
        },
        {
            path: '/auth/forgot/:email/result',
            name: 'forgotresultHr',
            component: () => import('@/views/hr/auth/ForgotResult.vue')
        },

        //reimbursement
        {
            path: '/reimbursement/transaction/:id/print',
            name: 'notfoundHr',
            component: () => import('@/views/hr/reimbursement/TransactionPrint.vue')
        },
        {
            path: '/hr/pages',
            component: AppLayoutReimbursement,
            children: [
                
                {
                    path: '/reimbursement/dashboard',
                    name: 'reimbursementDashboard',
                    component: () => import('@/views/hr/reimbursement/Dashboard.vue'),
                    children: [
                        {
                            path: '/reimbursement/dashboard/request',
                            component: () => import('@/views/hr/reimbursement/dashboard/Request.vue')
                        },
                        {
                            path: '/reimbursement/dashboard/approval',
                            component: () => import('@/views/hr/reimbursement/dashboard/Approval.vue')
                        },
                        {
                            path: '/reimbursement/dashboard/payment',
                            component: () => import('@/views/hr/reimbursement/dashboard/Payment.vue')
                        },
                    ]
                },
                {
                    path: '/reimbursement/users',
                    name: 'reimbursementUsers',
                    component: () => import('@/views/hr/reimbursement/Users.vue')
                },
                {
                    path: '/reimbursement/plafon',
                    name: 'reimbursementPlafon',
                    component: () => import('@/views/hr/reimbursement/Plafon.vue')
                },
                {
                    path: '/reimbursement/report',
                    name: 'reimbursementReportHeader',
                    component: () => import('@/views/hr/reimbursement/report/Header.vue')
                },
                {
                    path: '/reimbursement/report/usage/:user_id/:plafon_id',
                    name: 'reimbursementReportUsage',
                    component: () => import('@/views/hr/reimbursement/report/Usage.vue')
                },
                {
                    path: '/reimbursement/setting/general',
                    name: 'settingGeneral',
                    component: () => import('@/views/hr/setting/General.vue')
                },
                
            ]
        },
        {
            path: '/info/user',
            name: 'infouser',
            component: () => import('@/views/info/user.vue')
        },
        // hr routes end
        
        {
            path: '/dashboard',
            name: 'dashboard',
            component: () => import('@/views/Dashboard.vue')
        },
        {
            path: '/landing',
            name: 'landing',
            component: () => import('@/views/pages/Landing.vue')
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },
        {
            path: '/auth/login',
            name: 'loginExample',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        },
        {
            path: '/pages',
            component: AppLayout,
            children: [
                {
                    path: '/uikit/formlayout',
                    name: 'formlayout',
                    component: () => import('@/views/uikit/FormLayout.vue')
                },
                {
                    path: '/uikit/input',
                    name: 'input',
                    component: () => import('@/views/uikit/Input.vue')
                },
                {
                    path: '/uikit/floatlabel',
                    name: 'floatlabel',
                    component: () => import('@/views/uikit/FloatLabel.vue')
                },
                {
                    path: '/uikit/invalidstate',
                    name: 'invalidstate',
                    component: () => import('@/views/uikit/InvalidState.vue')
                },
                {
                    path: '/uikit/button',
                    name: 'button',
                    component: () => import('@/views/uikit/Button.vue')
                },
                {
                    path: '/uikit/table',
                    name: 'table',
                    component: () => import('@/views/uikit/Table.vue')
                },
                {
                    path: '/uikit/list',
                    name: 'list',
                    component: () => import('@/views/uikit/List.vue')
                },
                {
                    path: '/uikit/tree',
                    name: 'tree',
                    component: () => import('@/views/uikit/Tree.vue')
                },
                {
                    path: '/uikit/panel',
                    name: 'panel',
                    component: () => import('@/views/uikit/Panels.vue')
                },

                {
                    path: '/uikit/overlay',
                    name: 'overlay',
                    component: () => import('@/views/uikit/Overlay.vue')
                },
                {
                    path: '/uikit/media',
                    name: 'media',
                    component: () => import('@/views/uikit/Media.vue')
                },
                {
                    path: '/uikit/menu',
                    component: () => import('@/views/uikit/Menu.vue'),
                    children: [
                        {
                            path: '/uikit/menu',
                            component: () => import('@/views/uikit/menu/PersonalDemo.vue')
                        },
                        {
                            path: '/uikit/menu/seat',
                            component: () => import('@/views/uikit/menu/SeatDemo.vue')
                        },
                        {
                            path: '/uikit/menu/payment',
                            component: () => import('@/views/uikit/menu/PaymentDemo.vue')
                        },
                        {
                            path: '/uikit/menu/confirmation',
                            component: () => import('@/views/uikit/menu/ConfirmationDemo.vue')
                        }
                    ]
                },
                {
                    path: '/uikit/message',
                    name: 'message',
                    component: () => import('@/views/uikit/Messages.vue')
                },
                {
                    path: '/uikit/file',
                    name: 'file',
                    component: () => import('@/views/uikit/File.vue')
                },
                {
                    path: '/uikit/charts',
                    name: 'charts',
                    component: () => import('@/views/uikit/Chart.vue')
                },
                {
                    path: '/uikit/misc',
                    name: 'misc',
                    component: () => import('@/views/uikit/Misc.vue')
                },
                {
                    path: '/blocks',
                    name: 'blocks',
                    component: () => import('@/views/utilities/Blocks.vue')
                },
                {
                    path: '/utilities/icons',
                    name: 'icons',
                    component: () => import('@/views/utilities/Icons.vue')
                },
                {
                    path: '/pages/timeline',
                    name: 'timeline',
                    component: () => import('@/views/pages/Timeline.vue')
                },
                {
                    path: '/pages/empty',
                    name: 'empty',
                    component: () => import('@/views/pages/Empty.vue')
                },
                {
                    path: '/pages/crud',
                    name: 'crud',
                    component: () => import('@/views/pages/Crud.vue')
                },
                {
                    path: '/documentation',
                    name: 'documentation',
                    component: () => import('@/views/utilities/Documentation.vue')
                }
            ]
        },
        
    ]
});

export default router;
