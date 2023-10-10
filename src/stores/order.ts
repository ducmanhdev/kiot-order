import {defineStore} from 'pinia';
import axios from '@/plugins/axios';
import {useGlobalStore} from "@/stores/global";
import ModalAddCart from "@/components/modal/ModalAddCart.vue";
import handleError from '@/utils/error';
import {useKeyStorageStore} from "@/stores/key-storage";
import {ORDER_STATUS, PAYMENT_TYPES} from "@/constant";
import notification from "@/utils/notification";

export type OrderType = 'pick_up' | 'delivery';

export type Promotion = {
    code: string;
    price: number;
}

export type UpdateOrderRequest = {
    order_id: number;
    payment_id: number;
    type: string;
    data: any;
    status: string;
    payment_status: string;
}

export type Modifier = {
    modifier_name: string;
    type: 'single' | 'multi';
    required: boolean;
    details: ModifierDetail[];
    is_selected: boolean;
    id: string;
    value?: ModifierValue[];
}

export type ModifierDetail = {
    name: string;
    price: string;
    id: string;
}

export type ModifierValue = {
    id: string;
    name: string;
    price: number;
}

export type Category = {
    id: number;
    name: string;
    items: CategoryItem[];
    image_path?: string,
    image_base_url?: string
}

export type CategoryItem = {
    id: number;
    name: string;
    price: number;
    description: string;
    image?: string;
    item_variants: ItemVariant[];
    item_variant?: ItemVariant;
    modifier?: Modifier[];
    quantity?: number;
    note?: string;
}

export type ItemVariant = {
    id: number;
    item_id: number;
    image?: string;
    name: string;
    price: number;
    price_before_discount?: number;
}

export type CartItem = CategoryItem & { cart_id: number }

export type PaymentMethod = {
    type: (typeof PAYMENT_TYPES)[keyof typeof PAYMENT_TYPES],
    total_paid: number,
}

export type SubmitPaymentRequest = {
    order_id: number;
    change: number;
    tax: number;
    payment: PaymentMethod[];
}

type TipData = {
    staff_id: number
    staff_name: string
    value_type: string
    value: string
    total: string
    employee_name: string
}

export type OrderDetail = {
    id: number;
    customer_id: number;
    customer_name: string;
    customer_phone: string;
    total_before_discount: number;
    total_after_discount: number;
    type: string;
    note: string;
    order_status: number;
    order_code: string;
    tax: number;
    status: number;
    created_at: Date;
    updated_at: Date;
    is_tip_on_device: number;
    tip_by_credit_card: number;
    order_items: CartItem[];
    order_discount: any[];
    order_payment_method: any[];
    payment_history: any[];
    total_change: number;
    tip: {
        data: TipData[]
        id: number;
        order_id: number;
        created_at: string;
        updated_at: string;
        status: number;
        tip_type: string;
        total_tip: number;
        data_after_charge: string;
        payment_method: number;
        giftcard_code: number;
        is_updated: number;
    }
};

export type SubmitPaymentMethodsRequest = {
    order_id: number;
    tax: number;
    payment: PaymentMethod[];
}

