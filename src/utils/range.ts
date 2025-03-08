export function range(start : number, end: number, step : number = 1) {
    return Array.from({ length: Math.floor((end - start) / step) }, (_, i) => start + i * step);
}