// stores/product.ts


import {apiFetch} from "~/composables/apiFetch";

export interface Warehouse {
    id: number
    name: string
    address: string
}

export interface Stock {
    warehouse: Warehouse
    count: number
}

export interface Product {
    id: number
    name: string
    sku: string
    comment?: string
    categoryId: number
    purchasePrice?: number
    recommendedPrice?: number
    sortOrder: number
    warehouseProducts: Stock[]
}

export interface CategoryProduct {
    id: number
    name: string
    parentId?: number
}

interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

export const useProductsStore = defineStore('products', () => {
    const products = ref<Product[]>([])
    const categories = ref<CategoryProduct[]>([])
    const warehouses = ref<Warehouse[]>([])
    const total = ref(0)
    const currentPage = ref(1)
    const limit = ref(10)
    const searchQuery = ref('')
    const searchFormFilters = ref<Record<string, any>>({})
    const loading = ref(false)
    const allProducts = ref<Product[]>([])
    const withStocks = ref(false)
    const warehouseId = ref(null)

    const fetchProducts = async () => {
        loading.value = true
        try {
            let endpoint = '/products'
            let params: Record<string, any> = {page: currentPage.value, limit: limit.value}
            if (withStocks.value) params = {...params, withStocks: true}
            if (warehouseId.value) params = {...params, warehouseId: warehouseId.value}
            if (searchQuery.value) {
                endpoint = '/products/search'
                params.search = searchQuery.value
            } else if (Object.keys(searchFormFilters.value).length > 0) {
                endpoint = '/products/search'
                params = {...params, ...searchFormFilters.value}
            }

            const data: PaginatedResponse<Product> = await apiFetch(endpoint, {
                method: 'GET',
                params,
            })
            products.value = data.data
            total.value = data.total
            currentPage.value = data.page
            limit.value = data.limit
            // await nextTick()
        } catch (error) {
            console.error('Ошибка при получении продуктов:', error.response?._data || error)
        } finally {
            loading.value = false
            await nextTick()
        }
    }

    const fetchCategories = async () => {
        try {
            let params = undefined
            if (withStocks.value) params = {withStocks: true}
            const response = await apiFetch('/products/category/all', {params})
            categories.value = response
            await nextTick()
        } catch (error) {
            console.error('Ошибка при получении категорий:', error.response?._data || error)
        }
    }

    const fetchProductsByCategoryId = async (id: number) => {
        loading.value = true
        try {
            let endpoint = `/products/category/${id}/sub` //по sub получаем продукты и подкатегорий
            let params: Record<string, any> = {page: currentPage.value, limit: limit.value}
            if (withStocks.value) params = {...params, withStocks: true}

            if (searchQuery.value) {
                params.search = searchQuery.value
            } else if (Object.keys(searchFormFilters.value).length > 0) {
                params = {...params, ...searchFormFilters.value}
            }
            const data: PaginatedResponse<Product> = await apiFetch(endpoint, {
                method: 'GET',
                params,
            })
            products.value = data.data
            total.value = data.total
            currentPage.value = data.page
            limit.value = data.limit
            // await nextTick()
        } catch (error) {
            console.error('Ошибка при получении категорий:', error.response?._data || error)
        } finally {
            await nextTick()
            loading.value = false
        }
    }

    const fetchWarehouses = async () => {
        try {
            const response = await apiFetch('/warehouses')
            warehouses.value = response
        } catch (error) {
            console.error('Ошибка при получении складов:', error.response?._data || error)
        }
    }

    const createCategory = async (category: CreateCategoryDto) => {
        const params = {method: 'POST', body: category}
        const cat = await apiFetch<CategoryProduct>('/products/category', params)
        categories.value.push(cat)
        return cat

    }
    const updateCategory = async (id: number, category: UpdateCategoryDto) => {
        const params = {method: 'PATCH', body: category}
        return apiFetch(`/products/category/${id}`, params)
    }
    const deleteCategory = async (id: number) => {
        const params = {method: 'DELETE'}
        await apiFetch(`/products/category/${id}`, params)
        await fetchCategories()
    }

    const searchProductsByString = async (search: string, categoryId?: number) => {
        searchQuery.value = search
        searchFormFilters.value = {}
        currentPage.value = 1
        if (categoryId) {
            await fetchProductsByCategoryId(categoryId)
        } else {
            await fetchProducts()
        }
    }

    const searchProductsByForm = async (filters: Record<string, any>, categoryId?: number) => {
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
        if (categoryId) {
            await fetchProductsByCategoryId(categoryId)
        } else {
            await fetchProducts()
        }
    }

    const resetAllFilters = () => {
        searchQuery.value = ''
        searchFormFilters.value = {}
        currentPage.value = 1
    }

    const setPage = async (page: number) => {
        currentPage.value = page
        await fetchProducts()
    }

    const setLimit = async (newLimit: number) => {
        limit.value = newLimit
        currentPage.value = 1
        await fetchProducts()
    }

    const createProduct = async (productData: CreateProductDto) => {
        try {
            const data = await apiFetch<Product>('/products', {
                method: 'POST',
                body: productData,
            })
            products.value.unshift(data)
            total.value++
        } catch (error) {
            console.error('Ошибка при создании продукта:', error.response?._data || error)
            throw error
        }
    }

    const updateProduct = async (id: number, productData: UpdateProductDto) => {
        try {
            const data = await apiFetch(`/products/${id}`, {
                method: 'PUT',
                body: productData,
            })
            const index = products.value.findIndex(p => p.id === id)
            if (index !== -1) {
                products.value[index] = data
            }
        } catch (error) {
            console.error('Ошибка при обновлении продукта:', error.response?._data || error)
            throw error
        }
    }

    const deleteProduct = async (id: number) => {
        try {
            await apiFetch(`/products/${id}`, {
                method: 'DELETE',
            })
            products.value = products.value.filter(p => p.id !== id)
            total.value--
        } catch (error) {
            console.error('Ошибка при удалении продукта:', error.response?._data || error)
            throw error
        }
    }

    const reorder = async (productsList: Product[], categoryId: number, dragIndex: number, dropIndex: number) => {
        const fromIndex = (currentPage.value - 1) * limit.value + dragIndex + 1
        let toIndex: number;
        if (dragIndex < dropIndex) {
            toIndex = (currentPage.value - 1) * limit.value + products.value[dropIndex].sortOrder + 1
            products.value[dragIndex].sortOrder = toIndex
            for (let i = dropIndex + 1; i < productsList.length; i++) {
                products.value[i].sortOrder = toIndex + i
            }
        } else {
            toIndex = (currentPage.value - 1) * limit.value + products.value[dropIndex].sortOrder - 1

            products.value[dragIndex].sortOrder = toIndex
            for (let i = dropIndex - 1; i > 0; i--) {
                products.value[i].sortOrder = toIndex - i
            }
        }
        products.value.sort((a, b) => a.sortOrder - b.sortOrder)
        // products.value[dropIndex].sortOrder = toIndex
        // products.value.forEach((product, index) => {
        //     if (product.sortOrder > toIndex)
        //         product.sortOrder++; // Устанавливаем новый порядок
        // });
        const body = products.value.map(p => {
            return {id: p.id, sort: p.sortOrder}
        })

        try {
            await apiFetch(`/products/reorder`, {
                method: 'POST',
                body
            })

        } catch (error) {
            console.error('Ошибка при смене порядка продуктов ' + error)
            throw new Error('Ошибка при смене порядка продуктов ' + error)
        }
    }

    const searchProductsList = async (search: string): Promise<Product[]> => {
        let endpoint = '/products/'
        let params: Record<string, any> = {page: 1, limit: 10}
        params.search = search

        const data: PaginatedResponse<Product> = await apiFetch(endpoint, {
            method: 'GET',
            params,
        })

        return data.data
    }

    return {
        products,
        allProducts,
        categories,
        warehouses,
        total,
        currentPage,
        limit,
        searchQuery,
        searchFormFilters,
        loading,
        withStocks,
        warehouseId,
        fetchProducts,
        fetchProductsByCategoryId,
        fetchCategories,
        fetchWarehouses,
        searchProductsByString,
        searchProductsByForm,
        resetFilters: resetAllFilters,
        setPage,
        setLimit,
        createProduct,
        updateProduct,
        deleteProduct,
        createCategory,
        updateCategory,
        deleteCategory,
        reorder,
        searchProductsList,

    }
})


export interface CreateProductDto {
    name: string
    sku: string
    comment?: string
    categoryId: number
    purchasePrice?: number
    recommendedPrice?: number
}

export interface UpdateProductDto {
    name?: string
    sku?: string
    comment?: string
    categoryId?: number
    purchasePrice?: number
    recommendedPrice?: number
}

export interface CreateCategoryDto {
    name: string
    parentId?: number
}

export interface UpdateCategoryDto {
    name?: string
    parentId?: number
}
