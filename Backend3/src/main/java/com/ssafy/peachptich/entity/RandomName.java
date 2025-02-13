package com.ssafy.peachptich.entity;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.text.MessageFormat;
import java.util.Random;

@Component
@AllArgsConstructor
public class RandomName {
    private final String []ADJECTIVES =
            {"춤추는", "졸린", "수줍은", "커피 마시는", "부지런한",
            "아늑한", "상쾌한", "귀여운", "신나는", "설레는",
            "느긋한", "퇴근하고 싶은", "야식 고민하는", "피곤한", "배고픈",
            "누워있는", "햄버거 먹는", "호들갑 떠는", "씩씩한", "노래 부르는"};

    private final String []NOUNS =
            {"복숭아", "체리", "딸기", "오렌지", "귤",
            "사과", "포도", "바나나", "키위", "코코넛",
            "망고", "수박", "블루베리", "자두", "레몬",
            "석류", "멜론", "파인애플", "라임", "무화과"};
    private final Random RANDOM = new Random();
    public String getRandomName() {
        String adjective = ADJECTIVES[RANDOM.nextInt(ADJECTIVES.length)];
        String noun = NOUNS[RANDOM.nextInt(NOUNS.length)];
        return MessageFormat.format("{0} {1}", adjective, noun);
    }
}