export const useOrderStore = defineStore('order', {
    state: () => ({
        modalAddCartRef: null as InstanceType<typeof ModalAddCart> | null,
        cartList: [] as CartItem[],
        categoryList: [] as Category[],
        shippingFee: 0,
        promotion: null as Promotion | null,
        orderType: null as OrderType | null,
        paymentMethod: 'cash' as 'cash' | 'credit_card',
        currency: 'USD' as 'USD',
        failedOrderId: null as number | null,
        failedOrderDetail: null as any,
        orderDetail: null as OrderDetail | null,
        listCart: [] as CartItem[],
        isGetOrderDetailLoading: false,
    }),
    getters: {
        tax(state) {
            const keyStorageStore = useKeyStorageStore();
            const tax = keyStorageStore.keyStorage?.tax_product || 0;
            return Number(((this as any).priceSubtotal * tax).toFixed(2));
        },
        isCartEmpty(state) {
            return !(state.cartList && state.cartList.length > 0)
        },
        cartQuantity(state) {
            return (state.cartList || []).reduce((total: number, currentItem: any) => total + currentItem.quantity, 0)
        },
        checkoutData(state) {
            return {
                tax: (this as any).tax,
                type: state.orderType,
                payment_method: state.paymentMethod,
                order_items: state.cartList.map((item: any) => ({
                    item_id: item.id,
                    quantity: item.quantity,
                    item_name: item.name,
                    item_variant: {
                        id: item.item_variant?.id,
                        name: item.item_variant?.name,
                        price: item.item_variant?.price,
                    },
                    note: item.note,
                    item_modifier: item.modifier,
                    additional_data: JSON.stringify({
                        item_id: item.id,
                        quantity: item.quantity,
                        item_name: item.name,
                        note: item.note,
                        price: item.price,
                    })
                })),
                currency: state.currency,
            }
        },
        priceDiscount(state) {
            return state.promotion?.price ?? 0
        },
        priceSubtotal(state) {
            return state.cartList.reduce((total: number, currentItem: any) => total + (this as any).priceTotalOfCartItem(currentItem.cart_id), 0)
        },
        priceTotal(state) {
            return (this as any).priceSubtotal - (this as any).priceDiscount + (this as any).tax;
        },
        getCartItem(state) {
            return (cart_id: number) => {
                return state.cartList.find(item => item.cart_id === cart_id)
            };
        },
        getCartItemIndex(state) {
            return (cart_id: number) => {
                return state.cartList.findIndex(item => item.cart_id === cart_id)
            };
        },
        priceSubTotalOfCartItem(): (cart_id: number) => number {
            return (cart_id) => {
                const item = (this as any).getCartItem(cart_id);
                if (!item) return 0;
                const defaultPrice = item.price;
                const modifierTotalPrice = (item?.modifier || [])
                    .filter((item: any) => item?.is_selected)
                    .map((item: any) => item?.value)
                    .flat()
                    .reduce((_total: number, _currentItem: any) => _total + Number(_currentItem?.price || 0), 0);
                const variantPrice = Number(item?.item_variant?.price || 0);
                return defaultPrice + variantPrice + modifierTotalPrice;
            }
        },
        priceTotalOfCartItem() {
            return (cart_id: number) => {
                const item = (this as any).getCartItem(cart_id);
                if (!item) return 0;
                return (this as any).priceSubTotalOfCartItem(cart_id) * (item?.quantity || 1);
            }
        },
        isDisableUpdateFailedOrder(state) {
            return state.failedOrderDetail?.order_status === ORDER_STATUS.AWAITING_PAYMENT;
        }
    },
    actions: {
        setOrderType(orderType: OrderType) {
            this.orderType = orderType;
            this.clearFailedOrder();
        },
        showModalAddCart(data: CategoryItem) {
            this.modalAddCartRef?.show(data);
        },
        getList() {
            return new Promise(async (resolve, reject) => {
                try {
                    const res = await axios.get('/orderonline/category_kiot/site/list');
                    this.categoryList = res?.data?.result?.data;
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            })
        },
        replaceCartItem(data: CartItem) {
            if ((this as any).isDisableUpdateFailedOrder) {
                notification.error({
                    message: 'You can not update awaiting payment order!'
                })
                return;
            }

            const existCartItemIndex = (this as any).getCartItemIndex(data?.cart_id);
            if (existCartItemIndex === -1) return;
            this.cartList[existCartItemIndex] = data as CartItem;
        },
        addCartItem(data: CategoryItem | CartItem) {
            if ((this as any).isDisableUpdateFailedOrder) {
                notification.error({
                    message: 'You can not update awaiting payment order!'
                })
                return;
            }

            const incomingCartId = (data as CartItem).cart_id;
            const compareTwoModifier = (modifier1: Modifier[] = [], modifier2: Modifier[] = []) => {
                const getModifierValueIdArr = (modifier: Modifier[]) => modifier.filter(modifier => modifier.value).map(modifier => modifier.value).flat().map(modifier => modifier!.id)
                const valueModifier1 = getModifierValueIdArr(modifier1);
                const valueModifier2 = getModifierValueIdArr(modifier2);
                return valueModifier1.every(modifierId => valueModifier2.includes(modifierId))
            }
            const existCartItem = this.cartList.find(item =>
                item.cart_id !== incomingCartId &&
                item.id === data.id &&
                compareTwoModifier(item?.modifier, data?.modifier) &&
                item.note?.trim() === data.note?.trim() &&
                item.item_variant?.id === data.item_variant?.id
            );

            if (existCartItem) {
                existCartItem.quantity! += data.quantity!;
                incomingCartId && (this as any).deleteCartItem(incomingCartId, false);
                return;
            }

            if (incomingCartId) {
                this.replaceCartItem(data as CartItem);
                return;
            }

            this.cartList.push({
                ...data,
                cart_id: Date.now(),
                note: data.note?.trim(),
            });
        },
        async deleteCartItem(cartId: number, warning = true) {
            try {
                if ((this as any).isDisableUpdateFailedOrder) {
                    notification.error({
                        message: 'You can not update awaiting payment order!'
                    })
                    return;
                }
                if (warning) {
                    const globalStore = useGlobalStore();
                    await globalStore.confirm('Are you sure to delete this order?');
                }
                this.cartList = this.cartList.filter((item: any) => item.cart_id !== cartId);
            } catch (error) { /* empty */
            }
        },
        async getOrderDetail(orderId: number | null) {
            try {
                this.orderDetail = null;
                this.listCart = [];
                if (!orderId) return;
                this.isGetOrderDetailLoading = true;
                const res = await axios.get('/orderonline/order/site/get', {
                    params: {
                        id: orderId,
                        expand: "payment_history"
                    }
                });
                this.orderDetail = res?.data?.result?.data;
                this.listCart = this.orderDetail?.order_items || [];
            } catch (error) {
                handleError({error});
            } finally {
                this.isGetOrderDetailLoading = false;
            }
        },
        setCartItemQuantity(cart_id: number, newQuantity: number) {
            if ((this as any).isDisableUpdateFailedOrder) {
                notification.error({
                    message: 'You can not update awaiting payment order!'
                })
                return;
            }
            const existCartItemIndex = (this as any).getCartItemIndex(cart_id);
            if (existCartItemIndex === -1) return;
            this.cartList[existCartItemIndex].quantity = Number(newQuantity.toString().replace(/\D/g, ''));
        },
        clearCart() {
            this.cartList = [];
            this.promotion = null;
            this.orderType = 'pick_up';
            this.paymentMethod = 'cash';
        },
        setPromotion(promotion: Promotion) {
            this.promotion = promotion
        },
        removePromotion() {
            this.promotion = null;
        },
        checkPromotionCode(promotionCode: string) {
            return new Promise(async (resolve, reject) => {
                try {
                    const res: any = await axios.post('/v1/end_user/promotion/check-promotion-code', {
                        ...(this as any).checkoutData,
                        promotion_code: promotionCode
                    });
                    if (!res?.data?.result?.data) {
                        throw new Error('Voucher is not valid');
                    }
                    this.setPromotion({
                        code: promotionCode,
                        price: res?.data?.result?.data?.price_promotion_code,
                    });
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            })
        },
        createOrder() {
            return new Promise(async (resolve, reject) => {
                try {
                    const res = await axios.post('/orderonline/order_kiot/form/create', {
                        ...(this as any).checkoutData,
                    });
                    resolve(res);
                } catch (error) {
                    reject(error);
                }
            })
        },
        updateOrder() {
            return new Promise(async (resolve, reject) => {
                try {
                    const res = await axios.post('/orderonline/order_kiot/form/update', {
                        id: this.failedOrderId,
                        ...(this as any).checkoutData,
                    });
                    resolve(res);
                } catch (error) {
                    reject(error);
                }
            })
        },
        checkout() {
            if (this.failedOrderId) {
                return this.updateOrder();
            }
            return this.createOrder();
        },
        updatePaymentData(payload: UpdateOrderRequest) {
            return new Promise(async (resolve, reject) => {
                try {
                    await axios.post('/orderonline/order/payment/update-payment-data', payload);
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            })
        },
        setFailedOrder(id: number) {
            this.failedOrderId = id;
            this.getFailedOrderDetail(id);
        },
        clearFailedOrder() {
            this.failedOrderId = null;
            this.failedOrderDetail = null;
        },
        resetPaymentMethod() {
            this.paymentMethod = 'cash';
        },

        submitPaymentMethods(data: SubmitPaymentMethodsRequest) {
            return new Promise(async (resolve, reject) => {
                try {
                    await axios.post('/orderonline/order_kiot/form/submit', data);
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            });
        },
        getFailedOrderDetail(orderId: number) {
            return new Promise(async (resolve, reject) => {
                try {
                    this.failedOrderDetail = null;
                    const response = await axios.get('/orderonline/order/site/get', {
                        params: {
                            id: orderId,
                            expand: "payment_history"
                        }
                    });
                    this.failedOrderDetail = response?.data?.result?.data;
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            });
        },
        updateOrderWithCreditCardPayment(data: SubmitPaymentRequest) {
            return new Promise(async (resolve, reject) => {
                try {
                    await axios.post('/orderonline/order/payment/update-order-with-credit-card-payment', data);
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            });
        },
    },
});