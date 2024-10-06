import {apiFetch} from "~/composables/apiFetch";

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

 export const searchHandlers = {
     handleSearchByForm: handleBuyersSearchForm,
     handleSearchByString: handleBuyersSearchString
 }