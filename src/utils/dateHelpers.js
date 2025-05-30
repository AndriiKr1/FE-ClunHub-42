export const formatDateKey = (year, month, day) =>
    `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;