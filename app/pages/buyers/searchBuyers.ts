import {apiFetch} from "~/composables/apiFetch";

import {useBuyersStore} from "~/stores/buyers";


export const buyersFields = [
    {
        type: 'primeInputText',
        name: 'numberName',
        label: 'Номер',
        iconPrefix: "pi pi-database"
    },
    {
        type: 'primeInputText',
        name: 'name',
        label: 'Имя',
        iconPrefix: "pi pi-user"
    },
    {
        type: 'primeInputText',
        name: 'phone',
        label: 'Телефон',
        iconPrefix: "pi pi-phone"
    },
    {
        type: 'primeInputText',
        name: 'email',
        label: 'Email',
        iconPrefix: "pi pi-at"
    },
    {
        type: 'primeInputText',
        name: 'address',
        label: 'Адрес',
        iconPrefix: "pi pi-map-marker"
    },
    {
        type: 'primeInputText',
        name: 'comment',
        label: 'Комментарий',
        iconPrefix: "pi pi-comment"

    },
];

const handleBuyersSearchForm = async (formData) => {
    try {
        const response = await apiFetch('/buyers/search', {
            params: formData,
        });
        console.log('Покупатели:', response.data);
    } catch (error) {
        console.error('Ошибка при поиске покупателей:', error);
    }
};
 const handleBuyersSearchString = async (formData) => {
    try {
        const response = await apiFetch('/buyers/searchByString', {
            params: formData,
        });
        console.log('Покупатели:', response.data);
    } catch (error) {
        console.error('Ошибка при поиске покупателей:', error);
    }
};




 const test = () => {


     const handlePageChange = (newPage: number) => {
         const buyersStore = useBuyersStore()
         buyersStore.currentPage = newPage
     }
// Обработчики поиска

     const handleSearchForm = async ({ values, page, limit }) => {
         const buyersStore = useBuyersStore()
         await buyersStore.searchBuyersByForm(values, page, limit)
     }
     const handleSearchString = async ({ search, page, limit }) => {
         const buyersStore = useBuyersStore()
         await buyersStore.searchBuyersByString(search, page, limit)
     }
     return {
         handleSearchForm: handleSearchForm,
         handleSearchString: handleSearchString,
         handlePageChange: handlePageChange
     }

 }

 export const formHandlers = test()
