var seedrandom = require('seedrandom');

export {};

export function seed(value: any) {
    seedrandom(value, { global: true });
}

export function random() {
    return Math.random();
}

export function randint(a: number, b: number) {
    const range = b - a + 1;
    return Math.min(
        Math.floor(Math.random() * range) + a,
        b
    );
}