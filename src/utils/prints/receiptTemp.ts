import dayjs from 'dayjs';
import EscPosEncoder from "@manhnd/esc-pos-encoder";
import { print } from "@/sdk";
import handleError from "../error";
import type { CartItem } from "@/stores/order";
import FormatHelper from "../formatHelper";

export async function printReceiptTemp(cartList: CartItem[], checkoutResponse: any, businessSiteInfo:any, orderDetail: any) {
    try {
        const encoder = new EscPosEncoder();

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
        const rawArray: any = encoder
            .initialize()
            .newline()
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
            .cut()
            .encode()
        const result = encoder.initialize().raw(rawArray).encode();

    
        await print(result)
    } catch (error) {
        handleError({error, message: 'Print error'});
    }
};