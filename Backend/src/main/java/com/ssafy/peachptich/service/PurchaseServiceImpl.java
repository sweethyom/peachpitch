package com.ssafy.peachptich.service;

import com.ssafy.peachptich.dto.request.ReadyRequest;
import com.ssafy.peachptich.global.config.KakaoPayProperties;
import com.ssafy.peachptich.dto.response.ApproveResponse;
import com.ssafy.peachptich.dto.response.ReadyResponse;
import com.ssafy.peachptich.entity.Item;
import com.ssafy.peachptich.entity.Purchase;
import com.ssafy.peachptich.entity.User;
import com.ssafy.peachptich.repository.ItemRepository;
import com.ssafy.peachptich.repository.PurchaseRepository;
import com.ssafy.peachptich.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class PurchaseServiceImpl implements PurchaseService{
    private final KakaoPayProperties payProperties;
    private final PurchaseRepository purchaseRepository;
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;

    private final RestTemplate template = new RestTemplate();
    private ReadyResponse readyResponse;
    private ReadyRequest readyRequest;
    private String orderNum;


    @Override
    public ReadyResponse payReady(@RequestBody ReadyRequest readyRequest) {

        try {
            this.readyRequest = readyRequest;
            this.orderNum = UUID.randomUUID().toString();  // 메소드 내부로 이동
            log.info("주문번호 생성: {}", this.orderNum);
            Map<String, String> parameters = new HashMap<>();
            parameters.put("cid", "TC0ONETIME");
            parameters.put("partner_order_id", this.orderNum);
            parameters.put("partner_user_id", readyRequest.getPartner_user_id()); // 후에 사용자ID로 변경
            parameters.put("item_name", readyRequest.getItem_name());
            parameters.put("quantity", String.valueOf(readyRequest.getQuantity()));
            parameters.put("total_amount", String.valueOf(readyRequest.getTotal_amount()));
            parameters.put("tax_free_amount", "0");
            parameters.put("approval_url", "http://localhost:5173/pay/completed");
            parameters.put("cancel_url", "http://localhost:5173/pay/cancel");
            parameters.put("fail_url", "http://localhost:5173/pay/fail");

            HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(parameters, this.getHeaders());
            String url = "https://open-api.kakaopay.com/online/v1/payment/ready";
            this.readyResponse = template.postForObject(url, requestEntity, ReadyResponse.class);
            log.info("Ready Response TID: {}", this.readyResponse.getTid());

            // URL 수정 코드 제거
            return this.readyResponse;

        } catch (Exception e) {
            log.error("카카오페이 결제 준비 중 오류 발생", e);
            throw new RuntimeException("카카오페이 결제 준비 실패: " + e.getMessage());
        }
    }

    // 카카오페이 결제 승인
    // 사용자가 결제 수단을 선택하고 비밀번호를 입력해 결제 인증을 완료한 뒤,
    // 최종적으로 결제 완료 처리를 하는 단계
    @Override
    public ApproveResponse payApprove(String pgToken) {
        try {
        log.info("결제 승인 시작 - readyResponse: {}", this.readyResponse);

        if (this.readyResponse == null || this.readyResponse.getTid() == null) {
            log.error("결제 정보 누락 - readyResponse: {}, tid: {}",
                    this.readyResponse,
                    this.readyResponse != null ? this.readyResponse.getTid() : "null");
            throw new IllegalStateException("결제 정보가 존재하지 않습니다");
        }
        log.info("주문번호: {}", this.orderNum);  // 로그 추가

        Map<String, String> parameters = new HashMap<>();

        parameters.put("cid", payProperties.getCid());              // 가맹점 코드(테스트용)
        log.info("여기까진 왔니 : cid통과");
        log.info(payProperties.getCid());
        log.info(this.readyResponse.getTid());
        parameters.put("tid", this.readyResponse.getTid());                       // 결제 고유번호
        log.info("여기까진 왔니 : tid통과");
        parameters.put("partner_order_id", this.orderNum); // 주문번호
        log.info("여기까진 왔니 : orderNum");
        parameters.put("partner_user_id", String.valueOf(readyRequest.getPartner_user_id()));    // 회원 아이디
        log.info("여기까진 왔니 :" + readyRequest.getPartner_user_id());
        parameters.put("pg_token", pgToken);              // 결제승인 요청을 인증하는 토큰
        log.info("여기까진 왔니 : pgToken통과");

        HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(parameters, this.getHeaders());

        System.out.println();
        System.out.println();
        System.out.println(requestEntity);
        System.out.println();
        System.out.println();

        String url = "https://open-api.kakaopay.com/online/v1/payment/approve";
            try {
                ApproveResponse approveResponse = template.postForObject(url, requestEntity, ApproveResponse.class);
                log.info("결제승인 응답객체: {}", approveResponse);
                return approveResponse;
            } catch (RestClientException e) {
                log.error("카카오페이 API 호출 실패: {}", e.getMessage());
                log.error("에러 상세: ", e);
                throw new RuntimeException("카카오페이 결제 승인 실패", e);
            }

        } catch (Exception e) {
            log.error("결제 승인 처리 중 오류 발생: {}", e.getMessage());
            throw new RuntimeException("결제 승인 처리 실패", e);
        }

    }
    @Override
    @Transactional
    public void savePaymentInfo(ApproveResponse response) {
        log.info("구매정보 담기 시작");

        // response 객체 검증
        log.info("Response 객체: {}", response);
        if (response == null) {
            log.error("Response 객체가 null입니다.");
            throw new RuntimeException("결제 응답 정보가 없습니다.");
        }

        Integer totalPrice = response.getAmount().getTotal();
        log.info("Total Price 확인: {}", totalPrice);

        try {
            // User와 Item 정보 조회
            User user = userRepository.findById(Long.valueOf(response.getPartner_user_id()))
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

            Item item = itemRepository.findByNameAndType(response.getItem_name(), Item.ItemType.PAID)
                    .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));

            log.info("구매정보 확인");
            log.info("partner_order_id: {}", response.getPartner_order_id());
            log.info("approved_at: {}", response.getApproved_at());
            log.info("quantity: {}", response.getQuantity());
            log.info("payment_method_type: {}", response.getPayment_method_type());
            log.info("totalPrice: {}", totalPrice);
            log.info("user: {}", user);
            log.info("item: {}", item);

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
            LocalDateTime paymentTime = LocalDateTime.parse(response.getApproved_at(), formatter);

            Purchase purchase = Purchase.builder()
                    .orderId(response.getPartner_order_id())
                    .paymentTime(paymentTime)
                    .ea(response.getQuantity())
                    .method(response.getPayment_method_type())
                    .totalPrice(totalPrice)
                    .user(user)
                    .item(item)
                    .build();

            log.info("생성된 purchase 객체: {}", purchase);
            purchaseRepository.save(purchase);
            log.info("결제 정보 저장 완료 - orderId: {}", purchase.getOrderId());
        } catch (Exception e) {
            log.error("구매정보 처리 중 오류 발생: {}", e.getMessage());
            e.printStackTrace(); // 스택 트레이스 출력
            throw new RuntimeException("구매정보 저장 실패", e);
        }
    }


    @Override
    @Transactional(readOnly = true)
    public Purchase getPaymentInfo(String orderId) {
        return purchaseRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("결제 정보를 찾을 수 없습니다."));
    }

    // getCurrentUserId 메서드 구현 필요
//    private Long getCurrentUserId() {
//        // 현재 로그인한 사용자의 ID를 반환하는 로직 구현
//        // 예: SecurityContext에서 가져오기
//        return null; // 실제 구현 필요
//    }
    // 카카오페이 측에 요청 시 헤더부에 필요한 값

    private HttpHeaders getHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        headers.set("Authorization", "SECRET_KEY " + payProperties.getSecretKey());
        return headers;
    }
}
