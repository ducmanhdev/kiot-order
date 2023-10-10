import dayjs from 'dayjs';
import EscPosEncoder from "@manhnd/esc-pos-encoder";
import { print } from "@/sdk";
import handleError from "../error";
import type { CartItem } from "@/stores/order";
import FormatHelper from "../formatHelper";
import { useKeyStorageStore } from '@/stores/key-storage';

export async function printReceipt(cartList: CartItem[], checkoutResponse: any, businessSiteInfo:any, orderDetail: any) {
    try {
        const encoder = new EscPosEncoder();

        const keyStorageStore = useKeyStorageStore();

        const checkTicket: any = () => {
            if (keyStorageStore.keyStorage) {
            if (
                keyStorageStore.keyStorage.order_ticket_counter !== null &&
                keyStorageStore.keyStorage.order_ticket_counter > 0
            ) {
                let result = orderDetail?.id - keyStorageStore.keyStorage.order_ticket_counter;
                if (result > 0) {
                return encoder
                    .text("Ticket #" + result)
                    .newline()
                    .newline()
                    .encode();
                }
            }
            }
            return [];
        };

        const renderCardInfo: any = () => {
            if (orderDetail?.tip_by_credit_card === 1) {
                return encoder
                    .initialize()
                    .text(`Credit card: xxxx xxxx xxxx ${orderDetail?.payment_history[0]?.lastFour}`)
                    .newline()
                    .text(`Card Type: ${orderDetail?.payment_history[0]?.card_type}`)
                    .newline()
                    .text(`Method: ${orderDetail?.payment_history[0]?.entry_type}`)
                    .newline()
                    .encode()
            } else {
                return []
            }
        }

        const renderTax: any = () => {
            if (checkoutResponse?.tax > 0) {
                return encoder
                    .initialize()
                    .table(
                        [
                            { width: 36, align: "left" },
                            { width: 12, align: "right" },
                        ],
                        [
                            ["Tax", FormatHelper.formatShownPrice(checkoutResponse?.tax)],
                        ]
                    )
                    .encode()
            } else {
                return []
            }
        }

        const renderCreditCard: any = () => {
            return orderDetail?.order_payment_method?.map((item: any) => {
                if (item?.payment_method_type === 1) {
                    return encoder
                        .initialize()
                        .table(
                            [
                                { width: 36, align: "left" },
                                { width: 12, align: "right" },
                            ],
                            [
                                ["Credit card", FormatHelper.formatShownPrice(item?.total_paid)],
                            ]
                        )
                        .encode()
                } else {
                    return []
                }
            })
        }

        const renderCash: any = () => {
            return orderDetail?.order_payment_method?.map((item: any) => {
                if (item?.payment_method_type === 2) {
                    return encoder
                        .initialize()
                        .table(
                            [
                                { width: 36, align: "left" },
                                { width: 12, align: "right" },
                            ],
                            [
                                ["Cash", FormatHelper.formatShownPrice(item?.total_paid)],
                            ]
                        )
                        .encode()
                } else {
                    return []
                }
            })
        }

        const renderApprovedAmount: any = () => {
            if (orderDetail?.amount_info?.approve_amount > 0) {
                return encoder
                    .initialize()
                    .table(
                        [
                            { width: 36, align: "left" },
                            { width: 12, align: "right" },
                        ],
                        [
                            ["Approved amount", FormatHelper.formatShownPrice(orderDetail?.amount_info?.approve_amount / 100)],
                        ]
                    )
                    .encode()
            } else {
                return []
            }
        }

        const rawArray: any = encoder
            .initialize()
            .newline()
            .raw(checkTicket())
            .bold(true)
            .bold(true)
            .align('center')
            .text(businessSiteInfo?.name)
            .newline()
            .text(businessSiteInfo?.address)
            .newline()
            .text(businessSiteInfo?.city + ", " + businessSiteInfo?.state_code + " " + businessSiteInfo?.postal_code)
            .newline()
            .text(businessSiteInfo?.phone)
            .newline()
            .newline()
            .bold(false)
            .printLineFull('-')
            .align('center')
            .width(2)
            .height(2)
            .text('Order ID:')
            .newline()
            .newline()
            .width(5)
            .height(4)
            .text(`OD${(checkoutResponse?.id).toString()}`)
            .newline()
            .width(1)
            .height(1)
            .align('left')
            .printLineFull('-')
            .newline()
            .raw(renderCardInfo())
            .text(`Check in: ${dayjs(checkoutResponse?.created_at).format('MM/DD/YYYY HH:mm A')}`)
            .newline()
            .printLineFull("-")
            .raw(
                (function() {
                    return cartList.map((product: any, index: number) => {
                        return encoder
                        .initialize()
                        .bold(true)
                        .bold(true)
                        .table(
                            [
                                { width: 33, align: "left" },
                                { width: 5, align: "center" },
                                { width: 10, align: "right" },
                            ],
                            [[`${index + 1}. ` + product?.name, 'x' + (product?.quantity).toString(), FormatHelper.formatShownPrice(product?.item_variant?.price + product?.price)]]
                        )
                        .bold(false)
                        .raw(
                            (function () {
                                return product?.modifier?.map((item: any) => {
                                    return encoder
                                    .initialize()
                                    .raw(
                                        (function(){
                                            if (item?.value) {
                                                return item?.value?.map((value: any) => {
                                                    return encoder
                                                    .initialize()
                                                    .table(
                                                        [
                                                            { width: 36, align: "left" },
                                                            { width: 12, align: "right" },
                                                        ],
                                                        [[value?.name, FormatHelper.formatShownPrice(value?.price)]]
                                                    )
                                                    .encode()
                                                })
                                            } else {
                                                return []
                                            }
                                        })() as any
                                    )
                                    .encode()
                                })
                            })() as any
                        )
                        .raw(
                            (function () {
                              if (product?.note.length > 0) {
                                return encoder
                                .initialize()
                                .text("*Notes: " + product?.note)
                                .newline()
                                .encode(); 
                              } else {
                                return []
                              }
                            }) () as any
                          )
                        .newline()
                        .encode();
                    })
                })() as any
            )
            .printLineFull("-")
            .table(
                [
                    { width: 36, align: "left" },
                    { width: 12, align: "right" },
                ],
                [
                    ["Subtotal", FormatHelper.formatShownPrice(orderDetail?.total_before_discount)],
                ]
            )
            .raw(renderTax())
            .printLineFull("-")
            .bold(true)
            .bold(true)
            .table(
                [
                    { width: 36, align: "left" },
                    { width: 12, align: "right" },
                ],
                [
                    ["TOTAL", FormatHelper.formatShownPrice(orderDetail?.total_after_discount + checkoutResponse?.tax)],
                ]
            )
            .bold(false)
            .newline()
            .raw(renderCash())
            .raw(renderCreditCard())
            .raw(renderApprovedAmount())
            .newline()
            .align('center')
            .bold(true)
            .text('THANKS FOR YOUR BUSINESS!')
            .bold(false)
            .newline()
            .cut()
            .encode()
        const result = encoder.initialize().raw(rawArray).encode();
        
        await print(result)
    } catch (error) {
        handleError({error, message: 'Print error'});
    }
};