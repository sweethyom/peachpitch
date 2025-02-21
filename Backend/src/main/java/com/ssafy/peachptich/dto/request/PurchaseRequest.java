package com.ssafy.peachptich.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseRequest {
    private Long userId;
    private String itemName;
    private Integer totalPrice;
    private Integer ea;
}