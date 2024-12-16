// /store/settingsStore.js

export type EntityTypes =
    | 'managers'
    | 'deliverymans'
    | 'cheques'
    | 'deliveryTypes'
    | 'orderStatuses'
    | 'payTypes'
    | 'sources'
    | 'warehouses';

const keysForEntity = [
    'managers',
    'deliverymans',
    'cheques',
     'deliveryTypes',
     'orderStatuses',
     'payTypes',
     'sources',
     'warehouses'
]

export const useSettingsStore = defineStore('settingsStore', {
    state: () => ({
        managers: [],
        deliverymans: [],
        cheques: [],
        deliveryTypes: [],
        orderStatuses: [],
        payTypes: [],
        sources: [],
        warehouses: [],
        // Добавьте другие сущности по необходимости
        pagination: {
            managers: { page: 1, limit: 10, total: 0 },
            deliverymans: { page: 1, limit: 10, total: 0 },
            cheques: { page: 1, limit: 10, total: 0 },
            deliveryTypes: { page: 1, limit: 10, total: 0 },
            orderStatuses: { page: 1, limit: 10, total: 0 },
            payTypes: { page: 1, limit: 10, total: 0 },
            sources: { page: 1, limit: 10, total: 0 },
            warehouses: { page: 1, limit: 10, total: 0 },
            // Добавьте другие сущности по необходимости
        },
        loading: {
            managers: false,
            deliverymans: false,
            cheques: false,
            deliveryTypes: false,
            orderStatuses: false,
            payTypes: false,
            sources: false,
            warehouses: false,
            // Добавьте другие сущности по необходимости
        },
        error: {
            managers: null,
            deliverymans: null,
            cheques: null,
            deliveryTypes: null,
            orderStatuses: null,
            payTypes: null,
            sources: null,
            warehouses: null,
            // Добавьте другие сущности по необходимости
        },
        filters: {
            managers: null,
            deliverymans: null,
            cheques: null,
            deliveryTypes: null,
            orderStatuses: null,
            payTypes: null,
            sources: null,
            warehouses: null,
            // Добавьте другие сущности по необходимости
        },
    }),
    actions: {
        // Общая функция для получения данных с пагинацией
        async fetchEntity(entity : EntityTypes, page = 1, limit = 10, search?: string) {
            this.loading[entity] = true
            this.error[entity] = null
            this.pagination[entity].page = page
            this.pagination[entity].limit = limit
            let params: Record<string, any> = { page: this.pagination[entity].page, limit: this.pagination[entity].limit, search}
            let request = `/settings/${entity}`
            if (this.filters[entity]) {
                params.search = this.filters[entity];
                request = `/settings/${entity}/search`
            }
            try {
                const response = await apiFetch(request,
                    {
                        method: 'GET',
                        params,
                    })
                // костыль, чтобы работали чекбоксы в модалке для редактирования менеджера
                this[entity] = response.data
                // if (entity === 'managers') this[entity] = response.data.map(manager => {return {canEdit: ref(false), ...manager}})
                this.pagination[entity].total = response.total
            } catch (err) {
                this.error[entity] = err.response?.data?.message || err.message
                console.error(`Ошибка при получении ${entity}:`, err)
            } finally {
                this.loading[entity] = false
            }
        },
        async fetchAllEntity() {

            let request = `/settings/all`
            try {
                const response = await apiFetch(request,
                    {
                        method: 'GET',
                    })

                for (const entity of keysForEntity) {
                    this[entity] = response[entity]
                }

            } catch (err) {
                // this.error[entity] = err.response?.data?.message || err.message
                console.error(`Ошибка при получении всех сущностей:`, err)
            }
        },
        async createEntity(entity: EntityTypes, data) {
            this.loading[entity] = true
            this.error[entity] = null

            const params = {
                body: data,
                method: 'POST',
            }
            try {
                const response = await apiFetch(`/settings/${entity}`, params)
                this[entity].push(response) // Добавляем в начало списка
                this.pagination[entity].total += 1
            } catch (err) {
                this.error[entity] = err.response?.data?.message || err.message
                console.error(`Ошибка при создании ${entity}:`, err)
                throw err
            } finally {
                this.loading[entity] = false
            }
        },
        async updateEntity(entity: EntityTypes, id: number, data) {
            this.loading[entity] = true
            this.error[entity] = null
            const params = {
                body: data,
                method: 'PATCH',
            }
            try {
                const response = await apiFetch(`/settings/${entity}/${id}`, params)
                const index = this[entity].findIndex(item => item.id === id)
                if (index !== -1) {
                    this.$patch(state => {
                        state[entity][index] = response
                    })
                }
            } catch (err) {
                this.error[entity] = err.response?.data?.message || err.message
                console.error(`Ошибка при обновлении ${entity}:`, err)
                throw err
            } finally {
                this.loading[entity] = false
            }
        },
        async deleteEntity(entity: EntityTypes, id: number) {
            this.loading[entity] = true
            this.error[entity] = null
            const params = {
                method: "DELETE",
            }
            try {
                await apiFetch(`/settings/${entity}/${id}`, params)
                this[entity] = this[entity].filter(item => item.id !== id)
                this.pagination[entity].total -= 1
            } catch (err) {
                this.error[entity] = err.response?.data?.message || err.message
                console.error(`Ошибка при удалении ${entity}:`, err)
                throw err
            } finally {
                this.loading[entity] = false
            }
        },
        getField(entity: EntityTypes, field, id: number) {
            try {
                return this[entity].find(entity => entity.id === id)[field]
            } catch (err) {
                return ''
            }
        }
    },
})
