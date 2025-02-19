package com.ssafy.peachptich.dto.response;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class AmountResponse {
    private Integer total; // 총 결제 금액
    private Integer tax_free; // 비과세 금액
    private Integer vat; // 부가세 금액
    private Integer point; // 사용한 포인트 금액
    private Integer discount; // 할인 금액
}
