
export const formatDate = (date) => {
    // Форматирование даты
    const options = {year: 'numeric', month: 'numeric', day: 'numeric'};
    return new Date(date).toLocaleDateString(undefined, options);
}
export const formatTime = (date) => {
    // Форматирование времени
    const options = {hour: '2-digit', minute: '2-digit', second: '2-digit'};
    return new Date(date).toLocaleTimeString(undefined, options);
}