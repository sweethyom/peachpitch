package com.ssafy.peachptich.service;

import com.ssafy.peachptich.dto.response.ApproveResponse;
import com.ssafy.peachptich.dto.response.ReadyResponse;
import com.ssafy.peachptich.entity.Purchase;

import java.util.Map;

public interface PurchaseService {
    ReadyResponse payReady(String name, Integer totalPrice, Integer ea);
    ApproveResponse payApprove(String pgToken);

    void savePaymentInfo(ApproveResponse approveResponse);
    Purchase getPaymentInfo(String orderId);
}

