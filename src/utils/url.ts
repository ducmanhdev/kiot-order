export const getImageUrl = (name: string | number) => {
    return new URL(`../assets/images/${name}`, import.meta.url).href;
}