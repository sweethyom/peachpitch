package com.ssafy.peachptich.global.config;

import com.ssafy.peachptich.entity.Hint;
import com.ssafy.peachptich.entity.Item;
import com.ssafy.peachptich.entity.Keyword;
import com.ssafy.peachptich.repository.HintRepository;
import com.ssafy.peachptich.repository.ItemRepository;
import com.ssafy.peachptich.repository.KeywordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

import java.io.*;
import java.nio.charset.StandardCharsets;

@Slf4j
@RequiredArgsConstructor
@Component
public class DataLoader implements ApplicationListener<ApplicationReadyEvent> {
    private final HintRepository hintRepository;
    private final KeywordRepository keywordRepository;
    private final ItemRepository itemRepository;

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {

        // item 데이터 삽입
        insertDefaultItems();

        // Keyword 저장 (존재하면 찾고, 없으면 예외)
        if (hintRepository.count() > 0) {
            log.info("데이터가 이미 로드되었습니다. CSV 파일을 다시 읽지 않습니다.");
            return;
        }

        String filePath = "csv/hint.csv"; // 힌트 경로

        try (InputStream inputStream = getClass().getClassLoader().getResourceAsStream(filePath);
             BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {

            String line;
            while ((line = reader.readLine()) != null) {
                String[] columns = line.split("\t"); // CSV 구분자 확인 필요
                if (columns.length < 2) continue;

                String keywordName = columns[0].trim().replaceAll("\"",""); // "날씨", "여행" 등
                System.out.println("keywordName = " + keywordName);

                // Keyword 없으면 생성
                Keyword keyword = keywordRepository.findByKeyword(keywordName)
                        .orElseGet(() -> keywordRepository.save(Keyword.builder()
                                .keyword(keywordName)
                                .build()));

                // Hint 저장
                for (int i = 1; i < columns.length; i++) {
                    String hintText = columns[i].trim().replaceAll("\"","");
                    System.out.println("hintText = " + hintText);
                    if (!hintText.isEmpty()) {
                        hintRepository.save(Hint.builder()
                                .hint(hintText)
                                .keyword(keyword)
                                .build());
                    }
                }
            }
            log.info("CSV 데이터가 성공적으로 저장되었습니다.");
        } catch (IOException e) {
            log.error("CSV 파일을 읽는 중 오류 발생: ", e);
        }
    }

    private void insertDefaultItems() {
        insertItem("이용권", 0, Item.ItemType.FREE);
        insertItem("이용권", 1000, Item.ItemType.PAID);
    }

    private void insertItem(String name, Integer price, Item.ItemType type) {
        if (!itemRepository.existsByNameAndType(name, type)) {
            itemRepository.save(Item.builder()
                    .name(name)
                    .price(price)
                    .type(type)
                    .build());
            log.info("Item 추가됨: name={}, price={}, type={}", name, price, type);
        } else {
            log.info("이미 존재하는 Item: name={}, type={}", name, type);
        }
    }
}
