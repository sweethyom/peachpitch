package com.ssafy.peachptich.dto.response;

import lombok.*;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class KeywordResponseDto {
   Long keywordId;
   String keyword;
}
