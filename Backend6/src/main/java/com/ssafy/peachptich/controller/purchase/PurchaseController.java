package com.ssafy.peachptich.controller.purchase;

import com.ssafy.peachptich.dto.request.PurchaseRequest;
import com.ssafy.peachptich.dto.request.ReadyRequest;
import com.ssafy.peachptich.dto.response.ApproveResponse;
import com.ssafy.peachptich.dto.response.ReadyResponse;
import com.ssafy.peachptich.entity.Item;
import com.ssafy.peachptich.entity.Purchase;
import com.ssafy.peachptich.service.CouponService;
import com.ssafy.peachptich.service.PurchaseService;
import com.ssafy.peachptich.global.util.SessionUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.UUID;

/**
 * 카카오페이 단건결제 API이용
 *
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/pay")
@SessionAttributes({"tid", "orderNum", "totalPrice"})  // 추가
@CrossOrigin(origins = "https://peachpitch.site", allowedHeaders = "*", allowCredentials = "true", methods = {
        RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE
})
@Tag(name = "PurchaseController", description = "상품 주문 관련 컨트롤러")
public class PurchaseController {

    private final PurchaseService purchaseService;
    private final CouponService couponService;

    @PostMapping("/ready")
    @Operation(summary = "결제 요청 준비", description = "결제 요청 데이터를 준비합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "데이터 로딩 성공")
    })
    public @ResponseBody ReadyResponse payReady(@RequestBody PurchaseRequest purchaseRequest) {
        log.info("Received purchase request: {}", purchaseRequest);  // 요청 데이터 로깅
        log.info("userId: {}, itemName: {}, totalPrice: {}, ea: {}",
                purchaseRequest.getUserId(),
                purchaseRequest.getItemName(),
                purchaseRequest.getTotalPrice(),
                purchaseRequest.getEa());

                ReadyRequest readyRequest = ReadyRequest.builder()
                .cid("TC0ONETIME")
                .partner_order_id(UUID.randomUUID().toString())
                .partner_user_id(String.valueOf(purchaseRequest.getUserId()))
                .item_name(purchaseRequest.getItemName())
                .quantity(purchaseRequest.getEa())
                .total_amount(purchaseRequest.getTotalPrice())
                .tax_free_amount(0)
                .approval_url("https://peachpitch.site/api/pay/completed")
                .cancel_url("https://peachpitch.site/api/pay/cancel")
                .fail_url("https://peachpitch.site/api/pay/fail")
                .build();

        log.info("주문 상품 이름: {}", readyRequest.getItem_name());
        log.info("주문 금액: {}", readyRequest.getTotal_amount());

        return purchaseService.payReady(readyRequest);
    }


    @GetMapping("/completed")
    @Operation(summary = "카카오 페이 결제 완료", description = "카카오 페이 결제를 완료하였습니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "결제를 성공적으로 완료함")
    })
    public void payCompleted(@RequestParam("pg_token") String pgToken, HttpServletResponse response) {
        try {
            // 결제 승인 처리 로직 (예: 카카오페이 API 호출)
            ApproveResponse approveResponse = purchaseService.payApprove(pgToken);
            purchaseService.savePaymentInfo(approveResponse);
            // 팝업 닫기 스크립트 반환
            String script = "<html><body><script>window.close();</script></body></html>";
            response.setContentType("text/html");
            response.getWriter().write(script);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }


    // Controller 수정
//    @GetMapping("/datacompleted")
//    public String orderCompleted(Model model) {
//        try {
//            String orderId = SessionUtils.getStringAttributeValue("orderId");
//            Purchase paymentInfo = purchaseService.getPaymentInfo(orderId);
//
//            model.addAttribute("itemName", paymentInfo.getItem().getName());
//            model.addAttribute("orderId", paymentInfo.getOrderId());
//            model.addAttribute("paymentMethod", paymentInfo.getMethod());
//            model.addAttribute("quantity", paymentInfo.getEa());
//            model.addAttribute("paymentTime", paymentInfo.getPaymentTime());  // approved_at을 paymentTime으로
//            model.addAttribute("totalPrice", paymentInfo.getTotalPrice());
//
//            return "completed";
//        } catch (Exception e) {
//            log.error("결제 정보 조회 중 오류 발생", e);
//            return "redirect:/order/fail";
//        }
//    }

//    @GetMapping("/cancel")
//    public void cancel() {
//        throw new BusinessLogicException(ExceptionCode.PAY_CANCEL);
//    }
//
//    @GetMapping("/fail")
//    public void fail() {
//        throw new BusinessLogicException(ExceptionCode.PAY_FAILED);
//    }

}
