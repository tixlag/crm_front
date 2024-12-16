// stores/warehouses.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiFetch } from '~/composables/apiFetch'
import moment from "moment";

export interface Warehouse {
    id: number
    name: string
    address: string
    isConfirmed: boolean
}

export interface Product {
    id: number
    name: string
    sku: string
    category: {
        name: string
    }
}

export interface Statistics {
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

export const useWarehousesStore = defineStore('warehouses', () => {
    const warehouses = ref<Warehouse[]>([])
    const total = ref(0)
    const currentPage = ref(1)
    const limit = ref(10)
    const filters = ref<Record<string, any>>({})
    const loading = ref(false)
    const globalFilterValue = ref('')

    const fetchWarehouses = async () => {
        loading.value = true
        try {
            const response: PaginatedResponse<Warehouse> = await apiFetch('/warehouses', {
                method: 'GET',
                params: {
                    page: currentPage.value,
                    limit: limit.value,
                    ...filters.value
                }
            })
            warehouses.value = response.data
            total.value = response.total
            currentPage.value = response.page
            limit.value = response.limit
        } catch (error) {
            console.error('Ошибка при получении складов:', error)
        } finally {
            loading.value = false
        }
    }

    const addProductToWarehouse = async (addProductData: { productId: number; warehouseId: number; count: number, date: Date }) => {
        try {
            await apiFetch('/warehouses/stock-adjustment', {
                method: 'POST',
                body: addProductData
            })
        } catch (error) {
            console.error('Ошибка при добавлении продукта на склад:', error)
        }
    }



    const moveProduct = async (moveProductData: { productId: number; sourceWarehouseId: number; targetWarehouseId: number; count: number }) => {
        try {
            await apiFetch('/warehouses/move-product', {
                method: 'POST',
                body: moveProductData
            })
        } catch (error) {
            console.error('Ошибка при перемещении продукта:', error)
        }
    }

    const deleteWarehouse = async (id: number) => {
        try {
            await apiFetch(`/warehouses/${id}`, {
                method: 'DELETE'
            })
        } catch (error) {
            console.error('Ошибка при удалении склада:', error)
        }
    }

    const confirmWarehouseOperation = async (id: number) => {
        try {
            await apiFetch(`/warehouses/confirm/${id}`, {
                method: 'PATCH'
            })
        } catch (error) {
            console.error('Ошибка при подтверждении операции на складе:', error)
        }
    }

    const setFilters = (newFilters: Record<string, any>) => {
        filters.value = newFilters
    }

    const setFilter = (value: string) => {
        filters.value['name'] = { value }
    }

    const setGlobalFilter = (value: string) => {
        globalFilterValue.value = value
    }

    const searchWarehousesByString = async (search: string) => {
        try {
            const response: PaginatedResponse<Warehouse> = await apiFetch('/warehouses/search-string', {
                method: 'GET',
                params: {
                    search,
                    page: 1,
                    limit: limit.value
                }
            })
            warehouses.value = response.data
            total.value = response.total
            // currentPage.value = response.page
            // limit.value = response.limit
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

    return {
        warehouses,
        total,
        currentPage,
        limit,
        filters,
        loading,
        fetchWarehouses,
        addProductToWarehouse,
        moveProduct,
        deleteWarehouse,
        confirmWarehouseOperation,
        setFilters,
        setFilter,
        setGlobalFilter,
        searchWarehousesByString,
        resetFilters,
        fetchSalesStatistics,
        globalFilterValue
    }
})
