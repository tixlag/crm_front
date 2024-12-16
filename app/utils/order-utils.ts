import {ref} from "vue";
import Handlebars from "handlebars";
import {formatCurrency} from "~/utils/common-utils";
import {Order} from "~/stores/orders";

// const {confirmDelete} = useConfirmation()



export const columnsForAutoRender = ref([
    {field: 'buyer', header: 'Покупатель;N/N;Телефон'},
    {field: 'orderStatuses', header: 'Статус'},
    {field: 'sources', header: 'Источник;Менеджер'},
    {field: 'payTypes', header: 'Форма оплаты'},
    {field: 'warehouses', header: 'Склад'},
    {field: 'price', header: 'Заказ;Доставка'},
    {field: 'deliveryTypes', header: 'Логистика'},
    {field: 'createdAt', header: 'Дата'},
    {field: 'comments', header: 'Комментарии'},
])
export const columnsWithColor = ref([
    'orderStatuses',
    'sources',
    'payTypes',
    'warehouses',
    'deliveryTypes',
])

export const columnsForProducts = ref([
    {field: '№', header: '№'},
    {field: 'product.name', header: 'Наименование'},
    {field: 'product.sku', header: 'Артикул'},
    {field: 'count', header: 'Количество'},
    {field: 'price', header: 'Цена'},
    {field: 'sum', header: 'Сумма'},

])

export const classForExpand = ref('bg-[#d9edf7] border-b border-white border-b-solid border-opacity-90')
export const extractOrderField = (field, withoutId?: boolean) => {
    let orderField;
    switch (field) {
        case "orderStatuses":
            orderField = "status";
            break;
        case "payTypes":
            orderField = "payType";
            break;
        case "sources":
            orderField = "source";
            break;
        case "managers":
            orderField = "manager";
            break;
        case "managerLastEdit":
            orderField = "managerLastEdit";
            break;
        case "warehouses":
            orderField = "warehouse";
            break;
        case "deliveryTypes":
            orderField = "deliveryType";
            break;
        default:
            orderField = 'id';
    }
    if (withoutId) return orderField;
    return orderField + 'Id';
}
export const getColorByField = (data, field?) => {
    const settingsStore = useSettingsStore()
    if (field && !settingsStore[field][0]) return ''
    if (field) {
        let orderField = extractOrderField(field);
        if (!data[orderField]) return '';

        const color = settingsStore[field].find(entity => entity.id === data[orderField]).color
        if (color == null) return ''
        return color.startsWith('#') ? `${color}` : `#${color}`
    }
    if (data.color == null) return ''
    return data.color.startsWith('#') ? `${data.color}` : `#${data.color}`
}

export const getNameByField = (data, field) => {
    const settingsStore = useSettingsStore()
    try {
        if (field === 'managerLastEdit') {

            if (!settingsStore['managers'][0]) return ''
            let orderField = extractOrderField(field)
            if (!data[orderField]) return '';
            const manager = settingsStore['managers'].find(entity => entity.id === data[orderField])
            if (!manager) {
                return settingsStore['deliverymans'].find(entity => entity.id === data[orderField]).name
            }
            return manager.name
        } else {
            if (!settingsStore[field][0]) return ''
            let orderField = extractOrderField(field)
            if (!data[orderField]) return '';
            return settingsStore[field].find(entity => entity.id === data[orderField]).name
        }
    } catch {
        console.error(`Не смог получить имя для поля ${field}\n`, data)
        return '';
    }
}

export const getDifferencesOnlyId = (data, newData) => {
    const differences: any = {}

    for (const key in newData) {
        if ((key.endsWith('Id'))  && newData[key] !== data[key]) {
            differences[key] = newData[key]
        }
    }

    return differences
}

export const printCheque = (orderData, chequeId) => {
    const settingsStore = useSettingsStore()

    const template = settingsStore.getField('cheques', 'template', chequeId).replace('{{PRODUCT}}',
        `
  <table style="border-collapse: collapse;">
            <thead>
              <tr>
                <th>Товар</th>
                <th>Артикул</th>
                <th>Цена</th>
                <th>Количество</th>
                <th>Сумма</th>
              </tr>
            </thead>
            <tbody>
              {{#each PRODUCT}}
              <tr>
                <td>{{name}}</td>
                <td>{{sku}}</td>
                <td>{{price}} руб.</td>
                <td>{{count}}</td>
                <td>{{total}} руб.</td>
              </tr>
              {{/each}}
            </tbody>
          </table>
          <style>td,th{border:1px solid black; padding: 2px 5px}</style>
  `)
    // Подготовка данных для шаблона
    const data = {
        ID: orderData.id,
        DATE: new Date(orderData.createdAt).toLocaleDateString('ru-RU'),
        PRODUCT: orderData.products.map(item => ({
            name: item.product.name,
            count: item.count,
            sku: item.product.sku,
            price: formatCurrency(item.price),
            total: formatCurrency(item.count * item.price),
        })),
        COUNT: orderData.products.reduce((acc, item) => acc + item.count, 0),
        TOTAL: formatCurrency(orderData.products.reduce((acc, item) => acc + (item.count * item.price), 0)),
        // Добавьте другие переменные по необходимости
    };

    // Компиляция шаблона
    const compiledTemplate = Handlebars.compile(template)(data);

    // Открытие нового окна и запись HTML
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(compiledTemplate);
        printWindow.document.close();
        // Опционально: Автоматически открыть диалог печати
        printWindow.onload = function () {
            printWindow.print();
        };
    } else {
        alert('Не удалось открыть окно для печати. Проверьте настройки браузера.');
    }

}


export const formatComments = (row: any) =>
    row.comments?.map(item => item.content).join('<br>') || ''

export const onMultiselectCellChange = (data, field, value) => {
    // старая функция в связке с onCellEditComplete
    data[extractOrderField(field, true)] = value[1]
    data[extractOrderField(field)] = value[1].id
}

export const onChangeSelectInOrdersTable = async (data, field, value) => {
    const ordersStore = useOrdersStore();

    const fieldInStore = extractOrderField(field)
    // старая функция в связке с onCellEditComplete
    data[extractOrderField(field, true)] = value[1]
    data[fieldInStore] = value[1].id

    await ordersStore.updateOrder(data.id, {[fieldInStore]: value[1].id})

}


export const applyBackgroundColor = ()  => {
    document.querySelectorAll('.with-bg-color').forEach(el => {
        if (el.parentElement) {
            el.parentElement.style.backgroundColor = el.getAttribute('data-style')
        }
    })
}

export const setClassForOrderRow = (data: Order) => {
    if (data.isCompleted) return 'completed';
    if (data.isPaid) return 'paid';
}

// export const getColorByField = (data, field?) => {
//     if (field && !settingsStore[field][0]) return ''
//     if (field) {
//         let orderField = extractOrderField(field);
//         if (!data[orderField]) return '';
//
//         const color = settingsStore[field].find(entity => entity.id === data[orderField]).color
//         return `background-color: #${color}`
//     }
//     return `background-color: #${data.color}`
// }

// export const getNameByField = (data, field) => {
//
//     if (field === 'managerLastEdit') {
//
//         if (!settingsStore['managers'][0]) return ''
//         let orderField = extractOrderField(field)
//         if (!data[orderField]) return '';
//         return settingsStore['managers'].find(entity => entity.id === data[orderField]).name
//     } else {
//         if (!settingsStore[field][0]) return ''
//         let orderField = extractOrderField(field)
//         if (!data[orderField]) return '';
//         return settingsStore[field].find(entity => entity.id === data[orderField]).name
//     }
// }
