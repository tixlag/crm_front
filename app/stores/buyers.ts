// stores/buyers.ts

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiFetch } from '~/composables/apiFetch'
import type {PaginatedResponse} from "~/components/scripts/pagination";

export interface Buyer {
  id: number
  name: string
  numberName: string
  emails: string[]
  phones: string[]
  address: string[]
  googleContactId?: string
  createdAt: string
  updatedAt: string
}



export const useBuyersStore = defineStore('buyers', () => {
  const buyers = ref<Buyer[]>([])
  const total = ref(0)
  const currentPage = ref(1)
  const limit = ref(10)
  const searchQuery = ref('') // Для поиска по строке
  const searchFormFilters = ref({}) // Для поиска по форме

  const fetchBuyers = async (page: number = 1, limitPerPage: number = 10) => {
    try {
      const data: PaginatedResponse<Buyer> = await apiFetch('/buyers', {
        method: 'GET',
        params: { page, limit: limitPerPage },
      })
      buyers.value = data.data
      total.value = data.total
      currentPage.value = data.page
      limit.value = data.limit
    } catch (error) {
      console.error('Ошибка при получении покупателей:', error.response?._data || error)
    }
  }

  const searchBuyersByString = async (search: string, page: number = 1, limitPerPage: number = 10) => {
    try {
      const data: PaginatedResponse<Buyer> = await apiFetch('/buyers/searchByString', {
        method: 'GET',
        params: { search, page, limit: limitPerPage },
      })
      buyers.value = data.data
      total.value = data.total
      currentPage.value = data.page
      limit.value = data.limit
      searchQuery.value = search
    } catch (error) {
      console.error('Ошибка при поиске покупателей по строке:', error.response?._data || error)
    }
  }

  const searchBuyersByForm = async (filters: Record<string, any>, page: number = 1, limitPerPage: number = 10) => {
    try {
      const data: PaginatedResponse<Buyer> = await apiFetch('/buyers/search', {
        method: 'GET',
        params: { ...filters, page, limit: limitPerPage },
      })
      buyers.value = data.data
      total.value = data.total
      currentPage.value = data.page
      limit.value = data.limit
      searchFormFilters.value = filters
    } catch (error) {
      console.error('Ошибка при поиске покупателей по форме:', error.response?._data || error)
    }
  }

  const createBuyer = async (buyerData: any) => {
    try {
      const data = await apiFetch('/buyers', {
        method: 'POST',
        body: buyerData,
      })
      buyers.value.push(data)
      total.value++
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
        buyers.value[index] = data.data
      }
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
    fetchBuyers,
    searchBuyersByString,
    searchBuyersByForm,
    createBuyer,
    updateBuyer,
    deleteBuyer,
  }
})
