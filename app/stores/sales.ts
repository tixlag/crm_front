// stores/warehouses.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiFetch } from '~/composables/apiFetch'
import moment from "moment/moment";

interface StockLog {
    timestamp: string
    user: {}
    userId: number
    product: {}
    productId: number
    toWarehouse: {}
    toWarehouseId?: number
    fromWarehouse: {}
    fromWarehouseId?: number
    activityType: WarehouseStockType
    count: number
    isConfirmed?: boolean,
    confirmedById?: number,
}

enum WarehouseStockType {
    ADD,
    REMOVE,
    TRANSFER,
    SOLD,
    SOLD_BACK,
    CHANGE_ORDER,
}
export const warehouseSalesShort = [
     {name: "Продано", type: "SOLD"},
     {name: "Возврат", type: "SOLD_BACK"},
 ]


 interface Product {
    id: number
    name: string
    sku: string
    category: {
        name: string
    }
}

 interface Statistics {
    productId: number
    productName: string
    totalSold: number
}

interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    limit: number
}

export const useSalesStore = defineStore('sales', () => {
    const stockLogs = ref<StockLog[]>([])
    const stockLogsDates = ref<number>([])
    const total = ref(0)
    const currentPage = ref(1)
    const limit = ref(10)
    const filters = ref<Record<string, any>>({})
    const loading = ref(false)
    const error = ref({})
    const globalFilterValue = ref('')
    const managers = ref([])
    const datesWithSoled = ref<number>([])


    const fetchStockLogs = async (page = 1, newLimit?: number, onlyMove = false ) => {
        loading.value = true
        error.value = null
        currentPage.value = page
        limit.value = newLimit ?? limit.value
        let normalizeFilters = {};
        normalizeFilters = await normalFilters(onlyMove);
        try {
            const response: PaginatedResponse<StockLog> = await apiFetch('/warehouses/stock-movements', {
                method: 'GET',
                params: {
                    page: currentPage.value,
                    limit: limit.value,
                    ...normalizeFilters
                },
                // data: filters.value,
            })
            stockLogs.value = response.data
            total.value = response.total
            // currentPage.value = response.page
            // limit.value = response.limit
            await nextTick()
        } catch (error) {
            console.error('Ошибка при получении складов:', error)
        } finally {
            loading.value = false
        }

        async function normalFilters() {
            // Преобразуем фильтры в формат, ожидаемый сервером
            const filtersToApply: Record<string, any> = {}
            for (const key in filters.value) {
                if (key === 'global') continue
                if (['startDate', 'endDate'].includes(key)) {
                    if (filters.value[key].value) {
                        const tmpTime = filters.value[key].value
                        // filtersToApply[key] = new Date(tmpTime.getTime() - (tmpTime.getTimezoneOffset() * 60000)).toISOString()
                        filtersToApply[key] = moment(tmpTime).utc(true).format()
                    }
                } else if (filters.value[key].value) {
                    filtersToApply[key] = filters.value[key].value
                }
            }
            if (!filtersToApply.activityType) filtersToApply.activityType = ['SOLD', 'SOLD_BACK']

            return filtersToApply
        }
    }

    const addProductToStockLog = async (addProductData: { productId: number; warehouseId: number; count: number, date: Date }) => {
        try {
            const stockLog = await apiFetch('/warehouses/stock-adjustment', {
                method: 'POST',
                body: addProductData
            })
            stockLogs.value.push(stockLog)
            total.value++
        } catch (error) {
            console.error('Ошибка при добавлении продукта на склад:', error)
        }
    }

    const editAddProductToStockLog = async (editAddProductData: { id: number, productId: number; warehouseId: number; count: number, date: Date }) => {
        try {
            const editedStockLog = await apiFetch(`/warehouses/stock-adjustment/${editAddProductData.id}`, {
                method: 'PATCH',
                body: editAddProductData
            })
            const index = stockLogs.value.findIndex(b => b.id === editedStockLog.id)
            if (index !== -1) {
                stockLogs.value[index] = editedStockLog // Предполагается, что сервер возвращает обновлённого покупателя
            }
        } catch (error) {
            console.error('Ошибка при изменении остатков на складе:', error)
        }
    }

    const moveProduct = async (moveProductData: { productId: number; sourceStockLogId: number; targetStockLogId: number; count: number }) => {
        try {
            await apiFetch('/warehouses/move-product', {
                method: 'POST',
                body: moveProductData
            })
        } catch (error) {
            console.error('Ошибка при перемещении продукта:', error)
        }
    }

    const deleteStockLog = async (id: number) => {
        try {
            await apiFetch(`/warehouses/${id}`, {
                method: 'DELETE'
            })
        } catch (error) {
            console.error('Ошибка при удалении склада:', error)
        }
    }

    const confirmStockLogOperation = async (id: number) => {
        try {
            const confirmedStockLog = await apiFetch(`/warehouses/confirm-stock/${id}`, {
                method: 'POST',
            })
            const index = stockLogs.value.findIndex(b => b.id === confirmedStockLog.id)
            if (index !== -1) {
                stockLogs.value[index].isConfirmed = confirmedStockLog.isConfirmed
                stockLogs.value[index].confirmedById = confirmedStockLog.confirmedById
            }
        } catch (error) {
            console.error('Ошибка при подтверждении операции на складе:', error)
        }
    }

    const setFilters = async (newFilters: Record<string, any>) => {
        filters.value = newFilters
    }

    const setFilter = async (name: string, value: any) => {
        filters.value[name] = { value }
    }

    const setGlobalFilter = (value: string) => {
        globalFilterValue.value = value
    }

    const searchStockLogsByString = async (search: string) => {
        try {
            const response: PaginatedResponse<StockLog> = await apiFetch('/warehouses/search-string', {
                method: 'GET',
                params: {
                    search,
                    page: 1,
                    limit: limit.value
                }
            })
            stockLogs.value = response.data
            total.value = response.total
            currentPage.value = response.page
            limit.value = response.limit
        } catch (error) {
            console.error('Ошибка при поиске складов по строке:', error)
        }
    }

    const resetFilters = () => {
        filters.value = {}
        globalFilterValue.value = ''
    }

    const fetchSalesStatistics = async (startDate: Date, endDate: Date): Promise<Statistics[]> => {
        try {
            const response: Statistics[] = await apiFetch('/warehouses/statistics', {
                method: 'GET',
                params: {
                    startDate: moment(startDate).utc(true).format(),
                    endDate: moment(endDate).utc(true).format()
                }
            })
            return response
        } catch (error) {
            console.error('Ошибка при получении статистики продаж:', error)
            return []
        }
    }

    const fetchStockDates = async (month: number, year: number) => {
        try {
            const response: PaginatedResponse<StockLog> = await apiFetch('/warehouses/stock-dates', {
                method: 'GET',
                params: {
                    month,
                    year
                },
            })
            stockLogsDates.value = response
            // await nextTick()
        } catch (error) {
            console.error('Ошибка при получении днец с записями перемещений', error)
        }
    }

    const fetchDatesWithSoled = async (month: number, year: number) => {
        try {
            const response: PaginatedResponse<StockLog> = await apiFetch('/warehouses/dates-with-soled', {
                method: 'GET',
                params: {
                    month,
                    year
                },
            })
            datesWithSoled.value = response
            // await nextTick()
        } catch (error) {
            console.error('Ошибка при получении днец с записями перемещений', error)
        }
    }
    const fetchManagers = async () => {
        try {
            const response = await apiFetch('/users/managers', {
                method: 'GET',
            })
            managers.value = response
            // await nextTick()
        } catch (error) {
            console.error('Ошибка при получении днец с записями перемещений', error)
        }
    }

    return {
        stockLogs,
        stockLogsDates,
        datesWithSoled,
        total,
        currentPage,
        limit,
        filters,
        loading,
        managers, // todo по хорошему перенести в отдльный стор
        fetchManagers, //и это
        fetchStockLogs,
        addProductToStockLog,
        editAddProductToStockLog,
        moveProduct,
        deleteStockLog,
        confirmStockLogOperation,
        setFilters,
        setFilter,
        setGlobalFilter,
        searchStockLogsByString,
        resetFilters,
        fetchSalesStatistics,
        fetchStockDates,
        fetchDatesWithSoled,
        globalFilterValue
    }
})
