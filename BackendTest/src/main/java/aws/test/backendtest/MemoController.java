package aws.test.backendtest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.stream.IntStream;

@RestController
@RequestMapping("/memo")
public class MemoController {

    private final Logger logger = LoggerFactory.getLogger(MemoController.class);
    private final MemoRepository memoRepository; // 생성자 주입

    public MemoController(MemoRepository memoRepository) {
        this.memoRepository = memoRepository;
    }

    // id를 동적으로 받도록 변경
    @GetMapping("/{id}")
    public ResponseEntity<Memo> test(@PathVariable("id") Long id) {
        Optional<Memo> result = memoRepository.findById(id);

        if (result.isPresent()) {
            logger.info("Memo found: {}", result.get());
            return new ResponseEntity<>(result.get(), HttpStatus.OK);
        }

        logger.warn("Memo not found for id: {}", id);
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @GetMapping("/init")
    public ResponseEntity<Object> init() {
        IntStream.rangeClosed(1, 10).forEach(i -> {
            Memo memo = Memo.builder()
                    .text("Sample..." + i)
                    .build();

            // Create
            memoRepository.save(memo);
        });

        String result = "API 통신에 성공하였습니다.";
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/test")
    public ResponseEntity<Object> cicd1() {
        String result = "Webhook 동작 테스트 수정 해봄!!!";
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/test2")
    public ResponseEntity<Object> cicd2() {
        String result = "테스트 성공~~ 💯⭐";
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Memo> updateMemo(@PathVariable("id") Long id, @RequestBody Memo updatedMemo) {
        // id로 기존 Memo 조회
        Optional<Memo> optionalMemo = memoRepository.findById(id);

        if (optionalMemo.isPresent()) {
            Memo existingMemo = optionalMemo.get();

            // 기존 Memo 업데이트
            existingMemo.setText(updatedMemo.getText());

            // 업데이트된 Memo 저장
            Memo savedMemo = memoRepository.save(existingMemo);
            logger.info("Memo updated: {}", savedMemo);

            return new ResponseEntity<>(savedMemo, HttpStatus.OK);
        } else {
            logger.warn("Memo not found for id: {}", id);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

}
