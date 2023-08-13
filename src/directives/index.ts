export const inputNumber = {
    mounted(el: HTMLElement, binding: any) {
        let _el: null | HTMLElement = el;
        if (_el.tagName.toLowerCase() !== 'input') _el = _el.querySelector('input');

        const {min, max} = binding.value;
        el?.addEventListener("keydown", function (evt: any) {
            if (evt.key === 'Backspace' && evt.target.value <= min) {
                evt.target.value = min;
                evt.returnValue = false;
                evt.preventDefault();
            }
        });

        el?.addEventListener("keypress", function (evt: any) {
            const key = String.fromCharCode(evt.keyCode || evt.which);
            const regex = /[0-9]|\./;
            if (!regex.test(key)) {
                evt.returnValue = false;
                evt.preventDefault();
            }
        });
    },
}