// stores/orders.ts

import {defineStore} from 'pinia'
import {ref} from 'vue'
import {apiFetch} from '~/composables/apiFetch'
import type {PaginatedResponse} from "~/components/scripts/pagination";
import type {Buyer} from "~/stores/buyers";
import {applyBackgroundColor} from "~/utils/order-utils";
import moment from 'moment';

export interface Product {
    id: number
    name: string
    sku: string
    purchasePrice: number
    recommendedPrice: number
    comments: []
    category: {}

}

export interface OrderProduct {
    product: Product
    count: number
    price: number
    discountPercent: number
    discountFixed: number

}

export interface Order {
    id?: number
    number?: number
    createdAt?: Date
    isPaid?: boolean
    isCompleted?: boolean
    deliveryAddress?: boolean
    products?: OrderProduct[] & any
    managerId?: number,
    manager?: {}
    buyerId?: number
    buyer?: Buyer & any


    comments?: { id: number, content: string }[] & any// Если сервер возвращает комментарии таким образом

    status?: { id: number; name: string, color: string }
    warehouse?: { id: number; name: string, color: string }
    payType?: { id: number; name: string, color: string }
    source?: { id: number; name: string, color: string }
    cheque?: { id: number; name: string, template: string }
    deliveryType?: { id: number; name: string, color: string }
    deliveryPrice?: number
    discountPercent?: number
    discountConst?: number
    totalAmount?: number

}

export const useOrdersStore = defineStore('orders', () => {
    const orders = ref<Order[]>([])
    const total = ref(0)
    const currentPage = ref(1)
    const limit = ref(10)
    const searchQuery = ref('') // Для поиска по строке
    const searchFormFilters = ref<Record<string, any>>({}) // Для поиска по форме
    const isRemind = ref(false)

    const fetchOrders = async (init?: boolean) => {
        try {
            let endpoint = '/orders'
            let params: Record<string, any> = {page: currentPage.value, limit: limit.value}

            if (searchQuery.value) {
                endpoint = '/orders/searchByString'
                params.search = searchQuery.value
            } else if (Object.keys(searchFormFilters.value).length > 0) {
                endpoint = '/orders/search'

                params = {...params, ...searchFormFilters.value}
            }
            if (isRemind.value) {
                params.isRemind = isRemind.value
            }
            if (init) params = {
                startDate: moment().utc(true).subtract(2, 'days').startOf('day').format(),
                endDate: moment().utc(true).endOf('day').format(),
                isInit: true,
                ...params
            }
            const data: PaginatedResponse<Order> = await apiFetch(endpoint, {
                method: 'GET',
                params,
            })
            orders.value = data.data
            total.value = data.total
            // currentPage.value = data.page
            // limit.value = data.limit
            await nextTick(() => {
                applyBackgroundColor()
            });
        } catch (error) {
            console.error('Ошибка при получении заказов:', error.response?._data || error)
        }


    }

    const searchOrdersByString = async (search: string) => {
        searchQuery.value = search
        searchFormFilters.value = {}
        currentPage.value = 1
        await fetchOrders()
    }

    const searchOrdersByForm = async (filters: Record<string, any>) => {

        // Преобразуем фильтры в формат, ожидаемый сервером
        const filtersToApply: Record<string, any> = {}
        for (const key in filters) {
            if (key === 'global' || key === 'createdAt') continue
            if (key === 'products') {
                if (filters[key].value) {
                    filtersToApply[key] = filters[key].value.map(product => product.id)
                }
            } else if (['startDate', 'endDate'].includes(key)) {
                if (filters[key].value) {
                    const tmpTime = filters[key].value
                    // filtersToApply[key] = new Date(tmpTime.getTime() - (tmpTime.getTimezoneOffset() * 60000)).toISOString()
                    filtersToApply[key] = moment(tmpTime).utc(true).format()
                }
            } else if (filters[key].value) {
                filtersToApply[key] = filters[key].value
            }
        }

        searchFormFilters.value = filtersToApply
        searchQuery.value = ''
        currentPage.value = 1
        await fetchOrders()
    }

    const resetAllFilters = () => {
        searchQuery.value = ''
        searchFormFilters.value = {}
        currentPage.value = 1
    }

    const setPage = async (page: number) => {
        currentPage.value = page
        await fetchOrders()
    }

    const setLimit = async (newLimit: number) => {
        limit.value = newLimit
        currentPage.value = 1
        await fetchOrders()
    }

    const createOrder = async (orderData: any) => {
        try {
            const data = await apiFetch('/orders', {
                method: 'POST',
                body: orderData,
            })
            orders.value.push(data) // Добавляем в начало списка
            total.value++
            await nextTick(() => {
                applyBackgroundColor()
            });
        } catch (error) {
            console.error('Ошибка при создании заказа:', error.response?._data || error)
            throw error
        }
    }

    const updateOrder = async (id: number, orderData: any, isDeliveryMan = false) => {
        try {
            const data = await apiFetch(`/orders/${id + (isDeliveryMan ? '/deliveryMan' : '')}`, {
                method: 'PATCH',
                body: orderData,
            })
            const index = orders.value.findIndex(b => b.id === id)
            if (index !== -1) {
                orders.value[index] = data
            }
            await nextTick(() => {
                applyBackgroundColor()
            });
        } catch (error) {
            console.error('Ошибка при обновлении заказа:', error.response?._data || error)
            throw error
        }
    }

    const deleteOrder = async (id: number) => {
        try {
            await apiFetch(`/orders/${id}`, {
                method: 'DELETE',
            })
            orders.value = orders.value.filter(b => b.id !== id)
            total.value--
        } catch (error) {
            console.error('Ошибка при удалении заказа:', error.response?._data || error)
            throw error
        }
    }

    const fetchChangeLogs = async (id: number) => {
        try {
            return await apiFetch(`/orders/${id}/changes`, {
                method: 'GET',
            })

        } catch (error) {
            console.error('Ошибка при удалении заказа:', error.response?._data || error)
            throw error
        }
    }

    const payOrCloseOrder = async (id: number, type: 'pay' | 'complete', value: boolean) => {
        const field = type === 'pay' ? 'isPaid' : 'isCompleted'
        const body = {[field]: value}
        try {
            await apiFetch(`/orders/${id}/${type}`, {
                method: 'PATCH',
                body,
            })
            const index = orders.value.findIndex(b => b.id === id)
            if (index !== -1) {
                orders.value[index][field] = value
            }
            await nextTick()

        } catch (error) {
            console.error('Ошибка при удалении заказа:', error.response?._data || error)
            throw error
        }
    }


    return {
        orders,
        total,
        currentPage,
        limit,
        searchQuery,
        searchFormFilters,
        isRemind,

        fetchOrders,
        searchOrdersByString,
        searchOrdersByForm,
        resetFilters: resetAllFilters,
        setPage,
        setLimit,
        createOrder,
        updateOrder,
        deleteOrder,
        fetchChangeLogs,
        payOrCloseOrder,
    }
})
