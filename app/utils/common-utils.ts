import type {HintedString} from "@primevue/core";

export const formatCurrency = (value: any) => {
    return value ? value.toLocaleString('ru-RU', {style: 'currency', currency: 'RUB'}) : 0;
};

export const editorModule = {
    toolbar: [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        // ['blockquote', 'code-block'],
        // ['link', 'image', 'video', 'formula'],

        // [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{'list': 'ordered'}],
        // [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
        // [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
        // [{ 'direction': 'rtl' }],                         // text direction

        [{'size': ['small', false, 'large', 'huge']}],  // custom dropdown
        // [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

        [{'color': []}, {'background': []}],          // dropdown with defaults from theme
        // [{ 'font': [] }],
        // [{ 'align': [] }],

        ['clean']                                         // remove formatting button
    ]


}

// export const getNameById = (id, entity) => {
//     const settingsStore = useSettingsStore()
//
//     if (!settingsStore[entity][0]) return ''
//     return settingsStore[entity].find(entity => entity.id === id).name
// }

interface EntityMap {
    [key: string]: Map<number, { id: number; name: string }>;
}

const entityMapCache = new WeakMap<any, EntityMap>();

export const getNameById = (id: number, entity: string): string => {
    const settingsStore = useSettingsStore();

    let entityMap = entityMapCache.get(settingsStore);
    if (!entityMap) {
        entityMap = {};
        for (const key in settingsStore) {
            if (Array.isArray(settingsStore[key])) {
                entityMap[key] = new Map(
                    settingsStore[key].map(item => [item.id, item])
                );
            }
        }
        entityMapCache.set(settingsStore, entityMap);
    }

    const entityItems = entityMap[entity];
    if (!entityItems || !entityItems.has(id)) {
        return '';
    }

    return entityItems.get(id)?.name ?? '';
}

export const getSeverityByMethod = (method) : HintedString<'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'contrast'> | undefined => {
    switch (method) {
        case "GET":
            return "success"
        case "POST":
            return "info"
        case "DELETE":
            return "danger"
        case "PATCH":
            return "warn"
        case "PUT":
            return "warn"
        default:
            return undefined
    }
}

