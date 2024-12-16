// stores/buyers.ts

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiFetch } from '~/composables/apiFetch'
import {applyBackgroundColor} from "~/utils/order-utils";
import moment from 'moment';

export interface Buyer {
  id: number
  name: string
  nn: string
  numberName?: string
  emails?: { email: string }[]
  phones: { phone: string }[]
  addresses?: { address: string }[]
  comments?: { content: string }[] // Если сервер возвращает комментарии таким образом
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const useBuyersStore = defineStore('buyers', () => {
  const buyers = ref<Buyer[]>([])
  const total = ref(0)
  const currentPage = ref(1)
  const limit = ref(10)
  const searchQuery = ref('') // Для поиска по строке
  const searchFormFilters = ref<Record<string, any>>({}) // Для поиска по форме
  const orders = ref<Order[]>([])

  const totalOrder = ref(0)
  const currentPageOrder = ref(1)
  const limitOrder = ref(10)
  const searchQueryOrder = ref('') // Для поиска по строке
  const searchFormFiltersOrder = ref<Record<string, any>>({}) // Для поиска по форме



  const fetchOrders = async (buyerId: number) => {
    try {
      let endpoint = '/orders'
      let params: Record<string, any> = { page: currentPageOrder.value, limit: limitOrder.value, buyerId}

      if (searchQueryOrder.value) {
        endpoint = '/orders/search'
        params = {
          ...params,
          search: searchQueryOrder.value,
        }
      } else if (Object.keys(searchFormFiltersOrder.value).length > 0) {
        endpoint = '/orders/search'

        params = { ...params, ...searchFormFiltersOrder.value}
      }

      const data: PaginatedResponse<Order> = await apiFetch(endpoint, {
        method: 'GET',
        params,
      })
      orders.value = data.data
      totalOrder.value = data.total
      // currentPage.value = data.page
      // limit.value = data.limit
      await nextTick(() => {
        applyBackgroundColor()
      });
    } catch (error) {
      console.error('Ошибка при получении заказов для покупателя:', error.response?._data || error)
    }


  }

  const searchOrdersByString = async (search: string, buyerId: number) => {
    searchQueryOrder.value = search
    currentPageOrder.value = 1
    await fetchOrders(buyerId)
  }

  const searchOrdersByForm = async (filters: Record<string, any>, buyerId: number) => {

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

    searchFormFiltersOrder.value = filtersToApply
    searchQueryOrder.value = ''
    currentPageOrder.value = 1
    await fetchOrders(buyerId)
  }

  const fetchBuyers = async () => {
    try {
      let endpoint = '/buyers'
      let params: Record<string, any> = { page: currentPage.value, limit: limit.value }

      if (searchQuery.value) {
        endpoint = '/buyers/searchByString'
        params.search = searchQuery.value
      } else if (Object.keys(searchFormFilters.value).length > 0) {
        endpoint = '/buyers/search'

        params = { ...params, ...searchFormFilters.value}
      }

      const data: PaginatedResponse<Buyer> = await apiFetch(endpoint, {
        method: 'GET',
        params,
      })
      buyers.value = data.data
      total.value = data.total
      currentPage.value = data.page
      limit.value = data.limit
      await nextTick()
    } catch (error) {
      console.error('Ошибка при получении покупателей:', error.response?._data || error)
    }
  }

  const searchBuyersList = async (search: string): Promise<Buyer[]> => {
    let endpoint = '/buyers/searchByString'
    let params: Record<string, any> = { page: 1, limit: 10 }
      params.search = search

    const data: PaginatedResponse<Buyer> = await apiFetch(endpoint, {
      method: 'GET',
      params,
    })

    return data.data
  }

  const searchBuyersByString = async (search: string) => {
    searchQuery.value = search
    searchFormFilters.value = {}
    currentPage.value = 1
    await fetchBuyers()
  }

  const searchBuyersByForm = async (filters: Record<string, any>) => {

    // Преобразуем фильтры в формат, ожидаемый сервером
    const filtersToApply: Record<string, any> = {}
    for (const key in filters) {
      if (key === 'global') continue
      if (filters[key].value) {
        filtersToApply[key] = filters[key].value
      }
    }

    searchFormFilters.value = filtersToApply
    searchQuery.value = ''
    currentPage.value = 1
    await fetchBuyers()
  }

  const resetAllFilters = () => {
    searchQuery.value = ''
    searchFormFilters.value = {}
    currentPage.value = 1
  }

  const setPage = async (page: number) => {
    currentPage.value = page
    await fetchBuyers()
  }

  const setLimit = async (newLimit: number) => {
    limit.value = newLimit
    currentPage.value = 1
    await fetchBuyers()
  }

  const createBuyer = async (buyerData: any) => {
    try {
      const data = await apiFetch('/buyers', {
        method: 'POST',
        body: buyerData,
      })
      buyers.value.push(data) // Добавляем в начало списка
      total.value++
      return data
    } catch (error) {
      console.error('Ошибка при создании покупателя:', error.response?._data || error)
      throw error
    }
  }

  const updateBuyer = async (id: number, buyerData: any) => {
    try {
      const data = await apiFetch(`/buyers/${id}`, {
        method: 'PATCH',
        body: buyerData,
      })
      const index = buyers.value.findIndex(b => b.id === id)
      if (index !== -1) {
        buyers.value[index] = data // Предполагается, что сервер возвращает обновлённого покупателя
      }
      return data
    } catch (error) {
      console.error('Ошибка при обновлении покупателя:', error.response?._data || error)
      throw error
    }
  }

  const deleteBuyer = async (id: number) => {
    try {
      await apiFetch(`/buyers/${id}`, {
        method: 'DELETE',
      })
      buyers.value = buyers.value.filter(b => b.id !== id)
      total.value--
    } catch (error) {
      console.error('Ошибка при удалении покупателя:', error.response?._data || error)
      throw error
    }
  }

  return {
    buyers,
    total,
    currentPage,
    limit,
    searchQuery,
    searchFormFilters,
    //заказы
    orders,
    totalOrder,
    currentPageOrder,
    limitOrder,
    searchQueryOrder,
    //методы
    fetchBuyers,
    searchBuyersByString,
    searchBuyersByForm,
    searchBuyersList,
    resetFilters: resetAllFilters,
    setPage,
    setLimit,
    createBuyer,
    updateBuyer,
    deleteBuyer,
    //методы заказов
    fetchOrders,
    searchOrdersByString,
    searchOrdersByForm,
  }
})
