package com.ssafy.peachptich.controller.purchase;

import com.ssafy.peachptich.dto.response.ApproveResponse;
import com.ssafy.peachptich.dto.response.ReadyResponse;
import com.ssafy.peachptich.entity.Purchase;
import com.ssafy.peachptich.service.PurchaseService;
import com.ssafy.peachptich.global.util.SessionUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

/**
 * 카카오페이 단건결제 API이용
 *
 */
@Slf4j
@Controller
@RequiredArgsConstructor
@RequestMapping("/api/pay")
@SessionAttributes({"tid", "orderNum", "totalPrice"})  // 추가
@CrossOrigin(origins = "http://localhost:5175", allowedHeaders = "*", allowCredentials = "true", methods = {
        RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE
})
public class PurchaseController {

    private final PurchaseService purchaseService;

    @PostMapping("/ready")
    public @ResponseBody ReadyResponse payReady(@RequestBody Purchase purchase){
        String name = purchase.getItem().getName();
        Integer totalPrice = purchase.getTotalPrice();
        Integer ea = purchase.getEa();

        log.info("주문 상품 이름: " + name);
        log.info("주문 금액: " + totalPrice);

//        // 세션에 totalPrice 저장
//        SessionUtils.addAttribute("totalPrice", String.valueOf(totalPrice));

        // 카카오 결제 준비하기
        ReadyResponse readyResponse = purchaseService.payReady(name, totalPrice, ea);
//        log.info("카카오페이 서비스 응답: {}", readyResponse);
        // 세션에 결제 고유번호(tid) 저장
//        SessionUtils.addAttribute("tid", readyResponse.getTid());
//        log.info("세션에 저장된 TID: {}", readyResponse.getTid());

        return readyResponse;
    }

    @GetMapping("/completed")
    public ResponseEntity<ApproveResponse> payCompleted(@RequestParam("pg_token") String pgToken) {
//            log.info("세션 상태 확인");
//            SessionUtils.printSessionAttributes();  // 세션 상태 출력
//
//            String tid = SessionUtils.getStringAttributeValue("tid");
//            log.info("결제 승인 요청을 인증하는 토큰: " + pgToken);
//            log.info("결제 고유번호: "+ tid);

            // 카카오 결제 요청
            ApproveResponse approveResponse = purchaseService.payApprove(pgToken);
            purchaseService.savePaymentInfo(approveResponse);

//            SessionUtils.addAttribute("orderId", approveResponse.getPartner_order_id());
            log.info("payCompleted : 마지막 로그");
            return new ResponseEntity<>(approveResponse, HttpStatus.OK);
    }


    // Controller 수정
    @GetMapping("/datacompleted")
    public String orderCompleted(Model model) {
        try {
            String orderId = SessionUtils.getStringAttributeValue("orderId");
            Purchase paymentInfo = purchaseService.getPaymentInfo(orderId);

            model.addAttribute("itemName", paymentInfo.getItem().getName());
            model.addAttribute("orderId", paymentInfo.getOrderId());
            model.addAttribute("paymentMethod", paymentInfo.getMethod());
            model.addAttribute("quantity", paymentInfo.getEa());
            model.addAttribute("paymentTime", paymentInfo.getPaymentTime());  // approved_at을 paymentTime으로
            model.addAttribute("totalPrice", paymentInfo.getTotalPrice());

            return "completed";
        } catch (Exception e) {
            log.error("결제 정보 조회 중 오류 발생", e);
            return "redirect:/order/fail";
        }
    }

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
