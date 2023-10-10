export const inputNumber = {
    mounted(el: HTMLElement, binding: any) {
        let _el: null | HTMLElement = el;
        if (_el.tagName.toLowerCase() !== 'input') _el = _el.querySelector('input');
        const {min, max} = binding.value;
        el?.addEventListener("input", function (evt: any) {
            const finalValue = Number(evt.target.value.replace(/\D/g, ''));
            if (finalValue < Number(min)) return evt.target.value = min;
            if (finalValue > Number(max)) return evt.target.value = max;
            evt.target.value = finalValue;
        });
    },
}