import {formatCurrency} from "~/utils/common-utils";
import moment from 'moment'

export const useStatisticsStore = defineStore("statisticsStore", () => {
    const sales = ref<SalesStatistics>()
    const bd = ref<BDStatistics>()
    const month = ref<MonthStatistics>()

    const products = ref<ProductsStatistics>({list: []})
    const deliveries = ref<DeliveriesStatistics[]>()
    const managers = ref<ManagersStatistics[]>()
    const statuses = ref<StatusesStatistics[]>()

    const fetchBDStatistics = async (start: Date, end?: Date) => {
        try {

            const startFormat = moment(start).utc(true).format();
            const endFormat = end ? moment(end).utc(true).endOf('day').format(): undefined;
            bd.value =
                await apiFetch<BDStatistics>('/statistics/bd', {
                    method: 'GET',
                    params: {start: startFormat, end: endFormat},
                })
        } catch (error) {
            console.log("Не удалось получить статистику запросов менеджеров к бд. " + error)
        }
    }
    const fetchSalesStatistics = async (start: Date, end?: Date) => {
        try {
            const startFormat = moment(start).utc(true).format();
            const endFormat = end ? moment(end).utc(true).endOf('day').format(): undefined
            sales.value =
                await apiFetch<SalesStatistics>('/statistics/sale', {
                    method: 'GET',
                    params: {start: startFormat, end: endFormat},
                })
        } catch (error) {
            console.log("Не удалось получить статистику продаж. " + error)
            // throw new Error("Не удалось получить статистику продаж. " + error)
        }
    }

    const fetchMonthStatistics = async (start: Date, end?: Date) => {
        try {
            const startFormat = moment(start).utc(true).format();
            const endFormat = end ? moment(end).utc(true).endOf('day').format(): undefined
            month.value =
                await apiFetch<MonthStatistics>('/statistics/month', {
                    method: 'GET',
                    params: {start: startFormat, end: endFormat},
                })
        } catch (error) {
            console.log("Не удалось получить статистику за месяц. " + error)
        }
    }

    const fetchProductsStatistics = async (start: Date, end?: Date) => {
        try {
            const startFormat = moment(start).utc(true).format();
            const endFormat = end ? moment(end).utc(true).endOf('day').format(): undefined
            products.value =
                await apiFetch<ProductsStatistics>('/statistics/products', {
                    method: 'GET',
                    params: {start: startFormat, end: endFormat},
                })
        } catch (error) {
            console.log("Не удалось получить статистику продуктов. " + error)
        }
    }

    const fetchDeliveriesStatistics = async (start: Date, end?: Date) => {
        try {
            const startFormat = moment(start).utc(true).format();
            const endFormat = end ? moment(end).utc(true).endOf('day').format(): undefined
            deliveries.value =
                await apiFetch<DeliveriesStatistics[]>('/statistics/deliveries', {
                    method: 'GET',
                    params: {start: startFormat, end: endFormat},
                })
        } catch (error) {
            console.log("Не удалось получить статистику продуктов. " + error)
        }
    }

    const fetchManagersStatistics = async (start: Date, end?: Date) => {
        try {
            const startFormat = moment(start).utc(true).format();
            const endFormat = end ? moment(end).utc(true).endOf('day').format(): undefined
            managers.value =
                await apiFetch<ManagersStatistics[]>('/statistics/managers', {
                    method: 'GET',
                    params: {start: startFormat, end: endFormat},
                })
        } catch (error) {
            console.log("Не удалось получить статистику продуктов. " + error)
        }
    }

    const fetchStatusesStatistics = async (start: Date, end?: Date) => {
        try {
            const startFormat = moment(start).utc(true).format();
            const endFormat = end ? moment(end).utc(true).endOf('day').format(): undefined
            statuses.value =
                await apiFetch<StatusesStatistics[]>('/statistics/statuses', {
                    method: 'GET',
                    params: {start: startFormat, end: endFormat},
                })
        } catch (error) {
            console.log("Не удалось получить статистику продуктов. " + error)
        }
    }

    return {
        sales,
        bd,
        products,
        deliveries,
        managers,
        statuses,

        fetchSalesStatistics,
        fetchBDStatistics,
        fetchProductsStatistics,
        fetchDeliveriesStatistics,
        fetchManagersStatistics,
        fetchStatusesStatistics,
    }
})


export interface SalesStatistics {
    totalAmountByStatus: Record<string, any>;
    deliveryPriceByType: Record<string, any>;
}

export interface BDStatistics {
    usersRequests: {
        userId: number,
        _sum: { count: number },
    }[];
    topByUrl: {
        userId: number,
        _sum: { count: number },
        url: string,
        method: string,
    }[];
}

export interface MonthStatistics {
    products: {
        id: number,
        name: string,
        sku: string,
        count: number,
        purchasePrice: number,
    }[]
}

export interface ProductsStatistics {
    list: {
            id: number,
            name: string,
            sku: string,
            count: number,
            purchasePrice: number,
            _sum: {
                count: number,
                price: number,
            }
        }[]
    total: {
        count: number,
        totalRevenue: number,
        purchasePrice: number,
        totalPurchase: number,
        difTotal: number,
        avgDifTotal: number,
    } | undefined
}

export interface DeliveriesStatistics {
    deliveryTypeId: number,
    _sum: {
        deliveryPrice: number
    },
    _count: number,

}

export interface ManagersStatistics {
    managerId: number,
    _sum: {
        totalAmount: number
    },
    _count: number,

}

export interface StatusesStatistics {
    statusId: number,
    _sum: {
        totalAmount: number
    },
    _count: number,
}


