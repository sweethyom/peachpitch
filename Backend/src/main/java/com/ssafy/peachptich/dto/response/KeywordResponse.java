package com.ssafy.peachptich.dto.response;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class KeywordResponse {
   Long keywordId;
   String keyword;
}
